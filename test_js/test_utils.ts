import {combineDataAndQCRecords} from '../src_js/grndwork_api_client/utils';

describe('combineDataAndQCRecords', () => {
  it('returns data record with qc flags', () => {
    expect(combineDataAndQCRecords([
      {
        timestamp: '2020-01-01 00:00:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE'},
      },
    ], [])).toEqual([
      {
        timestamp: '2020-01-01 00:00:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE'},
        qc_flags: {},
      },
    ]);
  });

  it('combines records with matching timestamps', () => {
    expect(combineDataAndQCRecords([
      {
        timestamp: '2020-01-01 00:00:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE'},
      },
    ], [
      {
        timestamp: '2020-01-01 00:00:00',
        qc_flags: {SOME_KEY: 'FLAG'},
      },
    ])).toEqual([
      {
        timestamp: '2020-01-01 00:00:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE'},
        qc_flags: {SOME_KEY: 'FLAG'},
      },
    ]);
  });

  it('skips qc records without matching timestamp', () => {
    expect(combineDataAndQCRecords([
      {
        timestamp: '2020-01-01 00:00:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE'},
      },
    ], [
      {
        timestamp: '2020-01-01 00:01:00',
        qc_flags: {SOME_KEY: 'FLAG'},
      },
    ])).toEqual([
      {
        timestamp: '2020-01-01 00:00:00',
        record_num: 1,
        data: {SOME_KEY: 'VALUE'},
        qc_flags: {},
      },
    ]);
  });
});
