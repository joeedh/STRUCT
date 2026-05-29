# AGENTS.md

## Project Overview

nstructjs is a ProtoBuf-like binary serialization library for JavaScript/TypeScript.
It serializes and deserializes objects directly using a custom DSL for struct definitions,
with dynamic code generation for performance. Unlike Protocol Buffers or JSON serialization,
nstructjs works directly with class instances without intermediate representations.

**Repository:** https://github.com/joeedh/STRUCT
**Author:** Joseph Eagar
**License:** Unlicense

## Architecture

### Core Modules (in `src/`)

| Module | Purpose |
|--------|---------|
| `structjs.ts` | Public API entry point; re-exports all public functions |
| `types.ts` | TypeScript interfaces and type definitions |
| `struct_intern.ts` | `STRUCT` manager class — registration, read/write dispatch |
| `struct_intern2.ts` | Type packing/unpacking handlers and code generation |
| `struct_parser.ts` | Parses the STRUCT DSL into field descriptors |
| `struct_parseutil.ts` | Lexer and parser utilities used by the DSL parser |
| `struct_binpack.ts` | Low-level binary encoding/decoding (int, float, UTF-8) |
| `struct_json.ts` | JSON serialization path and validation |
| `struct_filehelper.ts` | File I/O helpers and struct versioning |
| `struct_util.ts` | General utilities (color formatting, etc.) |
| `struct_eval.ts` | Wrapper around `eval()` for generated pack/unpack code |
| `struct_global.ts` | Global state and DEBUG flag |
| `polyfill.ts` | Array/String polyfills |

### Key Abstractions

- **`StructManager`** (`struct_intern.ts`): Central registry. All structs are registered here.
  Manages struct IDs, name resolution, and dispatches serialization.
- **`NStructInterface`** (`types.ts`): Internal representation of a registered struct —
  name, numeric ID, field list, and generated pack/unpack functions.
- **`StructFieldTypeClass`** (`struct_intern2.ts`): Abstract handler for a single field type
  (int, float, array, etc.). Each type has its own subclass that generates packing code.
- **`StructEnum`** (`types.ts`): Enum of all supported primitive and composite types
  (INT, FLOAT, DOUBLE, STRING, STRUCT, ARRAY, OPTIONAL, etc.).
- **`TypeDescriptor`** (`types.ts`): Union type describing field types, supporting nesting
  (e.g., `array(array(int))`).

### How Serialization Works

1. **Registration:** User defines a class with a static `STRUCT` string (the DSL script)
   and calls `manager.register(MyClass)` or uses `inlineRegister()`.
2. **Parsing:** The DSL parser (`struct_parser.ts`) tokenizes and parses the struct script
   into an `NStructInterface` with typed field descriptors.
3. **Code Generation:** For each struct, JavaScript source for `pack()` and `unpack()`
   functions is generated from the field descriptors and compiled via `eval()`.
4. **Serialization:** `manager.write_object()` writes an object to a `number[]` buffer.
   `manager.read_object()` reads it back from a `DataView`. JSON paths also available.

### STRUCT DSL

```
namespace.ClassName {
  fieldName : type;
  optionalField : optional(int);
  nestedArray : array(array(float));
  reference : ClassName2;
}
```

Supported types: `int`, `uint`, `float`, `double`, `string`, `static_string[N]`,
`byte`, `short`, `ushort`, `bool`, `array(T)`, `iter(T)`, `iterkeys(T)`,
`static_array[T, N]`, `optional(T)`, and struct references by name.

## Build System

- **Bundler:** Rollup with multiple config files for different output formats.
- **Build script:** `tools/build.sh` generates all variants into `build/`.
- **Output formats:**
  - `nstructjs.js` — standard bundle
  - `nstructjs_es6.js` — ES6 module
  - `nstructjs_tinyeval.js` — no-eval variant
  - `nstructjs_configurable.js` — with configurable code generation
  - `nstructjs_configurable_noeval.js` — configurable, no eval

## Testing

- **Framework:** Vitest
- **Run tests:** `npm test` (or `npx vitest run`)
- **Type check:** `npm run typecheck` (runs `tsc --noEmit`)
- **Test files** (in `tests/`):
  - `binary_roundtrip.test.ts` — binary pack/unpack for all types
  - `json_roundtrip.test.ts` — JSON serialization path
  - `cross_format.test.ts` — binary-to-JSON and JSON-to-binary conversion
  - `utf8.test.ts` — UTF-8 edge cases

All 33 tests should pass. Always run both `npm test` and `npm run typecheck` before committing.

## Code Style and Conventions

- TypeScript strict mode is enabled.
- Target is ES2020 with Node16 module resolution.
- The codebase uses a single global `manager` instance (singleton pattern).
- Field type handlers follow a class hierarchy rooted at `StructFieldTypeClass`.
- Generated code is cached by struct ID — avoid invalidating caches unnecessarily.
- Use `inlineRegister()` for the common pattern of defining STRUCT inline on a class.

## Common Tasks

### Adding a new primitive type
1. Add the type to `StructEnum` in `types.ts`.
2. Create a new `StructFieldTypeClass` subclass in `struct_intern2.ts` with
   `packCode()` and `unpackCode()` methods.
3. Register the type in the type handler map.
4. Add parser support in `struct_parser.ts` if needed.
5. Add roundtrip tests in `tests/`.

### Modifying the DSL parser
The parser lives in `struct_parser.ts` and uses a hand-written recursive descent
parser built on the lexer in `struct_parseutil.ts`. Token definitions are at the
top of `struct_parseutil.ts`.

### Debugging serialization issues
Enable `DEBUG` in `struct_global.ts`. The code generation step in `struct_intern2.ts`
produces readable JavaScript — log the generated source to inspect pack/unpack logic.
