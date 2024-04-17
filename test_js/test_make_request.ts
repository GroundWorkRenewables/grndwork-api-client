import * as undici from 'undici';
import {API_URL} from '../src_js/grndwork_api_client/config';
import {makeRequest, RequestError} from '../src_js/grndwork_api_client/make_request';

const TEST_URL = `${API_URL}/v1/test`;

describe('makeRequest', () => {
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

  it('makes request with token', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      headers: {Authorization: 'Bearer auth_token'},
    })
    .reply(200, {});

    await makeRequest({
      url: TEST_URL,
      token: 'auth_token',
    });
  });

  it('makes request with additional headers', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      headers: {'X-Test': 'test_value'},
    })
    .reply(200, {});

    await makeRequest({
      url: TEST_URL,
      headers: {
        'X-Test': 'test_value',
      },
    });
  });

  it('makes request with query', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      query: {limit: 10},
    })
    .reply(200, {});

    await makeRequest({
      url: TEST_URL,
      query: {limit: 10},
    });
  });

  it('makes request with method', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      method: 'POST',
    })
    .reply(201, {});

    await makeRequest({
      url: TEST_URL,
      method: 'POST',
    });
  });

  it('makes request with body', async () => {
    apiMock.intercept({
      path: TEST_PATH,
      method: 'POST',
      body: JSON.stringify({test: 'value'}),
    })
    .reply(201, {});

    await makeRequest({
      url: TEST_URL,
      method: 'POST',
      body: {
        test: 'value',
      },
    });
  });

  it('throws error when bad request', async () => {
    apiMock.intercept({
      path: TEST_PATH,
    })
    .reply(400, {});

    await expect(
      () => makeRequest({
        url: TEST_URL,
      }),
    ).rejects.toThrow(new RequestError('Bad Request'));
  });

  it('throws error with response body', async () => {
    apiMock.intercept({
      path: TEST_PATH,
    })
    .reply(400, {message: 'Invalid'}, {
      headers: {
        'content-type': 'application/json',
      },
    });

    await expect(
      () => makeRequest({
        url: TEST_URL,
      }),
    ).rejects.toThrow(new RequestError('Invalid'));
  });

  it('throws error when bad response body', async () => {
    apiMock.intercept({
      path: TEST_PATH,
    })
    .reply(200, 'Invalid');

    await expect(
      () => makeRequest({
        url: TEST_URL,
      }),
    ).rejects.toThrow(new RequestError('Failed to parse response payload'));
  });

  it('returns payload and response', async () => {
    apiMock.intercept({
      path: TEST_PATH,
    })
    .reply(200, {test: 'value'}, {
      headers: {
        'X-Test': 'test_value',
      },
    });

    const [payload, resp] = await makeRequest({
      url: TEST_URL,
    });

    expect(payload).toEqual({test: 'value'});
    expect(resp.status_code).toEqual(200);
    expect(resp.headers['x-test']).toEqual('test_value');
  });
});
