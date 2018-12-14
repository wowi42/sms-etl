import * as express, {Request, Response, NextFunction} from 'express';
import * as path from 'path';
import * as compression from 'compression';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import Config from '../../configuration/system';

const PATHS = {
    frontEnd: path.resolve(Config.rootUri, 'app', 'dist'),
    testCoverage: path.resolve(Config.rootUri, 'coverage'),
    logFiles: Config.logPath,
};

const app = express();

app.use(compression());
app.use(logger('dev'));

// API REQUEST GUARDS //
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(helmet.noSniff());
app.use(helmet.noCache());
app.use(helmet.dnsPrefetchControl());

app.use(helmet.hsts({
    includeSubdomains: true,
    force: true,
    preload: true
}));

app.use(helmet.ieNoOpen());
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));

app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '10MB'
    })
);
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
    app.use((req:Request, res:Response, next:NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS,HEAD');
        // tslint:disable-next-line:max-line-length
        res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Content-Type, Accept,X-Requested-With, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        return next();
    });
}

app.use(express.static(PATHS.frontEnd));
app.use('/logs/', express.static(PATHS.logFiles));
app.use('/test/coverage/', express.static(PATHS.testCoverage));


// API ENDPOINTS GO HERE //


app.use((req:Request, res:Response, next:NextFunction) => {
    const err: any = new Error();
    err.status = 404;
    err.message = 'Requested resource was not found';
    err.name = '404Error';
    return next(err);
});

// respond with error
app.use((err:any, req:Request, res:Response, next:NextFunction) => {
    if (process.env.NODE_ENV !== 'production') { console.error(err); }
    return res.status(err.status || 500).json({ ...err, timestamp: new Date().toDateString() });
});

export {app};
