from typing import Any, Dict, Optional

import requests
from requests.exceptions import RequestException


def make_request(
    url: str,
    method: str,
    headers: Optional[Dict[str, Any]] = None,
    query: Optional[Any] = None,
    token: Optional[str] = None,
    body: Optional[Any] = None,
) -> Any:

    if not headers:
        headers = {}

    if token:
        headers['Authorization'] = f'Bearer {token}'

    if body:
        headers['Content-Type'] = 'application/json'

    import json

    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=query,
            data=json.dumps(body),
        )

    except RequestException:
        raise ConnectionError('Invalid response payload')

    if response.status_code >= 400:
        raise ConnectionError('Request returned "{}" error: "{}"'.format(
            response.status_code,
            response.reason,
            ),
        )

    return response.json()
