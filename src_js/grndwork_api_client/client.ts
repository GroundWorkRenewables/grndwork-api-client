import {getAccessToken} from './access_tokens';
import {
  DATA_URL,
  QC_URL,
  STATIONS_URL,
} from './config';
import {
  ClientOptions,
  DataFileWithRecords,
  GetDataQuery,
  GetStationsQuery,
  PostDataPayload,
  QCRecord,
  RefreshToken,
  StationWithDataFiles,
} from './interfaces';
import {IterableResponse} from './iterable_response';
import {makePaginatedRequest} from './make_paginated_request';
import {HttpMethod, makeRequest, Response} from './make_request';
import {combineDataAndQCRecords} from './utils';

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

  public getData(
    query: GetDataQuery | null = null,
    options: {
      include_qc_flags?: boolean | null,
      page_size?: number | null,
    } = {},
  ): IterableResponse<DataFileWithRecords> {
    let iterator = this._requestDataFiles(
      query || {},
      options.page_size || 100,
    );

    if ((query || {}).records_limit && options.include_qc_flags !== false) {
      iterator = this._includeQCFlags(iterator);
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
    query: GetDataQuery,
    pageSize: number,
  ): AsyncIterableIterator<DataFileWithRecords> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'read:data',
    );

    yield* this._makePaginatedRequest<DataFileWithRecords>({
      url: DATA_URL,
      token: accessToken,
      query,
      page_size: pageSize,
    });
  }

  private async* _includeQCFlags(
    iterator: AsyncIterableIterator<DataFileWithRecords>,
  ): AsyncIterableIterator<DataFileWithRecords> {
    const accessToken = await getAccessToken(
      this._refreshToken,
      this._platform,
      'read:qc',
    );

    for await (const dataFile of iterator) {
      const records = dataFile.records || [];

      if (records.length) {
        const results = (await this._makeRequest<Array<QCRecord>>({
          url: QC_URL,
          token: accessToken,
          query: {
            filename: dataFile.filename,
            limit: 1500,
            before: records[0].timestamp,
            after: records[records.length - 1].timestamp,
          },
        }))[0];

        yield {
          ...dataFile,
          records: combineDataAndQCRecords(records, results),
        };
      } else {
        yield dataFile;
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
