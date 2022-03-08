import time

import pytest
from src_py.grndwork_api_client import access_tokens
from src_py.grndwork_api_client.make_request import make_request

refresh_token = {
    'subject': 'uuid',
    'token': 'refresh_token',
  }


@pytest.fixture(name='make_request', autouse=True)
def fixture_requests(mocker):
    mockpatch = mocker.patch(
        target='src_py.grndwork_api_client.access_tokens.make_request',
        spec=make_request,
    )
    mockpatch.return_value = {'token': 'access_token'}
    return mockpatch


@pytest.fixture(name='decode', autouse=True)
def fixture_decode(mocker):
    mockdecode = mocker.patch(
        target='src_py.grndwork_api_client.access_tokens.jwt.decode',
    )
    not_expired = int(time.time() * 1000) + 1000
    mockdecode.return_value = {'exp': not_expired}
    return mockdecode


@pytest.fixture(autouse=True)
def _clear_token_cache():
    access_tokens.reset_access_token_cache()


def describe_access_tokens():

    def it_requests_new_access_token(make_request):
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': 'https://api.grndwork.com/v1/tokens',
            'method': 'POST',
            'body': {
                'subject': 'uuid',
                'platform': 'platform',
                'scope': 'read:data',
            },
            'token': 'refresh_token',
        }
        assert make_request.call_count == 1

    def it_does_not_request_new_access_token_with_cache(make_request):
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        assert make_request.call_count == 1

    def it_requests_access_token_for_other_platform(make_request):
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )

        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='other',
            scope='read:data',
        )
        assert make_request.call_count == 2

    def it_requests_token_for_other_scope(make_request):
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='write:data',
        )
        assert make_request.call_count == 2

    def it_requests_new_token_when_expired(make_request, decode):
        expired = time.time() * 1000
        not_expired = int(time.time() * 1000) + 1000
        decode.side_effect = [{'exp': expired}, {'exp': not_expired}]

        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        access_tokens.get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        assert make_request.call_count == 2

    def it_returns_created_token(make_request):
        result = access_tokens.create_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='read:data',
        )
        assert result == 'access_token'
