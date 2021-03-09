import {Client} from '../src/Client';
import {getAccessToken} from '../src/accessTokens';
import {makeRequest} from '../src/makeRequest';

jest.mock('../src/makeRequest');
jest.mock('../src/accessTokens');

describe('GroundworkClient', () => {
  let client: Client;

  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  beforeEach(() => {
    client = new Client(refreshToken, 'platform');

    (getAccessToken as jest.Mock).mockResolvedValue('access_token');
    (makeRequest as jest.Mock).mockReturnValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  describe('#getData', () => {
    it('gets access token', async () => {
      await client.getData();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:data',
      );
    });

    it('makes get data request with default options', async () => {
      await client.getData();

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/data',
        method: 'GET',
        query: undefined,
        token: 'access_token',
      });
    });

    it('makes get data request with query', async () => {
      await client.getData({limit: 10});

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/data',
        method: 'GET',
        query: {limit: 10},
        token: 'access_token',
      });
    });
  });
});
