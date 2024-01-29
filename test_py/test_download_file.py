from os import getcwd
from os.path import join as join_path

import pytest
from responses import RequestsMock
from responses.registries import OrderedRegistry
from src_py.grndwork_api_client.config import API_URL
from src_py.grndwork_api_client.download_file import download_file, DownloadError

TEST_URL = f'{API_URL}/v1/test'


def describe_download_file():
    @pytest.fixture(name='api_mock', autouse=True)
    def fixture_api_mock():
        with RequestsMock(registry=OrderedRegistry) as api_mock:
            yield api_mock

    @pytest.fixture(name='makedirs', autouse=True)
    def fixture_makedirs(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.download_file.makedirs',
        )

    @pytest.fixture(name='open_mock', autouse=True)
    def fixture_open_mock(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.download_file.open',
            new=mocker.mock_open(),
        )

    def it_ensures_destination_folder_exists(api_mock, makedirs):
        api_mock.get(
            url=f'{TEST_URL}/test.txt',
            status=200,
            body='file contents',
        )

        download_file(
            f'{TEST_URL}/test.txt',
            join_path(getcwd(), 'output.txt'),
        )

        assert makedirs.called
        assert makedirs.call_args_list[0] == ((getcwd(),), {'exist_ok': True})

    def it_makes_request_for_file(api_mock):
        api_mock.get(
            url=f'{TEST_URL}/test.txt',
            status=200,
            body='file contents',
        )

        download_file(
            f'{TEST_URL}/test.txt',
            join_path(getcwd(), 'output.txt'),
        )

    def it_raises_error_when_bad_request(api_mock, open_mock):
        api_mock.get(
            url=f'{TEST_URL}/test.txt',
            status=400,
        )

        with pytest.raises(DownloadError, match='Failed to download file'):
            download_file(
                f'{TEST_URL}/test.txt',
                join_path(getcwd(), 'output.txt'),
            )

        assert not open_mock.called

    def it_writes_contents_of_file_to_destination(api_mock, open_mock):
        api_mock.get(
            url=f'{TEST_URL}/test.txt',
            status=200,
            body='file contents',
        )

        download_file(
            f'{TEST_URL}/test.txt',
            join_path(getcwd(), 'output.txt'),
        )

        assert open_mock.called

        with open_mock() as out:
            assert out.write.called
            assert out.write.call_args_list[0] == ((b'file contents',), {})
