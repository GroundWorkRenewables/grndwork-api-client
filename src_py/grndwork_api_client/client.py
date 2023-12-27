from typing import Any, cast, Iterator, List, Optional, Tuple

from .access_tokens import get_access_token
from .config import (
    DATA_URL,
    QC_URL,
    STATIONS_URL,
)
from .interfaces import (
    ClientOptions,
    DataFileWithRecords,
    GetDataQuery,
    GetStationsQuery,
    PostDataPayload,
    QCRecord,
    RefreshToken,
    StationWithDataFiles,
)
from .make_paginated_request import make_paginated_request
from .make_request import HttpMethod, make_request, Response
from .utils import combine_data_and_qc_records


class Client():
    _refresh_token: RefreshToken
    _platform: str
    _options: ClientOptions

    def __init__(
        self,
        refresh_token: RefreshToken,
        platform: str,
        options: ClientOptions,
    ) -> None:
        self._refresh_token = refresh_token
        self._platform = platform
        self._options = options

    def get_stations(
        self,
        query: Optional[GetStationsQuery] = None,
        *,
        page_size: Optional[int] = None,
    ) -> Iterator[StationWithDataFiles]:
        iterator = self._request_stations(
            query=query or {},
            page_size=page_size or 100,
        )

        return iterator

    def get_data(
        self,
        query: Optional[GetDataQuery] = None,
        *,
        include_qc_flags: Optional[bool] = None,
        page_size: Optional[int] = None,
    ) -> Iterator[DataFileWithRecords]:
        iterator = self._request_data_files(
            query=query or {},
            page_size=page_size or 100,
        )

        if (query or {}).get('records_limit') and include_qc_flags is not False:
            iterator = self._include_qc_flags(iterator)

        return iterator

    def post_data(
        self,
        payload: PostDataPayload,
    ) -> None:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='write:data',
        )

        self._make_request(
            url=DATA_URL,
            method='POST',
            token=access_token,
            body=payload,
        )

    def _request_stations(
        self,
        *,
        query: GetStationsQuery,
        page_size: int,
    ) -> Iterator[StationWithDataFiles]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:stations',
        )

        iterator = cast(Iterator[StationWithDataFiles], self._make_paginated_request(
            url=STATIONS_URL,
            token=access_token,
            query=query,
            page_size=page_size,
        ))

        return iterator

    def _request_data_files(
        self,
        *,
        query: GetDataQuery,
        page_size: int,
    ) -> Iterator[DataFileWithRecords]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:data',
        )

        iterator = cast(Iterator[DataFileWithRecords], self._make_paginated_request(
            url=DATA_URL,
            token=access_token,
            query=query,
            page_size=page_size,
        ))

        return iterator

    def _include_qc_flags(
        self,
        iterator: Iterator[DataFileWithRecords],
    ) -> Iterator[DataFileWithRecords]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:qc',
        )

        for data_file in iterator:
            records = data_file.get('records', [])

            if records:
                results = cast(List[QCRecord], self._make_request(
                    url=QC_URL,
                    token=access_token,
                    query={
                        'filename': data_file['filename'],
                        'limit': 1500,
                        'before': records[0]['timestamp'],
                        'after': records[-1]['timestamp'],
                    },
                )[0])

                yield {
                    **data_file,
                    'records': combine_data_and_qc_records(records, results),
                }

            else:
                yield data_file

    def _make_request(
        self,
        *,
        url: str,
        method: Optional[HttpMethod] = None,
        token: Optional[str] = None,
        query: Any = None,
        body: Any = None,
    ) -> Tuple[Any, Response]:
        return make_request(
            url=url,
            method=method,
            token=token,
            query=query,
            body=body,
            timeout=self._options.get('request_timeout'),
            retries=self._options.get('request_retries'),
            backoff=self._options.get('request_backoff'),
        )

    def _make_paginated_request(
        self,
        *,
        url: str,
        token: Optional[str] = None,
        query: Any = None,
        page_size: int,
    ) -> Iterator[Any]:
        return make_paginated_request(
            url=url,
            token=token,
            query=query,
            page_size=page_size,
            timeout=self._options.get('request_timeout'),
            retries=self._options.get('request_retries'),
            backoff=self._options.get('request_backoff'),
        )
