from dataclasses import dataclass
from typing import Any, Dict, List, Optional


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
    site_uuid: str  # shouldn't this be a uuid?
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
