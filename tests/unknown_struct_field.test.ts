/**
 * `onSerializeUnknown` on the *concrete* struct path.
 *
 * `StructTStructField` (the `abstract(T)` path) has consulted the hook for a
 * while, so a placeholder standing in for an unloaded class round-trips there.
 * `StructStructField` — a field declared as a bare `T` — did not: it went
 * straight to `get_struct(T)`, which throws once `T` itself is unregistered,
 * and that is exactly the situation the placeholder exists to survive.
 *
 * Container fields (`array(T)`, `iter(T)`, `optional(T)`, …) all recurse through
 * `do_pack`, which dispatches on the *element* descriptor and so lands in the
 * same handler. `array(T)` is covered here to pin that down, not because the
 * containers carry their own copy of the fix.
 *
 * `unk.Gone` models a class this build never registered. `unk.Recovered` models
 * the schema a host recovers out of the file header and registers under the
 * original name — what the hook points the writer at.
 */

import { describe, it, expect, beforeAll } from "vitest";

(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import type { StructableClass } from "../src/types.js";

interface UnknownAwareManager {
  onSerializeUnknown?: (obj: unknown) => string | undefined;
}

function manager(): UnknownAwareManager {
  return nstructjs.manager as unknown as UnknownAwareManager;
}

/**
 * Stand-in for an instance of a class this build never registered. Mirrors the
 * host's placeholders: it carries the original struct name plus whatever fields
 * the file's schema described, deposited as plain properties.
 */
class Placeholder {
  _origClsname: string;
  x: number;
  y: number;

  constructor(origClsname: string, x: number, y: number) {
    this._origClsname = origClsname;
    this.x = x;
    this.y = y;
  }
}

/** The recovered schema, registered under its own name with a shell class. */
class Recovered {
  x = 0;
  y = 0;

  loadSTRUCT(reader: (obj: Recovered) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    Recovered as unknown as StructableClass,
    `
    unk.Recovered {
      x : double;
      y : double;
    }
  `
  );
}

/** Declares its fields against `unk.Gone`, which is never registered. */
class Holder {
  scalar: unknown = null;
  list: unknown[] = [];

  loadSTRUCT(reader: (obj: Holder) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    Holder as unknown as StructableClass,
    `
    unk.Holder {
      scalar : unk.Gone;
      list   : array(unk.Gone);
    }
  `
  );
}

/**
 * Byte-identical layout to `Holder`, but declared against the registered name.
 * Reading `Holder`'s output as a `Mirror` is how the test inspects what the
 * writer actually emitted without needing `unk.Gone` to exist.
 */
class Mirror {
  scalar: Recovered | null = null;
  list: Recovered[] = [];

  loadSTRUCT(reader: (obj: Mirror) => void): void {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    Mirror as unknown as StructableClass,
    `
    unk.Mirror {
      scalar : unk.Recovered;
      list   : array(unk.Recovered);
    }
  `
  );
}

function write(obj: unknown): DataView {
  const data: number[] = [];
  nstructjs.writeObject(data, obj);
  return new DataView(new Uint8Array(data).buffer);
}

function withHook<T>(fn: () => T): T {
  const m = manager();
  m.onSerializeUnknown = (obj) => (obj as Placeholder)?._origClsname || undefined;
  try {
    return fn();
  } finally {
    m.onSerializeUnknown = undefined;
  }
}

beforeAll(() => {
  nstructjs.useTinyEval();
  nstructjs.setAllowOverriding(true);
});

describe("onSerializeUnknown on the concrete struct path", () => {
  it("throws without the hook, because the declared class is unregistered", () => {
    const holder = new Holder();
    holder.scalar = new Placeholder("unk.Recovered", 1.5, 2.5);

    expect(() => write(holder)).toThrow(/Unknown struct/);
  });

  it("packs a placeholder in a bare struct field under the recovered schema", () => {
    const bytes = withHook(() => {
      const holder = new Holder();
      holder.scalar = new Placeholder("unk.Recovered", 1.5, 2.5);
      return write(holder);
    });

    const read = nstructjs.readObject(bytes, Mirror as unknown as StructableClass) as Mirror;

    expect(read.scalar).toMatchObject({ x: 1.5, y: 2.5 });
  });

  it("packs placeholders inside array(T), which reaches the same handler", () => {
    const bytes = withHook(() => {
      const holder = new Holder();
      holder.scalar = new Placeholder("unk.Recovered", 0, 0);
      holder.list = [new Placeholder("unk.Recovered", 3, 4), new Placeholder("unk.Recovered", 5, 6)];
      return write(holder);
    });

    const read = nstructjs.readObject(bytes, Mirror as unknown as StructableClass) as Mirror;

    expect(read.list).toHaveLength(2);
    expect(read.list[0]).toMatchObject({ x: 3, y: 4 });
    expect(read.list[1]).toMatchObject({ x: 5, y: 6 });
  });

  it("emits the same bytes a real instance of the recovered class would", () => {
    const placeholderBytes = withHook(() => {
      const holder = new Holder();
      holder.scalar = new Placeholder("unk.Recovered", 1.5, 2.5);
      holder.list = [new Placeholder("unk.Recovered", 3, 4)];
      return write(holder);
    });

    const mirror = new Mirror();
    mirror.scalar = Object.assign(new Recovered(), { x: 1.5, y: 2.5 });
    mirror.list = [Object.assign(new Recovered(), { x: 3, y: 4 })];
    const realBytes = write(mirror);

    expect(new Uint8Array(placeholderBytes.buffer)).toEqual(new Uint8Array(realBytes.buffer));
  });

  it("leaves ordinary values alone when the hook returns undefined", () => {
    const m = manager();
    m.onSerializeUnknown = () => undefined;

    try {
      const mirror = new Mirror();
      mirror.scalar = Object.assign(new Recovered(), { x: 7, y: 8 });
      mirror.list = [Object.assign(new Recovered(), { x: 9, y: 10 })];

      const read = nstructjs.readObject(write(mirror), Mirror as unknown as StructableClass) as Mirror;

      expect(read.scalar).toMatchObject({ x: 7, y: 8 });
      expect(read.list[0]).toMatchObject({ x: 9, y: 10 });
    } finally {
      m.onSerializeUnknown = undefined;
    }
  });
});
