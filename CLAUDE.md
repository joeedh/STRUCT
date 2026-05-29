# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository. A longer companion lives
in `AGENTS.MD`; this file is the quick operational reference plus the doc workflow.

## Project Overview

nstructjs is a ProtoBuf-like binary serialization library for JavaScript/TypeScript. It serializes
and deserializes class instances **directly** using a custom DSL for struct definitions, with
dynamic code generation for performance — no intermediate representation, no generated classes.

- **Repository:** https://github.com/joeedh/STRUCT
- **Author:** Joseph Eagar · **License:** Unlicense
- **Language:** TypeScript (strict), ES2020 / Node16 modules.

## Commands

- `pnpm build` — build all bundles into `build/` (runs `build.sh` → Rollup).
- `pnpm test` — run the Vitest suite (`tests/*.test.ts`).
- `pnpm run typecheck` — `tsc --noEmit`.
- `pnpm docs` — generate the API reference into `docs/` with TypeDoc (config in `typedoc.json`).
- `pnpm format` / `pnpm format:check` — Prettier.

Always run `pnpm test` and `pnpm run typecheck` before committing.

## Architecture (`src/`)

| Module | Purpose |
|--------|---------|
| `structjs.ts` | Public API entry point; re-exports all public functions and submodules. |
| `types.ts` | TypeScript interfaces and type definitions (`StructableClass`, `StructEnum`, …). |
| `struct_intern.ts` | `STRUCT` manager — registration, read/write dispatch, JSON paths, hooks. |
| `struct_intern2.ts` | Field-type packing/unpacking handlers and code generation. |
| `struct_parser.ts` | Parses the STRUCT DSL into field descriptors. |
| `struct_parseutil.ts` | Lexer/parser utilities used by the DSL parser. |
| `struct_binpack.ts` | Low-level binary encode/decode (int, float, UTF-8); `unpack_context`. |
| `struct_json.ts` | JSON serialization path and validation. |
| `struct_filehelper.ts` | File I/O helpers and struct versioning. |
| `struct_eval.ts` | Wrapper around `eval()` for generated pack/unpack code. |
| `struct_global.ts` | Global state and DEBUG flags. |
| `struct_util.ts`, `polyfill.ts` | Utilities and polyfills. |

### How serialization works

1. **Register** a class that has a static `STRUCT` script, via `register()` / `inlineRegister()`.
2. **Parse** the DSL (`struct_parser.ts`) into an `NStructInterface` of typed field descriptors.
3. **Codegen** `pack()`/`unpack()` JS from the descriptors, compiled via `eval()` (or `useTinyEval`).
4. **Serialize** with `writeObject`/`readObject` (binary) or `writeJSON`/`readJSON` (JSON).

The public API is the single global `manager` instance plus the top-level functions re-exported from
`structjs.ts` (`register`, `inlineRegister`, `writeObject`, `readObject`, `writeJSON`, `readJSON`,
`write_scripts`, `setEndian`, hooks `onUnknownClass`/`onSerializeUnknown`, …). Prefer the top-level
camelCase functions; snake_case manager methods (`write_object`, `read_object`) are retained for
backward compatibility.

## Documentation

- **Prose docs are in [`documentation/`](documentation/index.md)** — this is the canonical, edited
  source. Edit those Markdown files, not the wiki.
- **`pnpm docs` runs TypeDoc** (`typedoc.json`) and writes the API site to `docs/`. The
  `documentation/*.md` pages are folded into the generated site via TypeDoc's `projectDocuments`,
  and `documentation/index.md` is the readme/landing page.
- **The old GitHub wiki** (`wiki/`, a separate `STRUCT.wiki.git` repo) is **deprecated**; every page
  carries a banner pointing to `documentation/`. Don't add new content there.
- **esdoc has been removed** (no more `.esdoc.json` / `nstructjs_esdoc.cjs` / `build_docs.sh`).
- `documentation/AUDIT.md` records how the docs were reconciled against the source and lists known
  gaps; update it when the public API changes.

## STRUCT DSL

```
namespace.ClassName {
  fieldName    : int;
  optionalField: optional(int);
  nestedArray  : array(array(float));
  reference    : ClassName2;
}
```

Supported types: `int`, `uint`, `float`, `double`, `string`, `static_string[N]`, `byte`, `short`,
`ushort`, `bool`, `array(T)`, `iter(T)`, `iterkeys(T)`, `static_array[T, N]`, `optional(T)`, and
struct references by name. See `documentation/Specification.md`.

## Common tasks

- **Add a primitive type:** add to `StructEnum` (`types.ts`), add a `StructFieldTypeClass` subclass
  with `packCode()`/`unpackCode()` in `struct_intern2.ts`, register it in the handler map, extend the
  parser in `struct_parser.ts` if needed, and add roundtrip tests in `tests/`.
- **Modify the DSL parser:** hand-written recursive descent in `struct_parser.ts` over the lexer in
  `struct_parseutil.ts`.
- **Debug serialization:** enable `DEBUG` in `struct_global.ts`; the codegen in `struct_intern2.ts`
  emits readable JS — log the generated source.

## Conventions

- TypeScript strict mode; single global `manager` singleton; field handlers rooted at
  `StructFieldTypeClass`; generated code cached by struct ID (avoid needless cache invalidation).
- Use `inlineRegister()` for the common inline-STRUCT pattern; `nstructjs.inherit` is deprecated.
