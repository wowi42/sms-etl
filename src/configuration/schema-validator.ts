import { File } from '../../lib/file';

require('dotenv').config();

const yamlSchemaValidator = require('yaml-schema-validator');

import * as path from 'path';
import * as yaml from 'yaml';
import Config from './system';

export const enum ConfigurationTypes {
    SQL,
    CSV,
    HTTP,
    SUBSCRIPTION,
    UNSUBSCRIPTION,
}

export interface Configuration {
    path:string;
    type:ConfigurationTypes;
}

export class SchemaValidator {
    private readonly validConfigurations:Configuration[] = [];

    get acceptedConfigurations() {
        return this.validConfigurations;
    }

    constructor(private readonly configurations: Configuration[]) { }

    async run() {
        this.validate();
        return await this.load();
    }

    private validate() {
        for (let idx = 0; idx < this.configurations.length; idx++) {
            const config = this.configurations[idx];

            try {
                const isValid = yamlSchemaValidator(
                    config.path,
                    {
                        schemaPath: {
                            [ConfigurationTypes.CSV]: path.join(Config.rootUri, 'schemas', 'csv.config.yml'),
                            [ConfigurationTypes.SQL]: path.join(Config.rootUri, 'schemas', 'sql.config.yml'),
                            [ConfigurationTypes.HTTP]: path.join(Config.rootUri, 'schemas', 'http.config.yml'),
                            [ConfigurationTypes.SUBSCRIPTION]: path.join(Config.rootUri, 'schemas', 'subscription.config.yml'),
                            [ConfigurationTypes.UNSUBSCRIPTION]: path.join(Config.rootUri, 'schemas', 'unsubscription.config.yml'),
                        }[config.type]
                    });

                if (isValid.length > 0 && isValid[0] instanceof Error) {
                   throw isValid[0];
                }

                this.validConfigurations.push(config);
            } catch (e) {
                console.log('[ConfigurationInvalid]', e.message);
                console.log('[ConfigurationValidator]', 'Can not accept', config.path);
                continue;
            }

        }

    }

    private async load() {
        const configurations = [];

        for (let idx = 0; idx < this.acceptedConfigurations.length; idx++) {
            const config = this.acceptedConfigurations[idx];

            let file;
            try {
                file = await new File().reader(config.path);
            } catch (e) {
                console.log('[ConfigurationLoader]', 'Skipping configuration on path', config.path); // should be a log
                continue;
            }

            let processedConfig;
            try {
                processedConfig = yaml.parse(file);
            } catch (e) {
                console.log('[YAMLParser]', e.message); // should be a log
                console.log('[ConfigurationLoader]', 'Skipping configuration on path', config.path); // should be a log
                continue;
            }

            configurations.push({ type: config.type, configuration: {...processedConfig} });
        }

        return configurations;
    }

}
