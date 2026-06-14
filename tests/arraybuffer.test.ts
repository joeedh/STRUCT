import { describe, it, expect, beforeAll } from "vitest";

// Set up global DEBUG before importing nstructjs
(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import { setBinaryEndian, STRUCT_ENDIAN } from "../src/struct_binpack.js";
import type { StructableClass } from "../src/types.js";

/* Round-trips for the `arraybuffer(<type>)` field type: raw bulk-copy of typed
   array / ArrayBuffer data, with endian byteswapping when STRUCT_ENDIAN differs
   from the host. */

class Buffers {
  bytes: Uint8Array;
  sbytes: Int8Array;
  shorts: Int16Array;
  ushorts: Uint16Array;
  ints: Int32Array;
  uints: Uint32Array;
  floats: Float32Array;
  doubles: Float64Array;

  constructor() {
    this.bytes = new Uint8Array(0);
    this.sbytes = new Int8Array(0);
    this.shorts = new Int16Array(0);
    this.ushorts = new Uint16Array(0);
    this.ints = new Int32Array(0);
    this.uints = new Uint32Array(0);
    this.floats = new Float32Array(0);
    this.doubles = new Float64Array(0);
  }

  static create(): Buffers {
    const obj = new Buffers();
    const n = 17;

    obj.bytes = new Uint8Array(n);
    obj.sbytes = new Int8Array(n);
    obj.shorts = new Int16Array(n);
    obj.ushorts = new Uint16Array(n);
    obj.ints = new Int32Array(n);
    obj.uints = new Uint32Array(n);
    obj.floats = new Float32Array(n);
    obj.doubles = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      obj.bytes[i] = i & 255;
      obj.sbytes[i] = ((i % 256) - 128) | 0;
      obj.shorts[i] = ((i * 7919) | 0) - 32768;
      obj.ushorts[i] = (i * 104729) & 65535;
      obj.ints[i] = (i * 2147483647) | 0;
      obj.uints[i] = (i * 40503) >>> 0;
      obj.floats[i] = Math.fround(i * 0.37 - 40.0);
      obj.doubles[i] = i * 1.0e-7 + 1.0 / 3.0;
    }

    return obj;
  }

  loadSTRUCT(reader: (obj: Buffers) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    Buffers as unknown as StructableClass,
    `
    test.Buffers {
      bytes   : arraybuffer(byte);
      sbytes  : arraybuffer(sbyte);
      shorts  : arraybuffer(short);
      ushorts : arraybuffer(ushort);
      ints    : arraybuffer(int);
      uints   : arraybuffer(uint);
      floats  : arraybuffer(float);
      doubles : arraybuffer(double);
    }
  `
  );
}

beforeAll(() => {
  nstructjs.setAllowOverriding(true);
});

function roundtripBinary(obj: Buffers): Buffers {
  const data = nstructjs.writeObject([], obj);
  const view = new DataView(new Uint8Array(data).buffer);
  return nstructjs.readObject<Buffers>(view, Buffers as unknown as StructableClass<Buffers>);
}

describe("arraybuffer field type", () => {
  it("binary round-trips and preserves typed-array types", () => {
    const obj = Buffers.create();
    const out = roundtripBinary(obj);

    expect(out.bytes).toBeInstanceOf(Uint8Array);
    expect(out.sbytes).toBeInstanceOf(Int8Array);
    expect(out.shorts).toBeInstanceOf(Int16Array);
    expect(out.ushorts).toBeInstanceOf(Uint16Array);
    expect(out.ints).toBeInstanceOf(Int32Array);
    expect(out.uints).toBeInstanceOf(Uint32Array);
    expect(out.floats).toBeInstanceOf(Float32Array);
    expect(out.doubles).toBeInstanceOf(Float64Array);

    expect(Array.from(out.bytes)).toEqual(Array.from(obj.bytes));
    expect(Array.from(out.sbytes)).toEqual(Array.from(obj.sbytes));
    expect(Array.from(out.shorts)).toEqual(Array.from(obj.shorts));
    expect(Array.from(out.ushorts)).toEqual(Array.from(obj.ushorts));
    expect(Array.from(out.ints)).toEqual(Array.from(obj.ints));
    expect(Array.from(out.uints)).toEqual(Array.from(obj.uints));
    expect(Array.from(out.floats)).toEqual(Array.from(obj.floats));
    expect(Array.from(out.doubles)).toEqual(Array.from(obj.doubles));
  });

  it("accepts plain number[] and raw ArrayBuffer on write", () => {
    const obj = new Buffers();
    obj.floats = [1.5, -2.25, 3.75] as unknown as Float32Array;
    obj.ints = new Int32Array([10, -20, 30]).buffer as unknown as Int32Array;

    const out = roundtripBinary(obj);
    expect(Array.from(out.floats)).toEqual([1.5, -2.25, 3.75]);
    expect(Array.from(out.ints)).toEqual([10, -20, 30]);
  });

  it("JSON round-trips", () => {
    const obj = Buffers.create();
    const json = nstructjs.writeJSON(obj);

    expect(Array.isArray(json.floats)).toBe(true);
    expect((json.ints as number[]).length).toBe(obj.ints.length);

    const out = nstructjs.readJSON<Buffers>(json, Buffers as unknown as StructableClass<Buffers>);
    expect(out.floats).toBeInstanceOf(Float32Array);
    expect(Array.from(out.doubles)).toEqual(Array.from(obj.doubles));
    expect(nstructjs.manager.validateJSON(json, Buffers as unknown as StructableClass)).toBe(true);
  });

  it("byteswaps multi-byte elements when STRUCT_ENDIAN differs from the host", () => {
    const obj = Buffers.create();
    const little = nstructjs.writeObject([], obj);

    const prev = STRUCT_ENDIAN;
    try {
      setBinaryEndian(!prev);
      const big = nstructjs.writeObject([], obj);

      // bytes (1-wide) regions are identical; multi-byte payloads differ.
      expect(new Uint8Array(big)).not.toEqual(new Uint8Array(little));

      // and the big-endian bytes still read back to identical values.
      const view = new DataView(new Uint8Array(big).buffer);
      const out = nstructjs.readObject<Buffers>(view, Buffers as unknown as StructableClass<Buffers>);
      expect(Array.from(out.floats)).toEqual(Array.from(obj.floats));
      expect(Array.from(out.ints)).toEqual(Array.from(obj.ints));
      expect(Array.from(out.doubles)).toEqual(Array.from(obj.doubles));
    } finally {
      setBinaryEndian(prev);
    }
  });

  it("re-parses its own write_scripts() output", () => {
    const scripts = nstructjs.write_scripts();
    expect(scripts).toContain("arraybuffer(float)");
    expect(scripts).toContain("arraybuffer(double)");
  });
});
