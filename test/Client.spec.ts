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

  describe('#getReports', () => {
    it('gets access token', async () => {
      await client.getReports();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:reports',
      );
    });

    it('makes get reports request with default options', async () => {
      await client.getReports();

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/reports',
        method: 'GET',
        query: undefined,
        token: 'access_token',
      });
    });

    it('makes get reports request with query', async () => {
      await client.getReports({limit: 10});

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/reports',
        method: 'GET',
        query: {limit: 10},
        token: 'access_token',
      });
    });
  });

  describe('#getReport', () => {
    it('gets access token', async () => {
      await client.getReport('reportkey');

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:reports',
      );
    });

    it('makes get report request', async () => {
      await client.getReport('reportkey');

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/reports/reportkey',
        method: 'GET',
        token: 'access_token',
      });
    });
  });

  describe('#getExport', () => {
    it('gets access token', async () => {
      await client.getDataExport('exportkey');

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:reports',
      );
    });

    it('makes get export request', async () => {
      await client.getDataExport('exportkey');

      expect(makeRequest).toHaveBeenCalledWith({
        url: 'https://api.grndwork.com/v1/exports/exportkey',
        method: 'GET',
        token: 'access_token',
      });
    });
  });
});
