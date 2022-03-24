from .client import Client
from .config import get_refresh_token
from .dtos import (
    DataFile,
    DataFileHeaders,
    DataRecord,
    GetDataQuery,
    GetStationsQuery,
    PostDataPayload,
    RefreshToken,
    Station,
)

LOGGERNET_PLATFORM = 'loggernet'
TRACE_PLATFORM = 'trace'


def create_client(
    platform: str = LOGGERNET_PLATFORM,
) -> Client:
    refresh_token: RefreshToken = get_refresh_token()
    return Client(
        refresh_token=refresh_token,
        platform=platform,
    )


__all__ = [
    'LOGGERNET_PLATFORM',
    'TRACE_PLATFORM',
    'create_client',
    'Client',
    'RefreshToken',
    'GetStationsQuery',
    'GetDataQuery',
    'PostDataPayload',
    'Station',
    'DataFile',
    'DataFileHeaders',
    'DataRecord',
]
