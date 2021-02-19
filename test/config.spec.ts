import {readFileSync} from 'fs';
import {getRefreshToken} from '../src/config';

jest.mock('fs');

describe('getRefreshToken', () => {
  beforeEach(() => {
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify({token: 'refresh_token', subject: 'client:uuid'}));
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.GROUNDWORK_TOKEN_PATH;
    delete process.env.GROUNDWORK_TOKEN;
    delete process.env.GROUNDWORK_SUBJECT;
  });

  it('returns null when environment variables are not set', async (): Promise<void> => {
    expect(getRefreshToken()).toBeNull();
  });
  describe('when GROUNDWORK_TOKEN_PATH is set', () => {
    it('returns token', async () => {
      process.env.GROUNDWORK_TOKEN_PATH = 'test/path';
      expect(getRefreshToken()).toEqual({token: 'refresh_token', subject: 'client:uuid'});
      expect(readFileSync).toBeCalledWith('test/path', 'utf8');
    });
  });

  describe('when only GROUNDWORK_TOKEN is set', () => {
    it('returns null', async (): Promise<void> => {
      process.env.GROUNDWORK_TOKEN = 'token';
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('when only GROUNDWORK_SUBJECT is set', () => {
    it('returns null', async (): Promise<void> => {
      process.env.GROUNDWORK_SUBJECT = 'client:uuid';
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('when when GROUNDWORK_TOKEN and GROUNDWORK_SUBJECT are set', () => {
    it('returns token', async (): Promise<void> => {
      process.env.GROUNDWORK_TOKEN = 'token';
      process.env.GROUNDWORK_SUBJECT = 'client:uuid';

      expect(getRefreshToken()).toEqual({subject: 'client:uuid', token: 'token'});
      expect(readFileSync).not.toBeCalled();
    });
  });

  describe('when GROUNDWORK_TOKEN_PATH, GROUNDWORK_TOKEN, and GROUNDWORK_SUBJECT are set', () => {
    it('returns token using the GROUNDWORK_TOKEN_PATH', async () => {
      process.env.GROUNDWORK_TOKEN_PATH = 'test/path';
      process.env.GROUNDWORK_TOKEN = 'token';
      process.env.GROUNDWORK_SUBJECT = 'client:uuid';

      expect(getRefreshToken()).toEqual({token: 'refresh_token', subject: 'client:uuid'});
      expect(readFileSync).toBeCalled();
    });
  });
});
