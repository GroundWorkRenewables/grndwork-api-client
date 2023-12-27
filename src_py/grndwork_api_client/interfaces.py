from typing import Dict, List, Optional, TypedDict, Union


class RefreshToken(TypedDict):
    subject: str
    token: str


class ClientOptions(TypedDict, total=False):
    request_timeout: float
    request_retries: int
    request_backoff: float


DataValue = Union[float, int, str, bool, None]
QCValue = Union[float, int, str, bool, None]


class _DataRecordRequired(TypedDict):
    timestamp: str
    record_num: int
    data: Dict[str, DataValue]


class DataRecord(_DataRecordRequired, total=False):
    qc_flags: Dict[str, QCValue]


class QCRecord(TypedDict):
    timestamp: str
    qc_flags: Dict[str, QCValue]


class _DataFileHeadersRequired(TypedDict):
    columns: List[str]
    units: List[str]


class DataFileHeaders(_DataFileHeadersRequired, total=False):
    meta: Dict[str, str]
    processing: List[str]


class DataFile(TypedDict):
    source: str
    source_start_timestamp: str | None
    source_end_timestamp: str | None
    filename: str
    is_stale: bool
    headers: DataFileHeaders
    created_at: str
    updated_at: str


class DataFileWithRecords(DataFile, total=False):
    records: List[DataRecord]


class ProjectManager:
    full_name: str
    email: str


class Station(TypedDict):
    client_uuid: str
    client_full_name: str
    client_short_name: str
    site_uuid: str
    site_full_name: str
    station_uuid: str
    station_full_name: str
    description: str
    model: str
    type: str  # noqa: A003
    status: str
    project_manager: ProjectManager | None
    maintenance_frequency: str
    maintenance_log: str
    location_region: str
    latitude: float
    longitude: float
    altitude: float
    timezone_offset: int
    start_timestamp: str | None
    end_timestamp: str | None
    data_file_prefix: str
    created_at: str
    updated_at: str


class StationDataFile(TypedDict):
    filename: str
    is_stale: bool
    headers: DataFileHeaders
    created_at: str
    updated_at: str


class StationWithDataFiles(Station):
    data_files: List[StationDataFile]


class GetStationsQuery(TypedDict, total=False):
    client: Optional[str]
    site: Optional[str]
    station: Optional[str]
    limit: Optional[int]
    offset: Optional[int]


class GetDataQuery(TypedDict, total=False):
    client: Optional[str]
    site: Optional[str]
    gateway: Optional[str]
    station: Optional[str]
    filename: Optional[str]
    limit: Optional[int]
    offset: Optional[int]
    records_limit: Optional[int]
    records_before: Optional[str]
    records_after: Optional[str]


class PostDataRecord(TypedDict):
    timestamp: str
    record_num: int
    data: Dict[str, DataValue]


class _PostDataFileRequired(TypedDict):
    filename: str


class PostDataFile(_PostDataFileRequired, total=False):
    headers: Optional[DataFileHeaders]
    records: Optional[List[PostDataRecord]]


class _PostDataPayloadRequired(TypedDict):
    source: str
    files: List[PostDataFile]


class PostDataPayload(_PostDataPayloadRequired, total=False):
    overwrite: Optional[bool]
