import json
from typing import Any, Dict, List, Mapping, Optional, Union

import requests
from requests.exceptions import RequestException

from .dtos import ContentRange, DataFile, Station


def parse_content_range(cont_range: str) -> ContentRange:
    try:
        count = int(cont_range.split('/')[1])
        first = int(cont_range.replace('items ', '').split('-')[0])
        last = int(cont_range.replace('items ', '').split('-')[1].split('/')[0])
    except AttributeError:
        count = 0
        first = 0
        last = 0

    return ContentRange(count=count, first=first, last=last)


def make_request(
    url: str,
    *,
    method: str,
    headers: Optional[Dict[str, Any]] = None,
    query: Optional[Mapping[str, Any]] = None,
    token: Optional[str] = None,
    body: Optional[Dict[str, Any]] = None,
) -> tuple[Union[Mapping[str, Any], List[DataFile], List[Station]], ContentRange]:

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
        cont_range = parse_content_range(response.headers['Content-Range'])

    except RequestException:
        raise ConnectionError('Invalid response payload')

    if response.status_code >= 400:
        raise ConnectionError('Request returned "{}" error: "{}"'.format(
            response.status_code,
            response.reason,
            ),
        )

    return response.json(), cont_range
