# Documentation Audit

This file records the reconciliation of the prose documentation (migrated from the old GitHub wiki)
against the current source in `src/`, performed during the docs migration. It is a snapshot, not a
living document — re-audit when the public API changes.

## Method

The wiki pages were compared against the public API surface re-exported from `src/structjs.ts`
(which re-exports everything from `src/struct_intern.ts`) and the binary primitives in
`src/struct_binpack.ts`. Each identifier referenced in the docs was checked for existence and
correct name/signature.

## Corrections applied to the migrated docs

| Old (wiki) | Corrected | Notes |
|---|---|---|
| `nstructjs.manager.add_class(SomeClass)` | `nstructjs.register(SomeClass)` | `add_class` still exists as a method on `STRUCT` (`struct_intern.ts:670`) but `register` is the public idiom. |
| `nstructjs.manager.write_object(data, obj)` | `nstructjs.writeObject(data, obj)` | Snake_case method still exists (`struct_intern.ts:857`, backward-compatible); top-level camelCase is the documented API. |
| `nstructjs.manager.read_object(data, cls)` | `nstructjs.readObject(view, cls)` | Same as above (`struct_intern.ts:972`). |
| `nstructjs.manager.write_object(anObject)` (missing `data` arg) | `nstructjs.writeObject(data, anObject)` | Plain bug in the wiki example — the first arg is the output array. |
| `nstructjs.binpack.write_string` | `nstructjs.binpack.pack_string` | No `write_string` export; the function is `pack_string` (`struct_binpack.ts:198`). |
| `new nstructjs.binpack.unpack_ctx()` | `new nstructjs.binpack.unpack_context()` | The exported class is `unpack_context` (`struct_binpack.ts:14`), also re-exported at top level. |
| `new nstructjs.STRUCT()` | `nstructjs.deriveStructManager()` (with `new nstructjs.STRUCT()` noted as equivalent) | `STRUCT` is exported; `deriveStructManager` is the friendlier factory (`struct_intern.ts`). |
| `nstructjs.inherit(...)` in JSON example | `nstructjs.inlineRegister(...)` | `inherit` is marked `@deprecated` in `structjs.ts:105`; `inlineRegister` handles inheritance automatically. |
| Endianness: "network (big) byte order" | "configurable, default little-endian" | `STRUCT_ENDIAN = true` (little-endian) by default in `struct_binpack.ts:5`; controlled by `setEndian`/`getEndian`. |
| `@STRUCT` esdoc manual link, wiki-style `[Page](Page)` links | relative `Page.md` links | esdoc-specific link syntax removed. |

## Verified still-correct (no change needed)

- `nstructjs.write_scripts()` — exists (`struct_intern.ts:1505`), exported via `export *`.
- `manager.parse_structs(scripts)` — exists (`struct_intern.ts:475`).
- `nstructjs.binpack.pack_string` / `unpack_string` — exist (`struct_binpack.ts:198`/`256`).
- The STRUCT DSL grammar, type list, and binary string/array semantics in `Specification.md`.

## Gaps filled

- **JSON API** was undocumented in prose. Added coverage of `writeJSON`, `readJSON`, `formatJSON`,
  and `validateJSON` (all in `struct_intern.ts`, re-exported from `structjs.ts`).
- **`inlineRegister`** is now the recommended registration path and is shown in the intro and JSON
  pages.
- **`uint` / `ushort`** primitive types were missing from the grammar/type list in
  `Specification.md`; added.

## Known-incomplete / deferred (prose does not yet cover)

These are real public exports (`src/structjs.ts`) that the prose docs still treat lightly or not at
all. They are covered by the generated TypeDoc API reference, but could use narrative docs later:

- `deriveStructManager(keywords?)` — custom-keyword managers (only mentioned in passing).
- `onUnknownClass` / `onSerializeUnknown` hooks (added in commits `c6b6753` / `bb6fadb`) — only
  listed in `index.md`, no worked example.
- `truncateDollarSign`, `setAllowOverriding`, `isRegistered`, `validateStructs`, `setDebugMode`,
  `setWarningMode`, `useTinyEval` — listed in `index.md` but not given dedicated sections.
- The `array(item, Type) | helper` per-item map form and the `obj.field.uuid` helper-script
  mechanism could use a dedicated reference page (currently only shown by example in the intro).
- `static_array[T, N]` and `optional(T)` types appear in `AGENTS.MD`'s type list and the source but
  are not in `Specification.md`'s grammar — verify against `struct_parser.ts` and add if supported.

## Removed sources

- `docs/` (generated esdoc HTML, 113 files) — replaced by TypeDoc output.
- `docs_src/Refactor.md` — stale 2020 TODO; the `fromSTRUCT → loadSTRUCT/newSTRUCT` migration it
  proposed is long since complete (`loadSTRUCT`/`newSTRUCT` are the current instance hooks, see
  `types.ts` `StructableInstance`).
