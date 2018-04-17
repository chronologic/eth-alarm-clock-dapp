#!/bin/sh
rm -rf build/ development.json
truffle migrate
cp development.json /usr/src/shared/eac_contracts.json