/**
 * @author John Waweru
 * @license Livinggoods Copyright 2018
 * */

require('dotenv').config();

import * as path from 'path';

class SystemConfig {

    readonly rootUri = path.resolve(__dirname, '..', '..');

    readonly logPath = process.env.LOG_PATH;

    readonly configPath = process.env.CONFIG_PATH;

    readonly smsApiUri = process.env.SMS_API_URL;

    readonly smsApiKey = process.env.SMS_API_KEY;

    readonly smsApiId = process.env.SMS_API_ID;

    readonly logseneToken = process.env.LOGSCENE_TOKEN;

    readonly port = process.env.PORT || 7707;

    readonly helpers = {
        logger(name: string, ...args: any[]) {
            return {
                loggedBy: name,
                timeLogged: new Date().toUTCString(),
                stack: args
            };
        }
    };
}

export default new SystemConfig();
