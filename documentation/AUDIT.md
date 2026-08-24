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

## Previously deferred, now written

Each bullet below was a gap in the earlier audit. All five are covered as of this pass.

- `deriveStructManager(keywords?)` — [Configuration](Configuration.md#derivestructmanagerkeywords).
  The audit's earlier wording, and the example in `Reading-And-Writing.md`, both treated it as
  returning a manager *instance*; it returns a `STRUCT` subclass (`struct_intern.ts:1539`). The
  example now uses `new nstructjs.STRUCT()`.
- `onUnknownClass` / `onSerializeUnknown` — [Unknown Classes](UnknownClasses.md), with a worked
  placeholder round-trip matching `tests/unknown_struct_field.test.ts`.
- `truncateDollarSign`, `setAllowOverriding`, `isRegistered`, `validateStructs`, `setDebugMode`,
  `setWarningMode`, `useTinyEval` — [Configuration](Configuration.md), one section each.
- The helper-script mechanism, including the `array(item, Type) | helper` per-item map form and the
  `this` field name — [Helper Scripts](HelperScripts.md).
- `static_array[T, N]` and `optional(T)` — verified supported (`struct_parser.ts:334` / `:394`) and
  added to `Specification.md`'s grammar and semantics, along with `sbyte`, the `field ?: T` shorthand
  for `optional`, and the `iterkeys(TYPE)` no-iterator form.

## Known-incomplete / deferred

- **`truncateDollarSign` does not truncate.** `_truncateDollarSign` (`struct_intern.ts:108`) finds
  the `$` with `String.prototype.search`, which coerces its argument to a regular expression; `/$/`
  matches the end of the string, so the function returns its input unchanged in every case. The flag
  is documented with that caveat rather than as working. Fixing it changes registered struct names in
  any build that relies on the default, so it is a behavior change, not a pure bug fix.
- **`isRegistered` ignores custom keywords.** It gates on
  `cls.hasOwnProperty("structName")` (`struct_intern.ts:843`) before consulting the keyword table, so
  it always reports `false` for a manager derived with a renamed `name` keyword.
- **`deriveStructManager` omits the `after` keyword.** `STRUCT.setClassKeyword` builds an `after`
  entry; `deriveStructManager` does not, so a derived manager's keyword set is missing it.

## Removed sources

- `docs/` (generated esdoc HTML, 113 files) — replaced by TypeDoc output.
- `docs_src/Refactor.md` — stale 2020 TODO; the `fromSTRUCT → loadSTRUCT/newSTRUCT` migration it
  proposed is long since complete (`loadSTRUCT`/`newSTRUCT` are the current instance hooks, see
  `types.ts` `StructableInstance`).
