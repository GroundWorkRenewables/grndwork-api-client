import {Client} from '../src_js/Client';
import {getAccessToken} from '../src_js/accessTokens';
import {makeRequest} from '../src_js/makeRequest';

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

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/stations',
        method: 'GET',
        query: undefined,
        token: 'access_token',
      });
    });

    it('makes get stations request with query', async () => {
      await client.getStations({limit: 10});

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/stations',
        method: 'GET',
        query: {limit: 10},
        token: 'access_token',
      });
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
