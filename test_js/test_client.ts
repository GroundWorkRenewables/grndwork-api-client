import {tmpdir} from 'node:os';
import {join as joinPath} from 'node:path';
import {cwd as getcwd} from 'node:process';
import * as undici from 'undici';
import {getAccessToken} from '../src_js/grndwork_api_client/access_tokens';
import {Client} from '../src_js/grndwork_api_client/client';
import {
  API_URL,
  DATA_URL,
  EXPORTS_URL,
  FILES_URL,
  QC_URL,
  REPORTS_URL,
  STATIONS_URL,
} from '../src_js/grndwork_api_client/config';
import {downloadFile} from '../src_js/grndwork_api_client/download_file';
import {
  DataExport,
  DataRecord,
  Report,
  ReportFile,
} from '../src_js/grndwork_api_client/interfaces';
import {runConcurrently} from '../src_js/grndwork_api_client/run_concurrently';

jest.mock('../src_js/grndwork_api_client/access_tokens');
jest.mock('../src_js/grndwork_api_client/download_file');
jest.mock('../src_js/grndwork_api_client/run_concurrently');

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
    (runConcurrently as jest.Mock).mockImplementation(runConcurrentlyMock);
    (downloadFile as jest.Mock).mockImplementation((url, dest) => Promise.resolve(dest));

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

  describe('getReports', () => {
    const REPORTS_PATH = new URL(REPORTS_URL).pathname;

    it('gets read:reports access token', async () => {
      apiMock.intercept({
        path: ignoreQueryString(REPORTS_PATH),
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, []);

      await client.getReports().toArray();

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:reports',
      );
    });

    it('makes get reports request with defaults', async () => {
      apiMock.intercept({
        path: REPORTS_PATH,
        query: {limit: 100, offset: 0},
      })
      .reply(200, []);

      await client.getReports().toArray();
    });

    it('makes get reports request with query', async () => {
      apiMock.intercept({
        path: REPORTS_PATH,
        query: {limit: 10, offset: 0},
      })
      .reply(200, []);

      await client.getReports(
        {limit: 10},
      ).toArray();
    });

    it('makes get reports request with page size', async () => {
      apiMock.intercept({
        path: REPORTS_PATH,
        query: {limit: 50, offset: 0},
      })
      .reply(200, []);

      await client.getReports(
        null,
        {page_size: 50},
      ).toArray();
    });
  });

  describe('downloadReport', () => {
    const REPORTS_PATH = new URL(REPORTS_URL).pathname;
    const EXPORTS_PATH = new URL(EXPORTS_URL).pathname;
    const FILES_PATH = new URL(FILES_URL).pathname;

    it('gets read:reports access token', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
        headers: {Authorization: 'Bearer access_token'},
      })
      .reply(200, {});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
      );

      expect(getAccessToken).toHaveBeenCalledWith(
        refreshToken,
        'platform',
        'read:reports',
      );
    });

    it('makes request for report url', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
      })
      .reply(200, {url: 'report url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
      );
    });

    it('does not make request for report without pdf', async () => {
      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          has_pdf: false,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
      );
    });

    it('makes request for data export and file urls', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY_1.pdf`,
      })
      .reply(200, {url: 'report url'});

      apiMock.intercept({
        path: `${EXPORTS_PATH}/TEST_KEY_2.csv`,
      })
      .reply(200, {url: 'export url'});

      apiMock.intercept({
        path: `${FILES_PATH}/TEST_KEY_3.zip`,
      })
      .reply(200, {url: 'file url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY_1.pdf',
          has_pdf: true,
          data_exports: [
            {key: 'TEST_KEY_2.csv'} as DataExport,
          ],
          files: [
            {key: 'TEST_KEY_3.zip'} as ReportFile,
          ],
        } as Report,
      );
    });

    it('downloads report', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
      })
      .reply(200, {url: 'report url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
      );

      expect(downloadFile).toHaveBeenCalledWith(
        'report url',
        joinPath(getcwd(), 'TEST_KEY.pdf'),
        {timeout: undefined},
      );
    });

    it('downloads report as package', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
      })
      .reply(200, {url: 'report url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          package_name: 'TEST_REPORT',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
      );

      expect(downloadFile).toHaveBeenCalledWith(
        'report url',
        joinPath(getcwd(), 'TEST_REPORT', 'TEST_KEY.pdf'),
        {timeout: undefined},
      );
    });

    it('downloads package to destination folder', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
      })
      .reply(200, {url: 'report url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          package_name: 'TEST_REPORT',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
        {destination_folder: tmpdir()},
      );

      expect(downloadFile).toHaveBeenCalledWith(
        'report url',
        joinPath(tmpdir(), 'TEST_REPORT', 'TEST_KEY.pdf'),
        {timeout: undefined},
      );
    });

    it('downloads files concurrently', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
      })
      .reply(200, {url: 'report url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
      );

      expect(runConcurrently).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Array),
        10,
      );
    });

    it('downloads files with max concurrency', async () => {
      apiMock.intercept({
        path: `${REPORTS_PATH}/TEST_KEY.pdf`,
      })
      .reply(200, {url: 'report url'});

      await client.downloadReport(
        {
          key: 'TEST_KEY.pdf',
          has_pdf: true,
          data_exports: [] as Array<DataExport>,
          files: [] as Array<ReportFile>,
        } as Report,
        {max_concurrency: 1},
      );

      expect(runConcurrently).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Array),
        1,
      );
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

async function runConcurrentlyMock<T, K>(
  func: (arg: T) => Promise<K>,
  iterable: Iterable<T>,
): Promise<Array<K>> {
  const results: Array<K> = [];

  for (const value of iterable) {
    results.push(await func(value));
  }

  return results;
}

function ignoreQueryString(path: string): (uri: string) => boolean {
  return uri => (uri.split('?').shift() === path);
}
