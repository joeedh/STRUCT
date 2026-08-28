import * as struct_parser from "./struct_parser.js";
import * as struct_typesystem from "./struct_typesystem.js";
import * as struct_parseutil from "./struct_parseutil.js";
import * as struct_binpack from "./struct_binpack.js";
import * as struct_filehelper from "./struct_filehelper.js";
export { unpack_context, BinWriter } from "./struct_binpack.js";
export type { PackBuffer } from "./struct_binpack.js";
import type { PackBuffer as PackBufferType } from "./struct_binpack.js";
import type { StructableClass, NStructInterface, MigrateOptions } from "./types.js";
export type {
  StructableClass,
  NStructInterface,
  StructableInstance,
  StructReader,
  StructMigrateFinisher,
} from "./types.js";
export * from "./struct_intern.js";
/** truncate webpack mangled names. defaults to true
 *  so Mesh$1 turns into Mesh */
export declare function truncateDollarSign(value?: boolean): void;
export declare function validateStructs(onerror?: (msg: string, stt: NStructInterface, field: unknown) => void): void;
/**
 true means little endian, false means big endian
 */
export declare function setEndian(mode: boolean): boolean;
export { deriveStructManager } from "./struct_intern.js";
export declare function consoleLogger(...args: unknown[]): void;
/** Validate json
 *
 * @param json
 * @param cls
 * @param useInternalParser If true (the default) an internal parser will be used that generates nicer error messages
 * @param printColors
 * @param logger
 * @returns {*}
 */
export declare function validateJSON(
  json: unknown,
  cls: StructableClass | NStructInterface | number,
  useInternalParser?: boolean,
  printColors?: boolean,
  logger?: (...args: unknown[]) => void
): boolean;
export declare function getEndian(): boolean;
export declare function setAllowOverriding(t: unknown): boolean;
export declare function isRegistered(cls: any): boolean;
/** Register a class inline.
 *
 * Note: No need to use nstructjs.inherit,
 * inheritance is handled for you.  Unlike
 * nstructjs.inherit fields can be properly
 * overridden in the child class without
 * being written twice.
 *
 * class Test {
 *  test = 0;
 *
 *  static STRUCT = nstructjs.inlineRegister(this, `
 *  namespace.Test {
 *    test : int;
 *  }
 *  `);
 * }
 **/
export declare function inlineRegister(cls: any, structScript: string): string;
/** Register a class with nstructjs **/
export declare function register(cls: any, structName?: string): void;
export declare function unregister(cls: any): void;
/** @deprecated */
export declare function inherit(child: any, parent: any, structName?: string): string;
/**
 @param data : DataView
 @param version : starting version passed to migrateSTRUCT/getVersionSTRUCT
   during the read. Binary has no separate migration pass ahead of the read
   the way JSON does (readJSON -> migrateJSON); migration happens in-place
   as each struct finishes loading.
 */
export declare function readObject<T = unknown>(
  data: DataView | Uint8Array | number[],
  cls: StructableClass<T> | number,
  __uctx?: import("./types.js").UnpackContext,
  version?: number
): T;
/**
 @param data : Array or BinWriter instance to write bytes to
 */
export declare function writeObject<T = unknown>(data: number[], obj: T): number[];
export declare function writeObject<B extends PackBufferType, T = unknown>(data: B, obj: T): B;
export declare function writeJSON<T = unknown>(obj: T): Record<string, unknown>;
export declare function formatJSON(
  json: unknown,
  cls: StructableClass,
  addComments?: boolean,
  validate?: boolean
): string;
/** Apply migrations in-place to a json object. */
export declare function migrateJSON<T = unknown>(
  json: unknown,
  class_or_struct_id: StructableClass<T> | NStructInterface | number,
  migrateOptions: MigrateOptions
): unknown;
/**
 * Deserialize from json.
 * If migrate is not undefined, migration will be applied in-place
 * prior to deserialization; note this is different from binary which
 * happens in-place during deserialization.
 */
export declare function readJSON<T = unknown>(
  json: unknown,
  class_or_struct_id: StructableClass<T> | NStructInterface | number,
  migrate?: MigrateOptions
): T;
export { setDebugMode } from "./struct_intern.js";
export { setWarningMode } from "./struct_intern.js";
export declare const tinyeval: any;
export declare function useTinyEval(): void;
export { struct_binpack as binpack };
export { struct_typesystem as typesystem };
export { struct_parseutil as parseutil };
export { struct_parser as parser };
export { struct_filehelper as filehelper };
