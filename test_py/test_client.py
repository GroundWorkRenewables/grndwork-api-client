import pytest
from src_py.grndwork_api_client.access_tokens import get_access_token
from src_py.grndwork_api_client.client import Client
from src_py.grndwork_api_client.config import DATA_URL
from src_py.grndwork_api_client.dtos import DataFile, DataFileHeaders, Station
from src_py.grndwork_api_client.dtos import GetDataQuery, GetStationsQuery
from src_py.grndwork_api_client.make_request import make_paginated_request
from src_py.grndwork_api_client.make_request import make_request


def describe_client():

    def get_datafile():
        headers = DataFileHeaders(
            meta={},
            columns=[],
            units=[],
            processing=[],
        )
        data_file = DataFile(
            source='src',
            filename='filename.dat',
            is_stale=False,
            headers=headers,
            records=[],
        )
        return data_file

    def get_station():
        station = Station(
            client_uuid='client_uuid',
            client_full_name='full_name',
            client_short_name='short_name',
            site_uuid='station_uuid',
            site_full_name='site_full_name',
            station_uuid='station_uuid',
            station_full_name='station',
            description='',
            latitude=0,
            longitude=0,
            altitude=0,
            timezone_offset=1,
            start_timestamp='1',
            end_timestamp='1',
            data_file_prefix='PRE',
            data_files=[],
        )
        return station

    @pytest.fixture(name='get_access_token', autouse=True)
    def fixture_get_access_token(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.get_access_token',
            spec=get_access_token,
            return_value='access_token',
        )

    @pytest.fixture(name='make_request', autouse=True)
    def fixture_requests(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.make_request',
            spec=make_request,
        )

    @pytest.fixture(name='make_paginated_request', autouse=True)
    def fixture_pag_requests(mocker):
        return mocker.patch(
            target='src_py.grndwork_api_client.client.make_paginated_request',
            spec=make_paginated_request,
        )

    @pytest.fixture(name='client_factory', autouse=True)
    def fixture_client(mocker):

        def create_client(**kwargs):
            refresh_token = {
                'subject': 'uuid',
                'token': 'refresh_token',
            }
            client = Client(
                **{
                    'refresh_token': refresh_token,
                    'platform': 'loggernet',
                    **kwargs,
                },
            )
            return client

        return create_client

    def it_creates_client(client_factory):
        my_client = client_factory()
        assert my_client.refresh_token
        assert my_client.platform == 'loggernet'

    def it_gets_stations(client_factory, make_paginated_request):
        station = get_station()
        make_paginated_request.return_value = iter([station])
        my_client = client_factory()
        station_query = GetStationsQuery(
            client='client',
        )
        response = list(my_client.get_stations(station_query))
        assert response == [station]

    def it_gets_stations_with_no_query(client_factory, make_paginated_request):
        station = get_station()
        make_paginated_request.return_value = iter([station])
        my_client = client_factory()
        response = list(my_client.get_stations())
        assert response == [station]

    def it_gets_stations_with_offset(client_factory, make_paginated_request):
        station = get_station()
        make_paginated_request.return_value = iter([station, station, station, station])
        station_query = GetStationsQuery(
            client='client',
            site='site',
        )
        my_client = client_factory()
        response = list(my_client.get_stations(station_query))
        assert response == [station, station, station, station]

    def it_gets_data(client_factory, make_paginated_request):
        data_file = get_datafile()
        make_paginated_request.return_value = iter([data_file])

        my_client = client_factory()
        data_query = GetDataQuery(
            client='client',
            site='site',
            gateway='gateway',
            station='station',
            filename='filename.dat',
            limit=1,
            offset=0,
            records_before=0,
            records_after=0,
            records_limit=0,
        )
        response = list(my_client.get_data(data_query))
        assert response == [data_file]

    def it_gets_data_with_no_query(client_factory, make_paginated_request):
        data_file = get_datafile()
        make_paginated_request.return_value = iter([data_file])
        my_client = client_factory()
        response = list(my_client.get_data())
        assert response == [data_file]

    def it_posts_data(client_factory, make_request):
        make_request.side_effect = [
            (
                {'result': 1}, {},
            ),
        ]

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
        my_client = client_factory()
        my_client.post_data(payload=payload)
        (_, kwargs) = make_request.call_args

        assert kwargs == {
            'url': DATA_URL,
            'method': 'POST',
            'body': payload,
            'token': 'access_token',
        }
        assert make_request.call_count == 1
