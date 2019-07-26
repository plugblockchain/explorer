Extraction ETL
=====
Scripts to extract blocks, transactions and other data from a CENNZnet node.
Generic enough to store data in any SQL database (e.g. PostgreSQL or MySQL).


Install dependencies
-----

- node version: 10.14.2 or higher
- yarn version: 1.15.2 or higher
- typescript version: 3.2.2 or higher

```
yarn install
```

Build
-----

```
yarn run build
```

Usage
-----

```
yarn run start
```

Schema
-----

## asset

| Column           | Type    |
| ---------------- | ------- |
| hash             | text    |
| id               | int4    |
| initial_issuance | numeric |
| block_number     | int8    |
| timestamp        | int8    |
| symbol           | text    |
| creator          | text    |
| fee              | numeric |
| type             | text    |


## balance

| Column           | Type    |
| ---------------- | ------- |
| address          | text    |
| balance          | numeric |
| block_number     | int8    |
| asset_id         | int4    |
| reserved_balance | numeric |


## block

| Column            | Type    |
| ----------------- | ------- |
| number            | int8    |
| hash              | text    |
| parent_hash       | text    |
| state_root        | text    |
| extrinsics_root   | text    |
| timestamp         | int8    |
| transaction_count | int8    |
| base_fee          | numeric |
| byte_fee          | numeric |
| transfer_fee      | numeric |
| author            | text    |
| extrinsic_count   | int2    |

## contract 

| Column       | Type    |
| ------------ | ------- |
| address      | text    |
| block_number | int8    |
| timestamp    | int8    |
| endowment    | numeric |
| gas_limit    | numeric |
| code_hash    | text    |
| data         | text    |
| creator      | text    |
| byte_code    | text    |
| fee          | numeric |
| name         | text    |


## event

| Column          | Type |
| --------------- | ---- |
| block_number    | int8 |
| block_hash      | text |
| data            | text |
| section         | text |
| method          | text |
| extrinsic_index | int8 |
| meta            | text |


## extrinsic

| Column       | Type |
| ------------ | ---- |
| hash         | text |
| block_number | int8 |
| block_hash   | text |
| args         | text |
| section      | text |
| method       | text |
| index        | int8 |
| signer       | text |
| meta         | text |


## session

| Column           | Type   |
| ---------------- | ------ |
| block_number     | int8   |
| session_progress | int2   |
| session_length   | int2   |
| era_progress     | int2   |
| era_length       | int2   |
| validators       | text[] |


## trace

| Column           | Type  |
| ---------------- | ----- |
| transaction_hash | text  |
| from_address     | text  |
| to_address       | text  |
| value            | value |
| asset_id         | int4  |
| block_number     | int8  |
| timestamp        | int8  |
| index            | int8  |
| block_hash       | text  |


## transaction

| Column       | Type    |
| ------------ | ------- |
| hash         | text    |
| block_number | int8    |
| block_hash   | text    |
| from_address | text    |
| to_address   | text    |
| value        | numeric |
| fee          | numeric |
| nonce        | int8    |
| size         | int8    |
| status       | bool    |
| timestamp    | int8    |
| asset_id     | int4    |
| gas_limit    | numeric |
| index        | int8    |
| type         | text    |
| data         | text    |


## validator

| Column       | Type    |
| ------------ | ------- |
| address      | text    |
| block_number | int8    |
| event        | text    |
| value        | numeric |
| asset_id     | int4    |