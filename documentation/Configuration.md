# Configuration and Manager Options

The top-level configuration functions all act on the global `nstructjs.manager` or on module-level
state. Settings that belong to a single manager (struct ids, the unknown-class hooks, overriding) are
properties on the instance instead.

## Managers

`nstructjs.manager` is the global `STRUCT` instance that `register`, `writeObject`, `readJSON`, and
the rest of the top-level functions operate on. A second manager is useful when reading a file whose
own STRUCT scripts describe a different schema than the current build's:

```js
const load_manager = new nstructjs.STRUCT();
load_manager.parse_structs(scripts);
```

### deriveStructManager(keywords?)

Returns a **subclass** of `STRUCT` whose DSL keywords are renamed, for hosting nstructjs alongside
another system that already claims `STRUCT` on its classes, or for a second independent schema in the
same application. It returns a class, so instantiate it before use:

```js
const AltSTRUCT = nstructjs.deriveStructManager({ script: "SCHEMA" });
const alt = new AltSTRUCT();

class Point {
  static SCHEMA = "Point {\n  x : float;\n}";
  loadSCHEMA(reader) {
    reader(this);
  }
}

alt.register(Point);
```

`keywords.script` is the only required field; the rest default from it:

| Keyword | Default | Names |
|---|---|---|
| `script` | `"STRUCT"` | The static field holding the DSL script. |
| `name` | `script.toLowerCase() + "Name"` | The static field the resolved struct name is written to. |
| `load` | `"load" + script` | The instance method that receives the reader continuation. |
| `new` | `"new" + script` | The static allocator. |
| `from` | `"from" + script` | The deprecated `fromSTRUCT` allocator. |

A renamed keyword set is honored everywhere the default one is, `isRegistered` included.

`new nstructjs.STRUCT()` is the same thing with the default keywords.

## Struct ids

Struct ids identify a struct inside a file — `abstract(...)` fields write one, and
`write_scripts()` stamps one on every struct it emits.

- `manager.stableIds` (default `true`) derives each id from the struct's name with an FNV-1a hash,
  folded into the reserved range `[0x100000, 0x7fffffff)`. Two builds that register different sets of
  classes then agree on every id.
- `manager.stableIdOverrides` maps a struct name to a pinned id. Registration throws on a stable-id
  collision rather than letting two structs share an id, and pinning one of the pair here resolves it
  without renaming a struct (which would break existing files).
- Setting `manager.stableIds = false` restores the old registration-counter ids, which are dense from
  zero. The reserved floor keeps those distinguishable from stable ids, so a file written under the
  old scheme still reads.

Changing `stableStructId` changes every id in every newly written file. It is part of the format.

## Registration

### setAllowOverriding(t)

Controls what happens when a struct name is registered twice. With overriding allowed (the default)
the second registration is ignored and the first definition stands; with it disabled, the second
registration throws. Either way a warning is logged when the warning level is above zero.

Turn it off in a build where a duplicate name means a real mistake:

```js
nstructjs.setAllowOverriding(false);
```

Note that the *first* registration wins in both modes — this is not a "last definition replaces the
earlier one" switch.

### isRegistered(cls)

True when `cls` is the class currently registered under its own struct name. A class that merely
carries a `STRUCT` script, one whose name was later claimed by a different class, or a subclass
inheriting a registered parent's struct name, all report `false`. The name is read through the
manager's keyword table, so a derived manager reports on the keyword it was given.

### unregister(cls)

Removes a class from the manager. Registering a replacement afterward is what actually swaps a
definition, since `register` alone leaves the first one in place.

### validateStructs(onerror?)

Walks every registered struct and reports two kinds of error:

- A field named `this` declared with a value type (`int`, `float`, `string`, and the rest), which has
  nothing to unpack into.
- A `T` or `abstract(T)` field — at any array/iter/static_array nesting depth — naming a struct that
  is not registered.

Without a callback it logs the formatted struct and throws on the first error. With one it calls
`onerror(msg, stt, field)` and keeps going, which is what you want for reporting every problem at
startup:

```js
const errors = [];
nstructjs.validateStructs((msg) => errors.push(msg));
```

Call it after all registration is complete — a forward reference to a class registered later is
indistinguishable from a genuine typo.

## Diagnostics

### setDebugMode(level)

Any nonzero level turns on the packer trace: every field written or read logs its type and value to
the console, indented by nesting depth. It also disables the bulk fast paths for primitive arrays, so
the trace covers every element. Expect the output to be large and the throughput to drop
substantially — this is a debugging aid, not something to leave on.

```js
nstructjs.setDebugMode(1);
```

### setWarningMode(level)

Sets the verbosity of nstructjs's own warnings. It throws on a non-number argument.

| Level | Effect |
|---|---|
| `0` | Silent. |
| `1` | Duplicate-registration warnings, missing structs during `parse_structs`, deprecation notices for `Super` and `chain_fromSTRUCT`. |
| `2` (default) | Also the `fromSTRUCT`-is-deprecated notice. |

Level `0` is the setting for a production build that has already validated its schema.

### truncateDollarSign(value?)

Intended to strip a bundler-mangled suffix from a struct name, so `Mesh$1` registers as `Mesh`. It
defaults to on.

The current implementation does not truncate anything: it locates the `$` with `String.search`, which
treats its argument as a regular expression, and `/$/` matches the end of the string. Do not rely on
the flag in either position — declare the struct name explicitly in the DSL script rather than
letting it come from a mangled class name.

## Evaluation

### useTinyEval()

Replaces `eval` with the bundled tinyeval interpreter for all generated code — the pack/unpack
functions and [helper scripts](HelperScripts.md). Use it where a Content Security Policy forbids
`eval` and `new Function`, such as a browser extension or a page served with a strict `script-src`.

```js
nstructjs.useTinyEval();
```

Call it before registering classes. It is a global switch with no counterpart to restore `eval`, and
interpreted code is slower than a compiled function, so leave it off where `eval` is available.

## Byte order

`setEndian(littleEndian)` sets the byte order for binary reading and writing and returns the previous
setting; `getEndian()` reports the current one. The default is little-endian. Set it once,
consistently, for both ends of a given file — see
[Specification](Specification.md#endianness).
