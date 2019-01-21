
export class HTTPClient {

    constructor(...args:any[]) { }

    public client(opts:{ method:string; url:string; }) {
        Log.info('[HTTPClient] client opts are:', opts);

        return {
            data: require('../../__tests__/samples/http-data.json'),
            status: 200,
            statusText: 'OK',
        };
    }
}
