import pytest
from src_py.grndwork_api_client.utils import strip_uuid


def describe_strip_uuid():
    @pytest.mark.parametrize('filename,expected', [
        ('', ''),
        ('Report', 'Report'),
        ('Report.pdf', 'Report.pdf'),
        ('Report_1234.pdf', 'Report_1234.pdf'),
        ('Report_1234abcd-1234-abcd-1234-abcd1234abcd', 'Report'),
        ('Report_1234abcd-1234-abcd-1234-abcd1234abcd.pdf', 'Report.pdf'),
        ('Report1234abcd-1234-abcd-1234-abcd1234abcd.pdf', 'Report.pdf'),
    ])
    def it_returns_filename_without_uuid(filename, expected):
        assert strip_uuid(filename) == expected
