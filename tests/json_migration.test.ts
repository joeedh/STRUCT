/**
 * `migrateJSON`/`migrateSTRUCT`/`getVersionSTRUCT`/`addStructNameMigration`
 * on the JSON path, driven through the top-level `readJSON(json, cls, {
 * version })` option -- migration runs as a separate pass ahead of the read
 * (`readJSON` calls `migrateJSON` in place, then reads the now-migrated
 * JSON), unlike binary where it happens during the read itself. See
 * `tests/binary_migration.test.ts` for the binary side and
 * `tests/binary_struct_rename.test.ts` for struct-rename chaining;
 * `structNameMigration` is shared by both paths, so a rename registered once
 * applies to JSON and binary reads alike.
 */

import { describe, it, expect, beforeAll } from "vitest";

(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import type { StructableClass } from "../src/types.js";

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

describe("JSON migration: readJSON's migrate option actually runs migrateJSON", () => {
  class PersonV3 {
    firstName = "";
    lastName = "";

    loadSTRUCT(reader: (obj: PersonV3) => void): void {
      reader(this);
    }

    static structName = "jsonmig.Person";
    static STRUCT = `jsonmig.Person {
      firstName : string;
      lastName  : string;
    }`;

    static migrateSTRUCT(version: number, data: any): void {
      if (version < 2) {
        data.fullName = data.name;
        delete data.name;
      }
      if (version < 3) {
        const parts = String(data.fullName ?? "").split(" ");
        data.firstName = parts[0] ?? "";
        data.lastName = parts.slice(1).join(" ");
        delete data.fullName;
      }
    }
  }

  nstructjs.register(PersonV3 as unknown as StructableClass);

  it("stacks both migration steps for a v1 (name) payload", () => {
    const json = { name: "Ada Lovelace" };

    const result = nstructjs.readJSON(json, PersonV3 as unknown as StructableClass, { version: 1 }) as PersonV3;

    expect(result.firstName).toBe("Ada");
    expect(result.lastName).toBe("Lovelace");
  });

  it("stacks only the second step for a v2 (fullName) payload", () => {
    const json = { fullName: "Grace Hopper" };

    const result = nstructjs.readJSON(json, PersonV3 as unknown as StructableClass, { version: 2 }) as PersonV3;

    expect(result.firstName).toBe("Grace");
    expect(result.lastName).toBe("Hopper");
  });

  it("leaves a current (v3) payload untouched", () => {
    const json = { firstName: "Margaret", lastName: "Hamilton" };

    const result = nstructjs.readJSON(json, PersonV3 as unknown as StructableClass, { version: 3 }) as PersonV3;

    expect(result.firstName).toBe("Margaret");
    expect(result.lastName).toBe("Hamilton");
  });

  it("does nothing when no migrate option is passed, even though migrateSTRUCT exists", () => {
    const json = { firstName: "Katherine", lastName: "Johnson" };

    const result = nstructjs.readJSON(json, PersonV3 as unknown as StructableClass) as PersonV3;

    expect(result.firstName).toBe("Katherine");
    expect(result.lastName).toBe("Johnson");
  });
});

describe("JSON migration: struct-name migrations chain across abstract(...) fields", () => {
  class Shape {
    loadSTRUCT(reader: (obj: Shape) => void): void {
      reader(this);
    }
    static structName = "jsonmig.Shape";
    static STRUCT = `jsonmig.Shape {
    }`;
  }

  class Gizmo {
    label = "";

    loadSTRUCT(reader: (obj: Gizmo) => void): void {
      reader(this);
    }

    static structName = "jsonmig.Gizmo";
    static STRUCT = `jsonmig.Gizmo {
      label : string;
    }`;
  }

  class Holder {
    item: unknown = undefined;

    loadSTRUCT(reader: (obj: Holder) => void): void {
      reader(this);
    }

    static structName = "jsonmig.Holder";
    static STRUCT = `jsonmig.Holder {
      item : abstract(jsonmig.Shape);
    }`;
  }

  nstructjs.register(Shape as unknown as StructableClass);
  nstructjs.register(Gizmo as unknown as StructableClass);
  nstructjs.register(Holder as unknown as StructableClass);

  // rn.Doohickey -> rn.Contraption -> jsonmig.Gizmo, chained across two
  // rename events -- the same table `structNameMigration` walks for binary.
  nstructjs.manager.addStructNameMigration(2, "jsonmig.Doohickey", "jsonmig.Contraption");
  nstructjs.manager.addStructNameMigration(3, "jsonmig.Contraption", "jsonmig.Gizmo");

  it("resolves a doubly-renamed struct inside a polymorphic field", () => {
    const json = { item: { _structName: "jsonmig.Doohickey", label: "old label" } };

    const result = nstructjs.readJSON(json, Holder as unknown as StructableClass, { version: 1 }) as Holder;

    expect(result.item).toBeInstanceOf(Gizmo);
    expect((result.item as Gizmo).label).toBe("old label");
  });
});

describe("JSON migration: migrateJSON as a standalone pass", () => {
  class Item {
    qty = 0;

    static structName = "jsonmig.Item";
    static STRUCT = `jsonmig.Item {
      qty : int;
    }`;

    static getVersionSTRUCT(data: any): number {
      return data.schemaVersion ?? 1;
    }

    static migrateSTRUCT(version: number, data: any): void {
      if (version < 2) {
        data.qty += 1000;
      }
    }
  }

  nstructjs.register(Item as unknown as StructableClass);

  it("mutates the plain JSON object in place, ahead of any read", () => {
    const json: any = { qty: 5 };

    nstructjs.migrateJSON(json, Item as unknown as StructableClass, { version: 1 });

    expect(json.qty).toBe(1005);
  });

  it("defers to getVersionSTRUCT's own reading of the data over the caller's guess", () => {
    const json: any = { qty: 5, schemaVersion: 2 };

    nstructjs.migrateJSON(json, Item as unknown as StructableClass, { version: 99 });

    expect(json.qty).toBe(5);
  });
});
