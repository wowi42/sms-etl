#!/bin/bash

# performs deployment of the sms-etl to Livinggoods servers

tar -xvf build.tar.gz out;

gulp run:project;

echo "DONE!";
