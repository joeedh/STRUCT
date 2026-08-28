# Unknown Classes

An application whose class set varies between runs — an editor with optional addons, say — will read
files that reference structs whose JS classes are not registered in the current build. Without a
hook, reading such a file throws `Unknown struct type <id>` (`abstract(...)` fields) or
`Unknown struct <name>` (bare struct fields), and there is no way to write the data back out
unchanged.

The `onUnknownClass` and `onSerializeUnknown` hooks cover the round trip. They are properties on a
manager instance, not top-level functions, and both are undefined by default, so a build that never
sets them behaves exactly as before.

```js
nstructjs.manager.onUnknownClass = (clsname, schema) => Placeholder;
nstructjs.manager.onSerializeUnknown = (obj) => obj?._origClsname;
```

## Reading: `onUnknownClass(clsname, schema)`

Invoked when the reader resolves a struct — by name or by the id stored in an `abstract(...)`
field — and finds no registered class for it. `clsname` is the struct name from the file, and
`schema` is the parsed `NStructInterface` the file's embedded scripts described.

Return a class to construct in place of the missing one. The reader still walks the _file's_ schema,
so every field the original class declared lands on the instance as a plain property under its
original name. Return `undefined` to fall through to the default error.

The reader also stamps `_origClsname` on the returned instance, which is what the write-side hook
reads back.

Two situations reach the hook, and both need `parse_structs` to have run over the file's embedded
scripts (see [Reading and Writing](Reading-And-Writing.md#handling-data-structure-changes)):

- The struct name is not in the manager at all.
- `parse_structs` created a throwaway dummy class for a struct that had no counterpart in the class
  list. A dummy is treated as missing whenever `onUnknownClass` is installed, so the host's
  placeholder is used rather than the dummy.

## Writing: `onSerializeUnknown(obj)`

Invoked at write time for every value packed into a struct-typed field. Return the struct name the
value should be written under, or `undefined` to leave the default behavior alone.

The two struct field types use the returned name differently, because they store different things:

- A bare `T` field writes no type information, so only the field layout is substituted: the value is
  packed against the named struct's schema.
- An `abstract(T)` field writes a struct id first, so both the id and the layout come from the named
  struct.

Container types (`array(T)`, `iter(T)`, `optional(T)`, `static_array[T, N]`) recurse into the same
two handlers, so a placeholder inside a container is covered by the same hook.

The bytes are identical to what a real instance of the named class would have produced, which is what
makes the round trip lossless.

## Worked example

A placeholder class carrying the original struct name plus whatever the schema described:

```js
class Placeholder {
  constructor(origClsname) {
    this._origClsname = origClsname;
  }

  loadSTRUCT(reader) {
    reader(this);
  }
}

const manager = nstructjs.manager;

manager.onUnknownClass = (clsname, schema) => Placeholder;
manager.onSerializeUnknown = (obj) => (obj instanceof Placeholder ? obj._origClsname : undefined);
```

Reading a file whose `unk.Gone` class this build never registered now produces a `Placeholder` with
`_origClsname === "unk.Gone"` and every one of `unk.Gone`'s fields attached, and writing that
`Placeholder` back out emits the same bytes the original class would have.

`newSTRUCT` is worth defining on a placeholder if its constructor takes arguments, since the reader
calls `new cls()` with none when there is no `newSTRUCT`:

```js
class Placeholder {
  static newSTRUCT() {
    return new Placeholder("");
  }
}
```

## Caveats

- The hooks live on a manager instance. Set them on `nstructjs.manager` for the global manager, or on
  the load-time manager created for reading a file with embedded scripts.
- `onSerializeUnknown` runs for every struct-typed value written, so keep it cheap and make it return
  `undefined` quickly for ordinary instances.
- The name returned by `onSerializeUnknown` must be registered in the writing manager. It is looked up
  with `get_struct`, which throws on an unknown name.
- A placeholder holds its fields as plain properties. Nothing type-checks them, and
  `validateStructs()` does not see them.
