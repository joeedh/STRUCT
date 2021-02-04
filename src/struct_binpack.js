"use strict";

let struct_util = require("./struct_util");

exports.STRUCT_ENDIAN = true; //little endian

let temp_dataview = new DataView(new ArrayBuffer(16));
let uint8_view = new Uint8Array(temp_dataview.buffer);

let unpack_context = exports.unpack_context = class unpack_context {
  constructor() {
    this.i = 0;
  }
}

let pack_byte = exports.pack_byte = function (array, val) {
  array.push(val);
}

let pack_sbyte = exports.pack_sbyte = function (array, val) {
  if (val < 0) {
    val = 256 + val;
  }

  array.push(val);
}

let pack_bytes = exports.pack_bytes = function (array, bytes) {
  for (let i = 0; i < bytes.length; i++) {
    array.push(bytes[i]);
  }
}

let pack_int = exports.pack_int = function (array, val) {
  temp_dataview.setInt32(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

let pack_uint = exports.pack_uint = function (array, val) {
  temp_dataview.setUint32(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

let pack_ushort = exports.pack_ushort = function (array, val) {
  temp_dataview.setUint16(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}

exports.pack_float = function (array, val) {
  temp_dataview.setFloat32(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

exports.pack_double = function (array, val) {
  temp_dataview.setFloat64(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
  array.push(uint8_view[4]);
  array.push(uint8_view[5]);
  array.push(uint8_view[6]);
  array.push(uint8_view[7]);
}

exports.pack_short = function (array, val) {
  temp_dataview.setInt16(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}

let encode_utf8 = exports.encode_utf8 = function encode_utf8(arr, str) {
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);

    while (c != 0) {
      let uc = c & 127;
      c = c >> 7;

      if (c != 0)
        uc |= 128;

      arr.push(uc);
    }
  }
}

let decode_utf8 = exports.decode_utf8 = function decode_utf8(arr) {
  let str = ""
  let i = 0;

  while (i < arr.length) {
    let c = arr[i];
    let sum = c & 127;
    let j = 0;
    let lasti = i;

    while (i < arr.length && (c & 128)) {
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

let test_utf8 = exports.test_utf8 = function test_utf8() {
  let s = "a" + String.fromCharCode(8800) + "b";
  let arr = [];

  encode_utf8(arr, s);
  let s2 = decode_utf8(arr);

  if (s != s2) {
    throw new Error("UTF-8 encoding/decoding test failed");
  }

  return true;
}

function truncate_utf8(arr, maxlen) {
  let len = Math.min(arr.length, maxlen);

  let last_codepoint = 0;
  let last2 = 0;

  let incode = false;
  let i = 0;
  let code = 0;
  while (i < len) {
    incode = arr[i] & 128;

    if (!incode) {
      last2 = last_codepoint + 1;
      last_codepoint = i + 1;
    }

    i++;
  }

  if (last_codepoint < maxlen)
    arr.length = last_codepoint;
  else
    arr.length = last2;

  return arr;
}

let _static_sbuf_ss = new Array(2048);
let pack_static_string = exports.pack_static_string = function pack_static_string(data, str, length) {
  if (length == undefined)
    throw new Error("'length' paremter is not optional for pack_static_string()");

  let arr = length < 2048 ? _static_sbuf_ss : new Array();
  arr.length = 0;

  encode_utf8(arr, str);
  truncate_utf8(arr, length);

  for (let i = 0; i < length; i++) {
    if (i >= arr.length) {
      data.push(0);
    } else {
      data.push(arr[i]);
    }
  }
}

let _static_sbuf = new Array(32);

/*strings are packed as 32-bit unicode codepoints*/
let pack_string = exports.pack_string = function pack_string(data, str) {
  _static_sbuf.length = 0;
  encode_utf8(_static_sbuf, str);

  pack_int(data, _static_sbuf.length);

  for (let i = 0; i < _static_sbuf.length; i++) {
    data.push(_static_sbuf[i]);
  }
}

let unpack_bytes = exports.unpack_bytes = function unpack_bytes(dview, uctx, len) {
  let ret = new DataView(dview.buffer.slice(uctx.i, uctx.i + len));
  uctx.i += len;

  return ret;
}

let unpack_byte = exports.unpack_byte = function (dview, uctx) {
  return dview.getUint8(uctx.i++);
}

let unpack_sbyte = exports.unpack_sbyte = function (dview, uctx) {
  return dview.getInt8(uctx.i++);
}

let unpack_int = exports.unpack_int = function (dview, uctx) {
  uctx.i += 4;
  return dview.getInt32(uctx.i - 4, exports.STRUCT_ENDIAN);
}

let unpack_uint = exports.unpack_uint = function (dview, uctx) {
  uctx.i += 4;
  return dview.getUint32(uctx.i - 4, exports.STRUCT_ENDIAN);
}

let unpack_ushort = exports.unpack_ushort = function (dview, uctx) {
  uctx.i += 2;
  return dview.getUint16(uctx.i - 2, exports.STRUCT_ENDIAN);
}

exports.unpack_float = function (dview, uctx) {
  uctx.i += 4;
  return dview.getFloat32(uctx.i - 4, exports.STRUCT_ENDIAN);
}

exports.unpack_double = function (dview, uctx) {
  uctx.i += 8;
  return dview.getFloat64(uctx.i - 8, exports.STRUCT_ENDIAN);
}

exports.unpack_short = function (dview, uctx) {
  uctx.i += 2;
  return dview.getInt16(uctx.i - 2, exports.STRUCT_ENDIAN);
}

let _static_arr_us = new Array(32);
exports.unpack_string = function (data, uctx) {
  let slen = unpack_int(data, uctx);

  if (!slen) {
    return "";
  }

  let str = ""
  let arr = slen < 2048 ? _static_arr_us : new Array(slen);

  arr.length = slen;
  for (let i = 0; i < slen; i++) {
    arr[i] = unpack_byte(data, uctx);
  }

  return decode_utf8(arr);
}

let _static_arr_uss = new Array(2048);
exports.unpack_static_string = function unpack_static_string(data, uctx, length) {
  let str = "";

  if (length == undefined)
    throw new Error("'length' cannot be undefined in unpack_static_string()");

  let arr = length < 2048 ? _static_arr_uss : new Array(length);
  arr.length = 0;

  let done = false;
  for (let i = 0; i < length; i++) {
    let c = unpack_byte(data, uctx);

    if (c == 0) {
      done = true;
    }

    if (!done && c != 0) {
      arr.push(c);
      //arr.length++;
    }
  }

  truncate_utf8(arr, length);
  return decode_utf8(arr);
}
