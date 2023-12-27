import json

import pytest
from responses import RequestsMock
from responses.matchers import query_param_matcher
from responses.registries import OrderedRegistry
from src_py.grndwork_api_client.config import API_URL
from src_py.grndwork_api_client.make_paginated_request import make_paginated_request
from src_py.grndwork_api_client.make_request import RequestError

TEST_URL = f'{API_URL}/v1/test'


def describe_make_paginated_request():
    @pytest.fixture(name='api_mock', autouse=True)
    def fixture_api_mock():
        with RequestsMock(registry=OrderedRegistry) as api_mock:
            yield api_mock

    def it_makes_requests(api_mock):
        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 100, 'offset': 0})],
            callback=reply_callback,
        )

        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 100, 'offset': 100})],
            callback=reply_callback,
        )

        results = list(make_paginated_request(
            url=TEST_URL,
            page_size=100,
        ))

        assert results == [
            {'id': item} for item in range(1, 166)
        ]

    def it_makes_requests_with_limit(api_mock):
        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 100, 'offset': 0})],
            callback=reply_callback,
        )

        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 55, 'offset': 100})],
            callback=reply_callback,
        )

        results = list(make_paginated_request(
            url=TEST_URL,
            query={'limit': 155},
            page_size=100,
        ))

        assert results == [
            {'id': item} for item in range(1, 156)
        ]

    def it_makes_requests_with_offset(api_mock):
        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 100, 'offset': 5})],
            callback=reply_callback,
        )

        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 55, 'offset': 105})],
            callback=reply_callback,
        )

        results = list(make_paginated_request(
            url=TEST_URL,
            query={'limit': 155, 'offset': 5},
            page_size=100,
        ))

        assert results == [
            {'id': item} for item in range(6, 161)
        ]

    def it_makes_requests_with_page_size(api_mock):
        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 50, 'offset': 0})],
            callback=reply_callback,
        )

        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 50, 'offset': 50})],
            callback=reply_callback,
        )

        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 50, 'offset': 100})],
            callback=reply_callback,
        )

        api_mock.add_callback(
            url=TEST_URL,
            method='GET',
            match=[query_param_matcher({'limit': 50, 'offset': 150})],
            callback=reply_callback,
        )

        results = list(make_paginated_request(
            url=TEST_URL,
            page_size=50,
        ))

        assert results == [
            {'id': item} for item in range(1, 166)
        ]

    def it_handles_empty_results(api_mock):
        api_mock.get(
            url=TEST_URL,
            match=[query_param_matcher({'limit': 100, 'offset': 0})],
            status=200,
            json=[],
        )

        results = list(make_paginated_request(
            url=TEST_URL,
            page_size=100,
        ))

        assert results == []

    def it_raises_error_when_invalid_content_range(api_mock):
        api_mock.get(
            url=TEST_URL,
            match=[query_param_matcher({'limit': 100, 'offset': 100})],
            status=200,
            headers={
                'content-range': 'items 1-100/165',
            },
            json=[
                {'id': item} for item in range(101, 166)
            ],
        )

        with pytest.raises(RequestError, match='Invalid content range'):
            list(make_paginated_request(
                url=TEST_URL,
                query={'limit': 100, 'offset': 100},
                page_size=100,
            ))


def reply_callback(request):
    query = request.params or {}

    limit = int(query.get('limit') or '100')
    offset = int(query.get('offset') or '0')

    first = offset + 1
    last = min(offset + limit, 165)

    return (
        200,
        {
            'content-type': 'application/json',
            'content-range': f'items {first}-{last}/165',
        },
        json.dumps([
            {'id': item} for item in range(first, last + 1)
        ]),
    )
