"use strict";
/*
The lexical scanner in this module was inspired by PyPLY

http://www.dabeaz.com/ply/ply.html
*/

import { termColor } from "./struct_util.js";

function print_lines(ld: string, lineno: number, col: number, printColors: boolean, tokenObj?: token): string {
  let buf = "";
  const lines = ld.split("\n");
  const istart = Math.max(lineno - 5, 0);
  const iend = Math.min(lineno + 3, lines.length);

  const color = printColors ? (c: string) => c : termColor;

  for (let i = istart; i < iend; i++) {
    let l = "" + (i + 1);
    while (l.length < 3) {
      l = " " + l;
    }

    l += `: ${lines[i]}\n`;

    if (i === lineno && tokenObj && tokenObj.value.length === 1) {
      l = l.slice(0, col + 5) + color(l[col + 5], "yellow") + l.slice(col + 6, l.length);
    }
    buf += l;
    if (i === lineno) {
      let colstr = "     ";
      for (let j = 0; j < col; j++) {
        colstr += " ";
      }
      colstr += color("^", "red");

      buf += colstr + "\n";
    }
  }

  buf = "------------------\n" + buf + "\n==================\n";
  return buf;
}

export class token {
  type: string;
  value: string;
  lexpos: number;
  lineno: number;
  col: number;
  lexer: lexer;
  parser: parser | undefined;

  constructor(
    type: string,
    val: string,
    lexpos: number,
    lineno: number,
    lex: lexer,
    p: parser | undefined,
    col: number
  ) {
    this.type = type;
    this.value = val;
    this.lexpos = lexpos;
    this.lineno = lineno;
    this.col = col;
    this.lexer = lex;
    this.parser = p;
  }

  toString(): string {
    if (this.value !== undefined) return "token(type=" + this.type + ", value='" + this.value + "')";
    else return "token(type=" + this.type + ")";
  }
}

export class tokdef {
  name: string;
  re: RegExp | undefined;
  func: ((t: token) => token | undefined) | undefined;
  example: string | undefined;

  constructor(name: string, regexpr?: RegExp, func?: (t: token) => token | undefined, example?: string) {
    this.name = name;
    this.re = regexpr;
    this.func = func;
    this.example = example;

    if (example === undefined && regexpr) {
      let s = "" + regexpr;
      if (s.startsWith("/") && s.endsWith("/")) {
        s = s.slice(1, s.length - 1);
      }

      if (s.startsWith("\\")) {
        s = s.slice(1, s.length);
      }
      s = s.trim();

      if (s.length === 1) {
        this.example = s;
      }
    }
  }
}

export class PUTIL_ParseError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

type StateEntry = [tokdef[], ((lexer: lexer) => boolean) | undefined];

export class lexer {
  tokdef: tokdef[];
  tokens: token[];
  lexpos: number;
  lexdata: string;
  colmap: number[] | undefined;
  lineno: number;
  printTokens: boolean;
  linestart: number;
  errfunc: ((lexer: lexer) => boolean) | undefined;
  linemap: number[] | undefined;
  tokints: Record<string, number>;
  statestack: [string, number][];
  states: Record<string, StateEntry>;
  statedata: number;
  peeked_tokens: token[];
  logger: (...args: unknown[]) => void;

  constructor(tokdefArr: tokdef[], errfunc?: (lexer: lexer) => boolean) {
    this.tokdef = tokdefArr;
    this.tokens = new Array();
    this.lexpos = 0;
    this.lexdata = "";
    this.colmap = undefined;
    this.lineno = 0;
    this.printTokens = false;
    this.linestart = 0;
    this.errfunc = errfunc;
    this.linemap = undefined;
    this.tokints = {};
    for (let i = 0; i < tokdefArr.length; i++) {
      this.tokints[tokdefArr[i].name] = i;
    }
    this.statestack = [["__main__", 0]];
    this.states = { "__main__": [tokdefArr, errfunc] };
    this.statedata = 0;
    this.peeked_tokens = [];

    this.logger = function (...args: unknown[]) {
      console.log(...args);
    };
  }

  add_state(name: string, tokdefArr: tokdef[], errfunc?: (lexer: lexer) => boolean): void {
    if (errfunc === undefined) {
      errfunc = function (_lexer: lexer): boolean {
        return true;
      };
    }
    this.states[name] = [tokdefArr, errfunc];
  }

  tok_int(_name: string): void {}

  push_state(state: string, statedata: number): void {
    this.statestack.push([state, statedata]);
    const st = this.states[state];
    this.statedata = statedata;
    this.tokdef = st[0];
    this.errfunc = st[1];
  }

  pop_state(): void {
    const item = this.statestack[this.statestack.length - 1];
    const state = this.states[item[0]];
    this.tokdef = state[0];
    this.errfunc = state[1];
    this.statedata = item[1];
  }

  input(str: string): void {
    const linemap = (this.linemap = new Array(str.length));
    let lineno = 0;
    let col = 0;
    const colmap = (this.colmap = new Array(str.length));

    for (let i = 0; i < str.length; i++, col++) {
      const c = str[i];

      linemap[i] = lineno;
      colmap[i] = col;

      if (c === "\n") {
        lineno++;
        col = 0;
      }
    }

    while (this.statestack.length > 1) {
      this.pop_state();
    }
    this.lexdata = str;
    this.lexpos = 0;
    this.lineno = 0;
    this.tokens = new Array();
    this.peeked_tokens = [];
  }

  error(): void {
    if (this.errfunc !== undefined && !this.errfunc(this)) return;

    const safepos = Math.min(this.lexpos, this.lexdata.length - 1);
    const line = this.linemap![safepos];
    const col = this.colmap![safepos];

    const s = print_lines(this.lexdata, line, col, true);

    this.logger("  " + s);
    this.logger("Syntax error near line " + (this.lineno + 1));

    throw new PUTIL_ParseError("Parse error");
  }

  peek(): token | undefined {
    const tok = this.next(true);
    if (tok === undefined) return undefined;
    this.peeked_tokens.push(tok);
    return tok;
  }

  peeknext(): token | undefined {
    if (this.peeked_tokens.length > 0) {
      return this.peeked_tokens[0];
    }

    return this.peek();
  }

  at_end(): boolean {
    return this.lexpos >= this.lexdata.length && this.peeked_tokens.length === 0;
  }

  //ignore_peek is optional, false
  next(ignore_peek?: boolean): token | undefined {
    if (!ignore_peek && this.peeked_tokens.length > 0) {
      const tok = this.peeked_tokens[0];
      this.peeked_tokens.shift();

      if (!ignore_peek && this.printTokens) {
        this.logger("" + tok);
      }

      return tok;
    }

    if (this.lexpos >= this.lexdata.length) return undefined;

    const ts = this.tokdef;
    const tlen = ts.length;
    const lexdata = this.lexdata.slice(this.lexpos, this.lexdata.length);
    const results: [tokdef, RegExpExecArray][] = [];

    for (let i = 0; i < tlen; i++) {
      const t = ts[i];
      if (t.re === undefined) continue;
      const res = t.re.exec(lexdata);
      if (res !== null && res !== undefined && res.index === 0) {
        results.push([t, res]);
      }
    }

    let max_res = 0;
    let theres: [tokdef, RegExpExecArray] | undefined = undefined;
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res[1][0].length > max_res) {
        theres = res;
        max_res = res[1][0].length;
      }
    }

    if (theres === undefined) {
      this.error();
      return;
    }

    const def = theres[0];
    const col = this.colmap![Math.min(this.lexpos, this.lexdata.length - 1)];

    if (this.lexpos < this.lexdata.length) {
      this.lineno = this.linemap![this.lexpos];
    }

    let tok: token | undefined = new token(def.name, theres[1][0], this.lexpos, this.lineno, this, undefined, col);
    this.lexpos += tok.value.length;

    if (def.func) {
      tok = def.func(tok);
      if (tok === undefined) {
        return this.next();
      }
    }

    if (!ignore_peek && this.printTokens) {
      this.logger("" + tok);
    }
    return tok;
  }
}

export class parser {
  lexer: lexer;
  errfunc: ((token: token | undefined, msg: string) => void) | undefined;
  start: ((p: parser) => unknown) | undefined;
  logger: (...args: unknown[]) => void;

  constructor(lex: lexer, errfunc?: (token: token | undefined, msg: string) => void) {
    this.lexer = lex;
    this.errfunc = errfunc;
    this.start = undefined;

    this.logger = function (...args: unknown[]) {
      console.log(...args);
    };
  }

  parse(data?: string, err_on_unconsumed?: boolean): unknown {
    if (err_on_unconsumed === undefined) err_on_unconsumed = true;

    if (data !== undefined) this.lexer.input(data);

    const ret = this.start!(this);

    if (err_on_unconsumed && !this.lexer.at_end() && this.lexer.next() !== undefined) {
      this.error(undefined, "parser did not consume entire input");
    }
    return ret;
  }

  input(data: string): void {
    this.lexer.input(data);
  }

  error(tokenObj: token | undefined, msg?: string): never {
    let estr: string;

    if (msg === undefined) msg = "";
    if (tokenObj === undefined) estr = "Parse error at end of input: " + msg;
    else estr = `Parse error at line ${tokenObj.lineno + 1}:${tokenObj.col + 1}: ${msg}`;

    let ld = this.lexer.lexdata;
    const lineno = tokenObj ? tokenObj.lineno : this.lexer.linemap![this.lexer.linemap!.length - 1];
    const col = tokenObj ? tokenObj.col : 0;

    ld = ld.replace(/\r/g, "");

    this.logger(print_lines(ld, lineno, col, true, tokenObj));
    this.logger(estr);

    if (this.errfunc) {
      this.errfunc(tokenObj, msg);
    }
    throw new PUTIL_ParseError(estr);
  }

  peek(): token | undefined {
    const tok = this.lexer.peek();
    if (tok !== undefined) tok.parser = this;
    return tok;
  }

  peeknext(): token | undefined {
    const tok = this.lexer.peeknext();
    if (tok !== undefined) tok.parser = this;
    return tok;
  }

  next(): token | undefined {
    const tok = this.lexer.next();

    if (tok !== undefined) tok.parser = this;
    return tok;
  }

  optional(type: string): boolean {
    const tok = this.peeknext();
    if (tok === undefined) return false;
    if (tok.type === type) {
      this.next();
      return true;
    }
    return false;
  }

  at_end(): boolean {
    return this.lexer.at_end();
  }

  expect(type: string, msg?: string): string {
    const tok = this.next();

    if (msg === undefined) {
      msg = type;

      for (const tk of this.lexer.tokdef) {
        if (tk.name === type && tk.example) {
          msg = tk.example;
        }
      }
    }

    if (tok === undefined || tok.type !== type) {
      this.error(tok, "Expected " + msg);
    }
    return tok!.value;
  }
}
