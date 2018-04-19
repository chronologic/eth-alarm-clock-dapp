#!/bin/sh
rm -rf build/
truffle migrate
node extractContractsInfo.js
cp contracts.json /usr/src/shared/eac_contracts.json
echo '{}' > abi/copy_confirmation.json 
cp -r abi/ /usr/src/shared/