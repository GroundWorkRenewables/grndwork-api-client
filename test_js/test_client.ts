import {getAccessToken} from '../src_js/grndwork_api_client/access_tokens';
import {Client} from '../src_js/grndwork_api_client/client';
import {DATA_URL, STATIONS_URL} from '../src_js/grndwork_api_client/config';
import {makePaginatedRequest} from '../src_js/grndwork_api_client/make_paginated_request';
import {makeRequest} from '../src_js/grndwork_api_client/make_request';

jest.mock('../src_js/grndwork_api_client/make_paginated_request');
jest.mock('../src_js/grndwork_api_client/make_request');
jest.mock('../src_js/grndwork_api_client/access_tokens');

describe('Client', () => {
  let client: Client;

  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  beforeEach(() => {
    client = new Client(refreshToken, 'platform');

    (getAccessToken as jest.Mock).mockResolvedValue('access_token');
    (makePaginatedRequest as jest.Mock).mockReturnValue([]);
    (makeRequest as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getStations', () => {
    it('gets access token', async () => {
      await client.getStations().toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:stations',
      );
    });

    it('makes request with default options', async () => {
      await client.getStations().toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: STATIONS_URL,
        token: 'access_token',
        query: {},
      }, 100);
    });

    it('makes request with query', async () => {
      await client.getStations({limit: 10}).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: STATIONS_URL,
        token: 'access_token',
        query: {limit: 10},
      }, 100);
    });

    it('makes request with page size', async () => {
      await client.getStations({}, 50).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: STATIONS_URL,
        token: 'access_token',
        query: {},
      }, 50);
    });
  });

  describe('getData', () => {
    it('gets access token', async () => {
      await client.getData().toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:data',
      );
    });

    it('makes request with default options', async () => {
      await client.getData().toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: DATA_URL,
        token: 'access_token',
        query: {},
      }, 100);
    });

    it('makes request with query', async () => {
      await client.getData({limit: 10}).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: DATA_URL,
        token: 'access_token',
        query: {limit: 10},
      }, 100);
    });

    it('makes request with page size', async () => {
      await client.getData({}, 50).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: DATA_URL,
        token: 'access_token',
        query: {},
      }, 50);
    });
  });

  describe('postData', () => {
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

    it('makes request with payload', async () => {
      await client.postData(payload);

      expect(makeRequest).toHaveBeenCalledWith({
        url: DATA_URL,
        token: 'access_token',
        method: 'POST',
        body: payload,
      });
    });
  });
});
