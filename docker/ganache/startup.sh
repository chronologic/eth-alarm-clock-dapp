#!/bin/bash
echo "Running a blockchain with automine to deploy contracts faster..."
timeout 60 node ./build/cli.node.js -i 1001 -m 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
echo "Killed automine ganache."

echo "Running ganache with blockTime of 15 sec"
node ./build/cli.node.js -i 1001 -b 15 -m 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'