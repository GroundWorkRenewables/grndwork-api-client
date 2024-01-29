import re


def strip_uuid(value: str | None) -> str:
    if value:
        return re.sub(r'_?\w{8}-\w{4}-\w{4}-\w{4}-\w{12}', '', value)

    return ''
