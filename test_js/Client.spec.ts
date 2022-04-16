import {Client} from '../src_js/Client';
import {getAccessToken} from '../src_js/accessTokens';
import {makeRequest, makePaginatedRequest} from '../src_js/makeRequest';

jest.mock('../src_js/makeRequest');
jest.mock('../src_js/accessTokens');

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
    (makePaginatedRequest as jest.Mock).mockReturnValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  describe('#getStations', () => {
    it('gets access token', async () => {
      await client.getStations();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:stations',
      );
    });

    it('makes get stations request with default options', async () => {
      await client.getStations();

      expect(makePaginatedRequest).toHaveBeenCalledWith(
        'access_token',
        'https://api.grndwork.com/v1/stations',
        100,
        undefined,
      );
    });

    it('makes get stations request with query', async () => {
      await client.getStations({limit: 10});

      expect(makePaginatedRequest).toHaveBeenCalledWith(
        'access_token',
        'https://api.grndwork.com/v1/stations',
        100,
        {limit: 10},
      );
    });
  });

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

      expect(makePaginatedRequest).toHaveBeenCalledWith(
        'access_token',
        'https://api.grndwork.com/v1/data',
        100,
        undefined,
      );
    });

    it('makes get data request with query', async () => {
      await client.getData({limit: 10});

      expect(makePaginatedRequest).toHaveBeenCalledWith(
        'access_token',
        'https://api.grndwork.com/v1/data',
        100,
        {limit: 10},
      );
    });
  });

  describe('#postData', () => {
    const payload = {
      source: 'station:uuid',
      files: [{
        filename: 'Test_OneMin.dat',
        records: [],
      }],
    };

    it('gets access token', async () => {
      await client.postData(payload);

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'write:data',
      );
    });

    it('makes post data request with payload', async () => {
      await client.postData(payload);

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/data',
        method: 'POST',
        body: payload,
        token: 'access_token',
      });
    });
  });
});
