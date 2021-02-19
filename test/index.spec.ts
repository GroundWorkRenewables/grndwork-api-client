import {createClient} from '../src';
import {getRefreshToken} from '../src/config';

jest.mock('fs');
jest.mock('../src/config');

describe('createClient', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates client', async () => {
    (getRefreshToken as jest.Mock).mockReturnValue({subject: 'subject', token: 'token'});

    expect(await createClient()).toBeDefined();
  });

  it('throws when refresh token is null', async (): Promise<void> => {
    (getRefreshToken as jest.Mock).mockReturnValue(null);
    await expect(() => createClient()).rejects.toEqual(new Error('Could not get refresh token from environment.'));
  });
});
