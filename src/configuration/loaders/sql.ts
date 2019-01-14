import {Database} from '../../../lib/db';
import {File} from '../../../lib/file';

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
            console.log('[SQLLoader] Could not read SQL file'); // should be a log
            console.log(e); // should be a log

            return null;
        }

        try {
            return await this.db.sequelize.query(sql, {
                    raw: false,
                    retry: {max: 5},
                    nest: true,
                });
        } catch (e) {
            console.log('[SQLloader] Could not run query from sql file'); // should be a log
            console.log(e); // should be a log

            return null;
        }
    }
}
