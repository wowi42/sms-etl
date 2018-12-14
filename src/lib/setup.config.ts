import {HttpSetupConfig, SqlSetupConfig, CsvSetupConfig} from '../../configuration/loader';
import {ConfigurationTypes} from '../../configuration/schema-validator';
import {HttpConfig, HTTPLoader} from '../../configuration/loaders/http';
import {HTTPClient} from '../../lib/http-client';
import {DbConfig} from '../../configuration/loaders/sql';
import {Database} from '../../lib/db';
import {File} from '../../lib/file';
import {createReadStream} from 'fs';
import { Log } from '../../lib/log';

export class SetupConfig {

    constructor(public configs:any[]) {}

    public csv() {
        const csvSetup:CsvSetupConfig[] = [];

        for (const rawConfig of this.configs) {

            if (rawConfig.type === ConfigurationTypes.CSV) {
                csvSetup.push({
                    name: rawConfig.configuration.key,
                    filestream: createReadStream(rawConfig.configuration.filepath),
                    Reader: new File(),
                });
            }

        }

        return csvSetup;
    }

    public http() {
        const httpSetup:HttpSetupConfig[] = [];

        for (const rawConfig of this.configs) {

            if (rawConfig.type === ConfigurationTypes.HTTP) {
                httpSetup.push({
                    name: rawConfig.configuration.name,
                    httpConfig: rawConfig.configuration as HttpConfig,
                    httpClient: new HTTPClient(HTTPLoader.generateAuthHeader(rawConfig.configuration as HttpConfig)),
                });
            }

        }

        return httpSetup;
    }

    public async sql() {
        const sqlSetup:SqlSetupConfig[] = [];

        for (const rawConfig of this.configs) {
            if (rawConfig.type === ConfigurationTypes.SQL) {
                const dbConfig = rawConfig.configuration.database_connection as DbConfig;
                const sqlFile = rawConfig.configuration.sqlfile;
                const loaderName = rawConfig.configuration.connection_name;

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
        }

        return sqlSetup;
    }

    public subscription() {
        const subscriptionConfig = [];

        for (const rawConfig of this.configs) {
            if (rawConfig.type === ConfigurationTypes.SUBSCRIPTION) {
                const apiCallId = rawConfig.configuration.api_call_id;
                const campaign = rawConfig.configuration.campaign;
                const subscriptionMap = rawConfig.configuration.subscription_map;

                subscriptionConfig.push({
                    apiCallId,
                    campaign,
                    subscriptionMap,
                });
            }
        }

        return subscriptionConfig;
    }
}
