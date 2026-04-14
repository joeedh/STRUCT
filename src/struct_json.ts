"use strict";

import { tokdef, parser, lexer, token } from "./struct_parseutil.js";
import { termColor } from "./struct_util.js";
import { PUTIL_ParseError } from "./struct_parseutil.js";

export const TokSymbol: unique symbol = Symbol("token-info");

export interface TokInfo {
  lexpos: number;
  lineno: number;
  col: number;
  fields: Record<string | number, TokInfo>;
}

// TokSymbol is attached to plain objects and arrays at runtime.
// We use helper functions to access it safely.
function setTokInfo(obj: unknown, info: TokInfo): void {
  (obj as Record<symbol, TokInfo>)[TokSymbol] = info;
}

export function getTokInfo(obj: unknown): TokInfo | undefined {
  if (obj && typeof obj === "object") {
    return (obj as Record<symbol, TokInfo | undefined>)[TokSymbol];
  }
  return undefined;
}

export function buildJSONParser(): parser {
  const tk = (name: string, re: RegExp, func?: (t: token) => token | undefined, example?: string) =>
    new tokdef(name, re, func, example);

  let parse: parser;

  const nint = "[+-]?[0-9]+";
  const nhex = "[+-]?0x[0-9a-fA-F]+";
  const nfloat1 = "[+-]?[0-9]+\\.[0-9]*";
  const nfloat2 = "[+-]?[0-9]*\\.[0-9]+";
  let nfloatexp: string | RegExp = "[+-]?[0-9]+\\.[0-9]+[eE][+-]?[0-9]+";

  const nfloat = `(${nfloat1})|(${nfloat2})|(${nfloatexp})`;
  const num = `(${nint})|(${nfloat})|(${nhex})`;
  const numre = new RegExp(num);

  const numreTest = new RegExp(`(${num})$`);

  //nfloat3 has to be its own regexp
  let nfloat3: RegExp = new RegExp("[+-]?[0-9]+\\.[0-9]+");
  nfloatexp = new RegExp(nfloatexp);

  const tests = ["1.234234", ".23432", "-234.", "1e-17", "-0x23423ff", "+23423", "-4.263256414560601e-14"];
  for (const test of tests) {
    if (!numreTest.test(test)) {
      console.error("Error! Number regexp failed:", test);
    }
  }

  const tokens = [
    tk("BOOL", /true|false/),
    tk("WS", /[ \r\t\n]/, (_t: token) => undefined), //drop token
    tk("STRLIT", /["']/, (t: token) => {
      const lex = t.lexer;
      const char = t.value;
      let i = lex.lexpos;
      const lexdata = lex.lexdata;

      let escape = false;
      t.value = "";

      while (i < lexdata.length) {
        const c = lexdata[i];

        t.value += c;

        if (c === "\\") {
          escape = !escape;
        } else if (!escape && c === char) {
          break;
        } else {
          escape = false;
        }

        i++;
      }

      lex.lexpos = i + 1;

      if (t.value.length > 0) {
        t.value = t.value.slice(0, t.value.length - 1);
      }

      return t;
    }),
    tk("LSBRACKET", /\[/),
    tk("RSBRACKET", /]/),
    tk("LBRACE", /{/),
    tk("RBRACE", /}/),
    tk("NULL", /null/),
    tk("COMMA", /,/),
    tk("COLON", /:/),
    tk("NUM", numre, (t: token) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
    tk("NUM", nfloat3, (t: token) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
    tk("NUM", nfloatexp as RegExp, (t: token) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
  ];

  function tokinfo(t: token | undefined): TokInfo {
    return {
      lexpos: t ? t.lexpos : 0,
      lineno: t ? t.lineno : 0,
      col   : t ? t.col : 0,
      fields: {},
    };
  }

  function p_Array(p: parser): unknown[] {
    p.expect("LSBRACKET");
    let t = p.peeknext();
    let first = true;

    const ret: unknown[] = [];

    setTokInfo(ret, tokinfo(t));

    while (t && t.type !== "RSBRACKET") {
      if (!first) {
        p.expect("COMMA");
      }

      getTokInfo(ret)!.fields[ret.length] = tokinfo(t);
      ret.push(p_Start(p));

      first = false;
      t = p.peeknext();
    }
    p.expect("RSBRACKET");

    return ret;
  }

  function p_Object(p: parser): Record<string, unknown> {
    p.expect("LBRACE");

    const obj: Record<string, unknown> = {};

    let first = true;
    let t = p.peeknext();

    setTokInfo(obj, tokinfo(t));
    while (t && t.type !== "RBRACE") {
      if (!first) {
        p.expect("COMMA");
      }

      const key = p.expect("STRLIT");
      p.expect("COLON");

      const val = p_Start(p, true);

      obj[key] = val;
      first = false;

      t = p.peeknext();
      getTokInfo(obj)!.fields[key] = tokinfo(t);
    }

    p.expect("RBRACE");

    return obj;
  }

  function p_Start(p: parser, _throwError: boolean = true): unknown {
    const t = p.peeknext();
    if (!t) {
      p.error(undefined, "Unexpected end of input");
    }
    if (t!.type === "LSBRACKET") {
      return p_Array(p);
    } else if (t!.type === "LBRACE") {
      return p_Object(p);
    } else if (t!.type === "STRLIT" || t!.type === "NUM" || t!.type === "NULL" || t!.type === "BOOL") {
      const tok = p.next()!;
      if (tok.type === "NUM") {
        return parseFloat(tok.value);
      } else if (tok.type === "BOOL") {
        return tok.value === "true";
      } else if (tok.type === "NULL") {
        return null;
      }
      return tok.value;
    } else {
      p.error(t, "Unknown token");
    }
  }

  function p_Error(_token: token | undefined, _msg: string): boolean {
    throw new PUTIL_ParseError("Parse Error");
  }

  const lex = new lexer(tokens);
  lex.linestart = 0;
  parse = new parser(lex, p_Error);
  parse.start = p_Start as (p: parser) => unknown;

  return parse;
}

const _defaultParser = buildJSONParser();
export default _defaultParser;

export function printContext(buf: string, tokinfo: TokInfo | undefined, printColors: boolean = true): string {
  const lines = buf.split("\n");

  if (!tokinfo) {
    return "";
  }

  const lineno = tokinfo.lineno;
  const col = tokinfo.col;

  const istart = Math.max(lineno - 50, 0);
  const iend = Math.min(lineno + 2, lines.length - 1);

  let s = "";

  if (printColors) {
    s += termColor("  /* pretty-printed json */\n", "blue");
  } else {
    s += "/* pretty-printed json */\n";
  }

  for (let i = istart; i < iend; i++) {
    const l = lines[i];

    let idx = "" + i;
    while (idx.length < 3) {
      idx = " " + idx;
    }

    if (i === lineno && printColors) {
      s += termColor(`${idx}: ${l}\n`, "yellow");
    } else {
      s += `${idx}: ${l}\n`;
    }

    if (i === lineno) {
      let l2 = "";
      for (let j = 0; j < col + 5; j++) {
        l2 += " ";
      }

      s += l2 + "^\n";
    }
  }

  return s;
}
