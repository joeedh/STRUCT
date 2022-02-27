import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";
import replace from '@rollup/plugin-replace';
import {terser} from "rollup-plugin-terser";

export default {
  input    : 'src/structjs.js',
  treeshake: false,
  output   : {
    file  : 'build/nstructjs_es6.js',
    format: 'module',
    name  : "nstructjs"
  },
  plugins  : [
    replace({
      '[keywords.script]'      : '.STRUCT',
      '[keywords.load]'        : '.loadSTRUCT',
      '[keywords.new]'         : '.newSTRUCT',
      '[keywords.from]'        : '.fromSTRUCT',
      '[keywords.name]'        : '.structName',
      '//$BUILD_TINYEVAL_START': '/*',
      '//$BUILD_TINYEVAL_END'  : '*/',
      changed                  : 'replaced',
      delimiters               : ['', '']
    }),
    resolve(),
//    terser()
  ]
};

//  plugins: [commonjs()]
