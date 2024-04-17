export class IterableResponse<T> implements AsyncIterable<T> {
  constructor(
    private readonly iterator: AsyncIterator<T>,
  ) {}

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.iterator;
  }

  public async toArray(): Promise<Array<T>> {
    const items = [];

    for await (const item of this) {
      items.push(item);
    }

    return items;
  }
}
