import {RequestError} from '../src_js/grndwork_api_client/errors';

describe('request error to string', () => {
  it('returns error name and message', () => {
    const error = new RequestError('Bad Request');

    expect(`${error}`).toEqual('RequestError: Bad Request');
  });

  it('returns errors', () => {
    const error = new RequestError('Bad Request', [
      {message: 'Not a valid request'},
    ]);

    expect(`${error}`).toEqual('RequestError: Bad Request\nNot a valid request');
  });

  it('returns errors field', () => {
    const error = new RequestError('Bad Request', [
      {field: 'prop', message: 'Is required'},
    ]);

    expect(`${error}`).toEqual('RequestError: Bad Request\nField "prop" is required');
  });
});
