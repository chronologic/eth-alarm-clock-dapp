#!/bin/sh
rm -rf build/
truffle migrate
cp contracts.json /usr/src/contracts/contracts.json