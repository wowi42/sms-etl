import {SQLLoader} from './loaders/sql';
import {HttpConfig, HTTPLoader} from './loaders/http';
import {Database} from '../lib/db';
import {File} from '../lib/file';

export interface SqlSetupConfig {
    name:string;
    db:Database;
    sqlFilePath:string;
    sqlFile:File;
}

class ConfigurationLoader {

    /**
     * creates an object holding all sql loader class objects
     * @param {SqlSetupConfig[]} configs - sql database configuration for intializing the SQLLoader class
     */
    async sql(configs:SqlSetupConfig[]) {
        const queryHelper = {};

        for (let idx = 0; idx < configs.length; idx++) {
            const config = configs[idx];
            queryHelper[config.name] = await new SQLLoader(config.name, config.db, config.sqlFilePath, config.sqlFile);
        }

        return queryHelper;
    }

    /**
     * creates an object oj ajax ready requests
     * @param {HttpConfig[]} httpConfig - http webhook configuration
     */
    async http(httpConfig:HttpConfig[]) {
        const httpConnections = {};

        for (let idx = 0; idx < httpConfig.length; idx++) {
            const config = httpConfig[idx];
            httpConnections[config.name] = await HTTPLoader.setup(config, []);
        }

        return httpConnections;
    }

}

export const Loader = new ConfigurationLoader();

/*
 * loads data from the configuration loader (SQL, CSV, HTTP)
 * @param { [k:string]:TArg; } queries -  An object of loaders
 */
export async function LoadData<TArg = any>(queries:TArg):Promise<TArg> {
    for (const key of Object.keys(queries)) {
        queries[key] = await queries[key].loadData();
    }

    return queries;
}
