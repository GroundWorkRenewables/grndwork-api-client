from typing import cast, Iterator, Optional

from .access_tokens import get_access_token
from .config import DATA_URL, STATIONS_URL
from .dtos import (
    DataFile,
    GetDataQuery,
    GetStationsQuery,
    PostDataPayload,
    RefreshToken,
    Station,
)
from .make_request import make_paginated_request, make_request


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
        query: Optional[GetStationsQuery] = None,
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
        query: Optional[GetDataQuery] = None,
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
