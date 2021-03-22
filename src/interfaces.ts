export interface RefreshToken {
  subject: string;
  token: string;
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
  files: Array<DataFile>;
  overwrite?: boolean;
}

export interface DataFile {
  source?: string;
  filename: string;
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
