import Config from '../src/configuration/system';
import axios, { AxiosError } from 'axios';
import {SubscriptionRequestBody} from './extractor';
import { Log } from './log';

export class SMSApi {

    async subscribe(data: { url:string; packet:SubscriptionRequestBody; }) {
        try {
            const req = await axios({
                url: `${Config.smsApiUri}/${data.url}`,
                data: {
                    ...data.packet
                },
                timeout: 8000,
                method: 'POST',
                headers: {
                    'x-app-id': Config.smsApiId,
                    'x-api-key': Config.smsApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            Log.info('Successfully performed subscription', Config.helpers.logger('SMS Api'));
            Log.info(`Subscriber phone number ${data.packet.subscriber_number} - campaign id: ${data.packet.campaign}`,
                Config.helpers.logger('SMS Api'));

            return req.data;
        } catch (e) {
            this.errorLogger(e);
            throw e;
        }
    }

    private errorLogger(e:AxiosError) {
        if (e.response) {
            /* PM2 will log this properly */
            if (process.env.NODE_ENV === 'production') {
                console.log(e.response.data);
                console.log(e.message);
            } else {
                console.log(e.response.data);
            }

            Log.error(`Something happened while trying to access the SMS Rest API [STATUS] ${e.response.statusText}`,
                Config.helpers.logger(
                    'SMS_LG API ERROR',
                    `status:${e.response.status}`
                )
            );

        } else if (process.env.NODE_ENV === 'production' && e.request) {
            console.log('[Axios_Request_Error]', e.request);
        }
    }

}
