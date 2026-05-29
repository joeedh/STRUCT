# How STRUCT parsing works

> **Audience note:** This page is written primarily for AI agents (e.g. Claude Code) working on the
> parser. It documents the internal flow from a STRUCT script string to the typed field descriptors
> that the codegen consumes. For the user-facing grammar, see [Specification](Specification.md).

## Where parsing sits in the pipeline

```
STRUCT script (string)
  └─ struct_parseutil.lexer        tokenize (regex, longest-match)
       └─ struct_parser (recursive descent)
            └─ NStruct { name, id, fields: StructField[] }
                 └─ struct_intern2.ts codegen → eval()'d pack/unpack
```

Parsing is purely a **front end**: it turns the DSL into an `NStruct` whose `fields` array holds
`StructField` descriptors. Nothing in the parser knows about binary layout or JSON — that lives in
`struct_intern2.ts` (codegen) and `struct_binpack.ts`. Keep the parser concerned only with syntax →
descriptors.

Relevant files:

- `src/struct_parseutil.ts` — generic lexer + parser base classes (token, tokdef, lexer, parser).
- `src/struct_parser.ts` — the STRUCT-specific token set, grammar rules, and the exported
  `struct_parse` instance. Also exports `stripComments`, `StructEnum`, and the `StructTypes` maps.
- `src/types.ts` — `StructEnum`, `TypeDescriptor`, `StructField`, `NStructInterface`.

## The lexer (`struct_parseutil.ts`)

A small, generic, PLY-inspired regex lexer.

- **Token definitions** (`tokdef`) pair a name with a `RegExp` and an optional transform `func`. The
  STRUCT token list is built in `StructParser()` in `struct_parser.ts:164`.
- **Longest match wins.** `lexer.next()` (`struct_parseutil.ts:249`) runs *every* token regex at the
  current position (anchored at index 0 of the remaining slice) and keeps the match with the longest
  matched string — not the first one that matches. This is why `int` lexes as the `INT` keyword and
  not as a prefix of an `ID`.
- **Transform functions** post-process a token and may return `undefined` to drop it (so the lexer
  recurses to the next token). `SPACE` and `NEWLINE` use this to be skipped; `NEWLINE` also bumps
  `lineno`.
- **Reserved keywords.** The `ID` regex matches identifiers, then its `func` checks the
  `reserved_tokens` set and, if matched, rewrites the token type to the uppercased keyword
  (`struct_parser.ts:168`). Each reserved word also gets a bare (regex-less) `tokdef` so
  `parser.expect("INT")` etc. has a named type to compare against (`struct_parser.ts:244`).
- **Peeking.** `peek()`/`peeknext()` buffer tokens in `peeked_tokens`; `next()` drains that buffer
  first. `at_end()` is true only when both the input is exhausted *and* the peek buffer is empty.
- **Line/column maps** are precomputed in `input()` for error messages; `error()` prints a few
  surrounding source lines with a caret.

### Special tokens worth knowing

- **`JSCRIPT` (`|`)** — `struct_parser.ts:191`. A `|` begins an inline JS snippet that runs to
  end-of-line (or to a `//` comment). It is consumed by reading raw characters directly off the
  lexer (`lex.lexpos`), not by regex, and trailing `;` are stripped. These become a field's `get`
  and `set` expressions (read transform / write transform).
- **`OPT_COLON` (`?:`)** — the shorthand that marks a field optional (equivalent to wrapping the
  type in `optional(...)`).
- **`COMMENT` (`//…`)** — kept as a token (not skipped) so a trailing comment can be attached to a
  field. Note there are *two* comment mechanisms: this token, plus the standalone `stripComments()`
  function (below).
- **`STRLIT`** — single- or double-quoted; the surrounding quotes are sliced off in the transform.

### `stripComments(buf)`

`struct_parser.ts:76` is a separate, character-level pass that removes `//` line comments while
respecting string literals (`'`, `"`, `` ` ``) and escapes. It is a standalone utility — the lexer
also has its own `COMMENT` handling, so don't assume comments are removed in only one place.

## The parser (`struct_parser.ts`)

A hand-written recursive-descent parser over `struct_parseutil.parser`. The base class provides the
primitives the grammar rules use:

- `expect(type, msg?)` — consume the next token, error if its type ≠ `type`; returns the value.
- `optional(type)` — consume and return `true` iff the next token matches; else leave it.
- `peeknext()` / `next()` — lookahead / consume.
- `error(token, msg)` — throws `PUTIL_ParseError` with a source excerpt; typed `never`.

The grammar entry point is `p_Struct`, assigned to `parserInst.start` (`struct_parser.ts:494`).

### Grammar rules

| Rule | Source | Produces |
|------|--------|----------|
| `p_Struct` | `:467` | `NStruct` — name, optional `id = NUM`, then `{ field* }` |
| `p_Field` | `:418` | `StructField` — name, `:`/`?:`, type, optional `|get` `|set`, `;`, optional comment |
| `p_Type` | `:372` | `TypeDescriptor` — dispatches on the next token |
| `p_Array` / `p_Iter` / `p_IterKeys` | `:269` / `:284` / `:324` | container `TypeDescriptor` |
| `p_StaticArray` | `:300` | `static_array[T, N]` |
| `p_Static_String` | `:261` | `static_string[N]` |
| `p_Abstract` | `:340` | `abstract(StructName[, jsonKeyword])` → `TSTRUCT` |
| `p_Optional` | `:360` | `optional(T)` |

#### `p_Struct`

Reads the struct name, then **optionally** an `id = <NUM>` clause (used for stable, registration-order-
independent struct IDs — see `write_scripts`), then `{`, then fields until `}`. A struct with no
explicit id has `id === -1`.

#### `p_Field`

1. Field name via `p_ID_or_num` — a numeric field name is allowed (`:407`).
2. Either `:` or `?:`. `?:` sets `is_opt`, which wraps the parsed type in an `OPTIONAL` descriptor
   *after* `p_Type` returns (`:431`). So `x ?: int` and `x : optional(int)` produce the same
   descriptor.
3. `p_Type`.
4. Up to two `JSCRIPT` (`|…`) snippets: the first is `get`, the second is `set`.
5. `;` terminator.
6. An optional trailing `COMMENT` token, stored on `field.comment`.

#### `p_Type` dispatch

`p_Type` (`:372`) looks at the next token type:

- **`ID`** → a struct reference: `{ type: STRUCT, data: <name> }`. (Forward references are fine — the
  name is resolved later at registration time, not during parsing.)
- **basic types** (`int float double string short byte sbyte bool uint ushort`) → `{ type: <enum> }`
  with no `data`. The set is `basic_types` at `:133`.
- **container/wrapper keywords** delegate to their rule (`array`, `iter`, `iterkeys`,
  `static_array`, `static_string`, `abstract`, `optional`).

Container rules recurse back into `p_Type`, so types nest arbitrarily, e.g. `array(array(float))` or
`optional(array(SomeStruct))`.

##### The `iname` (iterator-name) argument

`array`, `iter`, and `iterkeys` accept an optional **first** argument that becomes `iname`:
`array("vertices", Vertex)`. The rule parses the first type, and if a `COMMA` follows, treats the
already-parsed value's `data` as the iterator name and parses the *real* element type after the comma
(`struct_parser.ts:274`). `static_array[T, N, iname?]` puts `iname` last instead.

## Output: `TypeDescriptor` and `StructField`

The parser's product is defined in `src/types.ts`:

- `StructEnum` (`types.ts:1`) — the numeric type tags. **These numbers are part of the binary format**
  (they are written into serialized data), so never renumber existing entries; only append.
- `TypeDescriptor` (`types.ts:39`) — a discriminated union keyed on `type`. Scalars carry no `data`;
  `STRUCT` carries the referenced name (string); `TSTRUCT` (abstract) carries the name plus a
  `jsonKeyword`; containers carry `{ type, iname }` (or `{ type, size, iname }` for static arrays);
  `OPTIONAL` carries the wrapped `TypeDescriptor` in `data`.
- `StructField` (`types.ts:59`) — `{ name, type, get, set, comment }`.
- `NStruct` (`struct_parser.ts:9`, implements `NStructInterface`) — `{ name, id, fields }`.

## The shared `struct_parse` instance

`struct_parser.ts:498` exports a **single, module-level** parser instance:

```ts
export const struct_parse = StructParser();
```

It is stateful (it holds the lexer with `lexpos`, peek buffer, etc.) and is **reused** for every
parse. Call sites in `struct_intern.ts`:

- `struct_parse.parse(scriptString)` — parse one struct; used by `register` / `inlineRegister`
  (`struct_intern.ts:231`, `:375`, `:509`, `:707`).
- `struct_parse.input(buf)` then a `while (!struct_parse.at_end())` loop calling
  `parse(undefined, false)` — to parse a *file* containing many concatenated structs
  (`struct_intern.ts:519`). The `false` disables the "did not consume entire input" check so the
  loop can continue to the next struct.

Because the instance is global and stateful, **do not** call it re-entrantly or hold onto lexer
state across calls. `parse()` calls `lexer.input()` at the start when given a string, which resets
position and buffers.

## Error handling

Both lexer and parser throw `PUTIL_ParseError` (`struct_parseutil.ts:108`). The parser's `error()`
is typed `never` and always throws after logging a source excerpt with line/column and a caret.
Grammar rules can therefore call `p.error(...)` in an `else` branch without needing to return.

## Common modification recipes

- **Add a new primitive type:** append to `StructEnum` (`types.ts`), add it to `StructTypes` and, if
  it should be usable as a bare keyword, to `basic_types` and `reserved_tokens`
  (`struct_parser.ts`). Then add the codegen handler in `struct_intern2.ts`. (See CLAUDE.md
  "Common tasks".)
- **Add a new container/wrapper keyword:** add it to `reserved_tokens`, write a `p_Xxx` rule that
  `expect`s the keyword and recurses via `p_Type`, and add a branch to `p_Type`'s dispatch.
- **Change field syntax:** edit `p_Field`. Remember the two-`JSCRIPT` get/set convention and the
  trailing-comment token.
- **Debug a parse:** set `lexer.printTokens = true` on `struct_parse.lexer` to log every token, or
  inspect the returned `NStruct.fields`. Codegen output can be logged via the `DEBUG` flag in
  `struct_global.ts`.
