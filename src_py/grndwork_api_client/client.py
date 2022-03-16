from typing import Any, Iterator

from .access_tokens import get_access_token
from .config import DATA_URL, STATIONS_URL
from .config import get_refresh_token
from .dtos import DataFile, Station
from .dtos import GetDataQuery, GetStationsQuery, PostDataPayload, RefreshToken
from .make_request import make_request


LOGGERNET_PLATFORM = 'loggernet'
TRACE_PLATFORM = 'trace'
GET_INTERVAL = 20


class Client():

    def __init__(
        self,
        refresh_token: RefreshToken,
        platform: str,
    ) -> None:
        self.refresh_token = refresh_token
        self.platform = platform

    def get_stations(
        self,
        query: GetStationsQuery,
        page_size: int = 100,
    ) -> Iterator[Station]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:stations',
        )

        limit = query.get('limit')
        print("here's our limit:", limit)
        offset = query.get('offset', 0)

        while True:
            print("limit", limit)
            print("offset: ", offset)
            print("limit adjusted: ", min(limit, page_size) if limit else page_size)
            results, cont_range = make_request(
                    url=STATIONS_URL,
                    method='GET',
                    query={
                        **query,
                        'limit': min(limit, page_size) if limit else page_size,
                        'offset': offset,
                    },
                    token=access_token,
                )
            
            yield from results

            if cont_range.last == cont_range.count:
                break

            if limit is not None:
                limit -= len(results)

                if limit <= 0:
                    break

            offset = cont_range.last
            print("limit updated: ", limit)
            print("ok offset updated", offset)


    def get_data(
        self,
        query: GetDataQuery,
    ) -> Iterator[DataFile]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:data',
        )

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

            query['offset'] = cont_range.last

    def post_data(
        self,
        payload: PostDataPayload,
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


def create_client(
    platform: str = LOGGERNET_PLATFORM,
) -> Client:
    refresh_token: RefreshToken = get_refresh_token()
    return Client(
        refresh_token=refresh_token,
        platform=platform,
    )
