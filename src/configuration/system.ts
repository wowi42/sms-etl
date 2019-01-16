/**
 * @author John Waweru
 * @license Livinggoods Copyright 2018
 * */

require('dotenv').config();

import * as path from 'path';

class SystemConfig {

    readonly rootUri = path.resolve(__dirname, '..', '..');

    readonly port = 5005;

    readonly logPath = process.env.LOG_PATH;

    readonly configPath = process.env.CONFIG_PATH;

    readonly smsApiUri = process.env.SMS_API_URL;

    readonly smsApiKey = process.env.SMS_API_KEY;

    readonly smsApiId = process.env.SMS_API_ID;
}

export default new SystemConfig();
