![GroundView](https://user-images.githubusercontent.com/7266242/151395564-54000ba1-f7a4-4ea8-84b4-66367e14cc90.png)

# GroundWork API Client

API client for [GroundWork Renewables](https://grndwork.com)


## Installation

__JavaScript__:
```
$ npm install @grndwork/api-client
```

__Python__:
```
$ pip install grndwork-api-client
```

## Usage

__JavaScript__:
```typescript
import {createClient} from '@grndwork/api-client';

const client = createClient();
```

__Python__:
```python
from grndwork_api_client import create_client

client = create_client()
```

In order to access https://api.grndwork.com you must first obtain a refresh token from GroundWork Renewables.

The path to this file can be provided to the client using the `GROUNDWORK_TOKEN_PATH` environment variable.

Or the subject and token values from this file can be provided using the `GROUNDWORK_SUBJECT` and `GROUNDWORK_TOKEN` environment variables.

When providing subject and token values `GROUNDWORK_TOKEN_PATH` must not be set.

### JavaScript Client

For methods that return lists, the javascript client returns a custom async iterable. You can consume this using:

```typescript
for await (const station of client.getStations()) {
  ...
}
```

or

```typescript
const stations = await client.getStations().toArray();
```

### Python Client

For methods that return lists, the python client returns a standard iterator. You can consume this using:

```python
for station in client.get_stations():
  ...
```

or

```python
stations = list(client.get_stations())
```



## API

### Create Client

__JavaScript__:
```typescript
createClient(
    platform?: string | null,
    options?: ClientOptions | null,
): Client
```

__Python__:
```python
create_client(
    platform: str | None,
    options: ClientOptions | None,
) -> Client
```

Takes an optional platform string and options object and returns an API client instance.

#### Client Options

  | Param | Type | Description |
  |---|---|---|
  | request_timeout | number | Seconds to wait between responses from server ( default: 30.0 ) |
  | request_retries | number | Number of times to retry failed request to server ( default: 3 ) |
  | request_backoff | number | Seconds to wait between retries to server ( default: 30.0 ) |

---
### Get Stations

Provides the ability to get stations

__JavaScript__:
```typescript
client.getStations(
    query?: GetStationsQuery | null,
    options?: {
        page_size?: number | null,
    },
): IterableResponse<StationWithDataFiles>
```

__Python__:
```python
client.get_stations(
    query: GetStationsQuery | None,
    *,
    page_size: int | None,
) -> Iterator[StationWithDataFiles]
```

Takes an optional get stations query object as an argument and returns a list of stations.

#### Get Stations Query

  | Param | Type | Description |
  |---|---|---|
  | station | string | Only return stations with UUID, name, or name matching pattern |
  | site | string | Only return stations for site with UUID, name, or name matching pattern |
  | client | string | Only return stations for client with UUID, name, or name matching pattern |
  | limit | number | Maximum number of stations to return |
  | offset | number | Number of stations to skip over before returning results |

##### Pattern Matching

Parameters that support patterns can use a wildcard `*` at the beginning and/or end of the string.

Pattern matching is case insensitive.

For example:

__JavaScript__:
```typescript
const stations = await client.getStations(
    {station: 'Test*'},
).toArray();
```

__Python__:
```python
stations = list(client.get_stations(
    {'station': 'Test*'},
))
```

Would return all stations whose name starts with `Test`.

#### Options

##### Page Size

You can set an optional page size to control the number of stations returned per request from the API.
( min: 1, max: 100, default: 100 )

__JavaScript__:
```typescript
const stations = await client.getStations(
    null,
    {page_size: 50},
).toArray();
```

__Python__:
```python
stations = list(client.get_stations(
    None,
    page_size=50,
))
```

#### Return Values

Stations are returned in alphabetical order by station name.

##### Sample Output

```json
[
  {
    "client_uuid": "286dfd7a-9bfa-41f4-a5d0-87cb62fac452",
    "client_full_name": "TestClient",
    "client_short_name": "TEST",
    "site_uuid": "007bb682-476e-4844-b67c-82ece91a9b09",
    "site_full_name": "TestSite",
    "station_uuid": "9a8ebbee-ddd1-4071-b17f-356f42867b5e",
    "station_full_name": "TestStation",
    "description": "",
    "model": "",
    "type": "",
    "status": "",
    "project_manager": {
        "full_name": "",
        "email": ""
    },
    "maintenance_frequency": "",
    "maintenance_log": "",
    "location_region": "",
    "latitude": 0,
    "longitude": 0,
    "altitude": 0,
    "timezone_offset": -5,
    "start_timestamp": "2020-01-01 00:00:00",
    "end_timestamp": "2020-12-31 23:59:59",
    "created_at": "2020-01-12T15:31:35.338369Z",
    "updated_at": "2021-01-08T22:10:36.904328Z",
    "data_files": [
      {
        "filename": "Test_OneMin.dat",
        "is_stale": false,
        "headers": {
          "columns": ["Ambient_Temp"],
          "units": ["Deg_C"],
          "processing": ["Avg"]
        },
        "created_at": "2020-01-12T15:31:35.338369Z",
        "updated_at": "2021-01-08T22:10:36.904328Z"
      }
    ],
    "data_file_prefix": "Test_"
  }
]
```

---
### Get Reports

Provides the ability to get reports

__JavaScript__:
```typescript
client.getReports(
    query?: GetReportsQuery | null,
    options?: {
        page_size?: number | null,
    },
): IterableResponse<Report>
```

__Python__:
```python
client.get_reports(
    query: GetReportsQuery | None,
    *,
    page_size: int | None,
) -> Iterator[Report]
```

Takes an optional get reports query object as an argument and returns a list of reports.

#### Get Reports Query

  | Param | Type | Description |
  |---|---|---|
  | station | string | Only return reports for station with UUID, name, or name matching pattern |
  | site | string | Only return reports for site with UUID, name, or name matching pattern |
  | client | string | Only return reports for client with UUID, name, or name matching pattern |
  | before | date | Only return reports that end on or before date ( format: `YYYY-MM-DD` ) |
  | after | date | Only return reports that start on or after date ( format: `YYYY-MM-DD` ) |
  | limit | number | Maximum number of reports to return |
  | offset | number | Number of reports to skip over before returning results |

##### Pattern Matching

Parameters that support patterns can use a wildcard `*` at the beginning and/or end of the string.

Pattern matching is case insensitive.

For example:

__JavaScript__:
```typescript
const reports = await client.getReports(
    {station: 'Test*'},
).toArray();
```

__Python__:
```python
reports = list(client.get_reports(
    {'station': 'Test*'},
))
```

Would return all reports for stations whose name starts with `Test`.

#### Options

##### Page Size

You can set an optional page size to control the number of reports returned per request from the API.
( min: 1, max: 100, default: 100 )

__JavaScript__:
```typescript
const reports = await client.getReports(
    null,
    {page_size: 50},
).toArray();
```

__Python__:
```python
reports = list(client.get_reports(
    None,
    page_size=50,
))
```

#### Return Values

Reports are returned in reverse chronological order.

##### Sample Output

```json
[
  {
    "key": "GR_SRMReport_TEST_TestStation_3a810e02-3d29-4730-9325-41246046e3ac.pdf",
    "package_name": "GR_SRMReport_TEST_TestStation_2020-12-31",
    "kind": "legacy-solar-resource-measurement-station-report",
    "station_uuid": "9a8ebbee-ddd1-4071-b17f-356f42867b5e",
    "start_date": "2020-01-01",
    "end_date": "2020-12-31",
    "status": "COMPLETE",
    "has_pdf": true,
    "published_at": "2021-02-14T23:46:11.827148Z",
    "created_at": "2020-01-12T15:31:35.338369Z",
    "updated_at": "2021-01-08T22:10:36.904328Z",
    "data_exports": [
        {
            "key": "TEST_TestStation_OneMin_4fcb5527-2b84-4b49-9623-9ffb0a0f8517.dat",
            "filename": "Test_OneMin.dat",
            "format": "",
            "format_options": {},
            "headers": {
              "columns": ["Ambient_Temp"],
              "units": ["Deg_C"],
              "processing": ["Avg"]
            },
            "start_timestamp": "2020-01-01 00:00:00",
            "end_timestamp": "2020-12-31 23:59:59",
            "record_count": 525600,
            "status": "COMPLETE",
            "created_at": "2020-01-12T15:31:35.338369Z",
            "updated_at": "2021-01-08T22:10:36.904328Z"
        }
    ],
    "files": [
        {
            "key": "GR_HourlyDataAggregation_TEST_TestStation_078d4a86-8145-4ef4-82c4-cdf81834306f.csv",
            "filename": "GR_HourlyDataAggregation_TEST_TestStation.csv",
            "description": "",
            "type": "",
            "created_at": "2020-01-12T15:31:35.338369Z",
            "updated_at": "2021-01-08T22:10:36.904328Z"
        }
    ]
  }
]
```

---
### Download Report

Provides the ability to download a report package to a local folder

__JavaScript__:
```typescript
client.downloadReport(
    report: Report,
    options?: {
        destination_folder?: string | null,
        max_concurrency?: number | null,
    },
): Promise<Array<string>>
```

__Python__:
```python
client.download_report(
    report: Report,
    *,
    destination_folder: str | None,
    max_concurrency: int | None,
) -> List[str]
```

Takes a report object as an argument, downloads all files for report and returns a list of files downloaded.

#### Options

##### Destination Folder

You can set a destination folder for the report files, otherwise the current working directory is used.

__JavaScript__:
```typescript
const downloadedFiles = await client.downloadReport(
    report,
    {destination_folder: '/tmp'},
);
```

__Python__:
```python
downloaded_files = client.download_report(
    report,
    destination_folder='/tmp',
))
```

##### Max Concurrency

You can set a max concurrency for how many files to downloaded in parallel.
( min: 1, default: 10 )

__JavaScript__:
```typescript
const downloadedFiles = await client.downloadReport(
    report,
    {max_concurrency: 1},
);
```

__Python__:
```python
downloaded_files = client.download_report(
    report,
    max_concurrency=1,
))
```

For the python client, threads are used for concurrency, to disable the use of threads set value to 1.

---
### Get Data Files

Provides the ability to get data files

__JavaScript__:
```typescript
client.getDataFiles(
    query?: GetDataFilesQuery | null,
    options?: {
        page_size?: number | null,
    },
): IterableResponse<DataFile>
```

__Python__:
```python
client.get_data_files(
    query: GetDataFilesQuery | None,
    *,
    page_size: int | None,
) -> Iterator[DataFile]
```

Takes an optional get data files query object as an argument and returns a list of data files.

#### Get Data Files Query

  | Param | Type | Description |
  |---|---|---|
  | filename | string | Only return data files with name or name matching pattern |
  | station | string | Only return data files for station with UUID, name, or name matching pattern |
  | site | string | Only return data files for site with UUID, name, or name matching pattern |
  | client | string | Only return data files for client with UUID, name, or name matching pattern |
  | limit | number | Maximum number of files to return |
  | offset | number | Number of files to skip over before returning results |

##### Pattern Matching

Parameters that support patterns can use a wildcard `*` at the beginning and/or end of the string.

Pattern matching is case insensitive.

For example:

__JavaScript__:
```typescript
const dataFiles = await client.getDataFiles(
    {filename: '*_OneMin.dat'},
).toArray();
```

__Python__:
```python
data_files = list(client.get_data_files(
    {'filename': '*_OneMin.dat'},
))
```

Would return all one minute data files.

#### Options

##### Page Size

You can set an optional page size to control the number of files returned per request from the API.
( min: 1, max: 100, default: 100 )

__JavaScript__:
```typescript
const dataFiles = await client.getDataFiles(
    null,
    {page_size: 50},
).toArray();
```

__Python__:
```python
data_files = list(client.get_data_files(
    None,
    page_size=50,
))
```

#### Return Values

Data files are returned in alphabetical order by filename.

##### Sample Output

```json
[
  {
    "source": "station:9a8ebbee-ddd1-4071-b17f-356f42867b5e",
    "source_start_timestamp": "2020-01-01 00:00:00",
    "source_end_timestamp": "2020-12-31 23:59:59",
    "filename": "Test_OneMin.dat",
    "is_stale": false,
    "headers": {
      "columns": ["Ambient_Temp"],
      "units": ["Deg_C"],
      "processing": ["Avg"]
    },
    "created_at": "2020-01-12T15:31:35.338369Z",
    "updated_at": "2021-01-08T22:10:36.904328Z"
  }
]
```

---
### Get Data Records

Provides the ability to get data records for a given data file

__JavaScript__:
```typescript
client.getDataRecords(
    query: GetDataRecordsQuery,
    options?: {
        include_qc_flags?: boolean | null,
        page_size?: number | null,
    },
): IterableResponse<DataRecord>
```

__Python__:
```python
client.get_data_records(
    query: GetDataRecordsQuery,
    *,
    include_qc_flags: bool | None,
    page_size: int | None,
) -> Iterator[DataRecord]
```

Takes a required get data records query object as an argument and returns a list of data records.

#### Get Data Records Query

  | Param | Type | Description |
  |---|---|---|
  | filename | string | Data file name to return records for *required* |
  | limit | number | Maximum number of records to return ( default: 1 when before and after are not set ) |
  | before | timestamp | Only return records at or before timestamp ( format: `YYYY-MM-DD hh:mm:ss` ) |
  | after | timestamp | Only return records at or after timestamp ( format: `YYYY-MM-DD hh:mm:ss` ) |

#### Options

##### Include QC Flags

By default each record will include the qc flags that apply to that data record. This behavior can be disabled.

For example:

__JavaScript__:
```typescript
const dataRecords = await client.getDataRecords(
    {filename: 'Test_OneMin.dat'},
    {include_qc_flags: false},
).toArray();
```

__Python__:
```python
data_records = list(client.get_data_records(
    {'filename': 'Test_OneMin.dat'},
    include_qc_flags=False,
))
```

Would return records without qc flags.

##### Page Size

You can set an optional page size to control the number of records returned per request from the API.
( min: 1, max: 1500, default: 1500 )

__JavaScript__:
```typescript
const dataRecords = await client.getDataRecords(
    {filename: 'Test_OneMin.dat'},
    {page_size: 60},
).toArray();
```

__Python__:
```python
data_records = list(client.get_data_records(
    {'filename': 'Test_OneMin.dat'},
    page_size=60,
))
```

#### Return Values

Data records are returned in reverse chronological order starting at the most recent timestamp.

##### Sample Output

```json
[
  {
    "timestamp": "2020-01-01 00:00:00",
    "record_num": 1000,
    "data": {
      "Ambient_Temp": 50
    },
    "qc_flags": {
      "Ambient_Temp": 1
    }
  }
]
```

---
### Get Data QC

Provides the ability to get only the qc flags for a given data file

__JavaScript__:
```typescript
client.getDataQC(
    query: GetDataQCQuery,
    options?: {
        page_size?: number | null,
    },
): IterableResponse<QCRecord>
```

__Python__:
```python
client.get_data_qc(
    query: GetDataQCQuery,
    *,
    page_size: int | None,
) -> Iterator[QCRecord]
```

Takes a required get data qc query object as an argument and returns a list of qc records.

#### Get Data QC Query

  | Param | Type | Description |
  |---|---|---|
  | filename | string | Data file name to return records for *required* |
  | limit | number | Maximum number of records to return ( default: 1 when before and after are not set ) |
  | before | timestamp | Only return records at or before timestamp ( format: `YYYY-MM-DD hh:mm:ss` ) |
  | after | timestamp | Only return records at or after timestamp ( format: `YYYY-MM-DD hh:mm:ss` ) |

#### Options

##### Page Size

You can set an optional page size to control the number of records returned per request from the API.
( min: 1, max: 1500, default: 1500 )

__JavaScript__:
```typescript
const qcRecords = await client.getDataQC(
    {filename: 'Test_OneMin.dat'},
    {page_size: 60},
).toArray();
```

__Python__:
```python
qc_records = list(client.get_data_qc(
    {'filename': 'Test_OneMin.dat'},
    page_size=60,
))
```

#### Return Values

QC records are returned in reverse chronological order starting at the most recent timestamp.

##### Sample Output

```json
[
  {
    "timestamp": "2020-01-01 00:00:00",
    "qc_flags": {
      "Ambient_Temp": 1
    }
  }
]
```

---
### Get Data (Advanced)

Provides the ability to get both data files and records for those files via a nested iterator

__JavaScript__:
```typescript
client.getData(
    query?: GetDataFilesQuery | GetDataQuery | null,
    options?: {
        include_data_records?: boolean | null,
        include_qc_flags?: boolean | null,
        file_page_size?: number | null,
        record_page_size?: number | null,
    },
): IterableResponse<DataFile> | IterableResponse<DataFileWithRecords>
```

__Python__:
```python
client.get_data(
    query: GetDataFilesQuery | GetDataQuery | None,
    *,
    include_data_records: bool | None,
    include_qc_flags: bool | None,
    file_page_size: int | None,
    record_page_size: int | None,
) -> Iterator[DataFile] | Iterator[DataFileWithRecords]
```

Takes an optional get data query object as an argument and returns a list of data files.

#### Get Data Query

  | Param | Type | Description |
  |---|---|---|
  | filename | string | Only return data files with name or name matching pattern |
  | station | string | Only return data files for station with UUID, name, or name matching pattern |
  | site | string | Only return data files for site with UUID, name, or name matching pattern |
  | client | string | Only return data files for client with UUID, name, or name matching pattern |
  | limit | number | Maximum number of files to return |
  | offset | number | Number of files to skip over before returning results |
  | records_limit | number | Maximum number of records to return per file ( default: 1 when before and after are not set ) |
  | records_before | timestamp | Only return records at or before timestamp ( format: `YYYY-MM-DD hh:mm:ss` ) |
  | records_after | timestamp | Only return records at or after timestamp ( format: `YYYY-MM-DD hh:mm:ss` ) |

##### Pattern Matching

Parameters that support patterns can use a wildcard `*` at the beginning and/or end of the string.

Pattern matching is case insensitive.

For example:

__JavaScript__:
```typescript
const dataFiles = await client.getData(
    {filename: '*_OneMin.dat'},
).toArray();
```

__Python__:
```python
data_files = list(client.get_data(
    {'filename': '*_OneMin.dat'},
))
```

Would return all one minute data files.

#### Options

##### Include Data Records

When this option is set true, data records are returned for each data file in reverse chronological order starting at the most recent timestamp.

For example:

__JavaScript__:
```typescript
for await (const dataFile of client.getData(
    null,
    {include_data_records: true},
)) {
    const dataRecords = await dataFile.records.toArray();
}
```

__Python__:
```python
for data_file in client.get_data(
    None,
    include_data_records=True,
):
    data_records = list(data_file['records'])
```

Would return data files with records.

##### Include QC Flags

By default each record will include the qc flags that apply to that data record. This behavior can be disabled.

For example:

__JavaScript__:
```typescript
for await (const dataFile of client.getData(
    null,
    {
        include_data_records: true,
        include_qc_flags: false,
    },
)) {
    const dataRecords = await dataFile.records.toArray();
}
```

__Python__:
```python
for data_file in client.get_data(
    None,
    include_data_records=True,
    include_qc_flags=False,
):
    data_records = list(data_file['records'])
```

Would return records without qc flags.

##### File Page Size

You can set an optional page size to control the number of files returned per request from the API.
( min: 1, max: 100, default: 100 )

__JavaScript__:
```typescript
const dataFiles = await client.getData(
    null,
    {file_page_size: 50},
).toArray();
```

__Python__:
```python
data_files = list(client.get_data(
    None,
    file_page_size=50,
))
```

##### Record Page Size

You can set an optional page size to control the number of records returned per request from the API.
( min: 1, max: 1500, default: 1500 )

__JavaScript__:
```typescript
const dataFiles = await client.getData(
    null,
    {record_page_size: 60},
).toArray();
```

__Python__:
```python
data_files = list(client.get_data(
    None,
    record_page_size=60,
))
```

#### Return Values

Data files are returned in alphabetical order by filename.

##### Sample Output

```json
[
  {
    "source": "station:9a8ebbee-ddd1-4071-b17f-356f42867b5e",
    "source_start_timestamp": "2020-01-01 00:00:00",
    "source_end_timestamp": "2020-12-31 23:59:59",
    "filename": "Test_OneMin.dat",
    "is_stale": false,
    "headers": {
      "columns": ["Ambient_Temp"],
      "units": ["Deg_C"],
      "processing": ["Avg"]
    },
    "created_at": "2020-01-12T15:31:35.338369Z",
    "updated_at": "2021-01-08T22:10:36.904328Z",
    "records": [
      {
        "timestamp": "2020-01-01 00:00:00",
        "record_num": 1000,
        "data": {
          "Ambient_Temp": 50
        },
        "qc_flags": {
          "Ambient_Temp": 1
        }
      }
    ]
  }
]
```

---
### Post Data

Provides the ability to create data files and upload records to those files

__JavaScript__:
```typescript
client.postData(
    payload: PostDataPayload,
): Promise<void>
```

__Python__:
```python
client.post_data(
    payload: PostDataPayload,
) -> None
```

Takes a post data payload object as an argument and uploads it to the cloud.

#### Post Data Payload

  | Param | Type | Description |
  |---|---|---|
  | source | string | The station that collected the data |
  | files | Array<DataFile> | Array of data files ( min length: 1, max length: 20 ) |
  | files[].filename | string | Filename using the format `<client prefix>_<station>_<OneMin|Hourly|Meta>.dat` |
  | files[].headers | DataFileHeaders | Optional headers for the file |
  | files[].headers.meta | Record<string, string> | User defined meta data for the file |
  | files[].headers.columns | Array<string> | Array of column names matching the data keys |
  | files[].headers.units | Array<string> | Array of units for the columns |
  | files[].headers.processing | Array<string> | Array of processing used for column data (Min, Max, Avg) |
  | files[].records | Array<DataRecord> | Array of data records for file ( max length: 100 combined across all files ) |
  | files[].records[].timestamp | timestamp | The timestamp of the data record in UTC ( format: `YYYY-MM-DD hh:mm:ss` ) |
  | files[].records[].record_num | number | Positive sequential number for records in file |
  | files[].records[].data | Record<string, any> | Data for record, keys should match `header.columns` |
  | overwrite | boolean | Whether to overwrite existing data records when timestamps match |
