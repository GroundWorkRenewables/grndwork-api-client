import time
from typing import Any, Dict, Optional

import jwt

from .config import TOKENS_URL
from .make_request import make_request


access_token_cache: Dict[str, Any] = {}


def reset_access_token_cache() -> None:
    global access_token_cache
    access_token_cache = {}


def get_access_token(
    refresh_token: Dict[str, str],
    platform: str,
    scope: str,
) -> Optional[str]:
    cache_key = f'{platform}:{scope}'
    access_token = access_token_cache.get(cache_key)

    if not access_token or has_expired(access_token):
        access_token = create_access_token(refresh_token, platform, scope)
        access_token_cache[cache_key] = access_token

    return access_token


def create_access_token(
    refresh_token: Dict[str, Any],
    platform: str,
    scope: str,
) -> Optional[str]:
    result, cont_range = make_request(
        url=TOKENS_URL,
        method='POST',
        token=refresh_token.get('token'),
        body={
            'subject': refresh_token.get('subject'),
            'platform': platform,
            'scope': scope,
        },
    )
    assert isinstance(result, dict)
    return result.get('token', None)


def has_expired(token: str) -> bool:
    decoded_token: Dict[str, Any] = jwt.decode(token, 'secret', algorithms=['HS256'])
    expiration = int(decoded_token.get('exp', 0))
    now: int = int(time.time() * 1000)
    if expiration and now - expiration >= 0:
        return True

    return False
