import * as fs from 'fs';

export class Util {

    static checkIfDirectoryExist(dir:string):Promise<void> {
        return new Promise((resolve, reject) => {
            fs.exists(dir, (exists) => {
                if (exists) {
                    resolve();
                } else {
                    const err = new Error();
                    err.message = 'directory containing configuration does not exist';
                    err.name = 'MissingDirectoryError';
                    reject(err);
                }
            });
        });
    }

    static readDirectory(dir:string):Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

}
