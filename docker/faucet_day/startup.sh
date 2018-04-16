#!/bin/sh
rm -rf build/
truffle migrate
ls
cp DAY_addresses.json /usr/src/shared/DAY_addresses.json
cp DAY_abis.json /usr/src/shared/DAY_abis.json