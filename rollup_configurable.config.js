import resolve from '@rollup/plugin-node-resolve';
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";
import replace from '@rollup/plugin-replace';
import {terser} from "rollup-plugin-terser";

export default {
  input    : 'src/structjs.js',
  treeshake: false,
  output   : {
    file  : 'build/nstructjs_configurable.js',
    format: 'module',
    name  : "nstructjs"
  },
  plugins  : [
    replace({
      include      : [
        "src/struct_intern.js",
        "src/structjs.js",
      ],
      exclude      : [
        "*struct_parser*",
        /.*struct_parser.*/,
        "src/struct_parser\\.js",
        "struct_parser\\.js",
        "src/struct_binpack.js",
        "src/struct_util.js",
        "src/struct_eval.js",
        "src/struct_parseutil.js",
      ],
      '"{\\n"'     : '"{\\\\n"',
      '" {\\n"'    : '" {\\\\n"',
      '";\\n"'     : '";\\\\n"',
      '"\\n\\n"'   : '"\\\\n\\\\n"',
      '"\\n"'      : '"\\\\n"',
      '"\\r"'      : '"\\\\r"',
      '"\\t"'      : '"\\\\t"',
      '"\\n}"'     : '"\\\\n}"',
      '"][1];\\n"' : '"][1];\\\\n"',
      '"\\n\\n\\n"': '"\\\\n\\\\n\\\\n"',
      '"\\n\\n'    : '"\\\\n\\\\n',

      '//$KEYWORD_CONFIG_START': 'export let STRUCT;\n const code = `',
      'export class STRUCT'    : 'StructClass = class StructClass',
      '//$KEYWORD_CONFIG_END'  : '`;\n haveCodeGen = true;\n',
      '//$BUILD_TINYEVAL_START': '/*',
      '//$BUILD_TINYEVAL_END'  : '*/',
      changed                  : 'replaced',
      delimiters               : ['', ''],
      'let haveCodeGen;'        : 'let haveCodeGen = !globalThis.DISABLE_STRUCT_CODEGEN;',
    }),
    resolve(),
//    terser()
  ]
};

//  plugins: [commonjs()]
