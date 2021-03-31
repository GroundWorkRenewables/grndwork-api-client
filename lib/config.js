"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshToken = exports.DATA_URL = exports.STATIONS_URL = exports.TOKENS_URL = exports.API_URL = void 0;
const fs = __importStar(require("fs"));
exports.API_URL = process.env.GROUNDWORK_API_URL || 'https://api.grndwork.com';
exports.TOKENS_URL = `${exports.API_URL}/v1/tokens`;
exports.STATIONS_URL = `${exports.API_URL}/v1/stations`;
exports.DATA_URL = `${exports.API_URL}/v1/data`;
function getRefreshToken() {
    const { GROUNDWORK_TOKEN_PATH, GROUNDWORK_SUBJECT, GROUNDWORK_TOKEN, } = process.env;
    let result = null;
    if (GROUNDWORK_TOKEN_PATH) {
        result = JSON.parse(fs.readFileSync(GROUNDWORK_TOKEN_PATH, 'utf8'));
    }
    else if (GROUNDWORK_SUBJECT && GROUNDWORK_TOKEN) {
        result = {
            subject: GROUNDWORK_SUBJECT,
            token: GROUNDWORK_TOKEN,
        };
    }
    return result;
}
exports.getRefreshToken = getRefreshToken;
//# sourceMappingURL=config.js.map