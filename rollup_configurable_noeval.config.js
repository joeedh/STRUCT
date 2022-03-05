import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";
import replace from '@rollup/plugin-replace';
import {terser} from "rollup-plugin-terser";

export default {
  input    : 'src/structjs.js',
  treeshake: false,
  output   : {
    file  : 'build/nstructjs_configurable_noeval.js',
    format: 'module',
    name  : "nstructjs"
  },
  plugins  : [
    replace({
      include: [
        "src/struct_intern.js",
        "src/structjs.js",
      ],
      exclude: [
        "*struct_parser*",
        /.*struct_parser.*/,
        "src/struct_parser\\.js",
        "struct_parser\\.js",
        "src/struct_binpack.js",
        "src/struct_util.js",
        "src/struct_eval.js",
        "src/struct_parseutil.js",
      ],

      '//$BUILD_TINYEVAL_START'                              : '/*',
      '//$BUILD_TINYEVAL_END'                                : '*/',
        changed                                                : 'replaced',
      delimiters                                             : ['', ''],
    }),
    resolve(),
//    terser()
  ]
};

//  plugins: [commonjs()]
