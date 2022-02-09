from typing import Any, Dict, List, Optional

from .access_tokens import get_access_token
from .config import DATA_URL, STATIONS_URL
from .config import get_refresh_token
from .dtos import DataFile, Station
from .make_request import make_request


LOGGERNET_PLATFORM = 'loggernet'
TRACE_PLATFORM = 'trace'


class Client():

    def __init__(
        self,
        platform: Optional[str] = None,
    ) -> None:
        self.refresh_token: Dict[str, Any] = get_refresh_token()
        self.platform: str = platform if platform else LOGGERNET_PLATFORM

        if not self.refresh_token:
            raise OSError('Could not get refresh token from environment')

    def get_stations(
        self,
        query: Dict[str, Any],
    ) -> List[Station]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:stations',
        )
        result: List[Station] = make_request(
            url=STATIONS_URL,
            method='GET',
            query=query,
            token=access_token,
        )
        return result

    def get_data(
        self,
        query: Dict[str, Any],
    ) -> List[DataFile]:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='read:data',
        )
        result: List[DataFile] = make_request(
            url=DATA_URL,
            method='GET',
            query=query,
            token=access_token,
        )
        return result

    def post_data(
        self,
        payload: Dict[str, Any],
    ) -> Any:
        access_token = get_access_token(
            refresh_token=self.refresh_token,
            platform=self.platform,
            scope='write:data',
        )
        result = make_request(
            url=DATA_URL,
            method='POST',
            body=payload,
            token=access_token,
        )
        return result
