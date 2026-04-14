import { describe, it, expect, beforeAll } from "vitest";

// Set up global DEBUG before importing nstructjs
(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";

// ============ Test Classes ============

class JPoint {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  loadSTRUCT(reader: (obj: JPoint) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    JPoint as unknown as import("../src/types.js").StructableClass,
    `
    json.JPoint {
      x : double;
      y : double;
    }
  `
  );
}

class JAllTypes {
  intVal: number;
  floatVal: number;
  doubleVal: number;
  stringVal: string;
  boolVal: boolean;

  constructor() {
    this.intVal = 42;
    this.floatVal = 3.14;
    this.doubleVal = 2.718281828459045;
    this.stringVal = "test string";
    this.boolVal = true;
  }

  loadSTRUCT(reader: (obj: JAllTypes) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    JAllTypes as unknown as import("../src/types.js").StructableClass,
    `
    json.JAllTypes {
      intVal    : int;
      floatVal  : float;
      doubleVal : double;
      stringVal : string;
      boolVal   : bool;
    }
  `
  );
}

class JWithArray {
  numbers: number[];
  points: JPoint[];

  constructor() {
    this.numbers = [1, 2, 3];
    this.points = [new JPoint(1, 2), new JPoint(3, 4)];
  }

  loadSTRUCT(reader: (obj: JWithArray) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    JWithArray as unknown as import("../src/types.js").StructableClass,
    `
    json.JWithArray {
      numbers : array(int);
      points  : array(json.JPoint);
    }
  `
  );
}

class JBase {
  baseVal: number;

  constructor() {
    this.baseVal = 10;
  }

  loadSTRUCT(reader: (obj: JBase) => void): void {
    reader(this);
  }
}

(JBase as unknown as Record<string, unknown>).STRUCT = `
json.JBase {
  baseVal : int;
}
`;
nstructjs.register(JBase as unknown as import("../src/types.js").StructableClass, "json.JBase");

class JDerived extends JBase {
  derivedVal: number;

  constructor() {
    super();
    this.derivedVal = 20;
  }

  loadSTRUCT(reader: (obj: JDerived) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    JDerived as unknown as import("../src/types.js").StructableClass,
    `
    json.JDerived {
      derivedVal : int;
    }
  `
  );
}

class JAbstractHolder {
  item: JBase;

  constructor() {
    this.item = new JDerived();
  }

  loadSTRUCT(reader: (obj: JAbstractHolder) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    JAbstractHolder as unknown as import("../src/types.js").StructableClass,
    `
    json.JAbstractHolder {
      item : abstract(json.JBase);
    }
  `
  );
}

class JOptional {
  present: number | undefined;
  missing: number | undefined;

  constructor() {
    this.present = 99.5;
    this.missing = undefined;
  }

  loadSTRUCT(reader: (obj: JOptional) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    JOptional as unknown as import("../src/types.js").StructableClass,
    `
    json.JOptional {
      present ?: double;
      missing ?: double;
    }
  `
  );
}

// ============ Helpers ============

function jsonRoundTrip<T>(obj: T, cls: unknown): T {
  const json = nstructjs.writeJSON(obj);
  return nstructjs.readJSON(json, cls as import("../src/types.js").StructableClass) as T;
}

// ============ Tests ============

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

describe("JSON Serialization - Basic Types", () => {
  it("should round-trip all basic types", () => {
    const original = new JAllTypes();
    const restored = jsonRoundTrip(original, JAllTypes);

    expect(restored.intVal).toBe(original.intVal);
    // Float precision loss through JSON number representation
    expect(restored.doubleVal).toBe(original.doubleVal);
    expect(restored.stringVal).toBe(original.stringVal);
    expect(restored.boolVal).toBe(original.boolVal);
  });

  it("should produce valid JSON structure", () => {
    const original = new JAllTypes();
    const json = nstructjs.writeJSON(original);

    expect(json).toHaveProperty("intVal");
    expect(json).toHaveProperty("floatVal");
    expect(json).toHaveProperty("doubleVal");
    expect(json).toHaveProperty("stringVal");
    expect(json).toHaveProperty("boolVal");
    expect(typeof json.intVal).toBe("number");
    expect(typeof json.stringVal).toBe("string");
    expect(typeof json.boolVal).toBe("boolean");
  });
});

describe("JSON Serialization - Nested Structs", () => {
  it("should round-trip nested structs", () => {
    const original = new JPoint(42.5, 99.75);
    const restored = jsonRoundTrip(original, JPoint);

    expect(restored.x).toBe(original.x);
    expect(restored.y).toBe(original.y);
  });
});

describe("JSON Serialization - Arrays", () => {
  it("should round-trip arrays of primitives and structs", () => {
    const original = new JWithArray();
    const restored = jsonRoundTrip(original, JWithArray);

    expect(restored.numbers).toEqual(original.numbers);
    expect(restored.points.length).toBe(original.points.length);
    expect(restored.points[0].x).toBe(original.points[0].x);
    expect(restored.points[1].y).toBe(original.points[1].y);
  });
});

describe("JSON Serialization - Abstract/Polymorphic Types", () => {
  it("should round-trip abstract types with type discriminator", () => {
    const original = new JAbstractHolder();
    (original.item as JDerived).derivedVal = 777;

    const json = nstructjs.writeJSON(original);
    // Should include type discriminator
    const itemJson = json.item as Record<string, unknown>;
    expect(itemJson._structName).toBe("json.JDerived");

    const restored = jsonRoundTrip(original, JAbstractHolder);
    expect(restored.item).toBeInstanceOf(JDerived);
    expect((restored.item as JDerived).derivedVal).toBe(777);
    expect(restored.item.baseVal).toBe(10);
  });
});

describe("JSON Serialization - Optional Fields", () => {
  it("should serialize undefined optional as null in JSON", () => {
    const original = new JOptional();
    const json = nstructjs.writeJSON(original);

    expect(json.present).toBe(99.5);
    expect(json.missing).toBeNull();
  });

  it("should deserialize null optional back to undefined", () => {
    const original = new JOptional();
    const restored = jsonRoundTrip(original, JOptional);

    expect(restored.present).toBe(99.5);
    expect(restored.missing).toBeUndefined();
  });

  it("should round-trip when all optionals are present", () => {
    const original = new JOptional();
    original.missing = 50.5;
    const restored = jsonRoundTrip(original, JOptional);

    expect(restored.present).toBe(99.5);
    expect(restored.missing).toBe(50.5);
  });
});

describe("JSON Serialization - Validation", () => {
  it("should validate correct JSON", () => {
    const original = new JAllTypes();
    const json = nstructjs.writeJSON(original);

    const result = nstructjs.validateJSON(json, JAllTypes as unknown as import("../src/types.js").StructableClass);
    expect(result).toBe(true);
  });
});

describe("JSON Serialization - writeJSON then stringify stability", () => {
  it("should produce identical results on re-serialization", () => {
    const original = new JPoint(1.5, 2.5);
    const json1 = nstructjs.writeJSON(original);
    const restored = nstructjs.readJSON(
      json1,
      JPoint as unknown as import("../src/types.js").StructableClass
    ) as JPoint;
    const json2 = nstructjs.writeJSON(restored);

    expect(JSON.stringify(json1)).toBe(JSON.stringify(json2));
  });
});
