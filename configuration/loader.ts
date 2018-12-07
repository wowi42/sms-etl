import {SQLLoader} from './loaders/sql';
import {HttpConfig, HTTPLoader} from './loaders/http';
import {CSVLoader} from './loaders/csv';
import {Database} from '../lib/db';
import {File} from '../lib/file';

export interface SqlSetupConfig {
    name:string;
    db:Database;
    sqlFilePath:string;
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

            const sqlLoader = await new SQLLoader(config.name, config.db, config.sqlFilePath);
            queryHelper[sqlLoader.name] = sqlLoader.loadData;
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
