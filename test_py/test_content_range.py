import pytest
from src_py.grndwork_api_client.content_range import ContentRange


def describe_content_range():
    def describe_parse():
        @pytest.mark.parametrize('header, expected', [
            ('items 1-1/1', ContentRange(first=1, last=1, count=1, unit='items')),
            ('items 1-20/65', ContentRange(first=1, last=20, count=65, unit='items')),
            ('items 6-25/65', ContentRange(first=6, last=25, count=65, unit='items')),
        ])
        def it_parses_content_range(header, expected):
            assert ContentRange.parse(header) == expected

        @pytest.mark.parametrize('header', [
            '',
            'items',
            'items a-b/c',
        ])
        def it_raises_error_when_invalid(header):
            with pytest.raises(ValueError, match='Could not parse content range'):
                ContentRange.parse(header)
