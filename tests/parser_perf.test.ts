import { describe, it, expect } from "vitest";

import { struct_parse } from "../src/struct_parser.js";

// These tests guard against the STRLIT-token regexp regressing back into an
// O(n^2) hotspot. The lexer only accepts a token regexp match at index 0, but
// the STRLIT pattern used to be unanchored (`/"[^"]*"/`), so on every single
// token the regex engine scanned the *entire* remaining input hunting for the
// next quote. Quotes are rare in a struct script, so this turned lexing into a
// quadratic scan. Anchoring the pattern (`/^"[^"]*"/`) makes a non-match fail
// immediately at position 0.

function makeScript(nFields: number): string {
  let s = "perf.Big {\n";
  for (let i = 0; i < nFields; i++) {
    s += `  field_${i} : float;\n`;
  }
  s += "}\n";
  return s;
}

function timeParse(script: string): number {
  // warm up + measure best-of-3 to reduce noise from GC / JIT.
  let best = Infinity;
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    struct_parse.parse(script, false);
    const dt = performance.now() - t0;
    if (dt < best) best = dt;
  }
  return best;
}

describe("STRUCT parser lexing performance", () => {
  it("parses a large struct quickly (anchored STRLIT)", () => {
    // ~4000 fields with no string literals at all — the worst case for an
    // unanchored STRLIT regexp, which would scan to the end of input on every
    // token. With the anchored pattern this is comfortably sub-second; the
    // old O(n^2) behavior took multiple seconds.
    const script = makeScript(4000);
    const ms = timeParse(script);
    expect(ms).toBeLessThan(1000);
  });

  it("scales roughly linearly, not quadratically, with input size", () => {
    // Doubling the field count should roughly double the parse time. With the
    // old quadratic lexer the ratio was ~4x; allow generous headroom (3x) so
    // the test stays stable across machines while still catching an O(n^2)
    // regression.
    const small = makeScript(1500);
    const large = makeScript(3000);

    // Warm up the codegen / JIT paths first so the timing is fair.
    timeParse(small);
    timeParse(large);

    const tSmall = timeParse(small);
    const tLarge = timeParse(large);

    // Guard against divide-by-zero on very fast machines.
    const ratio = tLarge / Math.max(tSmall, 0.05);
    expect(ratio).toBeLessThan(3);
  });

  it("still correctly lexes string literals", () => {
    // Make sure the sticky-regexp change didn't break STRLIT matching itself.
    // The `abstract(Type, "jsonKeyword")` form takes a quoted string literal as
    // its second argument; exercise both the double- and single-quoted forms.
    const script = `perf.WithStrings {
      a : abstract(Foo, "double_quoted_key");
      b : abstract(Bar, 'single_quoted_key');
      c : float;
    }`;
    const st = struct_parse.parse(script, false) as {
      fields: { name: string; type: { jsonKeyword?: string } }[];
    };
    expect(st.fields.map((f) => f.name)).toEqual(["a", "b", "c"]);
    expect(st.fields[0].type.jsonKeyword).toBe("double_quoted_key");
    expect(st.fields[1].type.jsonKeyword).toBe("single_quoted_key");
  });
});
