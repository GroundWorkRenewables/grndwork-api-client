import {readFileSync} from 'fs';
import {getRefreshToken} from '../src_js/config';

jest.mock('fs');

describe('getRefreshToken', () => {
  const refreshToken = {
    subject: 'uuid',
    token: 'refresh_token',
  };

  beforeEach(() => {
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(refreshToken));
  });

  afterEach(() => {
    jest.resetAllMocks();

    delete process.env.GROUNDWORK_TOKEN_PATH;
    delete process.env.GROUNDWORK_SUBJECT;
    delete process.env.GROUNDWORK_TOKEN;
  });

  it('returns null when environment variables are not set', () => {
    expect(getRefreshToken()).toBeNull();
  });

  it('returns token when GROUNDWORK_TOKEN_PATH is set', () => {
    process.env.GROUNDWORK_TOKEN_PATH = 'test/path';

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).toBeCalledWith('test/path', 'utf8');
  });

  it('returns null when only GROUNDWORK_SUBJECT is set', () => {
    process.env.GROUNDWORK_SUBJECT = refreshToken.subject;

    expect(getRefreshToken()).toBeNull();
    expect(readFileSync).not.toBeCalled();
  });

  it('returns null when only GROUNDWORK_TOKEN is set', () => {
    process.env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(getRefreshToken()).toBeNull();
    expect(readFileSync).not.toBeCalled();
  });

  it('returns token when GROUNDWORK_SUBJECT and GROUNDWORK_TOKEN are set', () => {
    process.env.GROUNDWORK_SUBJECT = refreshToken.subject;
    process.env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).not.toBeCalled();
  });

  it('returns token using the GROUNDWORK_TOKEN_PATH when all are set', () => {
    process.env.GROUNDWORK_TOKEN_PATH = 'test/path';
    process.env.GROUNDWORK_SUBJECT = refreshToken.subject;
    process.env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).toBeCalled();
  });
});
