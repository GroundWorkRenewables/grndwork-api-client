import {DATA_URL} from './config';
import {getAccessToken} from './accessTokens';
import {makeRequest} from './makeRequest';
import {
  RefreshToken,
  GetDataQuery,
  PostDataPayload,
  DataFile,
} from './interfaces';

export class Client {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly platform: string,
  ) {}

  public async getData(query?: GetDataQuery): Promise<Array<DataFile>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:data');

    const result = await makeRequest<Array<DataFile>>({
      url: DATA_URL,
      method: 'GET',
      query,
      token: accessToken,
    });

    return result;
  }

  public async postData(payload: PostDataPayload): Promise<void> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'write:data');

    await makeRequest<void>({
      url: DATA_URL,
      method: 'POST',
      body: payload,
      token: accessToken,
    });
  }
}
