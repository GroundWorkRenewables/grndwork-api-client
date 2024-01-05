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

    def describe_get_data_files():
        def it_gets_read_data_access_token(get_access_token, api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=200,
                json=[],
            )

            list(client.get_data_files())

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
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[],
            )

            list(client.get_data_files())

        def it_makes_get_data_request_with_query(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 10, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[],
            )

            list(client.get_data_files(
                {'limit': 10},
            ))

        def it_makes_get_data_request_with_page_size(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 50, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[],
            )

            list(client.get_data_files(
                page_size=50,
            ))

    def describe_get_data_records():
        def it_gets_read_data_access_token(get_access_token, api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat'},
            ))

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
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                    'records_limit': 1,
                })],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat'},
            ))

        def it_makes_get_data_request_with_query(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                    'records_limit': 100,
                })],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
            ))

        def it_makes_get_data_request_with_page_size(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                    'records_limit': 50,
                })],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
                page_size=50,
            ))

        def it_gets_read_qc_access_token(get_access_token, api_mock, client):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat'},
            ))

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[-1]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:qc',
            }

        def it_does_not_get_read_qc_access_token_when_disabled(get_access_token, api_mock, client):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat'},
                include_qc_flags=False,
            ))

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[-1]

            assert kwargs != {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:qc',
            }

        def it_makes_get_qc_request_with_defaults(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                })],
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat'},
            ))

        def it_makes_get_qc_request_with_query(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 100,
                })],
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
            ))

        def it_makes_get_qc_request_with_page_size(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 50,
                })],
                status=200,
                json=[],
            )

            list(client.get_data_records(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
                page_size=50,
            ))

        def it_combines_data_and_qc(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[{
                    'records': [{
                        'timestamp': '2020-01-01 00:02:00',
                        'record_num': 2,
                        'data': {'SOME_KEY': 'VALUE_2'},
                    }, {
                        'timestamp': '2020-01-01 00:01:00',
                        'record_num': 1,
                        'data': {'SOME_KEY': 'VALUE_1'},
                    }],
                }],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[{
                    'timestamp': '2020-01-01 00:01:00',
                    'qc_flags': {'SOME_KEY': 'FLAG_2'},
                }, {
                    'timestamp': '2020-01-01 00:00:00',
                    'qc_flags': {'SOME_KEY': 'FLAG_1'},
                }],
            )

            results = list(client.get_data_records(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
            ))

            assert results == [{
                'timestamp': '2020-01-01 00:02:00',
                'record_num': 2,
                'data': {'SOME_KEY': 'VALUE_2'},
            }, {
                'timestamp': '2020-01-01 00:01:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE_1'},
                'qc_flags': {'SOME_KEY': 'FLAG_2'},
            }]

    def describe_get_data_qc():
        def it_gets_read_qc_access_token(get_access_token, api_mock, client):
            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            list(client.get_data_qc(
                {'filename': 'Test_OneMin.dat'},
            ))

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[-1]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:qc',
            }

        def it_makes_get_qc_request_with_defaults(api_mock, client):
            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                })],
                status=200,
                json=[],
            )

            list(client.get_data_qc(
                {'filename': 'Test_OneMin.dat'},
            ))

        def it_makes_get_qc_request_with_query(api_mock, client):
            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 100,
                })],
                status=200,
                json=[],
            )

            list(client.get_data_qc(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
            ))

        def it_makes_get_qc_request_with_page_size(api_mock, client):
            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 50,
                })],
                status=200,
                json=[],
            )

            list(client.get_data_qc(
                {'filename': 'Test_OneMin.dat', 'limit': 100},
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
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[],
            )

            list(client.get_data())

        def it_makes_get_data_request_with_query(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 10, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[],
            )

            list(client.get_data(
                {'limit': 10},
            ))

        def it_makes_get_data_request_with_page_size(api_mock, client):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 50, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[],
            )

            list(client.get_data(
                file_page_size=50,
            ))

        def it_makes_get_data_request_per_file_with_defaults_when_requesting_records(
            client,
            api_mock,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                    'records_limit': 1,
                })],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                include_data_records=True,
            ):
                list(data_file['records'])

        def it_makes_get_data_request_per_file_with_query_when_requesting_records(
            client,
            api_mock,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                    'records_limit': 100,
                })],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                {'records_limit': 100},
                include_data_records=True,
            ):
                list(data_file['records'])

        def it_makes_get_data_request_per_file_with_page_size_when_requesting_records(
            client,
            api_mock,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                    'records_limit': 50,
                })],
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                {'records_limit': 100},
                include_data_records=True,
                record_page_size=50,
            ):
                list(data_file['records'])

        def it_gets_read_qc_access_token_when_requesting_records(
            get_access_token,
            api_mock,
            client,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                include_data_records=True,
            ):
                list(data_file['records'])

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
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                include_data_records=True,
                include_qc_flags=False,
            ):
                list(data_file['records'])

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[-1]

            assert kwargs != {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:qc',
            }

        def it_makes_get_qc_request_per_file_with_defaults_when_requesting_records(
            api_mock,
            client,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 1,
                })],
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                include_data_records=True,
            ):
                list(data_file['records'])

        def it_makes_get_qc_request_per_file_with_query_when_requesting_records(
            client,
            api_mock,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 100,
                })],
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                {'records_limit': 100},
                include_data_records=True,
            ):
                list(data_file['records'])

        def it_makes_get_qc_request_per_file_with_page_size_when_requesting_records(
            client,
            api_mock,
        ):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[],
            )

            api_mock.get(
                url=QC_URL,
                match=[query_param_matcher({
                    'filename': 'Test_OneMin.dat',
                    'limit': 50,
                })],
                status=200,
                json=[],
            )

            for data_file in client.get_data(
                {'records_limit': 100},
                include_data_records=True,
                record_page_size=50,
            ):
                list(data_file['records'])

        def it_combines_data_and_qc_when_requesting_records(client, api_mock):
            api_mock.get(
                url=DATA_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0, 'records_limit': 0})],
                status=200,
                json=[{
                    'filename': 'Test_OneMin.dat',
                }],
                headers={
                    'content-range': 'items 1-1/1',
                },
            )

            api_mock.get(
                url=DATA_URL,
                status=200,
                json=[{
                    'records': [{
                        'timestamp': '2020-01-01 00:02:00',
                        'record_num': 2,
                        'data': {'SOME_KEY': 'VALUE_2'},
                    }, {
                        'timestamp': '2020-01-01 00:01:00',
                        'record_num': 1,
                        'data': {'SOME_KEY': 'VALUE_1'},
                    }],
                }],
            )

            api_mock.get(
                url=QC_URL,
                status=200,
                json=[{
                    'timestamp': '2020-01-01 00:01:00',
                    'qc_flags': {'SOME_KEY': 'FLAG_2'},
                }, {
                    'timestamp': '2020-01-01 00:00:00',
                    'qc_flags': {'SOME_KEY': 'FLAG_1'},
                }],
            )

            results = []

            for data_file in client.get_data(
                {'records_limit': 100},
                include_data_records=True,
            ):
                results = list(data_file['records'])

            assert results == [{
                'timestamp': '2020-01-01 00:02:00',
                'record_num': 2,
                'data': {'SOME_KEY': 'VALUE_2'},
            }, {
                'timestamp': '2020-01-01 00:01:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE_1'},
                'qc_flags': {'SOME_KEY': 'FLAG_2'},
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
