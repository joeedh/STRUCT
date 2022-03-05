import {tokdef, parser, lexer, token} from './struct_parseutil.js';
import {termColor} from './struct_util.js';
import {PUTIL_ParseError} from './struct_parseutil.js';

export const TokSymbol = Symbol("token-info");

export function buildJSONParser() {
  let tk = (name, re, func, example) => new tokdef(name, re, func, example);

  let parse;

  let nint = "[+-]?[0-9]+";
  let nhex = "[+-]?0x[0-9a-fA-F]+";
  let nfloat1 = "[+-]?[0-9]+\\.[0-9]*";
  let nfloat2 = "[+-]?[0-9]*\\.[0-9]+";
  let nfloat3 = "[+-]?[0-9]+\\.[0-9]+";
  let nfloatexp = "[+-]?[0-9]+\\.[0-9]+[eE][+-]?[0-9]+"

  let nfloat = `(${nfloat1})|(${nfloat2})|(${nfloatexp})`;
  let num = `(${nint})|(${nfloat})|(${nhex})`;
  let numre = new RegExp(num);

  let numreTest = new RegExp(`(${num})$`);

  //nfloat3 has to be its own regexp, the parser
  //always chooses the token handler that parses the most input,
  //and we don't want the partial 0. and .0 handles to split
  //e.g. 3.5 into 3 and 0.5
  nfloat3 = new RegExp(nfloat3);

  let tests = ["1.234234", ".23432", "-234.", "1e-17", "-0x23423ff", "+23423"];
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
  ]

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

export default buildJSONParser();

export function printContext(buf, tokinfo, printColors=true) {
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
