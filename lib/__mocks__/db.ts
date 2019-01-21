import {DatabaseConnectionOpts} from '../db';
import {Log} from '../log';

class MockSequelize {
    query(sql:string, opts: { raw:boolean; retry: { max:number; }; nest:boolean }) {
        console.log('Arguments are:', sql, opts);
        return require('../../__tests__/samples/sql-data.json');
    }
}

class Database {
    private connection:MockSequelize;

    static async connect(name:string, opts:DatabaseConnectionOpts) {
        const db = new Database();
        db.connect(name, opts);

        return db;
    }

    get sequelize() {
        return this.connection;
    }

    connect(name:string, opts:DatabaseConnectionOpts) {
        console.log('Inputs are: ', name, JSON.stringify(opts));
        this.connection = new MockSequelize();
    }

    async disconnect() {
        return await new Promise(resolve => {
            setTimeout(_ => resolve(), 1000); // buys sometime in the setTimeout function
        });
    }

}

export { Database };
