import { describe, it, expect } from "vitest";

// Set up global DEBUG before importing nstructjs
(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import { STRUCT } from "../src/struct_intern.js";
import type { StructableClass, StructKeywords } from "../src/types.js";

/* deriveStructManager renames the static fields and hooks a class carries, so a
   host that already claims `STRUCT` on its own classes can still use nstructjs.
   Nothing else in the test suite exercises a keyword set other than the default
   one, and the renaming reaches codegen through manager.constructor.keywords --
   a path a default-keyword test cannot reach. */

function keywordsOf(cls: typeof STRUCT): StructKeywords {
  return (cls as unknown as { keywords: StructKeywords }).keywords;
}

const POINT = `Point {
  x : float;
  y : float;
}`;

const LINE = `Line {
  a : Point;
  b : Point;
  tag : int;
}`;

/** A Point/Line pair whose script, loader and allocator all use `SCHEMA`. */
function schemaClasses() {
  const loaded: string[] = [];

  class Point {
    x = 0;
    y = 0;

    static SCHEMA = POINT;

    static newSCHEMA(): Point {
      const p = new Point();
      loaded.push("newSCHEMA");
      return p;
    }

    loadSCHEMA(reader: (obj: Point) => void): void {
      loaded.push("loadSCHEMA");
      reader(this);
    }
  }

  class Line {
    a = new Point();
    b = new Point();
    tag = 0;

    static SCHEMA = LINE;
  }

  return { Point, Line, loaded };
}

describe("custom keywords", () => {
  it("defaults every keyword from the script name", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });

    expect(keywordsOf(Alt)).toMatchObject({
      script: "SCHEMA",
      name  : "schemaName",
      load  : "loadSCHEMA",
      new   : "newSCHEMA",
      from  : "fromSCHEMA",
    });
  });

  it("takes an explicit name for any keyword", () => {
    const Alt = nstructjs.deriveStructManager({
      script: "SCHEMA",
      name  : "$id",
      load  : "restore",
      new   : "allocate",
      from  : "rebuild",
    });

    expect(keywordsOf(Alt)).toMatchObject({
      script: "SCHEMA",
      name  : "$id",
      load  : "restore",
      new   : "allocate",
      from  : "rebuild",
    });
  });

  it("falls back to the default keywords with no argument", () => {
    const base = keywordsOf(STRUCT);
    const derived = keywordsOf(nstructjs.deriveStructManager());

    // `after` is the one entry deriveStructManager never builds; it has its own
    // test below.
    for (const key of ["script", "name", "load", "new", "from"] as const) {
      expect(derived[key]).toBe(base[key]);
    }
  });

  it("reads the script off the renamed static field", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });
    const alt = new Alt();
    const { Point } = schemaClasses();

    alt.register(Point as unknown as StructableClass);

    expect(alt.get_struct("Point").name).toBe("Point");
    expect((Point as unknown as Record<string, unknown>).schemaName).toBe("Point");
    // The default keyword must stay untouched, or a host using both managers
    // would see nstructjs claim the field it renamed away from.
    expect((Point as unknown as Record<string, unknown>).structName).toBeUndefined();
  });

  it("round-trips binary through a renamed loader and allocator", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });
    const alt = new Alt();
    const { Point, Line, loaded } = schemaClasses();

    alt.register(Point as unknown as StructableClass);
    alt.register(Line as unknown as StructableClass);

    const line = new Line();
    line.a.x = 1.5;
    line.a.y = -2.25;
    line.b.x = 3;
    line.b.y = 4;
    line.tag = 7;

    const bytes = alt.write_object([] as number[], line as unknown as object) as number[];
    const view = new DataView(new Uint8Array(bytes).buffer);
    const out = alt.read_object(view, Line as unknown as StructableClass) as unknown as InstanceType<typeof Line>;

    expect(out.a.x).toBeCloseTo(1.5);
    expect(out.a.y).toBeCloseTo(-2.25);
    expect(out.b.x).toBeCloseTo(3);
    expect(out.tag).toBe(7);

    // Both hooks are named after the script keyword, so a manager that ignored
    // the keyword table would silently construct the points some other way.
    expect(loaded).toContain("newSCHEMA");
    expect(loaded).toContain("loadSCHEMA");
  });

  it("round-trips JSON through a renamed loader", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });
    const alt = new Alt();
    const { Point, Line } = schemaClasses();

    alt.register(Point as unknown as StructableClass);
    alt.register(Line as unknown as StructableClass);

    const line = new Line();
    line.a.x = 8;
    line.b.y = 9;
    line.tag = 3;

    const json = alt.writeJSON(line as unknown as object);
    const out = alt.readJSON(json, Line as unknown as StructableClass) as unknown as InstanceType<typeof Line>;

    expect(out.a.x).toBeCloseTo(8);
    expect(out.b.y).toBeCloseTo(9);
    expect(out.tag).toBe(3);
  });

  it("honors a renamed load keyword that shares no prefix with the script", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA", load: "restore" });
    const alt = new Alt();
    let restored = 0;

    class Point {
      x = 0;
      y = 0;

      static SCHEMA = POINT;

      restore(reader: (obj: Point) => void): void {
        restored++;
        reader(this);
      }
    }

    alt.register(Point as unknown as StructableClass);

    const p = new Point();
    p.x = 5;

    const bytes = alt.write_object([] as number[], p as unknown as object) as number[];
    const view = new DataView(new Uint8Array(bytes).buffer);
    const out = alt.read_object(view, Point as unknown as StructableClass) as unknown as Point;

    expect(restored).toBe(1);
    expect(out.x).toBeCloseTo(5);
  });

  it("keeps two managers with different keywords independent", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });
    const alt = new Alt();
    const plain = new STRUCT();
    const { Point } = schemaClasses();

    alt.register(Point as unknown as StructableClass);

    expect(plain.struct_cls.Point).toBeUndefined();
    expect(nstructjs.manager.struct_cls.Point).toBeUndefined();
    // Deriving must not reach back into the base class's static keyword table.
    expect(keywordsOf(STRUCT).script).toBe("STRUCT");
  });

  it("throws when the class carries no script under the renamed keyword", () => {
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });
    const alt = new Alt();

    class Point {
      static STRUCT = POINT;
    }

    expect(() => alt.register(Point as unknown as StructableClass)).toThrow(/no SCHEMA script/);
  });

  it("builds no after keyword, unlike setClassKeyword", () => {
    // Documented in Configuration.md as a caveat rather than a bug; this pins
    // the difference so a fix has to update the docs with it.
    expect(keywordsOf(nstructjs.deriveStructManager({ script: "SCHEMA" })).after).toBeUndefined();
    expect(keywordsOf(STRUCT).after).toBe("afterSTRUCT");
  });

  it("reports isRegistered false for a renamed name keyword", () => {
    // Also a documented caveat: isRegistered gates on a literal `structName`
    // own property before it consults the keyword table.
    const Alt = nstructjs.deriveStructManager({ script: "SCHEMA" });
    const alt = new Alt();
    const { Point } = schemaClasses();

    alt.register(Point as unknown as StructableClass);

    expect(alt.isRegistered(Point as unknown as StructableClass)).toBe(false);
    expect(alt.struct_cls.Point).toBe(Point);
  });
});
