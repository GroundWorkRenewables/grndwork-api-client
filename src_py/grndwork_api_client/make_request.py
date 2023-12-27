from http.client import responses as status_codes
import json
from time import sleep
from typing import Any, Dict, List, Literal, MutableMapping, Optional, Tuple, TypedDict, Union

from requests import HTTPError, request, RequestException

HttpMethod = Union[Literal['GET'], Literal['POST']]
ResponseHeaders = Dict[str, str]


class Response(TypedDict):
    status_code: int
    headers: ResponseHeaders


class ErrorMessage(TypedDict):
    field: str
    message: str


class RequestError(Exception):
    errors: List[ErrorMessage]

    def __init__(
        self,
        message: str,
        errors: Optional[List[ErrorMessage]] = None,
    ) -> None:
        super().__init__(message)
        self.errors = errors or []


def make_request(
    *,
    url: str,
    method: Optional[HttpMethod] = None,
    token: Optional[str] = None,
    headers: Optional[MutableMapping[str, Any]] = None,
    query: Any = None,
    body: Any = None,
    timeout: Optional[float] = None,
    retries: Optional[int] = None,
    backoff: Optional[float] = None,
) -> Tuple[Any, Response]:
    method = method or 'GET'
    headers = dict(headers) if headers else {}
    timeout = timeout if timeout is not None else 30.0
    retries = retries if retries is not None else 3
    backoff = backoff if backoff is not None else 30.0

    if token:
        headers['Authorization'] = f'Bearer {token}'

    params = {
        key: value for key, value in (query or {}).items() if value is not None
    }

    if body is not None and not isinstance(body, str):
        headers['Content-Type'] = 'application/json'
        body = json.dumps(body)

    while True:
        try:
            resp = request(
                url=url,
                method=method,
                headers=headers,
                params=params,
                data=body,
                timeout=timeout,
            )

            resp.raise_for_status()

        except HTTPError as err:
            if method == 'GET' and retries > 0 and should_retry(err.response.status_code):
                wait(backoff)
                retries -= 1
                backoff *= 2
                continue

            raise RequestError(*parse_error_response(err))

        except RequestException:
            raise RequestError('Failed to make request')

        try:
            payload = resp.json()
        except RequestException:
            raise RequestError('Failed to parse response payload')

        return payload, {
            'status_code': resp.status_code,
            'headers': dict(resp.headers.lower_items()),
        }


def should_retry(status_code: int) -> bool:
    return status_code in [429, 502, 503, 504]


def wait(delay: float) -> None:
    sleep(delay)


def parse_error_response(err: HTTPError) -> Tuple[str, List[ErrorMessage]]:
    try:
        payload = err.response.json()
    except RequestException:
        payload = {}

    return (
        payload.get('message') or status_codes[err.response.status_code] or 'Unknown response',
        payload.get('errors') or [],
    )
