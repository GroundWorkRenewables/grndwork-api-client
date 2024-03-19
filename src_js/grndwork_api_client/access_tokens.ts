import jwt from 'jsonwebtoken';
import {TOKENS_URL} from './config';
import {RefreshToken} from './interfaces';
import {makeRequest} from './make_request';

let accessTokenCache: Record<string, string> = {};

export function resetAccessTokenCache(): void {
  accessTokenCache = {};
}

export async function getAccessToken(
  refreshToken: RefreshToken,
  platform: string,
  scope: string,
): Promise<string> {
  const cacheKey = `${platform}:${scope}`;

  let accessToken = accessTokenCache[cacheKey];

  if (!accessToken || hasExpired(accessToken)) {
    accessToken = await requestAccessToken(refreshToken, platform, scope);
    accessTokenCache[cacheKey] = accessToken;
  }

  return accessToken;
}

async function requestAccessToken(
  refreshToken: RefreshToken,
  platform: string,
  scope: string,
): Promise<string> {
  const result = (await makeRequest<{token: string}>({
    url: TOKENS_URL,
    method: 'POST',
    token: refreshToken.token,
    body: {
      subject: refreshToken.subject,
      platform,
      scope,
    },
  }))[0];

  return result.token;
}

function hasExpired(token: string): boolean {
  const {exp: expiration} = (jwt.decode(token) || {}) as {exp?: number};
  const now = Math.floor(Date.now() / 1000);

  if (expiration && now - expiration >= 0) {
    return true;
  }

  return false;
}
