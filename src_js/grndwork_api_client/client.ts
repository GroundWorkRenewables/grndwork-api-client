import {getAccessToken} from './access_tokens';
import {
  DATA_URL,
  QC_URL,
  STATIONS_URL,
} from './config';
import {
  ClientOptions,
  DataFile,
  DataFileWithRecords,
  DataFileWithRecordsArray,
  DataRecord,
  GetDataFilesQuery,
  GetDataQCQuery,
  GetDataQuery,
  GetDataRecordsQuery,
  GetStationsQuery,
  PostDataPayload,
  QCRecord,
  RefreshToken,
  StationWithDataFiles,
} from './interfaces';
import {IterableResponse} from './iterable_response';
import {makePaginatedRequest} from './make_paginated_request';
import {HttpMethod, makeRequest, Response} from './make_request';

export class Client {
  constructor(
    private _refreshToken: RefreshToken,
    private _platform: string,
    private _options: ClientOptions,
  ) {}

  public getStations(
    query: GetStationsQuery | null = null,
    options: {
      page_size?: number | null,
    } = {},
  ): IterableResponse<StationWithDataFiles> {
    const iterator = this._requestStations(
      query || {},
      options.page_size || 100,
    );

    return new IterableResponse(iterator);
  }

  public getDataFiles(
    query: GetDataFilesQuery | null = null,
    options: {
      page_size?: number | null,
    } = {},
  ): IterableResponse<DataFile> {
    const iterator = this._requestDataFiles(
      query || {},
      options.page_size || 100,
    );

    return new IterableResponse(iterator);
  }

  public getDataRecords(
    query: GetDataRecordsQuery,
    options: {
      include_qc_flags?: boolean | null,
      page_size?: number | null,
    } = {},
  ): IterableResponse<DataRecord> {
    let iterator = this._requestDataRecords(
      query,
      options.page_size || 1500,
    );

    if (options.include_qc_flags !== false) {
      iterator = this._includeQCFlags(
        iterator,
        query,
        options.page_size || 1500,
      );
    }

    return new IterableResponse(iterator);
  }

  public getDataQC(
    query: GetDataQCQuery,
    options: {
      page_size?: number | null,
    } = {},
  ): IterableResponse<QCRecord> {
    const iterator = this._requestDataQC(
      query,
      options.page_size || 1500,
    );

    return new IterableResponse(iterator);
  }

  public getData(
    query?: GetDataFilesQuery | null,
    options?: {
      include_data_records?: false,
      include_qc_flags?: boolean | null,
      file_page_size?: number | null,
      record_page_size?: number | null,
    },
  ): IterableResponse<DataFile>;

  public getData(
    query: GetDataQuery | null,
    options: {
      include_data_records: true | null,
      include_qc_flags?: boolean | null,
      file_page_size?: number | null,
      record_page_size?: number | null,
    },
  ): IterableResponse<DataFileWithRecords>;

  public getData(
    query: GetDataFilesQuery | GetDataQuery | null = null,
    options: {
      include_data_records?: boolean | null,
      include_qc_flags?: boolean | null,
      file_page_size?: number | null,
      record_page_size?: number | null,
    } = {},
  ): IterableResponse<DataFile> | IterableResponse<DataFileWithRecords> {
    let iterator = this._requestDataFiles(
      query || {},
      options.file_page_size || 100,
    );

    if (options.include_data_records) {
      iterator = this._includeDataRecords(
        iterator,
        query || {},
        options.include_qc_flags !== false,
        options.record_page_size || 1500,
      );
    }

    return new IterableResponse(iterator);
  }

  public async postData(
    payload: PostDataPayload,
  ): Promise<void> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'write:data',
    );

    await this._makeRequest<void>({
      url: DATA_URL,
      method: 'POST',
      token: accessToken,
      body: payload,
    });
  }

  private async* _requestStations(
    query: GetStationsQuery,
    pageSize: number,
  ): AsyncIterableIterator<StationWithDataFiles> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'read:stations',
    );

    yield* this._makePaginatedRequest<StationWithDataFiles>({
      url: STATIONS_URL,
      token: accessToken,
      query,
      page_size: pageSize,
    });
  }

  private async* _requestDataFiles(
    query: GetDataFilesQuery,
    pageSize: number,
  ): AsyncIterableIterator<DataFile> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'read:data',
    );

    yield* this._makePaginatedRequest<DataFile>({
      url: DATA_URL,
      token: accessToken,
      query: {
        ...query,
        records_limit: 0,
      },
      page_size: pageSize,
    });
  }

  private async* _includeDataRecords(
    fileIterator: AsyncIterableIterator<DataFile>,
    query: GetDataQuery,
    includeQCFlags: boolean,
    pageSize: number,
  ): AsyncIterableIterator<DataFileWithRecords> {
    for await (const dataFile of fileIterator) {
      const recordsQuery: GetDataRecordsQuery = {
        filename: dataFile.filename,
        limit: query.records_limit,
        before: query.records_before,
        after: query.records_after,
      };

      let recordsIterator = this._requestDataRecords(
        recordsQuery,
        pageSize,
      );

      if (includeQCFlags) {
        recordsIterator = this._includeQCFlags(
          recordsIterator,
          recordsQuery,
          pageSize,
        );
      }

      yield {
        ...dataFile,
        records: new IterableResponse(recordsIterator),
      };
    }
  }

  private async* _includeQCFlags(
    dataIterator: AsyncIterableIterator<DataRecord>,
    query: GetDataRecordsQuery,
    pageSize: number,
  ): AsyncIterableIterator<DataRecord> {
    const qcIterator = this._requestDataQC(
      query,
      pageSize,
    );

    let dataRecord: DataRecord | undefined;
    let qcRecord: QCRecord | undefined;

    while (true) {
      dataRecord = dataRecord || (await dataIterator.next()).value;
      qcRecord = qcRecord || (await qcIterator.next()).value;

      if (dataRecord) {
        if (qcRecord && dataRecord.timestamp === qcRecord.timestamp) {
          yield {
            ...dataRecord,
            qc_flags: qcRecord.qc_flags,
          };

          dataRecord = undefined;
          qcRecord = undefined;
        } else if (!qcRecord || dataRecord.timestamp > qcRecord.timestamp) {
          yield dataRecord;

          dataRecord = undefined;
        } else {
          qcRecord = undefined;
        }
      } else {
        break;
      }
    }
  }

  private async* _requestDataRecords(
    query: GetDataRecordsQuery,
    pageSize: number,
  ): AsyncIterableIterator<DataRecord> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'read:data',
    );

    let recordsLimit = query.limit || null;

    if (!(recordsLimit || (query.before && query.after))) {
      recordsLimit = 1;
    }

    let requestLimit = Math.min(recordsLimit || Infinity, pageSize);
    let lastTimestamp = '';

    while (true) {
      const results = (await this._makeRequest<Array<DataFileWithRecordsArray>>({
        url: DATA_URL,
        token: accessToken,
        query: {
          filename: query.filename,
          limit: 1,
          records_limit: requestLimit,
          records_before: lastTimestamp || query.before,
          records_after: query.after,
        },
      }))[0];

      if (results && results.length && results[0].records && results[0].records.length) {
        let {records} = results[0];

        if (lastTimestamp && records[0].timestamp === lastTimestamp) {
          records = records.slice(1);
        }

        if (recordsLimit && records.length > recordsLimit) {
          records = records.slice(0, recordsLimit);
        }

        yield* records;

        if (recordsLimit) {
          recordsLimit -= records.length;

          if (recordsLimit <= 0) {
            break;
          }
        }

        if (results[0].records.length === requestLimit) {
          requestLimit = Math.min((recordsLimit || Infinity) + 1, pageSize);
          lastTimestamp = records[records.length - 1].timestamp;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  private async* _requestDataQC(
    query: GetDataQCQuery,
    pageSize: number,
  ): AsyncIterableIterator<QCRecord> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'read:qc',
    );

    let recordsLimit = query.limit || null;

    if (!(recordsLimit || (query.before && query.after))) {
      recordsLimit = 1;
    }

    let requestLimit = Math.min(recordsLimit || Infinity, pageSize);
    let lastTimestamp = '';

    while (true) {
      const results = (await this._makeRequest<Array<QCRecord>>({
        url: QC_URL,
        token: accessToken,
        query: {
          filename: query.filename,
          limit: requestLimit,
          before: lastTimestamp || query.before,
          after: query.after,
        },
      }))[0];

      if (results && results.length) {
        let records = results;

        if (lastTimestamp && records[0].timestamp === lastTimestamp) {
          records = records.slice(1);
        }

        if (recordsLimit && records.length > recordsLimit) {
          records = records.slice(0, recordsLimit);
        }

        yield* records;

        if (recordsLimit) {
          recordsLimit -= records.length;

          if (recordsLimit <= 0) {
            break;
          }
        }

        if (results.length === requestLimit) {
          requestLimit = Math.min((recordsLimit || Infinity) + 1, pageSize);
          lastTimestamp = records[records.length - 1].timestamp;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  private _makeRequest<T>(
    options: {
      url: string,
      method?: HttpMethod,
      token?: string,
      query?: Record<string, any>,
      body?: any,
    },
  ): Promise<[T, Response]> {
    return makeRequest<T>({
      ...options,
      timeout: this._options.request_timeout,
      retries: this._options.request_retries,
      backoff: this._options.request_backoff,
    });
  }

  private _makePaginatedRequest<T>(
    options: {
      url: string,
      token?: string,
      query?: Record<string, any>,
      page_size: number,
    },
  ): AsyncIterableIterator<T> {
    return makePaginatedRequest({
      ...options,
      timeout: this._options.request_timeout,
      retries: this._options.request_retries,
      backoff: this._options.request_backoff,
    });
  }
}
