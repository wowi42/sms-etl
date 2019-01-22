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
 * Scheduled to run after every 25 mins
 * */
cron.schedule('*/25 * * * *', () => {
    sqlIntegration().
        then(() => csvIntegration()).
            then(() => httpIntegration()).
            then(() => Log.info('Process done!'))
});
