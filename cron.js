/**
 * @author John Waweru
 * @license Livinggoods 2018
 */

const cron = require('node-cron');
const dotenv = require('dotenv');
const { Log } = require('./out/lib/log');

dotenv.config();

const {sqlIntegration, csvIntegration, httpIntegration} = require('./out/src/util/processor');

/**
 * Scheduled to run after every 30s
 * */
cron.schedule('*/10 * * * *', () => {
    Log.info('Process started');
    sqlIntegration().
        then(() => csvIntegration()).
            then(() => httpIntegration()).
            then(() => Log.info('Process done!'))
});
