import * as fs from 'fs';

export class File {

    static reader(path:string):Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, {
                encoding: 'utf8'
            },
            (err, data) => {
                if (!err) {
                    resolve(data);
                } else {
                    console.log('[FileReadError]', err.message); // should be a log
                    reject(err);
                }
            });
        });
    }
}
