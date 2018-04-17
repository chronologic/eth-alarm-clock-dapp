#!/bin/sh
echo "Copying the necessary files..."
cp ../shared/eac_contracts.json node_modules/eac.js-lib/lib/assets/tester.json
echo "Setting the env variables..."
export DAY_TOKEN_ADDRESS_DOCKER=$(jq -r '.DAYToken' ../shared/DAY_addresses.json)
export DAY_FAUCET_ADDRESS_DOCKER=$(jq -r '.DAYFaucet' ../shared/DAY_addresses.json)
export DAY_TOKEN_ABI_DOCKER=$(jq -r -c '.DAYToken' ../shared/DAY_abis.json)
export DAY_FAUCET_ABI_DOCKER=$(jq -r -c '.DAYFaucet' ../shared/DAY_abis.json)
echo "Set ENV variables:"
echo "DAY_TOKEN_ADDRESS_DOCKER=$DAY_TOKEN_ADDRESS_DOCKER"
echo "DAY_FAUCET_ADDRESS_DOCKER=$DAY_FAUCET_ADDRESS_DOCKER"
echo "DAY_TOKEN_ABI_DOCKER=$DAY_TOKEN_ABI_DOCKER"
echo "DAY_FAUCET_ABI_DOCKER=$DAY_FAUCET_ABI_DOCKER"
npm run dev-docker