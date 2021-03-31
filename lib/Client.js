"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const config_1 = require("./config");
const accessTokens_1 = require("./accessTokens");
const makeRequest_1 = require("./makeRequest");
class Client {
    constructor(refreshToken, platform) {
        this.refreshToken = refreshToken;
        this.platform = platform;
    }
    async getStations(query) {
        const accessToken = await accessTokens_1.getAccessToken(this.refreshToken, this.platform, 'read:stations');
        const result = await makeRequest_1.makeRequest({
            url: config_1.STATIONS_URL,
            method: 'GET',
            query,
            token: accessToken,
        });
        return result;
    }
    async getData(query) {
        const accessToken = await accessTokens_1.getAccessToken(this.refreshToken, this.platform, 'read:data');
        const result = await makeRequest_1.makeRequest({
            url: config_1.DATA_URL,
            method: 'GET',
            query,
            token: accessToken,
        });
        return result;
    }
    async postData(payload) {
        const accessToken = await accessTokens_1.getAccessToken(this.refreshToken, this.platform, 'write:data');
        await makeRequest_1.makeRequest({
            url: config_1.DATA_URL,
            method: 'POST',
            body: payload,
            token: accessToken,
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map