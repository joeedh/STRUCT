var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/struct_parser.ts
var struct_parser_exports = {};
__export(struct_parser_exports, {
  ArrayTypes: () => ArrayTypes,
  NStruct: () => NStruct,
  StructEnum: () => StructEnum,
  StructTypeMap: () => StructTypeMap,
  StructTypes: () => StructTypes,
  ValueTypes: () => ValueTypes,
  stripComments: () => stripComments,
  struct_parse: () => struct_parse
});

// src/struct_parseutil.ts
var struct_parseutil_exports = {};
__export(struct_parseutil_exports, {
  PUTIL_ParseError: () => PUTIL_ParseError,
  lexer: () => lexer,
  parser: () => parser,
  tokdef: () => tokdef,
  token: () => token
});

// src/struct_util.ts
var colormap = {
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "reset": 0,
  "grey": 2,
  "orange": 202,
  "pink": 198,
  "brown": 314,
  "lightred": 91,
  "peach": 210
};
var PARSE_STRUCTS_DUMMY = /* @__PURE__ */ Symbol.for("nstructjs.parseStructsDummy");
function isParseStructsDummy(cls) {
  return !!cls && !!cls[PARSE_STRUCTS_DUMMY];
}
function tab(n, chr = " ") {
  let t = "";
  for (let i = 0; i < n; i++) {
    t += chr;
  }
  return t;
}
var termColorMap = {};
for (const k in colormap) {
  termColorMap[k] = colormap[k];
  termColorMap[colormap[k]] = k;
}
function termColor(s, c) {
  let str;
  if (typeof s === "symbol") {
    str = s.toString();
  } else {
    str = "" + s;
  }
  let code2;
  if (typeof c === "string" && c in colormap) {
    code2 = colormap[c];
  } else {
    code2 = typeof c === "number" ? c : parseInt(c, 10);
  }
  if (code2 > 107) {
    const s2 = "\x1B[38;5;" + code2 + "m";
    return s2 + str + "\x1B[0m";
  }
  return "\x1B[" + code2 + "m" + str + "\x1B[0m";
}
function termPrint(...args) {
  let s = "";
  for (let i = 0; i < args.length; i++) {
    if (i > 0) {
      s += " ";
    }
    s += args[i];
  }
  const re1a = /\u001b\[[1-9][0-9]?m/;
  const re1b = /\u001b\[[1-9][0-9];[0-9][0-9]?;[0-9]+m/;
  const re2 = /\u001b\[0m/;
  const endtag = "\x1B[0m";
  function tok(s3, type) {
    return {
      type,
      value: s3
    };
  }
  const tokdefs = [
    [re1a, "start"],
    [re1b, "start"],
    [re2, "end"]
  ];
  let s2 = s;
  const tokens = [];
  while (s2.length > 0) {
    let ok = false;
    let mini = void 0;
    let minslice = void 0;
    let mintype = void 0;
    for (const tk of tokdefs) {
      const idx = s2.search(tk[0]);
      if (idx >= 0 && (mini === void 0 || idx < mini)) {
        const match = s2.slice(idx, s2.length).match(tk[0]);
        if (match) {
          minslice = match[0];
          mini = idx;
          mintype = tk[1];
          ok = true;
        }
      }
    }
    if (!ok) {
      break;
    }
    if (mini > 0) {
      const chunk = s2.slice(0, mini);
      tokens.push(tok(chunk, "chunk"));
    }
    s2 = s2.slice(mini + minslice.length, s2.length);
    const t = tok(minslice, mintype);
    tokens.push(t);
  }
  if (s2.length > 0) {
    tokens.push(tok(s2, "chunk"));
  }
  const stack = [];
  let cur;
  let out = "";
  for (const t of tokens) {
    if (t.type === "chunk") {
      out += t.value;
    } else if (t.type === "start") {
      stack.push(cur);
      cur = t.value;
      out += t.value;
    } else if (t.type === "end") {
      cur = stack.pop();
      if (cur) {
        out += cur;
      } else {
        out += endtag;
      }
    }
  }
  return out;
}
function list(iter) {
  const ret = [];
  for (const item of iter) {
    ret.push(item);
  }
  return ret;
}

// src/struct_parseutil.ts
function print_lines(ld, lineno, col, printColors, tokenObj) {
  let buf = "";
  const lines = ld.split("\n");
  const istart = Math.max(lineno - 5, 0);
  const iend = Math.min(lineno + 3, lines.length);
  const color = printColors ? (c) => c : termColor;
  for (let i = istart; i < iend; i++) {
    let l = "" + (i + 1);
    while (l.length < 3) {
      l = " " + l;
    }
    l += `: ${lines[i]}
`;
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
var token = class {
  constructor(type, val, lexpos, lineno, lex, p, col) {
    this.type = type;
    this.value = val;
    this.lexpos = lexpos;
    this.lineno = lineno;
    this.col = col;
    this.lexer = lex;
    this.parser = p;
  }
  toString() {
    if (this.value !== void 0) return "token(type=" + this.type + ", value='" + this.value + "')";
    else return "token(type=" + this.type + ")";
  }
};
var tokdef = class {
  constructor(name, regexpr, func, example) {
    this.name = name;
    this.re = regexpr;
    this.reSticky = regexpr ? new RegExp(regexpr.source, regexpr.flags.replace(/[gy]/g, "") + "y") : void 0;
    this.func = func;
    this.example = example;
    if (example === void 0 && regexpr) {
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
};
var PUTIL_ParseError = class extends Error {
  constructor(msg) {
    super(msg);
  }
};
var lexer = class {
  constructor(tokdefArr, errfunc) {
    this.tokdef = tokdefArr;
    this.tokens = new Array();
    this.lexpos = 0;
    this.lexdata = "";
    this.colmap = void 0;
    this.lineno = 0;
    this.printTokens = false;
    this.linestart = 0;
    this.errfunc = errfunc;
    this.linemap = void 0;
    this.tokints = {};
    for (let i = 0; i < tokdefArr.length; i++) {
      this.tokints[tokdefArr[i].name] = i;
    }
    this.statestack = [["__main__", 0]];
    this.states = { "__main__": [tokdefArr, errfunc] };
    this.statedata = 0;
    this.peeked_tokens = [];
    this.logger = function(...args) {
      console.log(...args);
    };
  }
  add_state(name, tokdefArr, errfunc) {
    if (errfunc === void 0) {
      errfunc = function(_lexer2) {
        return true;
      };
    }
    this.states[name] = [tokdefArr, errfunc];
  }
  tok_int(_name) {
  }
  push_state(state, statedata) {
    this.statestack.push([state, statedata]);
    const st = this.states[state];
    this.statedata = statedata;
    this.tokdef = st[0];
    this.errfunc = st[1];
  }
  pop_state() {
    const item = this.statestack[this.statestack.length - 1];
    const state = this.states[item[0]];
    this.tokdef = state[0];
    this.errfunc = state[1];
    this.statedata = item[1];
  }
  input(str) {
    const linemap = this.linemap = new Array(str.length);
    let lineno = 0;
    let col = 0;
    const colmap = this.colmap = new Array(str.length);
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
  error() {
    if (this.errfunc !== void 0 && !this.errfunc(this)) return;
    const safepos = Math.min(this.lexpos, this.lexdata.length - 1);
    const line = this.linemap[safepos];
    const col = this.colmap[safepos];
    const s = print_lines(this.lexdata, line, col, true);
    this.logger("  " + s);
    this.logger("Syntax error near line " + (this.lineno + 1));
    throw new PUTIL_ParseError("Parse error");
  }
  peek() {
    const tok = this.next(true);
    if (tok === void 0) return void 0;
    this.peeked_tokens.push(tok);
    return tok;
  }
  peek_i(i) {
    while (this.peeked_tokens.length <= i) {
      const tok = this.peek();
      if (tok === void 0) {
        return void 0;
      }
    }
    return this.peeked_tokens[i];
  }
  peeknext() {
    if (this.peeked_tokens.length > 0) {
      return this.peeked_tokens[0];
    }
    return this.peek();
  }
  at_end() {
    return this.lexpos >= this.lexdata.length && this.peeked_tokens.length === 0;
  }
  //ignore_peek is optional, false
  next(ignore_peek) {
    if (!ignore_peek && this.peeked_tokens.length > 0) {
      const tok2 = this.peeked_tokens[0];
      this.peeked_tokens.shift();
      if (!ignore_peek && this.printTokens) {
        this.logger("" + tok2);
      }
      return tok2;
    }
    if (this.lexpos >= this.lexdata.length) return void 0;
    const ts = this.tokdef;
    const tlen = ts.length;
    const lexpos = this.lexpos;
    const lexdata = this.lexdata;
    let max_res = 0;
    let theres = void 0;
    for (let i = 0; i < tlen; i++) {
      const t = ts[i];
      const re = t.reSticky;
      if (re === void 0) continue;
      re.lastIndex = lexpos;
      const res = re.exec(lexdata);
      if (res !== null && res[0].length > max_res) {
        theres = [t, res[0]];
        max_res = res[0].length;
      }
    }
    if (theres === void 0) {
      this.error();
      return;
    }
    const def = theres[0];
    const col = this.colmap[Math.min(this.lexpos, this.lexdata.length - 1)];
    if (this.lexpos < this.lexdata.length) {
      this.lineno = this.linemap[this.lexpos];
    }
    let tok = new token(def.name, theres[1], this.lexpos, this.lineno, this, void 0, col);
    this.lexpos += tok.value.length;
    if (def.func) {
      tok = def.func(tok);
      if (tok === void 0) {
        return this.next();
      }
    }
    if (!ignore_peek && this.printTokens) {
      this.logger("" + tok);
    }
    return tok;
  }
};
var parser = class {
  constructor(lex, errfunc) {
    this.lexer = lex;
    this.errfunc = errfunc;
    this.start = void 0;
    this.logger = function(...args) {
      console.log(...args);
    };
  }
  parse(data, err_on_unconsumed) {
    if (err_on_unconsumed === void 0) err_on_unconsumed = true;
    if (data !== void 0) this.lexer.input(data);
    const ret = this.start(this);
    if (err_on_unconsumed && !this.lexer.at_end() && this.lexer.next() !== void 0) {
      this.error(void 0, "parser did not consume entire input");
    }
    return ret;
  }
  input(data) {
    this.lexer.input(data);
  }
  error(tokenObj, msg) {
    let estr;
    if (msg === void 0) msg = "";
    if (tokenObj === void 0) estr = "Parse error at end of input: " + msg;
    else estr = `Parse error at line ${tokenObj.lineno + 1}:${tokenObj.col + 1}: ${msg}`;
    let ld = this.lexer.lexdata;
    const lineno = tokenObj ? tokenObj.lineno : this.lexer.linemap[this.lexer.linemap.length - 1];
    const col = tokenObj ? tokenObj.col : 0;
    ld = ld.replace(/\r/g, "");
    this.logger(print_lines(ld, lineno, col, true, tokenObj));
    this.logger(estr);
    if (this.errfunc) {
      this.errfunc(tokenObj, msg);
    }
    throw new PUTIL_ParseError(estr);
  }
  peek() {
    const tok = this.lexer.peek();
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  peek_i(i) {
    const tok = this.lexer.peek_i(i);
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  peeknext() {
    const tok = this.lexer.peeknext();
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  next() {
    const tok = this.lexer.next();
    if (tok !== void 0) tok.parser = this;
    return tok;
  }
  optional(type) {
    const tok = this.peeknext();
    if (tok === void 0) return false;
    if (tok.type === type) {
      this.next();
      return true;
    }
    return false;
  }
  at_end() {
    return this.lexer.at_end();
  }
  expect(type, msg) {
    const tok = this.next();
    if (msg === void 0) {
      msg = type;
      for (const tk of this.lexer.tokdef) {
        if (tk.name === type && tk.example) {
          msg = tk.example;
        }
      }
    }
    if (tok === void 0 || tok.type !== type) {
      this.error(tok, "Expected " + msg);
    }
    return tok.value;
  }
};

// src/types.ts
var StructEnum = {
  INT: 0,
  FLOAT: 1,
  DOUBLE: 2,
  STRING: 7,
  STATIC_STRING: 8,
  STRUCT: 9,
  TSTRUCT: 10,
  ARRAY: 11,
  ITER: 12,
  SHORT: 13,
  BYTE: 14,
  BOOL: 15,
  ITERKEYS: 16,
  UINT: 17,
  USHORT: 18,
  STATIC_ARRAY: 19,
  SIGNED_BYTE: 20,
  OPTIONAL: 21,
  ARRAYBUFFER: 22
};
var TokSymbol = /* @__PURE__ */ Symbol("token-info");
function setTokInfo(obj, info) {
  obj[TokSymbol] = info;
}
function getTokInfo(obj) {
  if (obj && typeof obj === "object") {
    return obj[TokSymbol];
  }
  return void 0;
}

// src/struct_parser.ts
var NStruct = class {
  constructor(name, loc) {
    this.fields = [];
    this.id = -1;
    this.name = name;
    this.loc = loc;
  }
};
var ArrayTypes = /* @__PURE__ */ new Set([
  StructEnum.STATIC_ARRAY,
  StructEnum.ARRAY,
  StructEnum.ITERKEYS,
  StructEnum.ITER
]);
var ValueTypes = /* @__PURE__ */ new Set([
  StructEnum.INT,
  StructEnum.FLOAT,
  StructEnum.DOUBLE,
  StructEnum.STRING,
  StructEnum.STATIC_STRING,
  StructEnum.SHORT,
  StructEnum.BYTE,
  StructEnum.BOOL,
  StructEnum.UINT,
  StructEnum.USHORT,
  StructEnum.SIGNED_BYTE
]);
var StructTypes = {
  "int": StructEnum.INT,
  "uint": StructEnum.UINT,
  "ushort": StructEnum.USHORT,
  "float": StructEnum.FLOAT,
  "double": StructEnum.DOUBLE,
  "string": StructEnum.STRING,
  "static_string": StructEnum.STATIC_STRING,
  "struct": StructEnum.STRUCT,
  "abstract": StructEnum.TSTRUCT,
  "array": StructEnum.ARRAY,
  "iter": StructEnum.ITER,
  "short": StructEnum.SHORT,
  "byte": StructEnum.BYTE,
  "bool": StructEnum.BOOL,
  "iterkeys": StructEnum.ITERKEYS,
  "sbyte": StructEnum.SIGNED_BYTE,
  "optional": StructEnum.OPTIONAL
};
var StructTypeMap = {};
for (const k in StructTypes) {
  StructTypeMap[StructTypes[k]] = k;
}
function gen_tabstr(t) {
  let s = "";
  for (let i = 0; i < t; i++) {
    s += "  ";
  }
  return s;
}
function stripComments(buf) {
  let s = "";
  const MAIN = 0, COMMENT = 1, STR = 2;
  let n;
  let strs = /* @__PURE__ */ new Set(["'", '"', "`"]);
  let mode = MAIN;
  let strlit = "";
  let escape = false;
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    n = i < buf.length - 1 ? buf[i + 1] : void 0;
    switch (mode) {
      case MAIN:
        if (c === "/" && n === "/") {
          mode = COMMENT;
          continue;
        }
        if (strs.has(c)) {
          strlit = c;
          mode = STR;
        }
        s += c;
        break;
      case COMMENT:
        if (n === "\n") {
          mode = MAIN;
        }
        break;
      case STR:
        if (c === strlit && !escape) {
          mode = MAIN;
        }
        s += c;
        break;
    }
    if (c === "\\") {
      escape = !escape;
    } else {
      escape = false;
    }
  }
  return s;
}
function StructParser() {
  const basic_types = /* @__PURE__ */ new Set(["int", "float", "double", "string", "short", "byte", "sbyte", "bool", "uint", "ushort"]);
  const arraybuffer_types = /* @__PURE__ */ new Set(["int", "uint", "short", "ushort", "byte", "sbyte", "float", "double"]);
  const reserved_tokens = /* @__PURE__ */ new Set([
    "int",
    "float",
    "double",
    "string",
    "static_string",
    "array",
    "iter",
    "abstract",
    "short",
    "byte",
    "sbyte",
    "bool",
    "iterkeys",
    "uint",
    "ushort",
    "static_array",
    "optional"
  ]);
  function tk(name, re, func, example) {
    return new tokdef(name, re, func, example);
  }
  const tokens = [
    tk(
      "ID",
      /[a-zA-Z_$]+[a-zA-Z0-9_\.$]*/,
      function(t) {
        if (reserved_tokens.has(t.value)) {
          t.type = t.value.toUpperCase();
        }
        return t;
      },
      "identifier"
    ),
    tk("OPEN", /\{/),
    tk("EQUALS", /=/),
    tk("CLOSE", /}/),
    tk("STRLIT", /\"[^"]*\"/, (t) => {
      t.value = t.value.slice(1, t.value.length - 1);
      return t;
    }),
    tk("STRLIT", /\'[^']*\'/, (t) => {
      t.value = t.value.slice(1, t.value.length - 1);
      return t;
    }),
    tk("COLON", /:/),
    tk("OPT_COLON", /\?:/),
    tk("SOPEN", /\[/),
    tk("SCLOSE", /\]/),
    tk("JSCRIPT", /\|/, function(t) {
      let js = "";
      const lex2 = t.lexer;
      let p;
      while (lex2.lexpos < lex2.lexdata.length) {
        const c = lex2.lexdata[lex2.lexpos];
        if (c === "\n") break;
        if (c === "/" && p === "/") {
          js = js.slice(0, js.length - 1);
          lex2.lexpos--;
          break;
        }
        js += c;
        lex2.lexpos++;
        p = c;
      }
      while (js.trim().endsWith(";")) {
        js = js.slice(0, js.length - 1);
        lex2.lexpos--;
      }
      t.value = js.trim();
      return t;
    }),
    tk("COMMENT", /\/\/.*[\n\r]/),
    tk("LPARAM", /\(/),
    tk("RPARAM", /\)/),
    tk("COMMA", /,/),
    tk("NUM", /[0-9]+/, void 0, "number"),
    tk("SEMI", /;/),
    tk(
      "NEWLINE",
      /\n/,
      function(t) {
        t.lexer.lineno += 1;
        return void 0;
      },
      "newline"
    ),
    tk(
      "SPACE",
      / |\t/,
      function(_t) {
        return void 0;
      },
      "whitespace"
    )
  ];
  reserved_tokens.forEach(function(rt) {
    tokens.push(tk(rt.toUpperCase()));
  });
  function errfunc(_lexer) {
    return true;
  }
  class Lexer extends lexer {
    input(str) {
      return super.input(str);
    }
  }
  const lex = new Lexer(tokens, errfunc);
  const parserInst = new parser(lex);
  function p_Static_String(p) {
    p.expect("STATIC_STRING");
    p.expect("SOPEN");
    const num = parseInt(p.expect("NUM"), 10);
    p.expect("SCLOSE");
    return { type: StructEnum.STATIC_STRING, data: { maxlength: num } };
  }
  function p_ArrayBuffer(p) {
    const tok1 = p.peek_i(0);
    const tok2 = p.peek_i(1);
    if (!tok1 || !tok2) {
      return void 0;
    }
    if (tok1.type !== "ID" || tok1.value !== "arraybuffer" || tok2.type !== "LPARAM") {
      return void 0;
    }
    p.next();
    p.next();
    const type = p.next();
    if (type === void 0) {
      return p.error(void 0, "Expected type for arraybuffer");
    }
    const tname = type.value.toLowerCase();
    if (!arraybuffer_types.has(tname)) {
      p.error(type, "Expected a numeric element type for arraybuffer, got '" + type.value + "'");
    }
    p.expect("RPARAM");
    return { type: StructEnum.ARRAYBUFFER, data: { type: tname } };
  }
  function p_Array(p) {
    p.expect("ARRAY");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = (arraytype.data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return { type: StructEnum.ARRAY, data: { type: arraytype, iname: itername } };
  }
  function p_Iter(p) {
    p.expect("ITER");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = (arraytype.data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return { type: StructEnum.ITER, data: { type: arraytype, iname: itername } };
  }
  function p_StaticArray(p) {
    p.expect("STATIC_ARRAY");
    p.expect("SOPEN");
    const arraytype = p_Type(p);
    let itername = "";
    p.expect("COMMA");
    let size = parseInt(p.expect("NUM"), 10);
    if (size < 0 || Math.abs(size - Math.floor(size)) > 1e-6) {
      p.error(void 0, "Expected an integer");
    }
    size = Math.floor(size);
    if (p.optional("COMMA")) {
      const td = p_Type(p);
      itername = td.data || "";
    }
    p.expect("SCLOSE");
    return { type: StructEnum.STATIC_ARRAY, data: { type: arraytype, size, iname: itername } };
  }
  function p_IterKeys(p) {
    p.expect("ITERKEYS");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = (arraytype.data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return { type: StructEnum.ITERKEYS, data: { type: arraytype, iname: itername } };
  }
  function p_Abstract(p) {
    p.expect("ABSTRACT");
    p.expect("LPARAM");
    const type = p.expect("ID");
    let jsonKeyword = "_structName";
    if (p.optional("COMMA")) {
      jsonKeyword = p.expect("STRLIT");
    }
    p.expect("RPARAM");
    return {
      type: StructEnum.TSTRUCT,
      data: type,
      jsonKeyword
    };
  }
  function p_Optional(p) {
    p.expect("OPTIONAL");
    p.expect("LPARAM");
    const type = p_Type(p);
    p.expect("RPARAM");
    return {
      type: StructEnum.OPTIONAL,
      data: type
    };
  }
  function p_Type(p) {
    const tok = p.peeknext();
    if (!tok) {
      p.error(void 0, "Unexpected end of input");
    }
    const pbuffer = p_ArrayBuffer(p);
    if (pbuffer) {
      return pbuffer;
    } else if (tok.type === "ID") {
      p.next();
      return { type: StructEnum.STRUCT, data: tok.value };
    } else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return { type: StructTypes[tok.type.toLowerCase()] };
    } else if (tok.type === "ARRAY") {
      return p_Array(p);
    } else if (tok.type === "ITER") {
      return p_Iter(p);
    } else if (tok.type === "ITERKEYS") {
      return p_IterKeys(p);
    } else if (tok.type === "STATIC_ARRAY") {
      return p_StaticArray(p);
    } else if (tok.type === "STATIC_STRING") {
      return p_Static_String(p);
    } else if (tok.type === "ABSTRACT") {
      return p_Abstract(p);
    } else if (tok.type === "DATAREF") {
      p.error(tok, "DATAREF type is not supported");
    } else if (tok.type === "OPTIONAL") {
      return p_Optional(p);
    } else {
      p.error(tok, "invalid type " + tok.type);
    }
  }
  function p_ID_or_num(p) {
    const t = p.peeknext();
    if (t && t.type === "NUM") {
      p.next();
      return t.value;
    } else {
      return p.expect("ID", "struct field name");
    }
  }
  function p_Field(p) {
    const name = p_ID_or_num(p);
    const loc = getLoc(p);
    let is_opt = false;
    const next = p.peeknext();
    if (next && next.type === "OPT_COLON") {
      p.expect("OPT_COLON");
      is_opt = true;
    } else {
      p.expect("COLON");
    }
    let type = p_Type(p);
    if (is_opt) {
      type = {
        type: StructEnum.OPTIONAL,
        data: type
      };
    }
    let get = void 0;
    let tok = p.peeknext();
    if (tok && tok.type === "JSCRIPT") {
      get = tok.value;
      p.next();
    }
    p.expect("SEMI");
    tok = p.peeknext();
    let comment = "";
    if (tok && tok.type === "COMMENT") {
      comment = tok.value;
      p.next();
    }
    return { name, type, get, comment, loc };
  }
  const getLoc = (p) => {
    return {
      line: p.lexer.lineno,
      column: p.lexer.colmap[p.lexer.lexpos]
    };
  };
  function p_Struct(p) {
    const name = p.expect("ID", "struct name");
    const st = new NStruct(name, getLoc(p));
    let tok = p.peeknext();
    if (tok && tok.type === "ID" && tok.value === "id") {
      p.next();
      p.expect("EQUALS");
      st.id = parseInt(p.expect("NUM"), 10);
    }
    p.expect("OPEN");
    while (true) {
      if (p.at_end()) {
        p.error(void 0);
      } else if (p.optional("CLOSE")) {
        break;
      } else {
        st.fields.push(p_Field(p));
      }
    }
    return st;
  }
  parserInst.start = p_Struct;
  return parserInst;
}
var struct_parse = StructParser();

// src/struct_typesystem.ts
var struct_typesystem_exports = {};

// src/struct_binpack.ts
var struct_binpack_exports = {};
__export(struct_binpack_exports, {
  BinWriter: () => BinWriter,
  STRUCT_ENDIAN: () => STRUCT_ENDIAN,
  decode_utf8: () => decode_utf8,
  encode_utf8: () => encode_utf8,
  pack_byte: () => pack_byte,
  pack_bytes: () => pack_bytes,
  pack_double: () => pack_double,
  pack_float: () => pack_float,
  pack_int: () => pack_int,
  pack_sbyte: () => pack_sbyte,
  pack_short: () => pack_short,
  pack_static_string: () => pack_static_string,
  pack_string: () => pack_string,
  pack_uint: () => pack_uint,
  pack_ushort: () => pack_ushort,
  setBinaryEndian: () => setBinaryEndian,
  temp_dataview: () => temp_dataview,
  test_utf8: () => test_utf8,
  uint8_view: () => uint8_view,
  unpack_byte: () => unpack_byte,
  unpack_bytes: () => unpack_bytes,
  unpack_context: () => unpack_context,
  unpack_double: () => unpack_double,
  unpack_float: () => unpack_float,
  unpack_int: () => unpack_int,
  unpack_sbyte: () => unpack_sbyte,
  unpack_short: () => unpack_short,
  unpack_static_string: () => unpack_static_string,
  unpack_string: () => unpack_string,
  unpack_uint: () => unpack_uint,
  unpack_ushort: () => unpack_ushort
});
var STRUCT_ENDIAN = true;
function setBinaryEndian(mode) {
  STRUCT_ENDIAN = !!mode;
}
var temp_dataview = new DataView(new ArrayBuffer(16));
var uint8_view = new Uint8Array(temp_dataview.buffer);
var unpack_context = class {
  constructor(version = 0) {
    this.i = 0;
    this.version = version;
  }
};
var BinWriter = class {
  constructor(initialCapacity = 4096) {
    this._isBinWriter = true;
    this.length = 0;
    this.buf = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buf.buffer);
  }
  ensure(n) {
    const need = this.length + n;
    if (need > this.buf.length) {
      let cap = this.buf.length * 2;
      while (cap < need) {
        cap *= 2;
      }
      const nb = new Uint8Array(cap);
      nb.set(this.buf);
      this.buf = nb;
      this.view = new DataView(nb.buffer);
    }
  }
  push(v) {
    this.ensure(1);
    this.buf[this.length++] = v;
  }
  pushBytes(bytes) {
    const n = bytes.length;
    this.ensure(n);
    this.buf.set(bytes, this.length);
    this.length += n;
  }
  i16(v) {
    this.ensure(2);
    this.view.setInt16(this.length, v, STRUCT_ENDIAN);
    this.length += 2;
  }
  u16(v) {
    this.ensure(2);
    this.view.setUint16(this.length, v, STRUCT_ENDIAN);
    this.length += 2;
  }
  i32(v) {
    this.ensure(4);
    this.view.setInt32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }
  u32(v) {
    this.ensure(4);
    this.view.setUint32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }
  f32(v) {
    this.ensure(4);
    this.view.setFloat32(this.length, v, STRUCT_ENDIAN);
    this.length += 4;
  }
  f64(v) {
    this.ensure(8);
    this.view.setFloat64(this.length, v, STRUCT_ENDIAN);
    this.length += 8;
  }
  /** Reserve n bytes (zero-filled) and return their offset, for back-patching. */
  reserve(n) {
    this.ensure(n);
    const off = this.length;
    this.buf.fill(0, off, off + n);
    this.length += n;
    return off;
  }
  patchI32(offset, v) {
    this.view.setInt32(offset, v, STRUCT_ENDIAN);
  }
  /** Used bytes as a view over the internal buffer (no copy). */
  finish() {
    return this.buf.subarray(0, this.length);
  }
  /** Used bytes as an exact-size copy (safe to grab .buffer of). */
  toBytes() {
    return this.buf.slice(0, this.length);
  }
};
function pack_byte(array, val) {
  array.push(val);
}
function pack_sbyte(array, val) {
  if (val < 0) {
    val = 256 + val;
  }
  array.push(val);
}
function pack_bytes(array, bytes) {
  if (array._isBinWriter) {
    array.pushBytes(bytes);
    return;
  }
  for (let i = 0; i < bytes.length; i++) {
    array.push(bytes[i]);
  }
}
function pack_int(array, val) {
  if (array._isBinWriter) {
    array.i32(val);
    return;
  }
  temp_dataview.setInt32(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}
function pack_uint(array, val) {
  if (array._isBinWriter) {
    array.u32(val);
    return;
  }
  temp_dataview.setUint32(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}
function pack_ushort(array, val) {
  if (array._isBinWriter) {
    array.u16(val);
    return;
  }
  temp_dataview.setUint16(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}
function pack_float(array, val) {
  if (array._isBinWriter) {
    array.f32(val);
    return;
  }
  temp_dataview.setFloat32(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}
function pack_double(array, val) {
  if (array._isBinWriter) {
    array.f64(val);
    return;
  }
  temp_dataview.setFloat64(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
  array.push(uint8_view[4]);
  array.push(uint8_view[5]);
  array.push(uint8_view[6]);
  array.push(uint8_view[7]);
}
function pack_short(array, val) {
  if (array._isBinWriter) {
    array.i16(val);
    return;
  }
  temp_dataview.setInt16(0, val, STRUCT_ENDIAN);
  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}
function encode_utf8(arr, str) {
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    while (c !== 0) {
      let uc = c & 127;
      c = c >> 7;
      if (c !== 0) uc |= 128;
      arr.push(uc);
    }
  }
}
function decode_utf8(arr) {
  let str = "";
  let i = 0;
  while (i < arr.length) {
    let c = arr[i];
    let sum = c & 127;
    let j = 0;
    while (i < arr.length && c & 128) {
      j += 7;
      i++;
      c = arr[i];
      c = (c & 127) << j;
      sum |= c;
    }
    if (sum === 0) break;
    str += String.fromCharCode(sum);
    i++;
  }
  return str;
}
function test_utf8() {
  const s = "a" + String.fromCharCode(8800) + "b";
  const arr = [];
  encode_utf8(arr, s);
  const s2 = decode_utf8(arr);
  if (s !== s2) {
    throw new Error("UTF-8 encoding/decoding test failed");
  }
  return true;
}
function truncate_utf8(arr, maxlen) {
  const len = Math.min(arr.length, maxlen);
  let last_codepoint = 0;
  let last2 = 0;
  let incode;
  let i = 0;
  while (i < len) {
    incode = arr[i] & 128;
    if (!incode) {
      last2 = last_codepoint + 1;
      last_codepoint = i + 1;
    }
    i++;
  }
  if (last_codepoint < maxlen) arr.length = last_codepoint;
  else arr.length = last2;
  return arr;
}
var _static_sbuf_ss = new Array(2048);
function pack_static_string(data, str, length) {
  if (length === void 0) throw new Error("'length' parameter is not optional for pack_static_string()");
  const arr = length < 2048 ? _static_sbuf_ss : new Array();
  arr.length = 0;
  encode_utf8(arr, str);
  truncate_utf8(arr, length);
  for (let i = arr.length; i < length; i++) {
    arr.push(0);
  }
  arr.length = length;
  pack_bytes(data, arr);
}
var _static_sbuf = new Array(32);
function pack_string(data, str) {
  _static_sbuf.length = 0;
  encode_utf8(_static_sbuf, str);
  pack_int(data, _static_sbuf.length);
  pack_bytes(data, _static_sbuf);
}
function unpack_bytes(dview, uctx, len) {
  const ret = new DataView(dview.buffer.slice(uctx.i, uctx.i + len));
  uctx.i += len;
  return ret;
}
function unpack_byte(dview, uctx) {
  return dview.getUint8(uctx.i++);
}
function unpack_sbyte(dview, uctx) {
  return dview.getInt8(uctx.i++);
}
function unpack_int(dview, uctx) {
  uctx.i += 4;
  return dview.getInt32(uctx.i - 4, STRUCT_ENDIAN);
}
function unpack_uint(dview, uctx) {
  uctx.i += 4;
  return dview.getUint32(uctx.i - 4, STRUCT_ENDIAN);
}
function unpack_ushort(dview, uctx) {
  uctx.i += 2;
  return dview.getUint16(uctx.i - 2, STRUCT_ENDIAN);
}
function unpack_float(dview, uctx) {
  uctx.i += 4;
  return dview.getFloat32(uctx.i - 4, STRUCT_ENDIAN);
}
function unpack_double(dview, uctx) {
  uctx.i += 8;
  return dview.getFloat64(uctx.i - 8, STRUCT_ENDIAN);
}
function unpack_short(dview, uctx) {
  uctx.i += 2;
  return dview.getInt16(uctx.i - 2, STRUCT_ENDIAN);
}
var _static_arr_us = new Array(32);
function unpack_string(data, uctx) {
  const slen = unpack_int(data, uctx);
  if (!slen) {
    return "";
  }
  const arr = slen < 2048 ? _static_arr_us : new Array(slen);
  arr.length = slen;
  const p = uctx.i;
  for (let i = 0; i < slen; i++) {
    arr[i] = data.getUint8(p + i);
  }
  uctx.i += slen;
  return decode_utf8(arr);
}
var _static_arr_uss = new Array(2048);
function unpack_static_string(data, uctx, length) {
  if (length === void 0) throw new Error("'length' cannot be undefined in unpack_static_string()");
  const arr = length < 2048 ? _static_arr_uss : new Array(length);
  arr.length = 0;
  const p = uctx.i;
  let done = false;
  for (let i = 0; i < length; i++) {
    const c = data.getUint8(p + i);
    if (c === 0) {
      done = true;
    }
    if (!done && c !== 0) {
      arr.push(c);
    }
  }
  uctx.i += length;
  truncate_utf8(arr, length);
  return decode_utf8(arr);
}

// src/struct_filehelper.ts
var struct_filehelper_exports = {};
__export(struct_filehelper_exports, {
  Block: () => Block,
  FileError: () => FileError,
  FileHelper: () => FileHelper,
  FileParams: () => FileParams,
  versionCoerce: () => versionCoerce,
  versionLessThan: () => versionLessThan,
  versionToInt: () => versionToInt
});

// src/struct_intern2.ts
var struct_intern2_exports = {};
__export(struct_intern2_exports, {
  StructFieldType: () => StructFieldType,
  StructFieldTypeMap: () => StructFieldTypeMap,
  StructFieldTypes: () => StructFieldTypes,
  _get_pack_debug: () => _get_pack_debug,
  do_pack: () => do_pack,
  formatArrayJson: () => formatArrayJson,
  formatJSON: () => formatJSON,
  fromJSON: () => fromJSON,
  packNull: () => packNull,
  setDebugMode2: () => setDebugMode2,
  setWarningMode2: () => setWarningMode2,
  toJSON: () => toJSON,
  validateJSON: () => validateJSON
});
var warninglvl = 2;
var debug = 0;
var _static_envcode_null = "";
var packer_debug;
var packer_debug_start;
var packer_debug_end;
var packdebug_tablevel = 0;
function _get_pack_debug() {
  return {
    packer_debug,
    packer_debug_start,
    packer_debug_end,
    debug,
    warninglvl
  };
}
var cachering = class _cachering extends Array {
  constructor(cb, tot) {
    super();
    this.length = tot;
    this.cur = 0;
    for (let i = 0; i < tot; i++) {
      this[i] = cb();
    }
  }
  static fromConstructor(cls, tot) {
    return new _cachering(() => new cls(), tot);
  }
  next() {
    let ret = this[this.cur];
    this.cur = (this.cur + 1) % this.length;
    return ret;
  }
};
function gen_tabstr2(tot) {
  let ret = "";
  for (let i = 0; i < tot; i++) {
    ret += " ";
  }
  return ret;
}
function setWarningMode2(t) {
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }
  warninglvl = t;
}
function setDebugMode2(t) {
  debug = t;
  if (debug) {
    packer_debug = function(...args) {
      let tab2 = gen_tabstr2(packdebug_tablevel);
      if (args.length > 0) {
        console.warn(tab2, ...args);
      } else {
        console.warn("Warning: undefined msg");
      }
    };
    packer_debug_start = function(funcname) {
      packer_debug("Start " + funcname);
      packdebug_tablevel++;
    };
    packer_debug_end = function(funcname) {
      packdebug_tablevel--;
      if (funcname) {
        packer_debug("Leave " + funcname);
      }
    };
  } else {
    packer_debug = function(..._args) {
    };
    packer_debug_start = function(..._args) {
    };
    packer_debug_end = function(..._args) {
    };
  }
}
setDebugMode2(debug);
var StructFieldTypes = [];
var StructFieldTypeMap = {};
function packNull(manager2, data, field, type) {
  StructFieldTypeMap[type.type].packNull(manager2, data, field, type);
}
function toJSON(manager2, val, obj, field, type) {
  return StructFieldTypeMap[type.type].toJSON(manager2, val, obj, field, type);
}
function fromJSON(manager2, val, obj, field, type, instance) {
  return StructFieldTypeMap[type.type].fromJSON(manager2, val, obj, field, type, instance);
}
function formatJSON(manager2, val, obj, field, type, instance, tlvl = 0) {
  return StructFieldTypeMap[type.type].formatJSON(manager2, val, obj, field, type, instance, tlvl);
}
function validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
  return StructFieldTypeMap[type.type].validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
}
function unpack_field(manager2, data, type, uctx) {
  let name;
  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("R " + name);
  }
  let ret = StructFieldTypeMap[type.type].unpack(manager2, data, type, uctx);
  if (debug) {
    packer_debug_end();
  }
  return ret;
}
var fakeFields = new cachering(() => {
  return { type: void 0, get: void 0 };
}, 256);
function unpackPrimitiveBulk(data, etype, len, uctx, arr) {
  let p = uctx.i;
  switch (etype) {
    case StructEnum.BYTE:
      for (let i = 0; i < len; i++) arr[i] = data.getUint8(p + i);
      p += len;
      break;
    case StructEnum.SIGNED_BYTE:
      for (let i = 0; i < len; i++) arr[i] = data.getInt8(p + i);
      p += len;
      break;
    case StructEnum.BOOL:
      for (let i = 0; i < len; i++) arr[i] = !!data.getUint8(p + i);
      p += len;
      break;
    case StructEnum.SHORT:
      for (let i = 0; i < len; i++, p += 2) arr[i] = data.getInt16(p, STRUCT_ENDIAN);
      break;
    case StructEnum.USHORT:
      for (let i = 0; i < len; i++, p += 2) arr[i] = data.getUint16(p, STRUCT_ENDIAN);
      break;
    case StructEnum.INT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getInt32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.UINT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getUint32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.FLOAT:
      for (let i = 0; i < len; i++, p += 4) arr[i] = data.getFloat32(p, STRUCT_ENDIAN);
      break;
    case StructEnum.DOUBLE:
      for (let i = 0; i < len; i++, p += 8) arr[i] = data.getFloat64(p, STRUCT_ENDIAN);
      break;
    default:
      return false;
  }
  uctx.i = p;
  return true;
}
function packPrimitiveBulk(data, etype, arr, n = arr.length) {
  switch (etype) {
    case StructEnum.BYTE:
      if (data._isBinWriter && n === arr.length) {
        data.pushBytes(arr);
      } else {
        for (let i = 0; i < n; i++) pack_byte(data, arr[i]);
      }
      break;
    case StructEnum.SIGNED_BYTE:
      for (let i = 0; i < n; i++) pack_sbyte(data, arr[i]);
      break;
    case StructEnum.BOOL:
      for (let i = 0; i < n; i++) pack_byte(data, arr[i] ? 1 : 0);
      break;
    case StructEnum.SHORT:
      for (let i = 0; i < n; i++) pack_short(data, arr[i]);
      break;
    case StructEnum.USHORT:
      for (let i = 0; i < n; i++) pack_ushort(data, arr[i]);
      break;
    case StructEnum.INT:
      for (let i = 0; i < n; i++) pack_int(data, arr[i]);
      break;
    case StructEnum.UINT:
      for (let i = 0; i < n; i++) pack_uint(data, arr[i]);
      break;
    case StructEnum.FLOAT:
      for (let i = 0; i < n; i++) pack_float(data, arr[i]);
      break;
    case StructEnum.DOUBLE:
      for (let i = 0; i < n; i++) pack_double(data, arr[i]);
      break;
    default:
      return false;
  }
  return true;
}
function isBulkArray(val) {
  return Array.isArray(val) || ArrayBuffer.isView(val) && !(val instanceof DataView);
}
function unpackByteTyped(data, etype, len, uctx) {
  if (etype !== StructEnum.BYTE && etype !== StructEnum.SIGNED_BYTE) {
    return null;
  }
  const abs = data.byteOffset + uctx.i;
  const slice = data.buffer.slice(abs, abs + len);
  uctx.i += len;
  return etype === StructEnum.BYTE ? new Uint8Array(slice) : new Int8Array(slice);
}
function fmt_type(type) {
  return StructFieldTypeMap[type.type].format(type);
}
function do_pack(manager2, data, val, obj, field, type) {
  let name;
  if (debug) {
    name = StructFieldTypeMap[type.type !== void 0 ? type.type : type].define().name;
    packer_debug_start("W " + name);
  }
  let typeid;
  if (typeof type !== "number") {
    typeid = type.type;
  } else {
    typeid = type;
  }
  let ret = StructFieldTypeMap[typeid].pack(manager2, data, val, obj, field, type);
  if (debug) {
    packer_debug_end();
  }
  return ret;
}
var _ws_env = [["", void 0]];
var StructFieldType = class _StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
  }
  static unpack(_manager, _data, _type, _uctx) {
    return void 0;
  }
  static packNull(manager2, data, field, type) {
    this.pack(manager2, data, 0, 0, field, type);
  }
  static format(type) {
    return this.define().name;
  }
  static toJSON(manager2, val, obj, field, type) {
    return val;
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return val;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return JSON.stringify(val);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return { ok: true };
  }
  /**
   return false to override default
   helper js for packing
   */
  static useHelperJS(field) {
    return true;
  }
  /**
     Define field class info.
  
     Example:
     <pre>
     static define() {return {
      type : StructEnum.INT,
      name : "int"
    }}
     </pre>
     */
  static define() {
    return {
      type: -1,
      name: "(error)"
    };
  }
  /**
   Register field packer/unpacker class.  Will throw an error if define() method is bad.
   */
  static register(cls) {
    if (StructFieldTypes.indexOf(cls) >= 0) {
      throw new Error("class already registered");
    }
    if (cls.define === _StructFieldType.define) {
      throw new Error("you forgot to make a define() static method");
    }
    if (cls.define().type === void 0) {
      throw new Error("cls.define().type was undefined!");
    }
    if (cls.define().type in StructFieldTypeMap) {
      throw new Error("type " + cls.define().type + " is used by another StructFieldType subclass");
    }
    StructFieldTypes.push(cls);
    StructFieldTypeMap[cls.define().type] = cls;
  }
};
var StructIntField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_int(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_int(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.INT,
      name: "int"
    };
  }
};
StructFieldType.register(StructIntField);
var StructFloatField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_float(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_float(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number") {
      return { ok: "Not a float: " + val, tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.FLOAT,
      name: "float"
    };
  }
};
StructFieldType.register(StructFloatField);
var StructDoubleField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_double(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_double(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number") {
      return { ok: "Not a double: " + val, tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.DOUBLE,
      name: "double"
    };
  }
};
StructFieldType.register(StructDoubleField);
var StructStringField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const s = !val ? "" : val;
    pack_string(data, s);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "string") {
      return { ok: "Not a string: " + val, tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static packNull(manager2, data, field, type) {
    this.pack(manager2, data, "", 0, field, type);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_string(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.STRING,
      name: "string"
    };
  }
};
StructFieldType.register(StructStringField);
var StructStaticStringField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const s = !val ? "" : val;
    pack_static_string(data, s, type.data.maxlength);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "string") {
      return { ok: "Not a string: " + val, tokInfo: getTokInfo(obj) };
    }
    if (val.length > type.data.maxlength) {
      return {
        ok: "String is too big; limit is " + type.data.maxlength + "; string:" + val,
        tokInfo: getTokInfo(obj)
      };
    }
    return { ok: true };
  }
  static format(type) {
    return `static_string[${type.data.maxlength}]`;
  }
  static packNull(manager2, data, field, type) {
    this.pack(manager2, data, "", 0, field, type);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_static_string(data, uctx, type.data.maxlength);
  }
  static define() {
    return {
      type: StructEnum.STATIC_STRING,
      name: "static_string"
    };
  }
};
StructFieldType.register(StructStaticStringField);
var StructStructField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    let stt;
    if (manager2.onSerializeUnknown) {
      const overrideName = manager2.onSerializeUnknown(val);
      if (overrideName !== void 0) {
        stt = manager2.get_struct(overrideName);
      }
    }
    if (stt === void 0) {
      stt = manager2.get_struct(type.data);
    }
    packer_debug("struct", stt.name);
    manager2.write_struct(data, val, stt);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    let stt = manager2.get_struct(type.data);
    if (!val) {
      return { ok: "Expected " + stt.name + " object", tokInfo: getTokInfo(obj) };
    }
    return manager2.validateJSONIntern(val, stt, _abstractKey);
  }
  static format(type) {
    return type.data;
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    let stt = manager2.get_struct(type.data);
    return manager2.readJSON(val, stt, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    let stt = manager2.get_struct(type.data);
    return manager2.formatJSON_intern(val, stt, field, tlvl);
  }
  static toJSON(manager2, val, obj, field, type) {
    let stt = manager2.get_struct(type.data);
    return manager2.writeJSON(val, stt);
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let cls2 = manager2.get_struct_cls(type.data);
    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager2.read_object(data, cls2, uctx, dest);
  }
  static packNull(manager2, data, field, type) {
    let stt = manager2.get_struct(type.data);
    packer_debug("struct", type);
    for (let field2 of stt.fields) {
      let type2 = field2.type;
      packNull(manager2, data, field2, type2);
    }
  }
  static unpack(manager2, data, type, uctx) {
    let cls2 = manager2.get_struct_cls(type.data);
    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager2.read_object(data, cls2, uctx);
  }
  static define() {
    return {
      type: StructEnum.STRUCT,
      name: "struct"
    };
  }
};
StructFieldType.register(StructStructField);
var StructTStructField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    let cls = manager2.get_struct_cls(type.data);
    let stt = manager2.get_struct(type.data);
    const keywords = manager2.constructor.keywords;
    if (manager2.onSerializeUnknown) {
      const overrideName = manager2.onSerializeUnknown(val);
      if (overrideName !== void 0) {
        const ostt = manager2.get_struct(overrideName);
        if (debug) packer_debug("int " + ostt.id);
        pack_int(data, ostt.id);
        manager2.write_struct(data, val, ostt);
        return;
      }
    }
    const valObj = val;
    const valCtor = valObj.constructor;
    if (valCtor.structName !== type.data && val instanceof cls) {
      stt = manager2.get_struct(valCtor.structName);
    } else if (valCtor.structName === type.data) {
      stt = manager2.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct " + valCtor.structName + " passed to write_struct");
    }
    if (debug) packer_debug("int " + stt.id);
    pack_int(data, stt.id);
    manager2.write_struct(data, val, stt);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    let key = type.jsonKeyword;
    if (typeof val !== "object") {
      return { ok: typeof val + " is not an object", tokInfo: getTokInfo(obj) };
    }
    const valObj = val;
    let stt = manager2.get_struct(valObj[key]);
    let cls = manager2.get_struct_cls(stt.name);
    let parentcls = manager2.get_struct_cls(type.data);
    let ok = false;
    do {
      if (cls === parentcls) {
        ok = true;
        break;
      }
      cls = cls.prototype.__proto__.constructor;
    } while (cls && cls !== Object);
    if (!ok) {
      return { ok: stt.name + " is not a child class off " + type.data, tokInfo: getTokInfo(obj) };
    }
    return manager2.validateJSONIntern(valObj, stt, type.jsonKeyword);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    let key = type.jsonKeyword;
    const valObj = val;
    let stt = manager2.get_struct(valObj[key]);
    return manager2.readJSON(val, stt, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    let key = type.jsonKeyword;
    const valObj = val;
    let stt = manager2.get_struct(valObj[key]);
    return manager2.formatJSON_intern(valObj, stt, field, tlvl);
  }
  static toJSON(manager2, val, obj, field, type) {
    const keywords = manager2.constructor.keywords;
    const valObj = val;
    const valCtor = valObj.constructor;
    let stt = manager2.get_struct(valCtor.structName);
    let ret = manager2.writeJSON(val, stt);
    ret[type.jsonKeyword] = "" + stt.name;
    return ret;
  }
  static packNull(manager2, data, field, type) {
    let stt = manager2.get_struct(type.data);
    pack_int(data, stt.id);
    packNull(manager2, data, field, { type: StructEnum.STRUCT, data: type.data });
  }
  static format(type) {
    return "abstract(" + type.data + ")";
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let id = unpack_int(data, uctx);
    if (debug) packer_debug("-int " + id);
    if (!(id in manager2.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager2.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }
    let cls2 = manager2.get_struct_id(id);
    if (debug) packer_debug("struct name: " + cls2.name);
    let cls3 = manager2.struct_cls[cls2.name];
    const missing = cls3 === void 0 || !!manager2.onUnknownClass && isParseStructsDummy(cls3);
    const instance = manager2.read_object(data, missing ? id : cls3, uctx, dest);
    if (missing && instance && typeof instance === "object") {
      instance._origClsname = cls2.name;
    }
    return instance;
  }
  static unpack(manager2, data, type, uctx) {
    let id = unpack_int(data, uctx);
    if (debug) packer_debug("-int " + id);
    if (!(id in manager2.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager2.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }
    let cls2 = manager2.get_struct_id(id);
    if (debug) packer_debug("struct name: " + cls2.name);
    let cls3 = manager2.struct_cls[cls2.name];
    const missing = cls3 === void 0 || !!manager2.onUnknownClass && isParseStructsDummy(cls3);
    const instance = manager2.read_object(data, missing ? id : cls3, uctx);
    if (missing && instance && typeof instance === "object") {
      instance._origClsname = cls2.name;
    }
    return instance;
  }
  static define() {
    return {
      type: StructEnum.TSTRUCT,
      name: "tstruct"
    };
  }
};
StructFieldType.register(StructTStructField);
function formatArrayJson(manager2, val, obj, field, type, type2, instance, tlvl, array = val) {
  if (array === void 0 || array === null || typeof array !== "object" || !(Symbol.iterator in array)) {
    console.log(obj);
    console.log(array);
    throw new Error(`Expected an array for ${field.name}`);
  }
  if (ValueTypes.has(type2.type)) {
    return JSON.stringify(array);
  }
  let s = "[";
  if (manager2.formatCtx.addComments && field.comment.trim()) {
    s += " " + field.comment.trim();
  }
  s += "\n";
  for (let i = 0; i < array.length; i++) {
    let item = array[i];
    s += tab(tlvl + 1) + formatJSON(manager2, item, val, field, type2, instance, tlvl + 1) + ",\n";
  }
  s += tab(tlvl) + "]";
  return s;
}
var StructArrayField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    if (val === void 0) {
      console.trace();
      console.log("Undefined array fed to struct struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      pack_int(data, 0);
      return;
    }
    const arr = val;
    packer_debug("int " + arr.length);
    pack_int(data, arr.length);
    let d = type.data;
    let itername = d.iname;
    let type2 = d.type;
    const useEnv = itername !== "" && itername !== void 0 && field.get;
    if (!debug && !useEnv && packPrimitiveBulk(data, type2.type, arr)) {
      return;
    }
    let env = _ws_env;
    for (let i = 0; i < arr.length; i++) {
      let val2 = arr[i];
      if (useEnv) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager2, data, val2, obj, fakeField, type2);
    }
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static format(type) {
    const d = type.data;
    if (d.iname !== "" && d.iname !== void 0) {
      return "array(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "array(" + fmt_type(d.type) + ")";
    }
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (!val) {
      return { ok: "not an array: " + val, tokInfo: getTokInfo(obj) };
    }
    const arr = val;
    for (let i = 0; i < arr.length; i++) {
      let ret = validateJSON(
        manager2,
        arr[i],
        val,
        field,
        type.data.type,
        void 0,
        _abstractKey
      );
      if (typeof ret.ok === "string" || !ret.ok) {
        return ret;
      }
    }
    return { ok: true };
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    const arr = val;
    let ret = instance || [];
    ret.length = 0;
    for (let i = 0; i < arr.length; i++) {
      let val2 = fromJSON(manager2, arr[i], val, field, type.data.type, void 0);
      if (val2 === void 0) {
        console.log(val2);
        console.error("eeek");
        throw new Error("Unexpected undefined value in fromJSON");
      }
      ret.push(val2);
    }
    return ret;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0
    );
  }
  static toJSON(manager2, val, obj, field, type) {
    const arr = val || [];
    let json = [];
    let itername = type.data.iname;
    for (let i = 0; i < arr.length; i++) {
      let val2 = arr[i];
      let env = _ws_env;
      if (itername !== "" && itername !== void 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      json.push(toJSON(manager2, val2, val, field, type.data.type));
    }
    return json;
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    const arr = dest;
    const t2 = type.data.type;
    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }
    arr.length = 0;
    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager2, data, t2, uctx));
    }
    return arr;
  }
  static unpack(manager2, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const t2 = type.data.type;
    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }
    let arr = new Array(len);
    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager2, data, t2, uctx);
    }
    return arr;
  }
  static define() {
    return {
      type: StructEnum.ARRAY,
      name: "array"
    };
  }
};
StructFieldType.register(StructArrayField);
var StructIterField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    function forEach(cb, thisvar) {
      const v = val;
      if (v && v[Symbol.iterator]) {
        for (const item of v) {
          cb.call(thisvar, item);
        }
      } else if (v && typeof v.forEach === "function") {
        v.forEach(function(item) {
          cb.call(thisvar, item);
        });
      } else {
        console.trace();
        console.log("Undefined iterable list fed to struct struct packer!", val);
        console.log("Field: ", field);
        console.log("Type: ", type);
        console.log("");
      }
    }
    let d = type.data;
    let itername = d.iname;
    let type2 = d.type;
    let env = _ws_env;
    const useEnv = itername !== "" && itername !== void 0 && field.get;
    if (!debug && !useEnv && isBulkArray(val)) {
      const arr = val;
      pack_int(data, arr.length);
      if (packPrimitiveBulk(data, type2.type, arr)) {
        return;
      }
      data.length -= 4;
    }
    let starti;
    if (data._isBinWriter) {
      starti = data.reserve(4);
    } else {
      starti = data.length;
      data.length += 4;
    }
    let i = 0;
    forEach(function(val2) {
      let v2 = val2;
      if (useEnv) {
        env[0][0] = itername;
        env[0][1] = v2;
        v2 = manager2._env_call(field.get, obj, env);
      }
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager2, data, v2, obj, fakeField, type2);
      i++;
    }, void 0);
    if (data._isBinWriter) {
      data.patchI32(starti, i);
    } else {
      temp_dataview.setInt32(0, i, STRUCT_ENDIAN);
      const a = data;
      a[starti++] = uint8_view[0];
      a[starti++] = uint8_view[1];
      a[starti++] = uint8_view[2];
      a[starti++] = uint8_view[3];
    }
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0,
      list(val)
    );
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return StructArrayField.validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return StructArrayField.fromJSON(manager2, val, obj, field, type, instance);
  }
  static toJSON(manager2, val, obj, field, type) {
    const arr = val || [];
    let json = [];
    let itername = type.data.iname;
    for (let val2 of arr) {
      let v2 = val2;
      let env = _ws_env;
      if (itername !== "" && itername !== void 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = v2;
        v2 = manager2._env_call(field.get, obj, env);
      }
      json.push(toJSON(manager2, v2, val, field, type.data.type));
    }
    return json;
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static format(type) {
    const d = type.data;
    if (d.iname !== "" && d.iname !== void 0) {
      return "iter(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "iter(" + fmt_type(d.type) + ")";
    }
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const arr = dest;
    const t2 = type.data.type;
    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }
    arr.length = 0;
    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager2, data, t2, uctx));
    }
    return arr;
  }
  static unpack(manager2, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const t2 = type.data.type;
    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }
    let arr = new Array(len);
    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager2, data, t2, uctx);
    }
    return arr;
  }
  static define() {
    return {
      type: StructEnum.ITER,
      name: "iter"
    };
  }
};
StructFieldType.register(StructIterField);
var StructShortField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_short(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_short(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.SHORT,
      name: "short"
    };
  }
};
StructFieldType.register(StructShortField);
var StructByteField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_byte(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_byte(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.BYTE,
      name: "byte"
    };
  }
};
StructFieldType.register(StructByteField);
var StructSignedByteField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_sbyte(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_sbyte(data, uctx);
  }
  static define() {
    return {
      type: StructEnum.SIGNED_BYTE,
      name: "sbyte"
    };
  }
};
StructFieldType.register(StructSignedByteField);
var StructBoolField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_byte(data, val ? 1 : 0);
  }
  static unpack(manager2, data, type, uctx) {
    return !!unpack_byte(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (val === 0 || val === 1 || val === true || val === false || val === "true" || val === "false") {
      return { ok: true };
    }
    return { ok: "" + val + " is not a bool", tokInfo: getTokInfo(obj) };
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    if (val === "false") {
      return false;
    }
    return !!val;
  }
  static toJSON(manager2, val, obj, field, type) {
    return !!val;
  }
  static define() {
    return {
      type: StructEnum.BOOL,
      name: "bool"
    };
  }
};
StructFieldType.register(StructBoolField);
var StructIterKeysField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    if (typeof val !== "object" && typeof val !== "function" || val === null) {
      console.warn("Bad object fed to iterkeys in struct packer!", val);
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      pack_int(data, 0);
      return;
    }
    const valObj = val;
    let len = 0;
    for (let k in valObj) {
      len++;
    }
    packer_debug("int " + len);
    pack_int(data, len);
    let d = type.data;
    let itername = d.iname;
    let type2 = d.type;
    let env = _ws_env;
    let i = 0;
    for (let key in valObj) {
      if (i >= len) {
        if (warninglvl > 0) {
          console.warn("Warning: object keys magically changed during iteration", val, i);
        }
        return;
      }
      let val2;
      if (itername && itername.trim().length > 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = key;
        val2 = manager2._env_call(field.get, obj, env);
      } else {
        val2 = valObj[key];
      }
      let f2 = { type: type2, get: void 0, name: "", comment: "", loc: { line: 0, column: 0 } };
      do_pack(manager2, data, val2, obj, f2, type2);
      i++;
    }
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return StructArrayField.validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return StructArrayField.fromJSON(manager2, val, obj, field, type, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0,
      list(val)
    );
  }
  static toJSON(manager2, val, obj, field, type) {
    const arr = val || [];
    let json = [];
    let itername = type.data.iname;
    for (let k in arr) {
      let val2 = arr[k];
      let env = _ws_env;
      if (itername !== "" && itername !== void 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      json.push(toJSON(manager2, val2, val, field, type.data.type));
    }
    return json;
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static format(type) {
    const d = type.data;
    if (d.iname !== "" && d.iname !== void 0) {
      return "iterkeys(" + d.iname + ", " + fmt_type(d.type) + ")";
    } else {
      return "iterkeys(" + fmt_type(d.type) + ")";
    }
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const arr = dest;
    const t2 = type.data.type;
    if (!debug) {
      arr.length = len;
      if (unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
        return arr;
      }
    }
    arr.length = 0;
    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager2, data, t2, uctx));
    }
    return arr;
  }
  static unpack(manager2, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);
    const t2 = type.data.type;
    if (!debug) {
      const typed = unpackByteTyped(data, t2.type, len, uctx);
      if (typed) {
        return typed;
      }
    }
    let arr = new Array(len);
    if (!debug && unpackPrimitiveBulk(data, t2.type, len, uctx, arr)) {
      return arr;
    }
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager2, data, t2, uctx);
    }
    return arr;
  }
  static define() {
    return {
      type: StructEnum.ITERKEYS,
      name: "iterkeys"
    };
  }
};
StructFieldType.register(StructIterKeysField);
var StructUintField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_uint(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_uint(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.UINT,
      name: "uint"
    };
  }
};
StructFieldType.register(StructUintField);
var StructUshortField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_ushort(data, val);
  }
  static unpack(manager2, data, type, uctx) {
    return unpack_ushort(data, uctx);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return { ok: "" + val + " is not an integer", tokInfo: getTokInfo(obj) };
    }
    return { ok: true };
  }
  static define() {
    return {
      type: StructEnum.USHORT,
      name: "ushort"
    };
  }
};
StructFieldType.register(StructUshortField);
var StructStaticArrayField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const d = type.data;
    if (d.size === void 0) {
      throw new Error("type.data.size was undefined");
    }
    let itername = d.iname;
    const arr = val;
    if (arr === void 0 || !arr.length) {
      this.packNull(manager2, data, field, type);
      return;
    }
    const useEnv = itername !== "" && itername !== void 0 && field.get;
    if (!debug && !useEnv && arr.length >= d.size && packPrimitiveBulk(data, d.type.type, arr, d.size)) {
      return;
    }
    for (let i = 0; i < d.size; i++) {
      let i2 = Math.min(i, Math.min(arr.length - 1, d.size));
      let val2 = arr[i2];
      if (useEnv) {
        let env = _ws_env;
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager2._env_call(field.get, obj, env);
      }
      do_pack(manager2, data, val2, val, field, d.type);
    }
  }
  static useHelperJS(field) {
    return !field.type.data.iname;
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    return StructArrayField.validateJSON(manager2, val, obj, field, type, instance, _abstractKey);
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    return StructArrayField.fromJSON(manager2, val, obj, field, type, instance);
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(
      manager2,
      val,
      obj,
      field,
      type,
      type.data.type,
      instance,
      tlvl ?? 0,
      list(val)
    );
  }
  static packNull(manager2, data, field, type) {
    const d = type.data;
    let size = d.size;
    for (let i = 0; i < size; i++) {
      packNull(manager2, data, field, d.type);
    }
  }
  static toJSON(manager2, val, obj, field, type) {
    return StructArrayField.toJSON(manager2, val, obj, field, type);
  }
  static format(type) {
    const d = type.data;
    let type2 = StructFieldTypeMap[d.type.type].format(d.type);
    let ret = `static_array[${type2}, ${d.size}`;
    if (d.iname) {
      ret += `, ${d.iname}`;
    }
    ret += `]`;
    return ret;
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    const d = type.data;
    packer_debug("-size: " + d.size);
    const ret = dest;
    if (!debug) {
      ret.length = d.size;
      if (unpackPrimitiveBulk(data, d.type.type, d.size, uctx, ret)) {
        return ret;
      }
    }
    ret.length = 0;
    for (let i = 0; i < d.size; i++) {
      ret.push(unpack_field(manager2, data, d.type, uctx));
    }
    return ret;
  }
  static unpack(manager2, data, type, uctx) {
    const d = type.data;
    packer_debug("-size: " + d.size);
    if (!debug) {
      const ret2 = new Array(d.size);
      if (unpackPrimitiveBulk(data, d.type.type, d.size, uctx, ret2)) {
        return ret2;
      }
    }
    let ret = [];
    for (let i = 0; i < d.size; i++) {
      ret.push(unpack_field(manager2, data, d.type, uctx));
    }
    return ret;
  }
  static define() {
    return {
      type: StructEnum.STATIC_ARRAY,
      name: "static_array"
    };
  }
};
StructFieldType.register(StructStaticArrayField);
var StructOptionalField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    pack_int(data, val !== void 0 && val !== null ? 1 : 0);
    if (val !== void 0 && val !== null) {
      const fakeField = { ...field, type: type.data };
      do_pack(manager2, data, val, obj, fakeField, type.data);
    }
  }
  static fakeField(field, type) {
    return { ...field, type: type.data };
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    const fakeField = this.fakeField(field, type);
    return val !== void 0 && val !== null ? validateJSON(manager2, val, obj, fakeField, type.data, void 0, _abstractKey) : { ok: true };
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    const fakeField = this.fakeField(field, type);
    return val !== void 0 && val !== null ? fromJSON(manager2, val, obj, fakeField, type.data, void 0) : void 0;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    if (val !== void 0 && val !== null) {
      const fakeField = this.fakeField(field, type);
      return formatJSON(manager2, val, val, fakeField, type.data, instance, (tlvl ?? 0) + 1);
    }
    return "null";
  }
  static toJSON(manager2, val, obj, field, type) {
    const fakeField = this.fakeField(field, type);
    return val !== void 0 && val !== null ? toJSON(manager2, val, obj, fakeField, type.data) : null;
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static format(type) {
    return "optional(" + fmt_type(type.data) + ")";
  }
  static unpackInto(manager2, data, type, uctx, dest) {
    let exists = unpack_int(data, uctx);
    packer_debug("optional exists: " + exists);
    if (!exists) {
      return;
    }
    return unpack_field(manager2, data, type.data, uctx);
  }
  static unpack(manager2, data, type, uctx) {
    let exists = unpack_int(data, uctx);
    if (!exists) {
      return void 0;
    }
    return unpack_field(manager2, data, type.data, uctx);
  }
  static define() {
    return {
      type: StructEnum.OPTIONAL,
      name: "optional"
    };
  }
};
StructFieldType.register(StructOptionalField);
var arrayBufferElemTypes = {
  byte: { ctor: Uint8Array, size: 1 },
  sbyte: { ctor: Int8Array, size: 1 },
  short: { ctor: Int16Array, size: 2 },
  ushort: { ctor: Uint16Array, size: 2 },
  int: { ctor: Int32Array, size: 4 },
  uint: { ctor: Uint32Array, size: 4 },
  float: { ctor: Float32Array, size: 4 },
  double: { ctor: Float64Array, size: 8 }
};
var PLATFORM_LITTLE_ENDIAN = new Uint8Array(Uint32Array.of(1).buffer)[0] === 1;
function arrayBufferElem(type) {
  const name = type.data.type;
  const elem = arrayBufferElemTypes[name];
  if (!elem) {
    throw new Error("invalid arraybuffer element type " + name);
  }
  return elem;
}
function byteswapElems(bytes, elemSize) {
  if (elemSize <= 1) {
    return;
  }
  for (let i = 0; i < bytes.length; i += elemSize) {
    for (let a = i, b = i + elemSize - 1; a < b; a++, b--) {
      const t = bytes[a];
      bytes[a] = bytes[b];
      bytes[b] = t;
    }
  }
}
function toElemTyped(val, elem) {
  if (val instanceof elem.ctor) {
    return val;
  }
  if (val instanceof ArrayBuffer) {
    return new elem.ctor(val, 0, val.byteLength / elem.size | 0);
  }
  if (ArrayBuffer.isView(val)) {
    const v = val;
    return new elem.ctor(v.buffer, v.byteOffset, v.byteLength / elem.size | 0);
  }
  if (Array.isArray(val)) {
    const ta = new elem.ctor(val.length);
    ta.set(val);
    return ta;
  }
  throw new Error("arraybuffer field expects an ArrayBuffer, typed array, DataView, or number[]");
}
var StructArrayBufferField = class extends StructFieldType {
  static pack(manager2, data, val, obj, field, type) {
    const elem = arrayBufferElem(type);
    if (val === void 0 || val === null) {
      pack_int(data, 0);
      return;
    }
    const view = toElemTyped(val, elem);
    let bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    pack_int(data, bytes.byteLength);
    if (elem.size > 1 && STRUCT_ENDIAN !== PLATFORM_LITTLE_ENDIAN) {
      bytes = bytes.slice();
      byteswapElems(bytes, elem.size);
    }
    pack_bytes(data, bytes);
  }
  static packNull(manager2, data, field, type) {
    pack_int(data, 0);
  }
  static unpack(manager2, data, type, uctx) {
    const elem = arrayBufferElem(type);
    const byteLength = unpack_int(data, uctx);
    packer_debug("-arraybuffer bytes " + byteLength);
    const abs = data.byteOffset + uctx.i;
    const slice = data.buffer.slice(abs, abs + byteLength);
    uctx.i += byteLength;
    if (elem.size > 1 && STRUCT_ENDIAN !== PLATFORM_LITTLE_ENDIAN) {
      byteswapElems(new Uint8Array(slice), elem.size);
    }
    return new elem.ctor(slice, 0, byteLength / elem.size | 0);
  }
  static toJSON(manager2, val, obj, field, type) {
    if (val === void 0 || val === null) {
      return [];
    }
    return Array.from(toElemTyped(val, arrayBufferElem(type)));
  }
  static fromJSON(manager2, val, obj, field, type, instance) {
    const elem = arrayBufferElem(type);
    const arr = val || [];
    const ta = new elem.ctor(arr.length);
    ta.set(arr);
    return ta;
  }
  static formatJSON(manager2, val, obj, field, type, instance, tlvl) {
    const arr = Array.isArray(val) ? val : Array.from(toElemTyped(val, arrayBufferElem(type)));
    return JSON.stringify(arr);
  }
  static validateJSON(manager2, val, obj, field, type, instance, _abstractKey) {
    if (!Array.isArray(val)) {
      return { ok: "not an array: " + val, tokInfo: getTokInfo(obj) };
    }
    for (let i = 0; i < val.length; i++) {
      if (typeof val[i] !== "number") {
        return { ok: "non-numeric arraybuffer element: " + val[i], tokInfo: getTokInfo(obj) };
      }
    }
    return { ok: true };
  }
  static format(type) {
    return "arraybuffer(" + type.data.type + ")";
  }
  static define() {
    return {
      type: StructEnum.ARRAYBUFFER,
      name: "arraybuffer"
    };
  }
};
StructFieldType.register(StructArrayBufferField);

// src/struct_eval.ts
var struct_eval_exports = {};
__export(struct_eval_exports, {
  setStructEval: () => setStructEval,
  structEval: () => structEval
});
var structEval = eval;
function setStructEval(val) {
  structEval = val;
}

// src/struct_json.ts
function buildJSONParser() {
  const tk = (name, re, func, example) => new tokdef(name, re, func, example);
  let parse;
  const nint = "[+-]?[0-9]+";
  const nhex = "[+-]?0x[0-9a-fA-F]+";
  const nfloat1 = "[+-]?[0-9]+\\.[0-9]*";
  const nfloat2 = "[+-]?[0-9]*\\.[0-9]+";
  let nfloatexp = "[+-]?[0-9]+\\.[0-9]+[eE][+-]?[0-9]+";
  const nfloat = `(${nfloat1})|(${nfloat2})|(${nfloatexp})`;
  const num = `(${nint})|(${nfloat})|(${nhex})`;
  const numre = new RegExp(num);
  const numreTest = new RegExp(`(${num})$`);
  let nfloat3 = new RegExp("[+-]?[0-9]+\\.[0-9]+");
  nfloatexp = new RegExp(nfloatexp);
  const tests = ["1.234234", ".23432", "-234.", "1e-17", "-0x23423ff", "+23423", "-4.263256414560601e-14"];
  for (const test of tests) {
    if (!numreTest.test(test)) {
      console.error("Error! Number regexp failed:", test);
    }
  }
  const tokens = [
    tk("BOOL", /true|false/),
    tk("WS", /[ \r\t\n]/, (_t) => void 0),
    //drop token
    tk("STRLIT", /["']/, (t) => {
      const lex2 = t.lexer;
      const char = t.value;
      let i = lex2.lexpos;
      const lexdata = lex2.lexdata;
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
      lex2.lexpos = i + 1;
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
    tk("NUM", numre, (t) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
    tk("NUM", nfloat3, (t) => {
      t.value = "" + parseFloat(t.value);
      return t;
    }),
    tk("NUM", nfloatexp, (t) => {
      t.value = "" + parseFloat(t.value);
      return t;
    })
  ];
  function tokinfo(t) {
    return {
      lexpos: t ? t.lexpos : 0,
      lineno: t ? t.lineno : 0,
      col: t ? t.col : 0,
      fields: {}
    };
  }
  function p_Array(p) {
    p.expect("LSBRACKET");
    let t = p.peeknext();
    let first = true;
    const ret = [];
    setTokInfo(ret, tokinfo(t));
    while (t && t.type !== "RSBRACKET") {
      if (!first) {
        p.expect("COMMA");
      }
      getTokInfo(ret).fields[ret.length] = tokinfo(t);
      ret.push(p_Start(p));
      first = false;
      t = p.peeknext();
    }
    p.expect("RSBRACKET");
    return ret;
  }
  function p_Object(p) {
    p.expect("LBRACE");
    const obj = {};
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
      getTokInfo(obj).fields[key] = tokinfo(t);
    }
    p.expect("RBRACE");
    return obj;
  }
  function p_Start(p, _throwError = true) {
    const t = p.peeknext();
    if (!t) {
      p.error(void 0, "Unexpected end of input");
    }
    if (t.type === "LSBRACKET") {
      return p_Array(p);
    } else if (t.type === "LBRACE") {
      return p_Object(p);
    } else if (t.type === "STRLIT" || t.type === "NUM" || t.type === "NULL" || t.type === "BOOL") {
      const tok = p.next();
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
  function p_Error(_token, _msg) {
    throw new PUTIL_ParseError("Parse Error");
  }
  const lex = new lexer(tokens);
  lex.linestart = 0;
  parse = new parser(lex, p_Error);
  parse.start = p_Start;
  return parse;
}
var _defaultParser = buildJSONParser();
var struct_json_default = _defaultParser;
function printContext(buf, tokinfo, printColors = true) {
  const lines = buf.split("\n");
  if (!tokinfo) {
    return "";
  }
  const lineno = tokinfo.lineno;
  const col = tokinfo.col;
  const istart = Math.max(lineno - 25, 0);
  const iend = Math.min(lineno + 50, lines.length - 1);
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
      s += termColor(`${idx}: ${l}
`, "yellow");
    } else {
      s += `${idx}: ${l}
`;
    }
    if (i === lineno) {
      let l2 = "";
      for (let j = 0; j < col + 5; j++) {
        l2 += " ";
      }
      s += l2 + "^\n";
    }
  }
  s += `
    at line ${tokinfo.lineno}:${tokinfo.col}`;
  return s;
}

// src/struct_global.ts
var nGlobal = globalThis;
if (typeof globalThis !== "undefined") {
  nGlobal = globalThis;
} else if (typeof window !== "undefined") {
  nGlobal = window;
} else if (typeof global !== "undefined") {
  nGlobal = global;
} else if (typeof self !== "undefined") {
  nGlobal = self;
}
var DEBUG = {};
function updateDEBUG() {
  for (const k of Object.keys(DEBUG)) {
    delete DEBUG[k];
  }
  const g = nGlobal;
  if (typeof g.DEBUG === "object" && g.DEBUG !== null) {
    const dbg = g.DEBUG;
    for (const k in dbg) {
      DEBUG[k] = dbg[k];
    }
  }
}

// src/struct_intern.ts
var sintern2 = struct_intern2_exports;
var struct_eval = struct_eval_exports;
var warninglvl2 = 2;
var truncateDollarSign = true;
var manager;
var STABLE_ID_BASE = 1048576;
var STABLE_ID_LIMIT = 2147483647;
function stableStructId(name) {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i) & 255;
    hash = Math.imul(hash, 16777619) >>> 0;
    const hi = name.charCodeAt(i) >> 8;
    if (hi !== 0) {
      hash ^= hi;
      hash = Math.imul(hash, 16777619) >>> 0;
    }
  }
  return STABLE_ID_BASE + hash % (STABLE_ID_LIMIT - STABLE_ID_BASE);
}
var JSONError = class extends Error {
};
function printCodeLines(code2) {
  const lines = code2.split(String.fromCharCode(10));
  let buf = "";
  for (let i = 0; i < lines.length; i++) {
    let line = "" + (i + 1) + ":";
    while (line.length < 3) {
      line += " ";
    }
    line += " " + lines[i];
    buf += line + String.fromCharCode(10);
  }
  return buf;
}
function printEvalError(code) {
  console.log("== CODE ==");
  console.log(printCodeLines(code));
  eval(code);
}
function setTruncateDollarSign(v) {
  truncateDollarSign = !!v;
}
function _truncateDollarSign(s) {
  const i = s.search("$");
  if (i > 0) {
    return s.slice(0, i).trim();
  }
  return s;
}
function unmangle(name) {
  if (truncateDollarSign) {
    return _truncateDollarSign(name);
  } else {
    return name;
  }
}
var _static_envcode_null2 = "";
function gen_tabstr3(tot) {
  let ret = "";
  for (let i = 0; i < tot; i++) {
    ret += " ";
  }
  return ret;
}
var packer_debug2;
var packer_debug_start2;
var packer_debug_end2;
function update_debug_data() {
  const ret = _get_pack_debug();
  packer_debug2 = ret.packer_debug;
  packer_debug_start2 = ret.packer_debug_start;
  packer_debug_end2 = ret.packer_debug_end;
  warninglvl2 = ret.warninglvl;
}
update_debug_data();
function setWarningMode(t) {
  sintern2.setWarningMode2(t);
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }
  warninglvl2 = t;
}
function setDebugMode(t) {
  sintern2.setDebugMode2(t);
  update_debug_data();
}
var _ws_env2 = [[void 0, void 0]];
function define_empty_class(scls, name) {
  const cls = function() {
  };
  cls.prototype = Object.create(Object.prototype);
  cls.constructor = cls.prototype.constructor = cls;
  const keywords = scls.keywords;
  cls.STRUCT = name + " {\n  }\n";
  cls.structName = name;
  cls.prototype.loadSTRUCT = function(reader) {
    reader(this);
  };
  cls.newSTRUCT = function() {
    return new this();
  };
  return cls;
}
var binaryMigrateFinisher = () => {
};
var STRUCT = class _STRUCT {
  constructor() {
    // always sorted
    this.struct_names_migrations = [];
    this.idgen = 0;
    this.allowOverriding = true;
    this.stableIds = true;
    this.stableIdOverrides = {};
    this.structs = {};
    this.struct_cls = {};
    this.struct_ids = {};
    this.compiled_code = {};
    this.null_natives = {};
    this.define_null_native("Object", Object);
    this.jsonUseColors = true;
    this.jsonBuf = "";
    this.formatCtx = {};
  }
  static inherit(child, parent, structName = child.name) {
    const keywords = this.keywords;
    if (!parent.STRUCT) {
      return structName + "{\n";
    }
    const stt = struct_parse.parse(parent.STRUCT);
    let code2 = structName + "{\n";
    code2 += _STRUCT.fmt_struct(stt, true, false, true);
    return code2;
  }
  /** invoke loadSTRUCT methods on parent objects.  note that
   reader() is only called once.  it is called however.*/
  static Super(obj, reader) {
    if (warninglvl2 > 0) {
      console.warn("deprecated");
    }
    reader(obj);
    function reader2(_obj) {
    }
    const cls = obj.constructor;
    const keywords = this.keywords;
    let bad = cls === void 0 || cls.prototype === void 0 || Object.getPrototypeOf(cls.prototype) === void 0;
    if (bad) {
      return;
    }
    const parentProto = Object.getPrototypeOf(cls.prototype);
    const parent = parentProto.constructor;
    bad = bad || parent === void 0;
    if (!bad && parent.prototype.loadSTRUCT && parent.prototype.loadSTRUCT !== obj.loadSTRUCT) {
      parent.prototype.loadSTRUCT.call(obj, reader2);
    }
  }
  /** deprecated.  used with old fromSTRUCT interface. */
  static chain_fromSTRUCT(cls, reader) {
    const keywords = this.keywords;
    if (warninglvl2 > 0) {
      console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");
    }
    const proto = cls.prototype;
    const parent = proto.prototype;
    const obj = parent.constructor.fromSTRUCT;
    const result = obj(reader);
    const obj2 = new cls();
    const keys = Object.keys(result).concat(
      Object.getOwnPropertySymbols(result)
    );
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      try {
        obj2[k] = result[k];
      } catch (error) {
        if (warninglvl2 > 0) {
          console.warn("  failed to set property", k);
        }
      }
    }
    return obj2;
  }
  // defined_classes is an array of class constructors
  // with STRUCT scripts, *OR* another STRUCT instance
  static formatStruct(stt, internal_only, no_helper_js) {
    return this.fmt_struct(stt, internal_only, no_helper_js);
  }
  static fmt_struct(stt, internal_only, no_helper_js, addComments, excludeId) {
    if (internal_only === void 0) internal_only = false;
    if (no_helper_js === void 0) no_helper_js = false;
    let s = "";
    if (!internal_only) {
      s += stt.name;
      if (!excludeId && stt.id !== -1) s += " id=" + stt.id;
      s += " {\n";
    }
    const tab2 = "  ";
    function fmt_type2(type) {
      return StructFieldTypeMap[type.type].format(type);
    }
    const fields = stt.fields;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      s += tab2 + f.name + " : " + fmt_type2(f.type);
      if (!no_helper_js && f.get !== void 0) {
        s += " | " + f.get.trim();
      }
      s += ";";
      if (addComments && f.comment.trim()) {
        s += f.comment.trim();
      }
      s += "\n";
    }
    if (!internal_only) s += "}";
    return s;
  }
  static setClassKeyword(keyword, nameKeyword) {
    if (!nameKeyword) {
      nameKeyword = keyword.toLowerCase() + "Name";
    }
    this.keywords = {
      script: keyword,
      name: nameKeyword,
      load: "load" + keyword,
      new: "new" + keyword,
      from: "from" + keyword,
      migrate: "migrate" + keyword,
      getVersion: "getVersion" + keyword
    };
  }
  /**
   * Assigns stt.id, either from the struct's name (the default) or from the
   * registration counter. Throws on a stable-id collision rather than letting
   * two structs share an id: an id collision is silent data corruption.
   */
  assignStructId(stt) {
    if (!this.stableIds) {
      stt.id = this.idgen++;
      return stt.id;
    }
    const id = this.stableIdOverrides[stt.name] ?? stableStructId(stt.name);
    const clash = this.struct_ids[id];
    if (clash !== void 0 && clash.name !== stt.name) {
      throw new Error(
        "nstructjs: stable struct id collision between " + clash.name + " and " + stt.name + " (both " + id + "). Pin one of them through STRUCT.stableIdOverrides."
      );
    }
    stt.id = id;
    return id;
  }
  define_null_native(name, cls) {
    const keywords = this.constructor.keywords;
    const obj = define_empty_class(this.constructor, name);
    const stt = struct_parse.parse(obj.STRUCT);
    this.assignStructId(stt);
    this.structs[name] = stt;
    this.struct_cls[name] = cls;
    this.struct_ids[stt.id] = stt;
    this.null_natives[name] = 1;
  }
  validateStructs(onerror) {
    function getType(type) {
      switch (type.type) {
        case StructEnum.ITERKEYS:
        case StructEnum.ITER:
        case StructEnum.STATIC_ARRAY:
        case StructEnum.ARRAY:
          return getType(type.data.type);
        case StructEnum.TSTRUCT:
          return type;
        case StructEnum.STRUCT:
        default:
          return type;
      }
    }
    function formatType(type) {
      const ret = {};
      ret.type = type.type;
      if (typeof ret.type === "number") {
        for (const k in StructEnum) {
          if (StructEnum[k] === ret.type) {
            ret.type = k;
            break;
          }
        }
      } else if (typeof ret.type === "object") {
        ret.type = formatType(ret.type);
      }
      if (typeof type.data === "object") {
        ret.data = formatType(type.data);
      } else {
        ret.data = type.data;
      }
      return ret;
    }
    function throwError(stt, field, msg) {
      const buf = _STRUCT.formatStruct(stt);
      console.error(buf + "\n\n" + msg);
      if (onerror) {
        onerror(msg, stt, field);
      } else {
        throw new Error(msg);
      }
    }
    for (const k in this.structs) {
      const stt = this.structs[k];
      for (const field of stt.fields) {
        if (field.name === "this") {
          const type2 = field.type.type;
          if (ValueTypes.has(type2)) {
            throwError(stt, field, "'this' cannot be used with value types");
          }
        }
        const type = getType(field.type);
        if (type.type !== StructEnum.STRUCT && type.type !== StructEnum.TSTRUCT) {
          continue;
        }
        if (!(type.data in this.structs)) {
          const msg = stt.name + ":" + field.name + ": Unknown struct " + type.data + ".";
          throwError(stt, field, msg);
        }
      }
    }
  }
  forEach(func, thisvar) {
    for (const k in this.structs) {
      const stt = this.structs[k];
      if (thisvar !== void 0) func.call(thisvar, stt);
      else func(stt);
    }
  }
  // defaults to structjs.manager
  parse_structs(buf, defined_classes, version = 0) {
    const keywords = this.constructor.keywords;
    if (defined_classes === void 0) {
      defined_classes = manager;
    }
    const migrationSource = defined_classes instanceof _STRUCT ? defined_classes : this;
    if (defined_classes instanceof _STRUCT) {
      const struct2 = defined_classes;
      const arr = [];
      for (const k in struct2.struct_cls) {
        arr.push(struct2.struct_cls[k]);
      }
      defined_classes = arr;
    }
    if (defined_classes === void 0) {
      const arr = [];
      for (const k in manager.struct_cls) {
        arr.push(manager.struct_cls[k]);
      }
      defined_classes = arr;
    }
    const clsmap = {};
    for (let i = 0; i < defined_classes.length; i++) {
      const cls = defined_classes[i];
      if (!cls.structName && cls.STRUCT) {
        const stt = struct_parse.parse(cls.STRUCT.trim());
        cls.structName = stt.name;
      } else if (!cls.structName && cls.name !== "Object") {
        if (warninglvl2 > 0) console.log("Warning, bad class in registered class list", unmangle(cls.name), cls);
        continue;
      }
      clsmap[cls.structName] = defined_classes[i];
    }
    struct_parse.input(buf);
    while (!struct_parse.at_end()) {
      const stt = struct_parse.parse(void 0, false);
      const migratedName = migrationSource.structNameMigration(version, stt.name);
      if (!(migratedName in clsmap)) {
        if (!(stt.name in this.null_natives)) {
          if (warninglvl2 > 0) console.log("WARNING: struct " + stt.name + " is missing from class list.");
        }
        const dummy = define_empty_class(this.constructor, stt.name);
        dummy.STRUCT = _STRUCT.fmt_struct(stt, void 0, void 0, void 0, true);
        dummy.structName = stt.name;
        dummy.prototype.structName = dummy.name;
        dummy[PARSE_STRUCTS_DUMMY] = true;
        this.struct_cls[dummy.structName] = dummy;
        this.structs[dummy.structName] = stt;
        if (stt.id !== -1) this.struct_ids[stt.id] = stt;
      } else {
        this.struct_cls[stt.name] = clsmap[migratedName];
        this.structs[stt.name] = stt;
        if (stt.id !== -1) this.struct_ids[stt.id] = stt;
      }
      let tok = struct_parse.peek();
      while (tok && (tok.value === "\n" || tok.value === "\r" || tok.value === "	" || tok.value === " ")) {
        tok = struct_parse.peek();
      }
    }
  }
  /** adds all structs referenced by cls inside of srcSTRUCT
   *  to this */
  registerGraph(srcSTRUCT, cls) {
    const keywords = this.constructor.keywords;
    if (!cls.structName) {
      console.warn("class was not in srcSTRUCT");
      this.register(cls);
      return;
    }
    let recStruct;
    const recArray = (t) => {
      switch (t.type) {
        case StructEnum.ARRAY:
          return recArray(t.data.type);
        case StructEnum.ITERKEYS:
          return recArray(t.data.type);
        case StructEnum.STATIC_ARRAY:
          return recArray(t.data.type);
        case StructEnum.ITER:
          return recArray(t.data.type);
        case StructEnum.STRUCT:
        case StructEnum.TSTRUCT: {
          const st2 = srcSTRUCT.structs[t.data];
          const cls2 = srcSTRUCT.struct_cls[st2.name];
          return recStruct(st2, cls2);
        }
      }
    };
    recStruct = (st2, cls2) => {
      if (!(cls2.structName in this.structs)) {
        this.add_class(cls2, cls2.structName);
      }
      for (const f of st2.fields) {
        if (f.type.type === StructEnum.STRUCT || f.type.type === StructEnum.TSTRUCT) {
          const st22 = srcSTRUCT.structs[f.type.data];
          const cls22 = srcSTRUCT.struct_cls[st22.name];
          recStruct(st22, cls22);
        } else if (f.type.type === StructEnum.ARRAY) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.ITER) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.ITERKEYS) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.STATIC_ARRAY) {
          recArray(f.type);
        }
      }
    };
    const st = srcSTRUCT.structs[cls.structName];
    recStruct(st, cls);
  }
  mergeScripts(child, parent) {
    const stc = struct_parse.parse(child.trim());
    const stp = struct_parse.parse(parent.trim());
    const fieldset = /* @__PURE__ */ new Set();
    for (const f of stc.fields) {
      fieldset.add(f.name);
    }
    const fields = [];
    for (const f of stp.fields) {
      if (!fieldset.has(f.name)) {
        fields.push(f);
      }
    }
    stc.fields = fields.concat(stc.fields);
    return _STRUCT.fmt_struct(stc, false, false);
  }
  inlineRegister(cls, structScript) {
    const keywords = this.constructor.keywords;
    let p = Object.getPrototypeOf(cls);
    while (p && p !== Object) {
      if (p.hasOwnProperty(keywords.script)) {
        structScript = this.mergeScripts(structScript, p.STRUCT);
        break;
      }
      p = Object.getPrototypeOf(p);
    }
    cls.STRUCT = structScript;
    this.register(cls);
    return structScript;
  }
  register(cls, structName) {
    this.add_class(cls, structName);
  }
  unregister(cls) {
    const keywords = this.constructor.keywords;
    if (!cls || !cls.structName || !(cls.structName in this.struct_cls)) {
      console.warn("Class not registered with nstructjs", cls);
      return;
    }
    const st = this.structs[cls.structName];
    delete this.structs[cls.structName];
    delete this.struct_cls[cls.structName];
    delete this.struct_ids[st.id];
  }
  add_class(cls, structName) {
    if (cls === Object) {
      return;
    }
    const keywords = this.constructor.keywords;
    if (cls.STRUCT) {
      let bad = false;
      let p = cls;
      while (p) {
        p = Object.getPrototypeOf(p);
        if (p && p.STRUCT && p.STRUCT === cls.STRUCT) {
          bad = true;
          break;
        }
      }
      if (bad) {
        if (warninglvl2 > 0) {
          console.warn("Generating " + keywords.script + " script for derived class " + unmangle(cls.name));
        }
        if (!structName) {
          structName = unmangle(cls.name);
        }
        cls.STRUCT = _STRUCT.inherit(cls, p) + "\n}";
      }
    }
    if (!cls.STRUCT) {
      throw new Error("class " + unmangle(cls.name) + " has no " + keywords.script + " script");
    }
    const stt = struct_parse.parse(cls.STRUCT);
    stt.name = unmangle(stt.name);
    cls.structName = stt.name;
    if (cls.newSTRUCT === void 0) {
      cls.newSTRUCT = function() {
        return new this();
      };
    }
    if (structName !== void 0) {
      stt.name = structName;
      cls.structName = structName;
    } else if (cls.structName === void 0) {
      cls.structName = stt.name;
    } else {
      stt.name = cls.structName;
    }
    if (cls.structName in this.structs) {
      if (warninglvl2 > 0) {
        console.warn("Struct " + unmangle(cls.structName) + " is already registered", cls);
      }
      if (!this.allowOverriding) {
        throw new Error("Struct " + unmangle(cls.structName) + " is already registered");
      }
      return;
    }
    if (stt.id === -1 || this.stableIds) this.assignStructId(stt);
    this.structs[cls.structName] = stt;
    this.struct_cls[cls.structName] = cls;
    this.struct_ids[stt.id] = stt;
  }
  isRegistered(cls) {
    const keywords = this.constructor.keywords;
    if (!cls.hasOwnProperty(keywords.name)) {
      return false;
    }
    return cls === this.struct_cls[cls.structName];
  }
  get_struct_id(id) {
    return this.struct_ids[id];
  }
  get_struct(name) {
    if (!(name in this.structs)) {
      console.warn("Unknown struct", name);
      throw new Error("Unknown struct " + name);
    }
    return this.structs[name];
  }
  get_struct_cls(name) {
    return this.struct_cls[name];
  }
  _env_call(code2, obj, env) {
    let envcode = _static_envcode_null2;
    if (env !== void 0) {
      envcode = "";
      for (let i = 0; i < env.length; i++) {
        envcode = "let " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
      }
    }
    let fullcode = "";
    if (envcode !== _static_envcode_null2) fullcode = envcode + code2;
    else fullcode = code2;
    let func;
    if (!(fullcode in this.compiled_code)) {
      const code22 = "func = function(obj, env) { " + envcode + "return " + code2 + "}";
      try {
        func = struct_eval.structEval(code22);
      } catch (err) {
        console.warn(err.stack);
        console.warn(code22);
        console.warn(" ");
        throw err;
      }
      this.compiled_code[fullcode] = func;
    } else {
      func = this.compiled_code[fullcode];
    }
    try {
      return func.call(obj, obj, env);
    } catch (err) {
      console.warn(err.stack);
      const code22 = "func = function(obj, env) { " + envcode + "return " + code2 + "}";
      console.warn(code22);
      console.warn(" ");
      throw err;
    }
  }
  write_struct(data, obj, stt) {
    function use_helper_js(field) {
      const type = field.type.type;
      const cls = StructFieldTypeMap[type];
      return cls.useHelperJS(field);
    }
    const fields = stt.fields;
    const thestruct = this;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const t1 = f.type;
      const t2 = t1.type;
      if (use_helper_js(f)) {
        let val;
        const type = t2;
        if (f.get !== void 0) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }
        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }
        sintern2.do_pack(this, data, val, obj, f, t1);
      } else {
        const val = f.name === "this" ? obj : obj[f.name];
        sintern2.do_pack(this, data, val, obj, f, t1);
      }
    }
  }
  write_object(data, obj) {
    const keywords = this.constructor.keywords;
    const cls = obj.constructor.structName;
    const stt = this.get_struct(cls);
    if (data === void 0) {
      data = [];
    }
    this.write_struct(data, obj, stt);
    return data;
  }
  /**
     Read an object from binary data
  
     @param data : DataView or Uint8Array instance
     @param cls_or_struct_id : Structable class
     @param uctx : internal parameter
     @param version : starting version passed to migrateSTRUCT/getVersionSTRUCT
       during the read; unlike migrateJSON, binary has no separate migration
       pass ahead of the read, so migration happens in-place as each struct
       finishes loading. Defaults to 0.
     @return Instance of cls_or_struct_id
     */
  readObject(data, cls_or_struct_id, uctx, version) {
    if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      data = new DataView(data.buffer);
    } else if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }
    return this.read_object(data, cls_or_struct_id, uctx, void 0, version);
  }
  writeObject(data, obj) {
    return this.write_object(data, obj);
  }
  writeJSON(obj, stt) {
    const keywords = this.constructor.keywords;
    const cls = obj.constructor;
    stt = stt || this.get_struct(cls.structName);
    function use_helper_js(field) {
      const type = field.type.type;
      const fieldCls = StructFieldTypeMap[type];
      return fieldCls.useHelperJS(field);
    }
    const toJSON2 = sintern2.toJSON;
    const fields = stt.fields;
    const thestruct = this;
    const json = {};
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      let val;
      const t1 = f.type;
      let json2;
      if (use_helper_js(f)) {
        if (f.get !== void 0) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }
        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }
        json2 = toJSON2(this, val, obj, f, t1);
      } else {
        val = f.name === "this" ? obj : obj[f.name];
        json2 = toJSON2(this, val, obj, f, t1);
      }
      if (f.name !== "this") {
        json[f.name] = json2;
      } else {
        const isArrayCheck = Array.isArray(json2);
        let isArray = isArrayCheck || f.type.type === StructTypes.ARRAY;
        isArray = isArray || f.type.type === StructTypes.STATIC_ARRAY;
        if (isArray) {
          const arr = json2;
          json.length = arr.length;
          for (let j = 0; j < arr.length; j++) {
            json[j] = arr[j];
          }
        } else {
          Object.assign(json, json2);
        }
      }
    }
    return json;
  }
  /**
   @param data : DataView or Uint8Array instance
   @param cls_or_struct_id : Structable class
   @param uctx : internal parameter
   */
  read_object(data, cls_or_struct_id, uctx, objInstance, rootVersion) {
    const keywords = this.constructor.keywords;
    let cls;
    let stt;
    if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }
    let unknownClassSchema;
    if (typeof cls_or_struct_id === "number") {
      const fileSchema = this.struct_ids[cls_or_struct_id];
      cls = this.struct_cls[fileSchema.name];
      unknownClassSchema = fileSchema;
      if ((cls === void 0 || isParseStructsDummy(cls)) && this.onUnknownClass) {
        const hookResult = this.onUnknownClass(fileSchema.name, fileSchema);
        if (hookResult !== void 0) {
          cls = hookResult;
        }
      }
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    stt = unknownClassSchema ?? this.structs[cls.structName];
    if (uctx === void 0) {
      uctx = new unpack_context(rootVersion ?? 0);
      packer_debug2("\n\n=Begin reading " + cls.structName + "=");
    }
    const this2 = this;
    const typeMap = StructFieldTypeMap;
    let was_run = false;
    const loader = function load(obj2) {
      if (was_run) {
        return;
      }
      was_run = true;
      const fields = stt.fields;
      const flen = fields.length;
      for (let i = 0; i < flen; i++) {
        const f = fields[i];
        if (f.name === "this") {
          typeMap[f.type.type].unpackInto(this2, data, f.type, uctx, obj2);
        } else {
          obj2[f.name] = typeMap[f.type.type].unpack(this2, data, f.type, uctx);
        }
      }
    };
    let obj;
    if (cls.prototype.loadSTRUCT !== void 0) {
      obj = objInstance;
      if (!obj && cls.newSTRUCT !== void 0) {
        obj = cls.newSTRUCT.call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      const objAny = obj;
      objAny.loadSTRUCT(loader);
      if (!was_run) {
        console.warn(
          "" + cls.structName + ".prototype.loadSTRUCT() did not execute its loader callback!"
        );
        loader(obj);
      }
    } else if (cls.fromSTRUCT !== void 0) {
      if (warninglvl2 > 1) {
        console.warn(
          "Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead"
        );
      }
      const anyCls2 = cls;
      obj = anyCls2.fromSTRUCT(loader);
    } else {
      obj = objInstance;
      if (!obj && cls.newSTRUCT !== void 0) {
        obj = cls.newSTRUCT.call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      loader(obj);
    }
    const anyCls = cls;
    if (anyCls.migrateSTRUCT !== void 0) {
      const version = anyCls.getVersionSTRUCT !== void 0 ? anyCls.getVersionSTRUCT(obj) : uctx.version;
      anyCls.migrateSTRUCT(version, obj, binaryMigrateFinisher);
    }
    return obj;
  }
  addStructNameMigration(version, oldName, newName) {
    let item = this.struct_names_migrations.find((i) => i.version === version);
    if (item === void 0) {
      item = { version, map: /* @__PURE__ */ new Map() };
      this.struct_names_migrations.push(item);
      this.struct_names_migrations.sort((a, b) => a.version - b.version);
    } else if (item.map.has(oldName)) {
      throw new Error("Struct name migration already exists for " + oldName + " at version " + version);
    }
    item.map.set(oldName, newName);
    return this;
  }
  /**
   * `addStructNameMigration(V, oldName, newName)` means "renamed as of
   * version V": data older than V (version < V) still has `oldName` and
   * needs translating; data at V or newer already has `newName`. Each call
   * registers one historical step, and this chases the whole chain --
   * `Widget@v2 -> Gadget`, `Gadget@v3 -> Thing` resolves `Widget` all the
   * way to `Thing` -- rather than requiring every old name to be registered
   * straight to whatever the current name happens to be.
   *
   * A name reused more than once (`a@V1 -> b`, `e@V2 -> a`, `a@V3 -> e`) can
   * make a later hop chase back to a name already visited in this same
   * lookup; that's a dead end; not a loop, so resolution stops there and
   * returns the last name reached rather than cycling forever.
   */
  structNameMigration(version, name) {
    const seen = /* @__PURE__ */ new Set([name]);
    for (; ; ) {
      let next;
      for (let i = 0; i < this.struct_names_migrations.length; i++) {
        const item = this.struct_names_migrations[i];
        if (version < item.version && item.map.has(name)) {
          next = item.map.get(name);
          break;
        }
      }
      if (next === void 0 || seen.has(next)) {
        return name;
      }
      name = next;
      seen.add(name);
    }
  }
  migrateJSON(json, cls_or_struct_id, options, stt) {
    const warnMissing = options.warnMissing ?? true;
    const keywords = this.constructor.keywords;
    options.reporter = options.reporter ?? ((s) => console.log(s));
    const reporter = options.reporter;
    let cls;
    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    if (stt === void 0) {
      stt = this.get_struct(cls.structName);
    }
    const getVersion = (parentVersion, presentStructName, data) => {
      const cls2 = this.get_struct_cls(presentStructName);
      if (cls2 === void 0) {
        if (warnMissing) {
          reporter("Struct " + presentStructName + " not found, migration may be incomplete");
          reporter("Use nstructjs.addStructNameMigration() to fix this.");
        }
        return parentVersion;
      }
      if (cls2.getVersionSTRUCT !== void 0) {
        return cls2.getVersionSTRUCT(data);
      }
      return parentVersion;
    };
    const getStruct = (version, sname, doVersion = true) => {
      if (doVersion) {
        sname = this.structNameMigration(version, sname);
      }
      if (!(sname in this.structs)) {
        if (warnMissing) {
          reporter("Struct " + sname + " not found, migration may be incomplete");
          reporter("Use nstructjs.addStructNameMigration() to fix this");
        }
        return void 0;
      }
      return this.structs[sname];
    };
    const isPossibleType = (type) => {
      switch (type) {
        case StructEnum.ARRAY:
        case StructEnum.ITER:
        case StructEnum.ITERKEYS:
        case StructEnum.STATIC_ARRAY:
        case StructEnum.TSTRUCT:
        case StructEnum.STRUCT:
        case StructEnum.OPTIONAL:
          return true;
      }
      return false;
    };
    const walkable = (data) => typeof data === "object" && data !== null && !Array.isArray(data);
    const walkArray = (version, arrayType, data) => {
      if (!isPossibleType(arrayType.type) || !Array.isArray(data)) {
        return;
      }
      for (const item of data) {
        dispatch(version, arrayType.data.type, item);
      }
    };
    const walkStruct = (version, sname, data, doVersion) => {
      if (!walkable(data)) {
        return;
      }
      const stt2 = getStruct(version, sname, doVersion);
      if (!stt2) {
        return;
      }
      const version2 = getVersion(version, stt2.name, data);
      const finish = (excludeFields) => {
        for (const field of stt2.fields) {
          if (isPossibleType(field.type.type) && !excludeFields?.includes(field.name)) {
            dispatch(version2, field.type, data[field.name]);
          }
        }
      };
      const cls2 = this.get_struct_cls(sname);
      if (cls2.migrateSTRUCT !== void 0) {
        cls2.migrateSTRUCT(version2, data, finish);
      } else {
        finish();
      }
    };
    const walkIterKeys = (version, type, data) => {
      if (!walkable(data)) {
        return;
      }
      for (const key of Object.keys(data)) {
        dispatch(version, type.data.type, data[key]);
      }
    };
    const this2 = this;
    function dispatch(version, type, data) {
      switch (type.type) {
        case StructEnum.ARRAY:
        case StructEnum.ITER:
        case StructEnum.STATIC_ARRAY:
          walkArray(version, type, data);
          break;
        case StructEnum.STRUCT:
          walkStruct(version, type.data, data);
          break;
        case StructEnum.ITERKEYS:
          walkIterKeys(version, type, data);
          break;
        case StructEnum.TSTRUCT: {
          if (!walkable(data)) {
            break;
          }
          const was = data[type.jsonKeyword];
          const name = this2.structNameMigration(version, was);
          if (name !== was) {
            data[type.jsonKeyword] = name;
          }
          walkStruct(getVersion(version, name, data), name, data, false);
          break;
        }
        case StructEnum.OPTIONAL:
          if (data !== void 0 && data !== null) {
            dispatch(version, type.data, data);
          }
          break;
      }
    }
    return walkStruct(options.version, stt.name, json, true);
  }
  validateJSON(json, cls_or_struct_id, useInternalParser = true, useColors = true, consoleLogger2 = function(...args) {
    console.log(...args);
  }, _abstractKey = "_structName") {
    if (cls_or_struct_id === void 0) {
      throw new Error(this.constructor.name + ".prototype.validateJSON: Expected at least two arguments");
    }
    try {
      let jsonStr = JSON.stringify(json, void 0, 2);
      this.jsonBuf = jsonStr;
      this.jsonUseColors = useColors;
      this.jsonLogger = consoleLogger2;
      struct_json_default.logger = this.jsonLogger;
      let parsed;
      if (useInternalParser) {
        parsed = struct_json_default.parse(jsonStr);
      } else {
        parsed = JSON.parse(jsonStr);
      }
      this.validateJSONIntern(parsed, cls_or_struct_id, _abstractKey);
    } catch (error) {
      if (!(error instanceof JSONError)) {
        console.error(error.stack);
      }
      this.jsonLogger(error.message);
      return false;
    }
    return true;
  }
  validateJSONIntern(json, cls_or_struct_id, _abstractKey = "_structName") {
    const keywords = this.constructor.keywords;
    let cls;
    let stt;
    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    stt = this.structs[cls.structName];
    if (stt === void 0) {
      throw new Error("unknown class " + cls);
    }
    const fields = stt.fields;
    const flen = fields.length;
    const keys = /* @__PURE__ */ new Set();
    keys.add(_abstractKey);
    let keyTestJson = json;
    for (let i = 0; i < flen; i++) {
      const f = fields[i];
      let val;
      let tokinfo;
      if (f.name === "this") {
        val = json;
        keyTestJson = {
          "this": json
        };
        keys.add("this");
        tokinfo = json[TokSymbol];
      } else {
        val = json[f.name];
        keys.add(f.name);
        const jsonTokInfo = json[TokSymbol];
        tokinfo = jsonTokInfo ? jsonTokInfo.fields[f.name] : void 0;
        if (!tokinfo) {
          const f2 = fields[Math.max(i - 1, 0)];
          const tokSymTokInfo = TokSymbol[TokSymbol];
          tokinfo = tokSymTokInfo ? tokSymTokInfo.fields[f2.name] : void 0;
        }
        if (!tokinfo) {
          tokinfo = json[TokSymbol];
        }
      }
      if (val === void 0) {
      }
      const instance = f.name === "this" ? val : json;
      const { ok, tokInfo: tokinfo2 } = sintern2.validateJSON(this, val, json, f, f.type, instance, _abstractKey);
      if (!ok || typeof ok === "string") {
        const msg = typeof ok === "string" ? ": " + ok : "";
        if (tokinfo2) {
          this.jsonLogger(printContext(this.jsonBuf, tokinfo2, this.jsonUseColors));
        }
        if (val === void 0) {
          throw new JSONError(stt.name + ": Missing json field " + f.name + msg);
        } else {
          throw new JSONError(stt.name + ": Invalid json field " + f.name + msg);
        }
      }
    }
    for (const k in keyTestJson) {
      if (typeof json[k] === "symbol") {
        continue;
      }
      if (!keys.has(k)) {
        this.jsonLogger(cls.STRUCT);
        throw new JSONError(stt.name + ": Unknown json field " + k);
      }
    }
    return { ok: true };
  }
  /**
   * Deserialize from json.
   * If migrate is not undefined, migration will be applied in-place
   * prior to deserialization; note this is different from binary which
   * happens in-place during deserialization.
   */
  readJSON(json, cls_or_struct_id, objInstance, migrate) {
    if (migrate) {
      this.migrateJSON(json, cls_or_struct_id, migrate);
    }
    const keywords = this.constructor.keywords;
    let cls;
    let stt;
    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }
    if (cls === void 0) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }
    stt = this.structs[cls.structName];
    packer_debug2("\n\n=Begin reading " + cls.structName + "=");
    const thestruct = this;
    const this2 = this;
    let was_run = false;
    const fromJSON2 = sintern2.fromJSON;
    function makeLoader(stt2) {
      return function load(obj) {
        if (was_run) {
          return;
        }
        was_run = true;
        const fields = stt2.fields;
        const flen = fields.length;
        for (let i = 0; i < flen; i++) {
          const f = fields[i];
          let val;
          if (f.name === "this") {
            val = json;
          } else {
            val = json[f.name];
          }
          if ((val === void 0 || val === null) && f.type.type !== StructEnum.OPTIONAL) {
            if (warninglvl2 > 1) {
              console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt2.name);
            }
            continue;
          }
          const instance = f.name === "this" ? obj : objInstance;
          const ret = fromJSON2(this2, val, obj, f, f.type, instance);
          if (f.name !== "this") {
            obj[f.name] = ret;
          }
        }
      };
    }
    const loader = makeLoader(stt);
    if (cls.prototype.loadSTRUCT !== void 0) {
      let obj = objInstance;
      if (!obj && cls.newSTRUCT !== void 0) {
        obj = cls.newSTRUCT.call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      const anyObj = obj;
      anyObj.loadSTRUCT(loader);
      return obj;
    } else if (cls.fromSTRUCT !== void 0) {
      if (warninglvl2 > 1) {
        console.warn(
          "Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead"
        );
      }
      const anyCls = cls;
      return anyCls.fromSTRUCT(loader);
    } else {
      let obj = objInstance;
      if (!obj && cls.newSTRUCT !== void 0) {
        obj = cls.newSTRUCT.call(
          cls,
          loader
        );
      } else if (!obj) {
        obj = new cls();
      }
      loader(obj);
      return obj;
    }
  }
  formatJSON_intern(json, stt, field, tlvl = 0) {
    const keywords = this.constructor.keywords;
    const addComments = this.formatCtx.addComments;
    let s = "{";
    if (addComments && field && field.comment.trim()) {
      s += " " + field.comment.trim();
    }
    s += "\n";
    for (const f of stt.fields) {
      const value = json[f.name];
      s += tab(tlvl + 1) + f.name + ": ";
      s += sintern2.formatJSON(this, value, json, f, f.type, void 0, tlvl + 1);
      s += ",";
      const basetype = f.type.type;
      let resolvedType = basetype;
      if (ArrayTypes.has(basetype)) {
        resolvedType = f.type.data.type.type;
      }
      const addComment = ValueTypes.has(resolvedType) && addComments && f.comment.trim();
      if (addComment) {
        s += " " + f.comment.trim();
      }
      s += "\n";
    }
    s += tab(tlvl) + "}";
    return s;
  }
  formatJSON(json, cls, addComments = true, validate = true) {
    const keywords = this.constructor.keywords;
    let s = "";
    if (validate) {
      this.validateJSON(json, cls);
    }
    const stt = this.structs[cls.structName];
    this.formatCtx = {
      addComments,
      validate
    };
    return this.formatJSON_intern(json, stt);
  }
};
STRUCT.setClassKeyword("STRUCT");
function deriveStructManager(keywords = {
  script: "STRUCT",
  name: void 0,
  load: void 0,
  new: void 0,
  from: void 0,
  migrate: void 0,
  getVersion: void 0
}) {
  if (!keywords.name) {
    keywords.name = keywords.script.toLowerCase() + "Name";
  }
  if (!keywords.load) {
    keywords.load = "load" + keywords.script;
  }
  if (!keywords.new) {
    keywords.new = "new" + keywords.script;
  }
  if (!keywords.from) {
    keywords.from = "from" + keywords.script;
  }
  if (!keywords.migrate) {
    keywords.migrate = "migrate" + keywords.script;
  }
  if (!keywords.getVersion) {
    keywords.getVersion = "getVersion" + keywords.script;
  }
  class NewSTRUCT extends STRUCT {
  }
  NewSTRUCT.keywords = keywords;
  return NewSTRUCT;
}
manager = new STRUCT();
function write_scripts(nManager = manager, include_code = false) {
  let buf = "";
  const nl = String.fromCharCode(10);
  const tab2 = String.fromCharCode(9);
  nManager.forEach(function(stt) {
    buf += STRUCT.fmt_struct(stt, false, !include_code) + nl;
  });
  let buf2 = buf;
  buf = "";
  for (let i = 0; i < buf2.length; i++) {
    const c = buf2[i];
    if (c === nl) {
      buf += nl;
      const i2 = i;
      while (i < buf2.length && (buf2[i] === " " || buf2[i] === tab2 || buf2[i] === nl)) {
        i++;
      }
      if (i !== i2) i--;
    } else {
      buf += c;
    }
  }
  return buf;
}

// src/struct_filehelper.ts
var nbtoa;
var natob;
if (typeof btoa === "undefined") {
  nbtoa = function(str) {
    const buffer = Buffer.from("" + str, "binary");
    return buffer.toString("base64");
  };
  natob = function(str) {
    return Buffer.from(str, "base64").toString("binary");
  };
} else {
  natob = atob;
  nbtoa = btoa;
}
function versionToInt(v) {
  const ver = versionCoerce(v);
  const mul = 64;
  return ~~(ver.major * mul * mul * mul + ver.minor * mul * mul + ver.micro * mul);
}
var ver_pat = /[0-9]+\.[0-9]+\.[0-9]+$/;
function versionCoerce(v) {
  if (!v) {
    throw new Error("empty version: " + v);
  }
  if (typeof v === "string") {
    if (!ver_pat.exec(v)) {
      throw new Error("invalid version string " + v);
    }
    const ver = v.split(".");
    return {
      major: parseInt(ver[0]),
      minor: parseInt(ver[1]),
      micro: parseInt(ver[2])
    };
  } else if (Array.isArray(v)) {
    return {
      major: v[0],
      minor: v[1],
      micro: v[2]
    };
  } else if (typeof v === "object") {
    const test = (k) => k in v && typeof v[k] === "number";
    if (!test("major") || !test("minor") || !test("micro")) {
      throw new Error("invalid version object: " + v);
    }
    return v;
  } else {
    throw new Error("invalid version " + v);
  }
}
function versionLessThan(a, b) {
  return versionToInt(a) < versionToInt(b);
}
var FileParams = class {
  constructor() {
    this.magic = "STRT";
    this.ext = ".bin";
    this.blocktypes = ["DATA"];
    this.version = {
      major: 0,
      minor: 0,
      micro: 1
    };
  }
};
var Block = class {
  constructor(type, data) {
    this.type = type || "";
    this.data = data;
  }
};
var FileError = class extends Error {
};
var FileHelper = class {
  //params can be FileParams instance, or object literal
  //(it will convert to FileParams)
  constructor(params) {
    const fp = new FileParams();
    if (params !== void 0) {
      for (const k in params) {
        fp[k] = params[k];
      }
    }
    this.version = fp.version;
    this.blocktypes = fp.blocktypes;
    this.magic = fp.magic;
    this.ext = fp.ext;
    this.struct = void 0;
    this.unpack_ctx = void 0;
  }
  read(dataview) {
    this.unpack_ctx = new unpack_context();
    const magic = unpack_static_string(dataview, this.unpack_ctx, 4);
    if (magic !== this.magic) {
      throw new FileError("corrupted file");
    }
    this.version = {
      major: 0,
      minor: 0,
      micro: 0
    };
    this.version.major = unpack_short(dataview, this.unpack_ctx);
    this.version.minor = unpack_byte(dataview, this.unpack_ctx);
    this.version.micro = unpack_byte(dataview, this.unpack_ctx);
    const struct = this.struct = new STRUCT();
    const fileVersion = versionToInt(this.version);
    const scripts = unpack_string(dataview, this.unpack_ctx);
    this.struct.parse_structs(scripts, manager, fileVersion);
    const blocks = [];
    const dviewlen = dataview.buffer.byteLength;
    while (this.unpack_ctx.i < dviewlen) {
      const type = unpack_static_string(dataview, this.unpack_ctx, 4);
      const datalen = unpack_int(dataview, this.unpack_ctx);
      const bstruct = unpack_int(dataview, this.unpack_ctx);
      let bdata;
      if (bstruct === -2) {
        bdata = unpack_static_string(dataview, this.unpack_ctx, datalen);
      } else {
        const rawData = unpack_bytes(dataview, this.unpack_ctx, datalen);
        bdata = struct.read_object(rawData, bstruct, new unpack_context(fileVersion));
      }
      const block = new Block();
      block.type = type;
      block.data = bdata;
      blocks.push(block);
    }
    this.blocks = blocks;
    return blocks;
  }
  doVersions(old) {
    if (versionLessThan(old, "0.0.1")) {
    }
  }
  write(blocks) {
    this.struct = manager;
    this.blocks = blocks;
    const data = new BinWriter();
    pack_static_string(data, this.magic, 4);
    pack_short(data, this.version.major);
    pack_byte(data, this.version.minor & 255);
    pack_byte(data, this.version.micro & 255);
    const scripts = write_scripts();
    pack_string(data, scripts);
    const struct = this.struct;
    for (const block of blocks) {
      if (typeof block.data === "string") {
        pack_static_string(data, block.type, 4);
        pack_int(data, block.data.length);
        pack_int(data, -2);
        pack_static_string(data, block.data, block.data.length);
        continue;
      }
      const blockData = block.data;
      const structNameVal = blockData.constructor.structName;
      if (structNameVal === void 0 || !(structNameVal in struct.structs)) {
        throw new Error("Non-STRUCTable object " + block.data);
      }
      const data2 = new BinWriter();
      const stt = struct.structs[structNameVal];
      struct.write_object(data2, block.data);
      pack_static_string(data, block.type, 4);
      pack_int(data, data2.length);
      pack_int(data, stt.id);
      data.pushBytes(data2.finish());
    }
    return new DataView(data.toBytes().buffer);
  }
  writeBase64(blocks) {
    const dataview = this.write(blocks);
    let str = "";
    const bytes = new Uint8Array(dataview.buffer);
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return nbtoa(str);
  }
  makeBlock(type, data) {
    return new Block(type, data);
  }
  readBase64(base64) {
    const data = natob(base64);
    const data2 = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      data2[i] = data.charCodeAt(i);
    }
    return this.read(new DataView(data2.buffer));
  }
};

// src/structjs.ts
function truncateDollarSign2(value = true) {
  setTruncateDollarSign(value);
}
function validateStructs(onerror) {
  return manager.validateStructs(onerror);
}
function setEndian(mode) {
  const ret = STRUCT_ENDIAN;
  setBinaryEndian(mode);
  return ret;
}
function consoleLogger(...args) {
  console.log(...args);
}
function validateJSON2(json, cls, useInternalParser, printColors = true, logger = consoleLogger) {
  return manager.validateJSON(json, cls, useInternalParser, printColors, logger);
}
function getEndian() {
  return STRUCT_ENDIAN;
}
function setAllowOverriding(t) {
  return manager.allowOverriding = !!t;
}
function isRegistered(cls) {
  return manager.isRegistered(cls);
}
function inlineRegister(cls, structScript) {
  return manager.inlineRegister(cls, structScript);
}
function register(cls, structName) {
  return manager.register(cls, structName);
}
function unregister(cls) {
  manager.unregister(cls);
}
function inherit(child, parent, structName = child.name) {
  return STRUCT.inherit(child, parent, structName);
}
function readObject(data, cls, __uctx, version) {
  return manager.readObject(data, cls, __uctx, version);
}
function writeObject(data, obj) {
  return manager.writeObject(data, obj);
}
function writeJSON(obj) {
  return manager.writeJSON(obj);
}
function formatJSON2(json, cls, addComments = true, validate = true) {
  return manager.formatJSON(json, cls, addComments, validate);
}
function migrateJSON(json, class_or_struct_id, migrateOptions) {
  return manager.migrateJSON(json, class_or_struct_id, migrateOptions);
}
function readJSON(json, class_or_struct_id, migrate) {
  return manager.readJSON(json, class_or_struct_id, void 0, migrate);
}
var tinyeval = void 0;
function useTinyEval() {
}
export {
  BinWriter,
  JSONError,
  STABLE_ID_BASE,
  STABLE_ID_LIMIT,
  STRUCT,
  _truncateDollarSign,
  struct_binpack_exports as binpack,
  consoleLogger,
  deriveStructManager,
  struct_filehelper_exports as filehelper,
  formatJSON2 as formatJSON,
  getEndian,
  inherit,
  inlineRegister,
  isRegistered,
  manager,
  migrateJSON,
  struct_parser_exports as parser,
  struct_parseutil_exports as parseutil,
  readJSON,
  readObject,
  register,
  setAllowOverriding,
  setDebugMode,
  setEndian,
  setTruncateDollarSign,
  setWarningMode,
  stableStructId,
  tinyeval,
  truncateDollarSign2 as truncateDollarSign,
  struct_typesystem_exports as typesystem,
  unpack_context,
  unregister,
  useTinyEval,
  validateJSON2 as validateJSON,
  validateStructs,
  writeJSON,
  writeObject,
  write_scripts
};
