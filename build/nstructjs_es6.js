let colormap = {
  "black"   : 30,
  "red"     : 31,
  "green"   : 32,
  "yellow"  : 33,
  "blue"    : 34,
  "magenta" : 35,
  "cyan"    : 36,
  "white"   : 37,
  "reset"   : 0,
  "grey"    : 2,
  "orange"  : 202,
  "pink"    : 198,
  "brown"   : 314,
  "lightred": 91,
  "peach"   : 210
};

function tab(n, chr = ' ') {
  let t = '';

  for (let i = 0; i < n; i++) {
    t += chr;
  }

  return t;
}

let termColorMap = {};
for (let k in colormap) {
  termColorMap[k] = colormap[k];
  termColorMap[colormap[k]] = k;
}

function termColor(s, c) {
  if (typeof s === "symbol") {
    s = s.toString();
  } else {
    s = "" + s;
  }

  if (c in colormap)
    c = colormap[c];

  if (c > 107) {
    let s2 = '\u001b[38;5;' + c + "m";
    return s2 + s + '\u001b[0m'
  }

  return '\u001b[' + c + 'm' + s + '\u001b[0m'
};

function termPrint() {
  //let console = window.console;

  let s = '';
  for (let i = 0; i < arguments.length; i++) {
    if (i > 0) {
      s += ' ';
    }
    s += arguments[i];
  }

  let re1a = /\u001b\[[1-9][0-9]?m/;
  let re1b = /\u001b\[[1-9][0-9];[0-9][0-9]?;[0-9]+m/;
  let re2 = /\u001b\[0m/;

  let endtag = '\u001b[0m';

  function tok(s, type) {
    return {
      type : type,
      value: s
    }
  }

  let tokdef = [
    [re1a, "start"],
    [re1b, "start"],
    [re2, "end"]
  ];

  let s2 = s;

  let i = 0;
  let tokens = [];

  while (s2.length > 0) {
    let ok = false;

    let mintk = undefined, mini = undefined;
    let minslice = undefined, mintype = undefined;

    for (let tk of tokdef) {
      let i = s2.search(tk[0]);

      if (i >= 0 && (mini === undefined || i < mini)) {
        minslice = s2.slice(i, s2.length).match(tk[0])[0];
        mini = i;
        mintype = tk[1];
        mintk = tk;
        ok = true;
      }
    }

    if (!ok) {
      break;
    }

    if (mini > 0) {
      let chunk = s2.slice(0, mini);
      tokens.push(tok(chunk, "chunk"));
    }

    s2 = s2.slice(mini+minslice.length, s2.length);
    let t = tok(minslice, mintype);

    tokens.push(t);
  }

  if (s2.length > 0) {
    tokens.push(tok(s2, "chunk"));
  }

  let stack = [];
  let cur;

  let out = '';

  for (let t of tokens) {
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
  let ret = [];

  for (let item of iter) {
    ret.push(item);
  }

  return ret;
}

var util = /*#__PURE__*/Object.freeze({
  __proto__: null,
  tab: tab,
  termColorMap: termColorMap,
  termColor: termColor,
  termPrint: termPrint,
  list: list
});

"use strict";

function print_lines(ld, lineno, col, printColors, token) {
  let buf = '';
  let lines = ld.split("\n");
  let istart = Math.max(lineno - 5, 0);
  let iend = Math.min(lineno + 3, lines.length);

  let color = printColors ? (c) => c : termColor;

  for (let i = istart; i < iend; i++) {
    let l = "" + (i + 1);
    while (l.length < 3) {
      l = " " + l;
    }

    l += `: ${lines[i]}\n`;

    if (i === lineno && token && token.value.length === 1) {
      l = l.slice(0, col + 5) + color(l[col + 5], "yellow") + l.slice(col + 6, l.length);
    }
    buf += l;
    if (i === lineno) {
      let colstr = '     ';
      for (let i = 0; i < col; i++) {
        colstr += ' ';
      }
      colstr += color("^", "red");

      buf += colstr + "\n";
    }
  }

  buf = "------------------\n" + buf + "\n==================\n";
  return buf;
}

class token {
  constructor(type, val, lexpos, lineno, lexer, parser, col) {
    this.type = type;
    this.value = val;
    this.lexpos = lexpos;
    this.lineno = lineno;
    this.col = col;
    this.lexer = lexer;
    this.parser = parser;
  }

  toString() {
    if (this.value !== undefined)
      return "token(type=" + this.type + ", value='" + this.value + "')";
    else
      return "token(type=" + this.type + ")";
  }
}

class tokdef {
  constructor(name, regexpr, func, example) {
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

class PUTIL_ParseError extends Error {
  constructor(msg) {
    super();
  }
}

class lexer {
  constructor(tokdef, errfunc) {
    this.tokdef = tokdef;
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
    for (let i = 0; i < tokdef.length; i++) {
      this.tokints[tokdef[i].name] = i;
    }
    this.statestack = [["__main__", 0]];
    this.states = {"__main__": [tokdef, errfunc]};
    this.statedata = 0;

    this.logger = function () {
      console.log(...arguments);
    };
  }

  add_state(name, tokdef, errfunc) {
    if (errfunc === undefined) {
      errfunc = function (lexer) {
        return true;
      };
    }
    this.states[name] = [tokdef, errfunc];
  }

  tok_int(name) {
  }

  push_state(state, statedata) {
    this.statestack.push([state, statedata]);
    state = this.states[state];
    this.statedata = statedata;
    this.tokdef = state[0];
    this.errfunc = state[1];
  }

  pop_state() {
    let item = this.statestack[this.statestack.length - 1];
    let state = this.states[item[0]];
    this.tokdef = state[0];
    this.errfunc = state[1];
    this.statedata = item[1];
  }

  input(str) {
    let linemap = this.linemap = new Array(str.length);
    let lineno = 0;
    let col = 0;
    let colmap = this.colmap = new Array(str.length);

    for (let i = 0; i < str.length; i++, col++) {
      let c = str[i];

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
    if (this.errfunc !== undefined && !this.errfunc(this))
      return;

    let safepos = Math.min(this.lexpos, this.lexdata.length - 1);
    let line = this.linemap[safepos];
    let col = this.colmap[safepos];

    let s = print_lines(this.lexdata, line, col, true);

    this.logger("  " + s);
    this.logger("Syntax error near line " + (this.lineno + 1));

    let next = Math.min(this.lexpos + 8, this.lexdata.length);

    throw new PUTIL_ParseError("Parse error");
  }

  peek() {
    let tok = this.next(true);
    if (tok === undefined)
      return undefined;
    this.peeked_tokens.push(tok);
    return tok;
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
      let tok = this.peeked_tokens[0];
      this.peeked_tokens.shift();

      if (!ignore_peek && this.printTokens) {
        this.logger("" + tok);
      }

      return tok;
    }

    if (this.lexpos >= this.lexdata.length)
      return undefined;

    let ts = this.tokdef;
    let tlen = ts.length;
    let lexdata = this.lexdata.slice(this.lexpos, this.lexdata.length);
    let results = [];

    for (var i = 0; i < tlen; i++) {
      let t = ts[i];
      if (t.re === undefined)
        continue;
      let res = t.re.exec(lexdata);
      if (res !== null && res !== undefined && res.index === 0) {
        results.push([t, res]);
      }
    }

    let max_res = 0;
    let theres = undefined;
    for (var i = 0; i < results.length; i++) {
      let res = results[i];
      if (res[1][0].length > max_res) {
        theres = res;
        max_res = res[1][0].length;
      }
    }

    if (theres === undefined) {
      this.error();
      return;
    }

    let def = theres[0];
    let col = this.colmap[Math.min(this.lexpos, this.lexdata.length - 1)];

    if (this.lexpos < this.lexdata.length) {
      this.lineno = this.linemap[this.lexpos];
    }

    let tok = new token(def.name, theres[1][0], this.lexpos, this.lineno, this, undefined, col);
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

class parser {
  constructor(lexer, errfunc) {
    this.lexer = lexer;
    this.errfunc = errfunc;
    this.start = undefined;

    this.logger = function () {
      console.log(...arguments);
    };
  }

  parse(data, err_on_unconsumed) {
    if (err_on_unconsumed === undefined)
      err_on_unconsumed = true;

    if (data !== undefined)
      this.lexer.input(data);

    let ret = this.start(this);

    if (err_on_unconsumed && !this.lexer.at_end() && this.lexer.next() !== undefined) {
      this.error(undefined, "parser did not consume entire input");
    }
    return ret;
  }

  input(data) {
    this.lexer.input(data);
  }

  error(token, msg) {
    let estr;

    if (msg === undefined)
      msg = "";
    if (token === undefined)
      estr = "Parse error at end of input: " + msg;
    else
      estr = `Parse error at line ${token.lineno + 1}:${token.col + 1}: ${msg}`;

    let buf = "";
    let ld = this.lexer.lexdata;
    let lineno = token ? token.lineno : this.lexer.linemap[this.lexer.linemap.length - 1];
    let col = token ? token.col : 0;

    ld = ld.replace(/\r/g, '');

    this.logger(print_lines(ld, lineno, col, true, token));
    this.logger(estr);

    if (this.errfunc && !this.errfunc(token)) {
      return;
    }
    throw new PUTIL_ParseError(estr);
  }

  peek() {
    let tok = this.lexer.peek();
    if (tok !== undefined)
      tok.parser = this;
    return tok;
  }

  peeknext() {
    let tok = this.lexer.peeknext();
    if (tok !== undefined)
      tok.parser = this;
    return tok;
  }

  next() {
    let tok = this.lexer.next();

    if (tok !== undefined)
      tok.parser = this;
    return tok;
  }

  optional(type) {
    let tok = this.peeknext();
    if (tok === undefined)
      return false;
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
    let tok = this.next();

    if (msg === undefined) {
      msg = type;

      for (let tk of this.lexer.tokdef) {
        if (tk.name === type && tk.example) {
          msg = tk.example;
        }
      }
    }

    if (tok === undefined || tok.type !== type) {
      this.error(tok, "Expected " + msg);
    }
    return tok.value;
  }
}

function test_parser() {
  let basic_types = new Set(["int", "float", "double", "vec2", "vec3", "vec4", "mat4", "string"]);
  let reserved_tokens = new Set(["int", "float", "double", "vec2", "vec3", "vec4", "mat4", "string", "static_string",
                                 "array"]);

  function tk(name, re, func) {
    return new tokdef(name, re, func);
  }

  let tokens = [tk("ID", /[a-zA-Z]+[a-zA-Z0-9_]*/, function (t) {
    if (reserved_tokens.has(t.value)) {
      t.type = t.value.toUpperCase();
    }
    return t;
  }), tk("OPEN", /\{/), tk("CLOSE", /}/), tk("COLON", /:/), tk("JSCRIPT", /\|/, function (t) {
    let js = "";
    let lexer = t.lexer;
    while (lexer.lexpos < lexer.lexdata.length) {
      let c = lexer.lexdata[lexer.lexpos];
      if (c === "\n")
        break;
      js += c;
      lexer.lexpos++;
    }
    if (js.endsWith(";")) {
      js = js.slice(0, js.length - 1);
      lexer.lexpos--;
    }
    t.value = js;
    return t;
  }), tk("LPARAM", /\(/), tk("RPARAM", /\)/), tk("COMMA", /,/), tk("NUM", /[0-9]/), tk("SEMI", /;/),
                tk("NEWLINE", /\n/, function (t) {
                  t.lexer.lineno += 1;
                }), tk("SPACE", / |\t/, function (t) {
    })];

  for (let rt of reserved_tokens) {
    tokens.push(tk(rt.toUpperCase()));
  }

  let a = `
  Loop {
    eid : int;
    flag : int;
    index : int;
    type : int;

    co : vec3;
    no : vec3;
    loop : int | eid(loop);
    edges : array(e, int) | e.eid;

    loops :, array(Loop);
  }
  `;


  function errfunc(lexer) {
    return true;
  }

  let lex = new lexer(tokens, errfunc);
  console.log("Testing lexical scanner...");
  lex.input(a);
  let token;
  while (token = lex.next()) {
    console.log(token.toString());
  }
  let parse = new parser(lex);
  parse.input(a);

  function p_Array(p) {
    p.expect("ARRAY");
    p.expect("LPARAM");
    let arraytype = p_Type(p);
    let itername = "";
    if (p.optional("COMMA")) {
      itername = arraytype;
      arraytype = p_Type(p);
    }
    p.expect("RPARAM");
    return {type: "array", data: {type: arraytype, iname: itername}}
  }

  function p_Type(p) {
    let tok = p.peek();
    if (tok.type === "ID") {
      p.next();
      return {type: "struct", data: "\"" + tok.value + "\""}
    } else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return {type: tok.type.toLowerCase()}
    } else if (tok.type === "ARRAY") {
      return p_Array(p);
    } else {
      p.error(tok, "invalid type " + tok.type);
    }
  }

  function p_Field(p) {
    let field = {};
    console.log("-----", p.peek().type);
    field.name = p.expect("ID", "struct field name");
    p.expect("COLON");
    field.type = p_Type(p);
    field.set = undefined;
    field.get = undefined;
    let tok = p.peek();
    if (tok.type === "JSCRIPT") {
      field.get = tok.value;
      p.next();
    }
    tok = p.peek();
    if (tok.type === "JSCRIPT") {
      field.set = tok.value;
      p.next();
    }
    p.expect("SEMI");
    return field;
  }

  function p_Struct(p) {
    let st = {};
    st.name = p.expect("ID", "struct name");
    st.fields = [];
    p.expect("OPEN");
    while (1) {
      if (p.at_end()) {
        p.error(undefined);
      } else if (p.optional("CLOSE")) {
        break;
      } else {
        st.fields.push(p_Field(p));
      }
    }
    return st;
  }

  let ret = p_Struct(parse);
  console.log(JSON.stringify(ret));
}

//test_parser();

var struct_parseutil = /*#__PURE__*/Object.freeze({
  __proto__: null,
  token: token,
  tokdef: tokdef,
  PUTIL_ParseError: PUTIL_ParseError,
  lexer: lexer,
  parser: parser
});

"use strict";

class NStruct {
  constructor(name) {
    this.fields = [];
    this.id = -1;
    this.name = name;
  }
}

//the discontinuous id's are to make sure
//the version I originally wrote (which had a few application-specific types)
//and this one do not become totally incompatible.
const StructEnum = {
  INT          : 0,
  FLOAT        : 1,
  DOUBLE       : 2,
  STRING       : 7,
  STATIC_STRING: 8, //fixed-length string
  STRUCT       : 9,
  TSTRUCT      : 10,
  ARRAY        : 11,
  ITER         : 12,
  SHORT        : 13,
  BYTE         : 14,
  BOOL         : 15,
  ITERKEYS     : 16,
  UINT         : 17,
  USHORT       : 18,
  STATIC_ARRAY : 19,
  SIGNED_BYTE  : 20
};

const ArrayTypes = new Set([
  StructEnum.STATIC_ARRAY, StructEnum.ARRAY, StructEnum.ITERKEYS, StructEnum.ITER
]);

const ValueTypes = new Set([
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

let StructTypes = {
  "int"          : StructEnum.INT,
  "uint"         : StructEnum.UINT,
  "ushort"       : StructEnum.USHORT,
  "float"        : StructEnum.FLOAT,
  "double"       : StructEnum.DOUBLE,
  "string"       : StructEnum.STRING,
  "static_string": StructEnum.STATIC_STRING,
  "struct"       : StructEnum.STRUCT,
  "abstract"     : StructEnum.TSTRUCT,
  "array"        : StructEnum.ARRAY,
  "iter"         : StructEnum.ITER,
  "short"        : StructEnum.SHORT,
  "byte"         : StructEnum.BYTE,
  "bool"         : StructEnum.BOOL,
  "iterkeys"     : StructEnum.ITERKEYS,
  "sbyte"        : StructEnum.SIGNED_BYTE
};

let StructTypeMap = {};

for (let k in StructTypes) {
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
  let s = '';

  const MAIN = 0, COMMENT = 1, STR = 2;

  let p, n;
  let strs = new Set(["'", '"', "`"]);
  let mode = MAIN;
  let strlit;
  let escape = false;

  for (let i = 0; i < buf.length; i++) {
    let p = i > 0 ? buf[i - 1] : undefined;
    let c = buf[i];
    let n = i < buf.length - 1 ? buf[i + 1] : undefined;

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
      escape ^= true;
    } else {
      escape = false;
    }
  }

  return s;
}

function StructParser() {
  let basic_types = new Set([
    "int", "float", "double", "string", "short", "byte", "sbyte", "bool", "uint", "ushort"
  ]);

  let reserved_tokens = new Set([
    "int", "float", "double", "string", "static_string", "array",
    "iter", "abstract", "short", "byte", "sbyte", "bool", "iterkeys", "uint", "ushort",
    "static_array"
  ]);

  function tk(name, re, func) {
    return new tokdef(name, re, func);
  }

  let tokens = [
    tk("ID", /[a-zA-Z_$]+[a-zA-Z0-9_\.$]*/, function (t) {

      if (reserved_tokens.has(t.value)) {
        t.type = t.value.toUpperCase();
      }
      return t;
    }, "identifier"),
    tk("OPEN", /\{/),
    tk("EQUALS", /=/),
    tk("CLOSE", /}/),
    tk("STRLIT", /\"[^"]*\"/, t => {
      t.value = t.value.slice(1, t.value.length - 1);
      return t;
    }),
    tk("STRLIT", /\'[^']*\'/, t => {
      t.value = t.value.slice(1, t.value.length - 1);
      return t;
    }),
    tk("COLON", /:/),
    tk("SOPEN", /\[/),
    tk("SCLOSE", /\]/),
    tk("JSCRIPT", /\|/, function (t) {
      let js = "";
      let lexer = t.lexer;
      let p;

      while (lexer.lexpos < lexer.lexdata.length) {
        let c = lexer.lexdata[lexer.lexpos];
        if (c === "\n")
          break;

        if (c === "/" && p === "/") {
          js = js.slice(0, js.length - 1);
          lexer.lexpos--;

          break;
        }

        js += c;
        lexer.lexpos++;
        p = c;
      }

      while (js.trim().endsWith(";")) {
        js = js.slice(0, js.length - 1);
        lexer.lexpos--;
      }
      t.value = js.trim();
      return t;
    }),
    tk("COMMENT", /\/\/.*[\n\r]/),
    tk("LPARAM", /\(/),
    tk("RPARAM", /\)/),
    tk("COMMA", /,/),
    tk("NUM", /[0-9]+/, undefined, "number"),
    tk("SEMI", /;/),
    tk("NEWLINE", /\n/, function (t) {
      t.lexer.lineno += 1;
    }, "newline"),
    tk("SPACE", / |\t/, function (t) {
    }, "whitespace")
  ];

  reserved_tokens.forEach(function (rt) {
    tokens.push(tk(rt.toUpperCase()));
  });

  function errfunc(lexer) {
    return true;
  }

  class Lexer extends lexer {
    input(str) {
      //str = stripComments(str);
      return super.input(str);
    }
  }

  let lex = new Lexer(tokens, errfunc);
  let parser$1 = new parser(lex);

  function p_Static_String(p) {
    p.expect("STATIC_STRING");
    p.expect("SOPEN");
    let num = p.expect("NUM");
    p.expect("SCLOSE");
    return {type: StructEnum.STATIC_STRING, data: {maxlength: num}}
  }

  function p_DataRef(p) {
    p.expect("DATAREF");
    p.expect("LPARAM");
    let tname = p.expect("ID");
    p.expect("RPARAM");
    return {type: StructEnum.DATAREF, data: tname}
  }

  function p_Array(p) {
    p.expect("ARRAY");
    p.expect("LPARAM");
    let arraytype = p_Type(p);

    let itername = "";
    if (p.optional("COMMA")) {
      itername = arraytype.data.replace(/"/g, "");
      arraytype = p_Type(p);
    }

    p.expect("RPARAM");
    return {type: StructEnum.ARRAY, data: {type: arraytype, iname: itername}}
  }

  function p_Iter(p) {
    p.expect("ITER");
    p.expect("LPARAM");

    let arraytype = p_Type(p);
    let itername = "";

    if (p.optional("COMMA")) {
      itername = arraytype.data.replace(/"/g, "");
      arraytype = p_Type(p);
    }

    p.expect("RPARAM");
    return {type: StructEnum.ITER, data: {type: arraytype, iname: itername}}
  }

  function p_StaticArray(p) {
    p.expect("STATIC_ARRAY");
    p.expect("SOPEN");
    let arraytype = p_Type(p);
    let itername = "";

    p.expect("COMMA");
    let size = p.expect("NUM");

    if (size < 0 || Math.abs(size - Math.floor(size)) > 0.000001) {
      console.log(Math.abs(size - Math.floor(size)));
      p.error("Expected an integer");
    }

    size = Math.floor(size);

    if (p.optional("COMMA")) {
      itername = p_Type(p).data;
    }

    p.expect("SCLOSE");
    return {type: StructEnum.STATIC_ARRAY, data: {type: arraytype, size: size, iname: itername}}
  }

  function p_IterKeys(p) {
    p.expect("ITERKEYS");
    p.expect("LPARAM");

    let arraytype = p_Type(p);
    let itername = "";

    if (p.optional("COMMA")) {
      itername = arraytype.data.replace(/"/g, "");
      arraytype = p_Type(p);
    }

    p.expect("RPARAM");
    return {type: StructEnum.ITERKEYS, data: {type: arraytype, iname: itername}}
  }

  function p_Abstract(p) {
    p.expect("ABSTRACT");
    p.expect("LPARAM");
    let type = p.expect("ID");

    let jsonKeyword = "_structName";

    if (p.optional("COMMA")) {
      jsonKeyword = p.expect("STRLIT");
    }

    p.expect("RPARAM");

    return {
      type: StructEnum.TSTRUCT,
      data: type,
      jsonKeyword
    }
  }

  function p_Type(p) {
    let tok = p.peeknext();

    if (tok.type === "ID") {
      p.next();
      return {type: StructEnum.STRUCT, data: tok.value}
    } else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return {type: StructTypes[tok.type.toLowerCase()]}
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
      return p_DataRef(p);
    } else {
      p.error(tok, "invalid type " + tok.type);
    }
  }

  function p_ID_or_num(p) {
    let t = p.peeknext();

    if (t.type === "NUM") {
      p.next();
      return t.value;
    } else {
      return p.expect("ID", "struct field name");
    }
  }

  function p_Field(p) {
    let field = {};

    field.name = p_ID_or_num(p);
    p.expect("COLON");

    field.type = p_Type(p);
    field.set = undefined;
    field.get = undefined;

    let check = 0;

    let tok = p.peeknext();

    if (tok && tok.type === "JSCRIPT") {
      field.get = tok.value;
      check = 1;

      p.next();
      tok = p.peeknext();
    }

    if (tok && tok.type === "JSCRIPT") {
      check = 1;
      field.set = tok.value;

      p.next();
    }

    p.expect("SEMI");

    tok = p.peeknext();

    if (tok && tok.type === "COMMENT") {
      field.comment = tok.value;
      p.next();
    } else {
      field.comment = "";
    }

    return field;
  }

  function p_Struct(p) {
    let name = p.expect("ID", "struct name");

    let st = new NStruct(name);

    let tok = p.peeknext();
    let id = -1;

    if (tok.type === "ID" && tok.value === "id") {
      p.next();
      p.expect("EQUALS");
      st.id = p.expect("NUM");
    }

    p.expect("OPEN");
    while (1) {
      if (p.at_end()) {
        p.error(undefined);
      } else if (p.optional("CLOSE")) {
        break;
      } else {
        st.fields.push(p_Field(p));
      }
    }

    return st;
  }

  parser$1.start = p_Struct;
  return parser$1;
}

const struct_parse = StructParser();

var struct_parser = /*#__PURE__*/Object.freeze({
  __proto__: null,
  NStruct: NStruct,
  StructEnum: StructEnum,
  ArrayTypes: ArrayTypes,
  ValueTypes: ValueTypes,
  StructTypes: StructTypes,
  StructTypeMap: StructTypeMap,
  stripComments: stripComments,
  struct_parse: struct_parse
});

/** dead file */

var struct_typesystem = /*#__PURE__*/Object.freeze({
  __proto__: null
});

"use strict";

var STRUCT_ENDIAN = true; //little endian

function setBinaryEndian(mode) {
  STRUCT_ENDIAN = !!mode;
}

let temp_dataview = new DataView(new ArrayBuffer(16));
let uint8_view = new Uint8Array(temp_dataview.buffer);

class unpack_context {
  constructor() {
    this.i = 0;
  }
}

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
  for (let i = 0; i < bytes.length; i++) {
    array.push(bytes[i]);
  }
}

function pack_int(array, val) {
  temp_dataview.setInt32(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

function pack_uint(array, val) {
  temp_dataview.setUint32(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

function pack_ushort(array, val) {
  temp_dataview.setUint16(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
}

function pack_float(array, val) {
  temp_dataview.setFloat32(0, val, STRUCT_ENDIAN);

  array.push(uint8_view[0]);
  array.push(uint8_view[1]);
  array.push(uint8_view[2]);
  array.push(uint8_view[3]);
}

function pack_double(array, val) {
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

      if (c !== 0)
        uc |= 128;

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
    let lasti = i;

    while (i < arr.length && (c & 128)) {
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
  let s = "a" + String.fromCharCode(8800) + "b";
  let arr = [];

  encode_utf8(arr, s);
  let s2 = decode_utf8(arr);

  if (s !== s2) {
    throw new Error("UTF-8 encoding/decoding test failed");
  }

  return true;
}

function truncate_utf8(arr, maxlen) {
  let len = Math.min(arr.length, maxlen);

  let last_codepoint = 0;
  let last2 = 0;

  let incode = false;
  let i = 0;
  let code = 0;
  while (i < len) {
    incode = arr[i] & 128;

    if (!incode) {
      last2 = last_codepoint + 1;
      last_codepoint = i + 1;
    }

    i++;
  }

  if (last_codepoint < maxlen)
    arr.length = last_codepoint;
  else
    arr.length = last2;

  return arr;
}

let _static_sbuf_ss = new Array(2048);

function pack_static_string(data, str, length) {
  if (length === undefined)
    throw new Error("'length' paremter is not optional for pack_static_string()");

  let arr = length < 2048 ? _static_sbuf_ss : new Array();
  arr.length = 0;

  encode_utf8(arr, str);
  truncate_utf8(arr, length);

  for (let i = 0; i < length; i++) {
    if (i >= arr.length) {
      data.push(0);
    } else {
      data.push(arr[i]);
    }
  }
}

let _static_sbuf = new Array(32);

/*strings are packed as 32-bit unicode codepoints*/
function pack_string(data, str) {
  _static_sbuf.length = 0;
  encode_utf8(_static_sbuf, str);

  pack_int(data, _static_sbuf.length);

  for (let i = 0; i < _static_sbuf.length; i++) {
    data.push(_static_sbuf[i]);
  }
}

function unpack_bytes(dview, uctx, len) {
  let ret = new DataView(dview.buffer.slice(uctx.i, uctx.i + len));
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

let _static_arr_us = new Array(32);

function unpack_string(data, uctx) {
  let slen = unpack_int(data, uctx);

  if (!slen) {
    return "";
  }

  let str = "";
  let arr = slen < 2048 ? _static_arr_us : new Array(slen);

  arr.length = slen;
  for (let i = 0; i < slen; i++) {
    arr[i] = unpack_byte(data, uctx);
  }

  return decode_utf8(arr);
}

let _static_arr_uss = new Array(2048);

function unpack_static_string(data, uctx, length) {
  let str = "";

  if (length === undefined)
    throw new Error("'length' cannot be undefined in unpack_static_string()");

  let arr = length < 2048 ? _static_arr_uss : new Array(length);
  arr.length = 0;

  let done = false;
  for (let i = 0; i < length; i++) {
    let c = unpack_byte(data, uctx);

    if (c === 0) {
      done = true;
    }

    if (!done && c !== 0) {
      arr.push(c);
      //arr.length++;
    }
  }

  truncate_utf8(arr, length);
  return decode_utf8(arr);
}

var struct_binpack = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get STRUCT_ENDIAN () { return STRUCT_ENDIAN; },
  setBinaryEndian: setBinaryEndian,
  temp_dataview: temp_dataview,
  uint8_view: uint8_view,
  unpack_context: unpack_context,
  pack_byte: pack_byte,
  pack_sbyte: pack_sbyte,
  pack_bytes: pack_bytes,
  pack_int: pack_int,
  pack_uint: pack_uint,
  pack_ushort: pack_ushort,
  pack_float: pack_float,
  pack_double: pack_double,
  pack_short: pack_short,
  encode_utf8: encode_utf8,
  decode_utf8: decode_utf8,
  test_utf8: test_utf8,
  pack_static_string: pack_static_string,
  pack_string: pack_string,
  unpack_bytes: unpack_bytes,
  unpack_byte: unpack_byte,
  unpack_sbyte: unpack_sbyte,
  unpack_int: unpack_int,
  unpack_uint: unpack_uint,
  unpack_ushort: unpack_ushort,
  unpack_float: unpack_float,
  unpack_double: unpack_double,
  unpack_short: unpack_short,
  unpack_string: unpack_string,
  unpack_static_string: unpack_static_string
});

let warninglvl = 2;
let debug = 0;

let _static_envcode_null = "";
let packer_debug, packer_debug_start, packer_debug_end;
let packdebug_tablevel = 0;

function _get_pack_debug() {
  return {
    packer_debug, packer_debug_start, packer_debug_end,
    debug, warninglvl
  }
}

class cachering extends Array {
  constructor(cb, tot) {
    super();
    this.length = tot;
    this.cur = 0;

    for (let i = 0; i < tot; i++) {
      this[i] = cb();
    }
  }

  static fromConstructor(cls, tot) {
    return new cachering(() => new cls(), tot);
  }

  next() {
    let ret = this[this.cur];

    this.cur = (this.cur + 1)%this.length;

    return ret;
  }
}

function gen_tabstr$1(tot) {
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
    packer_debug = function () {
      let tab = gen_tabstr$1(packdebug_tablevel);

      if (arguments.length > 0) {
        console.warn(tab, ...arguments);
      } else {
        console.warn("Warning: undefined msg");
      }
    };
    packer_debug_start = function (funcname) {
      packer_debug("Start " + funcname);
      packdebug_tablevel++;
    };

    packer_debug_end = function (funcname) {
      packdebug_tablevel--;

      if (funcname) {
        packer_debug("Leave " + funcname);
      }
    };
  } else {
    packer_debug = function () {
    };
    packer_debug_start = function () {
    };
    packer_debug_end = function () {
    };
  }
}

setDebugMode2(debug);

const StructFieldTypes = [];
const StructFieldTypeMap = {};

function packNull(manager, data, field, type) {
  StructFieldTypeMap[type.type].packNull(manager, data, field, type);
}

function toJSON(manager, val, obj, field, type) {
  return StructFieldTypeMap[type.type].toJSON(manager, val, obj, field, type);
}

function fromJSON(manager, val, obj, field, type, instance) {
  return StructFieldTypeMap[type.type].fromJSON(manager, val, obj, field, type, instance);
}

function formatJSON(manager, val, obj, field, type, instance, tlvl = 0) {
  return StructFieldTypeMap[type.type].formatJSON(manager, val, obj, field, type, instance, tlvl);
}

function validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
  return StructFieldTypeMap[type.type].validateJSON(manager, val, obj, field, type, instance, _abstractKey);
}


function unpack_field(manager, data, type, uctx) {
  let name;

  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("R " + name);
  }

  let ret = StructFieldTypeMap[type.type].unpack(manager, data, type, uctx);

  if (debug) {
    packer_debug_end();
  }

  return ret;
}

let fakeFields = new cachering(() => {
  return {type: undefined, get: undefined, set: undefined}
}, 256);

function fmt_type(type) {
  return StructFieldTypeMap[type.type].format(type);
}

function do_pack(manager, data, val, obj, field, type) {
  let name;

  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("W " + name);
  }

  let typeid = type;
  if (typeof typeid !== "number") {
    typeid = typeid.type;
  }

  let ret = StructFieldTypeMap[typeid].pack(manager, data, val, obj, field, type);

  if (debug) {
    packer_debug_end();
  }

  return ret;
}

let _ws_env = [[undefined, undefined]];

class StructFieldType {
  static pack(manager, data, val, obj, field, type) {
  }

  static unpack(manager, data, type, uctx) {
  }

  static packNull(manager, data, field, type) {
    this.pack(manager, data, 0, 0, field, type);
  }

  static format(type) {
    return this.define().name;
  }

  static toJSON(manager, val, obj, field, type) {
    return val;
  }

  static fromJSON(manager, val, obj, field, type, instance) {
    return val;
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    return JSON.stringify(val);
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    return true;
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
    }
  }

  /**
   Register field packer/unpacker class.  Will throw an error if define() method is bad.
   */
  static register(cls) {
    if (StructFieldTypes.indexOf(cls) >= 0) {
      throw new Error("class already registered");
    }

    if (cls.define === StructFieldType.define) {
      throw new Error("you forgot to make a define() static method");
    }

    if (cls.define().type === undefined) {
      throw new Error("cls.define().type was undefined!");
    }

    if (cls.define().type in StructFieldTypeMap) {
      throw new Error("type " + cls.define().type + " is used by another StructFieldType subclass");
    }

    StructFieldTypes.push(cls);
    StructFieldTypeMap[cls.define().type] = cls;
  }
}

class StructIntField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_int(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_int(data, uctx);
  }
3
  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return "" + val + " is not an integer";
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.INT,
      name: "int"
    }
  }
}

StructFieldType.register(StructIntField);

class StructFloatField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_float(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_float(data, uctx);
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    if (typeof val !== "number") {
      return "Not a float: " + val;
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.FLOAT,
      name: "float"
    }
  }
}

StructFieldType.register(StructFloatField);

class StructDoubleField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_double(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_double(data, uctx);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number") {
      return "Not a double: " + val;
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.DOUBLE,
      name: "double"
    }
  }
}

StructFieldType.register(StructDoubleField);

class StructStringField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    val = !val ? "" : val;

    pack_string(data, val);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "string") {
      return "Not a string: " + val;
    }

    return true;
  }

  static packNull(manager, data, field, type) {
    this.pack(manager, data, "", 0, field, type);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_string(data, uctx);
  }

  static define() {
    return {
      type: StructEnum.STRING,
      name: "string"
    }
  }
}

StructFieldType.register(StructStringField);

class StructStaticStringField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    val = !val ? "" : val;

    pack_static_string(data, val, type.data.maxlength);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "string") {
      return "Not a string: " + val;
    }


    if (val.length > type.data.maxlength) {
      return "String is too big; limit is " + type.data.maxlength + "; string:" + val;
    }

    return true;
  }

  static format(type) {
    return `static_string[${type.data.maxlength}]`;
  }

  static packNull(manager, data, field, type) {
    this.pack(manager, data, "", 0, field, type);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_static_string(data, uctx, type.data.maxlength);
  }

  static define() {
    return {
      type: StructEnum.STATIC_STRING,
      name: "static_string"
    }
  }
}

StructFieldType.register(StructStaticStringField);

class StructStructField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    let stt = manager.get_struct(type.data);

    packer_debug("struct", stt.name);

    manager.write_struct(data, val, stt);
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    let stt = manager.get_struct(type.data);

    if (!val) {
      return "Expected " + stt.name + " object";
    }

    return manager.validateJSONIntern(val, stt, _abstractKey);
  }

  static format(type) {
    return type.data;
  }

  static fromJSON(manager, val, obj, field, type, instance) {
    let stt = manager.get_struct(type.data);

    return manager.readJSON(val, stt, instance);
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    let stt = manager.get_struct(type.data);

    return manager.formatJSON_intern(val, stt, field, tlvl);
  }

  static toJSON(manager, val, obj, field, type) {
    let stt = manager.get_struct(type.data);
    return manager.writeJSON(val, stt);
  }

  static unpackInto(manager, data, type, uctx, dest) {
    let cls2 = manager.get_struct_cls(type.data);

    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager.read_object(data, cls2, uctx, dest);
  }

  static packNull(manager, data, field, type) {
    let stt = manager.get_struct(type.data);

    packer_debug("struct", type);

    for (let field2 of stt.fields) {
      let type2 = field2.type;

      packNull(manager, data, field2, type2);
    }
  }

  static unpack(manager, data, type, uctx) {
    let cls2 = manager.get_struct_cls(type.data);
    packer_debug("struct", cls2 ? cls2.name : "(error)");

    return manager.read_object(data, cls2, uctx);
  }

  static define() {
    return {
      type: StructEnum.STRUCT,
      name: "struct"
    }
  }
}

StructFieldType.register(StructStructField);

class StructTStructField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    let cls = manager.get_struct_cls(type.data);
    let stt = manager.get_struct(type.data);

    const keywords = manager.constructor.keywords;

    //make sure inheritance is correct
    if (val.constructor.structName !== type.data && (val instanceof cls)) {
      //if (DEBUG.Struct) {
      //    console.log(val.constructor.structName+" inherits from "+cls.structName);
      //}
      stt = manager.get_struct(val.constructor.structName);
    } else if (val.constructor.structName === type.data) {
      stt = manager.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct " + val.constructor.structName + " passed to write_struct");
    }

    packer_debug("int " + stt.id);

    pack_int(data, stt.id);
    manager.write_struct(data, val, stt);
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    let key = type.jsonKeyword;

    if (typeof val !== "object") {
      return typeof val + " is not an object";
    }

    let stt = manager.get_struct(val[key]);
    let cls = manager.get_struct_cls(stt.name);
    let parentcls = manager.get_struct_cls(type.data);

    let ok = false;

    do {
      if (cls === parentcls) {
        ok = true;
        break;
      }

      cls = cls.prototype.__proto__.constructor;
    } while (cls && cls !== Object);

    if (!ok) {
      return stt.name + " is not a child class off " + type.data;
    }

    return manager.validateJSONIntern(val, stt, type.jsonKeyword);
  }


  static fromJSON(manager, val, obj, field, type, instance) {
    let key = type.jsonKeyword;

    let stt = manager.get_struct(val[key]);

    return manager.readJSON(val, stt, instance);
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    let key = type.jsonKeyword;

    let stt = manager.get_struct(val[key]);

    return manager.formatJSON_intern(val, stt, field, tlvl);
  }

  static toJSON(manager, val, obj, field, type) {
    const keywords = manager.constructor.keywords;

    let stt = manager.get_struct(val.constructor.structName);
    let ret = manager.writeJSON(val, stt);

    ret[type.jsonKeyword] = "" + stt.name;

    return ret;
  }

  static packNull(manager, data, field, type) {
    let stt = manager.get_struct(type.data);

    pack_int(data, stt.id);
    packNull(manager, data, field, {type: StructEnum.STRUCT, data: type.data});
  }

  static format(type) {
    return "abstract(" + type.data + ")";
  }

  static unpackInto(manager, data, type, uctx, dest) {
    let id = unpack_int(data, uctx);

    packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }

    let cls2 = manager.get_struct_id(id);

    packer_debug("struct name: " + cls2.name);

    cls2 = manager.struct_cls[cls2.name];

    return manager.read_object(data, cls2, uctx, dest);
    //packer_debug("ret", ret);
  }

  static unpack(manager, data, type, uctx) {
    let id = unpack_int(data, uctx);

    packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }

    let cls2 = manager.get_struct_id(id);

    packer_debug("struct name: " + cls2.name);
    cls2 = manager.struct_cls[cls2.name];

    return manager.read_object(data, cls2, uctx);
    //packer_debug("ret", ret);
  }

  static define() {
    return {
      type: StructEnum.TSTRUCT,
      name: "tstruct"
    }
  }
}

StructFieldType.register(StructTStructField);

/** out is just a [string], an array of dimen 1 whose sole entry is the output string. */
function formatArrayJson(manager, val, obj, field, type, type2, instance, tlvl, array = val) {
  if (array === undefined || array === null || typeof array !== "object" || !array[Symbol.iterator]) {
    console.log(obj);
    console.log(array);
    throw new Error(`Expected an array for ${field.name}`);
  }

  if (ValueTypes.has(type2.type)) {
    return JSON.stringify(array);
  }

  let s = '[';
  if (manager.formatCtx.addComments && field.comment.trim()) {
    s += " " + field.comment.trim();
  }

  s += "\n";

  for (let i = 0; i < array.length; i++) {
    let item = array[i];

    s += tab(tlvl + 1) + formatJSON(manager, item, val, field, type2, instance, tlvl + 1) + ",\n";
  }

  s += tab(tlvl) + "]";

  return s;
}

class StructArrayField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    if (val === undefined) {
      console.trace();
      console.log("Undefined array fed to struct struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      pack_int(data, 0);
      return;
    }

    packer_debug("int " + val.length);
    pack_int(data, val.length);

    let d = type.data;

    let itername = d.iname;
    let type2 = d.type;

    let env = _ws_env;
    for (let i = 0; i < val.length; i++) {
      let val2 = val[i];
      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      //XXX not sure I really need this fakeField stub here. . .
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager, data, val2, obj, fakeField, type2);
    }
  }

  static packNull(manager, data, field, type) {
    pack_int(data, 0);
  }

  static format(type) {
    if (type.data.iname !== "" && type.data.iname !== undefined) {
      return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    } else {
      return "array(" + fmt_type(type.data.type) + ")";
    }
  }

  static useHelperJS(field) {
    return !field.type.data.iname;
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    if (!val) {
      return "not an array: " + val;
    }

    for (let i = 0; i < val.length; i++) {
      let ret = validateJSON(manager, val[i], val, field, type.data.type, undefined, _abstractKey);

      if (typeof ret === "string" || !ret) {
        return ret;
      }
    }

    return true;
  }

  static fromJSON(manager, val, obj, field, type, instance) {
    let ret = instance || [];

    ret.length = 0;

    for (let i = 0; i < val.length; i++) {
      let val2 = fromJSON(manager, val[i], val, field, type.data.type, undefined);

      if (val2 === undefined) {
        console.log(val2);
        console.error("eeek");
        process.exit();
      }

      ret.push(val2);
    }

    return ret;
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    //export function formatArrayJson(manager, val, obj, field, type, type2, instance, tlvl, array=val) {

    return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl);
  }

  static toJSON(manager, val, obj, field, type) {
    val = val || [];
    let json = [];

    let itername = type.data.iname;

    for (let i = 0; i < val.length; i++) {
      let val2 = val[i];
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);

        //console.log("VAL2", val2, toJSON(manager, val2, val, field, type.data.type));
      }

      json.push(toJSON(manager, val2, val, field, type.data.type));
    }

    return json;
  }

  static unpackInto(manager, data, type, uctx, dest) {
    let len = unpack_int(data, uctx);
    dest.length = 0;

    for (let i = 0; i < len; i++) {
      dest.push(unpack_field(manager, data, type.data.type, uctx));
    }
  }

  static unpack(manager, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }

  static define() {
    return {
      type: StructEnum.ARRAY,
      name: "array"
    }
  }
}

StructFieldType.register(StructArrayField);

class StructIterField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    //this was originally implemented to use ES6 iterators.
    function forEach(cb, thisvar) {
      if (val && val[Symbol.iterator]) {
        for (let item of val) {
          cb.call(thisvar, item);
        }
      } else if (val && val.forEach) {
        val.forEach(function (item) {
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

    /* save space for length */
    let starti = data.length;
    data.length += 4;

    let d = type.data, itername = d.iname, type2 = d.type;
    let env = _ws_env;

    let i = 0;
    forEach(function (val2) {
      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      //XXX not sure I really need this fakeField stub here. . .
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager, data, val2, obj, fakeField, type2);

      i++;
    }, this);

    /* write length */
    temp_dataview.setInt32(0, i, STRUCT_ENDIAN);

    data[starti++] = uint8_view[0];
    data[starti++] = uint8_view[1];
    data[starti++] = uint8_view[2];
    data[starti++] = uint8_view[3];
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl, list(val));
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    return StructArrayField.validateJSON(...arguments);
  }

  static fromJSON() {
    return StructArrayField.fromJSON(...arguments);
  }

  static toJSON(manager, val, obj, field, type) {
    val = val || [];
    let json = [];

    let itername = type.data.iname;

    for (let val2 of val) {
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);

        //console.log("VAL2", val2, toJSON(manager, val2, val, field, type.data.type));
      }

      json.push(toJSON(manager, val2, val, field, type.data.type));
    }

    return json;
  }

  static packNull(manager, data, field, type) {
    pack_int(data, 0);
  }

  static useHelperJS(field) {
    return !field.type.data.iname;
  }

  static format(type) {
    if (type.data.iname !== "" && type.data.iname !== undefined) {
      return "iter(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    } else {
      return "iter(" + fmt_type(type.data.type) + ")";
    }
  }

  static unpackInto(manager, data, type, uctx, arr) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return arr;
  }

  static unpack(manager, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }

  static define() {
    return {
      type: StructEnum.ITER,
      name: "iter"
    }
  }
}

StructFieldType.register(StructIterField);

class StructShortField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_short(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_short(data, uctx);
  }

  static define() {
    return {
      type: StructEnum.SHORT,
      name: "short"
    }
  }
}

StructFieldType.register(StructShortField);

class StructByteField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_byte(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_byte(data, uctx);
  }

  static define() {
    return {
      type: StructEnum.BYTE,
      name: "byte"
    }
  }
}

StructFieldType.register(StructByteField);

class StructSignedByteField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_sbyte(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_sbyte(data, uctx);
  }

  static define() {
    return {
      type: StructEnum.SIGNED_BYTE,
      name: "sbyte"
    }
  }
}

StructFieldType.register(StructSignedByteField);

class StructBoolField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_byte(data, !!val);
  }

  static unpack(manager, data, type, uctx) {
    return !!unpack_byte(data, uctx);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (val === 0 || val === 1 || val === true || val === false || val === "true" || val === "false") {
      return true;
    }

    return "" + val + " is not a bool";
  }

  static fromJSON(manager, val, obj, field, type, instance) {
    if (val === "false") {
      val = false;
    }

    return !!val;
  }

  static toJSON(manager, val, obj, field, type) {
    return !!val;
  }

  static define() {
    return {
      type: StructEnum.BOOL,
      name: "bool"
    }
  }
}

StructFieldType.register(StructBoolField);

class StructIterKeysField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    //this was originally implemented to use ES6 iterators.
    if ((typeof val !== "object" && typeof val !== "function") || val === null) {
      console.warn("Bad object fed to iterkeys in struct packer!", val);
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");

      pack_int(data, 0);
      return;
    }

    let len = 0.0;
    for (let k in val) {
      len++;
    }

    packer_debug("int " + len);
    pack_int(data, len);

    let d = type.data, itername = d.iname, type2 = d.type;
    let env = _ws_env;

    let i = 0;
    for (let val2 in val) {
      if (i >= len) {
        if (warninglvl > 0) {
          console.warn("Warning: object keys magically replaced during iteration", val, i);
        }
        return;
      }

      if (itername && itername.trim().length > 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      } else {
        val2 = val[val2]; //fetch value
      }

      let f2 = {type: type2, get: undefined, set: undefined};
      do_pack(manager, data, val2, obj, f2, type2);

      i++;
    }
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    return StructArrayField.validateJSON(...arguments);
  }

  static fromJSON() {
    return StructArrayField.fromJSON(...arguments);
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl, list(val));
  }

  static toJSON(manager, val, obj, field, type) {
    val = val || [];
    let json = [];

    let itername = type.data.iname;

    for (let k in val) {
      let val2 = val[k];
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);

        //console.log("VAL2", val2, toJSON(manager, val2, val, field, type.data.type));
      }

      json.push(toJSON(manager, val2, val, field, type.data.type));
    }

    return json;
  }

  static packNull(manager, data, field, type) {
    pack_int(data, 0);
  }

  static useHelperJS(field) {
    return !field.type.data.iname;
  }

  static format(type) {
    if (type.data.iname !== "" && type.data.iname !== undefined) {
      return "iterkeys(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    } else {
      return "iterkeys(" + fmt_type(type.data.type) + ")";
    }
  }

  static unpackInto(manager, data, type, uctx, arr) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return arr;
  }

  static unpack(manager, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }

  static define() {
    return {
      type: StructEnum.ITERKEYS,
      name: "iterkeys"
    }
  }
}

StructFieldType.register(StructIterKeysField);

class StructUintField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_uint(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_uint(data, uctx);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return "" + val + " is not an integer";
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.UINT,
      name: "uint"
    }
  }
}

StructFieldType.register(StructUintField);


class StructUshortField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_ushort(data, val);
  }

  static unpack(manager, data, type, uctx) {
    return unpack_ushort(data, uctx);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return "" + val + " is not an integer";
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.USHORT,
      name: "ushort"
    }
  }
}

StructFieldType.register(StructUshortField);

//let writeEmpty = writeEmpty = function writeEmpty(stt) {
//}

class StructStaticArrayField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    if (type.data.size === undefined) {
      throw new Error("type.data.size was undefined");
    }

    let itername = type.data.iname;

    if (val === undefined || !val.length) {
      this.packNull(manager, data, field, type);
      return;
    }

    for (let i = 0; i < type.data.size; i++) {
      let i2 = Math.min(i, Math.min(val.length - 1, type.data.size));
      let val2 = val[i2];

      //*
      if (itername !== "" && itername !== undefined && field.get) {
        let env = _ws_env;
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      do_pack(manager, data, val2, val, field, type.data.type);
    }
  }

  static useHelperJS(field) {
    return !field.type.data.iname;
  }

  static validateJSON() {
    return StructArrayField.validateJSON(...arguments);
  }

  static fromJSON() {
    return StructArrayField.fromJSON(...arguments);
  }

  static formatJSON(manager, val, obj, field, type, instance, tlvl) {
    return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl, list(val));
  }

  static packNull(manager, data, field, type) {
    let size = type.data.size;
    for (let i = 0; i < size; i++) {
      packNull(manager, data, field, type.data.type);
    }
  }

  static toJSON(manager, val, obj, field, type) {
    return StructArrayField.toJSON(...arguments);
  }

  static format(type) {
    let type2 = StructFieldTypeMap[type.data.type.type].format(type.data.type);

    let ret = `static_array[${type2}, ${type.data.size}`;

    if (type.data.iname) {
      ret += `, ${type.data.iname}`;
    }
    ret += `]`;

    return ret;
  }

  static unpackInto(manager, data, type, uctx, ret) {
    packer_debug("-size: " + type.data.size);

    ret.length = 0;

    for (let i = 0; i < type.data.size; i++) {
      ret.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return ret;
  }

  static unpack(manager, data, type, uctx) {
    packer_debug("-size: " + type.data.size);

    let ret = [];

    for (let i = 0; i < type.data.size; i++) {
      ret.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return ret;
  }

  static define() {
    return {
      type: StructEnum.STATIC_ARRAY,
      name: "static_array"
    }
  }
}

StructFieldType.register(StructStaticArrayField);

var _sintern2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  _get_pack_debug: _get_pack_debug,
  setWarningMode2: setWarningMode2,
  setDebugMode2: setDebugMode2,
  StructFieldTypes: StructFieldTypes,
  StructFieldTypeMap: StructFieldTypeMap,
  packNull: packNull,
  toJSON: toJSON,
  fromJSON: fromJSON,
  formatJSON: formatJSON,
  validateJSON: validateJSON,
  do_pack: do_pack,
  StructFieldType: StructFieldType,
  formatArrayJson: formatArrayJson
});

var structEval = eval;

function setStructEval(val) {
  structEval = val;
}

var _struct_eval = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get structEval () { return structEval; },
  setStructEval: setStructEval
});

const TokSymbol = Symbol("token-info");

function buildJSONParser() {
  let tk = (name, re, func, example) => new tokdef(name, re, func, example);

  let parse;

  let nint = "[+-]?[0-9]+";
  let nhex = "[+-]?0x[0-9a-fA-F]+";
  let nfloat1 = "[+-]?[0-9]+\\.[0-9]*";
  let nfloat2 = "[+-]?[0-9]*\\.[0-9]+";
  let nfloat3 = "[+-]?[0-9]+\\.[0-9]+";
  let nfloatexp = "[+-]?[0-9]+\\.[0-9]+[eE][+-]?[0-9]+";

  let nfloat = `(${nfloat1})|(${nfloat2})|(${nfloatexp})`;
  let num = `(${nint})|(${nfloat})|(${nhex})`;
  let numre = new RegExp(num);

  let numreTest = new RegExp(`(${num})$`);

  //nfloat3 has to be its own regexp, the parser
  //always chooses the token handler that parses the most input,
  //and we don't want the partial 0. and .0 handles to split
  //e.g. 3.5 into 3 and 0.5
  nfloat3 = new RegExp(nfloat3);
  nfloatexp = new RegExp(nfloatexp);

  let tests = ["1.234234", ".23432", "-234.", "1e-17", "-0x23423ff", "+23423", "-4.263256414560601e-14"];
  for (let test of tests) {
    if (!numreTest.test(test)) {
      console.error("Error! Number regexp failed:", test);
    }
  }

  let tokens = [
    tk("BOOL", /true|false/),
    tk("WS", /[ \r\t\n]/, t => undefined), //drop token
    tk("STRLIT", /["']/, t => {
      let lex = t.lexer;
      let char = t.value;
      let i = lex.lexpos;
      let lexdata = lex.lexdata;

      let escape = 0;
      t.value = "";
      let prev;

      while (i < lexdata.length) {
        let c = lexdata[i];

        t.value += c;

        if (c === "\\") {
          escape ^= true;
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
    tk("NUM", numre, t => (t.value = parseFloat(t.value), t)),
    tk("NUM", nfloat3, t => (t.value = parseFloat(t.value), t)),
    tk("NUM", nfloatexp, t => (t.value = parseFloat(t.value), t)),
  ];

  function tokinfo(t) {
    return {
      lexpos: t.lexpos,
      lineno: t.lineno,
      col   : t.col,
      fields: {},
    };
  }

  function p_Array(p) {
    p.expect("LSBRACKET");
    let t = p.peeknext();
    let first = true;

    let ret = [];

    ret[TokSymbol] = tokinfo(t);

    while (t && t.type !== "RSBRACKET") {
      if (!first) {
        p.expect("COMMA");
      }

      ret[TokSymbol].fields[ret.length] = tokinfo(t);
      ret.push(p_Start(p));

      first = false;
      t = p.peeknext();
    }
    p.expect("RSBRACKET");

    return ret;
  }

  function p_Object(p) {
    p.expect("LBRACE");

    let obj = {};

    let first = true;
    let t = p.peeknext();

    obj[TokSymbol] = tokinfo(t);
    while (t && t.type !== "RBRACE") {
      if (!first) {
        p.expect("COMMA");
      }

      let key = p.expect("STRLIT");
      p.expect("COLON");

      let val = p_Start(p, true);

      obj[key] = val;
      first = false;

      t = p.peeknext();
      obj[TokSymbol].fields[key] = tokinfo(t);
    }

    p.expect("RBRACE");

    return obj;
  }

  function p_Start(p, throwError = true) {
    let t = p.peeknext();
    if (t.type === "LSBRACKET") {
      return p_Array(p);
    } else if (t.type === "LBRACE") {
      return p_Object(p);
    } else if (t.type === "STRLIT" || t.type === "NUM" || t.type === "NULL" || t.type === "BOOL") {
      return p.next().value;
    } else {
      p.error(t, "Unknown token");
    }
  }

  function p_Error(token, msg) {
    throw new PUTIL_ParseError("Parse Error");
  }

  let lex = new lexer(tokens);
  lex.linestart = 0;
  parse = new parser(lex, p_Error);
  parse.start = p_Start;
  //lex.printTokens = true;

  return parse;
}

var jsonParser = buildJSONParser();

/*
buildJSONParser().parse(`
{
                "alteredX": -110.95731659202336,
                "alteredY": -359.9154922611667,
                "alteredZ": -4.263256414560601e-14
}
`.trim()) //*/

function printContext(buf, tokinfo, printColors=true) {
  let lines = buf.split("\n");

  if (!tokinfo) {
    return '';
  }

  let lineno = tokinfo.lineno;
  let col = tokinfo.col;

  let istart = Math.max(lineno-50, 0);
  let iend = Math.min(lineno+2, lines.length-1);

  let s = '';

  if (printColors) {
    s += termColor("  /* pretty-printed json */\n", "blue");
  } else {
    s += "/* pretty-printed json */\n";
  }

  for (let i=istart; i<iend; i++) {
    let l = lines[i];

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
      let l2 = '';
      for (let j=0; j<col+5; j++) {
        l2 += " ";
      }

      s += l2 + "^\n";
    }
  }

  return s;
}

var nGlobal;

if (typeof globalThis !== "undefined") {
  nGlobal = globalThis;
} else if (typeof window !== "undefined") {
  nGlobal = window;
} else if (typeof global !== "undefined") {
  nGlobal = global;
} else if (typeof globals !== "undefined") {
  nGlobal = globals;
} else if (typeof self !== "undefined") {
  nGlobal = self;
}

const DEBUG = {};

function updateDEBUG() {
  for (let k in Object.keys(DEBUG)) {
    delete DEBUG[k];
  }

  if (typeof nGlobal.DEBUG === "object") {
    for (let k in nGlobal.DEBUG) {
      DEBUG[k] = nGlobal.DEBUG[k];
    }
  }
}

"use strict";

//needed to avoid a rollup bug in configurable mode
var sintern2 = _sintern2;
var struct_eval = _struct_eval;

let warninglvl$1 = 2;

var truncateDollarSign = true;
var manager;

class JSONError extends Error {};

function printCodeLines(code) {
  let lines = code.split(String.fromCharCode(10));
  let buf = '';

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

  /* Node suppresses the real error line number in error.stack for some reason.
   * Get it by retriggering the error for real.
   */
  eval(code);
}

function setTruncateDollarSign(v) {
  truncateDollarSign = !!v;
}

function _truncateDollarSign(s) {
  let i = s.search("$");

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

let _static_envcode_null$1 = "";

//truncate webpack-mangled names

function gen_tabstr$2(tot) {
  let ret = "";

  for (let i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

let packer_debug$1, packer_debug_start$1, packer_debug_end$1;

function update_debug_data() {
  let ret = _get_pack_debug();

  packer_debug$1 = ret.packer_debug;
  packer_debug_start$1 = ret.packer_debug_start;
  packer_debug_end$1 = ret.packer_debug_end;
  warninglvl$1 = ret.warninglvl;
}

update_debug_data();

function setWarningMode(t) {
  sintern2.setWarningMode2(t);

  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl$1 = t;
}

function setDebugMode(t) {
  sintern2.setDebugMode2(t);
  update_debug_data();
}

let _ws_env$1 = [[undefined, undefined]];

function define_empty_class(scls, name) {
  let cls = function () {
  };

  cls.prototype = Object.create(Object.prototype);
  cls.constructor = cls.prototype.constructor = cls;

  let keywords = scls.keywords;

  cls.STRUCT = name + " {\n  }\n";
  cls.structName = name;

  cls.prototype.loadSTRUCT = function (reader) {
    reader(this);
  };

  cls.newSTRUCT = function () {
    return new this();
  };

  return cls;
}

let haveCodeGen;

//$KEYWORD_CONFIG_START

class STRUCT {
  constructor() {
    this.idgen = 0;
    this.allowOverriding = true;

    this.structs = {};
    this.struct_cls = {};
    this.struct_ids = {};

    this.compiled_code = {};
    this.null_natives = {};

    this.define_null_native("Object", Object);

    this.jsonUseColors = true;
    this.jsonBuf = '';
    this.formatCtx = {};
  }

  static inherit(child, parent, structName = child.name) {
    const keywords = this.keywords;

    if (!parent.STRUCT) {
      return structName + "{\n";
    }

    let stt = struct_parse.parse(parent.STRUCT);
    let code = structName + "{\n";
    code += STRUCT.fmt_struct(stt, true, false, true);
    return code;
  }

  /** invoke loadSTRUCT methods on parent objects.  note that
   reader() is only called once.  it is called however.*/
  static Super(obj, reader) {
    if (warninglvl$1 > 0) {
      console.warn("deprecated");
    }

    reader(obj);

    function reader2(obj) {
    }

    let cls = obj.constructor;
    let bad = cls === undefined || cls.prototype === undefined || cls.prototype.__proto__ === undefined;

    if (bad) {
      return;
    }

    let parent = cls.prototype.__proto__.constructor;
    bad = bad || parent === undefined;

    if (!bad && parent.prototype.loadSTRUCT && parent.prototype.loadSTRUCT !== obj.loadSTRUCT) { //parent.prototype.hasOwnProperty("loadSTRUCT")) {
      parent.prototype.loadSTRUCT.call(obj, reader2);
    }
  }

  /** deprecated.  used with old fromSTRUCT interface. */
  static chain_fromSTRUCT(cls, reader) {
    if (warninglvl$1 > 0) {
      console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");
    }

    let proto = cls.prototype;
    let parent = cls.prototype.prototype.constructor;

    let obj = parent.fromSTRUCT(reader);
    let obj2 = new cls();

    let keys = Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
    //let keys=Object.keys(proto);

    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];

      try {
        obj2[k] = obj[k];
      } catch (error) {
        if (warninglvl$1 > 0) {
          console.warn("  failed to set property", k);
        }
      }
      //let k=keys[i];
      //if (k=="__proto__")
      // continue;
      //obj[k] = proto[k];
    }

    /*
    if (proto.toString !== Object.prototype.toString)
      obj2.toString = proto.toString;
    //*/

    return obj2;
  }

  //defined_classes is an array of class constructors
  //with STRUCT scripts, *OR* another STRUCT instance
  //

  static formatStruct(stt, internal_only, no_helper_js) {
    return this.fmt_struct(stt, internal_only, no_helper_js);
  }

  static fmt_struct(stt, internal_only, no_helper_js, addComments) {
    if (internal_only === undefined)
      internal_only = false;
    if (no_helper_js === undefined)
      no_helper_js = false;

    let s = "";
    if (!internal_only) {
      s += stt.name;
      if (stt.id !== -1)
        s += " id=" + stt.id;
      s += " {\n";
    }
    let tab = "  ";

    function fmt_type(type) {
      return StructFieldTypeMap[type.type].format(type);

      if (type.type === StructEnum.ARRAY || type.type === StructEnum.ITER || type.type === StructEnum.ITERKEYS) {
        if (type.data.iname !== "" && type.data.iname !== undefined) {
          return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
        } else {
          return "array(" + fmt_type(type.data.type) + ")";
        }
      } else if (type.type === StructEnum.STATIC_STRING) {
        return "static_string[" + type.data.maxlength + "]";
      } else if (type.type === StructEnum.STRUCT) {
        return type.data;
      } else if (type.type === StructEnum.TSTRUCT) {
        return "abstract(" + type.data + ")";
      } else {
        return StructTypeMap[type.type];
      }
    }

    let fields = stt.fields;
    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      s += tab + f.name + " : " + fmt_type(f.type);
      if (!no_helper_js && f.get !== undefined) {
        s += " | " + f.get.trim();
      }
      s += ";";

      if (addComments && f.comment.trim()) {
        s += f.comment.trim();
      }

      s += "\n";
    }
    if (!internal_only)
      s += "}";
    return s;
  }

  static setClassKeyword(keyword, nameKeyword = undefined) {
    if (!nameKeyword) {
      nameKeyword = keyword.toLowerCase() + "Name";
    }

    this.keywords = {
      script: keyword,
      name  : nameKeyword,
      load  : "load" + keyword,
      new   : "new" + keyword,
      after : "after" + keyword,
      from  : "from" + keyword
    };
  }

  define_null_native(name, cls) {
    const keywords = this.constructor.keywords;
    let obj = define_empty_class(this.constructor, name);

    let stt = struct_parse.parse(obj.STRUCT);

    stt.id = this.idgen++;

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
      let ret = {};

      ret.type = type.type;

      if (typeof ret.type === "number") {
        for (let k in StructEnum) {
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
      let buf = STRUCT.formatStruct(stt);

      console.error(buf + "\n\n" + msg);

      if (onerror) {
        onerror(msg, stt, field);
      } else {
        throw new Error(msg);
      }
    }

    for (let k in this.structs) {
      let stt = this.structs[k];

      for (let field of stt.fields) {
        if (field.name === "this") {
          let type = field.type.type;

          if (ValueTypes.has(type)) {
            throwError(stt, field, "'this' cannot be used with value types");
          }
        }

        let type = getType(field.type);

        if (type.type !== StructEnum.STRUCT && type.type !== StructEnum.TSTRUCT) {
          continue;
        }

        if (!(type.data in this.structs)) {
          let msg = stt.name + ":" + field.name + ": Unknown struct " + type.data + ".";
          throwError(stt, field, msg);
        }
      }
    }
  }

  forEach(func, thisvar) {
    for (let k in this.structs) {
      let stt = this.structs[k];

      if (thisvar !== undefined)
        func.call(thisvar, stt);
      else
        func(stt);
    }
  }

  //defaults to structjs.manager
  parse_structs(buf, defined_classes) {
    const keywords = this.constructor.keywords;

    if (defined_classes === undefined) {
      defined_classes = manager;
    }

    if (defined_classes instanceof STRUCT) {
      let struct2 = defined_classes;
      defined_classes = [];

      for (let k in struct2.struct_cls) {
        defined_classes.push(struct2.struct_cls[k]);
      }
    }

    if (defined_classes === undefined) {
      defined_classes = [];

      for (let k in manager.struct_cls) {
        defined_classes.push(manager.struct_cls[k]);
      }
    }

    let clsmap = {};

    for (let i = 0; i < defined_classes.length; i++) {
      let cls = defined_classes[i];

      if (!cls.structName && cls.STRUCT) {
        let stt = struct_parse.parse(cls.STRUCT.trim());
        cls.structName = stt.name;
      } else if (!cls.structName && cls.name !== "Object") {
        if (warninglvl$1 > 0)
          console.log("Warning, bad class in registered class list", unmangle(cls.name), cls);
        continue;
      }

      clsmap[cls.structName] = defined_classes[i];
    }

    struct_parse.input(buf);

    while (!struct_parse.at_end()) {
      let stt = struct_parse.parse(undefined, false);

      if (!(stt.name in clsmap)) {
        if (!(stt.name in this.null_natives))
          if (warninglvl$1 > 0)
            console.log("WARNING: struct " + stt.name + " is missing from class list.");

        let dummy = define_empty_class(this.constructor, stt.name);

        dummy.STRUCT = STRUCT.fmt_struct(stt);
        dummy.structName = stt.name;

        dummy.prototype.structName = dummy.name;

        this.struct_cls[dummy.structName] = dummy;
        this.structs[dummy.structName] = stt;

        if (stt.id !== -1)
          this.struct_ids[stt.id] = stt;
      } else {
        this.struct_cls[stt.name] = clsmap[stt.name];
        this.structs[stt.name] = stt;

        if (stt.id !== -1)
          this.struct_ids[stt.id] = stt;
      }

      let tok = struct_parse.peek();
      while (tok && (tok.value === "\n" || tok.value === "\r" || tok.value === "\t" || tok.value === " ")) {
        tok = struct_parse.peek();
      }
    }
  }

  /** adds all structs referenced by cls inside of srcSTRUCT
   *  to this */
  registerGraph(srcSTRUCT, cls) {
    if (!cls.structName) {
      console.warn("class was not in srcSTRUCT");
      return this.register(cls);
    }

    let recStruct;

    let recArray = (t) => {
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
          let st = srcSTRUCT.structs[t.data];
          let cls = srcSTRUCT.struct_cls[st.name];

          return recStruct(st, cls);
        }
      }
    };

    recStruct = (st, cls) => {
      if (!(cls.structName in this.structs)) {
        this.add_class(cls, cls.structName);
      }

      for (let f of st.fields) {
        if (f.type.type === StructEnum.STRUCT || f.type.type === StructEnum.TSTRUCT) {
          let st2 = srcSTRUCT.structs[f.type.data];
          let cls2 = srcSTRUCT.struct_cls[st2.name];

          recStruct(st2, cls2);
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

    let st = srcSTRUCT.structs[cls.structName];
    recStruct(st, cls);
  }

  register(cls, structName) {
    return this.add_class(cls, structName);
  }

  unregister(cls) {
    const keywords = this.constructor.keywords;

    if (!cls || !cls.structName || !(cls.structName in this.struct_cls)) {
      console.warn("Class not registered with nstructjs", cls);
      return;
    }


    let st = this.structs[cls.structName];

    delete this.structs[cls.structName];
    delete this.struct_cls[cls.structName];
    delete this.struct_ids[st.id];
  }

  add_class(cls, structName) {
    //do not register Object
    if (cls === Object) {
      return;
    }

    const keywords = this.constructor.keywords;
    if (cls.STRUCT) {
      let bad = false;

      let p = cls;
      while (p) {
        p = p.__proto__;

        if (p && p.STRUCT && p.STRUCT === cls.STRUCT) {
          bad = true;
          break;
        }
      }

      if (bad) {
        if (warninglvl$1 > 0) {
          console.warn("Generating " + keywords.script + " script for derived class " + unmangle(cls.name));
        }

        if (!structName) {
          structName = unmangle(cls.name);
        }

        cls.STRUCT = STRUCT.inherit(cls, p) + "\n}";
      }
    }

    if (!cls.STRUCT) {
      throw new Error("class " + unmangle(cls.name) + " has no " + keywords.script + " script");
    }

    let stt = struct_parse.parse(cls.STRUCT);

    stt.name = unmangle(stt.name);

    cls.structName = stt.name;

    //create default newSTRUCT
    if (cls.newSTRUCT === undefined) {
      cls.newSTRUCT = function () {
        return new this();
      };
    }

    if (structName !== undefined) {
      stt.name = cls.structName = structName;
    } else if (cls.structName === undefined) {
      cls.structName = stt.name;
    } else {
      stt.name = cls.structName;
    }

    if (cls.structName in this.structs) {
      if (warninglvl$1 > 0) {
        console.warn("Struct " + unmangle(cls.structName) + " is already registered", cls);
      }

      if (!this.allowOverriding) {
        throw new Error("Struct " + unmangle(cls.structName) + " is already registered");
      }

      return;
    }

    if (stt.id === -1)
      stt.id = this.idgen++;

    this.structs[cls.structName] = stt;
    this.struct_cls[cls.structName] = cls;
    this.struct_ids[stt.id] = stt;
  }

  isRegistered(cls) {
    const keywords = this.constructor.keywords;

    if (!cls.hasOwnProperty("structName")) {
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
    if (!(name in this.struct_cls)) {
      console.trace();
      throw new Error("Unknown struct " + name);
    }
    return this.struct_cls[name];
  }

  _env_call(code, obj, env) {
    let envcode = _static_envcode_null$1;
    if (env !== undefined) {
      envcode = "";
      for (let i = 0; i < env.length; i++) {
        envcode = "let " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
      }
    }
    let fullcode = "";
    if (envcode !== _static_envcode_null$1)
      fullcode = envcode + code;
    else
      fullcode = code;
    let func;

    //fullcode = fullcode.replace(/\bthis\b/, "obj");

    if (!(fullcode in this.compiled_code)) {
      let code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      try {
        func = struct_eval.structEval(code2);
      } catch (err) {
        console.warn(err.stack);

        console.warn(code2);
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

      let code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      console.warn(code2);
      console.warn(" ");
      throw err;
    }
  }

  write_struct(data, obj, stt) {
    function use_helper_js(field) {
      let type = field.type.type;
      let cls = StructFieldTypeMap[type];
      return cls.useHelperJS(field);
    }

    let fields = stt.fields;
    let thestruct = this;
    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let t1 = f.type;
      let t2 = t1.type;

      if (use_helper_js(f)) {
        let val;
        let type = t2;
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }

        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        sintern2.do_pack(this, data, val, obj, f, t1);
      } else {
        let val = f.name === "this" ? obj : obj[f.name];
        sintern2.do_pack(this, data, val, obj, f, t1);
      }
    }
  }

  /**
   @param data : array to write data into,
   @param obj  : structable object
   */
  write_object(data, obj) {
    const keywords = this.constructor.keywords;

    let cls = obj.constructor.structName;
    let stt = this.get_struct(cls);

    if (data === undefined) {
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
   @return {cls_or_struct_id} Instance of cls_or_struct_id
   */
  readObject(data, cls_or_struct_id, uctx) {
    if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      data = new DataView(data.buffer);
    } else if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }

    return this.read_object(data, cls_or_struct_id, uctx);
  }

  /**
   @param data array to write data into,
   @param obj structable object
   */
  writeObject(data, obj) {
    return this.write_object(data, obj);
  }

  writeJSON(obj, stt = undefined) {
    const keywords = this.constructor.keywords;

    let cls = obj.constructor;
    stt = stt || this.get_struct(cls.structName);

    function use_helper_js(field) {
      let type = field.type.type;
      let cls = StructFieldTypeMap[type];
      return cls.useHelperJS(field);
    }

    let toJSON = sintern2.toJSON;

    let fields = stt.fields;
    let thestruct = this;
    let json = {};

    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let val;
      let t1 = f.type;

      let json2;

      if (use_helper_js(f)) {
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }

        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        json2 = toJSON(this, val, obj, f, t1);
      } else {
        val = f.name === "this" ? obj : obj[f.name];
        json2 = toJSON(this, val, obj, f, t1);
      }

      if (f.name !== 'this') {
        json[f.name] = json2;
      } else { //f.name was 'this'?
        let isArray = Array.isArray(json2);
        isArray = isArray || f.type.type === StructTypes.ARRAY;
        isArray = isArray || f.type.type === StructTypes.STATIC_ARRAY;

        if (isArray) {
          json.length = json2.length;

          for (let i = 0; i < json2.length; i++) {
            json[i] = json2[i];
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
  read_object(data, cls_or_struct_id, uctx, objInstance) {
    const keywords = this.constructor.keywords;
    let cls, stt;

    if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls.structName];

    if (uctx === undefined) {
      uctx = new unpack_context();

      packer_debug$1("\n\n=Begin reading " + cls.structName + "=");
    }
    let thestruct = this;

    let this2 = this;

    function unpack_field(type) {
      return StructFieldTypeMap[type.type].unpack(this2, data, type, uctx);
    }

    function unpack_into(type, dest) {
      return StructFieldTypeMap[type.type].unpackInto(this2, data, type, uctx, dest);
    }

    let was_run = false;

    function makeLoader(stt) {
      return function load(obj) {
        if (was_run) {
          return;
        }

        was_run = true;

        let fields = stt.fields;
        let flen = fields.length;

        for (let i = 0; i < flen; i++) {
          let f = fields[i];

          if (f.name === 'this') {
            //load data into obj directly
            unpack_into(f.type, obj);
          } else {
            obj[f.name] = unpack_field(f.type);
          }
        }
      }
    }

    let load = makeLoader(stt);

    if (cls.prototype.loadSTRUCT !== undefined) {
      let obj = objInstance;

      if (!obj && cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT(load);
      } else if (!obj) {
        obj = new cls();
      }

      obj.loadSTRUCT(load);

      if (!was_run) {
        console.warn("" + cls.structName + ".prototype.loadSTRUCT() did not execute its loader callback!");
        load(obj);
      }

      return obj;
    } else if (cls.fromSTRUCT !== undefined) {
      if (warninglvl$1 > 1) {
        console.warn("Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
      }

      return cls.fromSTRUCT(load);
    } else { //default case, make new instance and then call load() on it
      let obj = objInstance;

      if (!obj && cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT(load);
      } else if (!obj) {
        obj = new cls();
      }

      load(obj);

      return obj;
    }
  }

  validateJSON(json, cls_or_struct_id, useInternalParser = true, useColors = true, consoleLogger = function () {
    console.log(...arguments);
  }, _abstractKey                                        = "_structName") {
    if (cls_or_struct_id === undefined) {
      throw new Error(this.constructor.name + ".prototype.validateJSON: Expected at least two arguments");
    }

    try {
      json = JSON.stringify(json, undefined, 2);

      this.jsonBuf = json;
      this.jsonUseColors = useColors;
      this.jsonLogger = consoleLogger;

      //add token annotations
      jsonParser.logger = this.jsonLogger;

      if (useInternalParser) {
        json = jsonParser.parse(json);
      } else {
        json = JSON.parse(json);
      }

      this.validateJSONIntern(json, cls_or_struct_id, _abstractKey);

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

    let cls, stt;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls.structName];

    if (stt === undefined) {
      throw new Error("unknown class " + cls);
    }

    let fields = stt.fields;
    let flen = fields.length;

    let keys = new Set();
    keys.add(_abstractKey);

    let keyTestJson = json;

    for (let i = 0; i < flen; i++) {
      let f = fields[i];

      let val;

      let tokinfo;

      if (f.name === 'this') {
        val = json;
        keyTestJson = {
          "this": json
        };

        keys.add("this");
        tokinfo = json[TokSymbol];
      } else {
        val = json[f.name];
        keys.add(f.name);

        tokinfo = json[TokSymbol] ? json[TokSymbol].fields[f.name] : undefined;
        if (!tokinfo) {
          let f2 = fields[Math.max(i - 1, 0)];
          tokinfo = TokSymbol[TokSymbol] ? json[TokSymbol].fields[f2.name] : undefined;
        }

        if (!tokinfo) {
          tokinfo = json[TokSymbol];
        }
      }

      if (val === undefined) {
        //console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
        //continue;
      }

      let instance = f.name === 'this' ? val : json;

      let ret = sintern2.validateJSON(this, val, json, f, f.type, instance, _abstractKey);

      if (!ret || typeof ret === "string") {
        let msg = typeof ret === "string" ? ": " + ret : "";

        if (tokinfo) {
          this.jsonLogger(printContext(this.jsonBuf, tokinfo, this.jsonUseColors));
        }

        //console.error(cls.STRUCT);

        if (val === undefined) {
          throw new JSONError(stt.name + ": Missing json field " + f.name + msg);
        } else {
          throw new JSONError(stt.name + ": Invalid json field " + f.name + msg);
        }

        return false;
      }
    }

    for (let k in keyTestJson) {
      if (typeof json[k] === "symbol") {
        //ignore symbols
        continue;
      }

      if (!keys.has(k)) {
        this.jsonLogger(cls.STRUCT);
        throw new JSONError(stt.name + ": Unknown json field " + k);
        return false;
      }
    }

    return true;
  }

  readJSON(json, cls_or_struct_id, objInstance = undefined) {
    const keywords = this.constructor.keywords;

    let cls, stt;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls.structName];

    packer_debug$1("\n\n=Begin reading " + cls.structName + "=");
    let thestruct = this;
    let this2 = this;
    let was_run = false;
    let fromJSON = sintern2.fromJSON;

    function makeLoader(stt) {
      return function load(obj) {
        if (was_run) {
          return;
        }

        was_run = true;

        let fields = stt.fields;
        let flen = fields.length;

        for (let i = 0; i < flen; i++) {
          let f = fields[i];

          let val;

          if (f.name === 'this') {
            val = json;
          } else {
            val = json[f.name];
          }

          if (val === undefined) {
            console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
            continue;
          }

          let instance = f.name === 'this' ? obj : objInstance;

          let ret = fromJSON(this2, val, obj, f, f.type, instance);

          if (f.name !== 'this') {
            obj[f.name] = ret;
          }
        }
      }
    }

    let load = makeLoader(stt);

    if (cls.prototype.loadSTRUCT !== undefined) {
      let obj = objInstance;

      if (!obj && cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT(load);
      } else if (!obj) {
        obj = new cls();
      }

      obj.loadSTRUCT(load);
      return obj;
    } else if (cls.fromSTRUCT !== undefined) {
      if (warninglvl$1 > 1) {
        console.warn("Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
      }
      return cls.fromSTRUCT(load);
    } else { //default case, make new instance and then call load() on it
      let obj = objInstance;

      if (!obj && cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT(load);
      } else if (!obj) {
        obj = new cls();
      }

      load(obj);

      return obj;
    }
  }

  formatJSON_intern(json, stt, field, tlvl = 0) {
    const keywords = this.constructor.keywords;
    const addComments = this.formatCtx.addComments;

    let s = '{';

    if (addComments && field && field.comment.trim()) {
      s += " " + field.comment.trim();
    }

    s += "\n";

    for (let f of stt.fields) {
      let value = json[f.name];

      s += tab(tlvl + 1) + f.name + ": ";

      s += sintern2.formatJSON(this, value, json, f, f.type, undefined, tlvl + 1);
      s += ",";

      let basetype = f.type.type;

      if (ArrayTypes.has(basetype)) {
        basetype = f.type.data.type.type;
      }

      const addComment = ValueTypes.has(basetype) && addComments && f.comment.trim();

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

    let s = '';

    if (validate) {
      this.validateJSON(json, cls);
    }

    let stt = this.structs[cls.structName];

    this.formatCtx = {
      addComments,
      validate
    };

    return this.formatJSON_intern(json, stt);
  }
};
//$KEYWORD_CONFIG_END

if (haveCodeGen) {
  var StructClass;

  try {
    eval(code);
  } catch (error) {
    printEvalError(code);
  }

  StructClass.keywords = {
    name  : "structName",
    script: "STRUCT",
    load  : "loadSTRUCT",
    from  : "fromSTRUCT",
    new   : "newSTRUCT",
  };

  STRUCT = StructClass;
}

STRUCT.setClassKeyword("STRUCT");

function deriveStructManager(keywords = {
  script: "STRUCT",
  name  : undefined, //script.toLowerCase + "Name"
  load  : undefined, //"load" + script
  new   : undefined, //"new" + script
  from  : undefined, //"from" + script
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

  if (!haveCodeGen) {
    class NewSTRUCT extends STRUCT {

    }

    NewSTRUCT.keywords = keywords;
    return NewSTRUCT;
  } else {
    var StructClass;
    var _json_parser = jsonParser;
    var _util = util;

    let code2 = code;
    code2 = code2.replace(/\[keywords.script\]/g, "." + keywords.script);
    code2 = code2.replace(/\[keywords.name\]/g, "." + keywords.name);
    code2 = code2.replace(/\bjsonParser\b/g, "_json_parser");
    code2 = code2.replace(/\butil\b/g, "_util");

    //console.log("\n\n");
    //console.log(printCodeLines(code2));
    //console.log("\n\n");

    try {
      eval(code2);
    } catch (error) {
      printEvalError(code2);
    }

    StructClass.keywords = keywords;
    return StructClass;
  }
}

//main struct script manager
manager = new STRUCT();

/**
 * Write all defined structs out to a string.
 *
 * @param nManager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
function write_scripts(nManager = manager, include_code = false) {
  let buf = "";

  /* prevent code generation bugs in configurable mode */
  let nl = String.fromCharCode(10);
  let tab = String.fromCharCode(9);

  nManager.forEach(function (stt) {
    buf += STRUCT.fmt_struct(stt, false, !include_code) + nl;
  });

  let buf2 = buf;
  buf = "";

  for (let i = 0; i < buf2.length; i++) {
    let c = buf2[i];
    if (c === nl) {
      buf += nl;
      let i2 = i;
      while (i < buf2.length && (buf2[i] === " " || buf2[i] === tab || buf2[i] === nl)) {
        i++;
      }
      if (i !== i2)
        i--;
    } else {
      buf += c;
    }
  }

  return buf;
}

"use strict";

let nbtoa, natob;

if (typeof btoa === "undefined") {
  nbtoa = function btoa(str) {
    let buffer = new Buffer("" + str, 'binary');
    return buffer.toString('base64');
  };

  natob = function atob(str) {
    return new Buffer(str, 'base64').toString('binary');
  };
} else {
  natob = atob;
  nbtoa = btoa;
}

/*
file format:
  magic signature              : 4 bytes
  file version major           : 2 bytes
  file version minor           : 1 bytes
  file version micro           : 1 bytes
  length of struct scripts     : 4 bytes
  struct scripts for this file : ...
  
  block:
    magic signature for block              : 4 bytes
    length of data  (not including header) : 4 bytes
    id of struct type                      : 4 bytes
    
    data                                   : ...
*/

function versionToInt(v) {
  v = versionCoerce(v);
  let mul = 64;
  return ~~(v.major*mul*mul*mul + v.minor*mul*mul + v.micro*mul);
}

let ver_pat = /[0-9]+\.[0-9]+\.[0-9]+$/;

function versionCoerce(v) {
  if (!v) {
    throw new Error("empty version: " + v);
  }

  if (typeof v === "string") {
    if (!ver_pat.exec(v)) {
      throw new Error("invalid version string " + v);
    }

    let ver = v.split(".");
    return {
      major : parseInt(ver[0]),
      minor : parseInt(ver[1]),
      micro : parseInt(ver[2])
    }
  } else if (Array.isArray(v)) {
    return {
      major : v[0],
      minor : v[1],
      micro : v[2]
    }
  } else if (typeof v === "object") {
    let test = (k) => k in v && typeof v[k] === "number";

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

class FileParams {
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
}

//used to define blocks
class Block {
  constructor(type_magic, data) {
    this.type = type_magic;
    this.data = data;
  }
}

class FileeError extends Error {
}

class FileHelper {
  //params can be FileParams instance, or object literal
  //(it will convert to FileParams)
  constructor(params) {
    if (params === undefined) {
      params = new FileParams();
    } else {
      let fp = new FileParams();

      for (let k in params) {
        fp[k] = params[k];
      }
      params = fp;
    }

    this.version = params.version;
    this.blocktypes = params.blocktypes;
    this.magic = params.magic;
    this.ext = params.ext;
    this.struct = undefined;
    this.unpack_ctx = undefined;
  }

  read(dataview) {
    this.unpack_ctx = new unpack_context();

    let magic = unpack_static_string(dataview, this.unpack_ctx, 4);

    if (magic !== this.magic) {
      throw new FileError("corrupted file");
    }

    this.version = {};
    this.version.major = unpack_short(dataview, this.unpack_ctx);
    this.version.minor = unpack_byte(dataview, this.unpack_ctx);
    this.version.micro = unpack_byte(dataview, this.unpack_ctx);

    let struct = this.struct = new STRUCT();

    let scripts = unpack_string(dataview, this.unpack_ctx);
    this.struct.parse_structs(scripts, manager);

    let blocks = [];
    let dviewlen = dataview.buffer.byteLength;

    while (this.unpack_ctx.i < dviewlen) {
      //console.log("reading block. . .", this.unpack_ctx.i, dviewlen);

      let type = unpack_static_string(dataview, this.unpack_ctx, 4);
      let datalen = unpack_int(dataview, this.unpack_ctx);
      let bstruct = unpack_int(dataview, this.unpack_ctx);
      let bdata;

      //console.log(type, datalen, bstruct);

      if (bstruct === -2) { //string data, e.g. JSON
        bdata = unpack_static_string(dataview, this.unpack_ctx, datalen);
      } else {
        bdata = unpack_bytes(dataview, this.unpack_ctx, datalen);
        bdata = struct.read_object(bdata, bstruct, new unpack_context());
      }

      let block = new Block();
      block.type = type;
      block.data = bdata;

      blocks.push(block);
    }

    this.blocks = blocks;
    return blocks;
  }

  doVersions(old) {
    let blocks = this.blocks;

    if (versionLessThan(old, "0.0.1")) {
      //do something
    }
  }

  write(blocks) {
    this.struct = manager;
    this.blocks = blocks;

    let data = [];

    pack_static_string(data, this.magic, 4);
    pack_short(data, this.version.major);
    pack_byte(data, this.version.minor & 255);
    pack_byte(data, this.version.micro & 255);

    let scripts = write_scripts();
    pack_string(data, scripts);

    let struct = this.struct;

    for (let block of blocks) {
      if (typeof block.data === "string") { //string data, e.g. JSON
        pack_static_string(data, block.type, 4);
        pack_int(data, block.data.length);
        pack_int(data, -2); //flag as string data
        pack_static_string(data, block.data, block.data.length);
        continue;
      }

      let structName = block.data.constructor.structName;
      if (structName === undefined || !(structName in struct.structs)) {
        throw new Error("Non-STRUCTable object " + block.data);
      }

      let data2 = [];
      let stt = struct.structs[structName];

      struct.write_object(data2, block.data);

      pack_static_string(data, block.type, 4);
      pack_int(data, data2.length);
      pack_int(data, stt.id);

      pack_bytes(data, data2);
    }

    return new DataView(new Uint8Array(data).buffer);
  }

  writeBase64(blocks) {
    let dataview = this.write(blocks);

    let str = "";
    let bytes = new Uint8Array(dataview.buffer);

    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }

    return nbtoa(str);
  }

  makeBlock(type, data) {
    return new Block(type, data);
  }

  readBase64(base64) {
    let data = natob(base64);
    let data2 = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      data2[i] = data.charCodeAt(i);
    }

    return this.read(new DataView(data2.buffer));
  }
}

var struct_filehelper = /*#__PURE__*/Object.freeze({
  __proto__: null,
  versionToInt: versionToInt,
  versionCoerce: versionCoerce,
  versionLessThan: versionLessThan,
  FileParams: FileParams,
  Block: Block,
  FileeError: FileeError,
  FileHelper: FileHelper
});

/** truncate webpack mangled names. defaults to true
 *  so Mesh$1 turns into Mesh */
function truncateDollarSign$1(value = true) {
  setTruncateDollarSign(value);
}

function validateStructs(onerror) {
  return manager.validateStructs(onerror);
}

/**
 true means little endian, false means big endian
 */
function setEndian(mode) {
  let ret = STRUCT_ENDIAN;

  setBinaryEndian(mode);

  return ret;
}

function consoleLogger() {
  console.log(...arguments);
}

/** Validate json
 *
 * @param json
 * @param cls
 * @param useInternalParser If true (the default) an internal parser will be used that generates nicer error messages
 * @param printColors
 * @param logger
 * @returns {*}
 */
function validateJSON$1(json, cls, useInternalParser, printColors = true, logger = consoleLogger) {
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

/** Register a class with nstructjs **/
function register(cls, structName) {
  return manager.register(cls, structName);
}

function unregister(cls) {
  manager.unregister(cls);
}

function inherit(child, parent, structName = child.name) {

  return STRUCT.inherit(...arguments);
}

/**
 @param data : DataView
 */
function readObject(data, cls, __uctx = undefined) {
  return manager.readObject(data, cls, __uctx);
}

/**
 @param data : Array instance to write bytes to
 */
function writeObject(data, obj) {
  return manager.writeObject(data, obj);
}

function writeJSON(obj) {
  return manager.writeJSON(obj);
}

function formatJSON$1(json, cls, addComments = true, validate = true) {
  return manager.formatJSON(json, cls, addComments, validate);
}

function readJSON(json, class_or_struct_id) {
  return manager.readJSON(json, class_or_struct_id);
}

export { JSONError, STRUCT, _truncateDollarSign, struct_binpack as binpack, consoleLogger, deriveStructManager, struct_filehelper as filehelper, formatJSON$1 as formatJSON, getEndian, inherit, isRegistered, manager, struct_parser as parser, struct_parseutil as parseutil, readJSON, readObject, register, setAllowOverriding, setDebugMode, setEndian, setTruncateDollarSign, setWarningMode, truncateDollarSign$1 as truncateDollarSign, struct_typesystem as typesystem, unpack_context, unregister, validateJSON$1 as validateJSON, validateStructs, writeJSON, writeObject, write_scripts };
