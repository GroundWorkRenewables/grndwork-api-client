import {DATA_URL} from './config';
import {getAccessToken} from './accessTokens';
import {makeRequest} from './makeRequest';
import {
  RefreshToken,
  GetDataQuery,
  LoggernetDataFile,
  TraceDataFile,
  PostDataRecord,
} from './interfaces';

export class Client {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly platform: string,
  ) {}

  public async getData<T extends LoggernetDataFile | TraceDataFile>(
    query?: GetDataQuery,
  ): Promise<Array<T>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:data');

    const result = await makeRequest<Array<T>>({
      url: DATA_URL,
      method: 'GET',
      query,
      token: accessToken,
    });

    return result;
  }

  public async postData(body: Array<PostDataRecord>): Promise<void> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'write:data');

    await makeRequest<void>({
      url: DATA_URL,
      method: 'POST',
      body,
      token: accessToken,
    });
  }
}
