#!/bin/bash

export NODE_ENV=production;
export ENV=production;

# clean and build
gulp clean:project;
npm run compile;
gulp copy:project:files;
mv build.tar.gz dist && rm -r out
tar -zcf $BUILD_FILENAME ${dir}

# setup and run
cd dist
npm i --production
pm2 start --attach ecosystem.config.j
