import * as struct_binpack from "./struct_binpack.js";
import * as struct_intern from "./struct_intern.js";
import type { Version } from "./types.js";

let nbtoa: (str: string) => string;
let natob: (str: string) => string;

if (typeof btoa === "undefined") {
  nbtoa = function (str: string): string {
    const buffer = Buffer.from("" + str, "binary");
    return buffer.toString("base64");
  };

  natob = function (str: string): string {
    return Buffer.from(str, "base64").toString("binary");
  };
} else {
  natob = atob;
  nbtoa = btoa;
}

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

export function versionToInt(v: string | number[] | Version): number {
  const ver = versionCoerce(v);
  const mul = 64;
  return ~~(ver.major * mul * mul * mul + ver.minor * mul * mul + ver.micro * mul);
}

const ver_pat = /[0-9]+\.[0-9]+\.[0-9]+$/;

export function versionCoerce(v: string | number[] | Version): Version {
  if (!v) {
    throw new Error("empty version: " + v);
  }

  if (typeof v === "string") {
    if (!ver_pat.exec(v)) {
      throw new Error("invalid version string " + v);
    }

    const ver = v.split(".");
    return {
      major: parseInt(ver[0]),
      minor: parseInt(ver[1]),
      micro: parseInt(ver[2]),
    };
  } else if (Array.isArray(v)) {
    return {
      major: v[0],
      minor: v[1],
      micro: v[2],
    };
  } else if (typeof v === "object") {
    const test = (k: keyof Version): boolean => k in v && typeof v[k] === "number";

    if (!test("major") || !test("minor") || !test("micro")) {
      throw new Error("invalid version object: " + v);
    }

    return v;
  } else {
    throw new Error("invalid version " + v);
  }
}

export function versionLessThan(a: string | number[] | Version, b: string | number[] | Version): boolean {
  return versionToInt(a) < versionToInt(b);
}

export class FileParams {
  magic: string;
  ext: string;
  blocktypes: string[];
  version: Version;

  constructor() {
    this.magic = "STRT";
    this.ext = ".bin";
    this.blocktypes = ["DATA"];

    this.version = {
      major: 0,
      minor: 0,
      micro: 1,
    };
  }
}

//used to define blocks
export class Block {
  type: string;
  data: unknown;

  constructor(type?: string, data?: unknown) {
    this.type = type || "";
    this.data = data;
  }
}

export class FileError extends Error {}

export class FileHelper {
  version: Version;
  blocktypes: string[];
  magic: string;
  ext: string;
  struct: struct_intern.STRUCT | undefined;
  unpack_ctx: struct_binpack.unpack_context | undefined;
  blocks: Block[] | undefined;

  //params can be FileParams instance, or object literal
  //(it will convert to FileParams)
  constructor(params?: Partial<FileParams>) {
    const fp = new FileParams();

    if (params !== undefined) {
      for (const k in params) {
        (fp as unknown as Record<string, unknown>)[k] = (params as unknown as Record<string, unknown>)[k];
      }
    }

    this.version = fp.version;
    this.blocktypes = fp.blocktypes;
    this.magic = fp.magic;
    this.ext = fp.ext;
    this.struct = undefined;
    this.unpack_ctx = undefined;
  }

  read(dataview: DataView): Block[] {
    this.unpack_ctx = new struct_binpack.unpack_context();

    const magic = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, 4);

    if (magic !== this.magic) {
      throw new FileError("corrupted file");
    }

    this.version = {
      major: 0,
      minor: 0,
      micro: 0,
    };
    this.version.major = struct_binpack.unpack_short(dataview, this.unpack_ctx);
    this.version.minor = struct_binpack.unpack_byte(dataview, this.unpack_ctx);
    this.version.micro = struct_binpack.unpack_byte(dataview, this.unpack_ctx);

    const struct = (this.struct = new struct_intern.STRUCT());

    const scripts = struct_binpack.unpack_string(dataview, this.unpack_ctx);
    this.struct.parse_structs(scripts, struct_intern.manager);

    const blocks: Block[] = [];
    const dviewlen = dataview.buffer.byteLength;

    while (this.unpack_ctx.i < dviewlen) {
      const type = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, 4);
      const datalen = struct_binpack.unpack_int(dataview, this.unpack_ctx);
      const bstruct = struct_binpack.unpack_int(dataview, this.unpack_ctx);
      let bdata: unknown;

      if (bstruct === -2) {
        //string data, e.g. JSON
        bdata = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, datalen);
      } else {
        const rawData = struct_binpack.unpack_bytes(dataview, this.unpack_ctx, datalen);
        bdata = struct.read_object(rawData, bstruct, new struct_binpack.unpack_context());
      }

      const block = new Block();
      block.type = type;
      block.data = bdata;

      blocks.push(block);
    }

    this.blocks = blocks;
    return blocks;
  }

  doVersions(old: string | number[] | Version): void {
    if (versionLessThan(old, "0.0.1")) {
      //do something
    }
  }

  write(blocks: Block[]): DataView {
    this.struct = struct_intern.manager;
    this.blocks = blocks;

    const data: number[] = [];

    struct_binpack.pack_static_string(data, this.magic, 4);
    struct_binpack.pack_short(data, this.version.major);
    struct_binpack.pack_byte(data, this.version.minor & 255);
    struct_binpack.pack_byte(data, this.version.micro & 255);

    const scripts = struct_intern.write_scripts();
    struct_binpack.pack_string(data, scripts);

    const struct = this.struct;

    for (const block of blocks) {
      if (typeof block.data === "string") {
        //string data, e.g. JSON
        struct_binpack.pack_static_string(data, block.type, 4);
        struct_binpack.pack_int(data, block.data.length);
        struct_binpack.pack_int(data, -2); //flag as string data
        struct_binpack.pack_static_string(data, block.data, block.data.length);
        continue;
      }

      const blockData = block.data as Record<string, unknown>;
      const structNameVal = (blockData.constructor as unknown as Record<string, unknown>).structName as
        | string
        | undefined;
      if (structNameVal === undefined || !(structNameVal in struct.structs)) {
        throw new Error("Non-STRUCTable object " + block.data);
      }

      const data2: number[] = [];
      const stt = struct.structs[structNameVal];

      struct.write_object(data2, block.data);

      struct_binpack.pack_static_string(data, block.type, 4);
      struct_binpack.pack_int(data, data2.length);
      struct_binpack.pack_int(data, stt.id);

      struct_binpack.pack_bytes(data, data2);
    }

    return new DataView(new Uint8Array(data).buffer);
  }

  writeBase64(blocks: Block[]): string {
    const dataview = this.write(blocks);

    let str = "";
    const bytes = new Uint8Array(dataview.buffer);

    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }

    return nbtoa(str);
  }

  makeBlock(type: string, data: unknown): Block {
    return new Block(type, data);
  }

  readBase64(base64: string): Block[] {
    const data = natob(base64);
    const data2 = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      data2[i] = data.charCodeAt(i);
    }

    return this.read(new DataView(data2.buffer));
  }
}
