import {Client} from './client';
import {getRefreshToken} from './config';
import {
  DataFile,
  DataFileHeaders,
  DataRecord,
  GetDataQuery,
  GetStationsQuery,
  PostDataFile,
  PostDataPayload,
  RefreshToken,
  Station,
  StationDataFile,
} from './interfaces';
import {RequestError} from './make_request';

const LOGGERNET_PLATFORM = 'loggernet';
const TRACE_PLATFORM = 'trace';

function createClient(platform = LOGGERNET_PLATFORM): Client {
  return new Client(
    getRefreshToken(),
    platform,
  );
}

export {
  // Api client
  createClient,
  Client,

  // Platform constants
  LOGGERNET_PLATFORM,
  TRACE_PLATFORM,

  // Interfaces
  DataFile,
  DataFileHeaders,
  DataRecord,
  GetDataQuery,
  GetStationsQuery,
  PostDataFile,
  PostDataPayload,
  RefreshToken,
  Station,
  StationDataFile,

  // Errors
  RequestError,
};
