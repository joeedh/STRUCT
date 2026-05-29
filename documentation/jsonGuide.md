# JSON Guide

A deep-dive on how nstructjs serializes to and from JSON. For the short API reference see
[JSON.md](JSON.md); this guide explains the data model, the type mappings, polymorphism, validation,
and how the JSON path differs from the binary format.

nstructjs has two serialization back-ends that share the **same registered classes and STRUCT
scripts**:

- the compact **binary** format (`writeObject` / `readObject`), and
- the **JSON** format (`writeJSON` / `readJSON`).

You register a class once; both formats are then available. The JSON format trades the binary
format's compactness for human readability, easy diffing, and interoperability with anything that
speaks JSON.

## API at a glance

| Function | Purpose |
|----------|---------|
| `nstructjs.writeJSON(obj)` | Serialize a registered instance to a **plain JS object** (not a string). |
| `nstructjs.readJSON(json, classOrStructId)` | Reconstruct an instance from a parsed JSON object. |
| `nstructjs.formatJSON(json, cls, addComments?, validate?)` | Pretty-print JSON with optional field comments and validation. |
| `nstructjs.validateJSON(json, cls, useInternalParser?, printColors?, logger?)` | Validate a JSON payload against a struct, with rich error context. |

All four are thin wrappers (`src/structjs.ts`) over methods on the global `manager` singleton
(`src/struct_intern.ts`).

> **`writeJSON` returns an object, not a string.** Call `JSON.stringify(nstructjs.writeJSON(obj))`
> yourself when you need text. Likewise, `readJSON` expects an already-parsed object — feed it
> `JSON.parse(text)`, not the raw text.

## A minimal round-trip

```js
import * as nstructjs from "nstructjs";

class Point {
  x = 0;
  y = 0;

  loadSTRUCT(reader) {
    reader(this); // fills this.x and this.y
  }
}

Point.STRUCT = nstructjs.inlineRegister(Point, `
  Point {
    x : float;
    y : float;
  }
`);

const p = new Point();
p.x = 1.5;
p.y = -2.0;

const json = nstructjs.writeJSON(p);     // { x: 1.5, y: -2 }
const text = JSON.stringify(json);        // store / transmit this
const p2 = nstructjs.readJSON(JSON.parse(text), Point); // a real Point instance
```

`readJSON` produces a genuine `Point` — it runs the constructor and calls `loadSTRUCT`, exactly like
the binary path. The reconstructed object is not a plain bag of properties.

## How it works internally

Both directions walk the struct's parsed field descriptors (`stt.fields`) and dispatch each field to
its field-type handler in `src/struct_intern2.ts`. Every `StructFieldType` subclass implements four
JSON methods alongside its binary `pack`/`unpack`:

- `toJSON(manager, val, obj, field, type)` — value → JSON-compatible value (used by `writeJSON`).
- `fromJSON(manager, val, obj, field, type, instance)` — JSON value → runtime value (used by `readJSON`).
- `validateJSON(...)` — return `true` if the JSON value is acceptable, or an error string.
- `formatJSON(...)` — render the value as pretty-printed text.

The default base-class `toJSON`/`fromJSON` are identity functions (`return val`), so primitives pass
straight through to the native JSON types. Container and reference types override them to recurse.

`writeJSON` (in `struct_intern.ts`) loops over the fields, reads each value off the instance
(honoring `get`/`set` accessors when a field uses helper JS), and assigns `json[field.name] =
toJSON(...)`. `readJSON` builds a `loader` closure that the class's `loadSTRUCT`/`newSTRUCT` calls;
the loader assigns `obj[field.name] = fromJSON(...)` for each field.

## Type mapping

How each STRUCT DSL type appears in JSON:

| DSL type | JSON representation | Notes |
|----------|--------------------|-------|
| `int`, `uint`, `short`, `ushort`, `byte` | number | Validated as integers (`val === Math.floor(val)`). |
| `float`, `double` | number | Plain JS numbers; `float` is **not** rounded to 32-bit in JSON (unlike binary). |
| `bool` | `true` / `false` | |
| `string` | string | |
| `static_string[N]` | string | Length cap applies on the binary side; JSON stores the string as-is. |
| `array(T)`, `iter(T)`, `iterkeys(T)` | JSON array | Each element recursively converted via `T`'s handler. |
| `static_array[T, N]` | JSON array | |
| a struct reference (e.g. `Point`) | nested JSON object | Recurses through that struct's fields. |
| `abstract(Base)` / `abstract(Base, "key")` | nested object **plus a type tag** | See [Polymorphism](#polymorphism-abstract-types). |
| `optional(T)` | the value, or `null` when absent | See [Optional fields](#optional-fields). |

### Numbers and precision

JSON has a single numeric type (IEEE-754 double). Integer types are validated to be whole numbers,
and `double` round-trips exactly. A `float` field, however, is stored as a full-precision JS number
in JSON, whereas the binary format truncates it to 32 bits — so the two formats are **not
bit-identical** for `float` fields. If you need cross-format determinism, prefer `double`.

## Nested structs

A field that references another registered struct serializes as a nested object. Given:

```js
class Line {
  a = new Point();
  b = new Point();
  loadSTRUCT(reader) { reader(this); }
}
Line.STRUCT = nstructjs.inlineRegister(Line, `
  Line {
    a : Point;
    b : Point;
  }
`);
```

`writeJSON(new Line())` yields:

```json
{ "a": { "x": 0, "y": 0 }, "b": { "x": 0, "y": 0 } }
```

`readJSON` reconstructs each nested `Point` as a real instance (it calls `manager.readJSON`
recursively for the referenced struct).

## Arrays

`array(T)`, `iter(T)`, `iterkeys(T)`, `static_array[T, N]` all emit JSON arrays, converting each
element through `T`'s handler. So `array(int)` → `[1, 2, 3]`, and `array(Point)` →
`[{ "x": 1, "y": 2 }, ...]`. On read-back, array fields are reconstructed element-by-element, with
nested structs rebuilt as instances.

```
json.JWithArray {
  numbers : array(int);
  points  : array(json.JPoint);
}
```

```json
{ "numbers": [1, 2, 3], "points": [{ "x": 1, "y": 2 }, { "x": 3, "y": 4 }] }
```

## Polymorphism: `abstract` types

`abstract(Base)` lets a field hold any subclass of `Base`. In JSON, the concrete type must be
recorded so `readJSON` knows which class to instantiate. nstructjs writes that type as a string field
**inside the object** — the *type discriminator*.

By default the discriminator key is `_structName`. You can pick a different key by passing a second
argument to `abstract`:

```
json.Holder {
  item : abstract(json.Base);          // type stored under "_structName"
  node : abstract(json.Base, "type");  // type stored under "type"
}
```

Serializing a `Holder` whose `item` is a `JDerived` instance produces:

```json
{
  "item": {
    "baseVal": 10,
    "derivedVal": 777,
    "_structName": "json.JDerived"
  }
}
```

On read-back (`StructTStructField.fromJSON`), nstructjs reads the discriminator key, looks up the
named struct, and reconstructs the correct subclass — so `restored.item instanceof JDerived` holds.
The discriminator is the **registered struct name** (including its namespace, e.g.
`json.JDerived`), not the JS class name.

`validateJSON` additionally checks that the named type is actually a subclass of the declared base;
otherwise it reports `"<name> is not a child class off <base>"`.

> The discriminator key is per-field, fixed at parse time (`src/struct_parser.ts`,
> `p_Abstract`). The binary format identifies the concrete type by numeric struct id instead of a
> name string — that's the main structural difference between the two formats for abstract fields.

## Optional fields

`optional(T)` (or the `name ?: T` shorthand) maps a missing value to JSON `null`:

```
json.JOptional {
  present ?: double;
  missing ?: double;
}
```

With `present = 99.5` and `missing = undefined`:

```json
{ "present": 99.5, "missing": null }
```

On read-back, a `null` optional becomes `undefined` again; a present value is read through `T`'s
handler. (Binary uses a leading presence flag instead of `null`.)

## The `this` field

If a struct names a field `this`, that field is serialized against the whole object rather than a
named property. For a scalar/struct `this`, `writeJSON` merges the produced object's keys into the
parent (`Object.assign`); for an array-typed `this`, it writes `length` plus numeric index keys.
This mirrors the binary behavior and is mainly used for wrapping array-like or transparent objects.

## Validation

`validateJSON(json, cls)` returns `true`/`false` and, on failure, logs a contextual error. Internals
(`struct_intern.ts`):

1. The payload is `JSON.stringify`-ed and re-parsed with nstructjs's **internal JSON parser**
   (`src/struct_json.ts`), which attaches source-position token info to every object/array via a
   `TokSymbol` symbol.
2. Each field is checked through its handler's `validateJSON`.
3. On error, `printContext` prints the offending region of the pretty-printed JSON with the line
   highlighted and a caret under the column — which is why the internal parser is used by default
   (`useInternalParser = true`). Pass `false` to use the native `JSON.parse` (faster, but no
   positional error context).

Validation catches:

- **Missing fields** — `"<struct>: Missing json field <name>"`.
- **Wrong types** — e.g. `"<value> is not an integer"`, `"Not a float: <value>"`.
- **Unknown fields** — any JSON key not in the struct: `"<struct>: Unknown json field <key>"`.
- **Bad polymorphic types** — a discriminator naming a non-subclass.

You can redirect output by passing a custom `logger`, and disable ANSI colors with
`printColors = false`.

```js
const json = nstructjs.writeJSON(obj);
if (!nstructjs.validateJSON(json, MyClass)) {
  // error already logged with context
}
```

## Pretty-printing with `formatJSON`

`formatJSON(json, cls, addComments = true, validate = true)` returns a formatted **string**. Unlike
`JSON.stringify`, it walks the struct definition, so it can interleave the field comments from your
STRUCT script:

```
MyClass {
  count : int;   /* number of items */
}
```

```js
nstructjs.formatJSON(nstructjs.writeJSON(obj), MyClass);
```

```jsonc
{
  count: 5, /* number of items */
}
```

Comments are emitted only for value-typed (scalar) fields. By default `formatJSON` validates first;
pass `validate = false` to skip that. Note the output is comment-annotated, JSON-ish text intended
for humans/logs — round-trip with `writeJSON`/`readJSON`, not by parsing `formatJSON`'s output.

## Reading by struct id or schema

`readJSON` (and `validateJSON`) accept the target as a JS class, a numeric struct id, or an
`NStructInterface` schema object. The numeric-id form is useful when dispatching generically from a
file whose schema you've loaded:

```js
nstructjs.readJSON(json, structId);          // by numeric id
nstructjs.readJSON(json, MyClass);           // by class (typical)
```

## JSON vs binary: what differs

| Aspect | JSON | Binary |
|--------|------|--------|
| Output | plain JS object (stringify yourself) | `number[]` of bytes |
| `float` precision | full JS-number precision | truncated to 32-bit |
| Abstract type tag | struct **name** string inside the object | numeric struct **id** |
| Optional absence | `null` | presence flag byte |
| Readability / diffing | yes | no |
| Embedded schema (`write_scripts`) | not used | used for forward/backward compat |
| `onUnknownClass`/`onSerializeUnknown` hooks | n/a (JSON resolves by name) | supported |

Both paths reconstruct real class instances via `loadSTRUCT`/`newSTRUCT`, share the same field
descriptors, and respect inheritance registered through `inlineRegister`.

## Related source

- `src/struct_intern.ts` — `writeJSON`, `readJSON`, `validateJSON`, `formatJSON` on the manager.
- `src/struct_intern2.ts` — per-field `toJSON` / `fromJSON` / `validateJSON` / `formatJSON` handlers.
- `src/struct_json.ts` — the internal JSON parser and `printContext` error rendering.
- `src/struct_parser.ts` — `abstract(...)` discriminator-key parsing (`p_Abstract`).
- `tests/json_roundtrip.test.ts` — runnable examples for every case above.

See also: [Specification](Specification.md) for the full DSL grammar, and
[Reading and Writing](Reading-And-Writing.md) for the binary API.
