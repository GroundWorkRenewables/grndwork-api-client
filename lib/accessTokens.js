"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = exports.resetAccessTokenCache = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const makeRequest_1 = require("./makeRequest");
let accessTokenCache = {};
function resetAccessTokenCache() {
    accessTokenCache = {};
}
exports.resetAccessTokenCache = resetAccessTokenCache;
async function getAccessToken(refreshToken, platform, scope) {
    const cacheKey = `${platform}:${scope}`;
    let accessToken = accessTokenCache[cacheKey];
    if (!accessToken || hasExpired(accessToken)) {
        accessToken = await createAccessToken(refreshToken, platform, scope);
        accessTokenCache[cacheKey] = accessToken;
    }
    return accessToken;
}
exports.getAccessToken = getAccessToken;
async function createAccessToken(refreshToken, platform, scope) {
    const { token: accessToken } = await makeRequest_1.makeRequest({
        url: config_1.TOKENS_URL,
        method: 'POST',
        token: refreshToken.token,
        body: {
            subject: refreshToken.subject,
            platform,
            scope,
        },
    });
    return accessToken;
}
function hasExpired(token) {
    const { exp: expiration } = (jsonwebtoken_1.default.decode(token) || {});
    const now = Math.floor(Date.now() / 1000);
    if (expiration && now - expiration >= 0) {
        return true;
    }
    return false;
}
//# sourceMappingURL=accessTokens.js.map