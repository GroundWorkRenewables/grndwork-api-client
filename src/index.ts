import {Client} from './Client';
import {getRefreshToken} from './config';
import {
  RefreshToken,
  GetDataQuery,
  PostDataPayload,
  DataFile,
  DataFileHeaders,
  DataRecord,
} from './interfaces';
import {ServerError} from './ServerError';

const LOGGERNET_PLATFORM = 'loggernet';
const TRACE_PLATFORM = 'trace';

function createClient(platform = LOGGERNET_PLATFORM): Client {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Could not get refresh token from environment');
  }

  return new Client(refreshToken, platform);
}

export {
  LOGGERNET_PLATFORM,
  TRACE_PLATFORM,
  createClient,
  Client,
  RefreshToken,
  GetDataQuery,
  PostDataPayload,
  DataFile,
  DataFileHeaders,
  DataRecord,
  ServerError,
};
