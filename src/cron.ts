import * as fs from 'fs';
import * as path from 'path';
import {Util} from './lib/util';
import {Log} from '../lib/log';
import Config from '../configuration/system';
import {ConfigurationTypes, SchemaValidator} from '../configuration/schema-validator';
import {Loader} from '../configuration/loader';

if (!path.isAbsolute(Config.configPath as string)) {
    throw new Error(`Path to configuration provided should be an absolute path`);
}

const directoryStats = fs.statSync(Config.configPath as string);
if (!directoryStats.isDirectory()) {
    throw new Error(`The path to configuration provided should be a directory`);
}

async function getConfigurationFiles() {

    try {
        await Util.checkIfDirectoryExist(Config.configPath as string);
    } catch (e) {
        Log.error('Configuration directory does not exist');
        process.exit(1);
    }

    let dirList:string[] = [];

    try {
        dirList = await Util.readDirectory(Config.configPath as string);
        Log.info('Number of configuration directories: ' + dirList.length);
    } catch (e) {
        Log.error(e, {logger: 'ReadDirectory-Cron'});
        process.exit(1);
    }

    for (const folder of dirList) {
        const directory = path.resolve(Config.configPath as string, folder);

        let configurations:{ type:ConfigurationTypes; configuration:any; }[] | null = [];

        if (fs.statSync(directory).isDirectory()) {
            configurations = await processConfigurationFiles(directory);
            if (!configurations) {
                Log.error('Error occured while processing directory-name: ' + folder + ' configurations');
                process.exit(1);
            }
        }

    }
}

async function processConfigurationFiles(dir:string) {

    let configFilesList:string[] = [];

    try {
        configFilesList = await Util.readDirectory(dir);
        Log.info('Number of configuration files: ' + configFilesList.length);
    } catch (e) {
        Log.error(e, {logger: 'ReadConfigDir - Cron'});
    }

    const configurationFiles = [];

    for (const file of configFilesList) {
        if (path.extname(file) === '.yml') {

            switch (file.split('.')[0]) {
                case 'sql':
                    configurationFiles.push({
                        type: ConfigurationTypes.SQL,
                        path: path.resolve(dir, 'sql.config.yml'),
                    });
                    break;
                case 'csv':
                    configurationFiles.push({
                        type: ConfigurationTypes.CSV,
                        path: path.resolve(dir, 'csv.config.yml'),
                    });
                    break;
                case 'http':
                    configurationFiles.push({
                        type: ConfigurationTypes.HTTP,
                        path: path.resolve(dir, 'http.config.yml'),
                    });
                    break;
                case 'subscription':
                    configurationFiles.push({
                        type: ConfigurationTypes.SUBSCRIPTION,
                        path: path.resolve(dir, 'subscription.config.yml'),
                    });
                    break;
                case 'unsubscription':
                    configurationFiles.push({
                        type: ConfigurationTypes.UNSUBSCRIPTION,
                        path: path.resolve(dir, 'unsubscription.config.yml'),
                    });
                    break;
            }

        }
    }

    const schemaValidator = new SchemaValidator(configurationFiles);

    try {
        return await schemaValidator.run();
    } catch (e) {
        Log.error(e, {logger: 'SchemaValidator - Cron'});
        return null;
    }
}
