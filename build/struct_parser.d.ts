import * as struct_parseutil from "./struct_parseutil.js";
import type { StructField, StructEnumValue, NStructInterface } from "./types.js";
export { StructEnum } from "./types.js";
export declare class NStruct implements NStructInterface {
    fields: StructField[];
    id: number;
    name: string;
    constructor(name: string);
}
export declare const ArrayTypes: Set<StructEnumValue>;
export declare const ValueTypes: Set<StructEnumValue>;
export declare const StructTypes: Record<string, StructEnumValue>;
export declare const StructTypeMap: Record<number, string>;
export declare function stripComments(buf: string): string;
export declare const struct_parse: struct_parseutil.parser;
