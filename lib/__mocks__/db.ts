import {DatabaseConnectionOpts} from '../db';

class Sequelize {
    query(sql:string, opts: { raw:boolean; retry: { max:number; }; nest:boolean }) {
        return require('../../__tests__/samples/query-data.json');
    }
}

class Database {

    static connect(name:string, connectionOpts:DatabaseConnectionOpts) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Connected to database!');
                resolve(new Sequelize());
            }, 1000);
        });
    }

    static disconnect() {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Disconnected from database');
                resolve(true);
            });
        });
    }

}

export { Database };
