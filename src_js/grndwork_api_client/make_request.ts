import {STATUS_CODES} from 'http';
import * as undici from 'undici';

export type HttpMethod = 'GET' | 'POST';
export type ResponseHeaders = Record<string, string | Array<string> | undefined>;

export interface Response {
  status_code: number;
  headers: ResponseHeaders;
}

export interface ErrorMessage {
  field: string;
  message: string;
}

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<ErrorMessage> = [],
  ) {
    super(message);
  }
}

export async function makeRequest<T>(
  options: {
    url: string,
    method?: HttpMethod,
    token?: string,
    headers?: Record<string, any>,
    query?: Record<string, any>,
    body?: any,
    timeout?: number,
    retries?: number,
    backoff?: number,
  },
): Promise<[T, Response]> {
  const url = new URL(options.url);
  const {method = 'GET'} = options;
  const headers: Record<string, any> = {...options.headers};
  let {body} = options;
  const {timeout = 30.0} = options;
  let {retries = 3} = options;
  let {backoff = 30.0} = options;

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
  }

  if (body !== undefined && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let resp: undici.Dispatcher.ResponseData;

  while (true) {
    try {
      resp = await undici.request(url, {
        method,
        headers,
        body,
        headersTimeout: timeout * 1000,
        bodyTimeout: timeout * 1000,
        throwOnError: true,
      });
    } catch (err) {
      if (err instanceof undici.errors.ResponseStatusCodeError) {
        if (method === 'GET' && retries > 0 && shouldRetry(err.statusCode)) {
          await wait(backoff);
          retries -= 1;
          backoff *= 2;
          continue;
        }

        throw new RequestError(...parseErrorResponse(err));
      }

      if (err instanceof undici.errors.UndiciError) {
        throw new RequestError('Failed to make request');
      }

      throw err;
    }

    let payload: T;

    try {
      payload = await resp.body.json() as T;
    } catch (err) {
      throw new RequestError('Failed to parse response payload');
    }

    return [payload, {
      status_code: resp.statusCode,
      headers: resp.headers,
    }];
  }
}

function shouldRetry(statusCode: number): boolean {
  return [429, 502, 503, 504].includes(statusCode);
}

function wait(delay: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, delay * 1000);
  });
}

function parseErrorResponse(
  err: undici.errors.ResponseStatusCodeError,
): [string, Array<ErrorMessage>] {
  const payload = (err.body || {}) as {
    message?: string,
    errors?: Array<ErrorMessage>,
  };

  return [
    payload.message || STATUS_CODES[err.statusCode] || 'Unknown response',
    payload.errors || [],
  ];
}
