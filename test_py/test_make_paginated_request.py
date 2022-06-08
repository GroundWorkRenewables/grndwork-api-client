import pytest
from src_py.grndwork_api_client.make_paginated_request import make_paginated_request
from src_py.grndwork_api_client.make_request import make_request as _make_request

API_URL = 'https://api.grndwork.com/v1/tokens'


def describe_make_paginated_request():
    @pytest.fixture(name='make_request', autouse=False)
    def fixture_make_requests(mocker):
        def make_request_mock(*args, **kwargs):
            query = kwargs.get('query') or {}
            limit = query.get('limit') or 100
            offset = query.get('offset') or 0
            first = offset + 1
            last = min(offset + limit, 165)

            return (
                [{'id': item} for item in range(first, last + 1)],
                {'Content-Range': f'items {first}-{last}/165'},
            )

        return mocker.patch(
            target='src_py.grndwork_api_client.make_paginated_request.make_request',
            spec=_make_request,
            side_effect=make_request_mock,
        )

    def it_makes_requests(make_request):
        results = list(make_paginated_request(
            url=API_URL,
            token='auth token',
        ))

        assert make_request.call_count == 2
        assert make_request.call_args_list[0][1].get('query') == {'limit': 100, 'offset': 0}
        assert make_request.call_args_list[1][1].get('query') == {'limit': 100, 'offset': 100}

        assert results == [
            {'id': item} for item in range(1, 166)
        ]

    def it_makes_requests_with_limit(make_request):
        results = list(make_paginated_request(
            url=API_URL,
            token='auth token',
            query={
                'limit': 155,
            },
        ))

        assert make_request.call_count == 2
        assert make_request.call_args_list[0][1].get('query') == {'limit': 100, 'offset': 0}
        assert make_request.call_args_list[1][1].get('query') == {'limit': 55, 'offset': 100}

        assert results == [
            {'id': item} for item in range(1, 156)
        ]

    def it_makes_requests_with_offset(make_request):
        results = list(make_paginated_request(
            url=API_URL,
            token='auth token',
            query={
                'limit': 155,
                'offset': 5,
            },
        ))

        assert make_request.call_count == 2
        assert make_request.call_args_list[0][1].get('query') == {'limit': 100, 'offset': 5}
        assert make_request.call_args_list[1][1].get('query') == {'limit': 55, 'offset': 105}

        assert results == [
            {'id': item} for item in range(6, 161)
        ]

    def it_makes_requests_with_page_size(make_request):
        results = list(make_paginated_request(
            url=API_URL,
            token='auth token',
            query={
                'limit': 155,
                'offset': 5,
            },
            page_size=50,
        ))

        assert make_request.call_count == 4
        assert make_request.call_args_list[0][1].get('query') == {'limit': 50, 'offset': 5}
        assert make_request.call_args_list[1][1].get('query') == {'limit': 50, 'offset': 55}
        assert make_request.call_args_list[2][1].get('query') == {'limit': 50, 'offset': 105}
        assert make_request.call_args_list[3][1].get('query') == {'limit': 5, 'offset': 155}

        assert results == [
            {'id': item} for item in range(6, 161)
        ]
