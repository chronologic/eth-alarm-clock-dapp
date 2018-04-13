#!/bin/sh
rm -rf build/
truffle migrate
cp DAY_contracts.json /usr/src/shared/DAY_contracts.json