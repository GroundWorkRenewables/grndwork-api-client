# Groundwork API Client

API client for [GroundWork Renewables](grndwork.com)

## Installation

```
$ npm install @grndwork/api-client
```

## Usage

```js
import {createClient} from '@grndwork/api-client';

const client = createClient();

const data = await client.getData();
```

In order to access https://api.grndwork.com you must first obtain a refresh token from GroundWork Renewables.

The path to this file can be provided to the client using the `GROUNDWORK_TOKEN_PATH` environment variable.

Or the subject and token values from this file can be provided using the `GROUNDWORK_SUBJECT` and `GROUNDWORK_TOKEN` environment variables.

When providing subject and token values `GROUNDWORK_TOKEN_PATH` must not be set.

## API

### Get Stations

```typescript
client.getStations(query?: GetStationsQuery): Promise<Array<Station>>
```

Takes an optional get stations query object as an argument and returns an array of stations.

#### Get Stations Query Parameters

  | Param | Type | Description |
  |---|---|---|
  | station | string | Only return stations with UUID, name, or name matching pattern |
  | site | string | Only return stations for site with UUID, name, or name matching pattern |
  | client | string | Only return stations for client with UUID, name, or name matching pattern |
  | limit | number | Number of stations to return ( min: 1, max: 100, default: 20 ) |
  | offset | number | Number of stations to skip over when paging results ( default: 0 ) |

##### Pattern Matching

Parameters that support patterns can use a wildcard `*` at the beginning and/or end of the string.

Pattern matching is case insensitive.

For example:

```js
const data = await client.getStations({
  station: 'Test*',
});
```

Would return all stations whose name starts with `Test`.

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
    "latitude": 0,
    "longitude": 0,
    "altitude": 0,
    "timezone_offset": -5,
    "start_timestamp": "2020-01-01 00:00:00",
    "end_timestamp": "2020-12-31 23:59:59",
    "data_file_prefix": "Test_",
    "data_files": [
      {
        "filename": "Test_OneMin.dat",
        "is_stale": false,
        "headers": {
          "columns": "Ambient_Temp",
          "units": "Deg_C",
          "processing": "Avg"
        }
      }
    ]
  }
]
```

### Get Data

```typescript
client.getData(query?: GetDataQuery): Promise<Array<DataFile>>
```

Takes an optional get data query object as an argument and returns an array of data files.

#### Get Data Query Parameters

  | Param | Type | Description |
  |---|---|---|
  | filename | string | Only return data files with name or name matching pattern |
  | station | string | Only return data files for station with UUID, name, or name matching pattern |
  | site | string | Only return data files for site with UUID, name, or name matching pattern |
  | client | string | Only return data files for client with UUID, name, or name matching pattern |
  | limit | number | Number of files to return ( min: 1, max: 100, default: 20 ) |
  | offset | number | Number of files to skip over when paging results ( default: 0 ) |
  | records_limit | number | Number of records to return per file ( min: 1, max: 1500, default: 1 ) |
  | records_before | timestamp | Only return records at or before timestamp ( format: `yyyy-mm-dd hh:mm:ss` ) |
  | records_after | timestamp | Only return records at or after timestamp ( format: `yyyy-mm-dd hh:mm:ss` ) |

##### Pattern Matching

Parameters that support patterns can use a wildcard `*` at the beginning and/or end of the string.

Pattern matching is case insensitive.

For example:

```js
const data = await client.getData({
  filename: '*_OneMin.dat',
});
```

Would return all one minute data files.

#### Return Values

Data files are returned in alphabetical order by filename.

Records are returned in reverse chronological order starting at the most recent timestamp.

By default each data file includes the most recent data record.

Only a single data file will be returned at a time when requesting multiple data records.

For example:

```js
const data = await client.getData({
  records_limit: 100,
});
```

Would return the most recent 100 records from the first file alphabetically.

##### Sample Output

```json
[
  {
    "source": "station:9a8ebbee-ddd1-4071-b17f-356f42867b5e",
    "filename": "Test_OneMin.dat",
    "is_stale": false,
    "headers": {
      "columns": "Ambient_Temp",
      "units": "Deg_C",
      "processing": "Avg"
    },
    "records": [
      {
        "timestamp": "2020-01-01 00:00:00",
        "record_num": 1000,
        "data": {
          "Ambient_Temp": 50
        }
      }
    ]
  }
]
```

### Post Data

```typescript
client.postData(payload: PostDataPayload): Promise<void>
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
  | files[].records[].timestamp | timestamp | The timestamp of the data record in UTC ( format: `yyyy-mm-dd hh:mm:ss` ) |
  | files[].records[].record_num | number | Positive sequential number for records in file |
  | files[].records[].data | Record<string, any> | Data for record, keys should match `header.columns` |
  | overwrite | boolean | Whether to overwrite existing data records when timestamps match |
