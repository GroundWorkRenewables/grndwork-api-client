import platform

from .version import version


def get_user_agent() -> str:
    client = f'grndwork-api-client/{version}'
    runtime = f'{platform.python_implementation().lower()}/{platform.python_version()}'
    system = f'{platform.system().lower()}/{platform.release()}'
    arch = platform.machine()

    return f'{client} ({runtime}; {system}; {arch})'
