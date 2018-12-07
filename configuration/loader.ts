import {DbConfig, SQLLoader} from './loaders/sql';
import {HttpConfig, HTTPLoader} from './loaders/http';
import {CSVLoader} from './loaders/csv';
import { Database } from '../lib/db';

export interface SqlSetupConfig {
    name:string;
    db:Database;
    sqlFilePath:string;
}

class ConfigurationLoader {

    sql(configs:SqlSetupConfig[]) {
        return Promise.all(configs.map(
                async (config) => await new SQLLoader(config.name, config.db, config.sqlFilePath)
            ));
    }

    csv(csvConfig:{name:string, filepath:string}[]) {
        return Promise.all(csvConfig.map(async (config) =>
                await CSVLoader.setup(config.name, config.filepath)
            ));
    }

    http(name:string, httpConfig:HttpConfig[]) {
        return Promise.all(httpConfig.map(async (config) =>
                await HTTPLoader.setup(name, config, [])
            ));
    }

}

export const Loader = new ConfigurationLoader();
