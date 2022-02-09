import pytest
from src.grndwork_python_client import client
from src.grndwork_python_client.access_tokens import get_access_token
from src.grndwork_python_client.config import DATA_URL, STATIONS_URL
from src.grndwork_python_client.config import get_refresh_token
from src.grndwork_python_client.make_request import make_request


def describe_client():

    @pytest.fixture(name='get_refresh_token', autouse=False)
    def fixture_get_token(mocker):
        return mocker.patch(
            target='src.grndwork_python_client.client.get_refresh_token',
            spec=get_refresh_token,
        )

    @pytest.fixture(name='get_access_token', autouse=False)
    def fixture_get_access_token(mocker):
        access_token_mock = mocker.patch(
            target='src.grndwork_python_client.client.get_access_token',
            spec=get_access_token,
        )
        access_token_mock.return_value = 'access_token'
        return access_token_mock

    @pytest.fixture(name='make_request', autouse=True)
    def fixture_requests(mocker):
        return mocker.patch(
            target='src.grndwork_python_client.client.make_request',
            spec=make_request,
        )

    def it_creates_client(get_refresh_token):
        refresh_token = {
            'subject': 'uuid',
            'token': 'refresh_token',
        }
        get_refresh_token.return_value = refresh_token
        my_client = client.Client()
        assert my_client.refresh_token
        assert my_client.platform == 'loggernet'

    def it_throws_when_refresh_token_is_null(get_refresh_token):
        get_refresh_token.return_value = None
        with pytest.raises(OSError, match='Could not get refresh token from environment'):
            client.Client()

    def it_gets_stations(get_refresh_token, get_access_token, make_request):
        my_client = client.Client()
        my_client.get_stations(query={})
        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': STATIONS_URL,
            'method': 'GET',
            'query': {},
            'token': 'access_token',
        }
        assert make_request.call_count == 1

    def it_gets_data(get_refresh_token, get_access_token, make_request):
        my_client = client.Client()
        my_client.get_data(query={})
        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': DATA_URL,
            'method': 'GET',
            'query': {},
            'token': 'access_token',
        }
        assert make_request.call_count == 1

    def it_posts_data(get_refresh_token, get_access_token, make_request):
        payload = {
            'platform': 'loggernet',
            'source': 'station:12345',
            'files': [
                {
                    'filename': 'file.dat',
                    'records': [
                        {
                            'timestamp': '1980-01-01 00:00:00',
                            'record_num': 1,
                            'data': {'KEY': 'val'},
                        },
                    ],
                },
            ],
        }
        my_client = client.Client()
        my_client.post_data(payload=payload)
        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': DATA_URL,
            'method': 'POST',
            'body': payload,
            'token': 'access_token',
        }
        assert make_request.call_count == 1
