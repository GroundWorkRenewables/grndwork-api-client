import pytest
from src_py.grndwork_api_client import client
from src_py.grndwork_api_client.access_tokens import get_access_token
from src_py.grndwork_api_client.config import DATA_URL
from src_py.grndwork_api_client.config import get_refresh_token
from src_py.grndwork_api_client.make_request import make_request


def describe_client():

    @pytest.fixture(name='get_refresh_token', autouse=False)
    def fixture_get_token(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.get_refresh_token',
            spec=get_refresh_token,
        )

    @pytest.fixture(name='get_access_token', autouse=False)
    def fixture_get_access_token(mocker):
        access_token_mock = mocker.patch(
            target='src_py.grndwork_api_client.client.get_access_token',
            spec=get_access_token,
        )
        access_token_mock.return_value = 'access_token'
        return access_token_mock

    @pytest.fixture(name='make_request', autouse=True)
    def fixture_requests(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.make_request',
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
        make_request.side_effect = [
            (
                {'result': 1}, {'first': 1, 'last': 20, 'count': 15},
            ),
        ]
        my_client = client.Client()
        my_request = my_client.get_stations(query={})
        assert next(my_request) == {'result': 1}

    def it_gets_stations_with_offset(get_refresh_token, get_access_token, make_request):
        make_request.side_effect = [
            (
                {'result': 1}, {'first': 1, 'last': 20, 'count': 65},
            ),
            (
                {'result': 2}, {'first': 21, 'last': 40, 'count': 65},
            ),
            (
                {'result': 3}, {'first': 41, 'last': 60, 'count': 65},
            ),
            (
                {'result': 4}, {'first': 61, 'last': 65, 'count': 65},
            ),
        ]

        my_client = client.Client()
        my_request = my_client.get_stations(query={})
        assert next(my_request) == {'result': 1}
        assert next(my_request) == {'result': 2}
        assert next(my_request) == {'result': 3}
        assert next(my_request) == {'result': 4}
        with pytest.raises(StopIteration):
            next(my_request)

    def it_gets_data(get_refresh_token, get_access_token, make_request):
        make_request.side_effect = [
            (
                {'result': 1}, {'first': 1, 'last': 20, 'count': 15},
            ),
        ]
        my_client = client.Client()
        my_request = my_client.get_data(query={})
        assert next(my_request) == {'result': 1}

    def it_gets_data_with_offset(get_refresh_token, get_access_token, make_request):
        make_request.side_effect = [
            (
                {'result': 1}, {'first': 1, 'last': 20, 'count': 65},
            ),
            (
                {'result': 2}, {'first': 21, 'last': 40, 'count': 65},
            ),
            (
                {'result': 3}, {'first': 41, 'last': 60, 'count': 65},
            ),
            (
                {'result': 4}, {'first': 61, 'last': 65, 'count': 65},
            ),
        ]

        my_client = client.Client()
        my_request = my_client.get_data(query={})
        assert next(my_request) == {'result': 1}
        assert next(my_request) == {'result': 2}
        assert next(my_request) == {'result': 3}
        assert next(my_request) == {'result': 4}
        with pytest.raises(StopIteration):
            next(my_request)

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
        my_request = my_client.post_data(payload=payload)
        next(my_request)
        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': DATA_URL,
            'method': 'POST',
            'body': payload,
            'token': 'access_token',
        }
        assert make_request.call_count == 1
