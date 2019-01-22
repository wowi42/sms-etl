#!/bin/bash

export NODE_ENV=production;
export ENV=production;

# clean and build
gulp clean:project;
npm run compile;
gulp copy:project:files;
tar -zcf build.tar.gz out
mv build.tar.gz dist && rm -r out

# setup and run
cd dist && npm i --production && tar -xvf build.tar.gz out && pm2 start --attach ecosystem.config.js;

echo "DONE!";
