
export class File {

    static reader(path:string):Promise<string> {
        return new Promise(resolve => {
            resolve('true');
        });
    }

    static csv(fileStream:any) {
        return require('../../__tests__/samples/csv-data.json');
    }
}
