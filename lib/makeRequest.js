"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const ServerError_1 = require("./ServerError");
async function makeRequest(options) {
    const url = new URL(options.url);
    if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }
    const fetchOptions = {
        method: options.method || 'GET',
        headers: {
            ...options.headers,
        },
    };
    if (options.token) {
        fetchOptions.headers.Authorization = `Bearer ${options.token}`;
    }
    if (options.body) {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(options.body);
    }
    const resp = await node_fetch_1.default(url, fetchOptions);
    let payload;
    try {
        payload = await resp.json();
    }
    catch (err) {
        throw new ServerError_1.ServerError('Invalid response payload', resp.status);
    }
    if (resp.status >= 400) {
        throw new ServerError_1.ServerError(payload.message, resp.status, payload.errors);
    }
    return payload;
}
exports.makeRequest = makeRequest;
//# sourceMappingURL=makeRequest.js.map