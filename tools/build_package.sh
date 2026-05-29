#!/bin/sh

# Run from the repository root regardless of where this script is invoked.
cd "$(dirname "$0")/.."

git commit -a

bash tools/build.sh

mkdir -p package/build
mkdir -p package/docs

cp -r wiki/*.md package/docs
cp build/* package/build
cp package.json package
cp README.md package
cp LICENSE package
cp -r tests package
