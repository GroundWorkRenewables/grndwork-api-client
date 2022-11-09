import {ContentRange} from '../src_js/grndwork_api_client/content_range';

describe('ContentRange', () => {
  describe('parse', () => {
    it.each([
      ['items 1-1/1', new ContentRange(1, 1, 1, 'items')],
      ['items 1-20/65', new ContentRange(1, 20, 65, 'items')],
      ['items 6-25/65', new ContentRange(6, 25, 65, 'items')],
    ])('parses content range', (header, expected) => {
      expect(ContentRange.parse(header)).toEqual(expected);
    });

    it.each([
      ['', 'Missing content range'],
      ['items', 'Could not parse content range'],
      ['items a-b/c', 'Could not parse content range'],
    ])('throws error when invalid', (header, error) => {
      expect(() => ContentRange.parse(header)).toThrow(error);
    });
  });
});
