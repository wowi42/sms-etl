
import * as winston from 'winston';
import Config from '../configuration/system';

require('winston-daily-rotate-file');

export const enum LOG_LEVEL {
    critical= 'critical',
    error= 'error',
    warn= 'warn',
    info= 'info'
}

class Logger {

    public static log: winston.Logger;

    /**
     * creates a log format
     * @param {string} label
     */
    private logFormat(label: string) {
        return winston.format.combine(
            winston.format.label({ label }),
            winston.format.timestamp(),
            winston.format.colorize(),
        );
    }

    /**
     * create transporters depending on the NODE_ENV
     */
    private configureTransporters() {
        switch (process.env.NODE_ENV) {
            case 'production':
                return [
                    this.consoleTransport(LOG_LEVEL.warn, 'PRODUCTION'),
                    this.rotationTransport(LOG_LEVEL.error, 'SERVICE_LOAD', '28d', '10m', 'YYYY-MM-DD--ddd'),
                ];

            default:
                return [
                    this.consoleTransport(LOG_LEVEL.info, 'DEV'),
                ];
        }
    }

    /**
     * logs system console using STDOUT and STDERR
     * @param {LOG_LEVEL} level
     * @param {string} formatLabel - label used when displaying logs
     */
    consoleTransport(level: LOG_LEVEL, formatLabel: string) {
        return new winston.transports.Console({
            format: this.logFormat(formatLabel),
            stderrLevels: ['error', 'warn'],
            level
        });
    }

    /**
     * log to file and use rotation mechanism archiving to zip files for old logs
     * @param {LOG_LEVEL} level
     * @param {string} label
     * @param {string} maxFiles - defaults to '7d' (7 days)
     * @param {string} maxSize - defaults to '2m' (2 megabytes)
     * @param {string} datePattern - use moment.js format patterns.\ defaults to 'YYYY-MMM-Do_dd' e.g 2009-Jan-23th_SU
     */
    rotationTransport(level: LOG_LEVEL, label: string, maxFiles = '7d', maxSize = '10m', datePattern = 'YYYY-MMM-Do dd') {
        return new ((<any>winston.transports).DailyRotateFile)({
            level,
            datePattern,
            filename: `${label}-%DATE%.log`,
            dirname: Config.logPath,
            handleExceptions: true,
            maxSize,
            maxFiles,
            zippedArchive: true
        });
    }

    /**
     * create a logger by providing options.\
     * this method enables creation of loggers by the class
     *
     * @param {winston.LoggerOptions} opts
     * @returns {winston.Logger}
     */
    createLogger() {
        return winston.createLogger({
            levels: winston.config.syslog.levels,
            transports: this.configureTransporters(),
            exceptionHandlers: [
                new ((<any>winston.transports).DailyRotateFile)({
                    datePattern: 'YYYY-MMM-Do dd',
                    filename: 'system-exceptions-%DATE%.log',
                    dirname: Config.logPath,
                    handleExceptions: true,
                    maxSize: '5m',
                    maxFiles: '7d',
                    zippedArchive: true
                })
            ]
        });
    }

}

/**
 * Best practise is to import this variable as Log
 */
export const Log = new Logger().createLogger();
