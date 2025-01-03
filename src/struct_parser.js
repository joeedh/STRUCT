"use strict";

import * as struct_parseutil from './struct_parseutil.js';

export class NStruct {
  constructor(name) {
    this.fields = [];
    this.id = -1;
    this.name = name;
  }
}

//the discontinuous id's are to make sure
//the version I originally wrote (which had a few application-specific types)
//and this one do not become totally incompatible.
export const StructEnum = {
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
  SIGNED_BYTE  : 20,
  OPTIONAL     : 21,
};

export const ArrayTypes = new Set([
  StructEnum.STATIC_ARRAY, StructEnum.ARRAY, StructEnum.ITERKEYS, StructEnum.ITER
]);

export const ValueTypes = new Set([
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
])

export let StructTypes = {
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
  "sbyte"        : StructEnum.SIGNED_BYTE,
  "optional"     : StructEnum.OPTIONAL,
};

export let StructTypeMap = {};

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

export function stripComments(buf) {
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
    "static_array", "optional"
  ]);

  function tk(name, re, func) {
    return new struct_parseutil.tokdef(name, re, func);
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
    tk("OPT_COLON", /\?:/),
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

  class Lexer extends struct_parseutil.lexer {
    input(str) {
      //str = stripComments(str);
      return super.input(str);
    }
  }

  let lex = new Lexer(tokens, errfunc);
  let parser = new struct_parseutil.parser(lex);

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

    p.expect("COMMA")
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

  function p_Optional(p) {
    p.expect("OPTIONAL");
    p.expect("LPARAM");
    const type = p_Type(p)
    p.expect("RPARAM");

    return {
      type: StructEnum.OPTIONAL,
      data: type
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
    } else if (tok.type === "OPTIONAL") {
      return p_Optional(p);
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
    let field = {}

    field.name = p_ID_or_num(p);
    let is_opt = false;

    if (p.peeknext().type === "OPT_COLON") {
      p.expect("OPT_COLON");
      is_opt = true;
    } else {
      p.expect("COLON");
    }

    field.type = p_Type(p);
    if (is_opt) {
      field.type = {
        type:  StructEnum.OPTIONAL,
        data: field.type
      }
    }
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

  parser.start = p_Struct;
  return parser;
}

export const struct_parse = StructParser();


