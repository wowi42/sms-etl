import {Loader} from '../../configuration/loader';
import {SchemaValidator, ConfigurationTypes} from '../../configuration/schema-validator';
import * as path from 'path';
import Config from '../../configuration/system';
import {Database} from '../../lib/db';
import { DbConfig, SQLLoader } from '../../configuration/loaders/sql';

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

let processedConfig;

beforeAll(async () => {
    const validator = new SchemaValidator(configLoader);
    processedConfig = await validator.run();
});

test('Should Get SQL Loader array', async () => {
    expect(!processedConfig || processedConfig.length < 1).toBeFalsy();

    for (const rawConfig of processedConfig) {
        if (rawConfig.type === ConfigurationTypes.SQL) {
            const dbConfig = rawConfig.configuration.database_connection as DbConfig;
            const sqlFile = rawConfig.configuration.sql_file;
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

            const sqlLoader = new SQLLoader(loaderName, db, sqlFile);
            expect(sqlLoader.name).toBe(loaderName);
            // expect
        }
    }

});

test('Should Get CSV Loader array', done => {
    done();
});

test('Should Get HTTP Loader array', done => {
    done();
});

test('Should fail while getting array of loaders', done => {
    done();
});
