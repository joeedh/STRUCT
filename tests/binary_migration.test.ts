/**
 * `migrateSTRUCT`/`getVersionSTRUCT` during binary deserialization.
 *
 * JSON migration (`migrateJSON`) is a separate pass over plain data before any
 * class touches it. Binary can't do that -- the unpack codegen needs the
 * *file's own* field layout to know how many bytes to consume, so there is no
 * raw-data stage to migrate ahead of time. Instead `read_object` walks the
 * file's embedded schema (via `parse_structs`, exactly like `FileHelper` does)
 * and calls `migrateSTRUCT(version, obj)` post-order, right after each
 * struct's own fields -- and any nested structs, already migrated by their
 * own `read_object` calls -- have finished loading. Structural drift (a field
 * renamed/added/removed) is already handled for free by reading the file's
 * schema instead of the current class's; `migrateSTRUCT` is for the semantic
 * fixups on top of that (copying an old field's value into a new field name,
 * splitting/joining values, etc).
 *
 * `Person`'s schema evolves name -> fullName -> firstName/lastName across
 * three versions, and a single `migrateSTRUCT` stacks both steps with
 * successive `if (version < N)` guards -- the same pattern a real app uses to
 * carry many versions' worth of fixups in one place. `Item` covers a struct
 * that self-reports its own version via `getVersionSTRUCT`, overriding
 * whatever version the caller passed in.
 */

import { describe, it, expect, beforeAll } from "vitest";

(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import { STRUCT } from "../src/struct_intern.js";
import type { StructableClass } from "../src/types.js";

beforeAll(() => {
  nstructjs.useTinyEval();
});

/** Writes `data` using a throwaway class registered only under `script`. */
function writeVersion(
  structName: string,
  script: string,
  data: Record<string, unknown>
): { scripts: string; bytes: DataView } {
  const writerManager = new STRUCT();

  class Versioned {
    loadSTRUCT(reader: (obj: Versioned) => void): void {
      reader(this);
    }

    static structName = structName;
    static STRUCT = script;
  }

  writerManager.register(Versioned as unknown as StructableClass);

  const inst = Object.assign(new Versioned(), data);
  const bytesArr: number[] = [];
  writerManager.write_object(bytesArr, inst);

  return {
    scripts: nstructjs.write_scripts(writerManager),
    bytes  : new DataView(new Uint8Array(bytesArr).buffer),
  };
}

/**
 * Reads `bytes` against the *file's* schema (`scripts`), instantiating
 * `currentCls` and running its migrateSTRUCT/getVersionSTRUCT chain -- the
 * same two-step FileHelper itself does (parse_structs, then read_object).
 */
function readVersion<T>(scripts: string, fileVersion: number, bytes: DataView, currentCls: StructableClass<T>): T {
  const fileStruct = new STRUCT();
  fileStruct.parse_structs(scripts, [currentCls]);
  return fileStruct.readObject(bytes, currentCls as unknown as StructableClass, undefined, fileVersion) as T;
}

describe("binary migration: migrateSTRUCT stacking across schema versions", () => {
  class PersonV3 {
    firstName = "";
    lastName = "";

    loadSTRUCT(reader: (obj: PersonV3) => void): void {
      reader(this);
    }

    static structName = "migtest.Person";
    static STRUCT = `migtest.Person {
      firstName : string;
      lastName  : string;
    }`;

    static migrateSTRUCT(version: number, obj: any): void {
      if (version < 2) {
        obj.fullName = obj.name;
        delete obj.name;
      }
      if (version < 3) {
        const parts = String(obj.fullName ?? "").split(" ");
        obj.firstName = parts[0] ?? "";
        obj.lastName = parts.slice(1).join(" ");
        delete obj.fullName;
      }
    }
  }

  it("migrates a v1 file (name) through both steps", () => {
    const { scripts, bytes } = writeVersion(
      "migtest.Person",
      `migtest.Person {
        name : string;
      }`,
      { name: "Ada Lovelace" }
    );

    const result = readVersion(scripts, 1, bytes, PersonV3 as unknown as StructableClass<PersonV3>);

    expect(result.firstName).toBe("Ada");
    expect(result.lastName).toBe("Lovelace");
    expect((result as any).name).toBeUndefined();
    expect((result as any).fullName).toBeUndefined();
  });

  it("migrates a v2 file (fullName) through only the second step", () => {
    const { scripts, bytes } = writeVersion(
      "migtest.Person",
      `migtest.Person {
        fullName : string;
      }`,
      { fullName: "Grace Hopper" }
    );

    const result = readVersion(scripts, 2, bytes, PersonV3 as unknown as StructableClass<PersonV3>);

    expect(result.firstName).toBe("Grace");
    expect(result.lastName).toBe("Hopper");
    expect((result as any).fullName).toBeUndefined();
  });

  it("leaves a current (v3) file untouched -- both guards are already satisfied", () => {
    const { scripts, bytes } = writeVersion("migtest.Person", PersonV3.STRUCT, {
      firstName: "Margaret",
      lastName : "Hamilton",
    });

    const result = readVersion(scripts, 3, bytes, PersonV3 as unknown as StructableClass<PersonV3>);

    expect(result.firstName).toBe("Margaret");
    expect(result.lastName).toBe("Hamilton");
  });
});

describe("binary migration: getVersionSTRUCT overrides the caller's guess", () => {
  const migrateCalls: number[] = [];

  class Item {
    qty = 0;
    schemaVersion?: number;

    loadSTRUCT(reader: (obj: Item) => void): void {
      reader(this);
    }

    static structName = "migtest.Item";
    static STRUCT = `migtest.Item {
      qty           : int;
      schemaVersion : optional(int);
    }`;

    static getVersionSTRUCT(obj: any): number {
      return obj.schemaVersion ?? 1;
    }

    static migrateSTRUCT(version: number, obj: any): void {
      migrateCalls.push(version);
      if (version < 2) {
        obj.qty += 1000;
      }
    }
  }

  it("falls back to the self-reported default when the file predates the field", () => {
    migrateCalls.length = 0;

    const { scripts, bytes } = writeVersion(
      "migtest.Item",
      `migtest.Item {
        qty : int;
      }`,
      { qty: 5 }
    );

    // The caller passes a version of 99 -- wildly wrong -- to prove
    // getVersionSTRUCT's own reading of the data wins over it.
    const result = readVersion(scripts, 99, bytes, Item as unknown as StructableClass<Item>);

    expect(migrateCalls).toEqual([1]);
    expect(result.qty).toBe(1005);
  });

  it("trusts the embedded schemaVersion once the file carries one", () => {
    migrateCalls.length = 0;

    const { scripts, bytes } = writeVersion("migtest.Item", Item.STRUCT, { qty: 5, schemaVersion: 2 });

    const result = readVersion(scripts, 99, bytes, Item as unknown as StructableClass<Item>);

    expect(migrateCalls).toEqual([2]);
    expect(result.qty).toBe(5);
  });
});
