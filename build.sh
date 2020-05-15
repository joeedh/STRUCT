./node_modules/.bin/rollup -c rollup.config.js

cat ./start.frag > build/nstructjs.js
cat ./build/_nstructjs.js >> build/nstructjs.js
cat ./end.frag >> build/nstructjs.js
