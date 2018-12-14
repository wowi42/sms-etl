import axios, {AxiosInstance, AxiosTransformer} from 'axios';
import * as http from 'http';
import * as https from 'https';

export class HTTPClient {

    private readonly $:AxiosInstance;

    public get client() {
        return this.$;
    }

    constructor(transformers?:AxiosTransformer[], headers?:any) {
        this.$ = axios.create({
            headers,
            timeout: 5000,
            validateStatus: (status) => (status >= 200 && status < 300),
            maxRedirects: 2,
            transformResponse: transformers ? [...transformers] : [],
            responseType: 'json',
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
        });
    }

}
