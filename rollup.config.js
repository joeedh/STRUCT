import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";

export default {
  input: 'src/structjs.js',
  treeshake: false,
  output: {
    file: 'build/_nstructjs.js',
    format: 'cjs',
    name : "nstructjs"
  },
   plugins: [
    cjs({
      nested: true
    }),
   resolve()
  ]
};

//  plugins: [commonjs()]
