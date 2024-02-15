import * as fs from 'fs';
import {RefreshToken} from './interfaces';

export const API_URL = process.env.GROUNDWORK_API_URL || 'https://api.grndwork.com';

export const TOKENS_URL = `${API_URL}/v1/tokens`;
export const STATIONS_URL = `${API_URL}/v1/stations`;
export const DATA_URL = `${API_URL}/v1/data`;
export const QC_URL = `${API_URL}/v1/qc`;

export function getRefreshToken(): RefreshToken {
  const {
    GROUNDWORK_TOKEN_PATH,
    GROUNDWORK_SUBJECT,
    GROUNDWORK_TOKEN,
  } = process.env;

  if (GROUNDWORK_TOKEN_PATH) {
    return JSON.parse(fs.readFileSync(GROUNDWORK_TOKEN_PATH, 'utf8'));
  }

  if (GROUNDWORK_SUBJECT && GROUNDWORK_TOKEN) {
    return {
      subject: GROUNDWORK_SUBJECT,
      token: GROUNDWORK_TOKEN,
    };
  }

  throw new Error('Could not get refresh token from environment');
}
