import axios, { AxiosInstance, AxiosTransformer } from 'axios';
import * as http from 'http';
import * as https from 'https';

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

    private apiClient:AxiosInstance;

    public readonly name:string;

    static setup(httpConfig:HttpConfig, func:AxiosTransformer[]) {
        const httpLoader = new HTTPLoader(httpConfig);
        httpLoader.setupApiClient(func);

        return httpLoader;
    }

    private constructor(private readonly httpConfig:HttpConfig) {
        this.name = httpConfig.name;
    }

    private setupApiClient(func:AxiosTransformer[]) {
        let auth = {};

        if (this.httpConfig.requires_auth) {
            const authDetails = this.httpConfig.api_authentication as HttpAuth;
            auth = {
                [authDetails.key.header]: authDetails.key.value,
                [authDetails.secret.header]: authDetails.secret.value,
            };
        }

        this.apiClient = axios.create({
            headers: {...auth},
            timeout: 5000,
            validateStatus: (status) => (status >= 200 && status < 300),
            maxRedirects: 2,
            transformResponse: [...func],
            responseType: 'json',
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
        });
    }

    async loadData() {
        return await this.apiClient({
            method: this.httpConfig.webhook.method,
            url: this.httpConfig.webhook.uri,
        });
    }

}
