import json

import pytest
import requests
from src_py.grndwork_api_client.dtos import ContentRange
from src_py.grndwork_api_client.make_request import (
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
    response.headers = {'Content-Range': 'items 1-1/1'}
    req_mock.request.return_value = response

    return req_mock


@pytest.fixture(name='make_request', autouse=False)
def fixture_make_requests(mocker):
    return mocker.patch(
        target='src_py.grndwork_api_client.make_request.make_request',
        spec=make_request,
    )


def describe_make_paginated_request():

    def it_updates_offset_and_limit(make_request):
        return_vals = [
            (
                ['' for i in range(20)],
                ContentRange(first=6, last=25, count=65),
            ),
            (
                ['' for i in range(20)],
                ContentRange(first=26, last=45, count=65),
            ),
            (
                ['' for i in range(20)],
                ContentRange(first=46, last=65, count=65),
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
        for _ in range(20):
            next(pag_req)
        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 20
        assert kwargs['query']['offset'] == 5

        for _ in range(20):
            next(pag_req)
        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 20
        assert kwargs['query']['offset'] == 25

        for _ in range(20):
            next(pag_req)
        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 20
        assert kwargs['query']['offset'] == 45

        with pytest.raises(StopIteration):
            next(pag_req)

    def it_returns_when_last_record_reached(make_request):
        return_vals = [
            (
                ['' for i in range(20)],
                ContentRange(first=6, last=25, count=25),
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
        for _ in range(20):
            next(pag_req)

        with pytest.raises(StopIteration):
            next(pag_req)

    def it_returns_when_limit_reached(make_request):
        return_vals = [
            (
                ['' for i in range(20)],
                ContentRange(first=1, last=20, count=105),
            ),
            (
                ['' for i in range(20)],
                ContentRange(first=21, last=40, count=105),
            ),
            (
                [''],
                ContentRange(first=41, last=42, count=105),
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
        for _ in range(20):
            next(pag_req)

        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 20

        for _ in range(20):
            next(pag_req)
        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 20

        next(pag_req)

        (_, kwargs) = make_request.call_args
        assert kwargs['query']['limit'] == 1

        with pytest.raises(StopIteration):
            next(pag_req)


def describe_parse_content_range():
    def it_parses_range():
        result = parse_content_range('items 1-1/1')
        assert result == ContentRange(first=1, last=1, count=1)

        result = parse_content_range('items 1-20/65')
        assert result == ContentRange(first=1, last=20, count=65)

        result = parse_content_range('items 6-25/65')
        assert result == ContentRange(first=6, last=25, count=65)

        result = parse_content_range(None)
        assert result == ContentRange(first=0, last=0, count=0)


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
        token = 'refresh_token'
        body = {'test': 'test'}
        result, cont_range = make_request(
            url=API_URL,
            method='POST',
            body=body,
            token=token,
        )
        assert result['token'] == 'access_token'
        assert cont_range == ContentRange(first=1, last=1, count=1)

    def it_handles_bad_response(requests):
        requests.request.return_value.status_code = 404
        requests.request.return_value.reason = 'error message'
        token = 'refresh_token'
        with pytest.raises(ConnectionError):
            make_request(url=API_URL, method='POST', token=token)

    def it_returns_result_and_content_range_for_get(requests):
        result, cont_range = make_request(url=API_URL, method='GET', token='token')
        assert result == {}
        assert cont_range == ContentRange(first=1, last=1, count=1)

    def it_returns_result_and_content_range_for_post(requests):
        body = {'test': 'test'}
        result, cont_range = make_request(url=API_URL, method='POST', body=body, token='token')
        assert result == {}
        assert cont_range == ContentRange(first=1, last=1, count=1)
