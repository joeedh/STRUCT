import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/structjs.js',
  treeshake: false,
  output: {
    file: 'build/_nstructjs.js',
    format: 'cjs',
    name: "nstructjs"
  },
  plugins: [
    cjs({
      nested: true
    }),
    resolve(),
    replace({
      '//$BUILD_TINYEVAL_START' : '/*',
      '//$BUILD_TINYEVAL_END' : '*/\n   _module_exports_.useTinyEval = () => {};',
      changed: 'replaced',
      delimiters: ['', '']
    })
  ]
};

//  plugins: [commonjs()]
