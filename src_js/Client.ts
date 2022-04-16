import {STATIONS_URL, DATA_URL} from './config';
import {getAccessToken} from './accessTokens';
import {makeRequest, makePaginatedRequest} from './makeRequest';
import {
  RefreshToken,
  GetStationsQuery,
  GetDataQuery,
  PostDataPayload,
  Station,
  DataFile,
} from './interfaces';

export class Client {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly platform: string,
  ) {}

  public async getStations(
    query?: GetStationsQuery,
  ): Promise<AsyncGenerator<Station>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:stations');

    const url = STATIONS_URL;
    const pageSize = 100;

    const result = makePaginatedRequest(
      accessToken,
      url,
      pageSize,
      query,
    ) as AsyncGenerator<Station>;
    return result;
  }

  public async getData(
    query?: GetDataQuery,
  ): Promise<AsyncGenerator<DataFile>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:data');

    const url = DATA_URL;
    const pageSize = 100;

    const result = makePaginatedRequest(
      accessToken,
      url,
      pageSize,
      query,
    ) as AsyncGenerator<DataFile>;

    return result;
  }

  public async postData(payload: PostDataPayload): Promise<void> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'write:data');

    await makeRequest({
      url: DATA_URL,
      method: 'POST',
      body: payload,
      token: accessToken,
    });
  }
}
