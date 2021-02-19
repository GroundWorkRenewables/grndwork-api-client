import * as fs from 'fs';
import {RefreshToken} from './interfaces';

export const API_URL = process.env.GROUNDWORK_API_URL || 'https://api.grndwork.com';
export const TOKENS_URL = `${ API_URL }/v1/tokens`;
export const DATA_URL = `${ API_URL }/v1/data`;

export function getRefreshToken(): RefreshToken | null {
  const {
    GROUNDWORK_TOKEN_PATH,
    GROUNDWORK_TOKEN,
    GROUNDWORK_SUBJECT,
  } = process.env;

  let result: RefreshToken | null = null;

  if (GROUNDWORK_TOKEN_PATH) {
    result = JSON.parse(fs.readFileSync(GROUNDWORK_TOKEN_PATH, 'utf8'));
  } else if (GROUNDWORK_TOKEN && GROUNDWORK_SUBJECT) {
    result = {
      token: GROUNDWORK_TOKEN,
      subject: GROUNDWORK_SUBJECT,
    };
  }

  return result;
}
