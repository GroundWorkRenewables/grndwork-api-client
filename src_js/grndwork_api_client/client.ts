import {getAccessToken} from './access_tokens';
import {DATA_URL, STATIONS_URL} from './config';
import {
  DataFile,
  GetDataQuery,
  GetStationsQuery,
  PostDataPayload,
  RefreshToken,
  Station,
} from './interfaces';
import {IterableResponse} from './iterable_response';
import {makePaginatedRequest} from './make_paginated_request';
import {makeRequest} from './make_request';

export class Client {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly platform: string,
  ) {}

  public getStations(
    query: GetStationsQuery | null = null,
    pageSize: number | null = null,
  ): IterableResponse<Station> {
    const iterator = this._requestStations(query, pageSize);

    return new IterableResponse(iterator);
  }

  private async* _requestStations(
    query: GetStationsQuery | null,
    pageSize: number | null,
  ): AsyncIterableIterator<Station> {
    const {refreshToken, platform} = this;
    const accessToken = await getAccessToken(refreshToken, platform, 'read:stations');

    yield* makePaginatedRequest<Station>({
      url: STATIONS_URL,
      token: accessToken,
      query: query || {},
    }, pageSize || 100);
  }

  public getData(
    query: GetDataQuery | null = null,
    pageSize: number | null = null,
  ): IterableResponse<DataFile> {
    const iterator = this._requestDataFiles(query, pageSize);

    return new IterableResponse(iterator);
  }

  private async* _requestDataFiles(
    query: GetDataQuery | null,
    pageSize: number | null,
  ): AsyncIterableIterator<DataFile> {
    const {refreshToken, platform} = this;
    const accessToken = await getAccessToken(refreshToken, platform, 'read:data');

    yield* makePaginatedRequest<DataFile>({
      url: DATA_URL,
      token: accessToken,
      query: query || {},
    }, pageSize || 100);
  }

  public async postData(payload: PostDataPayload): Promise<void> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'write:data');

    await makeRequest<void>({
      url: DATA_URL,
      token: accessToken,
      method: 'POST',
      body: payload,
    });
  }
}
