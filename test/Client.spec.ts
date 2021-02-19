import {LOGGERNET_PLATFORM} from '../src';
import {Client} from '../src/Client';
import {makeRequest} from '../src/makeRequest';
import {getAccessToken} from '../src/accessTokens';

jest.mock('../src/makeRequest');
jest.mock('../src/accessTokens');
jest.mock('jsonwebtoken');

describe('GroundworkClient', () => {
  let client: Client;
  const refreshToken = {
    token: 'refresh_token',
    subject: 'client:uuid',
  };

  beforeEach(() => {
    client = new Client(refreshToken, LOGGERNET_PLATFORM);

    (getAccessToken as jest.Mock).mockResolvedValue('token');
    (makeRequest as jest.Mock).mockReturnValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getData', () => {
    it('makes get data request with default options', async () => {
      await client.getData();

      expect(makeRequest).toHaveBeenCalledWith({
        method: 'GET',
        query: undefined,
        token: 'token',
        url: 'https://api.grndwork.com/v1/data',
      });
    });

    it('makes get data request with query', async () => {
      await client.getData({limit: 10});

      expect(makeRequest).toHaveBeenCalledWith({
        method: 'GET',
        query: {limit: 10},
        token: 'token',
        url: 'https://api.grndwork.com/v1/data',
      });
    });

    describe('postData', () => {
      it('posts data with default options', async () => {
        await client.postData([]);

        expect(makeRequest).toHaveBeenCalledWith({
          method: 'POST',
          body: [],
          token: 'token',
          url: 'https://api.grndwork.com/v1/data',
        });
      });
    });
  });
});
