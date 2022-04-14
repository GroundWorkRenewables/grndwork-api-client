import jwt from 'jsonwebtoken';
import {makeRequest} from '../src_js/makeRequest';
import {getAccessToken, resetAccessTokenCache} from '../src_js/accessTokens';

jest.mock('jsonwebtoken');
jest.mock('../src_js/makeRequest');

describe('getAccessToken', () => {
  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  beforeEach(() => {
    resetAccessTokenCache();

    (jwt.decode as jest.Mock).mockReturnValue({
      exp: new Date().getTime() + 1000,
    });

    (makeRequest as jest.Mock).mockResolvedValue(
      [
        {token: 'access_token'}, {},
      ],
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('requests a new access token', async () => {
    const accessToken = await getAccessToken(refreshToken, 'platform', 'read:data');

    expect(accessToken).toEqual('access_token');

    expect(makeRequest).toHaveBeenCalledWith({
      url: 'https://api.grndwork.com/v1/tokens',
      method: 'POST',
      body: {
        subject: 'uuid',
        platform: 'platform',
        scope: 'read:data',
      },
      token: 'refresh_token',
    });

    expect(makeRequest).toHaveBeenCalledTimes(1);
  });

  it('does not request new access token when using cache', async () => {
    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'platform', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(1);
  });

  it('requests a new access token for other platform', async () => {
    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'other', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(2);
  });

  it('requests a new access token for other scope', async () => {
    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'platform', 'write:data');

    expect(makeRequest).toHaveBeenCalledTimes(2);
  });

  it('requests a new access token when existing has expired', async () => {
    (jwt.decode as jest.Mock).mockReturnValueOnce({
      exp: Math.floor(Date.now() / 1000),
    });

    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'platform', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(2);
  });
});
