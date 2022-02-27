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
      '"{\\n"'                 : '"{\\\\n"',
      '" {\\n"'                : '" {\\\\n"',
      '";\\n"'                 : '";\\\\n"',
      '"\\n\\n"'               : '"\\\\n\\\\n"',
      '"\\n"'                  : '"\\\\n"',
      '"\\r"'                  : '"\\\\r"',
      '"\\t"'                  : '"\\\\t"',
      '"\\n}"'                 : '"\\\\n}"',
      '"][1];\\n"'             : '"][1];\\\\n"',
      '"\\n\\n\\n"'            : '"\\\\n\\\\n\\\\n"',
      '"\\n\\n'                : '"\\\\n\\\\n',

      '//$KEYWORD_CONFIG_START': 'export let STRUCT;\n const code = `',
      'export class STRUCT'    : 'StructClass = class StructClass',
      '//$KEYWORD_CONFIG_END'  : '`;\n haveCodeGen = true;\n',
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
