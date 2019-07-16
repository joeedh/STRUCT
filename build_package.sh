#!/bin/sh

./node_modules/.bin/r.js -o build.js

mkdir -p package
cp build/nstructjs.js package
cp package.json package
cp README.md package
cp LICENSE package
cp -r tests package
