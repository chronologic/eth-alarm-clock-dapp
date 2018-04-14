#!/bin/sh
echo "Copying the contracts addresses file..."
cp ../shared/eac_contracts.json node_modules/eac.js-lib/lib/assets/tester.json
export DAY_TOKEN_ADDRESS_DOCKER=$(jq -r '.DAYToken' ../shared/DAY_contracts.json)
export DAY_FAUCET_ADDRESS_DOCKER=$(jq -r '.DAYFaucet' ../shared/DAY_contracts.json)
npm run dev