import * as path from 'path';
import {SchemaValidator, ConfigurationTypes} from '../../configuration/schema-validator';
import Config from '../../configuration/system';

const configsRoot = path.join(Config.rootUri, '__tests__', 'configuration', 'sample-configs');

const testConfigFilePaths = [
    {
        type: ConfigurationTypes.CSV,
        path: path.join(configsRoot, 'test-csv.yml')
    },
    {
        type: ConfigurationTypes.SQL,
        path: path.join(configsRoot, 'test-sql.yml')
    },
    {
        type: ConfigurationTypes.HTTP,
        path: path.join(configsRoot, 'test-http.yml')
    },
    {
        type: ConfigurationTypes.EXTRATOR,
        path: path.join(configsRoot, 'test-extractor.yml')
    },
];

test('Should return valid configuration objects', async () => {
    const validator = new SchemaValidator(testConfigFilePaths);

    const processedConfig = await validator.run();
    expect(validator.acceptedConfigurations.length).toBe(testConfigFilePaths.length);
    expect(processedConfig.length).toBe(testConfigFilePaths.length);
});

test('Should fail on faulty config', async () => {
    const validator = new SchemaValidator([
        {
            type: ConfigurationTypes.HTTP,
            path: path.join(configsRoot, 'faulty-http.yml')
        },
    ]);

    const processedConfig = await validator.run();
    expect(validator.acceptedConfigurations.length).not.toBe(testConfigFilePaths.length);
    expect(processedConfig.length).not.toBe(testConfigFilePaths.length);
});
