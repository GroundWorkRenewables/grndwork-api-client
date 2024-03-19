import jwt from 'jsonwebtoken';
import * as undici from 'undici';
import {getAccessToken, resetAccessTokenCache} from '../src_js/grndwork_api_client/access_tokens';
import {API_URL, TOKENS_URL} from '../src_js/grndwork_api_client/config';

jest.mock('jsonwebtoken');

describe('getAccessToken', () => {
  const TOKENS_PATH = new URL(TOKENS_URL).pathname;

  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  let globalAgent: undici.Dispatcher;
  let mockAgent: undici.MockAgent;
  let apiMock: undici.MockPool;

  beforeEach(() => {
    resetAccessTokenCache();

    (jwt.decode as jest.Mock).mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    globalAgent = undici.getGlobalDispatcher();

    mockAgent = new undici.MockAgent();
    mockAgent.disableNetConnect();
    undici.setGlobalDispatcher(mockAgent);

    apiMock = mockAgent.get(API_URL);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    undici.setGlobalDispatcher(globalAgent);
    mockAgent.assertNoPendingInterceptors();
    await mockAgent.close();
  });

  it('requests new access token', async () => {
    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      headers: {Authorization: 'Bearer refresh_token'},
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'platform',
        scope: 'test:scope',
      }),
    })
    .reply(201, {
      token: 'access_token',
    });

    const accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token');
  });

  it('does not request new access token when using cache', async () => {
    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
    })
    .reply(201, {
      token: 'access_token',
    });

    let accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token');

    accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token');
  });

  it('requests new access token for other platform', async () => {
    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'platform',
        scope: 'test:scope',
      }),
    })
    .reply(201, {
      token: 'access_token_1',
    });

    let accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token_1');

    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'other',
        scope: 'test:scope',
      }),
    })
    .reply(201, {
      token: 'access_token_2',
    });

    accessToken = await getAccessToken(
      refreshToken,
      'other',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token_2');
  });

  it('requests new access token for other scope', async () => {
    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'platform',
        scope: 'test:scope',
      }),
    })
    .reply(201, {
      token: 'access_token_1',
    });

    let accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token_1');

    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'platform',
        scope: 'other:scope',
      }),
    })
    .reply(201, {
      token: 'access_token_2',
    });

    accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'other:scope',
    );

    expect(accessToken).toEqual('access_token_2');
  });

  it('requests new access token when existing has expired', async () => {
    (jwt.decode as jest.Mock).mockReturnValueOnce({
      exp: Math.floor(Date.now() / 1000) - 1000,
    });

    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'platform',
        scope: 'test:scope',
      }),
    })
    .reply(201, {
      token: 'access_token_1',
    });

    let accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token_1');

    apiMock.intercept({
      path: TOKENS_PATH,
      method: 'POST',
      body: JSON.stringify({
        subject: refreshToken.subject,
        platform: 'platform',
        scope: 'test:scope',
      }),
    })
    .reply(201, {
      token: 'access_token_2',
    });

    accessToken = await getAccessToken(
      refreshToken,
      'platform',
      'test:scope',
    );

    expect(accessToken).toEqual('access_token_2');
  });
});
