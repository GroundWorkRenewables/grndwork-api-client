import {Client} from './client';
import {getRefreshToken} from './config';
import {AuthError, RequestError} from './errors';
import {
  ClientOptions,
  DataFile,
  DataFileHeaders,
  DataFileWithRecords,
  DataRecord,
  GetDataFilesQuery,
  GetDataQCQuery,
  GetDataQuery,
  GetDataRecordsQuery,
  GetStationsQuery,
  PostDataFile,
  PostDataPayload,
  PostDataRecord,
  ProjectManager,
  QCRecord,
  RefreshToken,
  Station,
  StationDataFile,
  StationWithDataFiles,
} from './interfaces';
import {IterableResponse} from './iterable_response';
import {version} from './version';

const LOGGERNET_PLATFORM = 'loggernet';
const TRACE_PLATFORM = 'trace';

function createClient(
  platform: string | null = null,
  options: ClientOptions | null = null,
): Client {
  return new Client(
    getRefreshToken(),
    platform || LOGGERNET_PLATFORM,
    options || {},
  );
}

export {
  version,

  // Api client
  createClient,
  Client,

  // Platform constants
  LOGGERNET_PLATFORM,
  TRACE_PLATFORM,

  // Interfaces
  ClientOptions,
  DataFile,
  DataFileHeaders,
  DataFileWithRecords,
  DataRecord,
  GetDataFilesQuery,
  GetDataQCQuery,
  GetDataQuery,
  GetDataRecordsQuery,
  GetStationsQuery,
  IterableResponse,
  PostDataFile,
  PostDataPayload,
  PostDataRecord,
  ProjectManager,
  QCRecord,
  RefreshToken,
  Station,
  StationDataFile,
  StationWithDataFiles,

  // Errors
  AuthError,
  RequestError,
};
