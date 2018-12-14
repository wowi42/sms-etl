import {SQLLoader} from './loaders/sql';
import {HttpConfig, HTTPLoader} from './loaders/http';
import {Database} from '../lib/db';
import {File} from '../lib/file';
import {ReadStream} from 'fs';
import {CSVLoader} from './loaders/csv';
import { HTTPClient } from '../lib/http-client';

export interface SqlSetupConfig {
    name:string;
    db:Database;
    sqlFilePath:string;
    sqlFile:File;
}

export interface CsvSetupConfig {
    name:string;
    filestream:ReadStream;
    Reader:File;
}

export interface HttpSetupConfig {
    name:string;
    httpConfig:HttpConfig;
    httpClient:HTTPClient;
}

export class Loader {

    private loader = {};
    private data = {};

    public get loaderList() {
        return this.loader;
    }

    public get dataList() {
        return this.data;
    }

    public async load(configs:any[], type: 'csv' | 'http' | 'sql') {
        for (let idx = 0; idx < configs.length; idx++) {
            const config = configs[idx];
            this.loader[config.name] = await this.loaderFactory(type, config);
        }
    }

    public async loadData():Promise<void> {
        for (const key of Object.keys(this.loader)) {
            this.data[key] = await this.loader[key].loadData();
        }
    }

    private loaderFactory(type: 'csv' | 'http' | 'sql', config:any) {
        switch (type) {
            case 'csv':
                return new CSVLoader(config.name, config.filestream, config.Reader);
            case 'sql':
                return new SQLLoader(config.name, config.db, config.sqlFilePath, config.sqlFile);
            case 'http':
                return new HTTPLoader(config.httpConfig, config.httpClient);
            default:
                throw new Error('loader could not be identified');
        }
    }

}
