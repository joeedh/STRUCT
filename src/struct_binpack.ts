import type { UnpackContext as UnpackContextType } from "./types.js";

export let STRUCT_ENDIAN: boolean = true; //little endian

export function setBinaryEndian(mode: boolean): void {
  STRUCT_ENDIAN = !!mode;
}

export const temp_dataview: DataView = new DataView(new ArrayBuffer(16));
export const uint8_view: Uint8Array = new Uint8Array(temp_dataview.buffer);

export class unpack_context implements UnpackContextType {
  i: number;

  constructor() {
    this.i = 0;
  }
}

/**
 Growable byte buffer for the pack path; a drop-in alternative to the legacy
 `number[]` sink that avoids per-byte push() and the final whole-buffer copy.
 */
export class BinWriter {
  readonly _isBinWriter = true;

  buf: Uint8Array;
  view: DataView;
  length: number = 0;

  constructor(initialCapacity: number = 4096) {
    this.buf = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buf.buffer);
  }

  ensure(n: number): void {
    const need = this.length + n;
    if (need > this.buf.length) {
      let cap = this.buf.length * 2;
      while (cap < need) {
        cap *= 2;
      }

      const nb = new Uint8Array(cap);
      nb.set(this.buf);
      this.buf = nb;
      this.view = new DataView(nb.buffer);
    }
  }

  push(v: number): void {
    this.ensure(1);
    this.buf[this.length++] = v;
  }

  pushBytes(bytes: ArrayLike<number>): void {
    const n = bytes.length;
    this.ensure(n);
    this.buf.set(bytes as Uint8Array | number[], this.length);
    this.length += n;
  }

  i16(v: number): void {
    this.ensure(2);
    this.view.setInt16(this.length, v, STRUCT_ENDIAN);
    this.length += 2;
  }

  u16(v: number): void {
    this.ensure(2);
    this.view.setUint16(this.length, v, STRUCT_ENDIAN);
    this.length += 2;
  }

  i32(v: number): void {
    this.ensure(4);
    this.view.setInt32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }

  u32(v: number): void {
    this.ensure(4);
    this.view.setUint32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }

  f32(v: number): void {
    this.ensure(4);
    this.view.setFloat32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }

  f64(v: number): void {
    this.ensure(8);
    this.view.setFloat64(this.length, v, STRUCT_ENDIAN);
    this.length += 8;
  }

  /** Reserve n bytes (zero-filled) and return their offset, for back-patching. */
  reserve(n: number): number {
    this.ensure(n);
    const off = this.length;
    this.buf.fill(0, off, off + n);
    this.length += n;
    return off;
  }

  patchI32(offset: number, v: number): void {
    this.view.setInt32(offset, v, STRUCT_ENDIAN);
  }

  /** Used bytes as a view over the internal buffer (no copy). */
  finish(): Uint8Array {
    return this.buf.subarray(0, this.length);
  }

  /** Used bytes as an exact-size copy (safe to grab .buffer of). */
  toBytes(): Uint8Array {
    return this.buf.slice(0, this.length);
  }
}

/** Sink accepted by the pack_* functions: legacy number[] or a BinWriter. */
export type PackBuffer = number[] | BinWriter;

export function pack_byte(array: PackBuffer, val: number): void {
  array.push(val);
}

export function pack_sbyte(array: PackBuffer, val: number): void {
  if (val < 0) {
    val = 256 + val;
  }

  array.push(val);
}

export function pack_bytes(array: PackBuffer, bytes: ArrayLike<number>): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).pushBytes(bytes);
    return;
  }

  for (let i = 0; i < bytes.length; i++) {
    (array as number[]).push(bytes[i]);
  }
}

export function pack_int(array: PackBuffer, val: number): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).i32(val);
    return;
  }

  temp_dataview.setInt32(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

export function pack_uint(array: PackBuffer, val: number): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).u32(val);
    return;
  }

  temp_dataview.setUint32(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

export function pack_ushort(array: PackBuffer, val: number): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).u16(val);
    return;
  }

  temp_dataview.setUint16(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}

export function pack_float(array: PackBuffer, val: number): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).f32(val);
    return;
  }

  temp_dataview.setFloat32(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

export function pack_double(array: PackBuffer, val: number): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).f64(val);
    return;
  }

  temp_dataview.setFloat64(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
  array.push(uint8_view[4]);
  array.push(uint8_view[5]);
  array.push(uint8_view[6]);
  array.push(uint8_view[7]);
}

export function pack_short(array: PackBuffer, val: number): void {
  if ((array as BinWriter)._isBinWriter) {
    (array as BinWriter).i16(val);
    return;
  }

  temp_dataview.setInt16(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}

export function encode_utf8(arr: number[], str: string): void {
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);

    while (c !== 0) {
      let uc = c & 127;
      c = c >> 7;

      if (c !== 0) uc |= 128;

      arr.push(uc);
    }
  }
}

export function decode_utf8(arr: number[]): string {
  let str = "";
  let i = 0;

  while (i < arr.length) {
    let c = arr[i];
    let sum = c & 127;
    let j = 0;

    while (i < arr.length && c & 128) {
      j += 7;
      i++;
      c = arr[i];

      c = (c & 127) << j;
      sum |= c;
    }

    if (sum === 0) break;

    str += String.fromCharCode(sum);
    i++;
  }

  return str;
}

export function test_utf8(): boolean {
  const s = "a" + String.fromCharCode(8800) + "b";
  const arr: number[] = [];

  encode_utf8(arr, s);
  const s2 = decode_utf8(arr);

  if (s !== s2) {
    throw new Error("UTF-8 encoding/decoding test failed");
  }

  return true;
}

function truncate_utf8(arr: number[], maxlen: number): number[] {
  const len = Math.min(arr.length, maxlen);

  let last_codepoint = 0;
  let last2 = 0;

  let incode: number;
  let i = 0;
  while (i < len) {
    incode = arr[i] & 128;

    if (!incode) {
      last2 = last_codepoint + 1;
      last_codepoint = i + 1;
    }

    i++;
  }

  if (last_codepoint < maxlen) arr.length = last_codepoint;
  else arr.length = last2;

  return arr;
}

const _static_sbuf_ss: number[] = new Array(2048);

export function pack_static_string(data: PackBuffer, str: string, length: number): void {
  if (length === undefined) throw new Error("'length' parameter is not optional for pack_static_string()");

  const arr: number[] = length < 2048 ? _static_sbuf_ss : new Array();
  arr.length = 0;

  encode_utf8(arr, str);
  truncate_utf8(arr, length);

  for (let i = arr.length; i < length; i++) {
    arr.push(0);
  }
  arr.length = length;

  pack_bytes(data, arr);
}

const _static_sbuf: number[] = new Array(32);

/*strings are packed as 32-bit unicode codepoints*/
export function pack_string(data: PackBuffer, str: string): void {
  _static_sbuf.length = 0;
  encode_utf8(_static_sbuf, str);

  pack_int(data, _static_sbuf.length);
  pack_bytes(data, _static_sbuf);
}

export function unpack_bytes(dview: DataView, uctx: UnpackContextType, len: number): DataView {
  const ret = new DataView(dview.buffer.slice(uctx.i, uctx.i + len));
  uctx.i += len;

  return ret;
}

export function unpack_byte(dview: DataView, uctx: UnpackContextType): number {
  return dview.getUint8(uctx.i++);
}

export function unpack_sbyte(dview: DataView, uctx: UnpackContextType): number {
  return dview.getInt8(uctx.i++);
}

export function unpack_int(dview: DataView, uctx: UnpackContextType): number {
  uctx.i += 4;
  return dview.getInt32(uctx.i - 4, STRUCT_ENDIAN);
}

export function unpack_uint(dview: DataView, uctx: UnpackContextType): number {
  uctx.i += 4;
  return dview.getUint32(uctx.i - 4, STRUCT_ENDIAN);
}

export function unpack_ushort(dview: DataView, uctx: UnpackContextType): number {
  uctx.i += 2;
  return dview.getUint16(uctx.i - 2, STRUCT_ENDIAN);
}

export function unpack_float(dview: DataView, uctx: UnpackContextType): number {
  uctx.i += 4;
  return dview.getFloat32(uctx.i - 4, STRUCT_ENDIAN);
}

export function unpack_double(dview: DataView, uctx: UnpackContextType): number {
  uctx.i += 8;
  return dview.getFloat64(uctx.i - 8, STRUCT_ENDIAN);
}

export function unpack_short(dview: DataView, uctx: UnpackContextType): number {
  uctx.i += 2;
  return dview.getInt16(uctx.i - 2, STRUCT_ENDIAN);
}

const _static_arr_us: number[] = new Array(32);

export function unpack_string(data: DataView, uctx: UnpackContextType): string {
  const slen = unpack_int(data, uctx);

  if (!slen) {
    return "";
  }

  const arr = slen < 2048 ? _static_arr_us : new Array(slen);

  arr.length = slen;
  const p = uctx.i;
  for (let i = 0; i < slen; i++) {
    arr[i] = data.getUint8(p + i);
  }
  uctx.i += slen;

  return decode_utf8(arr);
}

const _static_arr_uss: number[] = new Array(2048);

export function unpack_static_string(data: DataView, uctx: UnpackContextType, length: number): string {
  if (length === undefined) throw new Error("'length' cannot be undefined in unpack_static_string()");

  const arr = length < 2048 ? _static_arr_uss : new Array(length);
  arr.length = 0;

  const p = uctx.i;
  let done = false;
  for (let i = 0; i < length; i++) {
    const c = data.getUint8(p + i);

    if (c === 0) {
      done = true;
    }

    if (!done && c !== 0) {
      arr.push(c);
    }
  }
  uctx.i += length;

  truncate_utf8(arr, length);
  return decode_utf8(arr);
}
