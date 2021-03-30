import fetch from 'node-fetch';
import {RequestOptions} from './interfaces';
import {ServerError} from './ServerError';

export async function makeRequest<T>(options: RequestOptions): Promise<T> {
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
    throw new ServerError('Invalid response payload', resp.status);
  }

  if (resp.status >= 400) {
    throw new ServerError(payload.message, resp.status, payload.errors);
  }

  return payload;
}
