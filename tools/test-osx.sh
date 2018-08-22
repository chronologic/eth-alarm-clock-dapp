#!/usr/bin/env bash

set -ev # return value 1 (error) if any command fails, and display each command before its run
if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  npm run release
  echo 'dist contains:'
  ls -lah dist
  echo 'electron-builds contains:'
  ls -lah dist/electron-builds
fi