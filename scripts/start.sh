#!/usr/bin/env bash

# Running Startup Script for reportify-frontend for dev environment
echo "############################################################"
echo "Starting Frontend at $(date) NODE_ENV=${NODE_ENV}"

echo "------------------------------"
echo "Install npm Packages: npm install"
npm install

echo "------------------------------"
echo "Start main Process: npm run start"
npm run start
