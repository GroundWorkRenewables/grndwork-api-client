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
    query: GetStationsQuery = {},
    pageSize = 100,
  ): IterableResponse<Station> {
    const {refreshToken, platform} = this;

    async function* request(): AsyncIterableIterator<Station> {
      const accessToken = await getAccessToken(refreshToken, platform, 'read:stations');

      yield* makePaginatedRequest<Station>({
        url: STATIONS_URL,
        token: accessToken,
        query,
      }, pageSize);
    }

    return new IterableResponse(request());
  }

  public getData(
    query: GetDataQuery = {},
    pageSize = 100,
  ): IterableResponse<DataFile> {
    const {refreshToken, platform} = this;

    async function* request(): AsyncIterableIterator<DataFile> {
      const accessToken = await getAccessToken(refreshToken, platform, 'read:data');

      yield* makePaginatedRequest<DataFile>({
        url: DATA_URL,
        token: accessToken,
        query,
      }, pageSize);
    }

    return new IterableResponse(request());
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
