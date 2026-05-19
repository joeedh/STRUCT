import { StructField, StructKeywords, StructableClass, StructableInstance, NStructInterface, UnpackContext, FormatCtx } from "./types.js";
export declare let truncateDollarSign: boolean;
export declare let manager: STRUCT;
export declare class JSONError extends Error {
}
export declare function setTruncateDollarSign(v: unknown): void;
export declare function _truncateDollarSign(s: string): string;
export declare function setWarningMode(t: unknown): void;
export declare function setDebugMode(t: unknown): void;
export declare class STRUCT {
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
    /**
     * Host-supplied hook invoked when an `abstract(...)` field references a
     * struct name that's in the schema dictionary but whose JS class isn't
     * currently registered (e.g. the addon that owned it isn't loaded).
     *
     * Return a StructableClass to use *as the instance constructor* for that
     * struct. The reader will still walk the original on-disk schema to fill
     * the instance's fields by name, so the instance ends up with all of the
     * original class's data attached as dynamic properties. Return undefined
     * to fall through to the default error.
     */
    onUnknownClass?: (clsname: string, schema: NStructInterface) => StructableClass<unknown> | undefined;
    /**
     * Host-supplied hook invoked at write time, when serializing a value
     * whose class isn't the one declared in the schema (e.g. a placeholder
     * standing in for an unloaded addon's class). Return the original
     * struct-name to use that struct's schema for both the struct id and the
     * field layout. Return undefined to fall through to the default behavior.
     */
    onSerializeUnknown?: (obj: unknown) => string | undefined;
    static keywords: StructKeywords;
    constructor();
    static inherit(child: StructableClass, parent: StructableClass, structName?: string): string;
    /** invoke loadSTRUCT methods on parent objects.  note that
     reader() is only called once.  it is called however.*/
    static Super(obj: StructableInstance, reader: (obj: StructableInstance) => void): void;
    /** deprecated.  used with old fromSTRUCT interface. */
    static chain_fromSTRUCT(cls: StructableClass, reader: (obj: StructableInstance) => void): StructableInstance;
    static formatStruct(stt: NStructInterface, internal_only?: boolean, no_helper_js?: boolean): string;
    static fmt_struct(stt: NStructInterface, internal_only?: boolean, no_helper_js?: boolean, addComments?: boolean, excludeId?: boolean): string;
    static setClassKeyword(keyword: string, nameKeyword?: string): void;
    define_null_native(name: string, cls: StructableClass): void;
    validateStructs(onerror?: (msg: string, stt: NStructInterface, field: StructField) => void): void;
    forEach(func: (stt: NStructInterface) => void, thisvar?: unknown): void;
    parse_structs(buf: string, defined_classes?: StructableClass[] | STRUCT): void;
    /** adds all structs referenced by cls inside of srcSTRUCT
     *  to this */
    registerGraph(srcSTRUCT: STRUCT, cls: StructableClass): void;
    mergeScripts(child: string, parent: string): string;
    inlineRegister(cls: StructableClass, structScript: string): string;
    register(cls: StructableClass, structName?: string): void;
    unregister(cls: StructableClass): void;
    add_class(cls: StructableClass, structName?: string): void;
    isRegistered(cls: StructableClass): boolean;
    get_struct_id(id: number): NStructInterface;
    get_struct(name: string): NStructInterface;
    get_struct_cls(name: string): StructableClass;
    _env_call(code: string, obj: unknown, env?: [string, unknown][]): unknown;
    write_struct(data: number[], obj: unknown, stt: NStructInterface): void;
    /**
     @param data : array to write data into,
     @param obj  : structable object
     */
    write_object(data: number[] | undefined, obj: unknown): number[];
    /**
     Read an object from binary data
  
     @param data : DataView or Uint8Array instance
     @param cls_or_struct_id : Structable class
     @param uctx : internal parameter
     @return Instance of cls_or_struct_id
     */
    readObject<T = unknown>(data: DataView | Uint8Array | Uint8ClampedArray | number[], cls_or_struct_id: StructableClass<T> | number, uctx?: UnpackContext): T;
    /**
     @param data array to write data into,
     @param obj structable object
     */
    writeObject(data: number[] | undefined, obj: unknown): number[];
    writeJSON(obj: unknown, stt?: NStructInterface): Record<string, unknown>;
    /**
     @param data : DataView or Uint8Array instance
     @param cls_or_struct_id : Structable class
     @param uctx : internal parameter
     */
    read_object<T = unknown>(data: DataView, cls_or_struct_id: StructableClass<T> | number, uctx?: UnpackContext, objInstance?: unknown): T;
    validateJSON(json: unknown, cls_or_struct_id: StructableClass | NStructInterface | number, useInternalParser?: boolean, useColors?: boolean, consoleLogger?: (...args: unknown[]) => void, _abstractKey?: string): boolean;
    validateJSONIntern(json: Record<string, unknown>, cls_or_struct_id: StructableClass | NStructInterface | number, _abstractKey?: string): boolean;
    readJSON<T = unknown>(json: unknown, cls_or_struct_id: StructableClass<T> | NStructInterface | number, objInstance?: unknown): T;
    formatJSON_intern(json: Record<string, unknown>, stt: NStructInterface, field?: StructField, tlvl?: number): string;
    formatJSON(json: unknown, cls: StructableClass, addComments?: boolean, validate?: boolean): string;
}
export declare function deriveStructManager(keywords?: {
    script: string;
    name?: string;
    load?: string;
    new?: string;
    from?: string;
}): typeof STRUCT;
/**
 * Write all defined structs out to a string.
 *
 * @param nManager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
export declare function write_scripts(nManager?: STRUCT, include_code?: boolean): string;
