import pytest
from src_py.grndwork_api_client.access_tokens import get_access_token as _get_access_token
from src_py.grndwork_api_client.client import Client
from src_py.grndwork_api_client.config import DATA_URL, QC_URL, STATIONS_URL
from src_py.grndwork_api_client.make_paginated_request import make_paginated_request as _make_paginated_request  # noqa: E501
from src_py.grndwork_api_client.make_request import make_request as _make_request


def describe_client():
    refresh_token = {
        'subject': 'uuid',
        'token': 'refresh_token',
    }

    @pytest.fixture(name='get_access_token', autouse=True)
    def fixture_get_access_token(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.get_access_token',
            spec=_get_access_token,
            return_value='access_token',
        )

    @pytest.fixture(name='make_paginated_request', autouse=True)
    def fixture_make_paginated_request(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.make_paginated_request',
            spec=_make_paginated_request,
            return_value=[],
        )

    @pytest.fixture(name='make_request', autouse=True)
    def fixture_make_request(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.make_request',
            spec=_make_request,
            return_value=(None, mocker.MagicMock()),
        )

    def describe_get_stations():
        def it_gets_read_stations_access_token(get_access_token):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_stations())

            assert get_access_token.call_count == 1

            (_, kwargs) = get_access_token.call_args

            assert kwargs.get('refresh_token') == refresh_token
            assert kwargs.get('platform') == 'platform'
            assert kwargs.get('scope') == 'read:stations'

        def it_makes_get_stations_request_with_default_options(make_paginated_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_stations())

            assert make_paginated_request.call_count == 1

            (_, kwargs) = make_paginated_request.call_args

            assert kwargs.get('url') == STATIONS_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {}
            assert kwargs.get('page_size') == 100

        def it_makes_get_stations_request_with_query(make_paginated_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_stations({'limit': 10}))

            assert make_paginated_request.call_count == 1

            (_, kwargs) = make_paginated_request.call_args

            assert kwargs.get('url') == STATIONS_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {'limit': 10}
            assert kwargs.get('page_size') == 100

        def it_makes_get_stations_request_with_page_size(make_paginated_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_stations(page_size=50))

            assert make_paginated_request.call_count == 1

            (_, kwargs) = make_paginated_request.call_args

            assert kwargs.get('url') == STATIONS_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {}
            assert kwargs.get('page_size') == 50

    def describe_get_data():
        def it_gets_read_data_access_token(get_access_token):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_data())

            assert get_access_token.call_count == 1

            (_, kwargs) = get_access_token.call_args

            assert kwargs.get('refresh_token') == refresh_token
            assert kwargs.get('platform') == 'platform'
            assert kwargs.get('scope') == 'read:data'

        def it_makes_get_data_request_with_default_options(make_paginated_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_data())

            assert make_paginated_request.call_count == 1

            (_, kwargs) = make_paginated_request.call_args

            assert kwargs.get('url') == DATA_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {}
            assert kwargs.get('page_size') == 100

        def it_makes_get_data_request_with_query(make_paginated_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_data({'limit': 10}))

            assert make_paginated_request.call_count == 1

            (_, kwargs) = make_paginated_request.call_args

            assert kwargs.get('url') == DATA_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {'limit': 10}
            assert kwargs.get('page_size') == 100

        def it_gets_read_qc_access_token_when_requesting_records(get_access_token):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_data({'records_limit': 1}))

            assert get_access_token.call_count == 2

            (_, kwargs) = get_access_token.call_args_list[1]

            assert kwargs.get('refresh_token') == refresh_token
            assert kwargs.get('platform') == 'platform'
            assert kwargs.get('scope') == 'read:qc'

        def it_makes_get_qc_requests_per_data_file(mocker, make_paginated_request, make_request):
            make_paginated_request.return_value = [{
                'source': 'station:uuid',
                'filename': 'Test_OneMin.dat',
                'is_stale': False,
                'headers': {
                    'columns': [],
                    'units': [],
                },
                'records': [{
                    'timestamp': '2020-01-01 00:00:00',
                    'record_num': 1,
                    'data': {'SOME_KEY': 'VALUE'},
                }],
            }]

            make_request.return_value = ([{
                'timestamp': '2020-01-01 00:00:00',
                'qc_flags': {'SOME_KEY': 'FLAG'},
            }], mocker.MagicMock())

            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            results = list(client.get_data({'records_limit': 1}))

            assert make_request.call_count == 1

            (_, kwargs) = make_request.call_args

            assert kwargs.get('url') == QC_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {
                'filename': 'Test_OneMin.dat',
                'before': '2020-01-01 00:00:00',
                'after': '2020-01-01 00:00:00',
                'limit': 1500,
            }

            assert results == [{
                'source': 'station:uuid',
                'filename': 'Test_OneMin.dat',
                'is_stale': False,
                'headers': {
                    'columns': [],
                    'units': [],
                },
                'records': [{
                    'timestamp': '2020-01-01 00:00:00',
                    'record_num': 1,
                    'data': {'SOME_KEY': 'VALUE'},
                    'qc_flags': {'SOME_KEY': 'FLAG'},
                }],
            }]

        def it_does_not_get_read_qc_access_token_when_disabled(get_access_token):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_data({'records_limit': 1}, include_qc_flags=False))

            assert get_access_token.call_count == 1

        def it_makes_get_data_request_with_page_size(make_paginated_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            list(client.get_data(page_size=50))

            assert make_paginated_request.call_count == 1

            (_, kwargs) = make_paginated_request.call_args

            assert kwargs.get('url') == DATA_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('query') == {}
            assert kwargs.get('page_size') == 50

    def describe_post_data():
        payload = {
            'source': 'station:uuid',
            'files': [{
                'filename': 'Test_OneMin.dat',
                'records': [],
            }],
        }

        def it_gets_write_data_access_token(get_access_token):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            client.post_data(
                payload=payload,
            )

            assert get_access_token.call_count == 1

            (_, kwargs) = get_access_token.call_args

            assert kwargs.get('refresh_token') == refresh_token
            assert kwargs.get('platform') == 'platform'
            assert kwargs.get('scope') == 'write:data'

        def it_makes_post_data_request_with_payload(make_request):
            client = Client(
                refresh_token=refresh_token,
                platform='platform',
            )

            client.post_data(
                payload=payload,
            )

            assert make_request.call_count == 1

            (_, kwargs) = make_request.call_args

            assert kwargs.get('url') == DATA_URL
            assert kwargs.get('token') == 'access_token'
            assert kwargs.get('method') == 'POST'
            assert kwargs.get('body') == payload
