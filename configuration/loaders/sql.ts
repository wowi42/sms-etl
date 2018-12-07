import {Database} from '../../lib/db';
import {File} from '../../lib/file';

export interface DbConfig {
    host:string;
    port:number;
    database_name:string;
    user:string;
    password:string;
    dialect:string;
    sql_file:string;
}

export class SQLLoader {

    private db:Database;

    static async setup(name:string, dbConfig:DbConfig) {
        const db = new SQLLoader(name, dbConfig);
        await db.createDbConnection();

        return db;
    }

    get database() {
        return this.db;
    }

    private constructor(public readonly name:string, private readonly dbConfig:DbConfig) { }

    private async createDbConnection() {
        try {
            this.db = await Database.connect(this.name,
                {
                    database: this.dbConfig.database_name,
                    host: this.dbConfig.host,
                    port: this.dbConfig.port,
                    user: this.dbConfig.user,
                    password: this.dbConfig.password,
                    dialect: this.dbConfig.dialect,
                });

        } catch (e) {
            console.log(`[SQLLoader] Could not connect to ${this.name}`); // should be a log (but only console)
            console.log('Error is', e);
        }
    }

    async loadData():Promise<any | null> {
        let sql;

        try {
            sql = await File.reader(this.dbConfig.sql_file);
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
