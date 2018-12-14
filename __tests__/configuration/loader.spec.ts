import {SchemaValidator, ConfigurationTypes} from '../../configuration/schema-validator';
import * as path from 'path';
import Config from '../../configuration/system';
import {Database} from '../../lib/db';
import {DbConfig} from '../../configuration/loaders/sql';
import {File} from '../../lib/file';
import {Loader, SqlSetupConfig, CsvSetupConfig, HttpSetupConfig} from '../../configuration/loader';
import {createReadStream} from 'fs';
import {HttpConfig, HTTPLoader} from '../../configuration/loaders/http';
import {HTTPClient} from '../../lib/http-client';

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
    {
        type: ConfigurationTypes.UNSUBSCRIPTION,
        path: path.join(samplesPath, 'test-unsubscription.yml')
    },
    {
        type: ConfigurationTypes.SUBSCRIPTION,
        path: path.join(samplesPath, 'test-subscription.yml')
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

    const loader = new Loader();

    await loader.load(sqlSetup as SqlSetupConfig[], 'sql');

    await loader.loadData();

    for (const name of Object.keys(loader.dataList)) {
        expect(Array.isArray(loader.dataList[name])).toBeTruthy();
        expect(loader.dataList[name].length).toBeGreaterThan(0);
        expect(loader.dataList[name][0].hasOwnProperty('id')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('phone')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('refDate')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('chp')).toBeTruthy();
    }

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

    const loader = new Loader();

    await loader.load(csvSetup as CsvSetupConfig[], 'csv');

    await loader.loadData();

    for (const name of Object.keys(loader.dataList)) {
        expect(Array.isArray(loader.dataList[name])).toBeTruthy();
        expect(loader.dataList[name].length).toBeGreaterThan(0);
        expect(loader.dataList[name][0].hasOwnProperty('id')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('phone')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('refDate')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('chp')).toBeTruthy();
        expect(loader.dataList[name][0].hasOwnProperty('name')).toBeTruthy();
    }
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

    const loader = new Loader();

    await loader.load(httpSetup as HttpSetupConfig[], 'http');

    await loader.loadData();

    for (const name of Object.keys(loader.dataList)) {
        expect(loader.dataList[name].hasOwnProperty('data')).toBeTruthy();
        expect(loader.dataList[name].hasOwnProperty('status')).toBeTruthy();
        expect(loader.dataList[name].hasOwnProperty('statusText')).toBeTruthy();

        expect(Array.isArray(loader.dataList[name].data)).toBeTruthy();
        expect(loader.dataList[name].data.length).toBeGreaterThan(0);
        expect(loader.dataList[name].data[0].hasOwnProperty('id')).toBeTruthy();
        expect(loader.dataList[name].data[0].hasOwnProperty('phone')).toBeTruthy();
        expect(loader.dataList[name].data[0].hasOwnProperty('refDate')).toBeTruthy();
        expect(loader.dataList[name].data[0].hasOwnProperty('chp')).toBeTruthy();
        expect(loader.dataList[name].data[0].hasOwnProperty('name')).toBeTruthy();
        expect(loader.dataList[name].data[0].hasOwnProperty('location')).toBeTruthy();
    }
});
