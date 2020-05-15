#!/bin/sh

bash build.sh

mkdir -p package

cp -r docs_src package/docs
cp build/nstructjs.js package
cp package.json package
cp README.md package
cp LICENSE package
cp -r tests package
