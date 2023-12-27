export interface RefreshToken {
  subject: string;
  token: string;
}

export interface ClientOptions {
  request_timeout?: number;
  request_retries?: number;
  request_backoff?: number;
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
  source_start_timestamp: string | null;
  source_end_timestamp: string | null;
  filename: string;
  is_stale: boolean;
  headers: DataFileHeaders;
  created_at: string;
  updated_at: string;
}

export interface DataFileWithRecords extends DataFile {
  records?: Array<DataRecord>;
}

export interface ProjectManager {
  full_name: string;
  email: string;
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
  model: string;
  type: string;
  status: string;
  project_manager: ProjectManager | null;
  maintenance_frequency: string;
  maintenance_log: string;
  location_region: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone_offset: number;
  start_timestamp: string | null;
  end_timestamp: string | null;
  data_file_prefix: string;
  created_at: string;
  updated_at: string;
}

export interface StationDataFile {
  filename: string;
  is_stale: boolean;
  headers: DataFileHeaders;
  created_at: string;
  updated_at: string;
}

export interface StationWithDataFiles extends Station {
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
  records_limit?: number;
  records_before?: string;
  records_after?: string;
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
