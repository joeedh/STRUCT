import { describe, it, expect, beforeAll, vi } from "vitest";

// Set up global DEBUG before importing nstructjs
(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import type { StructableClass } from "../src/types.js";

/* Verifies the bulk/BinWriter fast paths emit and consume exactly the same
   wire bytes as the legacy per-element paths (debug mode forces legacy). */

class BulkTypes {
  bytes_: number[];
  sbytes: number[];
  bools: boolean[];
  shorts: number[];
  ushorts: number[];
  ints: number[];
  uints: number[];
  floats: number[];
  doubles: number[];
  iterBytes: number[];
  iterFloats: number[];
  staticInts: number[];
  name: string;
  title: string;

  constructor() {
    this.bytes_ = [];
    this.sbytes = [];
    this.bools = [];
    this.shorts = [];
    this.ushorts = [];
    this.ints = [];
    this.uints = [];
    this.floats = [];
    this.doubles = [];
    this.iterBytes = [];
    this.iterFloats = [];
    this.staticInts = [0, 0, 0, 0];
    this.name = "";
    this.title = "";
  }

  static create(): BulkTypes {
    const obj = new BulkTypes();

    for (let i = 0; i < 257; i++) {
      obj.bytes_.push(i & 255);
      obj.sbytes.push((i % 256) - 128);
      obj.bools.push((i & 1) === 0);
      obj.shorts.push((i * 7919) % 65536 | (0 - 32768));
      obj.ushorts.push((i * 104729) % 65536);
      obj.ints.push((i * 2147483647) % 4294967296 | 0);
      obj.uints.push((i * 40503) % 4294967296 >>> 0);
      obj.floats.push(Math.fround(i * 0.37 - 40.0));
      obj.doubles.push(i * 1.0e-7 + 1.0 / 3.0);
      obj.iterBytes.push((i * 31) & 255);
      obj.iterFloats.push(Math.fround(i * -2.5));
    }

    obj.staticInts = [-1, 0, 2147483647, -2147483648];
    // note: chars like é trip a pre-existing decode_utf8 continuation-bit
    // quirk (space after them is eaten on read); ≠ does not. Out of scope.
    obj.name = "static ≠ string";
    obj.title = "var-length ≠ string";

    return obj;
  }

  loadSTRUCT(reader: (obj: BulkTypes) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    BulkTypes as unknown as StructableClass,
    `
    test.BulkTypes {
      bytes_     : array(byte);
      sbytes     : array(sbyte);
      bools      : array(bool);
      shorts     : array(short);
      ushorts    : array(ushort);
      ints       : array(int);
      uints      : array(uint);
      floats     : array(float);
      doubles    : array(double);
      iterBytes  : iter(byte);
      iterFloats : iter(float);
      staticInts : static_array[int, 4];
      name       : static_string[24];
      title      : string;
    }
  `
  );
}

class NonPrimitiveContainers {
  points: { x: number; y: number }[];

  constructor() {
    this.points = [];
  }

  loadSTRUCT(reader: (obj: NonPrimitiveContainers) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    NonPrimitiveContainers as unknown as StructableClass,
    `
    test.NonPrimitiveContainers {
      points : iter(test.BIPoint);
    }
  `
  );
}

class BIPoint {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  loadSTRUCT(reader: (obj: BIPoint) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    BIPoint as unknown as StructableClass,
    `
    test.BIPoint {
      x : float;
      y : float;
    }
  `
  );
}

function writeLegacy(obj: unknown): Uint8Array {
  const data: number[] = [];
  nstructjs.writeObject(data, obj);
  return new Uint8Array(data);
}

function writeBin(obj: unknown): Uint8Array {
  const data = new nstructjs.BinWriter();
  nstructjs.writeObject(data, obj);
  return data.toBytes();
}

function withDebugMode<T>(fn: () => T): T {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  nstructjs.setDebugMode(1);
  try {
    return fn();
  } finally {
    nstructjs.setDebugMode(0);
    warnSpy.mockRestore();
  }
}

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

describe("Byte identity - bulk primitive fast paths", () => {
  it("BinWriter produces identical bytes to legacy number[]", () => {
    const obj = BulkTypes.create();
    expect(writeBin(obj)).toEqual(writeLegacy(obj));
  });

  it("fast pack produces identical bytes to debug-mode (per-element) pack", () => {
    const obj = BulkTypes.create();
    const fast = writeLegacy(obj);
    const slow = withDebugMode(() => writeLegacy(obj));
    expect(fast).toEqual(slow);
  });

  it("fast unpack reads per-element-packed bytes to the same values", () => {
    // byte iters/arrays now read back as typed arrays (Uint8Array/Int8Array);
    // normalize container type before comparing the values.
    const normalize = (o: BulkTypes): Record<string, unknown> => {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(o)) {
        const v = (o as unknown as Record<string, unknown>)[k];
        out[k] = ArrayBuffer.isView(v) ? Array.from(v as unknown as ArrayLike<number>) : v;
      }
      return out;
    };

    const obj = BulkTypes.create();
    const bytes = withDebugMode(() => writeLegacy(obj));
    const view = new DataView(bytes.buffer);

    const fastRead = nstructjs.readObject<BulkTypes>(view, BulkTypes as unknown as StructableClass<BulkTypes>);
    const slowRead = withDebugMode(() =>
      nstructjs.readObject<BulkTypes>(view, BulkTypes as unknown as StructableClass<BulkTypes>)
    );

    expect(fastRead.bytes_).toBeInstanceOf(Uint8Array);
    expect(fastRead.sbytes).toBeInstanceOf(Int8Array);
    expect(fastRead.iterBytes).toBeInstanceOf(Uint8Array);

    expect(JSON.stringify(normalize(fastRead))).toBe(JSON.stringify(normalize(slowRead)));
    expect(JSON.stringify(normalize(fastRead))).toBe(JSON.stringify(normalize(obj)));
  });

  it("typed arrays take the bulk pack path with identical bytes", () => {
    const obj = BulkTypes.create();
    const expected = writeBin(obj);

    obj.floats = new Float32Array(obj.floats) as unknown as number[];
    obj.ints = new Int32Array(obj.ints) as unknown as number[];
    obj.iterBytes = new Uint8Array(obj.iterBytes) as unknown as number[];

    expect(writeBin(obj)).toEqual(expected);
    expect(writeLegacy(obj)).toEqual(expected);
  });

  it("non-primitive iter elements still round-trip (length backpatch path)", () => {
    const obj = new NonPrimitiveContainers();
    obj.points = [new BIPoint(1.5, -2.5), new BIPoint(3.25, 4.75), new BIPoint(0, 0)];

    const fast = writeLegacy(obj);
    const slow = withDebugMode(() => writeLegacy(obj));
    expect(fast).toEqual(slow);
    expect(writeBin(obj)).toEqual(slow);

    const view = new DataView(fast.buffer.slice(0));
    const restored = nstructjs.readObject<NonPrimitiveContainers>(
      view,
      NonPrimitiveContainers as unknown as StructableClass<NonPrimitiveContainers>
    );
    expect(restored.points.length).toBe(3);
    expect(restored.points[1].x).toBeCloseTo(3.25, 5);
  });

  it("empty containers byte-match", () => {
    const obj = new BulkTypes();
    obj.name = "";
    obj.title = "";

    const fast = writeLegacy(obj);
    const slow = withDebugMode(() => writeLegacy(obj));
    expect(fast).toEqual(slow);
    expect(writeBin(obj)).toEqual(slow);
  });
});
