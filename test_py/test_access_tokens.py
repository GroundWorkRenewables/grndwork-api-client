import time

import jwt
import pytest
from responses import RequestsMock
from responses.matchers import header_matcher, json_params_matcher
from responses.registries import OrderedRegistry
from src_py.grndwork_api_client.access_tokens import get_access_token, reset_access_token_cache
from src_py.grndwork_api_client.config import TOKENS_URL


def describe_get_access_token():
    refresh_token = {
        'subject': 'uuid',
        'token': 'refresh_token',
    }

    @pytest.fixture(autouse=True)
    def _reset_access_token_cache():
        reset_access_token_cache()

    @pytest.fixture(name='decode', autouse=True)
    def fixture_decode(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.access_tokens.jwt.decode',
            spec=jwt.decode,
            return_value={
                'exp': int(time.time()) + 1000,
            },
        )

    @pytest.fixture(name='api_mock', autouse=True)
    def fixture_api_mock():
        with RequestsMock(registry=OrderedRegistry) as api_mock:
            yield api_mock

    def it_requests_new_access_token(api_mock):
        api_mock.post(
            url=TOKENS_URL,
            match=[
                header_matcher({'Authorization': 'Bearer refresh_token'}),
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'platform',
                    'scope': 'test:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token'

    def it_does_not_request_new_access_token_when_using_cache(api_mock):
        api_mock.post(
            url=TOKENS_URL,
            status=201,
            json={
                'token': 'access_token',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token'

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token'

    def it_requests_new_access_token_for_other_platform(api_mock):
        api_mock.post(
            url=TOKENS_URL,
            match=[
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'platform',
                    'scope': 'test:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token_1',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token_1'

        api_mock.post(
            url=TOKENS_URL,
            match=[
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'other',
                    'scope': 'test:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token_2',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='other',
            scope='test:scope',
        )

        assert access_token == 'access_token_2'

    def it_requests_new_access_token_for_other_scope(api_mock):
        api_mock.post(
            url=TOKENS_URL,
            match=[
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'platform',
                    'scope': 'test:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token_1',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token_1'

        api_mock.post(
            url=TOKENS_URL,
            match=[
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'platform',
                    'scope': 'other:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token_2',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='other:scope',
        )

        assert access_token == 'access_token_2'

    def it_requests_new_access_token_when_existing_has_expired(decode, api_mock):
        decode.return_value = {
            'exp': int(time.time()) - 1000,
        }

        api_mock.post(
            url=TOKENS_URL,
            match=[
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'platform',
                    'scope': 'test:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token_1',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token_1'

        api_mock.post(
            url=TOKENS_URL,
            match=[
                json_params_matcher({
                    'subject': refresh_token['subject'],
                    'platform': 'platform',
                    'scope': 'test:scope',
                }),
            ],
            status=201,
            json={
                'token': 'access_token_2',
            },
        )

        access_token = get_access_token(
            refresh_token=refresh_token,
            platform='platform',
            scope='test:scope',
        )

        assert access_token == 'access_token_2'
