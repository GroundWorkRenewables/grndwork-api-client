import json
import os
from typing import Any, Dict


def get_param(
    param_name: str,
    default: Any = None,
) -> str:
    return os.environ.get(param_name, default)


API_URL = get_param('GROUNDWORK_API_URL', default='https://api.grndwork.com')
TOKENS_URL = f'{ API_URL }/v1/tokens'
STATIONS_URL = f'{ API_URL }/v1/stations'
DATA_URL = f'{ API_URL }/v1/data'


def get_file(
    filename: str,
) -> Dict[str, Any]:
    with open(filename) as f:
        data: str = f.read()
    result: Dict[str, Any] = json.loads(data)
    return result


def get_refresh_token() -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    groundwork_token_path = get_param('GROUNDWORK_TOKEN_PATH')
    groundwork_subject = get_param('GROUNDWORK_SUBJECT')
    groundwork_token = get_param('GROUNDWORK_TOKEN')

    if groundwork_token_path:
        result = get_file(groundwork_token_path)

    elif groundwork_subject and groundwork_token:
        result = {
            'subject': groundwork_subject,
            'token': groundwork_token,
        }

    return result
