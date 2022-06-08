import {readFileSync} from 'fs';
import {getRefreshToken} from '../src_js/grndwork_api_client/config';

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

  it('returns refresh token when token path set', () => {
    process.env.GROUNDWORK_TOKEN_PATH = 'GROUNDWORK_TOKEN_PATH';

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).toBeCalledWith('GROUNDWORK_TOKEN_PATH', 'utf8');
  });

  it('returns refresh token when subject and token set', () => {
    process.env.GROUNDWORK_SUBJECT = refreshToken.subject;
    process.env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(getRefreshToken()).toEqual(refreshToken);
    expect(readFileSync).not.toBeCalled();
  });

  it('throws when only subject set', () => {
    process.env.GROUNDWORK_SUBJECT = refreshToken.subject;

    expect(() => getRefreshToken()).toThrow('Could not get refresh token from environment');
  });

  it('throws when only token set', () => {
    process.env.GROUNDWORK_TOKEN = refreshToken.token;

    expect(() => getRefreshToken()).toThrow('Could not get refresh token from environment');
  });

  it('throws when none set', () => {
    expect(() => getRefreshToken()).toThrow('Could not get refresh token from environment');
  });
});
