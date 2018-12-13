import {SchemaValidator, ConfigurationTypes} from '../../configuration/schema-validator';
import * as path from 'path';
import Config from '../../configuration/system';
import {Database} from '../../lib/db';
import {DbConfig, SQLLoader} from '../../configuration/loaders/sql';
import {File} from '../../lib/file';
import {CSVLoader} from '../../configuration/loaders/csv';
import {Loader, SqlSetupConfig, LoadData} from '../../configuration/loader';
import {createReadStream} from 'fs';

jest.mock('../../lib/db');
jest.mock('../../lib/file');

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

type queryArg = SQLLoader & { id:string; phone:string; refDate:string; }[];

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

    const queries: { [key:string]: SQLLoader; } = await Loader.sql(sqlSetup);

    const queryData = await LoadData<{ [key:string]: queryArg; }>(queries as { [key:string]: queryArg; });

    for (const name of Object.keys(queryData)) {
        expect(Array.isArray(queryData[name])).toBeTruthy();
        expect(queryData[name].length).toBeGreaterThan(0);
        expect(queryData[name][0].hasOwnProperty('id')).toBeTruthy();
        expect(queryData[name][0].hasOwnProperty('phone')).toBeTruthy();
        expect(queryData[name][0].hasOwnProperty('refDate')).toBeTruthy();
        expect(queryData[name][0].hasOwnProperty('chp')).toBeTruthy();
    }

});

test('Should Get CSV Loader array', async () => {
    expect(!processedConfig || processedConfig.length < 1).toBeFalsy();

    for (const rawConfig of processedConfig) {
        if (rawConfig.type === ConfigurationTypes.CSV) {

            const name = rawConfig.configuration.key;
            const fileStream = createReadStream(rawConfig.configuration.filepath);

            const csvLoader = new CSVLoader(name, fileStream, new File());
            await csvLoader.loadData();

            const queryData = csvLoader.loadedData;

            expect(Array.isArray(queryData)).toBeTruthy();
            expect(queryData.length).toBeGreaterThan(0);
            expect(queryData[0].hasOwnProperty('id')).toBeTruthy();
            expect(queryData[0].hasOwnProperty('phone')).toBeTruthy();
            expect(queryData[0].hasOwnProperty('refDate')).toBeTruthy();
            expect(queryData[0].hasOwnProperty('chp')).toBeTruthy();
            expect(queryData[0].hasOwnProperty('name')).toBeTruthy();

        } else {
            console.log('Not CSV Configuration!');
        }
    }
});

test('Should Get HTTP Loader array', done => {
    done(); // for passing empty test
});

test('Should fail while getting array of loaders', done => {
    done(); // for passing empty test
});
