#!/bin/sh

# Delete the folder with the compiled JS/CSS
rm -rf out/
# Delete the folder with installed npm modules
rm -rf node_modules/

# Reinstall the dependencies
npm install