import * as fs from 'fs';
import {RefreshToken} from './interfaces';

export const API_URL = process.env.GROUNDWORK_API_URL || 'https://api.grndwork.com';
export const TOKENS_URL = `${ API_URL }/v1/tokens`;
export const STATIONS_URL = `${ API_URL }/v1/stations`;
export const DATA_URL = `${ API_URL }/v1/data`;
export const REPORTS_URL = `${ API_URL }/v1/reports`;
export const EXPORTS_URL = `${ API_URL }/v1/exports`;

export function getRefreshToken(): RefreshToken | null {
  const {
    GROUNDWORK_TOKEN_PATH,
    GROUNDWORK_SUBJECT,
    GROUNDWORK_TOKEN,
  } = process.env;

  let result: RefreshToken | null = null;

  if (GROUNDWORK_TOKEN_PATH) {
    result = JSON.parse(fs.readFileSync(GROUNDWORK_TOKEN_PATH, 'utf8'));
  } else if (GROUNDWORK_SUBJECT && GROUNDWORK_TOKEN) {
    result = {
      subject: GROUNDWORK_SUBJECT,
      token: GROUNDWORK_TOKEN,
    };
  }

  return result;
}
