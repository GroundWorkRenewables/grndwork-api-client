import {STATUS_CODES} from 'http';
import {ServerError} from '../src/ServerError';

describe('ServerError', () => {
  it('uses default constructor arguments', () => {
    const error = new ServerError();

    expect(error.message).toBe(STATUS_CODES[500]);
    expect(error.errors).toEqual([]);
    expect(error.message).toBe('Internal Server Error');
  });

  it('uses constructor arguments', () => {
    const error = new ServerError('error_message', 400, [{field: 'test', message: 'message'}]);

    expect(error.status).toBe(400);
    expect(error.errors).toEqual([{field: 'test', message: 'message'}]);
    expect(error.message).toBe('error_message');
  });
});
