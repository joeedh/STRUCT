import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/structjs.js',
  treeshake: false,
  output: {
    file: 'build/nstructjs_es6.js',
    format: 'module',
    name: "nstructjs"
  },
  plugins: [
    resolve(),
  ]
};

//  plugins: [commonjs()]
