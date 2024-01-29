import {createWriteStream} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {join as joinPath} from 'node:path';
import {cwd as getcwd} from 'node:process';
import {PassThrough} from 'node:stream';
import * as undici from 'undici';
import {API_URL} from '../src_js/grndwork_api_client/config';
import {DownloadError, downloadFile} from '../src_js/grndwork_api_client/download_file';

jest.mock('node:fs');
jest.mock('node:fs/promises');

describe('downloadFile', () => {
  let globalAgent: undici.Dispatcher;
  let mockAgent: undici.MockAgent;
  let apiMock: undici.MockPool;
  let writeStream: PassThrough;

  beforeEach(() => {
    globalAgent = undici.getGlobalDispatcher();

    mockAgent = new undici.MockAgent();
    mockAgent.disableNetConnect();
    undici.setGlobalDispatcher(mockAgent);

    apiMock = mockAgent.get(API_URL);

    writeStream = new PassThrough();
    (createWriteStream as jest.Mock).mockReturnValue(writeStream);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    undici.setGlobalDispatcher(globalAgent);
    mockAgent.assertNoPendingInterceptors();
    await mockAgent.close();
  });

  it('ensures destination folder exists', async () => {
    apiMock.intercept({
      path: '/test.txt',
    })
    .reply(200, 'file contents');

    await downloadFile(
      `${API_URL}/test.txt`,
      joinPath(getcwd(), 'output.txt'),
    );

    expect(mkdir).toHaveBeenCalledWith(
      getcwd(),
      {recursive: true},
    );
  });

  it('makes request for file', async () => {
    apiMock.intercept({
      path: '/test.txt',
    })
    .reply(200, 'file contents');

    await downloadFile(
      `${API_URL}/test.txt`,
      joinPath(getcwd(), 'output.txt'),
    );
  });

  it('throws error when bad request', async () => {
    apiMock.intercept({
      path: '/test.txt',
    })
    .reply(400);

    await expect(
      () => downloadFile(
        `${API_URL}/test.txt`,
        joinPath(getcwd(), 'output.txt'),
      ),
    ).rejects.toThrow(new DownloadError('Failed to download file'));

    expect(createWriteStream).not.toHaveBeenCalled();
  });

  it('writes contents of file to destination', async () => {
    apiMock.intercept({
      path: '/test.txt',
    })
    .reply(200, 'file contents');

    await downloadFile(
      `${API_URL}/test.txt`,
      joinPath(getcwd(), 'output.txt'),
    );

    expect(createWriteStream).toHaveBeenCalled();
    expect(writeStream.read().toString()).toEqual('file contents');
  });
});
