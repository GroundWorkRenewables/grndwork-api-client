import { Client } from './Client';
import { RefreshToken, GetStationsQuery, GetDataQuery, PostDataPayload, Station, DataFile, DataFileHeaders, DataRecord } from './interfaces';
import { ServerError } from './ServerError';
declare const LOGGERNET_PLATFORM = "loggernet";
declare const TRACE_PLATFORM = "trace";
declare function createClient(platform?: string): Client;
export { LOGGERNET_PLATFORM, TRACE_PLATFORM, createClient, Client, RefreshToken, GetStationsQuery, GetDataQuery, PostDataPayload, Station, DataFile, DataFileHeaders, DataRecord, ServerError, };
