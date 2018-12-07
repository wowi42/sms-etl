import {ReadStream, createReadStream} from 'fs';
import {File} from '../../lib/file';

export class CSVLoader {

    private data:any;

    get loadedData() {
        return this.data;
    }

    private constructor(
        public readonly name:string,
        private readonly filestream:ReadStream,
        private readonly Reader:File
    ) { }

    async load() {
        this.data = await this.Reader.csv(this.filestream);
    }

}
