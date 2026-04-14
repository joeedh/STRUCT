#!/bin/sh

git commit -a

bash build.sh

mkdir -p package/build
mkdir -p package/docs

cp -r wiki/*.md package/docs
cp build/* package/build
cp package.json package
cp README.md package
cp LICENSE package
cp -r tests package
