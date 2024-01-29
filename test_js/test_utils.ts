import {stripUUID} from '../src_js/grndwork_api_client/utils';

describe('stripUUID', () => {
  it.each([
    ['', ''],
    ['Report', 'Report'],
    ['Report.pdf', 'Report.pdf'],
    ['Report_1234.pdf', 'Report_1234.pdf'],
    ['Report_1234abcd-1234-abcd-1234-abcd1234abcd', 'Report'],
    ['Report_1234abcd-1234-abcd-1234-abcd1234abcd.pdf', 'Report.pdf'],
    ['Report1234abcd-1234-abcd-1234-abcd1234abcd.pdf', 'Report.pdf'],
  ])('returns filename without uuid', (filename, expected) => {
    expect(stripUUID(filename)).toEqual(expected);
  });
});
