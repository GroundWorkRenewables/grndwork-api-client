from typing import cast, Iterator, Optional

from .access_tokens import get_access_token
from .config import DATA_URL, STATIONS_URL
from .config import get_refresh_token
from .dtos import DataFile, Station
from .dtos import GetDataQuery, GetStationsQuery, PostDataPayload, RefreshToken
from .make_request import make_paginated_request, make_request


LOGGERNET_PLATFORM = 'loggernet'
TRACE_PLATFORM = 'trace'


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
        query: Optional[GetStationsQuery],
        *,
        page_size: int = 100,
    ) -> Iterator[Station]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:stations',
        )

        return cast(
            Iterator[Station],
            make_paginated_request(
                url=STATIONS_URL,
                token=access_token,
                query=query,
                page_size=page_size,
            ),
        )

    def get_data(
        self,
        query: Optional[GetDataQuery],
        *,
        page_size: int = 100,
    ) -> Iterator[DataFile]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:data',
        )

        return cast(
            Iterator[DataFile],
            make_paginated_request(
                url=DATA_URL,
                token=access_token,
                query=query,
                page_size=page_size,
            ),
        )

    def post_data(
        self,
        payload: PostDataPayload,
    ) -> None:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='write:data',
        )
        make_request(
            url=DATA_URL,
            method='POST',
            body=payload,
            token=access_token,
        )


def create_client(
    platform: str = LOGGERNET_PLATFORM,
) -> Client:
    refresh_token: RefreshToken = get_refresh_token()
    return Client(
        refresh_token=refresh_token,
        platform=platform,
    )
