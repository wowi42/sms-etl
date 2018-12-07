import {ReadStream, createReadStream} from 'fs';
import {File} from '../../lib/file';

export class CSVLoader {

    private readonly fileStream:ReadStream;

    static async setup(name:string, filepath:string) {
        const loader = new CSVLoader(name, filepath);
        return await File.csv(loader.fileStream);
    }

    private constructor(public readonly name:string, readonly filepath:string) {
        this.fileStream = createReadStream(filepath);
    }

}
