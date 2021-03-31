"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = void 0;
const http_1 = require("http");
class ServerError extends Error {
    constructor(message = '', status = 500, errors = []) {
        super(message || http_1.STATUS_CODES[status] || 'Unknown Error');
        this.status = status;
        this.errors = errors;
    }
}
exports.ServerError = ServerError;
//# sourceMappingURL=ServerError.js.map