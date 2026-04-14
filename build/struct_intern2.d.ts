import { TypeDescriptor, StructField, StructFieldTypeClass, StructManager, UnpackContext, FieldTypeDefinition } from "./types.js";
export declare function _get_pack_debug(): {
    packer_debug: (...args: unknown[]) => void;
    packer_debug_start: (...args: unknown[]) => void;
    packer_debug_end: (...args: unknown[]) => void;
    debug: number;
    warninglvl: number;
};
export declare function setWarningMode2(t: number): void;
export declare function setDebugMode2(t: number): void;
export declare const StructFieldTypes: StructFieldTypeClass[];
export declare const StructFieldTypeMap: Record<number, StructFieldTypeClass>;
export declare function packNull(manager: StructManager, data: number[], field: StructField, type: TypeDescriptor): void;
export declare function toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown;
export declare function fromJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown): unknown;
export declare function formatJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown, tlvl?: number): string;
export declare function validateJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown, _abstractKey?: string): true | string;
export declare function do_pack(manager: StructManager, data: number[], val: unknown, obj: unknown, field: StructField, type: TypeDescriptor | number): void;
export declare class StructFieldType {
    static pack(manager: StructManager, data: number[], val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): void;
    static unpack(_manager: StructManager, _data: DataView, _type: TypeDescriptor, _uctx: UnpackContext): unknown;
    static packNull(manager: StructManager, data: number[], field: StructField, type: TypeDescriptor): void;
    static format(type: TypeDescriptor): string;
    static toJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor): unknown;
    static fromJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown): unknown;
    static formatJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown, tlvl?: number): string;
    static validateJSON(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, instance: unknown, _abstractKey?: string): true | string;
    /**
     return false to override default
     helper js for packing
     */
    static useHelperJS(field: StructField): boolean;
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
    static define(): FieldTypeDefinition;
    /**
     Register field packer/unpacker class.  Will throw an error if define() method is bad.
     */
    static register(cls: StructFieldTypeClass): void;
}
/** out is just a [string], an array of dimen 1 whose sole entry is the output string. */
export declare function formatArrayJson(manager: StructManager, val: unknown, obj: unknown, field: StructField, type: TypeDescriptor, type2: TypeDescriptor, instance: unknown, tlvl: number, array?: unknown[]): string;
