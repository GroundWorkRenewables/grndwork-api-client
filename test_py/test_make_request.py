import json

import pytest
import requests as _requests
from src_py.grndwork_api_client.config import TOKENS_URL as API_URL
from src_py.grndwork_api_client.make_request import make_request, RequestError


@pytest.fixture(name='requests', autouse=True)
def fixture_requests(mocker):
    return mocker.patch(
        target='src_py.grndwork_api_client.make_request.requests',
        spec=_requests,
        **{
            'request.return_value': mocker.MagicMock(**{
                'status_code': 200,
                'headers': {
                    'Content-Type': 'application/json',
                },
                'json.return_value': {
                    'token': 'access_token',
                },
            }),
            'RequestException': _requests.RequestException,
        },
    )


def describe_make_request():
    def it_makes_request_with_auth_token(requests):
        make_request(
            url=API_URL,
            token='auth token',
        )

        assert requests.request.call_count == 1

        (_, kwargs) = requests.request.call_args

        assert kwargs.get('url') == API_URL
        assert kwargs.get('method') == 'GET'

        assert kwargs.get('headers') == {
            'Authorization': 'Bearer auth token',
        }

        assert kwargs.get('params') == {}

    def it_makes_request_with_query_params(requests):
        make_request(
            url=API_URL,
            token='auth token',
            query={
                'limit': 10,
            },
        )

        assert requests.request.call_count == 1

        (_, kwargs) = requests.request.call_args

        assert kwargs.get('params') == {
            'limit': 10,
        }

    def it_makes_request_with_method(requests):
        make_request(
            url=API_URL,
            token='auth token',
            method='POST',
        )

        assert requests.request.call_count == 1

        (_, kwargs) = requests.request.call_args

        assert kwargs.get('method') == 'POST'

    def it_makes_request_with_body(requests):
        make_request(
            url=API_URL,
            token='auth token',
            method='POST',
            body={
                'test': 'test',
            },
        )

        assert requests.request.call_count == 1

        (_, kwargs) = requests.request.call_args

        assert kwargs.get('headers') == {
            'Authorization': 'Bearer auth token',
            'Content-Type': 'application/json',
        }

        assert kwargs.get('data') == json.dumps({
            'test': 'test',
        })

    def it_makes_request_with_additional_headers(requests):
        make_request(
            url=API_URL,
            token='auth token',
            method='POST',
            headers={
                'X-Test': 'test_value',
            },
            body={
                'test': 'test',
            },
        )

        assert requests.request.call_count == 1

        (_, kwargs) = requests.request.call_args

        assert kwargs.get('headers') == {
            'Authorization': 'Bearer auth token',
            'Content-Type': 'application/json',
            'X-Test': 'test_value',
        }

    def it_raises_error_when_bad_request(requests):
        requests.request.return_value.status_code = 400

        with pytest.raises(RequestError, match='Bad Request'):
            make_request(
                url=API_URL,
                token='auth token',
            )

    def it_raises_error_when_bad_response_body(requests):
        requests.request.return_value.json.side_effect = _requests.JSONDecodeError('Invalid', '', 0)

        with pytest.raises(RequestError, match='Failed to parse response payload'):
            make_request(
                url=API_URL,
                token='auth token',
            )

    def it_returns_payload_and_response(requests):
        payload, resp = make_request(
            url=API_URL,
            token='auth token',
        )

        assert payload == {
            'token': 'access_token',
        }

        assert resp.headers.get('Content-Type') == 'application/json'
