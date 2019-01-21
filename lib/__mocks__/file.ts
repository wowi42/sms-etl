import * as fs from 'fs';
import { Log } from '../log';

export class File {

    /*
     * this method is a replica of the original class File method (reader)
     */
    reader(path:string):Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, { encoding: 'utf8' },
                (err, data) => {
                    if (!err) {
                        resolve(data);
                    } else {
                        Log.error('[FileReadError]', err.message); // should be a log
                        reject(err);
                    }
                });
        });
    }

    csv(fileStream:any) {
        Log.info('Argument types are:', typeof fileStream);
        const data = require('../../__tests__/samples/csv-data.json');

        return new Promise(resolve => resolve(data));
    }
}
