import json

import pytest
import requests
from src_py.grndwork_api_client.make_request import (
    ContentRange,
    make_paginated_request,
    make_request,
    parse_content_range,
)


API_URL = 'https://api.grndwork.com/v1/tokens'


@pytest.fixture(name='requests', autouse=True)
def fixture_requests(mocker):
    req_mock = mocker.patch(
        target='src_py.grndwork_api_client.make_request.requests',
        spec=requests,
    )
    response = mocker.MagicMock()
    response.status_code = 200
    response.json.return_value = {}
    response.headers = {}
    req_mock.request.return_value = response

    return req_mock


def describe_make_paginated_request():

    @pytest.fixture(name='make_request', autouse=False)
    def fixture_make_requests(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.make_request.make_request',
            spec=make_request,
        )

    def it_updates_offset_and_limit(make_request):
        return_vals = [
            (
                ['' for i in range(20)],
                {'Content-Range': 'items 6-25/65'},
            ),
            (
                ['' for i in range(20)],
                {'Content-Range': 'items 26-45/65'},
            ),
            (
                ['' for i in range(20)],
                {'Content-Range': 'items 46-65/65'},
            ),
        ]

        make_request.side_effect = return_vals

        pag_req = make_paginated_request(
            url='url',
            token='token',
            page_size=20,
            query={
                'offset': 5,
            },
        )

        assert(len(list(pag_req))) == 60

        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 20
        assert kwargs['query']['offset'] == 45

    def it_returns_when_last_record_reached(make_request):
        return_vals = [
            (
                ['' for i in range(20)],
                {'Content-Range': 'items 6-25/25'},
            ),
        ]

        make_request.side_effect = return_vals

        pag_req = make_paginated_request(
            url='url',
            token='token',
            page_size=20,
            query={
                'offset': 5,
            },
        )

        assert len(list(pag_req)) == 20

    def it_returns_when_limit_reached(make_request):
        return_vals = [
            (
                ['' for i in range(20)],
                {'Content-Range': 'items 1-20/105'},
            ),
            (
                ['' for i in range(20)],
                {'Content-Range': 'items 21-40/105'},
            ),
            (
                [''],
                {'Content-Range': 'items 41-41/105'},
            ),
        ]
        make_request.side_effect = return_vals

        pag_req = make_paginated_request(
            url='url',
            token='token',
            page_size=20,
            query={
                'offset': 0,
                'limit': 41,
            },
        )

        assert len(list(pag_req)) == 41

        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 1


def describe_parse_content_range():
    @pytest.mark.parametrize('content_range, expected', [
        ({'Content-Range': 'items 1-1/1'}, ContentRange(first=1, last=1, count=1)),
        ({'Content-Range': 'items 1-20/65'}, ContentRange(first=1, last=20, count=65)),
        ({'Content-Range': 'items 6-25/65'}, ContentRange(first=6, last=25, count=65)),
        ({}, None),
    ])
    def it_parses_range(content_range, expected):
        assert parse_content_range(content_range) == expected


def describe_make_request():
    def it_makes_request(requests):
        make_request(url=API_URL, method='GET', token='token')
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'GET'
        assert kwargs['url'] == API_URL

    def it_makes_request_with_query_params(requests):
        query = {'key': 'value'}
        make_request(url=API_URL, method='POST', query=query, token='token')
        (_, kwargs) = requests.request.call_args
        assert kwargs['params'] == query

    def it_makes_request_with_method(requests):
        make_request(url=API_URL, method='POST', token='token')
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'

    def it_makes_request_with_body(requests):
        body = {'test': 'test'}
        make_request(url=API_URL, method='POST', body=body, token='token')
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'
        assert kwargs['data'] == json.dumps(body)

    def it_makes_request_with_auth_token(requests):
        token = 'refresh_token'
        body = {'test': 'test'}
        make_request(url=API_URL, method='POST', body=body, token=token)
        (_, kwargs) = requests.request.call_args
        assert kwargs['method'] == 'POST'
        assert kwargs['data'] == json.dumps(body)
        assert kwargs['headers']['Authorization'] == 'Bearer refresh_token'

    def it_makes_request_with_additional_headers(requests):
        headers = {'X-Test': 'test_value'}
        token = 'refresh_token'
        body = {'test': 'test'}
        make_request(
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
        requests.request.return_value.headers = {'Content-Range': 'items 1-20/20'}
        token = 'refresh_token'
        body = {'test': 'test'}
        result, headers = make_request(
            url=API_URL,
            method='POST',
            body=body,
            token=token,
        )
        assert result['token'] == 'access_token'
        assert headers == {'Content-Range': 'items 1-20/20'}

    def it_handles_bad_response(requests):
        requests.request.return_value.status_code = 404
        requests.request.return_value.reason = 'error message'
        token = 'refresh_token'
        with pytest.raises(ConnectionError):
            make_request(url=API_URL, method='POST', token=token)

    def it_returns_result_and_content_range_for_get(requests):
        result, headers = make_request(url=API_URL, method='GET', token='token')
        assert result == {}
        assert headers == {}

    def it_returns_result_and_content_range_for_post(requests):
        body = {'test': 'test'}
        result, headers = make_request(url=API_URL, method='POST', body=body, token='token')
        assert result == {}
        assert headers == {}
