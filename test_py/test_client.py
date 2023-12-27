import pytest
from responses import RequestsMock
from responses.matchers import header_matcher, json_params_matcher, query_param_matcher
from responses.registries import OrderedRegistry
from src_py.grndwork_api_client.access_tokens import get_access_token as _get_access_token
from src_py.grndwork_api_client.client import Client
from src_py.grndwork_api_client.config import (
    DATA_URL,
    QC_URL,
    STATIONS_URL,
)


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

    @pytest.fixture(name='api_mock', autouse=True)
    def fixture_api_mock():
        with RequestsMock(registry=OrderedRegistry) as api_mock:
            yield api_mock

    @pytest.fixture(name='client')
    def fixture_client():
        return Client(refresh_token, 'platform', {})

    def describe_get_stations():
        def it_gets_read_stations_access_token(get_access_token, api_mock, client):
            api_mock.get(
                url=STATIONS_URL,
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=200,
                json=[],
            )

            list(client.get_stations())

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[0]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:stations',
            }

        def it_makes_get_stations_request_with_defaults(api_mock, client):
            api_mock.get(
                url=STATIONS_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_stations())

        def it_makes_get_stations_request_with_query(api_mock, client):
            api_mock.get(
                url=STATIONS_URL,
                match=[query_param_matcher({'limit': 10, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_stations(
                {'limit': 10},
            ))

        def it_makes_get_stations_request_with_page_size(api_mock, client):
            api_mock.get(
                url=STATIONS_URL,
                match=[query_param_matcher({'limit': 50, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_stations(
                page_size=50,
            ))

    def describe_get_data():
        def it_gets_read_data_access_token(get_access_token, api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=200,
                json=[],
            )

            list(client.get_data())

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[0]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:data',
            }

        def it_makes_get_data_request_with_defaults(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_data())

        def it_makes_get_data_request_with_query(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 10, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_data(
                {'limit': 10},
            ))

        def it_makes_get_data_request_with_page_size(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 50, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_data(
                page_size=50,
            ))

        def it_gets_read_qc_access_token_when_requesting_records(
            get_access_token,
            api_mock,
            client,
        ):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            list(client.get_data(
                {'records_limit': 1},
            ))

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[-1]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:qc',
            }

        def it_does_not_get_read_qc_access_token_when_disabled(
            get_access_token,
            api_mock,
            client,
        ):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            list(client.get_data(
                {'records_limit': 1},
                include_qc_flags=False,
            ))

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[-1]

            assert kwargs != {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:qc',
            }

        def it_makes_get_qc_requests_per_data_file(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 1})],
                status=200,
                json=[{
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
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1500,
                    'before': '2020-01-01 00:00:00',
                    'after': '2020-01-01 00:00:00',
                })],
                status=200,
                json=[{
                    'timestamp': '2020-01-01 00:00:00',
                    'qc_flags': {'SOME_KEY': 'FLAG'},
                }],
            )

            results = list(client.get_data(
                {'records_limit': 1},
            ))

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

    def describe_post_data():
        payload = {
            'source': 'station:uuid',
            'files': [{
                'filename': 'Test_OneMin.dat',
                'records': [],
            }],
        }

        def it_gets_write_data_access_token(get_access_token, api_mock, client):
            api_mock.post(
                url=DATA_URL,
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=201,
                json={},
            )

            client.post_data(
                payload=payload,
            )

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[0]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'write:data',
            }

        def it_makes_post_data_request_with_payload(api_mock, client):
            api_mock.post(
                url=DATA_URL,
                match=[json_params_matcher(payload)],
                status=201,
                json={},
            )

            client.post_data(
                payload=payload,
            )
