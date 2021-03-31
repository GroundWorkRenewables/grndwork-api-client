import { RefreshToken } from './interfaces';
export declare function resetAccessTokenCache(): void;
export declare function getAccessToken(refreshToken: RefreshToken, platform: string, scope: string): Promise<string>;
