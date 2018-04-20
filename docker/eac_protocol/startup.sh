#!/bin/sh
rm -rf build/ contracts.json abi/
truffle migrate
node extractContractsInfo.js
cp contracts.json /usr/src/shared/eac_contracts.json
cp -r abi/ /usr/src/shared/