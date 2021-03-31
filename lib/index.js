"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.Client = exports.createClient = exports.TRACE_PLATFORM = exports.LOGGERNET_PLATFORM = void 0;
const Client_1 = require("./Client");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return Client_1.Client; } });
const config_1 = require("./config");
const ServerError_1 = require("./ServerError");
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return ServerError_1.ServerError; } });
const LOGGERNET_PLATFORM = 'loggernet';
exports.LOGGERNET_PLATFORM = LOGGERNET_PLATFORM;
const TRACE_PLATFORM = 'trace';
exports.TRACE_PLATFORM = TRACE_PLATFORM;
function createClient(platform = LOGGERNET_PLATFORM) {
    const refreshToken = config_1.getRefreshToken();
    if (!refreshToken) {
        throw new Error('Could not get refresh token from environment');
    }
    return new Client_1.Client(refreshToken, platform);
}
exports.createClient = createClient;
//# sourceMappingURL=index.js.map