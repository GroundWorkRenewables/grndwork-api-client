import fetch from 'node-fetch';
import {makeRequest, makePaginatedRequest, parseContentRange} from '../src_js/makeRequest';
import {ServerError} from '../src_js/ServerError';

jest.mock('node-fetch');

const {Response} = jest.requireActual('node-fetch');

describe('makeRequest', () => {
  const API_URL = 'https://api.grndwork.com/v1/tokens';

  beforeEach(() => {
    (fetch as unknown as jest.Mock).mockReturnValue(new Response(JSON.stringify({
      token: 'access_token',
    }), {
      headers: {
        'content-type': 'application/json',
      },
    }));
  });

  afterEach(() => jest.clearAllMocks());

  it('makes request', async () => {
    await makeRequest({
      url: API_URL,
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'GET',
      headers: {},
    });
  });

  it('makes request with query params', async () => {
    await makeRequest({
      url: API_URL,
      query: {
        limit: 10,
      },
    });

    expect(fetch).toHaveBeenCalledWith(new URL(`${ API_URL }?limit=10`), {
      method: 'GET',
      headers: {},
    });
  });

  it('makes request with method', async () => {
    await makeRequest({
      url: API_URL,
      method: 'POST',
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {},
    });
  });

  it('makes request with body', async () => {
    await makeRequest({
      url: API_URL,
      method: 'POST',
      body: {
        test: 'test',
      },
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'test',
      }),
    });
  });

  it('makes request with auth token', async () => {
    await makeRequest({
      url: API_URL,
      method: 'POST',
      body: {
        test: 'test',
      },
      token: 'refresh_token',
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer refresh_token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'test',
      }),
    });
  });

  it('makes request with additional headers', async () => {
    await makeRequest({
      url: API_URL,
      method: 'POST',
      headers: {
        'X-Test': 'test_value',
      },
      body: {
        test: 'test',
      },
      token: 'refresh_token',
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer refresh_token',
        'Content-Type': 'application/json',
        'X-Test': 'test_value',
      },
      body: JSON.stringify({
        test: 'test',
      }),
    });
  });

  it('parses the response body', async () => {
    expect(await makeRequest({
      url: API_URL,
      method: 'POST',
      token: 'refresh_token',
    })).toStrictEqual([{
      token: 'access_token',
    }, {'content-type': 'application/json'}]);
  });

  it('handles bad response body', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(new Response('bad json', {
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    await expect(() => makeRequest({
      url: API_URL,
      method: 'POST',
      token: 'refresh_token',
    })).rejects.toThrow(ServerError);
  });

  it('handles bad response', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(new Response(JSON.stringify({
      errors: [{
        field: 'test',
        message: 'error message',
      }],
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    await expect(() => makeRequest({
      url: API_URL,
      method: 'POST',
      token: 'refresh_token',
    })).rejects.toThrow(ServerError);
  });
});

describe('makePaginatedRequest', () => {
  const API_URL = 'https://api.grndwork.com/v1/tokens';

  afterEach(() => jest.clearAllMocks());

  it('updates offset and limit', async () => {
    (fetch as unknown as jest.Mock)
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 20}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 6-25/65',
        },
      }),
    )
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 20}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 26-45/65',
        },
      }),
    )
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 20}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 46-65/65',
        },
      }),
    );

    const token = 'token';
    const url = API_URL;
    const query = {offset: 5};
    const pageSize = 20;

    const records = [];
    for await (const result of makePaginatedRequest(
      token,
      url,
      pageSize,
      query,
    )
    ) {
      records.push(result);
    }

    expect(records.length).toEqual(60);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('updates returns_when_last_record_reached', async () => {
    (fetch as unknown as jest.Mock)
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 20}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 6-25/25',
        },
      }),
    );

    const token = 'token';
    const url = API_URL;
    const query = {offset: 5};
    const pageSize = 20;

    const records = [];
    for await (const result of makePaginatedRequest(
      token,
      url,
      pageSize,
      query,
    )) {
      records.push(result);
    }

    expect(records.length).toEqual(20);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('updates returns_when_limit_reached', async () => {
    (fetch as unknown as jest.Mock)
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 20}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 1-20/105',
        },
      }),
    )
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 20}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 21-40/105',
        },
      }),
    )
    .mockReturnValueOnce(
      new Response(JSON.stringify(
        Array.from({length: 1}, (x, i) => i),
      ), {
        headers: {
          'Content-Type': 'application/json',
          'content-range': 'items 41-60/105',
        },
      }),
    );

    const token = 'token';
    const url = API_URL;
    const query = {offset: 0, limit: 41};
    const pageSize = 20;

    const records = [];
    for await (const result of makePaginatedRequest(
      token,
      url,
      pageSize,
      query,
    )) {
      records.push(result);
    }
    expect(records.length).toEqual(41);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

describe('parses content range', () => {
  it.each([
    [{'content-range': 'items 1-1/1'}, {first: 1, last: 1, count: 1}],
    [{'content-range': 'items 1-20/65'}, {first: 1, last: 20, count: 65}],
    [{'content-range': 'items 6-25/65'}, {first: 6, last: 25, count: 65}],
  ])(
    'Correctly parses content range',
    (headers, result) => {
      expect(parseContentRange(headers)).toEqual(result);
    },
  );
});
