#!/bin/sh
echo "Copying the contracts addresses file..."
cp ../contracts/contracts.json node_modules/eac.js-lib/lib/assets/tester.json
npm run dev