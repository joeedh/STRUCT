import type { PackBuffer } from "./struct_binpack.js";
import type { TokInfo } from "./struct_json.js";

export const StructEnum = {
  INT          : 0,
  FLOAT        : 1,
  DOUBLE       : 2,
  STRING       : 7,
  STATIC_STRING: 8,
  STRUCT       : 9,
  TSTRUCT      : 10,
  ARRAY        : 11,
  ITER         : 12,
  SHORT        : 13,
  BYTE         : 14,
  BOOL         : 15,
  ITERKEYS     : 16,
  UINT         : 17,
  USHORT       : 18,
  STATIC_ARRAY : 19,
  SIGNED_BYTE  : 20,
  OPTIONAL     : 21,
  ARRAYBUFFER  : 22,
} as const;

export type StructEnumValue = (typeof StructEnum)[keyof typeof StructEnum];

export interface ArrayTypeData {
  type: TypeDescriptor;
  iname: string;
}

export interface StaticArrayTypeData {
  type: TypeDescriptor;
  size: number;
  iname: string;
}

export interface StaticStringTypeData {
  maxlength: number;
}

export interface IntTypeDescriptor {
  type: typeof StructEnum.INT;
  data?: undefined;
}

export interface FloatTypeDescriptor {
  type: typeof StructEnum.FLOAT;
  data?: undefined;
}

export interface DoubleTypeDescriptor {
  type: typeof StructEnum.DOUBLE;
  data?: undefined;
}

export interface StringTypeDescriptor {
  type: typeof StructEnum.STRING;
  data?: undefined;
}

export interface ShortTypeDescriptor {
  type: typeof StructEnum.SHORT;
  data?: undefined;
}

export interface ByteTypeDescriptor {
  type: typeof StructEnum.BYTE;
  data?: undefined;
}

export interface BoolTypeDescriptor {
  type: typeof StructEnum.BOOL;
  data?: undefined;
}

export interface UintTypeDescriptor {
  type: typeof StructEnum.UINT;
  data?: undefined;
}

export interface UshortTypeDescriptor {
  type: typeof StructEnum.USHORT;
  data?: undefined;
}

export interface SignedByteTypeDescriptor {
  type: typeof StructEnum.SIGNED_BYTE;
  data?: undefined;
}

export interface StaticStringTypeDescriptor {
  type: typeof StructEnum.STATIC_STRING;
  data: StaticStringTypeData;
}

export interface StructTypeDescriptor {
  type: typeof StructEnum.STRUCT;
  data: string;
}

export interface TStructTypeDescriptor {
  type: typeof StructEnum.TSTRUCT;
  data: string;
  jsonKeyword: string;
}

export interface ArrayTypeDescriptor {
  type: typeof StructEnum.ARRAY;
  data: ArrayTypeData;
}

export interface IterTypeDescriptor {
  type: typeof StructEnum.ITER;
  data: ArrayTypeData;
}

export interface IterKeysTypeDescriptor {
  type: typeof StructEnum.ITERKEYS;
  data: ArrayTypeData;
}

export interface StaticArrayTypeDescriptor {
  type: typeof StructEnum.STATIC_ARRAY;
  data: StaticArrayTypeData;
}

export interface OptionalTypeDescriptor {
  type: typeof StructEnum.OPTIONAL;
  data: TypeDescriptor;
}

export interface ArrayBufferTypeDescriptor {
  type: typeof StructEnum.ARRAYBUFFER;
  data: { type: string };
}

export type TypeDescriptor =
  | IntTypeDescriptor
  | FloatTypeDescriptor
  | DoubleTypeDescriptor
  | StringTypeDescriptor
  | ShortTypeDescriptor
  | ByteTypeDescriptor
  | BoolTypeDescriptor
  | UintTypeDescriptor
  | UshortTypeDescriptor
  | SignedByteTypeDescriptor
  | StaticStringTypeDescriptor
  | StructTypeDescriptor
  | TStructTypeDescriptor
  | ArrayTypeDescriptor
  | IterTypeDescriptor
  | IterKeysTypeDescriptor
  | StaticArrayTypeDescriptor
  | OptionalTypeDescriptor
  | ArrayBufferTypeDescriptor;

export interface SrcLoc {
  line: number;
  column: number;
}

export interface StructField {
  name: string;
  type: TypeDescriptor;
  get: string | undefined;
  comment: string;
  loc: SrcLoc;
}

export interface StructKeywords {
  script: string;
  name: string;
  load: string;
  new: string;
  from: string;
  /** Optional callback to migrate both classes and json, e.g. migrateSTRUCT. */
  migrate: string;
  /** Optional callback to fetch schema version from both classes and json, e.g. getVersionSTRUCT. */
  getVersion: string;
}

export interface FieldTypeDefinition {
  type: StructEnumValue;
  name: string;
}

export type StructReader<T = any> = (obj: T) => void;
export type StructMigrateFinisher = (excludeProps?: string[]) => void;

/** Interface for user-registered classes. Uses unknown index signature instead of any. */
export interface StructableClass<T extends StructableInstance | unknown = StructableInstance> {
  new (): T;
  // note: TS makes constructor names (which do always exist)
  // extremely difficult to deal with, so we just make
  // it optional.  it's relatively rare for the API to actually read this anyway.
  name?: string;
  structName?: string;
  fromSTRUCT?: (reader: StructReader<this>) => unknown;

  /** Optional callback to migrate both classes and json, e.g. migrateSTRUCT. */
  migrateSTRUCT?: (version: number, dataOrJSON: any, migrateFields: StructMigrateFinisher) => void;
  /** Optional callback to fetch schema version from both classes and json, e.g. getVersionSTRUCT. */
  getVersionSTRUCT?: (dataOrJSON: any) => number;
}
export interface StructableInstance {
  loadSTRUCT: (reader: StructReader<this>) => unknown;
}

export type LoaderCallback = (obj: StructableInstance) => void;

export interface StructFieldTypeClass {
  pack(
    manager: StructManager,
    data: PackBuffer,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor
  ): void;
  unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown;
  packNull(manager: StructManager, data: PackBuffer, field: StructField, type: TypeDescriptor): void;
  format(type: TypeDescriptor): string;
  toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown;
  fromJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown
  ): unknown;
  formatJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    tlvl?: number
  ): string;
  validateJSON(
    manager: StructManager,
    val: unknown,
    obj: unknown,
    field: StructField,
    type: TypeDescriptor,
    instance: unknown,
    _abstractKey?: string
  ): { ok: true | string; tokInfo?: TokInfo };
  useHelperJS(field: StructField): boolean;
  define(): FieldTypeDefinition;
  unpackInto?(
    manager: StructManager,
    data: DataView,
    type: TypeDescriptor,
    uctx: UnpackContext,
    dest: unknown
  ): unknown;
  register(cls: StructFieldTypeClass): void;
}

export interface UnpackContext {
  i: number;
  /** Current struct-migration version, threaded down through nested reads. */
  version: number;
}

export interface NStructInterface {
  fields: StructField[];
  id: number;
  name: string;
}

export interface FormatCtx {
  addComments?: boolean;
  validate?: boolean;
}

// deleted old StructManager interface
export type { STRUCT as StructManager } from "./struct_intern.js";
import type { STRUCT as StructManager } from "./struct_intern.js";

export interface StructManagerStatic {
  keywords: StructKeywords;
  new (): StructManager;
  inherit(child: StructableClass, parent: StructableClass, structName?: string): string;
  fmt_struct(stt: NStructInterface, internal_only?: boolean, no_helper_js?: boolean, addComments?: boolean): string;
  formatStruct(stt: NStructInterface, internal_only?: boolean, no_helper_js?: boolean): string;
  setClassKeyword(keyword: string, nameKeyword?: string): void;
}

export interface Version {
  major: number;
  minor: number;
  micro: number;
}

export interface MigrateOptions {
  version: number /** Note: clients are responsible for storing version. */;
  warnMissing?: boolean /** Defaults to true. */;
  reporter?: (s: string) => void /** Defaults to console prints. */;
}

export const TokSymbol: unique symbol = Symbol("token-info");
export type TokSymbolRet = { ok: boolean | string; tokInfo?: TokInfo };

// TokSymbol is attached to plain objects and arrays at runtime.
// We use helper functions to access it safely.
export function setTokInfo(obj: unknown, info: TokInfo): void {
  (obj as Record<symbol, TokInfo>)[TokSymbol] = info;
}

export function getTokInfo(obj: unknown): TokInfo | undefined {
  if (obj && typeof obj === "object") {
    return (obj as Record<symbol, TokInfo | undefined>)[TokSymbol];
  }
  return undefined;
}
