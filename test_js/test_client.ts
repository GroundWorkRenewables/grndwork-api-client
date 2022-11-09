import {Response} from 'node-fetch';
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
    (makeRequest as jest.Mock).mockResolvedValue([null, new Response()]);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getStations', () => {
    it('gets read:stations access token', async () => {
      await client.getStations().toArray();

      expect(getAccessToken).toHaveBeenCalledTimes(1);
      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:stations',
      );
    });

    it('makes get stations request with default options', async () => {
      await client.getStations().toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: STATIONS_URL,
        token: 'access_token',
        query: {},
      }, 100);
    });

    it('makes get stations request with query', async () => {
      await client.getStations({limit: 10}).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: STATIONS_URL,
        token: 'access_token',
        query: {limit: 10},
      }, 100);
    });

    it('makes get stations request with page size', async () => {
      await client.getStations(null, 50).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: STATIONS_URL,
        token: 'access_token',
        query: {},
      }, 50);
    });
  });

  describe('getData', () => {
    it('gets read:data access token', async () => {
      await client.getData().toArray();

      expect(getAccessToken).toHaveBeenCalledTimes(1);
      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:data',
      );
    });

    it('makes get data request with default options', async () => {
      await client.getData().toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: DATA_URL,
        token: 'access_token',
        query: {},
      }, 100);
    });

    it('makes get data request with query', async () => {
      await client.getData({limit: 10}).toArray();

      expect(makePaginatedRequest).toHaveBeenCalledWith({
        url: DATA_URL,
        token: 'access_token',
        query: {limit: 10},
      }, 100);
    });

    it('makes get data request with page size', async () => {
      await client.getData(null, 50).toArray();

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

    it('gets write:data access token', async () => {
      await client.postData(payload);

      expect(getAccessToken).toHaveBeenCalledTimes(1);
      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'write:data',
      );
    });

    it('makes post data request with payload', async () => {
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
