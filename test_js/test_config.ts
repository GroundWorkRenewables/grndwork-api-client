import {readFileSync} from 'node:fs';
import {env} from 'node:process';
import {getRefreshToken} from '../src_js/grndwork_api_client/config';

jest.mock('node:fs');

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
  });

  it('returns refresh token when token path set', () => {
    env.GROUNDWORK_TOKEN_PATH = 'GROUNDWORK_TOKEN_PATH';
    delete env.GROUNDWORK_SUBJECT;
    delete env.GROUNDWORK_TOKEN;

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).toHaveBeenCalledWith('GROUNDWORK_TOKEN_PATH', 'utf8');
  });

  it('returns refresh token when subject and token set', () => {
    delete env.GROUNDWORK_TOKEN_PATH;
    env.GROUNDWORK_SUBJECT = refreshToken.subject;
    env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('throws when only subject set', () => {
    delete env.GROUNDWORK_TOKEN_PATH;
    env.GROUNDWORK_SUBJECT = refreshToken.subject;
    delete env.GROUNDWORK_TOKEN;

    expect(() => getRefreshToken()).toThrow('Could not get refresh token from environment');
  });

  it('throws when only token set', () => {
    delete env.GROUNDWORK_TOKEN_PATH;
    delete env.GROUNDWORK_SUBJECT;
    env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(() => getRefreshToken()).toThrow('Could not get refresh token from environment');
  });

  it('throws when none set', () => {
    delete env.GROUNDWORK_TOKEN_PATH;
    delete env.GROUNDWORK_SUBJECT;
    delete env.GROUNDWORK_TOKEN;

    expect(() => getRefreshToken()).toThrow('Could not get refresh token from environment');
  });
});
