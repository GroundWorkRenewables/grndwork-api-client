from typing import Dict, List, Optional, TypedDict, Union


class RefreshToken(TypedDict):
    subject: str
    token: str


class AccessToken(TypedDict):
    token: str


DataValue = Union[float, int, str, bool, None]


class DataRecord(TypedDict):
    timestamp: str
    record_num: int
    data: Dict[str, DataValue]


class _DataFileHeadersRequired(TypedDict):
    columns: List[str]
    units: List[str]


class DataFileHeaders(_DataFileHeadersRequired, total=False):
    meta: Dict[str, str]
    processing: List[str]


class _DataFileRequired(TypedDict):
    source: str
    filename: str
    is_stale: bool
    headers: DataFileHeaders


class DataFile(_DataFileRequired, total=False):
    records: List[DataRecord]


class StationDataFile(TypedDict):
    filename: str
    is_stale: bool
    headers: DataFileHeaders


class Station(TypedDict):
    client_uuid: str
    client_full_name: str
    client_short_name: str
    site_uuid: str
    site_full_name: str
    station_uuid: str
    station_full_name: str
    description: str
    latitude: int
    longitude: int
    altitude: int
    timezone_offset: Optional[int]
    start_timestamp: Optional[str]
    end_timestamp: Optional[str]
    data_file_prefix: str
    data_files: List[StationDataFile]


class GetStationsQuery(TypedDict, total=False):
    client: str
    site: str
    station: str
    limit: int
    offset: int


class GetDataQuery(TypedDict, total=False):
    client: str
    site: str
    gateway: str
    station: str
    filename: str
    limit: int
    offset: int
    records_before: str
    records_after: str
    records_limit: int


class PostDataRecord(TypedDict):
    timestamp: str
    record_num: int
    data: Dict[str, DataValue]


class _PostDataFileRequired(TypedDict):
    filename: str


class PostDataFile(_PostDataFileRequired, total=False):
    headers: DataFileHeaders
    records: List[PostDataRecord]


class _PostDataPayloadRequired(TypedDict):
    source: str
    files: List[PostDataFile]


class PostDataPayload(_PostDataPayloadRequired, total=False):
    overwrite: bool
