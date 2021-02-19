import fetch from 'node-fetch';
import {makeRequest} from '../src/makeRequest';
import {DATA_URL} from '../src/config';

jest.mock('node-fetch');
const {Response} = jest.requireActual('node-fetch');

describe('makeRequest', () => {
  beforeEach(() => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      new Response(
        JSON.stringify([{response_param: 'response_value'}]),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );
  });

  it('makes request with token', () => {
    makeRequest({token: 'token', url: DATA_URL, method: 'GET'});

    expect(fetch).toHaveBeenCalledWith(
      new URL(DATA_URL),
      {
        body: '',
        headers: {
          Authorization: 'Bearer token',
        },
        method: 'GET',
      },
    );
  });

  it('makes request with query params', () => {
    makeRequest({
      method: 'GET',
      query: {
        limit: 10,
      },
      token: 'token',
      url: DATA_URL,
    });

    expect(fetch).toHaveBeenCalledWith(
      new URL(`${ DATA_URL }?limit=10`),
      {
        body: '',
        headers: {
          Authorization: 'Bearer token',
        },
        method: 'GET',
      },
    );
  });

  it('makes request with headers', () => {
    makeRequest({
      headers: {
        test_header: 'test_value',
      },
      method: 'GET',
      token: 'token',
      url: DATA_URL,
    });

    expect(fetch).toHaveBeenCalledWith(
      new URL(DATA_URL),
      {
        body: '',
        headers: {
          Authorization: 'Bearer token',
          test_header: 'test_value',
        },
        method: 'GET',
      },
    );
  });

  it('makes request with body', () => {
    makeRequest({
      body: {test: 'test'},
      method: 'POST',
      url: DATA_URL,
      token: 'token',
    });

    expect(fetch).toHaveBeenCalledWith(
      new URL(DATA_URL),
      {
        body: JSON.stringify({test: 'test'}),
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
  });

  it('parses the response body', async () => {
    const result = await makeRequest({
      body: {test: 'test'},
      method: 'POST',
      token: 'token',
      url: DATA_URL,
    });

    expect(result).toStrictEqual([{response_param: 'response_value'}]);
  });

  it('handles bad response body', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      new Response(
        'bad json',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await expect(() => makeRequest({
      body: {test: 'test'},
      method: 'POST',
      token: 'token',
      url: DATA_URL,
    })).rejects.toBeTruthy();
  });
});
