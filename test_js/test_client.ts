import {Response} from 'node-fetch';
import {getAccessToken} from '../src_js/grndwork_api_client/access_tokens';
import {Client} from '../src_js/grndwork_api_client/client';
import {DATA_URL, QC_URL, STATIONS_URL} from '../src_js/grndwork_api_client/config';
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

    it('gets read:qc access token when requesting records', async () => {
      await client.getData({records_limit: 1}).toArray();

      expect(getAccessToken).toHaveBeenCalledTimes(2);
      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:qc',
      );
    });

    it('makes get qc requests per data file', async () => {
      (makePaginatedRequest as jest.Mock).mockReturnValue([{
        source: 'station:uuid',
        filename: 'Test_OneMin.dat',
        is_stale: false,
        headers: {
          columns: [],
          units: [],
        },
        records: [{
          timestamp: '2020-01-01 00:00:00',
          record_num: 1,
          data: {SOME_KEY: 'VALUE'},
        }],
      }]);

      (makeRequest as jest.Mock).mockResolvedValue([[{
        timestamp: '2020-01-01 00:00:00',
        qc_flags: {SOME_KEY: 'FLAG'},
      }], new Response()]);

      const results = await client.getData({records_limit: 1}).toArray();

      expect(makeRequest).toHaveBeenCalledWith({
        url: QC_URL,
        token: 'access_token',
        query: {
          filename: 'Test_OneMin.dat',
          before: '2020-01-01 00:00:00',
          after: '2020-01-01 00:00:00',
          limit: 1500,
        },
      });

      expect(results).toEqual([{
        source: 'station:uuid',
        filename: 'Test_OneMin.dat',
        is_stale: false,
        headers: {
          columns: [],
          units: [],
        },
        records: [{
          timestamp: '2020-01-01 00:00:00',
          record_num: 1,
          data: {SOME_KEY: 'VALUE'},
          qc_flags: {SOME_KEY: 'FLAG'},
        }],
      }]);
    });

    it('does not get read:qc access token when disabled', async () => {
      await client.getData({records_limit: 1}, false).toArray();

      expect(getAccessToken).toHaveBeenCalledTimes(1);
    });

    it('makes get data request with page size', async () => {
      await client.getData(null, null, 50).toArray();

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
