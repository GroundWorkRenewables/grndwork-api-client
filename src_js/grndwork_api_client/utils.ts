import {
  DataRecord,
  QCRecord,
  QCValue,
} from './interfaces';

export function combineDataAndQCRecords(
  dataRecords: Array<DataRecord>,
  qcRecords: Array<QCRecord>,
): Array<DataRecord> {
  const qcFlagsByTimestamp: Record<string, Record<string, QCValue>> = {};

  for (const record of qcRecords) {
    qcFlagsByTimestamp[record.timestamp] = record.qc_flags;
  }

  return dataRecords.map(record => ({
    ...record,
    qc_flags: qcFlagsByTimestamp[record.timestamp] || {},
  }));
}
