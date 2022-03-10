from typing import Any, Dict, Iterator, Optional

from .access_tokens import get_access_token
from .config import DATA_URL, STATIONS_URL
from .config import get_refresh_token
from .dtos import DataFile, Station
from .dtos import GetDataQuery, GetStationsQuery
from .make_request import make_request


LOGGERNET_PLATFORM = 'loggernet'
TRACE_PLATFORM = 'trace'
GET_INTERVAL = 20


class Client():

    def __init__(
        self,
        platform: Optional[str] = None,
    ) -> None:
        self.refresh_token: Dict[str, Any] = get_refresh_token()
        self.platform: str = platform if platform else LOGGERNET_PLATFORM

        if not self.refresh_token:
            raise OSError('Could not get refresh token from environment')

    def get_stations(
        self,
        query: GetStationsQuery,
    ) -> Iterator[Station]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:stations',
        )

        offset = 0
        query['offset'] = offset

        while True:
            results, cont_range = make_request(
                    url=STATIONS_URL,
                    method='GET',
                    query=query,
                    token=access_token,
                )

            yield from results

            if cont_range.last == cont_range.count:
                break

            offset = cont_range.last

    def get_data(
        self,
        query: GetDataQuery,
    ) -> Iterator[DataFile]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:data',
        )

        offset = 0
        query['offset'] = offset

        while True:
            results, cont_range = make_request(
                    url=DATA_URL,
                    method='GET',
                    query=query,
                    token=access_token,
                )

            yield from results

            if cont_range.last == cont_range.count:
                break

            offset = cont_range.last

    def post_data(
        self,
        payload: Dict[str, Any],
    ) -> Any:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='write:data',
        )
        result, cont_range = make_request(
            url=DATA_URL,
            method='POST',
            body=payload,
            token=access_token,
        )
        return result
