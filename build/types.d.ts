export declare const StructEnum: {
    readonly INT: 0;
    readonly FLOAT: 1;
    readonly DOUBLE: 2;
    readonly STRING: 7;
    readonly STATIC_STRING: 8;
    readonly STRUCT: 9;
    readonly TSTRUCT: 10;
    readonly ARRAY: 11;
    readonly ITER: 12;
    readonly SHORT: 13;
    readonly BYTE: 14;
    readonly BOOL: 15;
    readonly ITERKEYS: 16;
    readonly UINT: 17;
    readonly USHORT: 18;
    readonly STATIC_ARRAY: 19;
    readonly SIGNED_BYTE: 20;
    readonly OPTIONAL: 21;
};
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
export type TypeDescriptor = {
    type: typeof StructEnum.INT;
    data?: undefined;
} | {
    type: typeof StructEnum.FLOAT;
    data?: undefined;
} | {
    type: typeof StructEnum.DOUBLE;
    data?: undefined;
} | {
    type: typeof StructEnum.STRING;
    data?: undefined;
} | {
    type: typeof StructEnum.SHORT;
    data?: undefined;
} | {
    type: typeof StructEnum.BYTE;
    data?: undefined;
} | {
    type: typeof StructEnum.BOOL;
    data?: undefined;
} | {
    type: typeof StructEnum.UINT;
    data?: undefined;
} | {
    type: typeof StructEnum.USHORT;
    data?: undefined;
} | {
    type: typeof StructEnum.SIGNED_BYTE;
    data?: undefined;
} | {
    type: typeof StructEnum.STATIC_STRING;
    data: StaticStringTypeData;
} | {
    type: typeof StructEnum.STRUCT;
    data: string;
} | {
    type: typeof StructEnum.TSTRUCT;
    data: string;
    jsonKeyword: string;
} | {
    type: typeof StructEnum.ARRAY;
    data: ArrayTypeData;
} | {
    type: typeof StructEnum.ITER;
    data: ArrayTypeData;
} | {
    type: typeof StructEnum.ITERKEYS;
    data: ArrayTypeData;
} | {
    type: typeof StructEnum.STATIC_ARRAY;
    data: StaticArrayTypeData;
} | {
    type: typeof StructEnum.OPTIONAL;
    data: TypeDescriptor;
};
export interface StructField {
    name: string;
    type: TypeDescriptor;
    get: string | undefined;
    set: string | undefined;
    comment: string;
}
export interface StructKeywords {
    script: string;
    name: string;
    load: string;
    new: string;
    after: string;
    from: string;
}
export interface FieldTypeDefinition {
    type: StructEnumValue;
    name: string;
}
/** Interface for user-registered classes. Uses unknown index signature instead of any. */
export interface StructableClass {
    new (...args: unknown[]): StructableInstance;
    prototype: StructableInstance;
    name: string;
    [key: string]: unknown;
}
export interface StructableInstance {
    constructor: StructableClass;
    [key: string]: unknown;
}
export type LoaderCallback = (obj: StructableInstance) => void;
export interface StructFieldTypeClass {
    pack(manager: StructManager, data: number[], val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): void;
    unpack(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext): unknown;
    packNull(manager: StructManager, data: number[], field: StructField, type: TypeDescriptor): void;
    format(type: TypeDescriptor): string;
    toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown;
    fromJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown): unknown;
    formatJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown, tlvl?: number): string;
    validateJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown, _abstractKey?: string): true | string;
    useHelperJS(field: StructField): boolean;
    define(): FieldTypeDefinition;
    unpackInto?(manager: StructManager, data: DataView, type: TypeDescriptor, uctx: UnpackContext, dest: unknown): unknown;
    register(cls: StructFieldTypeClass): void;
}
export interface UnpackContext {
    i: number;
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
/** Forward reference to the STRUCT manager to avoid circular imports */
export interface StructManager {
    idgen: number;
    allowOverriding: boolean;
    structs: Record<string, NStructInterface>;
    struct_cls: Record<string, StructableClass>;
    struct_ids: Record<number, NStructInterface>;
    compiled_code: Record<string, (this: unknown, obj: unknown, env: unknown) => unknown>;
    null_natives: Record<string, number>;
    jsonUseColors: boolean;
    jsonBuf: string;
    jsonLogger: (...args: unknown[]) => void;
    formatCtx: FormatCtx;
    get_struct(name: string): NStructInterface;
    get_struct_cls(name: string): StructableClass;
    get_struct_id(id: number): NStructInterface;
    write_struct(data: number[], obj: unknown, stt: NStructInterface): void;
    write_object(data: number[], obj: unknown): number[];
    read_object(data: DataView, cls_or_struct_id: StructableClass | number, uctx?: UnpackContext, objInstance?: unknown): unknown;
    readObject(data: DataView | Uint8Array | number[], cls_or_struct_id: StructableClass | number, uctx?: UnpackContext): unknown;
    writeJSON(obj: unknown, stt?: NStructInterface): Record<string, unknown>;
    readJSON(json: unknown, cls_or_struct_id: StructableClass | NStructInterface | number, objInstance?: unknown): unknown;
    validateJSON(json: unknown, cls_or_struct_id: StructableClass | NStructInterface | number, useInternalParser?: boolean, useColors?: boolean, consoleLogger?: (...args: unknown[]) => void, _abstractKey?: string): boolean;
    validateJSONIntern(json: Record<string, unknown>, cls_or_struct_id: StructableClass | NStructInterface | number, _abstractKey?: string): boolean;
    formatJSON(json: unknown, cls: StructableClass, addComments?: boolean, validate?: boolean): string;
    formatJSON_intern(json: Record<string, unknown>, stt: NStructInterface, field?: StructField, tlvl?: number): string;
    _env_call(code: string, obj: unknown, env?: [string, unknown][] | [string | undefined, unknown][]): unknown;
}
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
