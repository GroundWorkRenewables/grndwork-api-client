export interface RefreshToken {
  subject: string;
  token: string;
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

export interface PostDataPayload {
  source: string;
  files: Array<Pick<DataFile, 'filename' | 'headers' | 'records'>>;
  overwrite?: boolean;
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
  data_files: Array<Required<Omit<DataFile, 'source' | 'records'>>>;
}

export interface DataFile {
  source?: string;
  filename: string;
  is_stale?: boolean;
  headers?: DataFileHeaders;
  records?: Array<DataRecord>;
}

export interface DataFileHeaders {
  meta?: Record<string, string>;
  columns: Array<string>;
  units: Array<string>;
  processing?: Array<string>;
}

export interface DataRecord {
  timestamp: string;
  record_num: number;
  data: Record<string, any>;
}

export interface RequestOptions {
  url: string;
  method?: string;
  query?: Record<string, any>;
  headers?: Record<string, any>;
  body?: Record<string, any>;
  token?: string;
}
