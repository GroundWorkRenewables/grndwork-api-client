import {createWriteStream} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import * as undici from 'undici';

export class DownloadError extends Error {}

export async function downloadFile(
  url: string,
  destination: string,
  options: {
    timeout?: number,
  } = {},
): Promise<string> {
  const folder = dirname(destination);

  if (folder) {
    await mkdir(folder, {recursive: true});
  }

  const {timeout = 30.0} = options;

  const dispatcher = undici.getGlobalDispatcher().compose(
    undici.interceptors.responseError(),
  );

  try {
    await undici.stream(url, {
      dispatcher,
      method: 'GET',
      headersTimeout: timeout * 1000,
      bodyTimeout: timeout * 1000,
    }, () => (
      createWriteStream(destination)
    ));
  } catch (err) {
    if (err instanceof undici.errors.UndiciError) {
      throw new DownloadError('Failed to download file');
    }

    throw err;
  }

  return destination;
}
