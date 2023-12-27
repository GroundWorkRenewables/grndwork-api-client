import {ContentRange} from './content_range';
import {makeRequest, RequestError} from './make_request';

export async function* makePaginatedRequest<T>(
  options: {
    url: string,
    token?: string,
    headers?: Record<string, any>,
    query?: Record<string, any>,
    page_size: number,
    timeout?: number,
    retries?: number,
    backoff?: number,
  },
): AsyncIterableIterator<T> {
  const query = options.query || {};
  let limit = query.limit || null;
  let offset = query.offset || 0;

  while (true) {
    const [payload, resp] = await makeRequest<Array<T>>({
      url: options.url,
      token: options.token,
      headers: options.headers,
      query: {
        ...query,
        limit: limit ? Math.min(limit, options.page_size) : options.page_size,
        offset,
      },
      timeout: options.timeout,
      retries: options.retries,
      backoff: options.backoff,
    });

    if (payload.length) {
      yield* payload;
    } else {
      break;
    }

    if (limit) {
      limit -= payload.length;

      if (limit <= 0) {
        break;
      }
    }

    const contentRange = ContentRange.parse(resp);

    if (offset < contentRange.last) {
      offset = contentRange.last;

      if (offset >= contentRange.count) {
        break;
      }
    } else {
      throw new RequestError('Invalid content range');
    }
  }
}
