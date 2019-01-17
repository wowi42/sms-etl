/**
 * @author John Waweru
 * @license Livinggoods 2018
 */

const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

if (process.env.NODE_ENV !== 'production') {
    require('ts-node/register');
    const {sqlIntegration, csvIntegration, httpIntegration} = require('./src/util/processor');
} else {
    const {sqlIntegration, csvIntegration, httpIntegration} = require('./out/util/processor');
}

/**
 * Scheduled to run after every 30s
 * */
cron.schedule('*/30 * * * *', () => {
    sqlIntegration().
        then(() => csvIntegration()).
            then(() => httpIntegration());
});
