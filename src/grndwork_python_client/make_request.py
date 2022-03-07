import json
from typing import Any, Dict, List, Optional

import requests
from requests.exceptions import RequestException


def get_offsets(url: str, query: Dict[str, Any]) -> List[int]:
    response = requests.head(url, params=query)
    range_vals = parse_content_range(response.headers['Content-Range'])
    offsets = list(range(range_vals['first']-1, range_vals['count'], 20))

    return offsets


def parse_content_range(cont_range: str) -> Dict[str, int]:
    count = int(cont_range.split('/')[1])
    first = int(cont_range.replace('items ', '').split('-')[0])
    last = int(cont_range.replace('items ', '').split('-')[1].split('/')[0])
    return {
        'first': first,
        'last': last,
        'count': count,
    }


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
    except RequestException:
        raise ConnectionError('Invalid response payload')

    if response.status_code >= 400:
        raise ConnectionError('Request returned "{}" error: "{}"'.format(
            response.status_code,
            response.reason,
            ),
        )

    return response.json()
