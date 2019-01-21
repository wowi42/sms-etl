
module.exports = {
    apps: [
        {
            name: 'LG-SMS Intergration',
            script: './cron.js',
            env: {
                NODE_ENV: 'production',
                ENV: 'production',
                LOG_PATH: './logs',
                PORT: 7707
            },
            cwd: './dist/',
            output: './.pm2/out.log',
            error: './.pm2/err.log',
            pid: './.pm2/pids',
            restart_delay: 500,
            source_map_support: false,
            wait_ready: true,
            cron_restart: '0 23 * * 6',
            autorestart: true,
            port: 7707,
            watch: false
        }
    ]
}
