#!/bin/bash

./node_modules/.bin/rollup -c rollup.config.js

cat ./start.frag > build/nstructjs.js
cat ./build/_nstructjs.js >> build/nstructjs.js
cat ./end.frag >> build/nstructjs.js

echo "wrote build/nstructjs.js"

./node_modules/.bin/rollup -c rollup_noeval.config.js

cat ./start.frag > build/nstructjs_tinyeval.js
cat ./build/_nstructjs_tinyeval.js >> build/nstructjs_tinyeval.js
cat ./end.frag >> build/nstructjs_tinyeval.js

echo "wrote build/nstructjs_tinyeval.js"

./node_modules/.bin/rollup -c acorn_rollup.config.js
echo "write build/tinyeval.js"

echo "write build/nstructjs_es6.js"
./node_modules/.bin/rollup -c rollup_module.config.js
