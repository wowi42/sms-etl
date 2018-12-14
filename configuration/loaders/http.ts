import {HTTPClient} from '../../lib/http-client';

export interface HttpAuth {
    secret:{ // API_SECRET, APP_SECRET, CLIENT_SECRET, APP_PASSWORD
        value:string;
        header:string;
    };
    key: { // API_KEY, APP_ID, CLIENT_ID, CLIENT_KEY
        value:string;
        header:string;
    };
}

export interface HttpConfig {
    name:string;
    requires_auth:boolean;
    api_authentication?:HttpAuth;
    webhook: {
        uri:string;
        method:string;
    };
}

export class HTTPLoader {

    public readonly name:string;

    static generateAuthHeader(httpConfig:HttpConfig) {
        let auth = {};

        if (httpConfig.requires_auth) {
            const authDetails = httpConfig.api_authentication as HttpAuth;
            auth = {
                [authDetails.key.header]: authDetails.key.value,
                [authDetails.secret.header]: authDetails.secret.value,
            };
        }

        return auth;
    }

    constructor(private readonly httpConfig:HttpConfig, private readonly httpClient:HTTPClient) {
        this.name = httpConfig.name;
    }

    async loadData() {
        return await this.httpClient.client({
            method: this.httpConfig.webhook.method,
            url: this.httpConfig.webhook.uri,
        });
    }

}
