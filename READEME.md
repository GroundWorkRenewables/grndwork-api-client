# Groundwork API Client
## Installation
```
$ npm install @grndwork/api-client
```

# Create a client
## Factory Method Configuration
The `createClient` factory method uses environment variables to configure the client. There are two ways to set these configuration environment variables:
- To load the token file provided by Groundwork:

  `GROUNDWORK_TOKEN_PATH` - Full path to the refresh token file.

- Set the coniguration using the values in the refresh token file:

  `GROUNDWORK_TOKEN` - Token value from the refresh token file

  `GROUNDWORK_SUBJECT` - Subject value from the refresh token file
> If all 3 variables are set the client will be configured using `GROUNDWORK_TOKEN_PATH`.

```ts
import {createClient, LOGGERNET_PLATFORM} from '@grndwork/api-client';

const client = createClient(LOGGERNET_PLATFORM);
```

## Direct Configuration
Using the values for subject and token from the token file.
```ts
import {Client} from '@grndwork/api-client';

const client = new Client({
  subject: 'client:id',
  token: 'token',
});
```

# API Access
## Get Data
The data endpoint returns a list of `DataFiles`. Each data file will contain 1 `DataRecord`. To obtain more than 1 `DataRecord` for a file the `limit` query parameter must not be set or be set to 1.

Default:
```ts
await client.getData();
```

## Get Multiple DataRecords for a single file
  Set the query parameters:
```ts
await client.getData({
  query: {
    filename='myfile.dat',
    records_limit=10,
  }
})
```

### Query Parameters
  |  |  |
  |---|---|
  | client | Client UUID or Client Name pattern match |
  | site | Site UUID or Site Name pattern match |
  | gateway | Gateway UUID or Gateway Name pattern match |
  | station |  Station UUID or Station Name pattern match |
  | filename | Name of the file with pattern match |
  | limit | Limit the number of files returned. |
  | offset | File or Record offset for paging |
  | records_before | UTC Timestamp ( `yyyy-mm-dd hh:mm:ss` ) |
  | records_after | UTC Timestamp ( `yyyy-mm-dd hh:mm:ss` ) |
  | records_limit | Limit the number of records returned for a file.

### Patern Matching
  Query parameters that support pattern matching can use a wildcard operator (`*`) at the beginning and or end of the string. These fields are not case sensitive.
  | Property | Pattern | Result |
  | -------- | ------- | ------ |
  | filename | *.dat | will find files ending with "dat". |
  | filename | \*OneMin* | will find one minute files. |
  | site | Grndwork | will find sites starting with Grndwork. |

### `limit` & `records_limit`
| limit | records_limit | Result |
| --- | --- | --- |
| default | default or 1 | multiple `DataFiles` with 1 `DataRecord`|
| >1 | default or 1 | multiple `DataFiles` with 1 `DataRecord` |
| default or 1 | >1 | 1 `DataFile` with multiple `DataRecord`|
| 1 | >1 | 1 `DataFile` with multiple `DataRecord`|
| >1 | >1 | Error






