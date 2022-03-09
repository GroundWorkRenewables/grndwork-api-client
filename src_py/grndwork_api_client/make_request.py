import json
from typing import Any, Dict, Optional

import requests
from requests.exceptions import RequestException


def parse_content_range(cont_range: str) -> Dict[str, int]:
    result = {}
    if cont_range:
        result['count'] = int(cont_range.split('/')[1])
        result['first'] = int(cont_range.replace('items ', '').split('-')[0])
        result['last'] = int(cont_range.replace('items ', '').split('-')[1].split('/')[0])

    return result


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

    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=query,
            data=json.dumps(body),
        )
        range_vals = parse_content_range(response.headers['Content-Range'])

    except RequestException:
        raise ConnectionError('Invalid response payload')

    if response.status_code >= 400:
        raise ConnectionError('Request returned "{}" error: "{}"'.format(
            response.status_code,
            response.reason,
            ),
        )

    return response.json(), range_vals
