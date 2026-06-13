import type { UnpackContext as UnpackContextType } from "./types.js";
export declare let STRUCT_ENDIAN: boolean;
export declare function setBinaryEndian(mode: boolean): void;
export declare const temp_dataview: DataView;
export declare const uint8_view: Uint8Array;
export declare class unpack_context implements UnpackContextType {
    i: number;
    constructor();
}
/**
 Growable byte buffer for the pack path; a drop-in alternative to the legacy
 `number[]` sink that avoids per-byte push() and the final whole-buffer copy.
 */
export declare class BinWriter {
    readonly _isBinWriter = true;
    buf: Uint8Array;
    view: DataView;
    length: number;
    constructor(initialCapacity?: number);
    ensure(n: number): void;
    push(v: number): void;
    pushBytes(bytes: ArrayLike<number>): void;
    i16(v: number): void;
    u16(v: number): void;
    i32(v: number): void;
    u32(v: number): void;
    f32(v: number): void;
    f64(v: number): void;
    /** Reserve n bytes (zero-filled) and return their offset, for back-patching. */
    reserve(n: number): number;
    patchI32(offset: number, v: number): void;
    /** Used bytes as a view over the internal buffer (no copy). */
    finish(): Uint8Array;
    /** Used bytes as an exact-size copy (safe to grab .buffer of). */
    toBytes(): Uint8Array;
}
/** Sink accepted by the pack_* functions: legacy number[] or a BinWriter. */
export type PackBuffer = number[] | BinWriter;
export declare function pack_byte(array: PackBuffer, val: number): void;
export declare function pack_sbyte(array: PackBuffer, val: number): void;
export declare function pack_bytes(array: PackBuffer, bytes: ArrayLike<number>): void;
export declare function pack_int(array: PackBuffer, val: number): void;
export declare function pack_uint(array: PackBuffer, val: number): void;
export declare function pack_ushort(array: PackBuffer, val: number): void;
export declare function pack_float(array: PackBuffer, val: number): void;
export declare function pack_double(array: PackBuffer, val: number): void;
export declare function pack_short(array: PackBuffer, val: number): void;
export declare function encode_utf8(arr: number[], str: string): void;
export declare function decode_utf8(arr: number[]): string;
export declare function test_utf8(): boolean;
export declare function pack_static_string(data: PackBuffer, str: string, length: number): void;
export declare function pack_string(data: PackBuffer, str: string): void;
export declare function unpack_bytes(dview: DataView, uctx: UnpackContextType, len: number): DataView;
export declare function unpack_byte(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_sbyte(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_int(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_uint(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_ushort(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_float(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_double(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_short(dview: DataView, uctx: UnpackContextType): number;
export declare function unpack_string(data: DataView, uctx: UnpackContextType): string;
export declare function unpack_static_string(data: DataView, uctx: UnpackContextType, length: number): string;
