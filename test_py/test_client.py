from os import getcwd
from os.path import join as join_path
from tempfile import gettempdir
from typing import Callable, Iterable, List, TypeVar

import pytest
from responses import RequestsMock
from responses.matchers import header_matcher, json_params_matcher, query_param_matcher
from responses.registries import OrderedRegistry
from src_py.grndwork_api_client.access_tokens import get_access_token as _get_access_token
from src_py.grndwork_api_client.client import Client
from src_py.grndwork_api_client.config import (
    DATA_URL,
    EXPORTS_URL,
    FILES_URL,
    QC_URL,
    REPORTS_URL,
    STATIONS_URL,
)
from src_py.grndwork_api_client.download_file import download_file as _download_file
from src_py.grndwork_api_client.run_concurrently import run_concurrently as _run_concurrently


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

    @pytest.fixture(name='run_concurrently', autouse=True)
    def fixture_run_concurrently(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.run_concurrently',
            spec=_run_concurrently,
            side_effect=run_concurrently_mock,
        )

    @pytest.fixture(name='download_file', autouse=True)
    def fixture_download_file(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.download_file',
            spec=_download_file,
            side_effect=lambda url, dest, timeout: dest,
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

    def describe_get_reports():
        def it_gets_read_reports_access_token(client, get_access_token, api_mock):
            api_mock.get(
                url=REPORTS_URL,
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=200,
                json=[],
            )

            list(client.get_reports())

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[0]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:reports',
            }

        def it_makes_get_reports_request_with_defaults(client, api_mock):
            api_mock.get(
                url=REPORTS_URL,
                match=[query_param_matcher({'limit': 100, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_reports())

        def it_makes_get_reports_request_with_query(client, api_mock):
            api_mock.get(
                url=REPORTS_URL,
                match=[query_param_matcher({'limit': 10, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_reports(
                {'limit': 10},
            ))

        def it_makes_get_reports_request_with_page_size(client, api_mock):
            api_mock.get(
                url=REPORTS_URL,
                match=[query_param_matcher({'limit': 50, 'offset': 0})],
                status=200,
                json=[],
            )

            list(client.get_reports(
                page_size=50,
            ))

    def describe_download_report():
        def it_gets_read_reports_access_token(client, get_access_token, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                match=[header_matcher({'Authorization': 'Bearer access_token'})],
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
            )

            assert get_access_token.called

            (_, kwargs) = get_access_token.call_args_list[0]

            assert kwargs == {
                'refresh_token': refresh_token,
                'platform': 'platform',
                'scope': 'read:reports',
            }

        def it_makes_request_for_report_url(client, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
            )

        def it_does_not_make_request_for_report_without_pdf(client):
            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'has_pdf': False,
                    'data_exports': [],
                    'files': [],
                },
            )

        def it_makes_request_for_data_export_and_file_urls(client, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY_1.pdf',
                status=200,
                json={'url': 'report url'},
            )

            api_mock.get(
                url=f'{EXPORTS_URL}/TEST_KEY_2.csv',
                status=200,
                json={'url': 'export url'},
            )

            api_mock.get(
                url=f'{FILES_URL}/TEST_KEY_3.zip',
                status=200,
                json={'url': 'file url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY_1.pdf',
                    'has_pdf': True,
                    'data_exports': [
                        {'key': 'TEST_KEY_2.csv'},
                    ],
                    'files': [
                        {'key': 'TEST_KEY_3.zip'},
                    ],
                },
            )

        def it_downloads_report(client, download_file, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
            )

            assert download_file.called

            (args, _) = download_file.call_args_list[0]

            assert args == (
                'report url',
                join_path(getcwd(), 'TEST_KEY.pdf'),
            )

        def it_downloads_report_as_package(client, download_file, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'package_name': 'TEST_REPORT',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
            )

            assert download_file.called

            (args, _) = download_file.call_args_list[0]

            assert args == (
                'report url',
                join_path(getcwd(), 'TEST_REPORT', 'TEST_KEY.pdf'),
            )

        def it_downloads_package_to_destination_folder(client, download_file, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'package_name': 'TEST_REPORT',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
                destination_folder=gettempdir(),
            )

            assert download_file.called

            (args, _) = download_file.call_args_list[0]

            assert args == (
                'report url',
                join_path(gettempdir(), 'TEST_REPORT', 'TEST_KEY.pdf'),
            )

        def it_downloads_files_concurrently(client, run_concurrently, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
            )

            assert run_concurrently.called

            (_, kwargs) = run_concurrently.call_args_list[0]

            assert kwargs.get('max_concurrency') == 10

        def it_downloads_files_with_max_concurrency(client, run_concurrently, api_mock):
            api_mock.get(
                url=f'{REPORTS_URL}/TEST_KEY.pdf',
                status=200,
                json={'url': 'report url'},
            )

            client.download_report(
                {
                    'key': 'TEST_KEY.pdf',
                    'has_pdf': True,
                    'data_exports': [],
                    'files': [],
                },
                max_concurrency=1,
            )

            assert run_concurrently.called

            (_, kwargs) = run_concurrently.call_args_list[0]

            assert kwargs.get('max_concurrency') == 1

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


_T = TypeVar('_T')
_K = TypeVar('_K')


def run_concurrently_mock(
    func: Callable[[_T], _K],
    iterable: Iterable[_T],
    *,
    max_concurrency: int,
) -> List[_K]:
    return [
        func(value) for value in iterable
    ]
