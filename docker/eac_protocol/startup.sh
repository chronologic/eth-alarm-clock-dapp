#!/bin/sh
rm -rf build/
truffle migrate
node getContractsInfo.js
cp contracts.json /usr/src/shared/eac_contracts.json
cp -r build/contracts /usr/src/shared/