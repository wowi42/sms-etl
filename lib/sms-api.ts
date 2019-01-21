import Config from '../src/configuration/system';
import axios from 'axios';
import {SubscriptionRequestBody} from './extractor';
import { Log } from './log';

export class SMSApi {

    async subscribe(data: { url:string; packet:SubscriptionRequestBody; }) {

        Log.info('Starting to perform subscription'); // should be a log

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

            Log.info('Successfully performed subscription');
            Log.info('subscriber phone number', data.packet.subscriber_number, 'campaign id:', data.packet.campaign); // log (info)

            return req.data;
        } catch (e) {
            throw e;
        }
    }

}
