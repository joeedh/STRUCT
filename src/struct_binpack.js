let struct_util = require("./struct_util");
let struct_typesystem = require("./struct_typesystem");

exports.STRUCT_ENDIAN = true; //little endian

var Class = struct_typesystem.Class;

var temp_dataview = new DataView(new ArrayBuffer(16));
var uint8_view = new Uint8Array(temp_dataview.buffer);

var unpack_context = exports.unpack_context = Class([
  function constructor() {
    this.i = 0;
  }
]);

var pack_byte = exports.pack_byte = function (array, val) {
  array.push(val);
}

var pack_bytes = exports.pack_bytes = function (array, bytes) {
  for (var i = 0; i < bytes.length; i++) {
    array.push(bytes[i]);
  }
}

var pack_int = exports.pack_int = function (array, val) {
  temp_dataview.setInt32(0, val, exports.STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
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

var encode_utf8 = exports.encode_utf8 = function encode_utf8(arr, str) {
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);

    while (c != 0) {
      var uc = c & 127;
      c = c >> 7;

      if (c != 0)
        uc |= 128;

      arr.push(uc);
    }
  }
}

var decode_utf8 = exports.decode_utf8 = function decode_utf8(arr) {
  var str = ""
  var i = 0;

  while (i < arr.length) {
    var c = arr[i];
    var sum = c & 127;
    var j = 0;
    var lasti = i;

    while (i < arr.length && (c & 128)) {
      j += 7;
      i++;
      c = arr[i];

      c = (c & 127) << j;
      sum |= c;
    }

    if (sum == 0) break;

    str += String.fromCharCode(sum);
    i++;
  }

  return str;
}

var test_utf8 = exports.test_utf8 = function test_utf8() {
  var s = "a" + String.fromCharCode(8800) + "b";
  var arr = [];

  encode_utf8(arr, s);
  var s2 = decode_utf8(arr);

  if (s != s2) {
    throw new Error("UTF-8 encoding/decoding test failed");
  }

  return true;
}

function truncate_utf8(arr, maxlen) {
  var len = Math.min(arr.length, maxlen);

  var last_codepoint = 0;
  var last2 = 0;

  var incode = false;
  var i = 0;
  var code = 0;
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

var _static_sbuf_ss = new Array(2048);
var pack_static_string = exports.pack_static_string = function pack_static_string(data, str, length) {
  if (length == undefined)
    throw new Error("'length' paremter is not optional for pack_static_string()");

  var arr = length < 2048 ? _static_sbuf_ss : new Array();
  arr.length = 0;

  encode_utf8(arr, str);
  truncate_utf8(arr, length);

  for (var i = 0; i < length; i++) {
    if (i >= arr.length) {
      data.push(0);
    } else {
      data.push(arr[i]);
    }
  }
}

var _static_sbuf = new Array(32);

/*strings are packed as 32-bit unicode codepoints*/
var pack_string = exports.pack_string = function pack_string(data, str) {
  _static_sbuf.length = 0;
  encode_utf8(_static_sbuf, str);

  pack_int(data, _static_sbuf.length);

  for (var i = 0; i < _static_sbuf.length; i++) {
    data.push(_static_sbuf[i]);
  }
}

var unpack_bytes = exports.unpack_bytes = function unpack_bytes(dview, uctx, len) {
  var ret = new DataView(dview.buffer.slice(uctx.i, uctx.i + len));
  uctx.i += len;

  return ret;
}

var unpack_byte = exports.unpack_byte = function (dview, uctx) {
  return dview.getUint8(uctx.i++);
}

var unpack_int = exports.unpack_int = function (dview, uctx) {
  uctx.i += 4;
  return dview.getInt32(uctx.i - 4, exports.STRUCT_ENDIAN);
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

var _static_arr_us = new Array(32);
exports.unpack_string = function (data, uctx) {
  var str = ""

  var slen = unpack_int(data, uctx);
  var arr = slen < 2048 ? _static_arr_us : new Array(slen);

  arr.length = slen;
  for (var i = 0; i < slen; i++) {
    arr[i] = unpack_byte(data, uctx);
  }

  return decode_utf8(arr);
}

var _static_arr_uss = new Array(2048);
exports.unpack_static_string = function unpack_static_string(data, uctx, length) {
  var str = "";

  if (length == undefined)
    throw new Error("'length' cannot be undefined in unpack_static_string()");

  var arr = length < 2048 ? _static_arr_uss : new Array(length);
  arr.length = 0;

  var done = false;
  for (var i = 0; i < length; i++) {
    var c = unpack_byte(data, uctx);

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
