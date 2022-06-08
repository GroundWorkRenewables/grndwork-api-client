import {Headers} from 'node-fetch';
import {makePaginatedRequest} from '../src_js/grndwork_api_client/make_paginated_request';
import {makeRequest} from '../src_js/grndwork_api_client/make_request';

jest.mock('../src_js/grndwork_api_client/make_request');

const API_URL = 'https://api.grndwork.com/v1/tokens';

describe('makePaginatedRequest', () => {
  beforeEach(() => {
    async function makeRequestMock(
      options: {query?: {limit?: number, offset?: number}},
    ): Promise<[Array<{id: number}>, Headers]> {
      const {query = {}} = options;
      const limit = query.limit || 100;
      const offset = query.offset || 0;
      const first = offset + 1;
      const last = Math.min(offset + limit, 165);

      return [
        generateItems(first, last + 1),
        new Headers({'Content-Range': `items ${ first }-${ last }/165`}),
      ];
    }

    (makeRequest as jest.Mock).mockImplementation(makeRequestMock);
  });

  afterEach(() => jest.clearAllMocks());

  it('makes requests', async () => {
    const results = await consumeItems(makePaginatedRequest({
      url: API_URL,
      token: 'auth token',
    }));

    const {mock} = (makeRequest as jest.Mock);

    expect(mock.calls.length).toEqual(2);
    expect(mock.calls[0][0].query).toEqual({limit: 100, offset: 0});
    expect(mock.calls[1][0].query).toEqual({limit: 100, offset: 100});

    expect(results).toEqual(generateItems(1, 166));
  });

  it('makes requests with limit', async () => {
    const results = await consumeItems(makePaginatedRequest({
      url: API_URL,
      token: 'auth token',
      query: {
        limit: 155,
      },
    }));

    const {mock} = (makeRequest as jest.Mock);

    expect(mock.calls.length).toEqual(2);
    expect(mock.calls[0][0].query).toEqual({limit: 100, offset: 0});
    expect(mock.calls[1][0].query).toEqual({limit: 55, offset: 100});

    expect(results).toEqual(generateItems(1, 156));
  });

  it('makes requests with offset', async () => {
    const results = await consumeItems(makePaginatedRequest({
      url: API_URL,
      token: 'auth token',
      query: {
        limit: 155,
        offset: 5,
      },
    }));

    const {mock} = (makeRequest as jest.Mock);

    expect(mock.calls.length).toEqual(2);
    expect(mock.calls[0][0].query).toEqual({limit: 100, offset: 5});
    expect(mock.calls[1][0].query).toEqual({limit: 55, offset: 105});

    expect(results).toEqual(generateItems(6, 161));
  });

  it('makes requests with page size', async () => {
    const results = await consumeItems(makePaginatedRequest({
      url: API_URL,
      token: 'auth token',
      query: {
        limit: 155,
        offset: 5,
      },
    }, 50));

    const {mock} = (makeRequest as jest.Mock);

    expect(mock.calls.length).toEqual(4);
    expect(mock.calls[0][0].query).toEqual({limit: 50, offset: 5});
    expect(mock.calls[1][0].query).toEqual({limit: 50, offset: 55});
    expect(mock.calls[2][0].query).toEqual({limit: 50, offset: 105});
    expect(mock.calls[3][0].query).toEqual({limit: 5, offset: 155});

    expect(results).toEqual(generateItems(6, 161));
  });

  function generateItems(start: number, end: number): Array<{id: number}> {
    const items = [];

    for (let item = start; item < end; item += 1) {
      items.push({id: item});
    }

    return items;
  }

  async function consumeItems<T>(iterable: AsyncIterableIterator<T>): Promise<Array<T>> {
    const items = [];

    for await (const item of iterable) {
      items.push(item);
    }

    return items;
  }
});
