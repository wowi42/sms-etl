/**
 * @author John Waweru
 * @license Livinggoods Copyright 2018
 */

import * as Sequelize from 'sequelize';
import {Log} from './log';
import Config from '../src/configuration/system';

export interface DatabaseConnectionOpts {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    dialect: string;
}

export class Database {

    private connection:Sequelize.Sequelize;

    static async connect(name:string, connectionOpts:DatabaseConnectionOpts) {
        const db = new Database(name);

        await db.connect(
            connectionOpts.host,
            connectionOpts.port,
            connectionOpts.database,
            connectionOpts.user,
            connectionOpts.password,
            connectionOpts.dialect
        );

        return db;
    }

    static async disconnect(db:Database) {
        await db.disconnect();
        return null;
    }

    get sequelize() {
        return this.connection;
    }

    private constructor(private readonly name:string) { }

    private async connect(host:string, port:number, db:string, user:string, pass:string, dialect:string) {
        this.connection = new Sequelize(db, user, pass,
            {
                host,
                port,
                dialect,
                logging: false,
                native: false,
                define: { paranoid: true, timestamps: true },
                sync: { force: true, hooks: true, logging: true, },
            });

        return await this.auth();
    }

    private async auth() {
        try {
            await this.connection.authenticate();
            Log.info(`[${this.name}]: Connection was successfully made`, Config.helpers.logger('Database')); // should be a log
            return true;
        } catch (e) {
            throw e;
        }
    }

    public async disconnect() {
        try {
            if (this.connection) {
                return await this.connection.close().then(v => {
                    Log.info(`[${this.name}]: Connection created has been disconnected successfully`, Config.helpers.logger('Database'));
                    return true;
                });
            }
            return null;
        } catch (e) {
            Log.warn(`[${this.name}]: Something went while disconnecting the database`, Config.helpers.logger('Database'));
            Log.error(e, Config.helpers.logger('Sequelize-Disconnect'));
            throw e;
        }
    }

}
