import * as struct_parser from './struct_parser.js';
import * as struct_typesystem from './struct_typesystem.js';
import * as struct_parseutil from './struct_parseutil.js';
import * as struct_binpack from './struct_binpack.js';
import * as struct_filehelper from './struct_filehelper.js';
import * as struct_intern from './struct_intern.js';
import * as struct_eval from './struct_eval.js';

export {unpack_context} from './struct_binpack.js';
import {STRUCT, manager, setTruncateDollarSign} from './struct_intern.js';
import type {StructableClass, NStructInterface} from './types.js';

export * from './struct_intern.js';

/** truncate webpack mangled names. defaults to true
 *  so Mesh$1 turns into Mesh */
export function truncateDollarSign(value: boolean = true): void {
  setTruncateDollarSign(value);
}

export function validateStructs(onerror?: (msg: string, stt: NStructInterface, field: unknown) => void): void {
  return manager.validateStructs(onerror);
}

/**
 true means little endian, false means big endian
 */
export function setEndian(mode: boolean): boolean {
  const ret = struct_binpack.STRUCT_ENDIAN;

  struct_binpack.setBinaryEndian(mode);

  return ret;
}

export {deriveStructManager} from './struct_intern.js';

export function consoleLogger(...args: unknown[]): void {
  console.log(...args);
}

/** Validate json
 *
 * @param json
 * @param cls
 * @param useInternalParser If true (the default) an internal parser will be used that generates nicer error messages
 * @param printColors
 * @param logger
 * @returns {*}
 */
export function validateJSON(
  json: unknown,
  cls: StructableClass | NStructInterface | number,
  useInternalParser?: boolean,
  printColors: boolean = true,
  logger: (...args: unknown[]) => void = consoleLogger
): boolean {
  return manager.validateJSON(json, cls, useInternalParser, printColors, logger);
}

export function getEndian(): boolean {
  return struct_binpack.STRUCT_ENDIAN;
}

export function setAllowOverriding(t: unknown): boolean {
  return manager.allowOverriding = !!t;
}

export function isRegistered(cls: StructableClass): boolean {
  return manager.isRegistered(cls);
}

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
export function inlineRegister(cls: StructableClass, structScript: string): string {
  return manager.inlineRegister(cls, structScript);
}

/** Register a class with nstructjs **/
export function register(cls: StructableClass, structName?: string): void {
  return manager.register(cls, structName);
}

export function unregister(cls: StructableClass): void {
  manager.unregister(cls);
}

export function inherit(child: StructableClass, parent: StructableClass, structName: string = child.name): string {
  return STRUCT.inherit(child, parent, structName);
}

/**
 @param data : DataView
 */
export function readObject(data: DataView | Uint8Array | number[], cls: StructableClass | number, __uctx?: import('./types.js').UnpackContext): unknown {
  return manager.readObject(data, cls, __uctx);
}

/**
 @param data : Array instance to write bytes to
 */
export function writeObject(data: number[], obj: unknown): number[] {
  return manager.writeObject(data, obj);
}

export function writeJSON(obj: unknown): Record<string, unknown> {
  return manager.writeJSON(obj);
}

export function formatJSON(json: unknown, cls: StructableClass, addComments: boolean = true, validate: boolean = true): string {
  return manager.formatJSON(json, cls, addComments, validate);
}

export function readJSON(json: unknown, class_or_struct_id: StructableClass | NStructInterface | number): unknown {
  return manager.readJSON(json, class_or_struct_id);
}

export {setDebugMode} from './struct_intern.js';
export {setWarningMode} from './struct_intern.js';

//$BUILD_TINYEVAL_START
// @ts-ignore - tinyeval is an untyped JS dependency
import tinyeval1 from "../tinyeval/tinyeval.js";

export const tinyeval = tinyeval1;
import {nGlobal} from './struct_global.js';

export function useTinyEval(): void {
  struct_eval.setStructEval((buf: string) => {
    return (tinyeval as Record<string, unknown> & { eval: (buf: string, global: typeof globalThis) => unknown }).eval(buf, nGlobal);
  });
}
//$BUILD_TINYEVAL_END


//export other modules

export {struct_binpack as binpack};
export {struct_typesystem as typesystem};
export {struct_parseutil as parseutil};
export {struct_parser as parser};
export {struct_filehelper as filehelper};
