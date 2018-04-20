#!/bin/bash
MNEMONIC='candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
NETWORK_ID='1001'
BLOCK_TIME='15'

mkdir db

 # Can be improved, for now it relies on contracts to be deployed within 60 sec
echo "Running a blockchain with automine to deploy contracts faster..."
timeout 360 node ./build/cli.node.js -i $NETWORK_ID -m "$MNEMONIC" --db ./db/
echo "Killed automine ganache."

echo "Running ganache with blockTime of ${BLOCK_TIME} sec..."
node ./build/cli.node.js -i $NETWORK_ID -b $BLOCK_TIME -m "$MNEMONIC" --db ./db/
