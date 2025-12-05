import {readFileSync} from 'node:fs';
import {env} from 'node:process';
import {RefreshToken} from './interfaces';

export const API_URL = env.GROUNDWORK_API_URL || 'https://api.grndwork.com';

export const TOKENS_URL = `${API_URL}/v1/tokens`;
export const STATIONS_URL = `${API_URL}/v1/stations`;
export const REPORTS_URL = `${API_URL}/v1/reports`;
export const EXPORTS_URL = `${API_URL}/v1/exports`;
export const FILES_URL = `${API_URL}/v1/files`;
export const DATA_URL = `${API_URL}/v1/data`;
export const QC_URL = `${API_URL}/v1/qc`;

export const RECORD_COUNT_COMPRESSION_THRESHOLD = 100;

export function getRefreshToken(): RefreshToken {
  const {
    GROUNDWORK_TOKEN_PATH,
    GROUNDWORK_SUBJECT,
    GROUNDWORK_TOKEN,
  } = env;

  if (GROUNDWORK_TOKEN_PATH) {
    return JSON.parse(readFileSync(GROUNDWORK_TOKEN_PATH, 'utf8'));
  }

  if (GROUNDWORK_SUBJECT && GROUNDWORK_TOKEN) {
    return {
      subject: GROUNDWORK_SUBJECT,
      token: GROUNDWORK_TOKEN,
    };
  }

  throw new Error('Could not get refresh token from environment');
}
