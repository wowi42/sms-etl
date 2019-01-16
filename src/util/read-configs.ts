import * as path from 'path';
import {Util} from '../lib/util';
import {Log} from '../../lib/log';
import {SqlSetupConfig, CsvSetupConfig, HttpSetupConfig} from '../configuration/loader';
import {ConfigurationTypes, SchemaValidator} from '../configuration/schema-validator';
import {DbConfig} from '../configuration/loaders/sql';
import {Database} from '../../lib/db';
import {File} from '../../lib/file';
import { createReadStream } from 'fs';
import {HttpConfig, HTTPLoader} from '../configuration/loaders/http';
import {HTTPClient} from '../../lib/http-client';

export const sourceReaders = {
    async sql(configDir:string) {
        const sql = `${configDir}/src-sql/`;

        try {
            await Util.checkIfDirectoryExist(sql);
        } catch (e) {
            Log.error('Configuration directory does not exist');
            process.exit(1);
        }

        let dirs:string[];
        try {
            dirs = await Util.readDirectory(sql);
            Log.info('Number of configuration directories: ' + dirs.length);
        } catch (e) {
            Log.error(e, {logger: 'ReadDirectory-Cron'});
            process.exit(1);
        }

        const configs = [];

        for (const dir of dirs) {
            configs.push({
                type: ConfigurationTypes.SQL,
                path: path.resolve(dir),
            });
        }

        const schemaValidator = new SchemaValidator(configs);

        let processedConfig;
        try {
            processedConfig = await schemaValidator.run();
        } catch (e) {
            Log.error(e, {logger: 'SchemaValidator - Cron'});
        }

        const sqlSetup:SqlSetupConfig[] = [];

        for (const config of processedConfig) {
            const dbConfig = config.configuration.database_connection as DbConfig;
            const sqlFile = config.configuration.sqlfile;
            const loaderName = config.configuration.connection_name;

            try {
                const db = await Database.connect(loaderName,
                        {
                            database: dbConfig.database_name,
                            dialect: dbConfig.dialect,
                            host: dbConfig.host,
                            password: dbConfig.password,
                            port: dbConfig.port,
                            user: dbConfig.user,
                        }
                    );

                sqlSetup.push({
                    db,
                    name: loaderName,
                    sqlFile: new File(),
                    sqlFilePath: sqlFile,
                });

            } catch (e) {
                Log.error(e, {logger: 'SetupConfig'});
            }
        }

        return sqlSetup;
    },
    async csv(configDir:string) {
        const csv = `${configDir}/src-csv/`;

        try {
            await Util.checkIfDirectoryExist(csv);
        } catch (e) {
            Log.error('Configuration directory does not exist');
            process.exit(1);
        }

        let dirs:string[];
        try {
            dirs = await Util.readDirectory(csv);
            Log.info('Number of configuration directories: ' + dirs.length);
        } catch (e) {
            Log.error(e, {logger: 'ReadDirectory-Cron'});
            process.exit(1);
        }

        const configs = [];

        for (const dir of dirs) {
            configs.push({
                type: ConfigurationTypes.CSV,
                path: path.resolve(dir),
            });
        }

        const schemaValidator = new SchemaValidator(configs);

        let processedConfig;
        try {
            processedConfig = await schemaValidator.run();
        } catch (e) {
            Log.error(e, {logger: 'SchemaValidator - Cron'});
        }

        const csvSetup:CsvSetupConfig[] = [];

        for (const rawConfig of processedConfig) {

            csvSetup.push({
                name: rawConfig.configuration.key,
                filestream: createReadStream(rawConfig.configuration.filepath),
                Reader: new File(),
            });

        }

        return csvSetup;
    },
    async http(configDir:string) {
        const http = `${configDir}/src-http/`;

        try {
            await Util.checkIfDirectoryExist(http);
        } catch (e) {
            Log.error('Configuration directory does not exist');
            process.exit(1);
        }

        let dirs:string[];
        try {
            dirs = await Util.readDirectory(http);
            Log.info('Number of configuration directories: ' + dirs.length);
        } catch (e) {
            Log.error(e, {logger: 'ReadDirectory-Cron'});
            process.exit(1);
        }

        const configs = [];

        for (const dir of dirs) {
            configs.push({
                type: ConfigurationTypes.HTTP,
                path: path.resolve(dir),
            });
        }

        const schemaValidator = new SchemaValidator(configs);

        let processedConfig;
        try {
            processedConfig = await schemaValidator.run();
        } catch (e) {
            Log.error(e, {logger: 'SchemaValidator - Cron'});
        }

        const httpSetup:HttpSetupConfig[] = [];

        for (const rawConfig of processedConfig) {

            httpSetup.push({
                name: rawConfig.configuration.name,
                httpConfig: rawConfig.configuration as HttpConfig,
                httpClient: new HTTPClient(HTTPLoader.generateAuthHeader(rawConfig.configuration as HttpConfig)),
            });

        }

        return httpSetup;
    },
};

export const dataMapReaders = {
   async subscribers(configDir) {
        const subscription = `${configDir}/src-subscribers/`;

        try {
            await Util.checkIfDirectoryExist(subscription);
        } catch (e) {
            Log.error('Configuration directory does not exist');
            process.exit(1);
        }

        let dirs:string[];
        try {
            dirs = await Util.readDirectory(subscription);
            Log.info('Number of configuration directories: ' + dirs.length);
        } catch (e) {
            Log.error(e, {logger: 'ReadDirectory-Cron'});
            process.exit(1);
        }

        const configs = [];

        for (const dir of dirs) {
            configs.push({
                type: ConfigurationTypes.SUBSCRIPTION,
                path: path.resolve(dir),
            });
        }

        const schemaValidator = new SchemaValidator(configs);

        let processedConfig;
        try {
            processedConfig = await schemaValidator.run();
        } catch (e) {
            Log.error(e, {logger: 'SchemaValidator - Cron'});
        }

        const subscriptionConfig = [];

        for (const rawConfig of processedConfig) {
            const apiCallId = rawConfig.configuration.api_call_id;
            const campaign = rawConfig.configuration.campaign;
            const subscriptionMap = rawConfig.configuration.subscription_map;

            subscriptionConfig.push({
                apiCallId,
                campaign,
                subscriptionMap,
            });
        }
   },
    unsubscribers() {},
};
