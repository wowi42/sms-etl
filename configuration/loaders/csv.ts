import {ReadStream} from 'fs';
import {File} from '../../lib/file';

export class CSVLoader {

    constructor(
        public readonly name:string,
        private readonly filestream:ReadStream,
        private readonly Reader:File
    ) { }

    async loadData() {
        return await this.Reader.csv(this.filestream);
    }

}
