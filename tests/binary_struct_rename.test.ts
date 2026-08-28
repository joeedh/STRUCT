/**
 * Struct-name migrations (`addStructNameMigration`) on the binary path.
 *
 * A client app typically embeds a copy of its struct scripts in the file
 * header (see `FileHelper`'s "scripts" chunk) and re-parses that copy into a
 * fresh `STRUCT` instance on read -- that instance's schema, not the current
 * class's, is what drives the read. A struct renamed since the file was
 * written still appears under its old name in that embedded copy, so the
 * rename has to be resolved once, right there in `parse_structs`, mapping
 * the file's old name to whatever class currently owns the new one. Every
 * downstream lookup (`struct_cls`, `abstract(...)` dispatch by struct id)
 * reads from the same resolved map, so nothing else needs to know about the
 * rename.
 *
 * These tests drive that through the real `FileHelper` (magic + version
 * header + embedded scripts + block struct id), and register/unregister
 * classes on the global manager around each write/read pair to model an app
 * upgrading between the write and the read -- the situation the feature
 * exists for.
 */

import { describe, it, expect, beforeAll } from "vitest";

(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import { STRUCT } from "../src/struct_intern.js";
import type { StructableClass } from "../src/types.js";

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

const FILE_PARAMS = {
  magic     : "RNTS",
  ext       : ".bin",
  blocktypes: ["DATA"],
  version   : { major: 1, minor: 0, micro: 0 },
};

describe("binary migration: struct renames resolved from the embedded schema", () => {
  it("resolves a struct renamed since the file was written", () => {
    class Widget {
      x = 0;

      loadSTRUCT(reader: (obj: Widget) => void): void {
        reader(this);
      }

      static structName = "rn.Widget";
      static STRUCT = `rn.Widget {
        x : int;
      }`;
    }

    nstructjs.register(Widget as unknown as StructableClass);

    const writer = new nstructjs.filehelper.FileHelper(FILE_PARAMS);
    const widget = new Widget();
    widget.x = 42;
    const bytes = writer.write([writer.makeBlock("DATA", widget)]);

    nstructjs.unregister(Widget as unknown as StructableClass);

    class Thing {
      x = 0;

      loadSTRUCT(reader: (obj: Thing) => void): void {
        reader(this);
      }

      static structName = "rn.Thing";
      static STRUCT = `rn.Thing {
        x : int;
      }`;
    }

    nstructjs.register(Thing as unknown as StructableClass);
    // The rename takes effect at v2; the file itself, at v1, predates it and
    // still carries the old name -- addStructNameMigration(V, ...) means
    // "renamed as of V", so data older than V is what gets translated.
    const renamedAtVersion = nstructjs.filehelper.versionToInt({ major: 2, minor: 0, micro: 0 });
    nstructjs.manager.addStructNameMigration(renamedAtVersion, "rn.Widget", "rn.Thing");

    try {
      const reader = new nstructjs.filehelper.FileHelper(FILE_PARAMS);
      const blocks = reader.read(bytes);
      const result = blocks[0].data as Thing;

      expect(result).toBeInstanceOf(Thing);
      expect(result.x).toBe(42);
    } finally {
      nstructjs.unregister(Thing as unknown as StructableClass);
    }
  });

  it("resolves a name reused across separate rename events (a -> b, e -> a, a -> e)", () => {
    const struct = new STRUCT();
    const V1 = 10;
    const V2 = 20;
    const V3 = 30;

    struct.addStructNameMigration(V1, "a", "b");
    struct.addStructNameMigration(V2, "e", "a");
    struct.addStructNameMigration(V3, "a", "e");

    // Before V1, "a" was the first struct's own name.
    expect(struct.structNameMigration(V1 - 1, "a")).toBe("b");
    // From V2 up to (not including) V3, "a" belongs to the second struct,
    // reusing the name the first struct vacated.
    expect(struct.structNameMigration(V2, "a")).toBe("e");
    expect(struct.structNameMigration(V3 - 1, "a")).toBe("e");
    // At V3 and after, that struct is "e" again -- "a" no longer resolves.
    expect(struct.structNameMigration(V3, "a")).toBe("a");
    // "e" itself only needs translating for data older than V2, when it was
    // still the second struct's original name.
    expect(struct.structNameMigration(V2 - 1, "e")).toBe("a");
  });

  it("throws on a duplicate old-name registration at the exact same version", () => {
    const struct = new STRUCT();
    struct.addStructNameMigration(10, "a", "b");

    expect(() => struct.addStructNameMigration(10, "a", "c")).toThrow(/already exists/);
  });

  it("does not throw when the same old name is reused at a later version", () => {
    const struct = new STRUCT();
    struct.addStructNameMigration(10, "a", "b");

    expect(() => struct.addStructNameMigration(30, "a", "e")).not.toThrow();
  });

  it("treats addStructNameMigration(V, ...) as effective as of V, not before", () => {
    const struct = new STRUCT();
    struct.addStructNameMigration(100, "old.Name", "new.Name");

    // Data reporting a version older than 100 still has the old name.
    expect(struct.structNameMigration(99, "old.Name")).toBe("new.Name");
    // Data reporting 100 or newer is assumed to already use the new name --
    // the rename doesn't reach back and translate it again.
    expect(struct.structNameMigration(100, "old.Name")).toBe("old.Name");
    expect(struct.structNameMigration(101, "old.Name")).toBe("old.Name");
  });

  it("falls back to a dummy placeholder without a matching rename, so the fix is opt-in", () => {
    class Sprocket {
      n = 7;

      loadSTRUCT(reader: (obj: Sprocket) => void): void {
        reader(this);
      }

      static structName = "rn.Sprocket";
      static STRUCT = `rn.Sprocket {
        n : int;
      }`;
    }

    nstructjs.register(Sprocket as unknown as StructableClass);

    const writer = new nstructjs.filehelper.FileHelper(FILE_PARAMS);
    const bytes = writer.write([writer.makeBlock("DATA", new Sprocket())]);

    nstructjs.unregister(Sprocket as unknown as StructableClass);

    // No addStructNameMigration for rn.Sprocket -- and nothing registered
    // under that name either, so parse_structs has to fall back to its
    // throwaway placeholder class.
    const reader = new nstructjs.filehelper.FileHelper(FILE_PARAMS);
    const blocks = reader.read(bytes);
    const result = blocks[0].data as { n: number };

    expect(result.constructor).not.toBe(Sprocket);
    expect(result.n).toBe(7);
  });

  it("chains through an intermediate name across two rename events", () => {
    class Gizmo {
      label = "";

      loadSTRUCT(reader: (obj: Gizmo) => void): void {
        reader(this);
      }

      static structName = "rn.Gizmo";
      static STRUCT = `rn.Gizmo {
        label : string;
      }`;
    }

    // rn.Doohickey (v1) -> rn.Contraption (v2) -> rn.Gizmo (v3, current).
    // Each registration only names the *next* step, not the eventual
    // current name -- structNameMigration chases Doohickey through
    // Contraption to Gizmo on its own.
    const v1 = { major: 1, minor: 0, micro: 0 };
    const v2 = { major: 2, minor: 0, micro: 0 };
    const v3 = { major: 3, minor: 0, micro: 0 };
    const version2 = nstructjs.filehelper.versionToInt(v2);
    const version3 = nstructjs.filehelper.versionToInt(v3);

    function writeUnderName(structName: string, version: typeof v1): DataView {
      class Historical {
        label = "";

        loadSTRUCT(reader: (obj: Historical) => void): void {
          reader(this);
        }

        static structName = structName;
        static STRUCT = `${structName} {
          label : string;
        }`;
      }

      nstructjs.register(Historical as unknown as StructableClass);
      const writer = new nstructjs.filehelper.FileHelper({ ...FILE_PARAMS, version });
      const inst = new Historical();
      inst.label = structName;
      const bytes = writer.write([writer.makeBlock("DATA", inst)]);
      nstructjs.unregister(Historical as unknown as StructableClass);
      return bytes;
    }

    // Written under the name each version actually used.
    const doohickeyBytes = writeUnderName("rn.Doohickey", v1);
    const contraptionBytes = writeUnderName("rn.Contraption", v2);

    nstructjs.register(Gizmo as unknown as StructableClass);
    nstructjs.manager.addStructNameMigration(version2, "rn.Doohickey", "rn.Contraption");
    nstructjs.manager.addStructNameMigration(version3, "rn.Contraption", "rn.Gizmo");

    try {
      const readerV1 = new nstructjs.filehelper.FileHelper({ ...FILE_PARAMS, version: v1 });
      const fromDoohickey = readerV1.read(doohickeyBytes)[0].data as Gizmo;
      expect(fromDoohickey).toBeInstanceOf(Gizmo);
      expect(fromDoohickey.label).toBe("rn.Doohickey");

      const readerV2 = new nstructjs.filehelper.FileHelper({ ...FILE_PARAMS, version: v2 });
      const fromContraption = readerV2.read(contraptionBytes)[0].data as Gizmo;
      expect(fromContraption).toBeInstanceOf(Gizmo);
      expect(fromContraption.label).toBe("rn.Contraption");
    } finally {
      nstructjs.unregister(Gizmo as unknown as StructableClass);
    }
  });
});
