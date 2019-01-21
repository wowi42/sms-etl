#!/bin/bash

# performs deployment of the sms-etl to Livinggoods servers

tar -xvf build.tar.gz out;

NODE_ENV=production pm2 start --attach ecosystem.config.js;

echo "DONE!";
