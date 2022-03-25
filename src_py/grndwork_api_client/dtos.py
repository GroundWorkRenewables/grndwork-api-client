from dataclasses import dataclass
from typing import Any, Dict, List, Optional, TypedDict


@dataclass
class DataFileHeaders():
    meta: Dict[str, Any]
    columns: List[str]
    units: List[str]
    processing: List[str]


@dataclass
class DataRecord():
    timestamp: str
    record_num: int
    data: Dict[str, Any]


@dataclass
class DataFile():
    source: str
    filename: str
    is_stale: bool
    headers: DataFileHeaders
    records: List[DataRecord]


@dataclass
class Station():
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
    data_files: List[DataFile]


class GetStationsQuery(TypedDict):
    client: str
    site: str
    station: str
    limit: int
    offset: int


class GetDataQuery(TypedDict):
    client: str
    site: str
    gateway: str
    station: str
    filename: str
    limit: int
    offset: int
    records_before: str
    records_after: str
    records_limit: str


class PostDataPayload(TypedDict):
    source: str
    files: List[DataFile]
    overwrite: bool


class PostTokenPayload(TypedDict):
    subject: str
    platform: str
    scope: str


class RefreshToken(TypedDict):
    subject: str
    token: str
