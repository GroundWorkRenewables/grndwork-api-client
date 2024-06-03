from typing import Optional

from .client import Client
from .config import get_refresh_token
from .errors import AuthError, RequestError
from .interfaces import (
    ClientOptions,
    DataFile,
    DataFileHeaders,
    DataFileWithRecords,
    DataRecord,
    GetDataFilesQuery,
    GetDataQCQuery,
    GetDataQuery,
    GetDataRecordsQuery,
    GetStationsQuery,
    PostDataFile,
    PostDataPayload,
    PostDataRecord,
    ProjectManager,
    QCRecord,
    RefreshToken,
    Station,
    StationDataFile,
    StationWithDataFiles,
)

LOGGERNET_PLATFORM = 'loggernet'
TRACE_PLATFORM = 'trace'


def create_client(
    platform: Optional[str] = None,
    options: Optional[ClientOptions] = None,
) -> Client:
    return Client(
        get_refresh_token(),
        platform or LOGGERNET_PLATFORM,
        options or {},
    )


__all__ = [
    # Api client
    'create_client',
    'Client',

    # Platform constants
    'LOGGERNET_PLATFORM',
    'TRACE_PLATFORM',

    # Interfaces
    'DataFile',
    'DataFileHeaders',
    'DataFileWithRecords',
    'DataRecord',
    'GetDataFilesQuery',
    'GetDataQCQuery',
    'GetDataQuery',
    'GetDataRecordsQuery',
    'GetStationsQuery',
    'PostDataFile',
    'PostDataPayload',
    'PostDataRecord',
    'ProjectManager',
    'QCRecord',
    'RefreshToken',
    'Station',
    'StationDataFile',
    'StationWithDataFiles',

    # Errors
    'AuthError',
    'RequestError',
]
