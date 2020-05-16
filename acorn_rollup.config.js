import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";

export default {
  input: 'tinyeval/tinyeval.js',
  treeshake: false,
  output: {
    file: 'build/tinyeval.js',
    format: 'cjs',
    name : "tinyeval"
  },
   plugins: [
    cjs({
      nested: true,
    }),
    resolve()
  ]
};

//  plugins: [commonjs()]
