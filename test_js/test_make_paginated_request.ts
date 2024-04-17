import * as undici from 'undici';
import {API_URL} from '../src_js/grndwork_api_client/config';
import {makePaginatedRequest} from '../src_js/grndwork_api_client/make_paginated_request';
import {RequestError} from '../src_js/grndwork_api_client/make_request';

const TEST_URL = `${API_URL}/v1/test`;

describe('makePaginatedRequest', () => {
  const TEST_PATH = new URL(TEST_URL).pathname;

  let globalAgent: undici.Dispatcher;
  let mockAgent: undici.MockAgent;
  let apiMock: undici.MockPool;

  beforeEach(() => {
    globalAgent = undici.getGlobalDispatcher();

    mockAgent = new undici.MockAgent();
    mockAgent.disableNetConnect();
    undici.setGlobalDispatcher(mockAgent);

    apiMock = mockAgent.get(API_URL);
  });

  afterEach(async () => {
    undici.setGlobalDispatcher(globalAgent);
    mockAgent.assertNoPendingInterceptors();
    await mockAgent.close();
  });

  it('makes requests', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 100, offset: 0},
    })
    .reply(replyCallback);

    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 100, offset: 100},
    })
    .reply(replyCallback);

    const results = await consumeItems(makePaginatedRequest({
      url: TEST_URL,
      page_size: 100,
    }));

    expect(results).toEqual(generateItems(1, 166));
  });

  it('makes requests with limit', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 100, offset: 0},
    })
    .reply(replyCallback);

    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 55, offset: 100},
    })
    .reply(replyCallback);

    const results = await consumeItems(makePaginatedRequest({
      url: TEST_URL,
      query: {limit: 155},
      page_size: 100,
    }));

    expect(results).toEqual(generateItems(1, 156));
  });

  it('makes requests with offset', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 100, offset: 5},
    })
    .reply(replyCallback);

    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 55, offset: 105},
    })
    .reply(replyCallback);

    const results = await consumeItems(makePaginatedRequest({
      url: TEST_URL,
      query: {limit: 155, offset: 5},
      page_size: 100,
    }));

    expect(results).toEqual(generateItems(6, 161));
  });

  it('makes requests with page size', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 50, offset: 0},
    })
    .reply(replyCallback);

    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 50, offset: 50},
    })
    .reply(replyCallback);

    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 50, offset: 100},
    })
    .reply(replyCallback);

    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 50, offset: 150},
    })
    .reply(replyCallback);

    const results = await consumeItems(makePaginatedRequest({
      url: TEST_URL,
      page_size: 50,
    }));

    expect(results).toEqual(generateItems(1, 166));
  });

  it('handles empty results', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 100, offset: 0},
    })
    .reply(200, []);

    const results = await consumeItems(makePaginatedRequest({
      url: TEST_URL,
      page_size: 100,
    }));

    expect(results).toEqual([]);
  });

  it('throws when invalid content range', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 100, offset: 100},
    })
    .reply(200, generateItems(101, 166), {
      headers: {
        'content-range': 'items 1-100/165',
      },
    });

    await expect(
      () => consumeItems(makePaginatedRequest({
        url: TEST_URL,
        query: {limit: 100, offset: 100},
        page_size: 100,
      })),
    ).rejects.toThrow(new RequestError('Invalid content range'));
  });
});

function replyCallback(options: {path: string}): {
  statusCode: number,
  data: string,
  responseOptions: {
    headers: Record<string, string>,
  },
} {
  const query = new URL(options.path, API_URL).searchParams;

  const limit = parseInt(query.get('limit') || '100', 10);
  const offset = parseInt(query.get('offset') || '0', 10);

  const first = offset + 1;
  const last = Math.min(offset + limit, 165);

  return {
    statusCode: 200,
    data: JSON.stringify(
      generateItems(first, last + 1),
    ),
    responseOptions: {
      headers: {
        'content-range': `items ${first}-${last}/165`,
      },
    },
  };
}

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
