#!/bin/sh

bash build.sh

mkdir -p package
mkdir -p package/docs

cp -r wiki/*.md package/docs
cp build/nstructjs.js package
cp package.json package
cp README.md package
cp LICENSE package
cp -r tests package
