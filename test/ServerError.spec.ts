import {ServerError} from '../src/ServerError';

describe('ServerError', () => {
  it('uses defaults', () => {
    const error = new ServerError();

    expect(error.message).toEqual('Internal Server Error');
    expect(error.status).toEqual(500);
    expect(error.errors).toEqual([]);
  });

  it('uses message when set', () => {
    const error = new ServerError('error message');

    expect(error.message).toEqual('error message');
    expect(error.status).toEqual(500);
    expect(error.errors).toEqual([]);
  });

  it('uses status when set', () => {
    const error = new ServerError('error message', 400);

    expect(error.message).toEqual('error message');
    expect(error.status).toEqual(400);
    expect(error.errors).toEqual([]);
  });

  it('uses errors when set', () => {
    const error = new ServerError('error message', 400, [{
      field: 'test',
      message: 'error message',
    }]);

    expect(error.message).toEqual('error message');
    expect(error.status).toEqual(400);
    expect(error.errors).toEqual([{
      field: 'test',
      message: 'error message',
    }]);
  });
});
