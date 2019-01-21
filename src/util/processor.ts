import * as fs from 'fs';
import * as path from 'path';
import Config from '../configuration/system';
import {Log} from '../../lib/log';
import {Extractor} from '../../lib/extractor';
import {SQLLoader} from '../configuration/loaders/sql';
import {CSVLoader} from '../configuration/loaders/csv';
import {HTTPLoader} from '../configuration/loaders/http';
import {SMSApi} from '../../lib/sms-api';
import {sourceReaders, dataMapReaders} from '../util/read-configs';

if (!path.isAbsolute(Config.configPath as string)) {
    throw new Error(`Path to configuration provided should be an absolute path`);
}

const directoryStats = fs.statSync(Config.configPath as string);
if (!directoryStats.isDirectory()) {
    throw new Error(`The path to configuration provided should be a directory`);
}

export async function sqlIntegration() {

    const sqlConfigArr = await sourceReaders.sql(Config.configPath);

    const sqlData = [];
    for (const config of sqlConfigArr) {
        const loader = new SQLLoader(
            config.name, config.db,
            path.resolve(Config.configPath, '..', 'sql', config.sqlFilePath),
            config.sqlFile
        );

        try {
            const data = await loader.loadData();
            Log.info(`[${config.name}]: Data volume is ${data.length}`, {Configuration: config.name });

            sqlData.push({
                name: config.name,
                data: [...data]
            });
        } catch (e) {
            Log.error(e, { logger: 'SQL Configuration Runner', Configuration: config.name });
        }
    }

    const dataConfigArr = await dataMapReaders.subscribers(Config.configPath, 'sql');

    const packets = [];
    for (const subscription of dataConfigArr) {
        const extractor = new Extractor(
            'subscription',
            subscription.apiCallId,
            subscription.sourceName,
            subscription.campaign,
        );

        const data = sqlData.filter(d => d.name === extractor.configName);

        if (data.length === 1) {
            extractor.data = data[0].data;
            extractor.dataRequirements = subscription.subscriptionMap;
            packets.push(...extractor.transformSubscriptionData());
        } else {
            Log.warning(`More than one subscription map with the name: ${extractor.configName}`, { logger: 'Extractor' });
            continue;
        }
    }

    for (const packet of packets) {
        const smsApi = new SMSApi();

        try {
            await smsApi.subscribe(packet);
            Log.info(`${packet} successfully sent`, { logger: `SMSApi - ${packet.packet.subscriber_number}` });
        } catch (e) {
            Log.error(e.message, { logger: `SMSApi - ${packet.packet.subscriber_number}`, httpStatus: e.status });
        }
    }

    /**
     * close all database connections
     */
    for (const config of sqlConfigArr) {
        await config.db.disconnect();
    }
}

export async function csvIntegration() {
    const csvConfigArr = await sourceReaders.csv(Config.configPath);

    const csvData = [];
    for (const config of csvConfigArr) {
        const loader = new CSVLoader(config.name, config.filestream, config.Reader);

        try {
            const data = await loader.loadData();
            Log.info(`[${config.name}]: Data volume is ${data.length}`, {Configuration: config.name });

            csvData.push({
                name: config.name,
                data: [...data]
            });
        } catch (e) {
            Log.error(e, { logger: 'CSV Configuration Runner', Configuration: config.name });
        }
    }

    const dataConfigArr = await dataMapReaders.subscribers(Config.configPath, 'sql');

    const packets = [];
    for (const subscription of dataConfigArr) {
        const extractor = new Extractor(
            'subscription',
            subscription.apiCallId,
            subscription.sourceName,
            subscription.campaign,
        );

        const data = csvData.filter(d => d.name === extractor.configName);

        if (data.length === 1) {
            extractor.data = data[0].data;
            extractor.dataRequirements = subscription.subscriptionMap;
            packets.push(...extractor.transformSubscriptionData());
        } else {
            Log.warning(`More than one subscription map with the name: ${extractor.configName}`, { logger: 'Extractor' });
            continue;
        }
    }

    for (const packet of packets) {
        const smsApi = new SMSApi();

        try {
            await smsApi.subscribe(packet);
            Log.info(`${packet} successfully sent`, { logger: `SMSApi - ${packet.packet.subscriber_number}` });
        } catch (e) {
            Log.error(e.message, { logger: `SMSApi - ${packet.packet.subscriber_number}`, httpStatus: e.status });
        }
    }

    for (const config of csvConfigArr) {
        await config.filestream.destroy();
    }

}

export async function httpIntegration() {
    const httpConfigArr = await sourceReaders.http(Config.configPath);

    const httpData = [];
    for (const config of httpConfigArr) {
        const loader = new HTTPLoader(config.httpConfig, config.httpClient);

        try {
            const data = await loader.loadData();
            Log.info(`[${config.name}]: Data volume is ${data.length}`, {Configuration: config.name });

            httpData.push({
                name: config.name,
                data: [...data]
            });
        } catch (e) {
            Log.error(e, { logger: 'CSV Configuration Runner', Configuration: config.name });
        }
    }

    const dataConfigArr = await dataMapReaders.subscribers(Config.configPath, 'sql');

    const packets = [];
    for (const subscription of dataConfigArr) {
        const extractor = new Extractor(
            'subscription',
            subscription.apiCallId,
            subscription.sourceName,
            subscription.campaign,
        );

        const data = httpData.filter(d => d.name === extractor.configName);

        if (data.length === 1) {
            extractor.data = data[0].data;
            extractor.dataRequirements = subscription.subscriptionMap;
            packets.push(...extractor.transformSubscriptionData());
        } else {
            Log.warning(`More than one subscription map with the name: ${extractor.configName}`, { logger: 'Extractor' });
            continue;
        }
    }

    for (const packet of packets) {
        const smsApi = new SMSApi();

        try {
            await smsApi.subscribe(packet);
            Log.info(`${packet} successfully sent`, { logger: `SMSApi - ${packet.packet.subscriber_number}` });
        } catch (e) {
            Log.error(e.message, { logger: `SMSApi - ${packet.packet.subscriber_number}`, httpStatus: e.status });
        }
    }
}
