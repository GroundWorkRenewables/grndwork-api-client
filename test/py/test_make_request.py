import json

import pytest
import requests
from src.grndwork_python_client import make_request

API_URL = 'https://api.grndwork.com/v1/tokens'


@pytest.fixture(name='requests', autouse=True)
def fixture_requests(mocker):
    req_mock = mocker.patch(
        target='src.grndwork_python_client.make_request.requests',
        spec=requests,
    )
    response = mocker.MagicMock()
    response.status_code = 200
    response.json.return_value = {}
    req_mock.request.return_value = response
    return req_mock


def describe_make_request():
    def it_makes_request(requests):
        make_request.make_request(url=API_URL, method='GET')
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'GET'
        assert kwargs['url'] == API_URL

    def it_makes_request_with_query_params(requests):
        query = {'key': 'value'}
        make_request.make_request(url=API_URL, method='POST', query=query)
        (_, kwargs) = requests.request.call_args
        assert kwargs['params'] == query

    def it_makes_request_with_method(requests):
        make_request.make_request(url=API_URL, method='POST')
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'

    def it_makes_request_with_body(requests):
        body = {'test': 'test'}
        make_request.make_request(url=API_URL, method='POST', body=body)
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'
        assert kwargs['data'] == json.dumps(body)

    def it_makes_request_with_auth_token(requests):
        token = 'refresh_token'
        body = {'test': 'test'}
        make_request.make_request(url=API_URL, method='POST', body=body, token=token)
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'
        assert kwargs['data'] == json.dumps(body)
        assert kwargs['headers']['Authorization'] == 'Bearer refresh_token'

    def it_makes_request_with_additional_headers(requests):
        headers = {'X-Test': 'test_value'}
        token = 'refresh_token'
        body = {'test': 'test'}
        make_request.make_request(
            url=API_URL,
            method='POST',
            body=body,
            token=token,
            headers=headers,
        )
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'
        assert kwargs['data'] == json.dumps(body)
        assert kwargs['headers']['Authorization'] == 'Bearer refresh_token'
        assert kwargs['headers']['X-Test'] == 'test_value'

    def it_parses_the_response_body(requests):
        requests.request.return_value.json.return_value = {'token': 'access_token'}
        token = 'refresh_token'
        body = {'test': 'test'}
        result = make_request.make_request(url=API_URL, method='POST', body=body, token=token)
        assert result['token'] == 'access_token'

    def it_handles_bad_response(requests):
        requests.request.return_value.status_code = 404
        requests.request.return_value.reason = 'error message'
        token = 'refresh_token'
        with pytest.raises(ConnectionError):
            make_request.make_request(url=API_URL, method='POST', token=token)
