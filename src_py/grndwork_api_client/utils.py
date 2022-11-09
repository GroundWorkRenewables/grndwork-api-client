from typing import Dict, List

from .interfaces import (
    DataRecord,
    QCRecord,
    QCValue,
)


def combine_data_and_qc_records(
    data_records: List[DataRecord],
    qc_records: List[QCRecord],
) -> List[DataRecord]:
    qc_flags_by_timestamp: Dict[str, Dict[str, QCValue]] = {}

    for record in qc_records:
        qc_flags_by_timestamp[record['timestamp']] = record['qc_flags']

    return [
        {
            **record,  # type: ignore
            'qc_flags': qc_flags_by_timestamp.get(record['timestamp'], {}),
        } for record in data_records
    ]
