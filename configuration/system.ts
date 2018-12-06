/**
 * @author John Waweru
 * @license Livinggoods Copyright 2018
 * */

require('dotenv').config();

import * as path from 'path';

class SystemConfig {

    readonly rootUri = path.resolve(__dirname, '..');

    readonly schemaDir = path.resolve(__dirname, '..', 'schemas');

    readonly port = 5005;

    readonly logPath = process.env.LOG_PATH;

    readonly configPath = process.env.CONFIG_PATH;

    readonly smsApiUri = process.env.SMS_API_URL;

}

export default new SystemConfig();
