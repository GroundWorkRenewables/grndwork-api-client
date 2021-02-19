import jwt from 'jsonwebtoken';
import {LOGGERNET_PLATFORM} from '../src';
import {makeRequest} from '../src/makeRequest';
import {getAccessToken, resetAccessTokenCache} from '../src/accessTokens';

jest.mock('jsonwebtoken');
jest.mock('../src/makeRequest');

describe('tokens', () => {
  const refreshToken = {token: 'refresh_token', subject: 'client:uuid'};

  beforeEach(() => {
    resetAccessTokenCache();
    (jwt.decode as jest.Mock).mockReturnValue({exp: new Date().getTime() + 1000});
    (makeRequest as jest.Mock).mockResolvedValue({token: 'access_token'});
  });

  afterEach(() => jest.clearAllMocks());

  describe('getToken', () => {
    it('requests a new token for unknown scope', async () => {
      const accessToken = await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM);

      expect(makeRequest).toHaveBeenCalledTimes(1);
      expect(makeRequest).toHaveBeenCalledWith(
        {
          body: {
            platform: 'loggernet',
            scope: 'read:data',
            subject: 'client:uuid',
          },
          method: 'POST',
          token: 'refresh_token',
          url: 'https://api.grndwork.com/v1/tokens',
        },
      );
      expect(accessToken).toBe('access_token');
    });

    it('uses existing token for known scope', async () => {
      await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM);

      expect(await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM)).toBe('access_token');

      expect(makeRequest).toHaveBeenCalledTimes(1);
    });

    it('requests a new token when existing is expired', async () => {
      (makeRequest as jest.Mock).mockReturnValueOnce({token: 'expired_token'});
      (jwt.decode as jest.Mock).mockReturnValueOnce({exp: 1});

      expect(await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM)).toBe('expired_token');
      expect(await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM)).toBe('access_token');
      expect(makeRequest).toHaveBeenCalledTimes(2);
    });

    it('uses existing token if it does not expire', async () => {
      (jwt.decode as jest.Mock).mockReturnValueOnce({});
      expect(await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM)).toBe('access_token');
      expect(await getAccessToken(refreshToken, 'read:data', LOGGERNET_PLATFORM)).toBe('access_token');
      expect(makeRequest).toHaveBeenCalledTimes(1);
    });
  });
});
