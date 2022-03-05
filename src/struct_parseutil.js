"use strict";
/*
The lexical scanner in this module was inspired by PyPLY

http://www.dabeaz.com/ply/ply.html
*/

import {termColor} from './struct_util.js';

function print_lines(ld, lineno, col, printColors, token) {
  let buf = '';
  let lines = ld.split("\n");
  let istart = Math.max(lineno - 5, 0);
  let iend  = Math.min(lineno + 3, lines.length);

  let color = printColors ? (c) => c : termColor;

  for (let i=istart; i<iend; i++) {
    let l = "" + (i + 1);
    while (l.length < 3) {
      l = " " + l;
    }

    l += `: ${lines[i]}\n`;

    if (i === lineno && token && token.value.length === 1) {
      l = l.slice(0, col+5) + color(l[col+5], "yellow") + l.slice(col+6, l.length);
    }
    buf += l;
    if (i === lineno) {
      let colstr = '     ';
      for (let i=0; i<col; i++) {
        colstr += ' ';
      }
      colstr += color("^", "red");

      buf += colstr + "\n";
    }
  }

  buf = "------------------\n" + buf + "\n==================\n";
  return buf;
}

export class token {
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

export class tokdef {
  constructor(name, regexpr, func, example) {
    this.name = name;
    this.re = regexpr;
    this.func = func;
    this.example = example;
    
    if (example === undefined && regexpr) {
      let s = "" + regexpr;
      if (s.startsWith("/") && s.endsWith("/")) {
        s = s.slice(1, s.length-1);
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
  constructor(msg) {
    super();
  }
}

export class lexer {
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
    this.tokints = {}
    for (let i = 0; i < tokdef.length; i++) {
      this.tokints[tokdef[i].name] = i;
    }
    this.statestack = [["__main__", 0]];
    this.states = {"__main__": [tokdef, errfunc]}
    this.statedata = 0;

    this.logger = function() {
      console.log(...arguments);
    }
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

    for (let i=0; i<str.length; i++, col++) {
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

    let safepos = Math.min(this.lexpos, this.lexdata.length-1);
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
        this.logger(""+tok);
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
    let col = this.colmap[Math.min(this.lexpos, this.lexdata.length-1)];

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
      this.logger(""+tok);
    }
    return tok;
  }
}

export class parser {
  constructor(lexer, errfunc) {
    this.lexer = lexer;
    this.errfunc = errfunc;
    this.start = undefined;

    this.logger = function() {
      console.log(...arguments);
    }
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
      estr = `Parse error at line ${token.lineno + 1}:${token.col+1}: ${msg}`;

    let buf = "";
    let ld = this.lexer.lexdata;
    let lineno = token ? token.lineno : this.lexer.linemap[this.lexer.linemap.length-1];
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
    let tok = this.peek();
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
  let reserved_tokens = new Set(["int", "float", "double", "vec2", "vec3", "vec4", "mat4", "string", "static_string", "array"]);

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
  }), tk("LPARAM", /\(/), tk("RPARAM", /\)/), tk("COMMA", /,/), tk("NUM", /[0-9]/), tk("SEMI", /;/), tk("NEWLINE", /\n/, function (t) {
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
    }
    else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return {type: tok.type.toLowerCase()}
    }
    else if (tok.type === "ARRAY") {
      return p_Array(p);
    }
    else {
      p.error(tok, "invalid type " + tok.type);
    }
  }

  function p_Field(p) {
    let field = {}
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
    let st = {}
    st.name = p.expect("ID", "struct name");
    st.fields = [];
    p.expect("OPEN");
    while (1) {
      if (p.at_end()) {
        p.error(undefined);
      }
      else if (p.optional("CLOSE")) {
        break;
      }
      else {
        st.fields.push(p_Field(p));
      }
    }
    return st;
  }

  let ret = p_Struct(parse);
  console.log(JSON.stringify(ret));
}

//test_parser();
