import {app} from './lib/api';
import * as http from 'http';
import * as dotenv from 'dotenv';
import Config from './configuration/system';

dotenv.config();

function normalizePort(val: number | string): number | string | boolean {
    const portN:number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(portN)) {
        return val;
    } else if (portN >= 0) {
        return portN;
    } else {
        return false;
    }
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    const address = server.address();
    const bind = (typeof address === 'string') ? `pipe ${address}` : `port ${address.port}`;
    console.log(`Listening on ${bind}`);
}

const port = normalizePort(Config.port);

app.set('port', port);
app.set('env', process.env.NODE_ENV);

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
