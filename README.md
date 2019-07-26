Block explorer
========

`plugblockchain/explorer` is a monorepo of various components required to run PL^G block explorer application including data extraction (ETL), API and web UI.

![Screenshot](screenshot.png)

Prerequisites
-------------

-   Docker
-   PL^G node
    - when syncing with an existing chain please wait until sync is completed before starting Docker 
    - for running a node locally on your machine follow instructions in [PL^G Blockchain](../../../plug-blockchain). Please ensure WebSocket is on `--ws-external` and node is accessible from Docker  
    Optionally, you may want to build/run your node with Rust  `--release` option to overcome WASM optimization issue e.g.  

      ```
      cargo build --release
      ```
      or
      ```
      cargo run --release -- --dev --ws-external --rpc-external --pruning=archive
      ```       

Getting Started
----------

1.  Clone the repository

    ```
    git clone https://github.com/plugblockchain/explorer.git
    ```

2.  Change configuration settings in

        etl/settings/appsettings.json

    -   `node.ws`: where your PL^G node is hosted e.g. `ws://127.0.0.1:9944` (alternatively `wss://127.0.0.1:9944` for secured connection) or any publicly available PL^G node.   
    **Note**: Docker may have problem to resolve IP address when connecting to a service on local host, please use `host.docker.internal:9944` instead, e.g.

         ```
         "node": {
           "ws": "ws://host.docker.internal:9944"
         },
         ```

3.  Build and start containers locally

    ```
    docker-compose up --build
    ```

4.  Open block explorer in your browser: <http://localhost:3000>
    - open API in your browser, e.g. <http://localhost:8080/blocks>
    - access database using your favourite PostgreSQL client: `postgresql://username:password@localhost:5433/plugnetdata`

5.  Shut down the containers

    ```
    docker-compose down
    ```
