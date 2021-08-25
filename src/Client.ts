import {
  STATIONS_URL, DATA_URL, REPORTS_URL, EXPORTS_URL,
} from './config';
import {getAccessToken} from './accessTokens';
import {makeRequest} from './makeRequest';
import {
  GetReportsQuery,
  RefreshToken,
  GetStationsQuery,
  GetDataQuery,
  PostDataPayload,
  Station,
  DataFile,
  Report,
  DataExport,
} from './interfaces';

export class Client {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly platform: string,
  ) {}

  public async getStations(query?: GetStationsQuery): Promise<Array<Required<Station>>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:stations');

    const result = await makeRequest<Array<Required<Station>>>({
      url: STATIONS_URL,
      method: 'GET',
      query,
      token: accessToken,
    });

    return result;
  }

  public async getData(query?: GetDataQuery): Promise<Array<Required<DataFile>>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:data');

    const result = await makeRequest<Array<Required<DataFile>>>({
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

  public async getReports(query?: GetReportsQuery): Promise<Array<Report>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:reports');

    const result = await makeRequest<Array<Report>>({
      url: REPORTS_URL,
      method: 'GET',
      query,
      token: accessToken,
    });

    return result;
  }

  public async getReport(reportKey: string): Promise<Required<Report>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:reports');

    const result = await makeRequest<Required<Report>>({
      url: `${ REPORTS_URL }/${ reportKey }`,
      method: 'GET',
      token: accessToken,
    });

    return result;
  }

  public async getDataExport(dataExportKey: string): Promise<Required<DataExport>> {
    const accessToken = await getAccessToken(this.refreshToken, this.platform, 'read:reports');

    const result = await makeRequest<Required<DataExport>>({
      url: `${ EXPORTS_URL }/${ dataExportKey }`,
      method: 'GET',
      token: accessToken,
    });

    return result;
  }
}
