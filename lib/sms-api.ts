import Config from '../configuration/system';
import axios from 'axios';
import {SubscriptionRequestBody} from './extractor';

export class SMSApi {

    async subscribe(data: { url:string; packet:SubscriptionRequestBody; }) {

        console.log('Starting to perform subscription'); // should be a log

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
            console.log('Performed subscription for ' + data.packet.subscriber_number); // should be a log
            return req.data;
        } catch (e) {
            throw e;
        }
    }

}
