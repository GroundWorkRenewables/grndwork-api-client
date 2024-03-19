from os import makedirs
from os.path import dirname
from shutil import copyfileobj
from typing import Optional

from requests import request, RequestException


class DownloadError(Exception):
    pass


def download_file(
    url: str,
    destination: str,
    *,
    timeout: Optional[float] = None,
) -> str:
    folder = dirname(destination)

    if folder:
        makedirs(folder, exist_ok=True)

    timeout = timeout if timeout is not None else 30.0

    try:
        with request(
            url=url,
            method='GET',
            stream=True,
            timeout=timeout,
        ) as resp:
            resp.raise_for_status()

            with open(destination, 'wb') as out:
                copyfileobj(resp.raw, out)

    except RequestException:
        raise DownloadError('Failed to download file')

    return destination
