from typing import Any, Iterator, MutableMapping, Optional

from .content_range import ContentRange
from .errors import RequestError
from .make_request import make_request


def make_paginated_request(
    *,
    url: str,
    token: Optional[str] = None,
    headers: Optional[MutableMapping[str, Any]] = None,
    query: Any = None,
    page_size: int,
    timeout: Optional[float] = None,
    retries: Optional[int] = None,
    backoff: Optional[float] = None,
) -> Iterator[Any]:
    query = query or {}
    limit = query.get('limit')
    offset = query.get('offset') or 0

    while True:
        payload, resp = make_request(
            url=url,
            token=token,
            headers=headers,
            query={
                **query,
                'limit': min(limit, page_size) if limit else page_size,
                'offset': offset,
            },
            timeout=timeout,
            retries=retries,
            backoff=backoff,
        )

        if payload:
            yield from payload
        else:
            break

        if limit:
            limit -= len(payload)

            if limit <= 0:
                break

        content_range = ContentRange.parse(resp)

        if offset < content_range.last:
            offset = content_range.last

            if offset >= content_range.count:
                break
        else:
            raise RequestError('Invalid content range')
