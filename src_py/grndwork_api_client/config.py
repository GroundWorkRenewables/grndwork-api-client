import json
import os
from typing import cast

from .dtos import RefreshToken

API_URL = os.environ.get('GROUNDWORK_API_URL', 'https://api.grndwork.com')
TOKENS_URL = f'{ API_URL }/v1/tokens'
STATIONS_URL = f'{ API_URL }/v1/stations'
DATA_URL = f'{ API_URL }/v1/data'


def get_refresh_token() -> RefreshToken:
    groundwork_token_path = os.environ.get('GROUNDWORK_TOKEN_PATH')
    groundwork_subject = os.environ.get('GROUNDWORK_SUBJECT')
    groundwork_token = os.environ.get('GROUNDWORK_TOKEN')

    if groundwork_token_path:
        with open(groundwork_token_path) as f:
            data = f.read()
        result = cast(RefreshToken, json.loads(data))

    elif groundwork_subject and groundwork_token:
        result = RefreshToken(
            subject=groundwork_subject,
            token=groundwork_token,
        )
    else:
        raise OSError('Could not get refresh token from environment')

    return result
