import {ContentRange} from './content_range';
import {RequestOptions} from './interfaces';
import {makeRequest} from './make_request';

export async function* makePaginatedRequest<T>(
  options: RequestOptions,
  pageSize = 100,
): AsyncIterableIterator<T> {
  const {query = {}} = options;
  let limit = query.limit || null;
  let offset = query.offset || 0;

  while (true) {
    const [results, headers] = await makeRequest<Array<T>>({
      ...options,
      method: 'GET',
      query: {
        ...query,
        limit: limit ? Math.min(limit, pageSize) : pageSize,
        offset,
      },
    });

    yield* results;

    if (limit) {
      limit -= results.length;

      if (limit <= 0) {
        break;
      }
    }

    const contentRange = ContentRange.parse(headers.get('content-range') || '');

    if (offset < contentRange.last) {
      offset = contentRange.last;

      if (offset >= contentRange.count) {
        break;
      }
    } else {
      throw new Error('Invalid content range');
    }
  }
}
