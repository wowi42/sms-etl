import * as fs from 'fs';
import { Log } from './log';
const csv = require('fast-csv');
import Config from '../src/configuration/system';

export class File {

    reader(path:string):Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, { encoding: 'utf8' },
                (err, data) => {
                    if (!err) {
                        resolve(data);
                    } else {
                        Log.error(err.message, Config.helpers.logger('FileReader'));
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
