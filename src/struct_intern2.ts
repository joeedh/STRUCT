import * as struct_binpack from "./struct_binpack.js";
import { StructEnum, ValueTypes } from "./struct_parser.js";
import * as util from "./struct_util.js";

import {
  TypeDescriptor,
  StructField,
  StructEnumValue,
  StructFieldTypeClass,
  StructManager,
  UnpackContext,
  FieldTypeDefinition,
  getTokInfo,
  TokSymbolRet,
} from "./types.js";

import {
  pack_int,
  pack_byte,
  pack_float,
  pack_sbyte,
  pack_short,
  pack_string,
  pack_uint,
  pack_static_string,
  pack_ushort,
  pack_double,
  pack_bytes,
  unpack_byte,
  STRUCT_ENDIAN,
  unpack_int,
  decode_utf8,
  unpack_double,
  encode_utf8,
  test_utf8,
  unpack_bytes,
  unpack_float,
  unpack_sbyte,
  unpack_string,
  unpack_short,
  unpack_static_string,
  unpack_uint,
  unpack_ushort,
  unpack_context,
  temp_dataview,
  uint8_view,
  BinWriter,
} from "./struct_binpack.js";
import type { PackBuffer } from "./struct_binpack.js";
import { TokInfo } from "./struct_json.js";

let warninglvl = 2;
let debug = 0;

let _static_envcode_null = "";
let packer_debug: (...args: unknown[]) => void;
let packer_debug_start: (...args: unknown[]) => void;
let packer_debug_end: (...args: unknown[]) => void;
let packdebug_tablevel = 0;

export function _get_pack_debug(): {
  packer_debug: (...args: unknown[]) => void;
  packer_debug_start: (...args: unknown[]) => void;
  packer_debug_end: (...args: unknown[]) => void;
  debug: number;
  warninglvl: number;
} {
  return {
    packer_debug,
    packer_debug_start,
    packer_debug_end,
    debug,
    warninglvl,
  };
}

interface FakeFieldEntry {
  type: TypeDescriptor | undefined;
  get: string | undefined;
}

class cachering<T> extends Array<T> {
  cur: number;

  constructor(cb: () => T, tot: number) {
    super();
    this.length = tot;
    this.cur = 0;

    for (let i = 0; i < tot; i++) {
      this[i] = cb();
    }
  }

  static fromConstructor<U>(cls: new () => U, tot: number): cachering<U> {
    return new cachering(() => new cls(), tot);
  }

  next(): T {
    let ret = this[this.cur];

    this.cur = (this.cur + 1) % this.length;

    return ret;
  }
}

function gen_tabstr(tot: number): string {
  let ret = "";

  for (let i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

export function setWarningMode2(t: number): void {
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl = t;
}

export function setDebugMode2(t: number): void {
  debug = t;

  if (debug) {
    packer_debug = function (...args: unknown[]): void {
      let tab = gen_tabstr(packdebug_tablevel);

      if (args.length > 0) {
        console.warn(tab, ...args);
      } else {
        console.warn("Warning: undefined msg");
      }
    };
    packer_debug_start = function (funcname: unknown): void {
      packer_debug("Start " + funcname);
      packdebug_tablevel++;
    };

    packer_debug_end = function (funcname?: unknown): void {
      packdebug_tablevel--;

      if (funcname) {
        packer_debug("Leave " + funcname);
      }
    };
  } else {
    packer_debug = function (..._args: unknown[]): void {};
    packer_debug_start = function (..._args: unknown[]): void {};
    packer_debug_end = function (..._args: unknown[]): void {};
  }
}

setDebugMode2(debug);

export const StructFieldTypes: StructFieldTypeClass[] = [];
export const StructFieldTypeMap: Record<number, StructFieldTypeClass> = {};

export function packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
  StructFieldTypeMap[type.type].packNull(manager, data, field, type);
}

export function toJSON(
  manager: StructManager,
  val: unknown,
  obj: unknown,
  field: StructField,
  type: TypeDescriptor
): unknown {
  return StructFieldTypeMap[type.type].toJSON(manager, val, obj, field, type);
}

export function fromJSON(
  manager: StructManager,
  val: unknown,
  obj: unknown,
  field: StructField,
  type: TypeDescriptor,
  instance: unknown
): unknown {
  return StructFieldTypeMap[type.type].fromJSON(manager, val, obj, field, type, instance);
}

export function formatJSON(
  manager: StructManager,
  val: unknown,
  obj: unknown,
  field: StructField,
  type: TypeDescriptor,
  instance: unknown,
  tlvl: number = 0
): string {
  return StructFieldTypeMap[type.type].formatJSON(manager, val, obj, field, type, instance, tlvl);
}

export function validateJSON(
  manager: StructManager,
  val: unknown,
  obj: unknown,
  field: StructField,
  type: TypeDescriptor,
  instance: unknown,
  _abstractKey?: string
): TokSymbolRet {
  return StructFieldTypeMap[type.type].validateJSON(manager, val, obj, field, type, instance, _abstractKey);
}

function unpack_field(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
  let name: string | undefined;

  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("R " + name);
  }

  let ret = StructFieldTypeMap[type.type].unpack(manager, data, type, uctx);

  if (debug) {
    packer_debug_end();
  }

  return ret;
}

let fakeFields = new cachering<FakeFieldEntry>(() => {
  return { type: undefined, get: undefined };
}, 256);

/*
 Bulk fast paths for arrays/iters of fixed-width primitives: identical wire
 bytes to the per-element path, minus the per-element dispatch. Both helpers
 return false for non-primitive element types (caller falls back).
*/
function unpackPrimitiveBulk(data: DataView, etype: number, len: number, uctx: UnpackContext, arr: unknown[]): boolean {
  let p = uctx.i;

  switch (etype) {
    case StructEnum.BYTE:
      for (let i = 0; i < len; i++) arr[i] = data.getUint8(p + i);
      p += len;
      break;
    case StructEnum.SIGNED_BYTE:
      for (let i = 0; i < len; i++) arr[i] = data.getInt8(p + i);
      p += len;
      break;
    case StructEnum.BOOL:
      for (let i = 0; i < len; i++) arr[i] = !!data.getUint8(p + i);
      p += len;
      break;
    case StructEnum.SHORT:
      for (let i = 0; i < len; i++, p += 2) arr[i] = data.getInt16(p, STRUCT_ENDIAN);
      break;
    case StructEnum.USHORT:
      for (let i = 0; i < len; i++, p += 2) arr[i] = data.getUint16(p, STRUCT_ENDIAN);
      break;
    case StructEnum.INT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getInt32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.UINT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getUint32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.FLOAT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getFloat32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.DOUBLE:
      for (let i = 0; i < len; i++, p += 8) arr[i] = data.getFloat64(p, STRUCT_ENDIAN);
      break;
    default:
      return false;
  }

  uctx.i = p;
  return true;
}

function packPrimitiveBulk(data: PackBuffer, etype: number, arr: ArrayLike<number>, n: number = arr.length): boolean {
  switch (etype) {
    case StructEnum.BYTE:
      if ((data as BinWriter)._isBinWriter && n === arr.length) {
        (data as BinWriter).pushBytes(arr);
      } else {
        for (let i = 0; i < n; i++) pack_byte(data, arr[i]);
      }
      break;
    case StructEnum.SIGNED_BYTE:
      for (let i = 0; i < n; i++) pack_sbyte(data, arr[i]);
      break;
    case StructEnum.BOOL:
      for (let i = 0; i < n; i++) pack_byte(data, arr[i] ? 1 : 0);
      break;
    case StructEnum.SHORT:
      for (let i = 0; i < n; i++) pack_short(data, arr[i]);
      break;
    case StructEnum.USHORT:
      for (let i = 0; i < n; i++) pack_ushort(data, arr[i]);
      break;
    case StructEnum.INT:
      for (let i = 0; i < n; i++) pack_int(data, arr[i]);
      break;
    case StructEnum.UINT:
      for (let i = 0; i < n; i++) pack_uint(data, arr[i]);
      break;
    case StructEnum.FLOAT:
      for (let i = 0; i < n; i++) pack_float(data, arr[i]);
      break;
    case StructEnum.DOUBLE:
      for (let i = 0; i < n; i++) pack_double(data, arr[i]);
      break;
    default:
      return false;
  }

  return true;
}

/** A bulk-packable value: a plain array or a (non-DataView) typed array. */
function isBulkArray(val: unknown): boolean {
  return Array.isArray(val) || (ArrayBuffer.isView(val) && !(val instanceof DataView));
}

/** Fresh-array unpack of a byte iter/array straight into an owned typed array
 *  (one bulk copy, no per-element work). Wire bytes are unchanged; the field
 *  value becomes Uint8Array/Int8Array instead of number[]. Returns null for
 *  non-byte element types. The pack side accepts typed arrays (isBulkArray),
 *  so this round-trips. */
function unpackByteTyped(
  data: DataView,
  etype: number,
  len: number,
  uctx: UnpackContext
): Uint8Array | Int8Array | null {
  if (etype !== StructEnum.BYTE && etype !== StructEnum.SIGNED_BYTE) {
    return null;
  }
  const abs = data.byteOffset + uctx.i;
  const slice = data.buffer.slice(abs, abs + len);
  uctx.i += len;
  return etype === StructEnum.BYTE ? new Uint8Array(slice) : new Int8Array(slice);
}

function fmt_type(type: TypeDescriptor): string {
  return StructFieldTypeMap[type.type].format(type);
}

export function do_pack(
  manager: StructManager,
  data: PackBuffer,
  val: unknown,
  obj: unknown,
  field: StructField,
  type: TypeDescriptor | number
): void {
  let name: string | undefined;

  if (debug) {
    name =
      StructFieldTypeMap[
        (type as TypeDescriptor).type !== undefined ? (type as TypeDescriptor).type : (type as number)
      ].define().name;
    packer_debug_start("W " + name);
  }

  let typeid: number;
  if (typeof type !== "number") {
    typeid = type.type;
  } else {
    typeid = type;
  }

  let ret = StructFieldTypeMap[typeid].pack(manager, data, val, obj, field, type as TypeDescriptor);

  if (debug) {
    packer_debug_end();
  }

  return ret;
}

let _ws_env: [string, unknown][] = [["", undefined]];

export class StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {}

  static unpack(_manager: StructManager, _data: DataView, _type: TypeDescriptor, _uctx: UnpackContext): unknown {
    return undefined;
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    this.pack(manager, data, 0, 0, field, type);
  }

  static format(type: TypeDescriptor): string {
    return this.define().name;
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    return val;
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    return val;
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    return JSON.stringify(val);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    return { ok: true };
  }

  /**
   return false to override default
   helper js for packing
   */
  static useHelperJS(field: StructField): boolean {
    return true;
  }

  /**
   Define field class info.

   Example:
   <pre>
   static define() {return {
    type : StructEnum.INT,
    name : "int"
  }}
   </pre>
   */
  static define(): FieldTypeDefinition {
    return {
      type: -1 as StructEnumValue,
      name: "(error)",
    };
  }

  /**
   Register field packer/unpacker class.  Will throw an error if define() method is bad.
   */
  static register(cls: StructFieldTypeClass): void {
    if (StructFieldTypes.indexOf(cls) >= 0) {
      throw new Error("class already registered");
    }

    if (cls.define === StructFieldType.define) {
      throw new Error("you forgot to make a define() static method");
    }

    if (cls.define().type === undefined) {
      throw new Error("cls.define().type was undefined!");
    }

    if (cls.define().type in StructFieldTypeMap) {
      throw new Error("type " + cls.define().type + " is used by another StructFieldType subclass");
    }

    StructFieldTypes.push(cls);
    StructFieldTypeMap[cls.define().type] = cls;
  }
}

class StructIntField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_int(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_int(data, uctx);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }

    return { ok: true };
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.INT,
      name: "int",
    };
  }
}

StructFieldType.register(StructIntField as unknown as StructFieldTypeClass);

class StructFloatField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_float(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_float(data, uctx);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "number") {
      return { ok: "Not a float: " + val, tokInfo: getTokInfo(obj) };
    }

    return { ok: true };
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.FLOAT,
      name: "float",
    };
  }
}

StructFieldType.register(StructFloatField as unknown as StructFieldTypeClass);

class StructDoubleField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_double(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_double(data, uctx);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "number") {
      return { ok: "Not a double: " + val, tokInfo: getTokInfo(obj) };
    }

    return { ok: true };
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.DOUBLE,
      name: "double",
    };
  }
}

StructFieldType.register(StructDoubleField as unknown as StructFieldTypeClass);

class StructStringField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    const s = !val ? "" : (val as string);

    pack_string(data, s);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "string") {
      return { ok: "Not a string: " + val, tokInfo: getTokInfo(obj) };
    }

    return { ok: true };
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    this.pack(manager, data, "", 0, field, type);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_string(data, uctx);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.STRING,
      name: "string",
    };
  }
}

StructFieldType.register(StructStringField as unknown as StructFieldTypeClass);

class StructStaticStringField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    const s = !val ? "" : (val as string);

    pack_static_string(data, s, (type.data as { maxlength: number }).maxlength);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "string") {
      return { ok: "Not a string: " + val, tokInfo: getTokInfo(obj) };
    }

    if (val.length > (type.data as { maxlength: number }).maxlength) {
      return {
        ok     : "String is too big; limit is " + (type.data as { maxlength: number }).maxlength + "; string:" + val,
        tokInfo: getTokInfo(obj),
      };
    }

    return { ok: true };
  }

  static format(type: TypeDescriptor): string {
    return `static_string[${(type.data as { maxlength: number }).maxlength}]`;
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    this.pack(manager, data, "", 0, field, type);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_static_string(data, uctx, (type.data as { maxlength: number }).maxlength);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.STATIC_STRING,
      name: "static_string",
    };
  }
}

StructFieldType.register(StructStaticStringField as unknown as StructFieldTypeClass);

class StructStructField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    // Host-supplied placeholder for an unloaded class: write the schema it was
    // read under, not the declared one. A concrete struct field carries no
    // struct id in the stream, so unlike StructTStructField only the schema is
    // substituted. Consulted *before* get_struct because the declared class is
    // itself typically unregistered in this case, and get_struct throws.
    // The hook is undefined by default, so ordinary values are unaffected.
    let stt: ReturnType<StructManager["get_struct"]> | undefined;

    if (manager.onSerializeUnknown) {
      const overrideName = manager.onSerializeUnknown(val);
      if (overrideName !== undefined) {
        stt = manager.get_struct(overrideName);
      }
    }

    if (stt === undefined) {
      stt = manager.get_struct(type.data as string);
    }

    packer_debug("struct", stt.name);

    manager.write_struct(data, val, stt);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    let stt = manager.get_struct(type.data as string);

    if (!val) {
      return { ok: "Expected " + stt.name + " object", tokInfo: getTokInfo(obj) };
    }

    return manager.validateJSONIntern(val as Record<string, unknown>, stt, _abstractKey);
  }

  static format(type: TypeDescriptor): string {
    return type.data as string;
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    let stt = manager.get_struct(type.data as string);

    return manager.readJSON(val, stt, instance);
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    let stt = manager.get_struct(type.data as string);

    return manager.formatJSON_intern(val as Record<string, unknown>, stt, field, tlvl);
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    let stt = manager.get_struct(type.data as string);
    return manager.writeJSON(val, stt);
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    let cls2 = manager.get_struct_cls(type.data as string);

    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager.read_object(data, cls2, uctx, dest);
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    let stt = manager.get_struct(type.data as string);

    packer_debug("struct", type);

    for (let field2 of stt.fields) {
      let type2 = field2.type;

      packNull(manager, data, field2, type2);
    }
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    let cls2 = manager.get_struct_cls(type.data as string);
    packer_debug("struct", cls2 ? cls2.name : "(error)");

    return manager.read_object(data, cls2, uctx);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.STRUCT,
      name: "struct",
    };
  }
}

StructFieldType.register(StructStructField as unknown as StructFieldTypeClass);

class StructTStructField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    let cls = manager.get_struct_cls(type.data as string);
    let stt = manager.get_struct(type.data as string);

    const keywords = (manager.constructor as unknown as { keywords: import("./types.js").StructKeywords }).keywords;

    // Host-supplied placeholder for an unloaded-addon class: write under the
    // original struct's id + schema, not the placeholder's. See plan §4.
    if (manager.onSerializeUnknown) {
      const overrideName = manager.onSerializeUnknown(val);
      if (overrideName !== undefined) {
        const ostt = manager.get_struct(overrideName);
        if (debug) packer_debug("int " + ostt.id);
        pack_int(data, ostt.id);
        manager.write_struct(data, val, ostt);
        return;
      }
    }

    const valObj = val as Record<string, unknown>;
    const valCtor = valObj.constructor as unknown as Record<string, unknown>;

    //make sure inheritance is correct
    if (valCtor[keywords.name] !== type.data && val instanceof (cls as unknown as Function)) {
      stt = manager.get_struct(valCtor[keywords.name] as string);
    } else if (valCtor[keywords.name] === type.data) {
      stt = manager.get_struct(type.data as string);
    } else {
      console.trace();
      throw new Error("Bad struct " + valCtor[keywords.name] + " passed to write_struct");
    }

    if (debug) packer_debug("int " + stt.id);

    pack_int(data, stt.id);
    manager.write_struct(data, val, stt);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    let key = (type as { jsonKeyword: string }).jsonKeyword;

    if (typeof val !== "object") {
      return { ok: typeof val + " is not an object", tokInfo: getTokInfo(obj) };
    }

    const valObj = val as Record<string, unknown>;
    let stt = manager.get_struct(valObj[key] as string);
    let cls = manager.get_struct_cls(stt.name) as unknown as { prototype: { __proto__: { constructor: unknown } } };
    let parentcls = manager.get_struct_cls(type.data as string);

    let ok = false;

    do {
      if ((cls as unknown) === parentcls) {
        ok = true;
        break;
      }

      cls = cls.prototype.__proto__.constructor as typeof cls;
    } while (cls && (cls as unknown) !== Object);

    if (!ok) {
      return { ok: stt.name + " is not a child class off " + type.data, tokInfo: getTokInfo(obj) };
    }

    return manager.validateJSONIntern(valObj, stt, (type as { jsonKeyword: string }).jsonKeyword);
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    let key = (type as { jsonKeyword: string }).jsonKeyword;

    const valObj = val as Record<string, unknown>;
    let stt = manager.get_struct(valObj[key] as string);

    return manager.readJSON(val, stt, instance);
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    let key = (type as { jsonKeyword: string }).jsonKeyword;

    const valObj = val as Record<string, unknown>;
    let stt = manager.get_struct(valObj[key] as string);

    return manager.formatJSON_intern(valObj as Record<string, unknown>, stt, field, tlvl);
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    const keywords = (manager.constructor as unknown as { keywords: import("./types.js").StructKeywords }).keywords;

    const valObj = val as Record<string, unknown>;
    const valCtor = valObj.constructor as unknown as Record<string, unknown>;

    let stt = manager.get_struct(valCtor[keywords.name] as string);
    let ret = manager.writeJSON(val, stt);

    ret[(type as { jsonKeyword: string }).jsonKeyword] = "" + stt.name;

    return ret;
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    let stt = manager.get_struct(type.data as string);

    pack_int(data, stt.id);
    packNull(manager, data, field, { type: StructEnum.STRUCT, data: type.data as string });
  }

  static format(type: TypeDescriptor): string {
    return "abstract(" + type.data + ")";
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    let id = struct_binpack.unpack_int(data, uctx);

    if (debug) packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }

    let cls2 = manager.get_struct_id(id);

    if (debug) packer_debug("struct name: " + cls2.name);

    let cls3 = manager.struct_cls[cls2.name];

    // Treat a parse_structs dummy as missing when a hook is installed, so the
    // hook fires for unloaded-addon classes. Pass the numeric id in that case so
    // read_object's onUnknownClass hook can produce a placeholder. See plan §4.
    const missing = cls3 === undefined || (!!manager.onUnknownClass && util.isParseStructsDummy(cls3));
    const instance = manager.read_object(data, missing ? id : cls3, uctx, dest);
    if (missing && instance && typeof instance === "object") {
      (instance as any)._origClsname = cls2.name;
    }
    return instance;
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    let id = struct_binpack.unpack_int(data, uctx);

    if (debug) packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }

    let cls2 = manager.get_struct_id(id);

    if (debug) packer_debug("struct name: " + cls2.name);
    let cls3 = manager.struct_cls[cls2.name];

    // Treat a parse_structs dummy as missing when a hook is installed, so the
    // hook fires for unloaded-addon classes. Pass the numeric id in that case so
    // read_object's onUnknownClass hook can produce a placeholder. See plan §4.
    const missing = cls3 === undefined || (!!manager.onUnknownClass && util.isParseStructsDummy(cls3));
    const instance = manager.read_object(data, missing ? id : cls3, uctx);
    if (missing && instance && typeof instance === "object") {
      (instance as any)._origClsname = cls2.name;
    }
    return instance;
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.TSTRUCT,
      name: "tstruct",
    };
  }
}

StructFieldType.register(StructTStructField as unknown as StructFieldTypeClass);

/** out is just a [string], an array of dimen 1 whose sole entry is the output string. */
export function formatArrayJson(
  manager: StructManager,
  val: unknown,
  obj: unknown,
  field: StructField,
  type: TypeDescriptor,
  type2: TypeDescriptor,
  instance: unknown,
  tlvl: number,
  array: unknown[] = val as unknown[]
): string {
  if (array === undefined || array === null || typeof array !== "object" || !(Symbol.iterator in array)) {
    console.log(obj);
    console.log(array);
    throw new Error(`Expected an array for ${field.name}`);
  }

  if (ValueTypes.has(type2.type)) {
    return JSON.stringify(array);
  }

  let s = "[";
  if (manager.formatCtx.addComments && field.comment.trim()) {
    s += " " + field.comment.trim();
  }

  s += "\n";

  for (let i = 0; i < (array as unknown[]).length; i++) {
    let item = (array as unknown[])[i];

    s += util.tab(tlvl + 1) + formatJSON(manager, item, val, field, type2, instance, tlvl + 1) + ",\n";
  }

  s += util.tab(tlvl) + "]";

  return s;
}

class StructArrayField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    if (val === undefined) {
      console.trace();
      console.log("Undefined array fed to struct struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      struct_binpack.pack_int(data, 0);
      return;
    }

    const arr = val as unknown[];

    packer_debug("int " + arr.length);
    struct_binpack.pack_int(data, arr.length);

    let d = type.data as { type: TypeDescriptor; iname: string };

    let itername = d.iname;
    let type2 = d.type;

    const useEnv = itername !== "" && itername !== undefined && field.get;
    if (!debug && !useEnv && packPrimitiveBulk(data, type2.type, arr as unknown as ArrayLike<number>)) {
      return;
    }

    let env = _ws_env;
    for (let i = 0; i < arr.length; i++) {
      let val2: unknown = arr[i];
      if (useEnv) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get!, obj, env);
      }

      //XXX not sure I really need this fakeField stub here. . .
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager, data, val2, obj, fakeField as unknown as StructField, type2);
    }
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    pack_int(data, 0);
  }

  static format(type: TypeDescriptor): string {
    const d = type.data as { type: TypeDescriptor; iname: string };
    if (d.iname !== "" && d.iname !== undefined) {
      return "array(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "array(" + fmt_type(d.type) + ")";
    }
  }

  static useHelperJS(field: StructField): boolean {
    return !(field.type.data as { iname: string }).iname;
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (!val) {
      return { ok: "not an array: " + val, tokInfo: getTokInfo(obj) };
    }

    const arr = val as unknown[];
    for (let i = 0; i < arr.length; i++) {
      let ret = validateJSON(
        manager,
        arr[i],
        val,
        field,
        (type.data as { type: TypeDescriptor }).type,
        undefined,
        _abstractKey
      );

      if (typeof ret.ok === "string" || !ret.ok) {
        return ret;
      }
    }

    return { ok: true };
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    const arr = val as unknown[];
    let ret = (instance || []) as unknown[];

    ret.length = 0;

    for (let i = 0; i < arr.length; i++) {
      let val2 = fromJSON(manager, arr[i], val, field, (type.data as { type: TypeDescriptor }).type, undefined);

      if (val2 === undefined) {
        console.log(val2);
        console.error("eeek");
        throw new Error("Unexpected undefined value in fromJSON");
      }

      ret.push(val2);
    }

    return ret;
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    return formatArrayJson(
      manager,
      val,
      obj,
      field,
      type,
      (type.data as { type: TypeDescriptor }).type,
      instance,
      tlvl ?? 0
    );
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    const arr = (val || []) as unknown[];
    let json: unknown[] = [];

    let itername = (type.data as { iname: string }).iname;

    for (let i = 0; i < arr.length; i++) {
      let val2: unknown = arr[i];
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      json.push(toJSON(manager, val2, val, field, (type.data as { type: TypeDescriptor }).type));
    }

    return json;
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    let len = struct_binpack.unpack_int(data, uctx);
    const arr = dest as unknown[];
    const t2 = (type.data as { type: TypeDescriptor }).type;

    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, t2, uctx));
    }

    return arr;
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    let len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    const t2 = (type.data as { type: TypeDescriptor }).type;

    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }

    let arr = new Array(len);

    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }

    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, t2, uctx);
    }

    return arr;
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.ARRAY,
      name: "array",
    };
  }
}

StructFieldType.register(StructArrayField as unknown as StructFieldTypeClass);

class StructIterField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    //this was originally implemented to use ES6 iterators.
    function forEach(cb: (item: unknown) => void, thisvar: unknown): void {
      const v = val as Record<string, unknown> | null;
      if (v && (v as unknown as Iterable<unknown>)[Symbol.iterator]) {
        for (const item of v as unknown as Iterable<unknown>) {
          cb.call(thisvar, item);
        }
      } else if (v && typeof (v as { forEach?: unknown }).forEach === "function") {
        (v as { forEach: (fn: (item: unknown) => void) => void }).forEach(function (item: unknown) {
          cb.call(thisvar, item);
        });
      } else {
        console.trace();
        console.log("Undefined iterable list fed to struct struct packer!", val);
        console.log("Field: ", field);
        console.log("Type: ", type);
        console.log("");
      }
    }

    let d = type.data as { type: TypeDescriptor; iname: string };
    let itername = d.iname;
    let type2 = d.type;
    let env = _ws_env;

    const useEnv = itername !== "" && itername !== undefined && field.get;
    if (!debug && !useEnv && isBulkArray(val)) {
      const arr = val as ArrayLike<number>;

      pack_int(data, arr.length);
      if (packPrimitiveBulk(data, type2.type, arr)) {
        return;
      }

      /* non-primitive elements: undo the length we just wrote */
      data.length -= 4;
    }

    /* save space for length */
    let starti: number;
    if ((data as BinWriter)._isBinWriter) {
      starti = (data as BinWriter).reserve(4);
    } else {
      starti = data.length;
      data.length += 4;
    }

    let i = 0;
    forEach(function (val2: unknown) {
      let v2 = val2;
      if (useEnv) {
        env[0][0] = itername;
        env[0][1] = v2;
        v2 = manager._env_call(field.get!, obj, env);
      }

      //XXX not sure I really need this fakeField stub here. . .
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager, data, v2, obj, fakeField as unknown as StructField, type2);

      i++;
    }, undefined);

    /* write length */
    if ((data as BinWriter)._isBinWriter) {
      (data as BinWriter).patchI32(starti, i);
    } else {
      temp_dataview.setInt32(0, i, STRUCT_ENDIAN);

      const a = data as number[];
      a[starti++] = uint8_view[0];
      a[starti++] = uint8_view[1];
      a[starti++] = uint8_view[2];
      a[starti++] = uint8_view[3];
    }
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    return formatArrayJson(
      manager,
      val,
      obj,
      field,
      type,
      (type.data as { type: TypeDescriptor }).type,
      instance,
      tlvl ?? 0,
      util.list(val as Iterable<unknown>)
    );
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    return StructArrayField.validateJSON(manager, val, obj, field, type, instance, _abstractKey);
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    return StructArrayField.fromJSON(manager, val, obj, field, type, instance);
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    const arr = (val || []) as Iterable<unknown>;
    let json: unknown[] = [];

    let itername = (type.data as { iname: string }).iname;

    for (let val2 of arr) {
      let v2: unknown = val2;
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = v2;
        v2 = manager._env_call(field.get, obj, env);
      }

      json.push(toJSON(manager, v2, val, field, (type.data as { type: TypeDescriptor }).type));
    }

    return json;
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    pack_int(data, 0);
  }

  static useHelperJS(field: StructField): boolean {
    return !(field.type.data as { iname: string }).iname;
  }

  static format(type: TypeDescriptor): string {
    const d = type.data as { type: TypeDescriptor; iname: string };
    if (d.iname !== "" && d.iname !== undefined) {
      return "iter(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "iter(" + fmt_type(d.type) + ")";
    }
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    let len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    const arr = dest as unknown[];
    const t2 = (type.data as { type: TypeDescriptor }).type;

    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, t2, uctx));
    }

    return arr;
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    let len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    const t2 = (type.data as { type: TypeDescriptor }).type;

    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }

    let arr = new Array(len);

    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }

    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, t2, uctx);
    }

    return arr;
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.ITER,
      name: "iter",
    };
  }
}

StructFieldType.register(StructIterField as unknown as StructFieldTypeClass);

class StructShortField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_short(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_short(data, uctx);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.SHORT,
      name: "short",
    };
  }
}

StructFieldType.register(StructShortField as unknown as StructFieldTypeClass);

class StructByteField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_byte(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_byte(data, uctx);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.BYTE,
      name: "byte",
    };
  }
}

StructFieldType.register(StructByteField as unknown as StructFieldTypeClass);

class StructSignedByteField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_sbyte(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_sbyte(data, uctx);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.SIGNED_BYTE,
      name: "sbyte",
    };
  }
}

StructFieldType.register(StructSignedByteField as unknown as StructFieldTypeClass);

class StructBoolField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_byte(data, val ? 1 : 0);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return !!unpack_byte(data, uctx);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (val === 0 || val === 1 || val === true || val === false || val === "true" || val === "false") {
      return { ok: true };
    }

    return { ok: "" + val + " is not a bool", tokInfo: getTokInfo(obj) };
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    if (val === "false") {
      return false;
    }

    return !!val;
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    return !!val;
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.BOOL,
      name: "bool",
    };
  }
}

StructFieldType.register(StructBoolField as unknown as StructFieldTypeClass);

class StructIterKeysField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    //this was originally implemented to use ES6 iterators.
    if ((typeof val !== "object" && typeof val !== "function") || val === null) {
      console.warn("Bad object fed to iterkeys in struct packer!", val);
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");

      struct_binpack.pack_int(data, 0);
      return;
    }

    const valObj = val as Record<string, unknown>;

    let len = 0.0;
    for (let k in valObj) {
      len++;
    }

    packer_debug("int " + len);
    struct_binpack.pack_int(data, len);

    let d = type.data as { type: TypeDescriptor; iname: string };
    let itername = d.iname;
    let type2 = d.type;
    let env = _ws_env;

    let i = 0;
    for (let key in valObj) {
      if (i >= len) {
        if (warninglvl > 0) {
          console.warn("Warning: object keys magically changed during iteration", val, i);
        }
        return;
      }

      let val2: unknown;
      if (itername && itername.trim().length > 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = key;
        val2 = manager._env_call(field.get, obj, env);
      } else {
        val2 = valObj[key]; //fetch value
      }

      let f2: StructField = { type: type2, get: undefined, name: "", comment: "", loc: { line: 0, column: 0 } };
      do_pack(manager, data, val2, obj, f2, type2);

      i++;
    }
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    return StructArrayField.validateJSON(manager, val, obj, field, type, instance, _abstractKey);
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    return StructArrayField.fromJSON(manager, val, obj, field, type, instance);
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    return formatArrayJson(
      manager,
      val,
      obj,
      field,
      type,
      (type.data as { type: TypeDescriptor }).type,
      instance,
      tlvl ?? 0,
      util.list(val as Iterable<unknown>)
    );
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    const arr = (val || []) as Record<string, unknown>;
    let json: unknown[] = [];

    let itername = (type.data as { iname: string }).iname;

    for (let k in arr) {
      let val2: unknown = arr[k];
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      json.push(toJSON(manager, val2, val, field, (type.data as { type: TypeDescriptor }).type));
    }

    return json;
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    pack_int(data, 0);
  }

  static useHelperJS(field: StructField): boolean {
    return !(field.type.data as { iname: string }).iname;
  }

  static format(type: TypeDescriptor): string {
    const d = type.data as { type: TypeDescriptor; iname: string };
    if (d.iname !== "" && d.iname !== undefined) {
      return "iterkeys(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "iterkeys(" + fmt_type(d.type) + ")";
    }
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    const arr = dest as unknown[];
    const t2 = (type.data as { type: TypeDescriptor }).type;

    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, t2, uctx));
    }

    return arr;
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    const t2 = (type.data as { type: TypeDescriptor }).type;

    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }

    let arr = new Array(len);

    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }

    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, t2, uctx);
    }

    return arr;
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.ITERKEYS,
      name: "iterkeys",
    };
  }
}

StructFieldType.register(StructIterKeysField as unknown as StructFieldTypeClass);

class StructUintField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_uint(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_uint(data, uctx);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }

    return { ok: true };
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.UINT,
      name: "uint",
    };
  }
}

StructFieldType.register(StructUintField as unknown as StructFieldTypeClass);

class StructUshortField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_ushort(data, val as number);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    return unpack_ushort(data, uctx);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }

    return { ok: true };
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.USHORT,
      name: "ushort",
    };
  }
}

StructFieldType.register(StructUshortField as unknown as StructFieldTypeClass);

class StructStaticArrayField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    const d = type.data as { type: TypeDescriptor; size: number; iname: string };

    if (d.size === undefined) {
      throw new Error("type.data.size was undefined");
    }

    let itername = d.iname;

    const arr = val as unknown[] | undefined;
    if (arr === undefined || !arr.length) {
      this.packNull(manager, data, field, type);
      return;
    }

    const useEnv = itername !== "" && itername !== undefined && field.get;
    if (
      !debug &&
      !useEnv &&
      arr.length >= d.size &&
      packPrimitiveBulk(data, d.type.type, arr as unknown as ArrayLike<number>, d.size)
    ) {
      return;
    }

    for (let i = 0; i < d.size; i++) {
      let i2 = Math.min(i, Math.min(arr.length - 1, d.size));
      let val2: unknown = arr[i2];

      if (useEnv) {
        let env = _ws_env;
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get!, obj, env);
      }

      do_pack(manager, data, val2, val, field, d.type);
    }
  }

  static useHelperJS(field: StructField): boolean {
    return !(field.type.data as { iname: string }).iname;
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    return StructArrayField.validateJSON(manager, val, obj, field, type, instance, _abstractKey);
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    return StructArrayField.fromJSON(manager, val, obj, field, type, instance);
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    return formatArrayJson(
      manager,
      val,
      obj,
      field,
      type,
      (type.data as { type: TypeDescriptor }).type,
      instance,
      tlvl ?? 0,
      util.list(val as Iterable<unknown>)
    );
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    const d = type.data as { type: TypeDescriptor; size: number };
    let size = d.size;
    for (let i = 0; i < size; i++) {
      packNull(manager, data, field, d.type);
    }
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    return StructArrayField.toJSON(manager, val, obj, field, type);
  }

  static format(type: TypeDescriptor): string {
    const d = type.data as { type: TypeDescriptor; size: number; iname: string };
    let type2 = StructFieldTypeMap[d.type.type].format(d.type);

    let ret = `static_array[${type2}, ${d.size}`;

    if (d.iname) {
      ret += `, ${d.iname}`;
    }
    ret += `]`;

    return ret;
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    const d = type.data as { type: TypeDescriptor; size: number };
    packer_debug("-size: " + d.size);

    const ret = dest as unknown[];

    if (!debug) {
      ret.length = d.size;
      if (unpackPrimitiveBulk(data, d.type.type, d.size, uctx, ret)) {
        return ret;
      }
    }

    ret.length = 0;

    for (let i = 0; i < d.size; i++) {
      ret.push(unpack_field(manager, data, d.type, uctx));
    }

    return ret;
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    const d = type.data as { type: TypeDescriptor; size: number };
    packer_debug("-size: " + d.size);

    if (!debug) {
      const ret = new Array(d.size);
      if (unpackPrimitiveBulk(data, d.type.type, d.size, uctx, ret)) {
        return ret;
      }
    }

    let ret: unknown[] = [];

    for (let i = 0; i < d.size; i++) {
      ret.push(unpack_field(manager, data, d.type, uctx));
    }

    return ret;
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.STATIC_ARRAY,
      name: "static_array",
    };
  }
}

StructFieldType.register(StructStaticArrayField as unknown as StructFieldTypeClass);

class StructOptionalField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    pack_int(data, val !== undefined && val !== null ? 1 : 0);
    if (val !== undefined && val !== null) {
      const fakeField: StructField = { ...field, type: type.data as TypeDescriptor };
      do_pack(manager, data, val, obj, fakeField, type.data as TypeDescriptor);
    }
  }

  static fakeField(field: StructField, type: TypeDescriptor): StructField {
    return { ...field, type: type.data as TypeDescriptor };
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    const fakeField = this.fakeField(field, type);
    return val !== undefined && val !== null
      ? validateJSON(manager, val, obj, fakeField, type.data as TypeDescriptor, undefined, _abstractKey)
      : { ok: true };
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    const fakeField = this.fakeField(field, type);
    return val !== undefined && val !== null
      ? fromJSON(manager, val, obj, fakeField, type.data as TypeDescriptor, undefined)
      : undefined;
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    if (val !== undefined && val !== null) {
      const fakeField = this.fakeField(field, type);
      return formatJSON(manager, val, val, fakeField, type.data as TypeDescriptor, instance, (tlvl ?? 0) + 1);
    }
    return "null";
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    const fakeField = this.fakeField(field, type);
    return val !== undefined && val !== null ? toJSON(manager, val, obj, fakeField, type.data as TypeDescriptor) : null;
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    pack_int(data, 0);
  }

  static format(type: TypeDescriptor): string {
    return "optional(" + fmt_type(type.data as TypeDescriptor) + ")";
  }

  static unpackInto(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown {
    let exists = struct_binpack.unpack_int(data, uctx);

    packer_debug("optional exists: " + exists);

    if (!exists) {
      return;
    }

    return unpack_field(manager, data, type.data as TypeDescriptor, uctx);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    let exists = struct_binpack.unpack_int(data, uctx);

    if (!exists) {
      return undefined;
    }

    return unpack_field(manager, data, type.data as TypeDescriptor, uctx);
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.OPTIONAL,
      name: "optional",
    };
  }
}

StructFieldType.register(StructOptionalField as unknown as StructFieldTypeClass);

/* ArrayBuffer/typed-array field: the element bytes are stored verbatim (one bulk
   copy) rather than element-by-element. The wire format is byteLength (int32)
   followed by the raw bytes in STRUCT_ENDIAN order; multi-byte elements are
   byteswapped when the host endianness differs from STRUCT_ENDIAN. */

interface ArrayBufferElemType {
  ctor: {
    new (length: number): {
      buffer: ArrayBuffer;
      byteOffset: number;
      byteLength: number;
      set(a: ArrayLike<number>): void;
    };
    new (buffer: ArrayBuffer, byteOffset: number, length: number): unknown;
    BYTES_PER_ELEMENT: number;
  };
  size: number;
}

const arrayBufferElemTypes: Record<string, ArrayBufferElemType> = {
  byte  : { ctor: Uint8Array as unknown as ArrayBufferElemType["ctor"], size: 1 },
  sbyte : { ctor: Int8Array as unknown as ArrayBufferElemType["ctor"], size: 1 },
  short : { ctor: Int16Array as unknown as ArrayBufferElemType["ctor"], size: 2 },
  ushort: { ctor: Uint16Array as unknown as ArrayBufferElemType["ctor"], size: 2 },
  int   : { ctor: Int32Array as unknown as ArrayBufferElemType["ctor"], size: 4 },
  uint  : { ctor: Uint32Array as unknown as ArrayBufferElemType["ctor"], size: 4 },
  float : { ctor: Float32Array as unknown as ArrayBufferElemType["ctor"], size: 4 },
  double: { ctor: Float64Array as unknown as ArrayBufferElemType["ctor"], size: 8 },
};

const PLATFORM_LITTLE_ENDIAN = new Uint8Array(Uint32Array.of(1).buffer)[0] === 1;

function arrayBufferElem(type: TypeDescriptor): ArrayBufferElemType {
  const name = (type.data as { type: string }).type;
  const elem = arrayBufferElemTypes[name];
  if (!elem) {
    throw new Error("invalid arraybuffer element type " + name);
  }
  return elem;
}

/** In-place big/little endian swap of each `elemSize`-wide element. */
function byteswapElems(bytes: Uint8Array, elemSize: number): void {
  if (elemSize <= 1) {
    return;
  }
  for (let i = 0; i < bytes.length; i += elemSize) {
    for (let a = i, b = i + elemSize - 1; a < b; a++, b--) {
      const t = bytes[a];
      bytes[a] = bytes[b];
      bytes[b] = t;
    }
  }
}

/** Normalize any accepted value (ArrayBuffer / typed array / DataView / number[])
 *  to a typed array of the field's element type. number[] entries are coerced. */
function toElemTyped(
  val: unknown,
  elem: ArrayBufferElemType
): { buffer: ArrayBuffer; byteOffset: number; byteLength: number } {
  if (val instanceof elem.ctor) {
    return val as unknown as { buffer: ArrayBuffer; byteOffset: number; byteLength: number };
  }
  if (val instanceof ArrayBuffer) {
    return new elem.ctor(val, 0, (val.byteLength / elem.size) | 0) as {
      buffer: ArrayBuffer;
      byteOffset: number;
      byteLength: number;
    };
  }
  if (ArrayBuffer.isView(val)) {
    const v = val as ArrayBufferView;
    return new elem.ctor(v.buffer as ArrayBuffer, v.byteOffset, (v.byteLength / elem.size) | 0) as {
      buffer: ArrayBuffer;
      byteOffset: number;
      byteLength: number;
    };
  }
  if (Array.isArray(val)) {
    const ta = new elem.ctor(val.length);
    ta.set(val);
    return ta as { buffer: ArrayBuffer; byteOffset: number; byteLength: number };
  }
  throw new Error("arraybuffer field expects an ArrayBuffer, typed array, DataView, or number[]");
}

class StructArrayBufferField extends StructFieldType {
  static pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void {
    const elem = arrayBufferElem(type);

    if (val === undefined || val === null) {
      pack_int(data, 0);
      return;
    }

    const view = toElemTyped(val, elem);
    let bytes = new Uint8Array(view.buffer as ArrayBuffer, view.byteOffset, view.byteLength);

    pack_int(data, bytes.byteLength);

    if (elem.size > 1 && STRUCT_ENDIAN !== PLATFORM_LITTLE_ENDIAN) {
      bytes = bytes.slice();
      byteswapElems(bytes, elem.size);
    }

    pack_bytes(data, bytes);
  }

  static packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void {
    pack_int(data, 0);
  }

  static unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown {
    const elem = arrayBufferElem(type);
    const byteLength = unpack_int(data, uctx);

    packer_debug("-arraybuffer bytes " + byteLength);

    const abs = data.byteOffset + uctx.i;
    const slice = (data.buffer as ArrayBuffer).slice(abs, abs + byteLength);
    uctx.i += byteLength;

    if (elem.size > 1 && STRUCT_ENDIAN !== PLATFORM_LITTLE_ENDIAN) {
      byteswapElems(new Uint8Array(slice), elem.size);
    }

    return new elem.ctor(slice, 0, (byteLength / elem.size) | 0);
  }

  static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown {
    if (val === undefined || val === null) {
      return [];
    }
    return Array.from(toElemTyped(val, arrayBufferElem(type)) as unknown as ArrayLike<number>);
  }

  static fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown {
    const elem = arrayBufferElem(type);
    const arr = (val || []) as number[];
    const ta = new elem.ctor(arr.length);
    ta.set(arr);
    return ta;
  }

  static formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string {
    const arr = Array.isArray(val)
      ? val
      : Array.from(toElemTyped(val, arrayBufferElem(type)) as unknown as ArrayLike<number>);
    return JSON.stringify(arr);
  }

  static validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): TokSymbolRet {
    if (!Array.isArray(val)) {
      return { ok: "not an array: " + val, tokInfo: getTokInfo(obj) };
    }
    for (let i = 0; i < val.length; i++) {
      if (typeof val[i] !== "number") {
        return { ok: "non-numeric arraybuffer element: " + val[i], tokInfo: getTokInfo(obj) };
      }
    }
    return { ok: true };
  }

  static format(type: TypeDescriptor): string {
    return "arraybuffer(" + (type.data as { type: string }).type + ")";
  }

  static define(): FieldTypeDefinition {
    return {
      type: StructEnum.ARRAYBUFFER,
      name: "arraybuffer",
    };
  }
}

StructFieldType.register(StructArrayBufferField as unknown as StructFieldTypeClass);
