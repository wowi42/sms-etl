import {ReadStream} from 'fs';
import {File} from '../../../lib/file';

export class CSVLoader {

    constructor(
        public readonly name:string,
        private readonly filestream:ReadStream,
        private readonly Reader:File
    ) { }

    loadData() {
        return this.Reader.csv(this.filestream) as Promise<any[]>;
    }

}
