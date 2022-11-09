from src_py.grndwork_api_client.utils import combine_data_and_qc_records


def describe_make_paginated_request():
    def it_returns_data_record_with_qc_flags():
        assert combine_data_and_qc_records([
            {
                'timestamp': '2020-01-01 00:00:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE'},
            },
        ], []) == [
            {
                'timestamp': '2020-01-01 00:00:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE'},
                'qc_flags': {},
            },
        ]

    def it_combines_records_with_matching_timestamps():
        assert combine_data_and_qc_records([
            {
                'timestamp': '2020-01-01 00:00:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE'},
            },
        ], [
            {
                'timestamp': '2020-01-01 00:00:00',
                'qc_flags': {'SOME_KEY': 'FLAG'},
            },
        ]) == [
            {
                'timestamp': '2020-01-01 00:00:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE'},
                'qc_flags': {'SOME_KEY': 'FLAG'},
            },
        ]

    def it_skips_qc_records_without_matching_timestamp():
        assert combine_data_and_qc_records([
            {
                'timestamp': '2020-01-01 00:00:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE'},
            },
        ], [
            {
                'timestamp': '2020-01-01 00:01:00',
                'qc_flags': {'SOME_KEY': 'FLAG'},
            },
        ]) == [
            {
                'timestamp': '2020-01-01 00:00:00',
                'record_num': 1,
                'data': {'SOME_KEY': 'VALUE'},
                'qc_flags': {},
            },
        ]
