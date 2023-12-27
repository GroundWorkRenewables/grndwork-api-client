from dataclasses import dataclass
import re

from .make_request import Response


@dataclass
class ContentRange:
    first: int
    last: int
    count: int
    unit: str

    _pattern = re.compile(r'^(\w+) (\d+)-(\d+)\/(\d+)$')

    @classmethod
    def parse(cls, resp: Response) -> 'ContentRange':
        header = resp['headers'].get('content-range')

        if header and isinstance(header, str):
            result = cls._pattern.search(header)

            if result:
                unit, first, last, count = result.groups()

                return ContentRange(
                    first=int(first),
                    last=int(last),
                    count=int(count),
                    unit=unit,
                )

            raise ValueError('Could not parse content range')

        else:
            raise ValueError('Missing content range')
