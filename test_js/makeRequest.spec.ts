import fetch from 'node-fetch';
import {makeRequest} from '../src_js/grndwork_api_client/makeRequest';
import {ServerError} from '../src_js/grndwork_api_client/ServerError';

jest.mock('node-fetch');

const {Response} = jest.requireActual('node-fetch');

describe('makeRequest', () => {
  const API_URL = 'https://api.grndwork.com/v1/tokens';

  beforeEach(() => {
    (fetch as unknown as jest.Mock).mockReturnValue(new Response(JSON.stringify({
      token: 'access_token',
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    }));
  });

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
    })).toStrictEqual({
      token: 'access_token',
    });
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
