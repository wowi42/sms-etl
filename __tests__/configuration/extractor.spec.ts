import * as path from 'path';
import Config from '../../configuration/system';
import {SchemaValidator, ConfigurationTypes} from '../../configuration/schema-validator';
import {HttpSetupConfig, Loader} from '../../configuration/loader';
import {HttpConfig, HTTPLoader} from '../../configuration/loaders/http';
import {HTTPClient} from '../../lib/http-client';
import {Extractor} from '../../lib/extractor';

jest.mock('../../lib/http-client');

const samplesPath = path.join(Config.rootUri, '__tests__', 'samples');

let processedConfig:any[];
let httpLoader:Loader;

beforeAll(async () => {
    const validator = new SchemaValidator([
        {
            type: ConfigurationTypes.HTTP,
            path: path.join(samplesPath, 'test-http.yml')
        },
        {
            type: ConfigurationTypes.SUBSCRIPTION,
            path: path.join(samplesPath, 'test-subscription.yml')
        },
    ]);
    processedConfig = await validator.run();

    const httpSetup:HttpSetupConfig[] = [];

    for (const rawConfig of processedConfig) {

        if (rawConfig.type === ConfigurationTypes.HTTP) {
            httpSetup.push({
                name: rawConfig.configuration.name,
                httpConfig: rawConfig.configuration as HttpConfig,
                httpClient: new HTTPClient(HTTPLoader.generateAuthHeader(rawConfig.configuration as HttpConfig)),
            });
        }

    }

    httpLoader = new Loader();
    await httpLoader.load(httpSetup as HttpSetupConfig[], 'http');
    await httpLoader.loadData();
});

test('Should generate subscription packet', async () => {
    const packets = [];

    for (const rawConfig of processedConfig) {
        if (rawConfig.type === ConfigurationTypes.SUBSCRIPTION) {
            const apiCallId = rawConfig.configuration.api_call_id;
            const campaign = rawConfig.configuration.campaign;
            const subscriptionMap = rawConfig.configuration.subscription_map;

            const extractor = new Extractor('subscription', apiCallId, campaign);

            for (const dataKey of Object.keys(httpLoader.dataList)) {
                extractor.data = httpLoader.dataList[dataKey];
                extractor.dataRequirements = subscriptionMap;

                packets.push(...extractor.transformSubscriptionData());
            }
        }
    }

    expect(Array.isArray(packets)).toBeTruthy();
    expect(packets.length).toBeGreaterThan(0);

    expect(packets[0].hasOwnProperty('url')).toBeTruthy();
    expect(packets[0].hasOwnProperty('packet')).toBeTruthy();

    expect(packets[0].packet.hasOwnProperty('campaign')).toBeTruthy();
    expect(packets[0].packet.hasOwnProperty('reference_date')).toBeTruthy();
    expect(packets[0].packet.hasOwnProperty('subscriber_number')).toBeTruthy();
    expect(packets[0].packet.hasOwnProperty('subscriber_type')).toBeTruthy();
    expect(packets[0].packet.hasOwnProperty('metadata')).toBeTruthy();
    expect(packets[0].packet.hasOwnProperty('chp_phone_number')).toBeTruthy();
});
