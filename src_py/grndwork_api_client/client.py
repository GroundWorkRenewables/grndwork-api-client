from typing import cast, Iterator, List, Optional

from .access_tokens import get_access_token
from .config import DATA_URL, QC_URL, STATIONS_URL
from .interfaces import (
    DataFile,
    GetDataQuery,
    GetQCQuery,
    GetStationsQuery,
    PostDataPayload,
    QCRecord,
    RefreshToken,
    Station,
)
from .make_paginated_request import make_paginated_request
from .make_request import make_request
from .utils import combine_data_and_qc_records


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
        page_size: Optional[int] = None,
    ) -> Iterator[Station]:
        iterator = self._request_stations(
            query=query,
            page_size=page_size,
        )

        return iterator

    def _request_stations(
        self,
        *,
        query: Optional[GetStationsQuery],
        page_size: Optional[int],
    ) -> Iterator[Station]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:stations',
        )

        iterator = cast(Iterator[Station], make_paginated_request(
            url=STATIONS_URL,
            token=access_token,
            query=query or {},
            page_size=page_size or 100,
        ))

        return iterator

    def get_data(
        self,
        query: Optional[GetDataQuery] = None,
        *,
        include_qc_flags: Optional[bool] = None,
        page_size: Optional[int] = None,
    ) -> Iterator[DataFile]:
        iterator = self._request_data(
            query=query,
            page_size=page_size,
        )

        if (query or {}).get('records_limit') and include_qc_flags is not False:
            iterator = self._include_qc_flags(iterator)

        return iterator

    def _request_data(
        self,
        *,
        query: Optional[GetDataQuery],
        page_size: Optional[int],
    ) -> Iterator[DataFile]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:data',
        )

        iterator = cast(Iterator[DataFile], make_paginated_request(
            url=DATA_URL,
            token=access_token,
            query=query or {},
            page_size=page_size or 100,
        ))

        return iterator

    def _include_qc_flags(
        self,
        iterator: Iterator[DataFile],
    ) -> Iterator[DataFile]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:qc',
        )

        for data_file in iterator:
            records = data_file.get('records', [])

            if records:
                query: GetQCQuery = {
                    'filename': data_file['filename'],
                    'before': records[0]['timestamp'],
                    'after': records[-1]['timestamp'],
                    'limit': 1500,
                }

                results = cast(List[QCRecord], make_request(
                    url=QC_URL,
                    token=access_token,
                    query=query,
                )[0])

                yield {
                    **data_file,
                    'records': combine_data_and_qc_records(records, results),
                }

            else:
                yield data_file

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
            token=access_token,
            method='POST',
            body=payload,
        )
