#!/bin/bash

# Run from the repository root regardless of where this script is invoked.
cd "$(dirname "$0")/.."

VERSION=`cat package.json | grep version | sed 's/[" :,]//g' | sed 's/version//'`

git commit -a
echo $?
git pull
echo $?
git push
echo $?

echo Publishing $VERSION
echo $?
bash tools/build.sh
echo $?

#bash build_docs.sh && \
bash tools/build_package.sh
echo $?

cd package
echo $?

git commit -a
echo $?
git push
echo $?

echo "npm publish --access public"
echo $?
npm publish --access public
echo $?

cd ..
git tag -a $VERSION -m "Release $VERSION"
git push --tags

rm -rf package
