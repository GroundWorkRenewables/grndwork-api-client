from dataclasses import dataclass
import json
from typing import Any, Iterator, MutableMapping, Optional, Tuple

import requests
from requests.exceptions import RequestException


@dataclass
class ContentRange():
    count: int
    first: int
    last: int


def make_request(
    url: str,
    *,
    method: str,
    token: str,
    headers: Optional[MutableMapping[str, Any]] = None,
    query: Any = None,
    body: Any = None,
) -> Tuple[Any, MutableMapping[str, Any]]:

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
        ))

    return response.json(), response.headers


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
        query_limit = page_size
        if limit:
            query_limit = min(limit, page_size)

        results, headers = make_request(
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

        cont_range = parse_content_range(headers)
        if not cont_range:
            raise ValueError('Invalid header pagination values')

        if cont_range.last == cont_range.count:
            break

        if limit is not None:
            limit -= len(results)
            if limit <= 0:
                break

        offset = cont_range.last


def parse_content_range(headers: MutableMapping[str, str]) -> Optional[ContentRange]:
    cont_range = headers.get('Content-Range')

    if cont_range:
        try:
            return ContentRange(
                count=int(cont_range.split('/')[1]),
                first=int(cont_range.replace('items ', '').split('-')[0]),
                last=int(cont_range.replace('items ', '').split('-')[1].split('/')[0]),
            )

        except (AttributeError, KeyError):
            pass

    return None
