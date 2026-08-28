# Migration

An app's data outlives its schema. A field gets renamed, a struct gets renamed, a value's meaning
changes. nstructjs has two independent mechanisms for this:

- **`migrateSTRUCT`/`getVersionSTRUCT`** — a static method pair for value-level changes: renaming a
  field, splitting or joining values, changing what a value means.
- **`addStructNameMigration`** — a table of struct renames, consulted by both the JSON and binary
  paths through the shared `structNameMigration` lookup.

Both are read by a version number the calling app supplies (or that a struct reports about itself
via `getVersionSTRUCT`) — nstructjs does not track versions on its own. See
[MigrateOptions](#migrateoptions) below for where that number comes from on each path.

## What's already handled without migration

A struct's _shape_ — which fields exist, their order, their types — does not need `migrateSTRUCT`
to survive a schema change, but the two serialization formats get there differently:

- **Binary** reads against the schema embedded in the file itself (see
  [Reading and Writing](Reading-And-Writing.md#handling-data-structure-changes)), not the current
  class's. A field the current class dropped is read and discarded; a field the current class added
  is simply never set, left at whatever the constructor initialized it to. No migration code runs
  for this.
- **JSON** has no embedded schema — `readJSON` always reads against the _current_ registered
  struct, matching JSON object keys to current field names. A field renamed since the JSON was
  written won't match anything and is silently skipped, so a field rename on the JSON path does
  need `migrateSTRUCT` to copy the old key's value into the new one before the read runs.

`migrateSTRUCT` is for what structural compatibility can't do on its own: renaming a field (JSON),
changing what a field's value means, splitting one field into two, or any other transform on
already-loaded data.

## migrateSTRUCT and getVersionSTRUCT

Both are static methods on a registered class, named through the manager's keyword table —
`migrateSTRUCT`/`getVersionSTRUCT` by default; a [`deriveStructManager`](Configuration.md) manager
with a different `script` keyword names them accordingly (`migrateSCHEMA`, `getVersionSCHEMA`, and
so on).

```js
class Person {
  firstName = "";
  lastName = "";

  loadSTRUCT(reader) {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    Person,
    `
    Person {
      firstName : string;
      lastName  : string;
    }
  `
  );

  // Called with the resolved version and the loaded data (a class instance
  // for binary, a plain object for JSON) once loading finishes. A third
  // argument is also available on the JSON path -- see "Continuing the walk"
  // under JSON below.
  static migrateSTRUCT(version, data) {
    if (version < 2) {
      // v1 stored a single "name" field.
      data.fullName = data.name;
      delete data.name;
    }
    if (version < 3) {
      // v2 stored "fullName"; v3 splits it into first/last.
      const parts = String(data.fullName ?? "").split(" ");
      data.firstName = parts[0] ?? "";
      data.lastName = parts.slice(1).join(" ");
      delete data.fullName;
    }
  }
}
```

Reading v1 data (`{ name: "Ada Lovelace" }`) with `version` `1` runs both `if` blocks in sequence
and lands on `{ firstName: "Ada", lastName: "Lovelace" }`; reading v2 data with `version` `2` runs
only the second. This is the pattern for stacking many versions' worth of fixups in one place: each
guard handles one historical step, and a struct that has been reshaped several times over just
carries more guards.

`getVersionSTRUCT(data)` lets a struct report its own version, read out of the data itself, instead
of trusting whatever version the caller passed in:

```js
static getVersionSTRUCT(data) {
  return data.schemaVersion ?? 1;
}
```

When present, its return value is what gets passed to `migrateSTRUCT` — a caller-supplied version
is only the fallback for a struct that doesn't self-report. This matters most for a struct nested
inside a larger document: the outer version the caller passed to `readJSON`/`readObject` may not
match this particular struct's own history.

## JSON

Migration on the JSON path is a separate pass, run _before_ the read: `migrateJSON` walks the raw
JSON tree, mutating it in place, and only once that's done does the normal `readJSON` field-by-field
read run against the (now-current-shaped) data.

```js
nstructjs.migrateJSON(json, Person, { version: 1 });
// json is now { firstName: "Ada", lastName: "Lovelace" }
```

`readJSON`'s third argument runs the same pass for you, in place, ahead of the read:

```js
const person = nstructjs.readJSON(json, Person, { version: 1 });
```

Omit it and no migration runs at all, even if `Person` declares `migrateSTRUCT` — migration on the
JSON path is opt-in per call, not automatic.

### MigrateOptions

```ts
interface MigrateOptions {
  version: number;
  warnMissing?: boolean; // default true
  reporter?: (s: string) => void; // default console.log
}
```

`version` is the version the data being read is at — usually a number the app already stores
alongside the data (a file format version, a document version field, an app release number).
`warnMissing` controls whether a struct or field that can't be resolved during the walk logs a
warning; `reporter` is where that warning (and nothing else) goes.

### Continuing the walk: the finisher argument

`migrateJSON` doesn't stop at one struct — once a struct's own `migrateSTRUCT` has run, the walk
continues into that struct's own struct-typed fields (a direct struct reference, an `abstract(...)`,
or an array/`iter`/`optional` of one), migrating each in turn against the current schema. A struct
with no `migrateSTRUCT` gets this for free.

A struct that _does_ define `migrateSTRUCT` takes over that continuation. It's called with a third
argument, the finisher:

```ts
type StructMigrateFinisher = (excludeFields?: string[]) => void;
```

Calling it resumes the walk into this struct's own struct-typed fields, exactly as if no
`migrateSTRUCT` had been defined. Not calling it stops the walk here — any nested struct fields are
left as whatever they already were, but no chain runs on them. So the finisher isn't optional
cleanup; a `migrateSTRUCT` that forgets to call it silently cuts the walk short at that struct, which
is a behavior change from having no `migrateSTRUCT` at all.

```js
static migrateSTRUCT(version, data, migrate) {
  if (version < 2) {
    // v1 stored the icon under a struct-typed "iconData"; move it to "icon".
    data.icon = data.iconData;
    delete data.iconData;
  }

  // "icon" was just populated by hand above; the generic walk has nothing
  // left to do to it, so leave it out.
  migrate(['icon']);
}
```

`excludeFields` names fields to leave out of this call's continuation — typically a field the
`migrateSTRUCT` body already reshaped directly, so the generic walk doesn't also process it.

#### Chaining up a class hierarchy

A subclass overriding `migrateSTRUCT` chains to its parent's by calling `super.migrateSTRUCT`, passing
the finisher through. To add its own exclusions on top, wrap it in a closure rather than calling it
directly, since a bare `migrate` doesn't compose with a second exclusion list of its own:

```js
class Shape {
  static migrateSTRUCT(version, data, migrate) {
    if (version < 2) {
      data.style = data.style ?? "solid";
    }
    migrate();
  }
}

class Widget extends Shape {
  static migrateSTRUCT(version, data, migrate) {
    if (version < 3) {
      data.icon = data.iconData;
      delete data.iconData;
    }
    super.migrateSTRUCT(version, data, () => migrate(['icon']));
  }
}
```

#### Binary doesn't pass a finisher yet

Binary's `read_object` currently calls `migrateSTRUCT` with just `(version, obj)` — the third
argument is `undefined` there. This is provisional, not a permanent difference between the two
paths: binary's implementation of the finisher isn't finished, and it's expected to gain one that
matches the JSON side. For now, each nested struct field already runs its own `read_object` (and its
own `migrateSTRUCT`) before the struct containing it finishes loading and runs its own, so the walk
into nested structs already happens depth-first, without needing a finisher to drive it.

Until that lands, a `migrateSTRUCT` shared between both paths (registered on a class that's read both
ways) can't call the finisher unconditionally — `migrate()` throws when `migrate` is `undefined`.
Either guard the call (`migrate?.(...)`), or, if the class is only ever read as JSON, call it
unconditionally as above.

## Binary

Binary has no equivalent separate pass — the unpack codegen needs the file's own field layout to
know how many bytes to consume, so there's no raw-data stage to migrate ahead of the read the way
JSON has. Migration happens in place, during the read itself: once a struct's own fields (and any
nested structs, each already migrated by its own read) have finished loading,
`readObject`/`read_object` calls that struct's `migrateSTRUCT` before returning it. A struct nested
several levels deep migrates before the struct that contains it does.

```js
const person = nstructjs.readObject(view, Person, undefined, 1);
```

The fourth argument seeds the version used for the top-level struct (and for any nested struct that
doesn't report its own version via `getVersionSTRUCT`). Passing it explicitly only matters when
calling `readObject` directly; see below for the common case.

### FileHelper wires this up automatically

An app using [`FileHelper`](Reading-And-Writing.md#handling-data-structure-changes) — embedding
`write_scripts()` output in the file and reading it back into a fresh manager — doesn't need to pass
a version to `readObject` by hand. `FileHelper.read()` reads the file's own version header
(`major.minor.micro`, folded into a single integer) and threads it through both the struct-rename
resolution below and each block's `migrateSTRUCT`/`getVersionSTRUCT` chain. Bump the version passed
to `FileHelper`'s constructor when the schema changes, and both existing mechanisms — struct-shape
compatibility and value migration — line up against it.

Reading through a hand-rolled `parse_structs`/`readObject` pair (see
[Reading and Writing](Reading-And-Writing.md#reading-saved-struct-scripts)) instead of `FileHelper`
means threading the version yourself: pass it to `parse_structs` for struct-rename resolution and to
`readObject` for the migration chain.

## Struct renames

A struct's own name can change too — `addStructNameMigration` records that, and both the JSON and
binary paths resolve it through the same `structNameMigration` lookup: JSON where a polymorphic
`abstract(...)` field's stored type name is read, binary in `parse_structs`, where a file's embedded
scripts are matched against the classes currently registered.

```js
nstructjs.manager.addStructNameMigration(2, "app.Widget", "app.Thing");
```

`addStructNameMigration(V, oldName, newName)` means "renamed as of version `V`": data reporting a
version older than `V` still has `oldName` and gets translated to `newName`; data at `V` or newer is
assumed to already use `newName`; nothing further happens to it.

Register the rename once, on the manager the reading classes are registered on (normally
`nstructjs.manager`) — not per file, per read, or on a throwaway manager built for one file.

### Chaining through more than one rename

Each call registers one historical step, not a mapping straight to whatever the current name
happens to be. A struct renamed twice —

```js
nstructjs.manager.addStructNameMigration(2, "app.Widget", "app.Gadget");
nstructjs.manager.addStructNameMigration(3, "app.Gadget", "app.Thing");
```

— resolves data reporting version 1 all the way to `app.Thing`: `structNameMigration` looks up
`app.Widget`, gets `app.Gadget`, looks that up in turn, gets `app.Thing`, and stops once nothing
further matches.

### Name reuse

A name freed by one rename can legitimately become another struct's old name later —
`a`&nbsp;→&nbsp;`b` at version 2, then a _different_ struct renamed `e`&nbsp;→&nbsp;`a` at version 5. `addStructNameMigration` allows this: the guard against duplicate registrations only rejects
registering the same old name twice _at the same version_, which would otherwise silently overwrite
one target with another.

Reused names can chain back on themselves — resolving `a` might reach `e`, and resolving `e` might
reach back to `a`. Chaining stops the moment a lookup would revisit a name already seen in that same
resolution, rather than looping, and returns the last name reached.

### If nothing matches

A struct name with no registered class and no applicable rename falls back to a throwaway
placeholder class during `parse_structs` (binary) — reading into it discards the field values unless
the [unknown-class hooks](UnknownClasses.md) are installed. This is the same fallback an
unregistered struct name hits with no renames involved at all; a missing `addStructNameMigration`
entry looks the same as a struct that was simply never registered.

## Putting it together

A struct that has both changed shape and changed name combines both mechanisms — the rename gets
the reader to the right class, `migrateSTRUCT` reshapes the data once it's there:

```js
class Thing {
  firstName = "";
  lastName = "";

  loadSTRUCT(reader) {
    reader(this);
  }

  static STRUCT = nstructjs.inlineRegister(
    Thing,
    `
    app.Thing {
      firstName : string;
      lastName  : string;
    }
  `
  );

  static migrateSTRUCT(version, data) {
    if (version < 2) {
      const parts = String(data.name ?? "").split(" ");
      data.firstName = parts[0] ?? "";
      data.lastName = parts.slice(1).join(" ");
      delete data.name;
    }
  }
}

// app.Widget carried a single "name" field; it was renamed to app.Thing at
// version 2, and Thing's own fields changed at the same time.
nstructjs.manager.addStructNameMigration(2, "app.Widget", "app.Thing");
```

Reading a version-1 file through `FileHelper` resolves `app.Widget` to `Thing` via the rename table,
then runs `migrateSTRUCT` on the loaded instance to split its old `name` field.
