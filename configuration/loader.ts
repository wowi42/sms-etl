import {DbConfig, SQLLoader} from './loaders/sql';
import {HttpConfig, HTTPLoader} from './loaders/http';
import {CSVLoader} from './loaders/csv';

export class ConfigurationLoader {

    sqlLoader(name: string, sqlConfig:DbConfig[]) {
        return Promise.all(sqlConfig.map(
                async (config) => await SQLLoader.setup(name, config)
            ));
    }

    csvLoader(csvConfig:{name:string, filepath:string}[]) {
        return Promise.all(csvConfig.map(async (config) =>
            await CSVLoader.setup(config.name, config.filepath)
        ));
    }

    httpLoader(name:string, httpConfig:HttpConfig[]) {
        return Promise.all(httpConfig.map(async (config) =>
                await HTTPLoader.setup(name, config, [])
            ));
    }

}
