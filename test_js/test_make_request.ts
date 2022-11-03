import fetch from 'node-fetch';
import {TOKENS_URL as API_URL} from '../src_js/grndwork_api_client/config';
import {makeRequest, RequestError} from '../src_js/grndwork_api_client/make_request';

jest.mock('node-fetch');

const {Response} = jest.requireActual('node-fetch');

describe('makeRequest', () => {
  beforeEach(() => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      new Response(JSON.stringify({token: 'access_token'}), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('makes request with auth token', async () => {
    await makeRequest({
      url: API_URL,
      token: 'auth token',
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'GET',
      headers: {
        Authorization: 'Bearer auth token',
      },
    });
  });

  it('makes request with query params', async () => {
    await makeRequest({
      url: API_URL,
      token: 'auth token',
      query: {
        limit: 10,
      },
    });

    expect(fetch).toHaveBeenCalledWith(new URL(`${ API_URL }?limit=10`), {
      method: 'GET',
      headers: {
        Authorization: 'Bearer auth token',
      },
    });
  });

  it('makes request with method', async () => {
    await makeRequest({
      url: API_URL,
      token: 'auth token',
      method: 'POST',
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer auth token',
      },
    });
  });

  it('makes request with body', async () => {
    await makeRequest({
      url: API_URL,
      token: 'auth token',
      method: 'POST',
      body: {
        test: 'test',
      },
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer auth token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({test: 'test'}),
    });
  });

  it('makes request with additional headers', async () => {
    await makeRequest({
      url: API_URL,
      token: 'auth token',
      method: 'POST',
      headers: {
        'X-Test': 'test_value',
      },
      body: {
        test: 'test',
      },
    });

    expect(fetch).toHaveBeenCalledWith(new URL(API_URL), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer auth token',
        'Content-Type': 'application/json',
        'X-Test': 'test_value',
      },
      body: JSON.stringify({test: 'test'}),
    });
  });

  it('throws error when bad request', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      new Response('{}', {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(() => makeRequest({
      url: API_URL,
      token: 'auth token',
    })).rejects.toThrow(new RequestError('Bad Request'));
  });

  it('throws error when bad response body', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      new Response('invalid', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(() => makeRequest({
      url: API_URL,
      token: 'auth token',
    })).rejects.toThrow(new RequestError('Failed to parse response payload'));
  });
});
