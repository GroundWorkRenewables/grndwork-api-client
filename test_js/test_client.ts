import * as undici from 'undici';
import {getAccessToken} from '../src_js/grndwork_api_client/access_tokens';
import {Client} from '../src_js/grndwork_api_client/client';
import {
  API_URL,
  DATA_URL,
  QC_URL,
  STATIONS_URL,
} from '../src_js/grndwork_api_client/config';
import {DataRecord} from '../src_js/grndwork_api_client/interfaces';

jest.mock('../src_js/grndwork_api_client/access_tokens');

describe('Client', () => {
  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  let globalAgent: undici.Dispatcher;
  let mockAgent: undici.MockAgent;
  let apiMock: undici.MockPool;
  let client: Client;

  beforeEach(() => {
    (getAccessToken as jest.Mock).mockResolvedValue('access_token');

    globalAgent = undici.getGlobalDispatcher();

    mockAgent = new undici.MockAgent();
    mockAgent.disableNetConnect();
    undici.setGlobalDispatcher(mockAgent);

    apiMock = mockAgent.get(API_URL);

    client = new Client(refreshToken, 'platform', {});
  });

  afterEach(async () => {
    jest.clearAllMocks();

    undici.setGlobalDispatcher(globalAgent);
    mockAgent.assertNoPendingInterceptors();
    await mockAgent.close();
  });

  describe('getStations', () => {
    const STATIONS_PATH = new URL(STATIONS_URL).pathname;

    it('gets read:stations access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(STATIONS_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      await client.getStations().toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:stations',
      );
    });

    it('makes get stations request with defaults', async () => {
      apiMock.intercept({
        path: STATIONS_PATH,
        query: {limit: 100, offset: 0},
      })
      .reply(200, []);

      await client.getStations().toArray();
    });

    it('makes get stations request with query', async () => {
      apiMock.intercept({
        path: STATIONS_PATH,
        query: {limit: 10, offset: 0},
      })
      .reply(200, []);

      await client.getStations(
        {limit: 10},
      ).toArray();
    });

    it('makes get stations request with page size', async () => {
      apiMock.intercept({
        path: STATIONS_PATH,
        query: {limit: 50, offset: 0},
      })
      .reply(200, []);

      await client.getStations(
        null,
        {page_size: 50},
      ).toArray();
    });
  });

  describe('getDataFiles', () => {
    const DATA_PATH = new URL(DATA_URL).pathname;

    it('gets read:data access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      await client.getDataFiles().toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:data',
      );
    });

    it('makes get data request with defaults', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, []);

      await client.getDataFiles().toArray();
    });

    it('makes get data request with query', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 10, offset: 0, records_limit: 0},
      })
      .reply(200, []);

      await client.getDataFiles(
        {limit: 10},
      ).toArray();
    });

    it('makes get data request with page size', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 50, offset: 0, records_limit: 0},
      })
      .reply(200, []);

      await client.getDataFiles(
        null,
        {page_size: 50},
      ).toArray();
    });
  });

  describe('getDataRecords', () => {
    const DATA_PATH = new URL(DATA_URL).pathname;
    const QC_PATH = new URL(QC_URL).pathname;

    it('gets read:data access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat'},
      ).toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:data',
      );
    });

    it('makes get data request with defaults', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
          records_limit: 1,
        },
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat'},
      ).toArray();
    });

    it('makes get data request with query', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
          records_limit: 100,
        },
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat', limit: 100},
      ).toArray();
    });

    it('makes get data request with page size', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
          records_limit: 50,
        },
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat', limit: 100},
        {page_size: 50},
      ).toArray();
    });

    it('gets read:qc access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat'},
      ).toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:qc',
      );
    });

    it('does not get read:qc access token when disabled', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat'},
        {include_qc_flags: false},
      ).toArray();

      expect(getAccessToken).not.toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:qc',
      );
    });

    it('makes get qc request with defaults', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
        },
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat'},
      ).toArray();
    });

    it('makes get qc request with query', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 100,
        },
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat', limit: 100},
      ).toArray();
    });

    it('makes get qc request with page size', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 50,
        },
      })
      .reply(200, []);

      await client.getDataRecords(
        {filename: 'Test_OneMin.dat', limit: 100},
        {page_size: 50},
      ).toArray();
    });

    it('combines data and qc', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, [{
        records: [{
          timestamp: '2020-01-01 00:02:00',
          record_num: 2,
          data: {SOME_KEY: 'VALUE_2'},
        }, {
          timestamp: '2020-01-01 00:01:00',
          record_num: 1,
          data: {SOME_KEY: 'VALUE_1'},
        }],
      }]);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, [{
        timestamp: '2020-01-01 00:01:00',
        qc_flags: {SOME_KEY: 'FLAG_2'},
      }, {
        timestamp: '2020-01-01 00:00:00',
        qc_flags: {SOME_KEY: 'FLAG_1'},
      }]);

      const results = await client.getDataRecords(
        {filename: 'Test_OneMin.dat', limit: 100},
      ).toArray();

      expect(results).toEqual([{
        timestamp: '2020-01-01 00:02:00',
        record_num: 2,
        data: {SOME_KEY: 'VALUE_2'},
      }, {
        timestamp: '2020-01-01 00:01:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE_1'},
        qc_flags: {SOME_KEY: 'FLAG_2'},
      }]);
    });
  });

  describe('getDataQC', () => {
    const QC_PATH = new URL(QC_URL).pathname;

    it('gets read:qc access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      await client.getDataQC(
        {filename: 'Test_OneMin.dat'},
      ).toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:qc',
      );
    });

    it('makes get qc request with defaults', async () => {
      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
        },
      })
      .reply(200, []);

      await client.getDataQC(
        {filename: 'Test_OneMin.dat'},
      ).toArray();
    });

    it('makes get qc request with query', async () => {
      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 100,
        },
      })
      .reply(200, []);

      await client.getDataQC(
        {filename: 'Test_OneMin.dat', limit: 100},
      ).toArray();
    });

    it('makes get qc request with page size', async () => {
      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 50,
        },
      })
      .reply(200, []);

      await client.getDataQC(
        {filename: 'Test_OneMin.dat', limit: 100},
        {page_size: 50},
      ).toArray();
    });
  });

  describe('getData', () => {
    const DATA_PATH = new URL(DATA_URL).pathname;
    const QC_PATH = new URL(QC_URL).pathname;

    it('gets read:data access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      await client.getData().toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:data',
      );
    });

    it('makes get data request with defaults', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, []);

      await client.getData().toArray();
    });

    it('makes get data request with query', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 10, offset: 0, records_limit: 0},
      })
      .reply(200, []);

      await client.getData(
        {limit: 10},
      ).toArray();
    });

    it('makes get data request with page size', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 50, offset: 0, records_limit: 0},
      })
      .reply(200, []);

      await client.getData(
        null,
        {file_page_size: 50},
      ).toArray();
    });

    it('makes get data request per file with defaults when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: DATA_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
          records_limit: 1,
        },
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        null,
        {include_data_records: true},
      )) {
        await dataFile.records.toArray();
      }
    });

    it('makes get data request per file with query when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: DATA_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
          records_limit: 100,
        },
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        {records_limit: 100},
        {include_data_records: true},
      )) {
        await dataFile.records.toArray();
      }
    });

    it('makes get data request per file with page size when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: DATA_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
          records_limit: 50,
        },
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        {records_limit: 100},
        {
          include_data_records: true,
          record_page_size: 50,
        },
      )) {
        await dataFile.records.toArray();
      }
    });

    it('gets read:qc access token when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        null,
        {include_data_records: true},
      )) {
        await dataFile.records.toArray();
      }

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:qc',
      );
    });

    it('does not get read:qc access token when disabled', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        null,
        {
          include_data_records: true,
          include_qc_flags: false,
        },
      )) {
        await dataFile.records.toArray();
      }

      expect(getAccessToken).not.toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:qc',
      );
    });

    it('makes get qc request per file with defaults when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 1,
        },
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        null,
        {include_data_records: true},
      )) {
        await dataFile.records.toArray();
      }
    });

    it('makes get qc request per file with query when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 100,
        },
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        {records_limit: 100},
        {include_data_records: true},
      )) {
        await dataFile.records.toArray();
      }
    });

    it('makes get qc request per file with page size when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, []);

      apiMock.intercept({
        path: QC_PATH,
        query: {
          filename: 'Test_OneMin.dat',
          limit: 50,
        },
      })
      .reply(200, []);

      for await (const dataFile of client.getData(
        {records_limit: 100},
        {
          include_data_records: true,
          record_page_size: 50,
        },
      )) {
        await dataFile.records.toArray();
      }
    });

    it('combines data and qc when requesting records', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        query: {limit: 100, offset: 0, records_limit: 0},
      })
      .reply(200, [{
        filename: 'Test_OneMin.dat',
      }], {
        headers: {
          'content-range': 'items 1-1/1',
        },
      });

      apiMock.intercept({
        path: ignoreQueryString(DATA_PATH),
      })
      .reply(200, [{
        records: [{
          timestamp: '2020-01-01 00:02:00',
          record_num: 2,
          data: {SOME_KEY: 'VALUE_2'},
        }, {
          timestamp: '2020-01-01 00:01:00',
          record_num: 1,
          data: {SOME_KEY: 'VALUE_1'},
        }],
      }]);

      apiMock.intercept({
        path: ignoreQueryString(QC_PATH),
      })
      .reply(200, [{
        timestamp: '2020-01-01 00:01:00',
        qc_flags: {SOME_KEY: 'FLAG_2'},
      }, {
        timestamp: '2020-01-01 00:00:00',
        qc_flags: {SOME_KEY: 'FLAG_1'},
      }]);

      let results: Array<DataRecord> = [];

      for await (const dataFile of client.getData(
        {records_limit: 100},
        {include_data_records: true},
      )) {
        results = await dataFile.records.toArray();
      }

      expect(results).toEqual([{
        timestamp: '2020-01-01 00:02:00',
        record_num: 2,
        data: {SOME_KEY: 'VALUE_2'},
      }, {
        timestamp: '2020-01-01 00:01:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE_1'},
        qc_flags: {SOME_KEY: 'FLAG_2'},
      }]);
    });
  });

  describe('postData', () => {
    const DATA_PATH = new URL(DATA_URL).pathname;

    const payload = {
      source: 'station:uuid',
      files: [{
        filename: 'Test_OneMin.dat',
        records: [],
      }],
    };

    it('gets write:data access token', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        method: 'POST',
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(201, {});

      await client.postData(
        payload,
      );

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'write:data',
      );
    });

    it('makes post data request with payload', async () => {
      apiMock.intercept({
        path: DATA_PATH,
        method: 'POST',
        body: JSON.stringify(payload),
      })
      .reply(201, {});

      await client.postData(
        payload,
      );
    });
  });
});

function ignoreQueryString(path: string): (uri: string) => boolean {
  return uri => (uri.split('?').shift() === path);
}
