/**
 * @author John Waweru
 * @license Livinggoods Copyright 2018
 */

import * as Sequelize from 'sequelize';

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
                logging: console.log,
                native: false,
                define: { paranoid: true, timestamps: true },
                sync: { force: true, hooks: true, logging: true, },
            });

        return await this.auth();
    }

    private async auth() {
        try {
            await this.connection.authenticate();
            console.log(`[${this.name}]: Connection was successfully made`); // should be a log
            return true;
        } catch (e) {
            throw e;
        }
    }

    public async disconnect() {
        try {
            if (this.connection) {
                return await this.connection.close().then(v => {
                    console.log(`[${this.name}]: Connection created has been disconnected successfully`); // should be a log
                    return true;
                });
            }
            return null;
        } catch (e) {
            console.log(`[${this.name}]: Something went while disconnecting the database`); // should be a log
            throw e;
        }
    }

}
