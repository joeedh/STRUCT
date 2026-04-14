import { describe, it, expect, beforeAll } from "vitest";

// Set up global DEBUG before importing nstructjs
(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";

// ============ Test Classes ============

class SimplePoint {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  loadSTRUCT(reader: (obj: SimplePoint) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    SimplePoint as unknown as import("../src/types.js").StructableClass,
    `
    test.SimplePoint {
      x : float;
      y : float;
    }
  `
  );
}

class AllPrimitives {
  intVal: number;
  uintVal: number;
  floatVal: number;
  doubleVal: number;
  shortVal: number;
  ushortVal: number;
  byteVal: number;
  sbyteVal: number;
  boolVal: boolean;
  stringVal: string;

  constructor() {
    this.intVal = -42;
    this.uintVal = 4294967295; // max uint32
    this.floatVal = 3.14;
    this.doubleVal = 2.718281828459045;
    this.shortVal = -1234;
    this.ushortVal = 65535;
    this.byteVal = 255;
    this.sbyteVal = -128;
    this.boolVal = true;
    this.stringVal = "hello world";
  }

  loadSTRUCT(reader: (obj: AllPrimitives) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    AllPrimitives as unknown as import("../src/types.js").StructableClass,
    `
    test.AllPrimitives {
      intVal    : int;
      uintVal   : uint;
      floatVal  : float;
      doubleVal : double;
      shortVal  : short;
      ushortVal : ushort;
      byteVal   : byte;
      sbyteVal  : sbyte;
      boolVal   : bool;
      stringVal : string;
    }
  `
  );
}

class WithArrays {
  ints: number[];
  points: SimplePoint[];

  constructor() {
    this.ints = [1, 2, 3, 4, 5];
    this.points = [new SimplePoint(1, 2), new SimplePoint(3, 4)];
  }

  loadSTRUCT(reader: (obj: WithArrays) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    WithArrays as unknown as import("../src/types.js").StructableClass,
    `
    test.WithArrays {
      ints   : array(int);
      points : array(test.SimplePoint);
    }
  `
  );
}

class StaticStringTest {
  name: string;

  constructor() {
    this.name = "test";
  }

  loadSTRUCT(reader: (obj: StaticStringTest) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    StaticStringTest as unknown as import("../src/types.js").StructableClass,
    `
    test.StaticStringTest {
      name : static_string[32];
    }
  `
  );
}

class StaticArrayTest {
  values: number[];

  constructor() {
    this.values = [10, 20, 30, 40];
  }

  loadSTRUCT(reader: (obj: StaticArrayTest) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    StaticArrayTest as unknown as import("../src/types.js").StructableClass,
    `
    test.StaticArrayTest {
      values : static_array[int, 4];
    }
  `
  );
}

class BaseClass {
  baseField: number;

  constructor() {
    this.baseField = 100;
  }

  loadSTRUCT(reader: (obj: BaseClass) => void): void {
    reader(this);
  }
}

BaseClass.prototype.constructor = BaseClass;
(BaseClass as unknown as Record<string, unknown>).STRUCT = `
test.BaseClass {
  baseField : int;
}
`;
nstructjs.register(BaseClass as unknown as import("../src/types.js").StructableClass, "test.BaseClass");

class DerivedClass extends BaseClass {
  derivedField: number;

  constructor() {
    super();
    this.derivedField = 200;
  }

  loadSTRUCT(reader: (obj: DerivedClass) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    DerivedClass as unknown as import("../src/types.js").StructableClass,
    `
    test.DerivedClass {
      derivedField : int;
    }
  `
  );
}

class WithAbstract {
  item: BaseClass;

  constructor() {
    this.item = new DerivedClass();
  }

  loadSTRUCT(reader: (obj: WithAbstract) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    WithAbstract as unknown as import("../src/types.js").StructableClass,
    `
    test.WithAbstract {
      item : abstract(test.BaseClass);
    }
  `
  );
}

class OptionalTest {
  value: number | undefined;
  present: number | undefined;

  constructor() {
    this.value = undefined;
    this.present = 42.5;
  }

  loadSTRUCT(reader: (obj: OptionalTest) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    OptionalTest as unknown as import("../src/types.js").StructableClass,
    `
    test.OptionalTest {
      value  ?: double;
      present?: double;
    }
  `
  );
}

// ============ Helpers ============

function binaryRoundTrip<T>(obj: T, cls: unknown): T {
  const data: number[] = [];
  nstructjs.writeObject(data, obj);
  const view = new DataView(new Uint8Array(data).buffer);
  return nstructjs.readObject(view, cls as import("../src/types.js").StructableClass | number) as T;
}

// ============ Tests ============

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

describe("Binary Serialization - Primitive Types", () => {
  it("should round-trip all primitive types", () => {
    const original = new AllPrimitives();
    const restored = binaryRoundTrip(original, AllPrimitives);

    expect(restored.intVal).toBe(original.intVal);
    expect(restored.uintVal).toBe(original.uintVal);
    // Float has reduced precision
    expect(restored.floatVal).toBeCloseTo(original.floatVal, 5);
    expect(restored.doubleVal).toBe(original.doubleVal);
    expect(restored.shortVal).toBe(original.shortVal);
    expect(restored.ushortVal).toBe(original.ushortVal);
    expect(restored.byteVal).toBe(original.byteVal);
    expect(restored.sbyteVal).toBe(original.sbyteVal);
    expect(restored.boolVal).toBe(original.boolVal);
    expect(restored.stringVal).toBe(original.stringVal);
  });

  it("should handle zero values", () => {
    const original = new AllPrimitives();
    original.intVal = 0;
    original.uintVal = 0;
    original.floatVal = 0;
    original.doubleVal = 0;
    original.shortVal = 0;
    original.ushortVal = 0;
    original.byteVal = 0;
    original.sbyteVal = 0;
    original.boolVal = false;
    original.stringVal = "";

    const restored = binaryRoundTrip(original, AllPrimitives);

    expect(restored.intVal).toBe(0);
    expect(restored.uintVal).toBe(0);
    expect(restored.floatVal).toBe(0);
    expect(restored.doubleVal).toBe(0);
    expect(restored.shortVal).toBe(0);
    expect(restored.ushortVal).toBe(0);
    expect(restored.byteVal).toBe(0);
    expect(restored.sbyteVal).toBe(0);
    expect(restored.boolVal).toBe(false);
    expect(restored.stringVal).toBe("");
  });

  it("should handle negative integers", () => {
    const original = new AllPrimitives();
    original.intVal = -2147483648; // min int32
    original.shortVal = -32768; // min int16

    const restored = binaryRoundTrip(original, AllPrimitives);

    expect(restored.intVal).toBe(-2147483648);
    expect(restored.shortVal).toBe(-32768);
  });
});

describe("Binary Serialization - Simple Point", () => {
  it("should round-trip a simple struct", () => {
    const original = new SimplePoint(10.5, 20.25);
    const restored = binaryRoundTrip(original, SimplePoint);

    expect(restored.x).toBeCloseTo(original.x, 5);
    expect(restored.y).toBeCloseTo(original.y, 5);
  });
});

describe("Binary Serialization - Arrays", () => {
  it("should round-trip arrays of primitives", () => {
    const original = new WithArrays();
    const restored = binaryRoundTrip(original, WithArrays);

    expect(restored.ints).toEqual(original.ints);
  });

  it("should round-trip arrays of structs", () => {
    const original = new WithArrays();
    const restored = binaryRoundTrip(original, WithArrays);

    expect(restored.points.length).toBe(original.points.length);
    for (let i = 0; i < original.points.length; i++) {
      expect(restored.points[i].x).toBeCloseTo(original.points[i].x, 5);
      expect(restored.points[i].y).toBeCloseTo(original.points[i].y, 5);
    }
  });

  it("should handle empty arrays", () => {
    const original = new WithArrays();
    original.ints = [];
    original.points = [];
    const restored = binaryRoundTrip(original, WithArrays);

    expect(restored.ints).toEqual([]);
    expect(restored.points).toEqual([]);
  });
});

describe("Binary Serialization - Static String", () => {
  it("should round-trip static strings", () => {
    const original = new StaticStringTest();
    original.name = "hello";
    const restored = binaryRoundTrip(original, StaticStringTest);

    expect(restored.name).toBe("hello");
  });
});

describe("Binary Serialization - Static Array", () => {
  it("should round-trip static arrays", () => {
    const original = new StaticArrayTest();
    const restored = binaryRoundTrip(original, StaticArrayTest);

    expect(restored.values).toEqual(original.values);
  });
});

describe("Binary Serialization - Abstract/Polymorphic Types", () => {
  it("should round-trip abstract types", () => {
    const original = new WithAbstract();
    (original.item as DerivedClass).derivedField = 999;
    const restored = binaryRoundTrip(original, WithAbstract);

    expect(restored.item).toBeInstanceOf(DerivedClass);
    expect((restored.item as DerivedClass).derivedField).toBe(999);
    expect(restored.item.baseField).toBe(100);
  });
});

describe("Binary Serialization - Optional Fields", () => {
  it("should round-trip optional fields with undefined", () => {
    const original = new OptionalTest();
    original.value = undefined;
    original.present = 42.5;

    const restored = binaryRoundTrip(original, OptionalTest);

    expect(restored.value).toBeUndefined();
    expect(restored.present).toBe(42.5);
  });

  it("should round-trip optional fields when all present", () => {
    const original = new OptionalTest();
    original.value = 3.14;
    original.present = 2.718;

    const restored = binaryRoundTrip(original, OptionalTest);

    expect(restored.value).toBe(3.14);
    expect(restored.present).toBe(2.718);
  });

  it("should round-trip optional fields when all undefined", () => {
    const original = new OptionalTest();
    original.value = undefined;
    original.present = undefined;

    const restored = binaryRoundTrip(original, OptionalTest);

    expect(restored.value).toBeUndefined();
    expect(restored.present).toBeUndefined();
  });
});

describe("Binary Serialization - Unicode Strings", () => {
  it("should handle unicode strings", () => {
    const original = new AllPrimitives();
    original.stringVal = "Hello \u2260 World \u00E9";
    const restored = binaryRoundTrip(original, AllPrimitives);

    expect(restored.stringVal).toBe(original.stringVal);
  });
});

describe("Binary Serialization - FileHelper", () => {
  it("should write and read blocks via FileHelper", () => {
    const filehelper = nstructjs.filehelper;

    const params = {
      magic     : "TEST",
      ext       : ".bin",
      blocktypes: ["DATA"],
      version   : { major: 0, minor: 1, micro: 0 },
    };

    const point = new SimplePoint(42.5, 99.25);

    const writer = new filehelper.FileHelper(params);
    const data = writer.write([writer.makeBlock("DATA", point)]);

    const reader = new filehelper.FileHelper(params);
    const blocks = reader.read(data);

    expect(blocks.length).toBe(1);
    expect(blocks[0].type).toBe("DATA");

    const restored = blocks[0].data as SimplePoint;
    expect(restored.x).toBeCloseTo(42.5, 5);
    expect(restored.y).toBeCloseTo(99.25, 5);

    // Verify version was preserved
    expect(JSON.stringify(writer.version)).toBe(JSON.stringify(reader.version));
  });
});
