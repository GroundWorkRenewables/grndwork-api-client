export interface RefreshToken {
  subject: string;
  token: string;
}

export interface GetDataQuery {
  client?: string,
  site?: string,
  gateway?: string,
  station?: string,
  filename?: string,
  limit?: number,
  offset?: number,
  records_before?: string,
  records_after?: string,
  records_limit?: number,
}

export interface LoggernetDataFile {
  station_uuid: string;
  filename: string;
  records: Array<DataRecord>;
}

export interface TraceDataFile {
  gateway_uuid: string;
  filename: string;
  records: Array<DataRecord>;
}

interface DataRecord {
  timestamp: string;
  record_num: number;
  data: {[key: string]: any};
}

export interface RequestOptions {
  url: string,
  method?: string,
  query?: {[key: string]: any},
  headers?: {[key: string]: any},
  body?: {[key:string]: any},
  token?: string,
}
