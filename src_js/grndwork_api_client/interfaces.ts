export interface RequestOptions {
  url: string;
  token: string;
  method?: string;
  query?: Record<string, any>;
  headers?: Record<string, any>;
  body?: Record<string, any>;
}

export interface RefreshToken {
  subject: string;
  token: string;
}

export interface AccessToken {
  token: string;
}

export type DataValue = number | string | boolean | null;
export type QCValue = number | string | boolean | null;

export interface DataRecord {
  timestamp: string;
  record_num: number;
  data: Record<string, DataValue>;
  qc_flags?: Record<string, QCValue>;
}

export interface QCRecord {
  timestamp: string;
  qc_flags: Record<string, QCValue>;
}

export interface DataFileHeaders {
  meta?: Record<string, string>;
  columns: Array<string>;
  units: Array<string>;
  processing?: Array<string>;
}

export interface DataFile {
  source: string;
  filename: string;
  is_stale: boolean;
  headers: DataFileHeaders;
  records?: Array<DataRecord>;
}

export interface StationDataFile {
  filename: string;
  is_stale: boolean;
  headers: DataFileHeaders;
}

export interface Station {
  client_uuid: string;
  client_full_name: string;
  client_short_name: string;
  site_uuid: string;
  site_full_name: string;
  station_uuid: string;
  station_full_name: string;
  description: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone_offset: number | null;
  start_timestamp: string | null;
  end_timestamp: string | null;
  data_file_prefix: string;
  data_files: Array<StationDataFile>;
}

export interface GetStationsQuery {
  client?: string;
  site?: string;
  station?: string;
  limit?: number;
  offset?: number;
}

export interface GetDataQuery {
  client?: string;
  site?: string;
  gateway?: string;
  station?: string;
  filename?: string;
  limit?: number;
  offset?: number;
  records_before?: string;
  records_after?: string;
  records_limit?: number;
}

export interface GetQCQuery {
  filename: string;
  before?: string;
  after?: string;
  limit?: number;
}

export interface PostDataRecord {
  timestamp: string;
  record_num: number;
  data: Record<string, DataValue>;
}

export interface PostDataFile {
  filename: string;
  headers?: DataFileHeaders;
  records?: Array<PostDataRecord>;
}

export interface PostDataPayload {
  source: string;
  files: Array<PostDataFile>;
  overwrite?: boolean;
}
