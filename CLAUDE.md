# CLAUDE.md

## Renames
- build/_nstructjs.js is now build/nstructjs-jest.js

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

- `pnpm build` — build all bundles into `build/` (runs `tools/build.js` → esbuild, then `tsc`
  for the `.d.ts` files). Pass bundle names to build a subset, `--no-types` to skip `tsc`.
- `pnpm test` — run the Vitest suite (`tests/*.test.ts`).
- `pnpm run typecheck` — `tsc --noEmit`.
- `pnpm docs` — generate the API reference into `docs/` with TypeDoc (config in `typedoc.json`).
- `pnpm format` / `pnpm format:check` — Prettier.
- `pnpm build:package` — assemble the publishable tree in `package/`; `build:package:dry` reports
  what it would copy and writes nothing.
- `pnpm release` — build, publish to npm, and tag; `release:dry` runs the same steps with
  `npm publish --dry-run` and no commit, tag, push, or upload.

Always run `pnpm test` and `pnpm run typecheck` before committing.

### Build system

`tools/build.js` defines every bundle in one `BUNDLES` table and drives esbuild through the JS
API. Per-bundle source transforms run in an `onLoad` plugin against the TypeScript source before
esbuild sees it:

- `stripTinyeval` cuts the `//$BUILD_TINYEVAL_START` … `//$BUILD_TINYEVAL_END` block out of
  `structjs.ts` and leaves no-op `tinyeval` / `useTinyEval` exports in its place.
- `inlineKeywords` rewrites `[keywords.script]` and friends into direct property accesses.
- `templatizeStruct` transpiles the `//$KEYWORD_CONFIG_START` … `//$KEYWORD_CONFIG_END` region on
  its own and splices it into a template literal.

The `nstructjs.js` and `nstructjs_tinyeval.js` bundles are CommonJS wrapped in `tools/start.frag`
and `tools/end.frag`, injected as esbuild's `banner` and `footer`.

`build/nstructjs_configurable.js` is an unfinished artifact: nothing evaluates the class source it
embeds, so importing it throws. It predates this refactor and is built for parity only.

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
- Prose docs follow the [comment prose style rules](#comments) below.
- **Prose docs are in [`documentation/`](documentation/index.md)** — this is the canonical, edited
  source. Edit those Markdown files, not the wiki.
- **`pnpm docs` runs TypeDoc** (`typedoc.json`) and writes the API site to `docs/`. The
  `documentation/*.md` pages are folded into the generated site via TypeDoc's `projectDocuments`,
  and `documentation/index.md` is the readme/landing page. A new page has to be added to
  `projectDocuments` in `typedoc.json` and linked from `index.md`, or nothing reaches the site.
  `npx typedoc` prints broken cross-page anchors as warnings; the run should end at 0 errors and the
  7 long-standing "referenced … but not included in the documentation" warnings.
- **The old GitHub wiki** (`wiki/`, a separate `STRUCT.wiki.git` repo) is **deprecated**; every page
  carries a banner pointing to `documentation/`. Don't add new content there.
- **esdoc has been removed** (no more `.esdoc.json` / `nstructjs_esdoc.cjs` / `build_docs.sh`).
- `documentation/AUDIT.md` records how the docs were reconciled against the source and lists known
  gaps; update it when the public API changes.
- **[`documentation/parsing.md`](documentation/parsing.md)** is an agent-oriented deep-dive on how
  the STRUCT DSL is lexed and parsed (lexer → recursive-descent parser → `TypeDescriptor`s) — read
  it before touching `struct_parser.ts` / `struct_parseutil.ts`.
- **[`documentation/JSON.md`](documentation/JSON.md)** is the short JSON serialization API reference;
  **[`documentation/jsonGuide.md`](documentation/jsonGuide.md)** is the companion deep-dive on the
  JSON data model, type mappings, polymorphism, and validation — read it before touching the
  `toJSON`/`fromJSON`/`validateJSON`/`formatJSON` handlers in `struct_intern2.ts` or
  `struct_json.ts`.
- **[`documentation/HelperScripts.md`](documentation/HelperScripts.md)** covers the `| jscode`
  field suffix — write-side only, one per field, the per-item container form, and the `this` field
  name.
- **[`documentation/UnknownClasses.md`](documentation/UnknownClasses.md)** covers the
  `onUnknownClass` / `onSerializeUnknown` hooks and `parse_structs` dummies.
- **[`documentation/Configuration.md`](documentation/Configuration.md)** covers `deriveStructManager`,
  struct ids, registration (`setAllowOverriding`, `isRegistered`, `unregister`, `validateStructs`),
  diagnostics (`setDebugMode`, `setWarningMode`, `truncateDollarSign`), `useTinyEval`, and byte order.
  Its `###` headings are deliberately un-backticked so TypeDoc's slugs resolve — leave them that way.

## STRUCT DSL

```
namespace.ClassName {
  fieldName     : int;
  optionalField : optional(int);
  shorthandOpt ?: int;
  nestedArray   : array(array(float));
  reference     : ClassName2;
  derived       : int | obj.reference.uuid;
}
```

Supported types: `int`, `uint`, `float`, `double`, `string`, `static_string[N]`, `byte`, `sbyte`,
`short`, `ushort`, `bool`, `array(T)`, `iter(T)`, `iterkeys(T)`, `static_array[T, N]`, `optional(T)`,
`abstract(T[, jsonKeyword])`, `arraybuffer(T)` (bulk typed-array/`ArrayBuffer` block, numeric `T`
only), and struct references by name. `field ?: T` is shorthand for `optional(T)`. A field may carry
one `| jscode` helper script. See `documentation/Specification.md`.

## Common tasks

- **Add a primitive type:** add to `StructEnum` (`types.ts`), add a `StructFieldTypeClass` subclass
  with `packCode()`/`unpackCode()` in `struct_intern2.ts`, register it in the handler map, extend the
  parser in `struct_parser.ts` if needed, add roundtrip tests in `tests/`, and add the type to the
  grammar and a semantics section in `documentation/Specification.md`.
- **Modify the DSL parser:** hand-written recursive descent in `struct_parser.ts` over the lexer in
  `struct_parseutil.ts`. Grammar changes go into `documentation/Specification.md` (user-facing) and
  `documentation/parsing.md` (the rule-by-rule walkthrough).
- **Debug serialization:** enable `DEBUG` in `struct_global.ts`; the codegen in `struct_intern2.ts`
  emits readable JS — log the generated source.

## Conventions

- TypeScript strict mode; single global `manager` singleton; field handlers rooted at
  `StructFieldTypeClass`; generated code cached by struct ID (avoid needless cache invalidation).
- Use `inlineRegister()` for the common inline-STRUCT pattern; `nstructjs.inherit` is deprecated.


### Comments

- **Comments are plain declarative prose — no epigrams.** State the constraint or decision
  directly: "An empty answer is deliberate and is passed to the model as-is", not "Empty is an
  answer — silence, said out loud." If a sentence needs a second read to parse, rewrite it.
  The same rule applies to this file and the prose in `docs/`. Specific patterns to catch:
  - **Inverted syntax and personification** — the sentence performs rather than informs.
  - **Metaphorical equations** — "The leak scan is the refusal", "what ships is identity",
    "the project as commands". The connector word varies — do not get hung up on "is"
    versus "as". Say what happens instead: "Refuses if the leak scan finds a known name
    still in the body."
  - **Fragment openers that defer the subject** — "The redactor to scan a report with: the one
    that wrote it, else one built from the project as it stands." Lead with a complete sentence
    and name each case as you reach it.
  - **Double negatives** — "the palette cannot be relied on not to". State the positive claim.
  - **Pronouns and ellipses that point outside the sentence** — "the second case", "asking
    twice is how…" — each sentence should carry its own referents.
  - **"Clause A, else B" constructions** — "Resolve a push's destination: the named window
    when it still exists, else the focused window falling back to the most recently focused
    one." Spell out the cases as ordinary sentences instead: "Pushes to the named window if it
    still exists. Otherwise pushes to the focused window, or the most recently focused window
    if none is focused."
  - **Adverbs hung off the end of a noun phrase** — "the next pointerdown anywhere", "the
    handler above". The adverb postmodifies the noun, but the reader cannot tell on first pass
    whether it attaches to the noun or to the clause's verb, and an event or API name coined
    from a verb ("pointerdown") re-parses as a clause when an adverb follows it. Attach the
    qualification to a verb, or state it as its own fact: "the listener is on `window`".
  - **Non-assertive words under a definite** — "any", "anywhere", "ever" range over
    alternatives, so they fight a definite description that names exactly one thing. "A press
    anywhere dismisses it" reads fine; "the next pointerdown anywhere" does not.
  - **Rhetorical emphasis** — `**bold**` and `*italics*` in a comment mark the sentence the
    author found most interesting, not the one the reader needs first. Put the load-bearing
    claim in the first sentence and drop the markup.
  - **A head noun that is not what the code is** — a module of commands documented as "The
    prompt an asset is generated from, as commands" asserts that the module is a prompt, then
    retracts it through a preposition. Lead with the head noun that names the declaration —
    "Commands for the prompt an asset is generated from" — and demote the rest to a
    complement. A trailing ", as X" or ", in the form of X" is the same metaphorical equation
    above smuggled in through an adjunct.
- **Reserve backticks for code symbols.** Backticks belong on identifiers, types, commands,
  and file globs the reader will type. A file path cited as a reference —
  `(docs/plans/archive/chunked-prompts.md §5)` — does not, because marking it up gives it the
  same weight as the identifiers around it and dilutes them.
- **A comment describes the code directly beneath it.** A comment placed above an `if` is read
  as a caption for the branch it guards, so one that explains the opposite case belongs on the
  `else`, or should be reworded to describe the test itself. Misplacing a comment this way is a
  correctness bug, not a style one.
- **Delete commented-out code — never leave it as commentary.** Git history holds it. A
  commented-out call, import or block explains nothing about the code that survives, and it
  goes stale silently because nothing type-checks it.
- **Never restate what the code already says.** `inputs: {}, //tool properties` and
  `case keymap.Escape: //esc` add a maintenance burden and no information. A comment earns its
  place by giving a reason, a constraint, or a consequence.
- **Cite a named constant rather than its value.** A comment saying "thirty seconds" beside
  `LINGER_MS` is wrong the first time the constant changes; write `` `LINGER_MS` ``.
- **Rename instead of commenting a name.** If the sentence's work is translating an
  identifier — what `snapMode` means, what a bare `-1` means — rename the identifier or
  introduce a named constant, then delete the sentence. Comment a name only when the name
  cannot be fixed. Try to avoid names longer than three words or 25 characters
  (10 characters or less is preferred).
- **Comment the consequence, not the arguments.** Options passed at a call site (`capture`,
  `passive`, a flag, a lifetime) are already on screen. Say what the reader cannot see: what
  the call does to everything around it. "Does not inhibit the event from reaching other
  consumers" earns its line; "registered `passive` so it cannot call `preventDefault`" does not.
- **State facts; do not defend the design.** Rationale belongs in a comment only when a reader
  looking at the surrounding code still could not derive it — an ordering constraint, a platform
  quirk, a decision with a live alternative. "Why this is the good version" and "what would go
  wrong under the naive one" are commit-message material.
- **Bracket a subordinate alternative rather than fencing it with commas.** Parentheses mark the
  material as skippable, so the reader gets a complete sentence either way; paired commas leave
  it unclear whether the second comma closes an interpolation or opens a new clause. Write
  "Dropping onto itself (or onto a neighbor it would split against) is not a rip". Drop any comma
  that would follow the closing bracket — it separates the subject from its verb.
- **A doc comment continues its declaration; it does not restate it.** Prefer a noun phrase or a
  bare predicate — "Pointer ids currently down.", "Detected via the presence of multiple pointer
  ids." — to a full sentence that re-supplies the subject the declaration already names. A doc
  comment that reads as a standalone paragraph is usually rationale in disguise.
- **An inline `//` note is a fragment with no terminal period; a `/** … \*/` doc comment is a
  punctuated sentence.\*\* One line each, unless the fact genuinely needs two.
- **Non-doc comments use `//`.** Doc comments use proper `/** … */` brackets. Don't use
  `/* … */` for ordinary inline commentary.
- **Non-doc comments are at most 3 lines.** A longer block comment is allowed sparingly —
  budget roughly one per 500 lines of a file — for genuinely load-bearing context that
  can't be stated in three lines.
- **Doc comments stay reasonably concise.** Say what the thing is and any non-obvious
  contract; don't restate the signature or narrate the implementation.
- **Temporary comments are marked `CLAUDENOTE:`.** Any scratch/working comment Claude
  writes gets that prefix, and all of them must be removed before the final commit of a
  plan (or at the end of the plan, whichever comes first).

