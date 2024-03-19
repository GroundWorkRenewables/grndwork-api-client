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

  try {
    await undici.stream(url, {
      method: 'GET',
      headersTimeout: timeout * 1000,
      bodyTimeout: timeout * 1000,
      throwOnError: true,
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
