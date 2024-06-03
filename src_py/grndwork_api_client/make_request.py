from http.client import responses as status_codes
import json
from time import sleep
from typing import Any, cast, Dict, List, Literal, MutableMapping, Optional, Tuple, TypedDict, Union

from requests import HTTPError, request, RequestException

from .config import TOKENS_URL
from .errors import AuthError, RequestError
from .interfaces import RequestErrorMessage


HttpMethod = Union[Literal['GET'], Literal['POST']]
ResponseHeaders = Dict[str, str]


class Response(TypedDict):
    status_code: int
    headers: ResponseHeaders


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
            status_code, error_message, errors = parse_error_response(err)

            if status_code == 401:
                raise AuthError('Unauthorized')

            if status_code == 400 and url == TOKENS_URL:
                raise AuthError(error_message, errors)

            if retries > 0 and should_retry(status_code):
                wait(backoff)
                retries -= 1
                backoff *= 2
                continue

            raise RequestError(error_message, errors)

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


def parse_error_response(
    error: HTTPError,
) -> Tuple[int, str, List[RequestErrorMessage]]:
    status_code = error.response.status_code

    try:
        body = error.response.json()
    except RequestException:
        body = {}

    error_message = body.get('message') or ''
    errors = cast(List[RequestErrorMessage], body.get('errors') or [])

    if status_code == 400 and len(errors) == 1 and not errors[0].get('field'):
        error_message = errors[0].get('message') or ''
        errors = []

    if not error_message:
        error_message = status_codes[status_code] or 'Unknown response'

    return status_code, error_message, errors
