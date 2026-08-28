import { parser } from "./struct_parseutil.js";
export interface TokInfo {
  lexpos: number;
  lineno: number;
  col: number;
  fields: Record<string | number, TokInfo>;
}
export declare function buildJSONParser(): parser;
declare const _defaultParser: parser;
export default _defaultParser;
export declare function printContext(buf: string, tokinfo: TokInfo | undefined, printColors?: boolean): string;
