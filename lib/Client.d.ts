import { RefreshToken, GetStationsQuery, GetDataQuery, PostDataPayload, Station, DataFile } from './interfaces';
export declare class Client {
    private readonly refreshToken;
    private readonly platform;
    constructor(refreshToken: RefreshToken, platform: string);
    getStations(query?: GetStationsQuery): Promise<Array<Station>>;
    getData(query?: GetDataQuery): Promise<Array<DataFile>>;
    postData(payload: PostDataPayload): Promise<void>;
}
