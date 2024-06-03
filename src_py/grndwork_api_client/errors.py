from typing import List, Optional

from .interfaces import RequestErrorMessage


class RequestError(Exception):
    name: str
    message: str
    errors: List[RequestErrorMessage]

    def __init__(
        self,
        message: str,
        errors: Optional[List[RequestErrorMessage]] = None,
    ) -> None:
        super().__init__()
        self.name = type(self).__name__
        self.message = message
        self.errors = errors or []

    def __str__(
        self,
    ) -> str:
        lines = [
            f'{self.name}: {self.message}',
        ]

        for error in self.errors:
            field, message = error.get('field'), error.get('message')

            if message:
                lines.append(f'Field "{field}" {message.lower()}' if field else message)

        return '\n'.join(lines)


class AuthError(RequestError):
    pass
