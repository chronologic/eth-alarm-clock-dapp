#!/bin/sh
echo "Copying the contracts addresses file..."
cp ../shared/eac_contracts.json node_modules/eac.js-lib/lib/assets/tester.json
npm run dev