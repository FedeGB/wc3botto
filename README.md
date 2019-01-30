# wc3botto

## Before installing

To install and run from Windows, first install [Windows-Build-Tools](https://github.com/felixrieseberg/windows-build-tools) from an admin console.

## Install

`npm install`

## Build code

`npm run build`

## Run

`npm start`

## Deploy to ZEIT

tsc  to build files into dist dir

Remove previous deploy

(If needed, set environment constants TOKEN, NODE_ENV, DB_USER, DB_PASS)

`now -e TOKEN=@token -e NODE_ENV=@node_env -e DB_USER=@db_user -e DB_PASS=@db_pass`

`now scale <deploy link> sfo1 1`

