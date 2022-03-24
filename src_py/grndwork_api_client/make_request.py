import json
from typing import Any, Dict, Iterator, Optional, Tuple

import requests
from requests.exceptions import RequestException

from .dtos import ContentRange


def make_request(
    url: str,
    *,
    method: str,
    token: str,
    headers: Optional[Dict[str, Any]] = None,
    query: Any = None,
    body: Any = None,
) -> Tuple[Any, ContentRange]:

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
        ))

    return response.json(), cont_range


def make_paginated_request(
    url: str,
    *,
    token: str,
    page_size: int,
    query: Any = None,
) -> Iterator[Any]:
    query = query or {}
    limit = query.get('limit')
    offset = query.get('offset', 0)

    while True:
        query_limit = min(limit, page_size) if limit else page_size
        results, cont_range = make_request(
                url=url,
                method='GET',
                query={
                    **query,
                    'limit': query_limit,
                    'offset': offset,
                },
                token=token,
            )
        yield from results

        if cont_range.last == cont_range.count:
            break

        if limit is not None:
            limit -= len(results)
            if limit <= 0:
                break

        offset = cont_range.last


def parse_content_range(cont_range: str) -> ContentRange:
    count = 0
    first = 0
    last = 0

    try:
        count = int(cont_range.split('/')[1])
        first = int(cont_range.replace('items ', '').split('-')[0])
        last = int(cont_range.replace('items ', '').split('-')[1].split('/')[0])
    except AttributeError:
        pass

    return ContentRange(count=count, first=first, last=last)
