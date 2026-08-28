# nstructjs Documentation

**nstructjs** is a [ProtoBuf-like](https://developers.google.com/protocol-buffers/docs/overview)
serialization system for JavaScript and TypeScript. Unlike ProtoBuf or JSON, it serializes and
deserializes your existing class instances directly, without building intermediary objects or
generating classes for you. It supports both a compact binary format and a JSON format.

This folder is the canonical, maintained documentation for nstructjs. (The old GitHub wiki is
deprecated and now just points here.)

## Contents

- [Introduction and Examples](Intro-and-Examples.md) — what nstructjs is and how to register and
  serialize a class.
- [Reading and Writing](Reading-And-Writing.md) — the binary read/write API and how to embed
  STRUCT scripts in a file for forward/backward compatibility.
- [JSON](JSON.md) — the JSON serialization API.
- [JSON Guide](jsonGuide.md) — deep-dive on the JSON data model, type mappings, polymorphism, and
  validation.
- [Migration](migrationGuide.md) — `migrateSTRUCT`/`getVersionSTRUCT`, `addStructNameMigration`, and
  how a changed schema or a renamed struct is handled on the binary and JSON paths.
- [Helper Scripts](HelperScripts.md) — the `| jscode` mechanism, per-item array maps, and the `this`
  field.
- [Unknown Classes](UnknownClasses.md) — reading and rewriting structs whose JS class this build
  doesn't have, via `onUnknownClass` / `onSerializeUnknown`.
- [Configuration](Configuration.md) — custom-keyword managers, struct ids, registration options,
  diagnostics, and `useTinyEval`.
- [Specification](Specification.md) — the STRUCT DSL grammar and the binary format spec.
- [Documentation Audit](AUDIT.md) — record of how this documentation was reconciled against the
  source code.

## Quick start

```js
import * as nstructjs from "nstructjs";

class Point {
  x = 0;
  y = 0;

  loadSTRUCT(reader) {
    reader(this); // fills this.x and this.y
  }
}

Point.STRUCT = nstructjs.inlineRegister(
  Point,
  `
  Point {
    x : float;
    y : float;
  }
`
);

const p = new Point();
p.x = 1.5;
p.y = -2.0;

// Binary round-trip
const bytes = nstructjs.writeObject([], p);
const view = new DataView(new Uint8Array(bytes).buffer);
const p2 = nstructjs.readObject(view, Point);

// JSON round-trip
const json = nstructjs.writeJSON(p);
const p3 = nstructjs.readJSON(json, Point);
```

## Public API at a glance

Registration:

- `register(cls, structName?)` — register a class that has a static `STRUCT` script.
- `inlineRegister(cls, structScript)` — register inline; returns the script for assignment to a
  static `STRUCT` field. Handles inheritance automatically.
- `unregister(cls)`, `isRegistered(cls)`, `setAllowOverriding(t)` — see
  [Configuration](Configuration.md#registration).
- `deriveStructManager(keywords?)` — create a `STRUCT` manager _class_ with custom keywords; see
  [Configuration](Configuration.md#derivestructmanagerkeywords).
- `inherit(child, parent, structName?)` — **deprecated**; use `inlineRegister` instead.

Binary serialization:

- `writeObject(data, obj)` — append the serialized bytes of `obj` to the array `data`; returns
  `data`.
- `readObject(data, cls, uctx?, version?)` — read an instance of `cls` from a `DataView` /
  `Uint8Array` / `number[]`; `version` seeds `migrateSTRUCT`/`getVersionSTRUCT`, see
  [Migration](migrationGuide.md#binary).

JSON serialization:

- `writeJSON(obj)` — serialize to a plain JSON object.
- `readJSON(json, classOrStructId, migrate?)` — read an instance back from JSON; `migrate` runs
  `migrateJSON` in place before the read, see [Migration](migrationGuide.md#json).
- `formatJSON(json, cls, addComments?, validate?)` — pretty-print/validate JSON.
- `validateJSON(json, cls, useInternalParser?, printColors?, logger?)` — validate JSON against a
  struct.

Schema / file compatibility:

- `write_scripts(manager?, includeCode?)` — produce ID-stamped STRUCT scripts to embed in a file
  so the `abstract` keyword survives registration-order changes.
- `validateStructs(onerror?)` — validate all registered structs; see
  [Configuration](Configuration.md#validatestructsonerror).

Migration ([details](migrationGuide.md)):

- `migrateJSON(json, cls, options)` — apply `migrateSTRUCT` to a JSON tree in place, ahead of a read.
- `manager.addStructNameMigration(version, oldName, newName)` /
  `manager.structNameMigration(version, name)` — register and resolve struct renames, shared by the
  binary and JSON paths.

Configuration ([details](Configuration.md)):

- `setEndian(littleEndian)` / `getEndian()` — control binary byte order (default little-endian).
- `truncateDollarSign(value?)` — intended to strip bundler-mangled suffixes (e.g. `Mesh$1` →
  `Mesh`); currently a no-op, see [Configuration](Configuration.md#truncatedollarsignvalue).
- `setDebugMode(level)` / `setWarningMode(level)`.
- `useTinyEval()` — use the bundled sandboxed evaluator instead of `eval()`.

Hooks (set on the `manager` / a derived `STRUCT`) — see [Unknown Classes](UnknownClasses.md):

- `onUnknownClass(clsname, schema)` — supply a constructor when a field references a struct whose JS
  class isn't currently registered.
- `onSerializeUnknown(obj)` — companion hook that names the struct such a placeholder is written
  back under.

Submodules re-exported from the package: `binpack`, `parser`, `parseutil`, `filehelper`.
