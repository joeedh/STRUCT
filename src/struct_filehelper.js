"use strict";

if (typeof btoa === "undefined") {
  _nGlobal.btoa = function btoa(str) {
    let buffer = new Buffer("" + str, 'binary');
    return buffer.toString('base64');
  }

  _nGlobal.atob = function atob(str) {
    return new Buffer(str, 'base64').toString('binary');
  }
}

let struct_binpack = require("./struct_binpack.js");
let struct_intern = require("./struct_intern.js");

/*
file format:
  magic signature              : 4 bytes
  file version major           : 2 bytes
  file version minor           : 1 bytes
  file version micro           : 1 bytes
  length of struct scripts     : 4 bytes
  struct scripts for this file : ...
  
  block:
    magic signature for block              : 4 bytes
    length of data  (not including header) : 4 bytes
    id of struct type                      : 4 bytes
    
    data                                   : ...
*/

exports.versionToInt = function(v) {
  v = exports.versionCoerce(v);
  let mul = 64;
  return ~~(v.major*mul*mul*mul + v.minor*mul*mul + v.micro*mul);
}

let ver_pat = /[0-9]+\.[0-9]+\.[0-9]+$/;

exports.versionCoerce = function(v) {
  if (!v) {
    throw new Error("empty version: " + v);
  }

  if (typeof v === "string") {
    if (!ver_pat.exec(v)) {
      throw new Error("invalid version string " + v);
    }

    let ver = v.split(".");
    return {
      major : parseInt(ver[0]),
      minor : parseInt(ver[1]),
      micro : parseInt(ver[2])
    }
  } else if (Array.isArray(v)) {
    return {
      major : v[0],
      minor : v[1],
      micro : v[2]
    }
  } else if (typeof v === "object") {
    let test = (k) => k in v && typeof v[k] === "number";

    if (!test("major") || !test("minor") || !test("micro")) {
      throw new Error("invalid version object: " + v);
    }

    return v;
  } else {
    throw new Error("invalid version " + v);
  }
};

exports.versionLessThan = function(a, b) {
  return exports.versionToInt(a) < exports.versionToInt(b);
};

let versionLessThan = exports.versionLessThan;

let FileParams = exports.FileParams = class FileParams {
  constructor() {
    this.magic = "STRT";
    this.ext = ".bin";
    this.blocktypes = ["DATA"];

    this.version = {
      major: 0,
      minor: 0,
      micro: 1
    };
  }
}

//used to define blocks
let Block = exports.Block = class Block {
  constructor(type_magic, data) {
    this.type = type_magic;
    this.data = data;
  }
};

let FileError = exports.FileError = class FileeError extends Error {
};

let FileHelper = exports.FileHelper = class FileHelper {
  //params can be FileParams instance, or object literal
  //(it will convert to FileParams)
  constructor(params) {
    if (params === undefined) {
      params = new FileParams();
    } else {
      let fp = new FileParams();

      for (let k in params) {
        fp[k] = params[k];
      }
      params = fp;
    }

    this.version = params.version;
    this.blocktypes = params.blocktypes;
    this.magic = params.magic;
    this.ext = params.ext;
    this.struct = undefined;
    this.unpack_ctx = undefined;
  }

  read(dataview) {
    this.unpack_ctx = new struct_binpack.unpack_context();

    let magic = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, 4);

    if (magic !== this.magic) {
      throw new FileError("corrupted file");
    }

    this.version = {};
    this.version.major = struct_binpack.unpack_short(dataview, this.unpack_ctx);
    this.version.minor = struct_binpack.unpack_byte(dataview, this.unpack_ctx);
    this.version.micro = struct_binpack.unpack_byte(dataview, this.unpack_ctx);

    let struct = this.struct = new struct_intern.STRUCT();

    let scripts = struct_binpack.unpack_string(dataview, this.unpack_ctx);
    this.struct.parse_structs(scripts, struct_intern.manager);

    let blocks = [];
    let dviewlen = dataview.buffer.byteLength;

    while (this.unpack_ctx.i < dviewlen) {
      //console.log("reading block. . .", this.unpack_ctx.i, dviewlen);

      let type = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, 4);
      let datalen = struct_binpack.unpack_int(dataview, this.unpack_ctx);
      let bstruct = struct_binpack.unpack_int(dataview, this.unpack_ctx);
      let bdata;

      //console.log(type, datalen, bstruct);

      if (bstruct == -2) { //string data, e.g. JSON
        bdata = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, datalen);
      } else {
        bdata = struct_binpack.unpack_bytes(dataview, this.unpack_ctx, datalen);
        bdata = struct.read_object(bdata, bstruct, new struct_binpack.unpack_context());
      }

      let block = new Block();
      block.type = type;
      block.data = bdata;

      blocks.push(block);
    }

    this.blocks = blocks;
    return blocks;
  }

  doVersions(old) {
    let blocks = this.blocks;

    if (versionLessThan(old, "0.0.1")) {
      //do something
    }
  }

  write(blocks) {
    this.struct = struct_intern.manager;
    this.blocks = blocks;

    let data = [];

    struct_binpack.pack_static_string(data, this.magic, 4);
    struct_binpack.pack_short(data, this.version.major);
    struct_binpack.pack_byte(data, this.version.minor & 255);
    struct_binpack.pack_byte(data, this.version.micro & 255);

    let scripts = struct_intern.write_scripts();
    struct_binpack.pack_string(data, scripts);

    let struct = this.struct;

    for (let block of blocks) {
      if (typeof block.data === "string") { //string data, e.g. JSON
        struct_binpack.pack_static_string(data, block.type, 4);
        struct_binpack.pack_int(data, block.data.length);
        struct_binpack.pack_int(data, -2); //flag as string data
        struct_binpack.pack_static_string(data, block.data, block.data.length);
        continue;
      }

      let structName = block.data.constructor.structName;
      if (structName === undefined || !(structName in struct.structs)) {
        throw new Error("Non-STRUCTable object " + block.data);
      }

      let data2 = [];
      let stt = struct.structs[structName];

      struct.write_object(data2, block.data);

      struct_binpack.pack_static_string(data, block.type, 4);
      struct_binpack.pack_int(data, data2.length);
      struct_binpack.pack_int(data, stt.id);

      struct_binpack.pack_bytes(data, data2);
    }

    return new DataView(new Uint8Array(data).buffer);
  }

  writeBase64(blocks) {
    let dataview = this.write(blocks);

    let str = "";
    let bytes = new Uint8Array(dataview.buffer);

    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }

    return btoa(str);
  }

  makeBlock(type, data) {
    return new Block(type, data);
  }

  readBase64(base64) {
    let data = atob(base64);
    let data2 = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      data2[i] = data.charCodeAt(i);
    }

    return this.read(new DataView(data2.buffer));
  }
};
