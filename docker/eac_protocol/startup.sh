#!/bin/sh
rm -rf build/
truffle migrate
cp development.json /usr/src/shared/eac_contracts.json