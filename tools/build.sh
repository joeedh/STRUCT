#!/bin/bash

# Run from the repository root regardless of where this script is invoked.
cd "$(dirname "$0")/.."

./node_modules/.bin/rollup -c tools/rollup.config.js

cat ./tools/start.frag > build/nstructjs.js
cat ./build/_nstructjs.js >> build/nstructjs.js
cat ./tools/end.frag >> build/nstructjs.js

echo "wrote build/nstructjs.js"

./node_modules/.bin/rollup -c tools/rollup_noeval.config.js

cat ./tools/start.frag > build/nstructjs_tinyeval.js
cat ./build/_nstructjs_tinyeval.js >> build/nstructjs_tinyeval.js
cat ./tools/end.frag >> build/nstructjs_tinyeval.js

echo "wrote build/nstructjs_tinyeval.js"

./node_modules/.bin/rollup -c tools/acorn_rollup.config.js
echo "write build/tinyeval.js"

echo "write build/nstructjs_es6.js"
./node_modules/.bin/rollup -c tools/rollup_module.config.js

echo "write build/nstructjs_configurable.js"
./node_modules/.bin/rollup -c tools/rollup_configurable.config.js

echo "write build/nstructjs_configurable_noeval.js"
./node_modules/.bin/rollup -c tools/rollup_configurable_noeval.config.js
