import {STATIONS_URL, DATA_URL} from './config';
import {getAccessToken} from './accessTokens';
import {makeRequest} from './makeRequest';
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

  public async getStations(query?: GetStationsQuery): Promise<Array<Required<Station>>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:stations');

    const result = await makeRequest({
      url: STATIONS_URL,
      method: 'GET',
      query,
      token: accessToken,
    });

    return result[0];
  }

  public async getData(query?: GetDataQuery): Promise<Array<Required<DataFile>>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:data');

    const result = await makeRequest({
      url: DATA_URL,
      method: 'GET',
      query,
      token: accessToken,
    });

    return result[0];
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
