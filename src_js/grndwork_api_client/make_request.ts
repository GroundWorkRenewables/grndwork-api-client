import {STATUS_CODES} from 'http';
import fetch, {Headers} from 'node-fetch';
import {RequestOptions} from './interfaces';

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{field: string, message: string}> = [],
  ) {
    super(message);
  }
}

export async function makeRequest<T>(
  options: RequestOptions,
): Promise<[T, Headers]> {
  const url = new URL(options.url);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const fetchOptions: {
    method: string,
    headers: Record<string, any>,
    body?: string,
  } = {
    method: options.method || 'GET',
    headers: {
      ...options.headers,
    },
  };

  if (options.token) {
    fetchOptions.headers.Authorization = `Bearer ${ options.token }`;
  }

  if (options.body) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(options.body);
  }

  const resp = await fetch(url, fetchOptions);

  let payload;

  try {
    payload = await resp.json();
  } catch (err) {
    throw new RequestError('Failed to parse response payload');
  }

  if (resp.status >= 400) {
    throw new RequestError(
      payload.message || STATUS_CODES[resp.status],
      payload.errors,
    );
  }

  return [payload as T, resp.headers];
}
