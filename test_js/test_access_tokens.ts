import jwt from 'jsonwebtoken';
import {getAccessToken, resetAccessTokenCache} from '../src_js/grndwork_api_client/access_tokens';
import {makeRequest} from '../src_js/grndwork_api_client/make_request';

jest.mock('jsonwebtoken');
jest.mock('../src_js/grndwork_api_client/make_request');

describe('getAccessToken', () => {
  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  beforeEach(() => {
    resetAccessTokenCache();

    (jwt.decode as jest.Mock).mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    (makeRequest as jest.Mock).mockResolvedValue([{
      token: 'access_token',
    }]);
  });

  afterEach(() => jest.clearAllMocks());

  it('requests new access token', async () => {
    const accessToken = await getAccessToken(refreshToken, 'platform', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(1);

    expect(makeRequest).toHaveBeenCalledWith({
      url: 'https://api.grndwork.com/v1/tokens',
      token: 'refresh_token',
      method: 'POST',
      body: {
        subject: 'uuid',
        platform: 'platform',
        scope: 'read:data',
      },
    });

    expect(accessToken).toEqual('access_token');
  });

  it('does not request new access token when using cache', async () => {
    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'platform', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(1);
  });

  it('requests new access token for other platform', async () => {
    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'other', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(2);
  });

  it('requests new access token for other scope', async () => {
    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'platform', 'write:data');

    expect(makeRequest).toHaveBeenCalledTimes(2);
  });

  it('requests new access token when existing has expired', async () => {
    (jwt.decode as jest.Mock).mockReturnValueOnce({
      exp: Math.floor(Date.now() / 1000) - 1000,
    });

    await getAccessToken(refreshToken, 'platform', 'read:data');
    await getAccessToken(refreshToken, 'platform', 'read:data');

    expect(makeRequest).toHaveBeenCalledTimes(2);
  });
});
