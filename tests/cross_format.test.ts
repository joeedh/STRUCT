import { describe, it, expect, beforeAll } from 'vitest';

(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from '../src/structjs.js';

class CrossPoint {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  loadSTRUCT(reader: (obj: CrossPoint) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    CrossPoint as unknown as import('../src/types.js').StructableClass,
    `
    cross.CrossPoint {
      x : double;
      y : double;
    }
  `
  );
}

class CrossContainer {
  name: string;
  value: number;
  point: CrossPoint;

  constructor() {
    this.name = "test";
    this.value = 42;
    this.point = new CrossPoint(1.5, 2.5);
  }

  loadSTRUCT(reader: (obj: CrossContainer) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    CrossContainer as unknown as import('../src/types.js').StructableClass,
    `
    cross.CrossContainer {
      name  : string;
      value : int;
      point : cross.CrossPoint;
    }
  `
  );
}

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

describe('Cross-Format Consistency', () => {
  it('binary and JSON paths should produce equivalent results for simple struct', () => {
    const original = new CrossPoint(42.5, -17.25);

    // Binary path
    const binData: number[] = [];
    nstructjs.writeObject(binData, original);
    const binRestored = nstructjs.readObject(
      new DataView(new Uint8Array(binData).buffer),
      CrossPoint as unknown as import('../src/types.js').StructableClass
    ) as CrossPoint;

    // JSON path
    const jsonData = nstructjs.writeJSON(original);
    const jsonRestored = nstructjs.readJSON(
      jsonData,
      CrossPoint as unknown as import('../src/types.js').StructableClass
    ) as CrossPoint;

    expect(binRestored.x).toBe(jsonRestored.x);
    expect(binRestored.y).toBe(jsonRestored.y);
  });

  it('binary and JSON paths should produce equivalent results for nested struct', () => {
    const original = new CrossContainer();
    original.name = "hello world";
    original.value = -999;
    original.point = new CrossPoint(100.5, 200.75);

    // Binary path
    const binData: number[] = [];
    nstructjs.writeObject(binData, original);
    const binRestored = nstructjs.readObject(
      new DataView(new Uint8Array(binData).buffer),
      CrossContainer as unknown as import('../src/types.js').StructableClass
    ) as CrossContainer;

    // JSON path
    const jsonData = nstructjs.writeJSON(original);
    const jsonRestored = nstructjs.readJSON(
      jsonData,
      CrossContainer as unknown as import('../src/types.js').StructableClass
    ) as CrossContainer;

    expect(binRestored.name).toBe(jsonRestored.name);
    expect(binRestored.value).toBe(jsonRestored.value);
    expect(binRestored.point.x).toBe(jsonRestored.point.x);
    expect(binRestored.point.y).toBe(jsonRestored.point.y);
  });
});
