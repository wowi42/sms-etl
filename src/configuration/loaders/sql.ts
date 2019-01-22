import {Database} from '../../../lib/db';
import {File} from '../../../lib/file';
import { Log } from '../../../lib/log';
import Config from '../system';

export interface DbConfig {
    host:string;
    port:number;
    database_name:string;
    user:string;
    password:string;
    dialect:string;
    sqlfile:string;
}

export class SQLLoader {

    constructor(public readonly name:string, private readonly db:Database, private sql_file:string, private sqlFile:File) { }

    async loadData():Promise<any | null> {
        let sql;

        try {
            sql = await this.sqlFile.reader(this.sql_file);
        } catch (e) {
            Log.error(e, Config.helpers.logger('SQLLoader'));
            return null;
        }

        try {
            return await this.db.sequelize.query(sql, {
                    raw: false,
                    retry: {max: 5},
                    nest: true,
                });
        } catch (e) {
            Log.error(e, Config.helpers.logger('SQLLoader'));
            return null;
        }
    }
}
