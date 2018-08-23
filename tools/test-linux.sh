#!/usr/bin/env bash

set -ev # return value 1 (error) if any command fails, and display each command before its run
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  npm run lint
  npm run build
  npm run test
fi