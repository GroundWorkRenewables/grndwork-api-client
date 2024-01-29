from os import getcwd
from os.path import join as join_path
from typing import Any, cast, Iterator, List, Literal, Optional, overload, Tuple, Union

from .access_tokens import get_access_token
from .config import (
    DATA_URL,
    EXPORTS_URL,
    FILES_URL,
    QC_URL,
    REPORTS_URL,
    STATIONS_URL,
)
from .download_file import download_file
from .interfaces import (
    ClientOptions,
    DataFile,
    DataFileWithRecords,
    DataRecord,
    GetDataFilesQuery,
    GetDataQCQuery,
    GetDataQuery,
    GetDataRecordsQuery,
    GetReportsQuery,
    GetStationsQuery,
    PostDataPayload,
    QCRecord,
    RefreshToken,
    Report,
    StationWithDataFiles,
)
from .make_paginated_request import make_paginated_request
from .make_request import HttpMethod, make_request, Response
from .run_concurrently import run_concurrently
from .utils import strip_uuid


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

    def get_reports(
        self,
        query: Optional[GetReportsQuery] = None,
        *,
        page_size: Optional[int] = None,
    ) -> Iterator[Report]:
        iterator = self._request_reports(
            query=query or {},
            page_size=page_size or 100,
        )

        return iterator

    def download_report(
        self,
        report: Report,
        *,
        destination_folder: Optional[str] = None,
        max_concurrency: Optional[int] = None,
    ) -> List[str]:
        destination = join_path(
            destination_folder or getcwd(),
            report.get('package_name') or '',
        )

        files_to_download: List[Tuple[str, str]] = []

        if report.get('has_pdf') is not False:
            files_to_download.append((
                f'{REPORTS_URL}/{report["key"]}',
                join_path(
                    destination,
                    strip_uuid(report['key']),
                ),
            ))

        for data_export in report['data_exports']:
            files_to_download.append((
                f'{EXPORTS_URL}/{data_export["key"]}',
                join_path(
                    destination,
                    strip_uuid(data_export['key']),
                ),
            ))

        for report_file in report['files']:
            files_to_download.append((
                f'{FILES_URL}/{report_file["key"]}',
                join_path(
                    destination,
                    report_file.get('filename') or strip_uuid(report_file['key']),
                ),
            ))

        result = self._download_report_files(
            files_to_download,
            max_concurrency=max_concurrency or 10,
        )

        return [
            file for file in result if isinstance(file, str)
        ]

    def get_data_files(
        self,
        query: Optional[GetDataFilesQuery] = None,
        *,
        page_size: Optional[int] = None,
    ) -> Iterator[DataFile]:
        iterator = self._request_data_files(
            query=query or {},
            page_size=page_size or 100,
        )

        return iterator

    def get_data_records(
        self,
        query: GetDataRecordsQuery,
        *,
        include_qc_flags: Optional[bool] = None,
        page_size: Optional[int] = None,
    ) -> Iterator[DataRecord]:
        iterator = self._request_data_records(
            query=query,
            page_size=page_size or 1500,
        )

        if include_qc_flags is not False:
            iterator = self._include_qc_flags(
                iterator,
                query=query,
                page_size=page_size or 1500,
            )

        return iterator

    def get_data_qc(
        self,
        query: GetDataQCQuery,
        *,
        page_size: Optional[int] = None,
    ) -> Iterator[QCRecord]:
        iterator = self._request_data_qc(
            query=query,
            page_size=page_size or 1500,
        )

        return iterator

    @overload
    def get_data(
        self,
        query: Optional[GetDataFilesQuery],
        *,
        include_data_records: Literal[False],
        include_qc_flags: Optional[bool],
        file_page_size: Optional[int],
        record_page_size: Optional[int],
    ) -> Iterator[DataFile]:
        ...

    @overload
    def get_data(
        self,
        query: Optional[GetDataQuery],
        *,
        include_data_records: Literal[True],
        include_qc_flags: Optional[bool],
        file_page_size: Optional[int],
        record_page_size: Optional[int],
    ) -> Iterator[DataFileWithRecords]:
        ...

    def get_data(
        self,
        query: Union[GetDataFilesQuery, GetDataQuery, None] = None,
        *,
        include_data_records: Optional[bool] = None,
        include_qc_flags: Optional[bool] = None,
        file_page_size: Optional[int] = None,
        record_page_size: Optional[int] = None,
    ) -> Union[Iterator[DataFile], Iterator[DataFileWithRecords]]:
        iterator = self._request_data_files(
            query=query or {},
            page_size=file_page_size or 100,
        )

        if include_data_records:
            iterator = self._include_data_records(
                iterator,
                query=cast(GetDataQuery, query or {}),
                include_qc_flags=include_qc_flags is not False,
                page_size=record_page_size or 1500,
            )

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

    def _request_reports(
        self,
        *,
        query: GetReportsQuery,
        page_size: int,
    ) -> Iterator[Report]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:reports',
        )

        iterator = cast(Iterator[Report], self._make_paginated_request(
            url=REPORTS_URL,
            token=access_token,
            query=query,
            page_size=page_size,
        ))

        for report in iterator:
            if report.get('status') == 'COMPLETE':
                yield {
                    **report,
                    'data_exports': [
                        data_export for data_export in report.get('data_exports') or [] if (
                            data_export.get('status') == 'COMPLETE' and
                            data_export.get('record_count') != 0
                        )
                    ],
                    'files': [
                        report_file for report_file in report.get('files') or [] if (
                            report_file.get('type') == 'report_document'
                        )
                    ],
                }

    def _download_report_files(
        self,
        files_to_download: List[Tuple[str, str]],
        *,
        max_concurrency: int,
    ) -> List[Optional[str]]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:reports',
        )

        def download_report_file(
            file_to_download: Tuple[str, str],
        ) -> Optional[str]:
            url, destination = file_to_download

            resp = self._make_request(
                url=url,
                token=access_token,
            )[0]

            result: Optional[str] = None

            if resp and resp.get('url'):
                result = download_file(
                    resp['url'],
                    destination,
                    timeout=self._options.get('request_timeout'),
                )

            return result

        return run_concurrently(
            download_report_file,
            files_to_download,
            max_concurrency=max_concurrency,
        )

    def _request_data_files(
        self,
        *,
        query: GetDataFilesQuery,
        page_size: int,
    ) -> Iterator[DataFile]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:data',
        )

        iterator = cast(Iterator[DataFile], self._make_paginated_request(
            url=DATA_URL,
            token=access_token,
            query={
                **query,
                'records_limit': 0,
            },
            page_size=page_size,
        ))

        return iterator

    def _include_data_records(
        self,
        file_iterator: Iterator[DataFile],
        *,
        query: GetDataQuery,
        include_qc_flags: bool,
        page_size: int,
    ) -> Iterator[DataFileWithRecords]:
        for data_file in file_iterator:
            records_query: GetDataRecordsQuery = {
                'filename': data_file['filename'],
                'limit': query.get('records_limit'),
                'before': query.get('records_before'),
                'after': query.get('records_after'),
            }

            records_iterator = self._request_data_records(
                query=records_query,
                page_size=page_size,
            )

            if include_qc_flags:
                records_iterator = self._include_qc_flags(
                    records_iterator,
                    query=records_query,
                    page_size=page_size,
                )

            yield {
                **data_file,
                'records': records_iterator,
            }

    def _include_qc_flags(
        self,
        data_iterator: Iterator[DataRecord],
        *,
        query: GetDataRecordsQuery,
        page_size: int,
    ) -> Iterator[DataRecord]:
        qc_iterator = self._request_data_qc(
            query=query,
            page_size=page_size,
        )

        data_record: Optional[DataRecord] = None
        qc_record: Optional[QCRecord] = None

        while True:
            data_record = data_record or next(data_iterator, None)
            qc_record = qc_record or next(qc_iterator, None)

            if data_record:
                if qc_record and data_record['timestamp'] == qc_record['timestamp']:
                    yield {
                        **data_record,
                        'qc_flags': qc_record['qc_flags'],
                    }

                    data_record = None
                    qc_record = None
                elif not qc_record or data_record['timestamp'] > qc_record['timestamp']:
                    yield data_record

                    data_record = None
                else:
                    qc_record = None
            else:
                break

    def _request_data_records(
        self,
        *,
        query: GetDataRecordsQuery,
        page_size: int,
    ) -> Iterator[DataRecord]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:data',
        )

        records_limit = query.get('limit')

        if not (records_limit or (query.get('before') and query.get('after'))):
            records_limit = 1

        request_limit = min(records_limit or float('inf'), page_size)
        last_timestamp = ''

        while True:
            results, _ = self._make_request(
                url=DATA_URL,
                token=access_token,
                query={
                    'filename': query['filename'],
                    'limit': 1,
                    'records_limit': request_limit,
                    'records_before': last_timestamp or query.get('before'),
                    'records_after': query.get('after'),
                },
            )

            if results and results[0].get('records'):
                records = cast(List[DataRecord], results[0]['records'])

                if last_timestamp and records[0]['timestamp'] == last_timestamp:
                    records = records[1:]

                if records_limit and len(records) > records_limit:
                    records = records[:records_limit]

                yield from records

                if records_limit:
                    records_limit -= len(records)

                    if records_limit <= 0:
                        break

                if len(results[0]['records']) == request_limit:
                    request_limit = min((records_limit or float('inf')) + 1, page_size)
                    last_timestamp = records[-1]['timestamp']
                else:
                    break
            else:
                break

    def _request_data_qc(
        self,
        *,
        query: GetDataQCQuery,
        page_size: int,
    ) -> Iterator[QCRecord]:
        access_token = get_access_token(
            refresh_token=self._refresh_token,
            platform=self._platform,
            scope='read:qc',
        )

        records_limit = query.get('limit')

        if not (records_limit or (query.get('before') and query.get('after'))):
            records_limit = 1

        request_limit = min(records_limit or float('inf'), page_size)
        last_timestamp = ''

        while True:
            results, _ = self._make_request(
                url=QC_URL,
                token=access_token,
                query={
                    'filename': query['filename'],
                    'limit': request_limit,
                    'before': last_timestamp or query.get('before'),
                    'after': query.get('after'),
                },
            )

            if results:
                records = cast(List[QCRecord], results)

                if last_timestamp and records[0]['timestamp'] == last_timestamp:
                    records = records[1:]

                if records_limit and len(records) > records_limit:
                    records = records[:records_limit]

                yield from records

                if records_limit:
                    records_limit -= len(records)

                    if records_limit <= 0:
                        break

                if len(results) == request_limit:
                    request_limit = min((records_limit or float('inf')) + 1, page_size)
                    last_timestamp = records[-1]['timestamp']
                else:
                    break
            else:
                break

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
