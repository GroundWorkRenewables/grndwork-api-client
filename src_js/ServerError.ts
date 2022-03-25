import {STATUS_CODES} from 'http';

export class ServerError extends Error {
  constructor(
    message = '',
    public readonly status = 500,
    public readonly errors: Array<{field: string, message: string}> = [],
  ) {
    super(message || STATUS_CODES[status] || 'Unknown Error');
  }
}
