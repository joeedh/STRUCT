"use strict";

import * as struct_parseutil from './struct_parseutil.js';
import type { StructField, TypeDescriptor, StructEnumValue, NStructInterface } from './types.js';
import { StructEnum } from './types.js';

export { StructEnum } from './types.js';

export class NStruct implements NStructInterface {
  fields: StructField[];
  id: number;
  name: string;

  constructor(name: string) {
    this.fields = [];
    this.id = -1;
    this.name = name;
  }
}

export const ArrayTypes = new Set<StructEnumValue>([
  StructEnum.STATIC_ARRAY, StructEnum.ARRAY, StructEnum.ITERKEYS, StructEnum.ITER
]);

export const ValueTypes = new Set<StructEnumValue>([
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

export const StructTypes: Record<string, StructEnumValue> = {
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

export const StructTypeMap: Record<number, string> = {};

for (const k in StructTypes) {
  StructTypeMap[StructTypes[k]] = k;
}

function gen_tabstr(t: number): string {
  let s = "";
  for (let i = 0; i < t; i++) {
    s += "  ";
  }
  return s;
}

export function stripComments(buf: string): string {
  let s = '';

  const MAIN = 0, COMMENT = 1, STR = 2;

  let n: string | undefined;
  let strs = new Set(["'", '"', "`"]);
  let mode = MAIN;
  let strlit: string = "";
  let escape: boolean | number = false;

  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    n = i < buf.length - 1 ? buf[i + 1] : undefined;

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

function StructParser(): struct_parseutil.parser {
  const basic_types = new Set([
    "int", "float", "double", "string", "short", "byte", "sbyte", "bool", "uint", "ushort"
  ]);

  const reserved_tokens = new Set([
    "int", "float", "double", "string", "static_string", "array",
    "iter", "abstract", "short", "byte", "sbyte", "bool", "iterkeys", "uint", "ushort",
    "static_array", "optional"
  ]);

  function tk(name: string, re?: RegExp, func?: (t: struct_parseutil.token) => struct_parseutil.token | undefined, example?: string): struct_parseutil.tokdef {
    return new struct_parseutil.tokdef(name, re, func, example);
  }

  const tokens = [
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
      const lex = t.lexer;
      let p: string | undefined;

      while (lex.lexpos < lex.lexdata.length) {
        const c = lex.lexdata[lex.lexpos];
        if (c === "\n")
          break;

        if (c === "/" && p === "/") {
          js = js.slice(0, js.length - 1);
          lex.lexpos--;

          break;
        }

        js += c;
        lex.lexpos++;
        p = c;
      }

      while (js.trim().endsWith(";")) {
        js = js.slice(0, js.length - 1);
        lex.lexpos--;
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
      return undefined;
    }, "newline"),
    tk("SPACE", / |\t/, function (_t) {
      return undefined;
    }, "whitespace")
  ];

  reserved_tokens.forEach(function (rt) {
    tokens.push(tk(rt.toUpperCase()));
  });

  function errfunc(_lexer: struct_parseutil.lexer): boolean {
    return true;
  }

  class Lexer extends struct_parseutil.lexer {
    input(str: string): void {
      return super.input(str);
    }
  }

  const lex = new Lexer(tokens, errfunc);
  const parserInst = new struct_parseutil.parser(lex);

  function p_Static_String(p: struct_parseutil.parser): TypeDescriptor {
    p.expect("STATIC_STRING");
    p.expect("SOPEN");
    const num = parseInt(p.expect("NUM"), 10);
    p.expect("SCLOSE");
    return {type: StructEnum.STATIC_STRING, data: {maxlength: num}};
  }

  function p_Array(p: struct_parseutil.parser): TypeDescriptor {
    p.expect("ARRAY");
    p.expect("LPARAM");
    let arraytype = p_Type(p);

    let itername = "";
    if (p.optional("COMMA")) {
      itername = ((arraytype as {data?: string}).data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }

    p.expect("RPARAM");
    return {type: StructEnum.ARRAY, data: {type: arraytype, iname: itername}};
  }

  function p_Iter(p: struct_parseutil.parser): TypeDescriptor {
    p.expect("ITER");
    p.expect("LPARAM");

    let arraytype = p_Type(p);
    let itername = "";

    if (p.optional("COMMA")) {
      itername = ((arraytype as {data?: string}).data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }

    p.expect("RPARAM");
    return {type: StructEnum.ITER, data: {type: arraytype, iname: itername}};
  }

  function p_StaticArray(p: struct_parseutil.parser): TypeDescriptor {
    p.expect("STATIC_ARRAY");
    p.expect("SOPEN");
    const arraytype = p_Type(p);
    let itername = "";

    p.expect("COMMA");
    let size = parseInt(p.expect("NUM"), 10);

    if (size < 0 || Math.abs(size - Math.floor(size)) > 0.000001) {
      p.error(undefined, "Expected an integer");
    }

    size = Math.floor(size);

    if (p.optional("COMMA")) {
      const td = p_Type(p);
      itername = (td as {data?: string}).data || "";
    }

    p.expect("SCLOSE");
    return {type: StructEnum.STATIC_ARRAY, data: {type: arraytype, size: size, iname: itername}};
  }

  function p_IterKeys(p: struct_parseutil.parser): TypeDescriptor {
    p.expect("ITERKEYS");
    p.expect("LPARAM");

    let arraytype = p_Type(p);
    let itername = "";

    if (p.optional("COMMA")) {
      itername = ((arraytype as {data?: string}).data || "").replace(/"/g, "");
      arraytype = p_Type(p);
    }

    p.expect("RPARAM");
    return {type: StructEnum.ITERKEYS, data: {type: arraytype, iname: itername}};
  }

  function p_Abstract(p: struct_parseutil.parser): TypeDescriptor {
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

  function p_Optional(p: struct_parseutil.parser): TypeDescriptor {
    p.expect("OPTIONAL");
    p.expect("LPARAM");
    const type = p_Type(p);
    p.expect("RPARAM");

    return {
      type: StructEnum.OPTIONAL,
      data: type
    };
  }

  function p_Type(p: struct_parseutil.parser): TypeDescriptor {
    const tok = p.peeknext();

    if (!tok) {
      p.error(undefined, "Unexpected end of input");
    }

    if (tok.type === "ID") {
      p.next();
      return {type: StructEnum.STRUCT, data: tok.value};
    } else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return {type: StructTypes[tok.type.toLowerCase()]} as TypeDescriptor;
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
      // Legacy - not in StructEnum but kept for parse compatibility
      p.error(tok, "DATAREF type is not supported");
    } else if (tok.type === "OPTIONAL") {
      return p_Optional(p);
    } else {
      p.error(tok, "invalid type " + tok.type);
    }
  }

  function p_ID_or_num(p: struct_parseutil.parser): string {
    const t = p.peeknext();

    if (t && t.type === "NUM") {
      p.next();
      return t.value;
    } else {
      return p.expect("ID", "struct field name");
    }
  }

  function p_Field(p: struct_parseutil.parser): StructField {
    const name = p_ID_or_num(p);
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

    let get: string | undefined = undefined;
    let set: string | undefined = undefined;

    let tok = p.peeknext();

    if (tok && tok.type === "JSCRIPT") {
      get = tok.value;
      p.next();
      tok = p.peeknext();
    }

    if (tok && tok.type === "JSCRIPT") {
      set = tok.value;
      p.next();
    }

    p.expect("SEMI");

    tok = p.peeknext();

    let comment = "";
    if (tok && tok.type === "COMMENT") {
      comment = tok.value;
      p.next();
    }

    return { name, type, get, set, comment };
  }

  function p_Struct(p: struct_parseutil.parser): NStruct {
    const name = p.expect("ID", "struct name");

    const st = new NStruct(name);

    let tok = p.peeknext();

    if (tok && tok.type === "ID" && tok.value === "id") {
      p.next();
      p.expect("EQUALS");
      st.id = parseInt(p.expect("NUM"), 10);
    }

    p.expect("OPEN");
    while (true) {
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

  parserInst.start = p_Struct as (p: struct_parseutil.parser) => unknown;
  return parserInst;
}

export const struct_parse = StructParser();
