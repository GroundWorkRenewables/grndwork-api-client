from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Iterable, List, TypeVar

_T = TypeVar('_T')
_K = TypeVar('_K')


def run_concurrently(
    func: Callable[[_T], _K],
    iterable: Iterable[_T],
    *,
    max_concurrency: int,
) -> List[_K]:
    if max_concurrency == 1:
        return [
            func(value) for value in iterable
        ]

    with ThreadPoolExecutor(max_workers=max_concurrency) as executor:
        futures = [
            executor.submit(func, value) for value in iterable
        ]

        return [
            future.result() for future in futures
        ]
