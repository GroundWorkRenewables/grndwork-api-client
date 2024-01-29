export function runConcurrently<T, K>(
  func: (arg: T) => Promise<K>,
  iterable: Iterable<T>,
  maxConcurrency: number,
): Promise<Array<K>> {
  const iterator = iterable[Symbol.iterator]();
  const promises: Array<Promise<K>> = [];

  let count = 0;

  function next(): void {
    const {value, done} = iterator.next();

    if (!done) {
      count += 1;

      promises.push((async () => {
        try {
          return await func(value);
        } finally {
          count -= 1;
          next();
        }
      })());

      if (count < maxConcurrency) {
        next();
      }
    }
  }

  next();

  return (async () => {
    const results: Array<K> = [];

    while (true) {
      const promise = promises.shift();

      if (promise) {
        results.push(await promise);
      } else {
        break;
      }
    }

    return results;
  })();
}
