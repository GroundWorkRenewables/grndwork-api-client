import pytest
from responses import RequestsMock
from responses.matchers import header_matcher, json_params_matcher, query_param_matcher
from responses.registries import OrderedRegistry
from src_py.grndwork_api_client.config import API_URL
from src_py.grndwork_api_client.make_request import make_request, RequestError

TEST_URL = f'{API_URL}/v1/test'


def describe_make_request():
    @pytest.fixture(name='api_mock', autouse=True)
    def fixture_api_mock():
        with RequestsMock(registry=OrderedRegistry) as api_mock:
            yield api_mock

    def it_makes_request_with_token(api_mock):
        api_mock.get(
            url=TEST_URL,
            match=[header_matcher({'Authorization': 'Bearer auth_token'})],
            status=200,
            json={},
        )

        make_request(
            url=TEST_URL,
            token='auth_token',
        )

    def it_makes_request_with_additional_headers(api_mock):
        api_mock.get(
            url=TEST_URL,
            match=[header_matcher({'X-Test': 'test_value'})],
            status=200,
            json={},
        )

        make_request(
            url=TEST_URL,
            headers={
                'X-Test': 'test_value',
            },
        )

    def it_makes_request_with_query(api_mock):
        api_mock.get(
            url=TEST_URL,
            match=[query_param_matcher({'limit': 10})],
            status=200,
            json={},
        )

        make_request(
            url=TEST_URL,
            query={'limit': 10},
        )

    def it_makes_request_with_method(api_mock):
        api_mock.post(
            url=TEST_URL,
            status=201,
            json={},
        )

        make_request(
            url=TEST_URL,
            method='POST',
        )

    def it_makes_request_with_body(api_mock):
        api_mock.post(
            url=TEST_URL,
            match=[json_params_matcher({'test': 'value'})],
            status=201,
            json={},
        )

        make_request(
            url=TEST_URL,
            method='POST',
            body={
                'test': 'value',
            },
        )

    def it_raises_error_when_bad_request(api_mock):
        api_mock.get(
            url=TEST_URL,
            status=400,
            json={},
        )

        with pytest.raises(RequestError, match='Bad Request'):
            make_request(
                url=TEST_URL,
            )

    def it_raises_error_with_response_body(api_mock):
        api_mock.get(
            url=TEST_URL,
            status=400,
            json={'message': 'Invalid'},
        )

        with pytest.raises(RequestError, match='Invalid'):
            make_request(
                url=TEST_URL,
            )

    def it_raises_error_when_bad_response_body(api_mock):
        api_mock.get(
            url=TEST_URL,
            status=200,
            body='Invalid',
        )

        with pytest.raises(RequestError, match='Failed to parse response payload'):
            make_request(
                url=TEST_URL,
            )

    def it_returns_payload_and_response(api_mock):
        api_mock.get(
            url=TEST_URL,
            status=200,
            headers={
                'X-Test': 'test_value',
            },
            json={'test': 'value'},
        )

        payload, resp = make_request(
            url=TEST_URL,
        )

        assert payload == {'test': 'value'}
        assert resp['status_code'] == 200
        assert resp['headers'].get('x-test') == 'test_value'
