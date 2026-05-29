import resolve from "@rollup/plugin-node-resolve";
//import commonjs from '@rollup/plugin-commonjs';
import cjs from "rollup-plugin-cjs-es";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input    : "src/structjs.ts",
  treeshake: false,
  output: {
    file  : "build/nstructjs_configurable.js",
    format: "module",
    name  : "nstructjs",
  },
  plugins: [
    replace({
      include      : ["src/struct_intern.ts", "src/structjs.ts"],
      exclude: [
        "*struct_parser*",
        /.*struct_parser.*/,
        "src/struct_parser\\.ts",
        "struct_parser\\.ts",
        "src/struct_binpack.ts",
        "src/struct_util.ts",
        "src/struct_eval.ts",
        "src/struct_parseutil.ts",
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

      "//$KEYWORD_CONFIG_START": "export let STRUCT;\n const code = `",
      "export class STRUCT"    : "StructClass = class StructClass",
      "//$KEYWORD_CONFIG_END"  : "`;\n haveCodeGen = true;\n",
      "//$BUILD_TINYEVAL_START": "/*",
      "//$BUILD_TINYEVAL_END"  : "*/",
      changed                  : "replaced",
      delimiters               : ["", ""],
      "let haveCodeGen;"       : "let haveCodeGen = !globalThis.DISABLE_STRUCT_CODEGEN;",
    }),
    resolve(),
    typescript(),
    //    terser()
  ],
};

//  plugins: [commonjs()]
