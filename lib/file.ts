import * as fs from 'fs';
const csv = require('fast-csv');

export class File {

    static reader(path:string):Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, { encoding: 'utf8' },
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

    csv(fileStream:fs.ReadStream) {
        const data:any = [];

        return new Promise((resolve, reject) => {
            fileStream.pipe(
                csv({
                    headers: true,
                    discardUnmappedColumns: true,
                    ignoreEmpty: true
                })
            )
            .on('data', function(row:any) {
                data.push(row);
            })
            .on('end', function() {
                resolve(data);
            })
            .on('error', function (err:Error|any) {
                reject(err);
            });
        });
    }
}
