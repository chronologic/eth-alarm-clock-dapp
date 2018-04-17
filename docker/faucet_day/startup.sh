#!/bin/sh
rm -rf build/ DAY_addresses.json DAY_abis.json
truffle migrate
cp DAY_addresses.json /usr/src/shared/DAY_addresses.json
cp DAY_abis.json /usr/src/shared/DAY_abis.json