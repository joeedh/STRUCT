import { describe, it, expect } from "vitest";

// Set up global DEBUG before importing nstructjs
(globalThis as Record<string, unknown>).DEBUG = { tinyeval: false };

import * as nstructjs from "../src/structjs.js";
import { STRUCT, stableStructId, STABLE_ID_BASE, STABLE_ID_LIMIT } from "../src/struct_intern.js";
import type { StructableClass } from "../src/types.js";

/* Struct ids used to come from a global registration counter, so a build that
   registered a different set of classes -- an app with a different addon set,
   say -- gave the same struct a different id. Anything that replays bytes from
   one build in another (preserved payloads for unloaded addons) then decodes
   nested `abstract(...)` fields as the wrong struct, silently, because an id is
   just an integer. Ids are now derived from the struct name instead. */

function makeClass(name: string, script: string): StructableClass {
  const cls = class {
    static structName = name;
    static STRUCT = script;
  };

  Object.defineProperty(cls, "name", { value: name });
  return cls as unknown as StructableClass;
}

const ALPHA = `Alpha {
  x : int;
}`;

const BETA = `Beta {
  y : float;
}`;

const GAMMA = `Gamma {
  z : short;
}`;

describe("stable struct ids", () => {
  it("gives a struct the same id no matter what registered before it", () => {
    const a = new STRUCT();
    a.register(makeClass("Alpha", ALPHA));
    a.register(makeClass("Beta", BETA));
    a.register(makeClass("Gamma", GAMMA));

    const b = new STRUCT();
    b.register(makeClass("Gamma", GAMMA));
    b.register(makeClass("Alpha", ALPHA));

    expect(b.get_struct("Alpha").id).toBe(a.get_struct("Alpha").id);
    expect(b.get_struct("Gamma").id).toBe(a.get_struct("Gamma").id);
  });

  it("is what the registration counter is not: independent of the class set", () => {
    const withBeta = new STRUCT();
    withBeta.stableIds = false;
    withBeta.register(makeClass("Beta", BETA));
    withBeta.register(makeClass("Alpha", ALPHA));

    const withoutBeta = new STRUCT();
    withoutBeta.stableIds = false;
    withoutBeta.register(makeClass("Alpha", ALPHA));

    // The old scheme, kept reachable so the difference stays visible.
    expect(withBeta.get_struct("Alpha").id).not.toBe(withoutBeta.get_struct("Alpha").id);
  });

  it("keeps ids inside the reserved range, so a legacy id can never collide", () => {
    const id = stableStructId("Alpha");

    expect(id).toBeGreaterThanOrEqual(STABLE_ID_BASE);
    expect(id).toBeLessThan(STABLE_ID_LIMIT);

    // Registration-order ids are dense from zero; the reserved floor is what
    // keeps a file's legacy ids distinguishable from stable ones.
    expect(STABLE_ID_BASE).toBeGreaterThan(0xffff);
  });

  it("throws on a stable-id collision instead of sharing an id", () => {
    const s = new STRUCT();
    s.stableIdOverrides.Alpha = stableStructId("Beta");

    s.register(makeClass("Beta", BETA));
    expect(() => s.register(makeClass("Alpha", ALPHA))).toThrow(/collision/);
  });

  it("honors an override, so a collision is fixable without renaming a struct", () => {
    const s = new STRUCT();
    s.stableIdOverrides.Alpha = STABLE_ID_BASE + 7;

    s.register(makeClass("Alpha", ALPHA));
    expect(s.get_struct("Alpha").id).toBe(STABLE_ID_BASE + 7);
    expect(s.get_struct_id(STABLE_ID_BASE + 7).name).toBe("Alpha");
  });

  it("round-trips an abstract() field across two differently-ordered builds", () => {
    const BASE = `Base {
  tag : int;
}`;
    const DERIVED = `Derived {
  tag : int;
  extra : int;
}`;
    const HOLDER = `Holder {
  child : abstract(Base);
}`;

    function build(order: "forward" | "reverse"): {
      manager: STRUCT;
      Holder: StructableClass;
      Derived: StructableClass;
    } {
      const manager = new STRUCT();

      const Base = class {
        tag = 0;
        static structName = "Base";
        static STRUCT = BASE;
      };
      const Derived = class extends Base {
        extra = 0;
        static structName = "Derived";
        static STRUCT = DERIVED;
      };
      const Holder = class {
        child: unknown = undefined;
        static structName = "Holder";
        static STRUCT = HOLDER;
      };

      const classes = [Base, Derived, Holder] as unknown as StructableClass[];
      const padding = makeClass("Padding", `Padding {\n  n : int;\n}`);

      // The only difference between the two builds is what else is registered,
      // and when -- exactly the thing that used to move ids.
      if (order === "reverse") {
        manager.register(padding);
      }

      for (const cls of classes) {
        manager.register(cls);
      }

      return { manager, Holder: Holder as unknown as StructableClass, Derived: Derived as unknown as StructableClass };
    }

    const writer = build("forward");
    const reader = build("reverse");

    const holder = new (writer.Holder as unknown as new () => { child: unknown })();
    const child = new (writer.Derived as unknown as new () => { tag: number; extra: number })();
    child.tag = 3;
    child.extra = 11;
    holder.child = child;

    const bytes = writer.manager.write_object([] as number[], holder) as number[];

    // Read the writer's bytes with the reader's manager -- no schema handoff,
    // which is exactly the situation a spliced-in preserved payload is in.
    const view = new DataView(new Uint8Array(bytes).buffer);
    const out = reader.manager.read_object(view, reader.Holder) as { child: { tag: number; extra: number } };

    expect(out.child.constructor.name).toBe("Derived");
    expect(out.child.tag).toBe(3);
    expect(out.child.extra).toBe(11);
  });

  it("is on by default for the global manager", () => {
    expect(nstructjs.manager.stableIds).toBe(true);
    expect(nstructjs.manager.get_struct("Object").id).toBeGreaterThanOrEqual(STABLE_ID_BASE);
  });
});
