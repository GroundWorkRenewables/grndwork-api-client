import jwt from 'jsonwebtoken';
import {TOKENS_URL} from './config';
import {makeRequest} from './makeRequest';
import {RefreshToken} from './interfaces';

let accessTokenCache: Record<string, string> = {};

export function resetAccessTokenCache(): void {
  accessTokenCache = {};
}

export async function getAccessToken(
  refreshToken: RefreshToken,
  platform: string,
  scope: string,
): Promise<string> {
  const cacheKey = `${ platform }:${ scope }`;

  let accessToken: string = accessTokenCache[cacheKey];

  if (!accessToken || hasExpired(accessToken)) {
    accessToken = await createAccessToken(refreshToken, platform, scope);
    accessTokenCache[cacheKey] = accessToken;
  }

  return accessToken;
}

async function createAccessToken(
  refreshToken: RefreshToken,
  platform: string,
  scope: string,
): Promise<string> {
  const response = await makeRequest({
    url: TOKENS_URL,
    method: 'POST',
    token: refreshToken.token,
    body: {
      subject: refreshToken.subject,
      platform,
      scope,
    },
  });

  const accessToken = response[0].token;

  return accessToken;
}

function hasExpired(token: string): boolean {
  const {exp: expiration} = (jwt.decode(token) || {}) as {exp?: number};

  const now = Math.floor(Date.now() / 1000);

  if (expiration && now - expiration >= 0) {
    return true;
  }

  return false;
}
