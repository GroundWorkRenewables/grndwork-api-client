import {IterableResponse} from '../src_js/grndwork_api_client/iterable_response';

describe('IterableResponse', () => {
  describe('Symbol.asyncIterator', () => {
    it('iterates items in for await loop', async () => {
      async function* iterable(): AsyncIterableIterator<number> {
        yield* [1, 2, 3];
      }

      const response = new IterableResponse(iterable());

      const results = [];

      for await (const item of response) {
        results.push(item);
      }

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('toArray', () => {
    it('returns array from iterator', async () => {
      async function* iterable(): AsyncIterableIterator<number> {
        yield* [1, 2, 3];
      }

      const response = new IterableResponse(iterable());

      expect(await response.toArray()).toEqual([1, 2, 3]);
    });
  });
});
