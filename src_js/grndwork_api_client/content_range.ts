export class ContentRange {
  constructor(
    public readonly first: number,
    public readonly last: number,
    public readonly count: number,
    public readonly unit: string,
  ) {}

  public static parse(header: string): ContentRange {
    const result = /^(\w+) (\d+)-(\d+)\/(\d+)$/.exec(header);

    if (result) {
      const [, unit, first, last, count] = result;

      return new ContentRange(
        parseInt(first, 10),
        parseInt(last, 10),
        parseInt(count, 10),
        unit,
      );
    }

    throw new Error('Could not parse content range');
  }
}
