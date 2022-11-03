import time

import jwt
import pytest
from src_py.grndwork_api_client.access_tokens import get_access_token, reset_access_token_cache
from src_py.grndwork_api_client.make_request import make_request as _make_request


def describe_get_access_token():
    refresh_token = {
        'subject': 'uuid',
        'token': 'refresh_token',
    }

    @pytest.fixture(name='make_request', autouse=True)
    def fixture_make_request(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.access_tokens.make_request',
            spec=_make_request,
            return_value=({'token': 'access_token'}, {}),
        )

    @pytest.fixture(name='decode', autouse=True)
    def fixture_decode(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.access_tokens.jwt.decode',
            spec=jwt.decode,
            return_value={
                'exp': int(time.time()) + 1000,
            },
        )

    @pytest.fixture(autouse=True)
    def _reset_access_token_cache():
        reset_access_token_cache()

    def it_requests_new_access_token(make_request):
        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        assert make_request.call_count == 1

        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': 'https://api.grndwork.com/v1/tokens',
            'token': 'refresh_token',
            'method': 'POST',
            'body': {
                'subject': 'uuid',
                'platform': 'platform',
                'scope': 'read:data',
            },
        }

        assert access_token == 'access_token'

    def it_does_not_request_new_access_token_when_using_cache(make_request):
        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        assert make_request.call_count == 1

    def it_requests_new_access_token_for_other_platform(make_request):
        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        get_access_token(
            refresh_token=refresh_token,
            platform='other',
            scope='read:data',
        )

        assert make_request.call_count == 2

    def it_requests_new_access_token_for_other_scope(make_request):
        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='write:data',
        )

        assert make_request.call_count == 2

    def it_requests_new_access_token_when_existing_has_expired(make_request, decode):
        decode.return_value = {
            'exp': int(time.time()) - 1000,
        }

        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        assert make_request.call_count == 2
