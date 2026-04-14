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
    file  : "build/nstructjs_configurable_noeval.js",
    format: "module",
    name  : "nstructjs",
  },
  plugins: [
    replace({
      include: ["src/struct_intern.ts", "src/structjs.ts"],
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

      "//$BUILD_TINYEVAL_START": "/*",
      "//$BUILD_TINYEVAL_END"  : "*/",
      changed                  : "replaced",
      delimiters               : ["", ""],
    }),
    resolve(),
    //    terser()
    typescript(),
  ],
};

//  plugins: [commonjs()]
