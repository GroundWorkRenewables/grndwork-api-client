import {createClient} from '../src_js';
import {getRefreshToken} from '../src_js/config';

jest.mock('../src_js/config');

describe('createClient', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates client', () => {
    const refreshToken = {
      subject: 'uuid',
      token: 'refresh_token',
    };

    (getRefreshToken as jest.Mock).mockReturnValue(refreshToken);

    expect(createClient()).toBeDefined();
  });

  it('throws when refresh token is null', () => {
    (getRefreshToken as jest.Mock).mockReturnValue(null);

    expect(() => createClient()).toThrow('Could not get refresh token from environment');
  });
});
