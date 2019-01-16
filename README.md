# SMS ETL Service

> This is a service that allows programmatic creation of subscription on Livinggoods SMS Platform. It extracts data from `SQL` database, `CSV` files and `HTTP` webhooks, loads the data from the respective sources and transforms the data to subscription or unsubscription data packets. Then performs SMS Api request.

## Setup and Installation

### Pre-requisite

In order to use the service on your server you have to understand the follow:

1. The service uses configurations to perform the ETL.
2. The service uses `YAML` form of configuration (files).
3. The configuration are accessed per folder i.e. save configurations per folder in the following format

    ```text
    - Root_Configuration_Folder
        - sample-configuration_1
            - sql.config.yml
            - http.config.yml
            - csv.config.yml
            - subscription.config.yml
        - sample-configuration_2
            - sql.config.yml
            - http.config.yml
            - csv.config.yml
            - unsubscription.config.yml
    ```

    Depending on the data source please ensure to name the config respectively e.g. for `SQL` data source, config will be `sql.config.yml`.

4. The service requires that a environments file be created on the root of the project.

    The contents of the environments file are:

    ```text
    SMS_API_ID=
    SMS_API_KEY=
    SMS_API_URL=

    LOG_PATH=     # where all log files will be created (REQUIRED)
    CONFIG_PATH=      # where all the configurations are located (REQUIRED)
    ```

5. The service runs a server running on `PORT=5005`. This server serves:

    - `istanbul` test coverage, url is: `http://localhost:5005/test/coverage/`
    - Logs *(WIP)*. Log level are: `info`, `error`, `warn`. url is: `http://localhost:5005/logs/:level/`
    - Configurations *(WIP)*. url is: `http://localhost:5005/configurations/`

6. The following softwares should be available for the service to work:

    - Node version 10.+
    - Npm version 6.+
    - Docker version 18.+ (optional)

7. The following npm packages should be available as well:

    - forever
    - node-gyp
    - jest
    - gulp
    - webpack

### Installation

> You require access to the repository in order to clone the repository

1. git clone the repository `git clone https://bitbucket.org/livinggoods/sms-api-etl.git`
2. install dependencies `npm install`
3. create `.env` file on the root of the project

#### Common Issues

1. If `npm install` fails to install, please ensure to delete your `package-lock.json` and try `npm install` again.
2. If errors on file not found especially `configuration file` or `logs directory` ensure to check your `.env` file that it is up to date.

## Usage

This section we discuss how to use the `SMS-ETL` service.
