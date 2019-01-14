import * as fs from 'fs';
import * as path from 'path';
import {Util} from './lib/util';
import {Log} from '../lib/log';
import Config from './configuration/system';
import {ConfigurationTypes, SchemaValidator} from './configuration/schema-validator';
import {SetupConfig} from './lib/setup.config';
import {Loader, CsvSetupConfig, HttpSetupConfig, SqlSetupConfig} from './configuration/loader';
import {Extractor} from '../lib/extractor';
// import {SMSApi} from '../lib/sms-api';

interface ConfigurationMap {
    csv: CsvSetupConfig[];
    http: HttpSetupConfig[];
    sql: SqlSetupConfig[];
    subscription: {
        apiCallId: any;
        campaign: any;
        subscriptionMap: any;
    }[];
}

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

    const dirList:string[] = [];

    try {
        const dirs = await Util.readDirectory(Config.configPath as string);
        dirList.push(...dirs);
        Log.info('Number of configuration directories: ' + dirList.length);
    } catch (e) {
        Log.error(e, {logger: 'ReadDirectory-Cron'});
        process.exit(1);
    }

    return dirList;
}

async function mainProcessor(dirList:string[]) {
    const subscriptionPackets = [];

    for (const folder of dirList) {

        const directory = path.resolve(Config.configPath as string, folder);

        if (fs.statSync(directory).isDirectory()) {
            const configurations = await processConfigurationFiles(directory);
            if (!configurations) {
                Log.error('Error occured while processing directory-name: ' + folder + ' configurations');
                process.exit(1);
            }

            const subscriptions = await subscriptionDataProcessor(configurations as ConfigurationMap);
            subscriptionPackets.push(...subscriptions);
        }

    }

    for (const packet of subscriptionPackets) {
        console.log(packet);
        // const smsApi = new SMSApi();
        // await smsApi.subscribe(packet);
    }
}

async function processConfigurationFiles(dir:string) {

    const configFilesList:string[] = [];

    try {
        const configFile = await Util.readDirectory(dir);
        configFilesList.push(...configFile);

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
        const configs = await schemaValidator.run();
        const setup = new SetupConfig(configs);

        return {
            csv: setup.csv(),
            http: setup.http(),
            sql: await setup.sql(),
            subscription: setup.subscription(),
        };
    } catch (e) {
        Log.error(e, {logger: 'SchemaValidator - Cron'});
        return null;
    }
}

async function subscriptionDataProcessor(configuration:ConfigurationMap) {
    const subscriptionPackets = [];

    for (const type of ['sql', 'csv', 'http']) {
        const loader = new Loader();
        await loader.load(configuration[type], type as any);
        await loader.loadData();

        for (const subscription of configuration.subscription) {
            const extractor = new Extractor(
                'subscription',
                subscription.apiCallId,
                subscription.campaign,
            );

            for (const dataKey of Object.keys(loader.dataList)) {
                extractor.data = loader.dataList[dataKey];
                extractor.dataRequirements = subscription.subscriptionMap;

                subscriptionPackets.push(...extractor.transformSubscriptionData());
            }
        }

    }

    return subscriptionPackets;
}
