import {SchemaValidator, ConfigurationTypes} from '../../src/configuration/schema-validator';
import * as path from 'path';
import Config from '../../src/configuration/system';
import {Database} from '../../lib/db';
import {DbConfig, SQLLoader} from '../../src/configuration/loaders/sql';
import {File} from '../../lib/file';
import {SqlSetupConfig, CsvSetupConfig, HttpSetupConfig} from '../../src/configuration/loader';
import {createReadStream} from 'fs';
import {HttpConfig, HTTPLoader} from '../../src/configuration/loaders/http';
import {HTTPClient} from '../../lib/http-client';
import { CSVLoader } from '../../src/configuration/loaders/csv';

jest.mock('../../lib/db');
jest.mock('../../lib/file');
jest.mock('../../lib/http-client');

const samplesPath = path.join(Config.rootUri, '__tests__', 'samples');

const configLoader = [
    {
        type: ConfigurationTypes.CSV,
        path: path.join(samplesPath, 'test-csv.yml')
    },
    {
        type: ConfigurationTypes.SQL,
        path: path.join(samplesPath, 'test-sql.yml')
    },
    {
        type: ConfigurationTypes.HTTP,
        path: path.join(samplesPath, 'test-http.yml')
    },
];

let processedConfig:any[];

beforeAll(async () => {
    const validator = new SchemaValidator(configLoader);
    processedConfig = await validator.run();
});

test('Should Get SQL Loader array', async () => {
    expect(!processedConfig || processedConfig.length < 1).toBeFalsy();

    const sqlSetup:SqlSetupConfig[] = [];

    for (const rawConfig of processedConfig) {
        if (rawConfig.type === ConfigurationTypes.SQL) {
            const dbConfig = rawConfig.configuration.database_connection as DbConfig;
            const sqlFile = rawConfig.configuration.sqlfile;
            const loaderName = rawConfig.configuration.connection_name;

            const db = await Database.connect(
                loaderName,
                {
                    database: dbConfig.database_name,
                    dialect: dbConfig.dialect,
                    host: dbConfig.host,
                    password: dbConfig.password,
                    port: dbConfig.port,
                    user: dbConfig.user,
                });

            sqlSetup.push({
                db,
                name: loaderName,
                sqlFile: new File(),
                sqlFilePath: sqlFile,
            });

        } else {
            console.log('Not SQL COnfiguration');
        }
    }

    expect(sqlSetup.length).toBeGreaterThan(0);

    const sqlData = [];
    for (const config of sqlSetup) {
        const loader = new SQLLoader(
            config.name, config.db,
            config.sqlFilePath,
            config.sqlFile
        );

        const data = await loader.loadData();
        sqlData.push({
            name: config.name,
            data: [...data]
        });
    }

    expect(Array.isArray(sqlData)).toBeTruthy();
    expect(sqlData.length).toBeGreaterThan(0);
    expect(sqlData[0].hasOwnProperty('name')).toBeTruthy();
    expect(Array.isArray(sqlData[0].data)).toBeTruthy();
    expect(sqlData[0].data.length).toBeGreaterThan(0);
    expect(sqlData[0].data[0].hasOwnProperty('id')).toBeTruthy();
    expect(sqlData[0].data[0].hasOwnProperty('phone')).toBeTruthy();
    expect(sqlData[0].data[0].hasOwnProperty('refDate')).toBeTruthy();
    expect(sqlData[0].data[0].hasOwnProperty('chp')).toBeTruthy();

});

test('Should Get CSV Loader array', async () => {
    expect(!processedConfig || processedConfig.length < 1).toBeFalsy();

    const csvSetup:CsvSetupConfig[] = [];

    for (const rawConfig of processedConfig) {

        if (rawConfig.type === ConfigurationTypes.CSV) {
            csvSetup.push({
                name: rawConfig.configuration.key,
                filestream: createReadStream(rawConfig.configuration.filepath),
                Reader: new File(),
            });
        } else {
            console.log('Not CSV Configuration!');
        }

    }

    expect(csvSetup.length).toBeGreaterThan(0);

    const csvData = [];
    for (const config of csvSetup) {
        const loader = new CSVLoader(config.name, config.filestream, config.Reader);

        const data = await loader.loadData();

        csvData.push({
            name: config.name,
            data: [...data]
        });
    }

    expect(Array.isArray(csvData)).toBeTruthy();
    expect(csvData.length).toBeGreaterThan(0);
    expect(csvData[0].hasOwnProperty('name')).toBeTruthy();
    expect(Array.isArray(csvData[0].data)).toBeTruthy();
    expect(csvData[0].data.length).toBeGreaterThan(0);
    expect(csvData[0].data[0].hasOwnProperty('id')).toBeTruthy();
    expect(csvData[0].data[0].hasOwnProperty('phone')).toBeTruthy();
    expect(csvData[0].data[0].hasOwnProperty('refDate')).toBeTruthy();
    expect(csvData[0].data[0].hasOwnProperty('chp')).toBeTruthy();
});

test('Should Get HTTP Loader array', async () => {
    expect(!processedConfig || processedConfig.length < 1).toBeFalsy();

    const httpSetup:HttpSetupConfig[] = [];

    for (const rawConfig of processedConfig) {

        if (rawConfig.type === ConfigurationTypes.HTTP) {
            httpSetup.push({
                name: rawConfig.configuration.name,
                httpConfig: rawConfig.configuration as HttpConfig,
                httpClient: new HTTPClient(HTTPLoader.generateAuthHeader(rawConfig.configuration as HttpConfig)),
            });
        } else {
            console.log('Not HTTP Configuration!');
        }

    }

    expect(httpSetup.length).toBeGreaterThan(0);

    const httpData = [];
    for (const config of httpSetup) {
        const loader = new HTTPLoader(config.httpConfig, config.httpClient);

        const data = await loader.loadData();

        httpData.push({
            name: config.name,
            data: [...data]
        });
    }

    expect(Array.isArray(httpData)).toBeTruthy();
    expect(httpData.length).toBeGreaterThan(0);
    expect(httpData[0].hasOwnProperty('name')).toBeTruthy();
    expect(Array.isArray(httpData[0].data)).toBeTruthy();
    expect(httpData[0].data.length).toBeGreaterThan(0);
    expect(httpData[0].data[0].hasOwnProperty('id')).toBeTruthy();
    expect(httpData[0].data[0].hasOwnProperty('phone')).toBeTruthy();
    expect(httpData[0].data[0].hasOwnProperty('refDate')).toBeTruthy();
    expect(httpData[0].data[0].hasOwnProperty('chp')).toBeTruthy();
});
