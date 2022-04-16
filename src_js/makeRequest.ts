import fetch from 'node-fetch';
import {RequestOptions} from './interfaces';
import {ServerError} from './ServerError';

export interface ContentRange {
  count: number;
  first: number;
  last: number;
}

export async function makeRequest(options: RequestOptions): Promise<Array<any>> {
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
  const headers: Record<string, any> = {};

  try {
    payload = await resp.json();

    for (const [key, value] of resp.headers.entries()) {
      headers[key] = value;
    } // Caution: node fetch lowercases header values
  } catch (err) {
    throw new ServerError('Invalid response payload', resp.status);
  }

  if (resp.status >= 400) {
    throw new ServerError(payload.message, resp.status, payload.errors);
  }

  return [payload, headers];
}

export async function* makePaginatedRequest(
  token: string,
  url: string,
  pageSize: number,
  query: any = {},
): AsyncGenerator<Promise<any>> {
  let offset = query.offset === undefined ? 0 : query.offset;
  let {limit} = query;

  while (true) {
    let queryLimit = pageSize;
    if (typeof limit !== 'undefined') {
      queryLimit = limit;
    }

    const [results, headers] = await makeRequest({
      url,
      method: 'GET',
      query: {...query, ...{limit: queryLimit, offset}},
      token,
    });

    yield* results;

    const contRange = parseContentRange(headers);
    if (contRange === null) {
      throw TypeError('Invalid header pagination values');
    }

    if (contRange.last === contRange.count) {
      break;
    }

    if (limit !== undefined) {
      limit -= results.length;

      if (limit <= 0) {
        break;
      }
    }
    offset = contRange.last;
  }
}

export function parseContentRange(headers: any): any {
  const rangeVals = headers['content-range'];

  if (rangeVals !== undefined) {
    const contRange: ContentRange = {
      count: parseInt(rangeVals.split('/')[1], 10),
      first: parseInt(rangeVals.replace('items ', '').split('-')[0], 10),
      last: parseInt(rangeVals.replace('items ', '').split('-')[1].split('/')[0], 10),
    };

    return contRange;
  }

  return null;
}
