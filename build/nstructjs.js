let nexports = (function () {
  if (typeof window === "undefined" && typeof global != "undefined") {
    global._nGlobal = global;
  } else if (typeof self !== "undefined") {
    self._nGlobal = self;
  } else {
    window._nGlobal = window;
  }
  
  let exports;
  let module = {};

  //nodejs?
  if (typeof window === "undefined" && typeof global !== "undefined") {
    console.log("Nodejs!");
  } else {
    exports = {};
    _nGlobal.module = {exports : exports};
  }
  
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

"use strict";
const colormap = {
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
    "peach": 210,
};
function tab(n, chr = " ") {
    let t = "";
    for (let i = 0; i < n; i++) {
        t += chr;
    }
    return t;
}
const termColorMap = {};
for (const k in colormap) {
    termColorMap[k] = colormap[k];
    termColorMap[colormap[k]] = k;
}
function termColor(s, c) {
    let str;
    if (typeof s === "symbol") {
        str = s.toString();
    }
    else {
        str = "" + s;
    }
    let code;
    if (typeof c === "string" && c in colormap) {
        code = colormap[c];
    }
    else {
        code = typeof c === "number" ? c : parseInt(c, 10);
    }
    if (code > 107) {
        const s2 = "\u001b[38;5;" + code + "m";
        return s2 + str + "\u001b[0m";
    }
    return "\u001b[" + code + "m" + str + "\u001b[0m";
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
    const endtag = "\u001b[0m";
    function tok(s, type) {
        return {
            type: type,
            value: s,
        };
    }
    const tokdefs = [
        [re1a, "start"],
        [re1b, "start"],
        [re2, "end"],
    ];
    let s2 = s;
    const tokens = [];
    while (s2.length > 0) {
        let ok = false;
        let mini = undefined;
        let minslice = undefined;
        let mintype = undefined;
        for (const tk of tokdefs) {
            const idx = s2.search(tk[0]);
            if (idx >= 0 && (mini === undefined || idx < mini)) {
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
        }
        else if (t.type === "start") {
            stack.push(cur);
            cur = t.value;
            out += t.value;
        }
        else if (t.type === "end") {
            cur = stack.pop();
            if (cur) {
                out += cur;
            }
            else {
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

"use strict";
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
class token {
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
        super(msg);
    }
}
class lexer {
    constructor(tokdefArr, errfunc) {
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
        this.logger = function (...args) {
            console.log(...args);
        };
    }
    add_state(name, tokdefArr, errfunc) {
        if (errfunc === undefined) {
            errfunc = function (_lexer) {
                return true;
            };
        }
        this.states[name] = [tokdefArr, errfunc];
    }
    tok_int(_name) { }
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
    error() {
        if (this.errfunc !== undefined && !this.errfunc(this))
            return;
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
            const tok = this.peeked_tokens[0];
            this.peeked_tokens.shift();
            if (!ignore_peek && this.printTokens) {
                this.logger("" + tok);
            }
            return tok;
        }
        if (this.lexpos >= this.lexdata.length)
            return undefined;
        const ts = this.tokdef;
        const tlen = ts.length;
        const lexdata = this.lexdata.slice(this.lexpos, this.lexdata.length);
        const results = [];
        for (let i = 0; i < tlen; i++) {
            const t = ts[i];
            if (t.re === undefined)
                continue;
            const res = t.re.exec(lexdata);
            if (res !== null && res !== undefined && res.index === 0) {
                results.push([t, res]);
            }
        }
        let max_res = 0;
        let theres = undefined;
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
        const col = this.colmap[Math.min(this.lexpos, this.lexdata.length - 1)];
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
    constructor(lex, errfunc) {
        this.lexer = lex;
        this.errfunc = errfunc;
        this.start = undefined;
        this.logger = function (...args) {
            console.log(...args);
        };
    }
    parse(data, err_on_unconsumed) {
        if (err_on_unconsumed === undefined)
            err_on_unconsumed = true;
        if (data !== undefined)
            this.lexer.input(data);
        const ret = this.start(this);
        if (err_on_unconsumed && !this.lexer.at_end() && this.lexer.next() !== undefined) {
            this.error(undefined, "parser did not consume entire input");
        }
        return ret;
    }
    input(data) {
        this.lexer.input(data);
    }
    error(tokenObj, msg) {
        let estr;
        if (msg === undefined)
            msg = "";
        if (tokenObj === undefined)
            estr = "Parse error at end of input: " + msg;
        else
            estr = `Parse error at line ${tokenObj.lineno + 1}:${tokenObj.col + 1}: ${msg}`;
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
        if (tok !== undefined)
            tok.parser = this;
        return tok;
    }
    peeknext() {
        const tok = this.lexer.peeknext();
        if (tok !== undefined)
            tok.parser = this;
        return tok;
    }
    next() {
        const tok = this.lexer.next();
        if (tok !== undefined)
            tok.parser = this;
        return tok;
    }
    optional(type) {
        const tok = this.peeknext();
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
        return tok.value;
    }
}

var struct_parseutil = /*#__PURE__*/Object.freeze({
    __proto__: null,
    token: token,
    tokdef: tokdef,
    PUTIL_ParseError: PUTIL_ParseError,
    lexer: lexer,
    parser: parser
});

const StructEnum = {
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
};

"use strict";
class NStruct {
    constructor(name) {
        this.fields = [];
        this.id = -1;
        this.name = name;
    }
}
const ArrayTypes = new Set([
    StructEnum.STATIC_ARRAY,
    StructEnum.ARRAY,
    StructEnum.ITERKEYS,
    StructEnum.ITER,
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
    StructEnum.SIGNED_BYTE,
]);
const StructTypes = {
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
    "optional": StructEnum.OPTIONAL,
};
const StructTypeMap = {};
for (const k in StructTypes) {
    StructTypeMap[StructTypes[k]] = k;
}
function gen_tabstr$2(t) {
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
    let strs = new Set(["'", '"', "`"]);
    let mode = MAIN;
    let strlit = "";
    let escape = false;
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
        }
        else {
            escape = false;
        }
    }
    return s;
}
function StructParser() {
    const basic_types = new Set(["int", "float", "double", "string", "short", "byte", "sbyte", "bool", "uint", "ushort"]);
    const reserved_tokens = new Set([
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
        "optional",
    ]);
    function tk(name, re, func, example) {
        return new tokdef(name, re, func, example);
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
        tk("JSCRIPT", /\|/, function (t) {
            let js = "";
            const lex = t.lexer;
            let p;
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
        }, "whitespace"),
    ];
    reserved_tokens.forEach(function (rt) {
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
        if (size < 0 || Math.abs(size - Math.floor(size)) > 0.000001) {
            p.error(undefined, "Expected an integer");
        }
        size = Math.floor(size);
        if (p.optional("COMMA")) {
            const td = p_Type(p);
            itername = td.data || "";
        }
        p.expect("SCLOSE");
        return { type: StructEnum.STATIC_ARRAY, data: { type: arraytype, size: size, iname: itername } };
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
            jsonKeyword,
        };
    }
    function p_Optional(p) {
        p.expect("OPTIONAL");
        p.expect("LPARAM");
        const type = p_Type(p);
        p.expect("RPARAM");
        return {
            type: StructEnum.OPTIONAL,
            data: type,
        };
    }
    function p_Type(p) {
        const tok = p.peeknext();
        if (!tok) {
            p.error(undefined, "Unexpected end of input");
        }
        if (tok.type === "ID") {
            p.next();
            return { type: StructEnum.STRUCT, data: tok.value };
        }
        else if (basic_types.has(tok.type.toLowerCase())) {
            p.next();
            return { type: StructTypes[tok.type.toLowerCase()] };
        }
        else if (tok.type === "ARRAY") {
            return p_Array(p);
        }
        else if (tok.type === "ITER") {
            return p_Iter(p);
        }
        else if (tok.type === "ITERKEYS") {
            return p_IterKeys(p);
        }
        else if (tok.type === "STATIC_ARRAY") {
            return p_StaticArray(p);
        }
        else if (tok.type === "STATIC_STRING") {
            return p_Static_String(p);
        }
        else if (tok.type === "ABSTRACT") {
            return p_Abstract(p);
        }
        else if (tok.type === "DATAREF") {
            // Legacy - not in StructEnum but kept for parse compatibility
            p.error(tok, "DATAREF type is not supported");
        }
        else if (tok.type === "OPTIONAL") {
            return p_Optional(p);
        }
        else {
            p.error(tok, "invalid type " + tok.type);
        }
    }
    function p_ID_or_num(p) {
        const t = p.peeknext();
        if (t && t.type === "NUM") {
            p.next();
            return t.value;
        }
        else {
            return p.expect("ID", "struct field name");
        }
    }
    function p_Field(p) {
        const name = p_ID_or_num(p);
        let is_opt = false;
        const next = p.peeknext();
        if (next && next.type === "OPT_COLON") {
            p.expect("OPT_COLON");
            is_opt = true;
        }
        else {
            p.expect("COLON");
        }
        let type = p_Type(p);
        if (is_opt) {
            type = {
                type: StructEnum.OPTIONAL,
                data: type,
            };
        }
        let get = undefined;
        let set = undefined;
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
    function p_Struct(p) {
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
    parserInst.start = p_Struct;
    return parserInst;
}
const struct_parse = StructParser();

var struct_parser = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NStruct: NStruct,
    ArrayTypes: ArrayTypes,
    ValueTypes: ValueTypes,
    StructTypes: StructTypes,
    StructTypeMap: StructTypeMap,
    stripComments: stripComments,
    struct_parse: struct_parse,
    StructEnum: StructEnum
});

var struct_typesystem = /*#__PURE__*/Object.freeze({
    __proto__: null
});

"use strict";
let STRUCT_ENDIAN = true; //little endian
function setBinaryEndian(mode) {
    STRUCT_ENDIAN = !!mode;
}
const temp_dataview = new DataView(new ArrayBuffer(16));
const uint8_view = new Uint8Array(temp_dataview.buffer);
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
        while (i < arr.length && c & 128) {
            j += 7;
            i++;
            c = arr[i];
            c = (c & 127) << j;
            sum |= c;
        }
        if (sum === 0)
            break;
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
    if (last_codepoint < maxlen)
        arr.length = last_codepoint;
    else
        arr.length = last2;
    return arr;
}
const _static_sbuf_ss = new Array(2048);
function pack_static_string(data, str, length) {
    if (length === undefined)
        throw new Error("'length' parameter is not optional for pack_static_string()");
    const arr = length < 2048 ? _static_sbuf_ss : new Array();
    arr.length = 0;
    encode_utf8(arr, str);
    truncate_utf8(arr, length);
    for (let i = 0; i < length; i++) {
        if (i >= arr.length) {
            data.push(0);
        }
        else {
            data.push(arr[i]);
        }
    }
}
const _static_sbuf = new Array(32);
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
const _static_arr_us = new Array(32);
function unpack_string(data, uctx) {
    const slen = unpack_int(data, uctx);
    if (!slen) {
        return "";
    }
    const arr = slen < 2048 ? _static_arr_us : new Array(slen);
    arr.length = slen;
    for (let i = 0; i < slen; i++) {
        arr[i] = unpack_byte(data, uctx);
    }
    return decode_utf8(arr);
}
const _static_arr_uss = new Array(2048);
function unpack_static_string(data, uctx, length) {
    if (length === undefined)
        throw new Error("'length' cannot be undefined in unpack_static_string()");
    const arr = length < 2048 ? _static_arr_uss : new Array(length);
    arr.length = 0;
    let done = false;
    for (let i = 0; i < length; i++) {
        const c = unpack_byte(data, uctx);
        if (c === 0) {
            done = true;
        }
        if (!done && c !== 0) {
            arr.push(c);
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

let warninglvl$1 = 2;
let debug = 0;
let _static_envcode_null$1 = "";
let packer_debug$1;
let packer_debug_start$1;
let packer_debug_end$1;
let packdebug_tablevel = 0;
function _get_pack_debug() {
    return {
        packer_debug: packer_debug$1,
        packer_debug_start: packer_debug_start$1,
        packer_debug_end: packer_debug_end$1,
        debug,
        warninglvl: warninglvl$1,
    };
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
        this.cur = (this.cur + 1) % this.length;
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
    warninglvl$1 = t;
}
function setDebugMode2(t) {
    debug = t;
    if (debug) {
        packer_debug$1 = function (...args) {
            let tab = gen_tabstr$1(packdebug_tablevel);
            if (args.length > 0) {
                console.warn(tab, ...args);
            }
            else {
                console.warn("Warning: undefined msg");
            }
        };
        packer_debug_start$1 = function (funcname) {
            packer_debug$1("Start " + funcname);
            packdebug_tablevel++;
        };
        packer_debug_end$1 = function (funcname) {
            packdebug_tablevel--;
            if (funcname) {
                packer_debug$1("Leave " + funcname);
            }
        };
    }
    else {
        packer_debug$1 = function (..._args) { };
        packer_debug_start$1 = function (..._args) { };
        packer_debug_end$1 = function (..._args) { };
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
function formatJSON$1(manager, val, obj, field, type, instance, tlvl = 0) {
    return StructFieldTypeMap[type.type].formatJSON(manager, val, obj, field, type, instance, tlvl);
}
function validateJSON$1(manager, val, obj, field, type, instance, _abstractKey) {
    return StructFieldTypeMap[type.type].validateJSON(manager, val, obj, field, type, instance, _abstractKey);
}
function unpack_field(manager, data, type, uctx) {
    let name;
    if (debug) {
        name = StructFieldTypeMap[type.type].define().name;
        packer_debug_start$1("R " + name);
    }
    let ret = StructFieldTypeMap[type.type].unpack(manager, data, type, uctx);
    if (debug) {
        packer_debug_end$1();
    }
    return ret;
}
let fakeFields = new cachering(() => {
    return { type: undefined, get: undefined, set: undefined };
}, 256);
function fmt_type(type) {
    return StructFieldTypeMap[type.type].format(type);
}
function do_pack(manager, data, val, obj, field, type) {
    let name;
    if (debug) {
        name =
            StructFieldTypeMap[type.type !== undefined ? type.type : type].define().name;
        packer_debug_start$1("W " + name);
    }
    let typeid;
    if (typeof type !== "number") {
        typeid = type.type;
    }
    else {
        typeid = type;
    }
    let ret = StructFieldTypeMap[typeid].pack(manager, data, val, obj, field, type);
    if (debug) {
        packer_debug_end$1();
    }
    return ret;
}
let _ws_env$1 = [[undefined, undefined]];
class StructFieldType {
    static pack(manager, data, val, obj, field, type) { }
    static unpack(_manager, _data, _type, _uctx) {
        return undefined;
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
            name: "(error)",
        };
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
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        if (typeof val !== "number" || val !== Math.floor(val)) {
            return "" + val + " is not an integer";
        }
        return true;
    }
    static define() {
        return {
            type: StructEnum.INT,
            name: "int",
        };
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
            name: "float",
        };
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
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        if (typeof val !== "number") {
            return "Not a double: " + val;
        }
        return true;
    }
    static define() {
        return {
            type: StructEnum.DOUBLE,
            name: "double",
        };
    }
}
StructFieldType.register(StructDoubleField);
class StructStringField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        const s = !val ? "" : val;
        pack_string(data, s);
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
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
            name: "string",
        };
    }
}
StructFieldType.register(StructStringField);
class StructStaticStringField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        const s = !val ? "" : val;
        pack_static_string(data, s, type.data.maxlength);
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
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
            name: "static_string",
        };
    }
}
StructFieldType.register(StructStaticStringField);
class StructStructField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        let stt = manager.get_struct(type.data);
        packer_debug$1("struct", stt.name);
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
        packer_debug$1("struct", cls2 ? cls2.name : "(error)");
        return manager.read_object(data, cls2, uctx, dest);
    }
    static packNull(manager, data, field, type) {
        let stt = manager.get_struct(type.data);
        packer_debug$1("struct", type);
        for (let field2 of stt.fields) {
            let type2 = field2.type;
            packNull(manager, data, field2, type2);
        }
    }
    static unpack(manager, data, type, uctx) {
        let cls2 = manager.get_struct_cls(type.data);
        packer_debug$1("struct", cls2 ? cls2.name : "(error)");
        return manager.read_object(data, cls2, uctx);
    }
    static define() {
        return {
            type: StructEnum.STRUCT,
            name: "struct",
        };
    }
}
StructFieldType.register(StructStructField);
class StructTStructField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        let cls = manager.get_struct_cls(type.data);
        let stt = manager.get_struct(type.data);
        const keywords = manager.constructor.keywords;
        const valObj = val;
        const valCtor = valObj.constructor;
        //make sure inheritance is correct
        if (valCtor[keywords.name] !== type.data && val instanceof cls) {
            stt = manager.get_struct(valCtor[keywords.name]);
        }
        else if (valCtor[keywords.name] === type.data) {
            stt = manager.get_struct(type.data);
        }
        else {
            console.trace();
            throw new Error("Bad struct " + valCtor[keywords.name] + " passed to write_struct");
        }
        packer_debug$1("int " + stt.id);
        pack_int(data, stt.id);
        manager.write_struct(data, val, stt);
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        let key = type.jsonKeyword;
        if (typeof val !== "object") {
            return typeof val + " is not an object";
        }
        const valObj = val;
        let stt = manager.get_struct(valObj[key]);
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
        return manager.validateJSONIntern(valObj, stt, type.jsonKeyword);
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        let key = type.jsonKeyword;
        const valObj = val;
        let stt = manager.get_struct(valObj[key]);
        return manager.readJSON(val, stt, instance);
    }
    static formatJSON(manager, val, obj, field, type, instance, tlvl) {
        let key = type.jsonKeyword;
        const valObj = val;
        let stt = manager.get_struct(valObj[key]);
        return manager.formatJSON_intern(valObj, stt, field, tlvl);
    }
    static toJSON(manager, val, obj, field, type) {
        const keywords = manager.constructor.keywords;
        const valObj = val;
        const valCtor = valObj.constructor;
        let stt = manager.get_struct(valCtor[keywords.name]);
        let ret = manager.writeJSON(val, stt);
        ret[type.jsonKeyword] = "" + stt.name;
        return ret;
    }
    static packNull(manager, data, field, type) {
        let stt = manager.get_struct(type.data);
        pack_int(data, stt.id);
        packNull(manager, data, field, { type: StructEnum.STRUCT, data: type.data });
    }
    static format(type) {
        return "abstract(" + type.data + ")";
    }
    static unpackInto(manager, data, type, uctx, dest) {
        let id = unpack_int(data, uctx);
        packer_debug$1("-int " + id);
        if (!(id in manager.struct_ids)) {
            packer_debug$1("tstruct id: " + id);
            console.trace();
            console.log(id);
            console.log(manager.struct_ids);
            throw new Error("Unknown struct type " + id + ".");
        }
        let cls2 = manager.get_struct_id(id);
        packer_debug$1("struct name: " + cls2.name);
        let cls3 = manager.struct_cls[cls2.name];
        return manager.read_object(data, cls3, uctx, dest);
    }
    static unpack(manager, data, type, uctx) {
        let id = unpack_int(data, uctx);
        packer_debug$1("-int " + id);
        if (!(id in manager.struct_ids)) {
            packer_debug$1("tstruct id: " + id);
            console.trace();
            console.log(id);
            console.log(manager.struct_ids);
            throw new Error("Unknown struct type " + id + ".");
        }
        let cls2 = manager.get_struct_id(id);
        packer_debug$1("struct name: " + cls2.name);
        let cls3 = manager.struct_cls[cls2.name];
        return manager.read_object(data, cls3, uctx);
    }
    static define() {
        return {
            type: StructEnum.TSTRUCT,
            name: "tstruct",
        };
    }
}
StructFieldType.register(StructTStructField);
/** out is just a [string], an array of dimen 1 whose sole entry is the output string. */
function formatArrayJson(manager, val, obj, field, type, type2, instance, tlvl, array = val) {
    if (array === undefined || array === null || typeof array !== "object" || !(Symbol.iterator in array)) {
        console.log(obj);
        console.log(array);
        throw new Error(`Expected an array for ${field.name}`);
    }
    if (ValueTypes.has(type2.type)) {
        return JSON.stringify(array);
    }
    let s = "[";
    if (manager.formatCtx.addComments && field.comment.trim()) {
        s += " " + field.comment.trim();
    }
    s += "\n";
    for (let i = 0; i < array.length; i++) {
        let item = array[i];
        s += tab(tlvl + 1) + formatJSON$1(manager, item, val, field, type2, instance, tlvl + 1) + ",\n";
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
            packer_debug$1("int 0");
            pack_int(data, 0);
            return;
        }
        const arr = val;
        packer_debug$1("int " + arr.length);
        pack_int(data, arr.length);
        let d = type.data;
        let itername = d.iname;
        let type2 = d.type;
        let env = _ws_env$1;
        for (let i = 0; i < arr.length; i++) {
            let val2 = arr[i];
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
        const d = type.data;
        if (d.iname !== "" && d.iname !== undefined) {
            return "array(" + d.iname + ", " + fmt_type(d.type) + ")";
        }
        else {
            return "array(" + fmt_type(d.type) + ")";
        }
    }
    static useHelperJS(field) {
        return !field.type.data.iname;
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        if (!val) {
            return "not an array: " + val;
        }
        const arr = val;
        for (let i = 0; i < arr.length; i++) {
            let ret = validateJSON$1(manager, arr[i], val, field, type.data.type, undefined, _abstractKey);
            if (typeof ret === "string" || !ret) {
                return ret;
            }
        }
        return true;
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        const arr = val;
        let ret = (instance || []);
        ret.length = 0;
        for (let i = 0; i < arr.length; i++) {
            let val2 = fromJSON(manager, arr[i], val, field, type.data.type, undefined);
            if (val2 === undefined) {
                console.log(val2);
                console.error("eeek");
                throw new Error("Unexpected undefined value in fromJSON");
            }
            ret.push(val2);
        }
        return ret;
    }
    static formatJSON(manager, val, obj, field, type, instance, tlvl) {
        return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl ?? 0);
    }
    static toJSON(manager, val, obj, field, type) {
        const arr = (val || []);
        let json = [];
        let itername = type.data.iname;
        for (let i = 0; i < arr.length; i++) {
            let val2 = arr[i];
            let env = _ws_env$1;
            if (itername !== "" && itername !== undefined && field.get) {
                env[0][0] = itername;
                env[0][1] = val2;
                val2 = manager._env_call(field.get, obj, env);
            }
            json.push(toJSON(manager, val2, val, field, type.data.type));
        }
        return json;
    }
    static unpackInto(manager, data, type, uctx, dest) {
        let len = unpack_int(data, uctx);
        const arr = dest;
        arr.length = 0;
        for (let i = 0; i < len; i++) {
            arr.push(unpack_field(manager, data, type.data.type, uctx));
        }
        return arr;
    }
    static unpack(manager, data, type, uctx) {
        let len = unpack_int(data, uctx);
        packer_debug$1("-int " + len);
        let arr = new Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = unpack_field(manager, data, type.data.type, uctx);
        }
        return arr;
    }
    static define() {
        return {
            type: StructEnum.ARRAY,
            name: "array",
        };
    }
}
StructFieldType.register(StructArrayField);
class StructIterField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        //this was originally implemented to use ES6 iterators.
        function forEach(cb, thisvar) {
            const v = val;
            if (v && v[Symbol.iterator]) {
                for (const item of v) {
                    cb.call(thisvar, item);
                }
            }
            else if (v && typeof v.forEach === "function") {
                v.forEach(function (item) {
                    cb.call(thisvar, item);
                });
            }
            else {
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
        let d = type.data;
        let itername = d.iname;
        let type2 = d.type;
        let env = _ws_env$1;
        let i = 0;
        forEach(function (val2) {
            let v2 = val2;
            if (itername !== "" && itername !== undefined && field.get) {
                env[0][0] = itername;
                env[0][1] = v2;
                v2 = manager._env_call(field.get, obj, env);
            }
            //XXX not sure I really need this fakeField stub here. . .
            let fakeField = fakeFields.next();
            fakeField.type = type2;
            do_pack(manager, data, v2, obj, fakeField, type2);
            i++;
        }, undefined);
        /* write length */
        temp_dataview.setInt32(0, i, STRUCT_ENDIAN);
        data[starti++] = uint8_view[0];
        data[starti++] = uint8_view[1];
        data[starti++] = uint8_view[2];
        data[starti++] = uint8_view[3];
    }
    static formatJSON(manager, val, obj, field, type, instance, tlvl) {
        return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl ?? 0, list(val));
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        return StructArrayField.validateJSON(manager, val, obj, field, type, instance, _abstractKey);
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        return StructArrayField.fromJSON(manager, val, obj, field, type, instance);
    }
    static toJSON(manager, val, obj, field, type) {
        const arr = (val || []);
        let json = [];
        let itername = type.data.iname;
        for (let val2 of arr) {
            let v2 = val2;
            let env = _ws_env$1;
            if (itername !== "" && itername !== undefined && field.get) {
                env[0][0] = itername;
                env[0][1] = v2;
                v2 = manager._env_call(field.get, obj, env);
            }
            json.push(toJSON(manager, v2, val, field, type.data.type));
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
        const d = type.data;
        if (d.iname !== "" && d.iname !== undefined) {
            return "iter(" + d.iname + ", " + fmt_type(d.type) + ")";
        }
        else {
            return "iter(" + fmt_type(d.type) + ")";
        }
    }
    static unpackInto(manager, data, type, uctx, dest) {
        let len = unpack_int(data, uctx);
        packer_debug$1("-int " + len);
        const arr = dest;
        arr.length = 0;
        for (let i = 0; i < len; i++) {
            arr.push(unpack_field(manager, data, type.data.type, uctx));
        }
        return arr;
    }
    static unpack(manager, data, type, uctx) {
        let len = unpack_int(data, uctx);
        packer_debug$1("-int " + len);
        let arr = new Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = unpack_field(manager, data, type.data.type, uctx);
        }
        return arr;
    }
    static define() {
        return {
            type: StructEnum.ITER,
            name: "iter",
        };
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
            name: "short",
        };
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
            name: "byte",
        };
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
            name: "sbyte",
        };
    }
}
StructFieldType.register(StructSignedByteField);
class StructBoolField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        pack_byte(data, val ? 1 : 0);
    }
    static unpack(manager, data, type, uctx) {
        return !!unpack_byte(data, uctx);
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        if (val === 0 || val === 1 || val === true || val === false || val === "true" || val === "false") {
            return true;
        }
        return "" + val + " is not a bool";
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        if (val === "false") {
            return false;
        }
        return !!val;
    }
    static toJSON(manager, val, obj, field, type) {
        return !!val;
    }
    static define() {
        return {
            type: StructEnum.BOOL,
            name: "bool",
        };
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
        const valObj = val;
        let len = 0.0;
        for (let k in valObj) {
            len++;
        }
        packer_debug$1("int " + len);
        pack_int(data, len);
        let d = type.data;
        let itername = d.iname;
        let type2 = d.type;
        let env = _ws_env$1;
        let i = 0;
        for (let key in valObj) {
            if (i >= len) {
                if (warninglvl$1 > 0) {
                    console.warn("Warning: object keys magically replaced during iteration", val, i);
                }
                return;
            }
            let val2;
            if (itername && itername.trim().length > 0 && field.get) {
                env[0][0] = itername;
                env[0][1] = key;
                val2 = manager._env_call(field.get, obj, env);
            }
            else {
                val2 = valObj[key]; //fetch value
            }
            let f2 = { type: type2, get: undefined, set: undefined, name: "", comment: "" };
            do_pack(manager, data, val2, obj, f2, type2);
            i++;
        }
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        return StructArrayField.validateJSON(manager, val, obj, field, type, instance, _abstractKey);
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        return StructArrayField.fromJSON(manager, val, obj, field, type, instance);
    }
    static formatJSON(manager, val, obj, field, type, instance, tlvl) {
        return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl ?? 0, list(val));
    }
    static toJSON(manager, val, obj, field, type) {
        const arr = (val || []);
        let json = [];
        let itername = type.data.iname;
        for (let k in arr) {
            let val2 = arr[k];
            let env = _ws_env$1;
            if (itername !== "" && itername !== undefined && field.get) {
                env[0][0] = itername;
                env[0][1] = val2;
                val2 = manager._env_call(field.get, obj, env);
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
        const d = type.data;
        if (d.iname !== "" && d.iname !== undefined) {
            return "iterkeys(" + d.iname + ", " + fmt_type(d.type) + ")";
        }
        else {
            return "iterkeys(" + fmt_type(d.type) + ")";
        }
    }
    static unpackInto(manager, data, type, uctx, dest) {
        let len = unpack_int(data, uctx);
        packer_debug$1("-int " + len);
        const arr = dest;
        arr.length = 0;
        for (let i = 0; i < len; i++) {
            arr.push(unpack_field(manager, data, type.data.type, uctx));
        }
        return arr;
    }
    static unpack(manager, data, type, uctx) {
        let len = unpack_int(data, uctx);
        packer_debug$1("-int " + len);
        let arr = new Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = unpack_field(manager, data, type.data.type, uctx);
        }
        return arr;
    }
    static define() {
        return {
            type: StructEnum.ITERKEYS,
            name: "iterkeys",
        };
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
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        if (typeof val !== "number" || val !== Math.floor(val)) {
            return "" + val + " is not an integer";
        }
        return true;
    }
    static define() {
        return {
            type: StructEnum.UINT,
            name: "uint",
        };
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
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        if (typeof val !== "number" || val !== Math.floor(val)) {
            return "" + val + " is not an integer";
        }
        return true;
    }
    static define() {
        return {
            type: StructEnum.USHORT,
            name: "ushort",
        };
    }
}
StructFieldType.register(StructUshortField);
class StructStaticArrayField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        const d = type.data;
        if (d.size === undefined) {
            throw new Error("type.data.size was undefined");
        }
        let itername = d.iname;
        const arr = val;
        if (arr === undefined || !arr.length) {
            this.packNull(manager, data, field, type);
            return;
        }
        for (let i = 0; i < d.size; i++) {
            let i2 = Math.min(i, Math.min(arr.length - 1, d.size));
            let val2 = arr[i2];
            if (itername !== "" && itername !== undefined && field.get) {
                let env = _ws_env$1;
                env[0][0] = itername;
                env[0][1] = val2;
                val2 = manager._env_call(field.get, obj, env);
            }
            do_pack(manager, data, val2, val, field, d.type);
        }
    }
    static useHelperJS(field) {
        return !field.type.data.iname;
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        return StructArrayField.validateJSON(manager, val, obj, field, type, instance, _abstractKey);
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        return StructArrayField.fromJSON(manager, val, obj, field, type, instance);
    }
    static formatJSON(manager, val, obj, field, type, instance, tlvl) {
        return formatArrayJson(manager, val, obj, field, type, type.data.type, instance, tlvl ?? 0, list(val));
    }
    static packNull(manager, data, field, type) {
        const d = type.data;
        let size = d.size;
        for (let i = 0; i < size; i++) {
            packNull(manager, data, field, d.type);
        }
    }
    static toJSON(manager, val, obj, field, type) {
        return StructArrayField.toJSON(manager, val, obj, field, type);
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
    static unpackInto(manager, data, type, uctx, dest) {
        const d = type.data;
        packer_debug$1("-size: " + d.size);
        const ret = dest;
        ret.length = 0;
        for (let i = 0; i < d.size; i++) {
            ret.push(unpack_field(manager, data, d.type, uctx));
        }
        return ret;
    }
    static unpack(manager, data, type, uctx) {
        const d = type.data;
        packer_debug$1("-size: " + d.size);
        let ret = [];
        for (let i = 0; i < d.size; i++) {
            ret.push(unpack_field(manager, data, d.type, uctx));
        }
        return ret;
    }
    static define() {
        return {
            type: StructEnum.STATIC_ARRAY,
            name: "static_array",
        };
    }
}
StructFieldType.register(StructStaticArrayField);
class StructOptionalField extends StructFieldType {
    static pack(manager, data, val, obj, field, type) {
        pack_int(data, val !== undefined && val !== null ? 1 : 0);
        if (val !== undefined && val !== null) {
            const fakeField = { ...field, type: type.data };
            do_pack(manager, data, val, obj, fakeField, type.data);
        }
    }
    static fakeField(field, type) {
        return { ...field, type: type.data };
    }
    static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
        const fakeField = this.fakeField(field, type);
        return val !== undefined && val !== null
            ? validateJSON$1(manager, val, obj, fakeField, type.data, undefined, _abstractKey)
            : true;
    }
    static fromJSON(manager, val, obj, field, type, instance) {
        const fakeField = this.fakeField(field, type);
        return val !== undefined && val !== null
            ? fromJSON(manager, val, obj, fakeField, type.data, undefined)
            : undefined;
    }
    static formatJSON(manager, val, obj, field, type, instance, tlvl) {
        if (val !== undefined && val !== null) {
            const fakeField = this.fakeField(field, type);
            return formatJSON$1(manager, val, val, fakeField, type.data, instance, (tlvl ?? 0) + 1);
        }
        return "null";
    }
    static toJSON(manager, val, obj, field, type) {
        const fakeField = this.fakeField(field, type);
        return val !== undefined && val !== null ? toJSON(manager, val, obj, fakeField, type.data) : null;
    }
    static packNull(manager, data, field, type) {
        pack_int(data, 0);
    }
    static format(type) {
        return "optional(" + fmt_type(type.data) + ")";
    }
    static unpackInto(manager, data, type, uctx, dest) {
        let exists = unpack_int(data, uctx);
        packer_debug$1("optional exists: " + exists);
        if (!exists) {
            return;
        }
        return unpack_field(manager, data, type.data, uctx);
    }
    static unpack(manager, data, type, uctx) {
        let exists = unpack_int(data, uctx);
        if (!exists) {
            return undefined;
        }
        return unpack_field(manager, data, type.data, uctx);
    }
    static define() {
        return {
            type: StructEnum.OPTIONAL,
            name: "optional",
        };
    }
}
StructFieldType.register(StructOptionalField);

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
    formatJSON: formatJSON$1,
    validateJSON: validateJSON$1,
    do_pack: do_pack,
    StructFieldType: StructFieldType,
    formatArrayJson: formatArrayJson
});

"use strict";
let structEval = eval;
function setStructEval(val) {
    structEval = val;
}

var _struct_eval = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get structEval () { return structEval; },
    setStructEval: setStructEval
});

"use strict";
const TokSymbol = Symbol("token-info");
// TokSymbol is attached to plain objects and arrays at runtime.
// We use helper functions to access it safely.
function setTokInfo(obj, info) {
    obj[TokSymbol] = info;
}
function getTokInfo(obj) {
    if (obj && typeof obj === "object") {
        return obj[TokSymbol];
    }
    return undefined;
}
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
    //nfloat3 has to be its own regexp
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
        tk("WS", /[ \r\t\n]/, (_t) => undefined), //drop token
        tk("STRLIT", /["']/, (t) => {
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
                }
                else if (!escape && c === char) {
                    break;
                }
                else {
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
        }),
    ];
    function tokinfo(t) {
        return {
            lexpos: t ? t.lexpos : 0,
            lineno: t ? t.lineno : 0,
            col: t ? t.col : 0,
            fields: {},
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
            p.error(undefined, "Unexpected end of input");
        }
        if (t.type === "LSBRACKET") {
            return p_Array(p);
        }
        else if (t.type === "LBRACE") {
            return p_Object(p);
        }
        else if (t.type === "STRLIT" || t.type === "NUM" || t.type === "NULL" || t.type === "BOOL") {
            const tok = p.next();
            if (tok.type === "NUM") {
                return parseFloat(tok.value);
            }
            else if (tok.type === "BOOL") {
                return tok.value === "true";
            }
            else if (tok.type === "NULL") {
                return null;
            }
            return tok.value;
        }
        else {
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
const _defaultParser = buildJSONParser();
function printContext(buf, tokinfo, printColors = true) {
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
    }
    else {
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
        }
        else {
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

"use strict";
let nGlobal = globalThis;
if (typeof globalThis !== "undefined") {
    nGlobal = globalThis;
}
else if (typeof window !== "undefined") {
    nGlobal = window;
}
else if (typeof global !== "undefined") {
    nGlobal = global;
}
else if (typeof self !== "undefined") {
    nGlobal = self;
}
const DEBUG = {};
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

"use strict";
// needed to avoid a rollup bug in configurable mode
const sintern2 = _sintern2;
const struct_eval = _struct_eval;
let warninglvl = 2;
let truncateDollarSign$1 = true;
exports.manager = void 0;
class JSONError extends Error {
}
function printCodeLines(code) {
    const lines = code.split(String.fromCharCode(10));
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
    /* Node suppresses the real error line number in error.stack for some reason.
     * Get it by retriggering the error for real.
     */
    eval(code);
}
function setTruncateDollarSign(v) {
    truncateDollarSign$1 = !!v;
}
function _truncateDollarSign(s) {
    const i = s.search("$");
    if (i > 0) {
        return s.slice(0, i).trim();
    }
    return s;
}
function unmangle(name) {
    if (truncateDollarSign$1) {
        return _truncateDollarSign(name);
    }
    else {
        return name;
    }
}
let _static_envcode_null = "";
function gen_tabstr(tot) {
    let ret = "";
    for (let i = 0; i < tot; i++) {
        ret += " ";
    }
    return ret;
}
let packer_debug;
let packer_debug_start;
let packer_debug_end;
function update_debug_data() {
    const ret = _get_pack_debug();
    packer_debug = ret.packer_debug;
    packer_debug_start = ret.packer_debug_start;
    packer_debug_end = ret.packer_debug_end;
    warninglvl = ret.warninglvl;
}
update_debug_data();
function setWarningMode(t) {
    sintern2.setWarningMode2(t);
    if (typeof t !== "number" || isNaN(t)) {
        throw new Error("Expected a single number (>= 0) argument to setWarningMode");
    }
    warninglvl = t;
}
function setDebugMode(t) {
    sintern2.setDebugMode2(t);
    update_debug_data();
}
let _ws_env = [[undefined, undefined]];
function define_empty_class(scls, name) {
    const cls = function () { };
    cls.prototype = Object.create(Object.prototype);
    cls.constructor = cls.prototype.constructor = cls;
    const keywords = scls.keywords;
    cls[keywords.script] = name + " {\n  }\n";
    cls[keywords.name] = name;
    cls.prototype[keywords.load] = function (reader) {
        reader(this);
    };
    cls[keywords.new] = function () {
        return new this();
    };
    return cls;
}
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
        this.jsonBuf = "";
        this.formatCtx = {};
    }
    static inherit(child, parent, structName = child.name) {
        const keywords = this.keywords;
        if (!parent[keywords.script]) {
            return structName + "{\n";
        }
        const stt = struct_parse.parse(parent[keywords.script]);
        let code = structName + "{\n";
        code += STRUCT.fmt_struct(stt, true, false, true);
        return code;
    }
    /** invoke loadSTRUCT methods on parent objects.  note that
     reader() is only called once.  it is called however.*/
    static Super(obj, reader) {
        if (warninglvl > 0) {
            console.warn("deprecated");
        }
        reader(obj);
        function reader2(_obj) { }
        const cls = obj.constructor;
        const keywords = this.keywords;
        let bad = cls === undefined || cls.prototype === undefined || Object.getPrototypeOf(cls.prototype) === undefined;
        if (bad) {
            return;
        }
        const parentProto = Object.getPrototypeOf(cls.prototype);
        const parent = parentProto.constructor;
        bad = bad || parent === undefined;
        if (!bad &&
            parent.prototype[keywords.load] &&
            parent.prototype[keywords.load] !== obj[keywords.load]) {
            parent.prototype[keywords.load].call(obj, reader2);
        }
    }
    /** deprecated.  used with old fromSTRUCT interface. */
    static chain_fromSTRUCT(cls, reader) {
        const keywords = this.keywords;
        if (warninglvl > 0) {
            console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");
        }
        const proto = cls.prototype;
        const parent = proto.prototype;
        const obj = parent.constructor[keywords.from];
        const result = obj(reader);
        const obj2 = new cls();
        const keys = Object.keys(result).concat(Object.getOwnPropertySymbols(result));
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            try {
                obj2[k] = result[k];
            }
            catch (error) {
                if (warninglvl > 0) {
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
        if (internal_only === undefined)
            internal_only = false;
        if (no_helper_js === undefined)
            no_helper_js = false;
        let s = "";
        if (!internal_only) {
            s += stt.name;
            if (!excludeId && stt.id !== -1)
                s += " id=" + stt.id;
            s += " {\n";
        }
        const tab = "  ";
        function fmt_type(type) {
            return StructFieldTypeMap[type.type].format(type);
            // Dead code below kept as comment for reference
            // if (type.type === StructEnum.ARRAY || ...) { ... }
        }
        const fields = stt.fields;
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
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
    static setClassKeyword(keyword, nameKeyword) {
        if (!nameKeyword) {
            nameKeyword = keyword.toLowerCase() + "Name";
        }
        this.keywords = {
            script: keyword,
            name: nameKeyword,
            load: "load" + keyword,
            new: "new" + keyword,
            after: "after" + keyword,
            from: "from" + keyword,
        };
    }
    define_null_native(name, cls) {
        const keywords = this.constructor.keywords;
        const obj = define_empty_class(this.constructor, name);
        const stt = struct_parse.parse(obj[keywords.script]);
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
            const ret = {};
            ret.type = type.type;
            if (typeof ret.type === "number") {
                for (const k in StructEnum) {
                    if (StructEnum[k] === ret.type) {
                        ret.type = k;
                        break;
                    }
                }
            }
            else if (typeof ret.type === "object") {
                ret.type = formatType(ret.type);
            }
            if (typeof type.data === "object") {
                ret.data = formatType(type.data);
            }
            else {
                ret.data = type.data;
            }
            return ret;
        }
        function throwError(stt, field, msg) {
            const buf = STRUCT.formatStruct(stt);
            console.error(buf + "\n\n" + msg);
            if (onerror) {
                onerror(msg, stt, field);
            }
            else {
                throw new Error(msg);
            }
        }
        for (const k in this.structs) {
            const stt = this.structs[k];
            for (const field of stt.fields) {
                if (field.name === "this") {
                    const type = field.type.type;
                    if (ValueTypes.has(type)) {
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
            if (thisvar !== undefined)
                func.call(thisvar, stt);
            else
                func(stt);
        }
    }
    // defaults to structjs.manager
    parse_structs(buf, defined_classes) {
        const keywords = this.constructor.keywords;
        if (defined_classes === undefined) {
            defined_classes = exports.manager;
        }
        if (defined_classes instanceof STRUCT) {
            const struct2 = defined_classes;
            const arr = [];
            for (const k in struct2.struct_cls) {
                arr.push(struct2.struct_cls[k]);
            }
            defined_classes = arr;
        }
        if (defined_classes === undefined) {
            const arr = [];
            for (const k in exports.manager.struct_cls) {
                arr.push(exports.manager.struct_cls[k]);
            }
            defined_classes = arr;
        }
        const clsmap = {};
        for (let i = 0; i < defined_classes.length; i++) {
            const cls = defined_classes[i];
            if (!cls[keywords.name] && cls[keywords.script]) {
                const stt = struct_parse.parse(cls[keywords.script].trim());
                cls[keywords.name] = stt.name;
            }
            else if (!cls[keywords.name] && cls.name !== "Object") {
                if (warninglvl > 0)
                    console.log("Warning, bad class in registered class list", unmangle(cls.name), cls);
                continue;
            }
            clsmap[cls[keywords.name]] = defined_classes[i];
        }
        struct_parse.input(buf);
        while (!struct_parse.at_end()) {
            const stt = struct_parse.parse(undefined, false);
            if (!(stt.name in clsmap)) {
                if (!(stt.name in this.null_natives))
                    if (warninglvl > 0)
                        console.log("WARNING: struct " + stt.name + " is missing from class list.");
                const dummy = define_empty_class(this.constructor, stt.name);
                dummy[keywords.script] = STRUCT.fmt_struct(stt, undefined, undefined, undefined, true);
                dummy[keywords.name] = stt.name;
                dummy.prototype[keywords.name] = dummy.name;
                this.struct_cls[dummy[keywords.name]] = dummy;
                this.structs[dummy[keywords.name]] = stt;
                if (stt.id !== -1)
                    this.struct_ids[stt.id] = stt;
            }
            else {
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
        const keywords = this.constructor.keywords;
        if (!cls[keywords.name]) {
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
                    const st = srcSTRUCT.structs[t.data];
                    const cls2 = srcSTRUCT.struct_cls[st.name];
                    return recStruct(st, cls2);
                }
            }
        };
        recStruct = (st, cls) => {
            if (!(cls[keywords.name] in this.structs)) {
                this.add_class(cls, cls[keywords.name]);
            }
            for (const f of st.fields) {
                if (f.type.type === StructEnum.STRUCT || f.type.type === StructEnum.TSTRUCT) {
                    const st2 = srcSTRUCT.structs[f.type.data];
                    const cls2 = srcSTRUCT.struct_cls[st2.name];
                    recStruct(st2, cls2);
                }
                else if (f.type.type === StructEnum.ARRAY) {
                    recArray(f.type);
                }
                else if (f.type.type === StructEnum.ITER) {
                    recArray(f.type);
                }
                else if (f.type.type === StructEnum.ITERKEYS) {
                    recArray(f.type);
                }
                else if (f.type.type === StructEnum.STATIC_ARRAY) {
                    recArray(f.type);
                }
            }
        };
        const st = srcSTRUCT.structs[cls[keywords.name]];
        recStruct(st, cls);
    }
    mergeScripts(child, parent) {
        const stc = struct_parse.parse(child.trim());
        const stp = struct_parse.parse(parent.trim());
        const fieldset = new Set();
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
        return STRUCT.fmt_struct(stc, false, false);
    }
    inlineRegister(cls, structScript) {
        const keywords = this.constructor.keywords;
        let p = Object.getPrototypeOf(cls);
        while (p && p !== Object) {
            if (p.hasOwnProperty(keywords.script)) {
                structScript = this.mergeScripts(structScript, p[keywords.script]);
                break;
            }
            p = Object.getPrototypeOf(p);
        }
        cls[keywords.script] = structScript;
        this.register(cls);
        return structScript;
    }
    register(cls, structName) {
        this.add_class(cls, structName);
    }
    unregister(cls) {
        const keywords = this.constructor.keywords;
        if (!cls ||
            !cls[keywords.name] ||
            !(cls[keywords.name] in this.struct_cls)) {
            console.warn("Class not registered with nstructjs", cls);
            return;
        }
        const st = this.structs[cls[keywords.name]];
        delete this.structs[cls[keywords.name]];
        delete this.struct_cls[cls[keywords.name]];
        delete this.struct_ids[st.id];
    }
    add_class(cls, structName) {
        // do not register Object
        if (cls === Object) {
            return;
        }
        const keywords = this.constructor.keywords;
        if (cls[keywords.script]) {
            let bad = false;
            let p = cls;
            while (p) {
                p = Object.getPrototypeOf(p);
                if (p &&
                    p[keywords.script] &&
                    p[keywords.script] === cls[keywords.script]) {
                    bad = true;
                    break;
                }
            }
            if (bad) {
                if (warninglvl > 0) {
                    console.warn("Generating " + keywords.script + " script for derived class " + unmangle(cls.name));
                }
                if (!structName) {
                    structName = unmangle(cls.name);
                }
                cls[keywords.script] = STRUCT.inherit(cls, p) + "\n}";
            }
        }
        if (!cls[keywords.script]) {
            throw new Error("class " + unmangle(cls.name) + " has no " + keywords.script + " script");
        }
        const stt = struct_parse.parse(cls[keywords.script]);
        stt.name = unmangle(stt.name);
        cls[keywords.name] = stt.name;
        // create default newSTRUCT
        if (cls[keywords.new] === undefined) {
            cls[keywords.new] = function () {
                return new this();
            };
        }
        if (structName !== undefined) {
            stt.name = structName;
            cls[keywords.name] = structName;
        }
        else if (cls[keywords.name] === undefined) {
            cls[keywords.name] = stt.name;
        }
        else {
            stt.name = cls[keywords.name];
        }
        if (cls[keywords.name] in this.structs) {
            if (warninglvl > 0) {
                console.warn("Struct " + unmangle(cls[keywords.name]) + " is already registered", cls);
            }
            if (!this.allowOverriding) {
                throw new Error("Struct " + unmangle(cls[keywords.name]) + " is already registered");
            }
            return;
        }
        if (stt.id === -1)
            stt.id = this.idgen++;
        this.structs[cls[keywords.name]] = stt;
        this.struct_cls[cls[keywords.name]] = cls;
        this.struct_ids[stt.id] = stt;
    }
    isRegistered(cls) {
        const keywords = this.constructor.keywords;
        if (!cls.hasOwnProperty("structName")) {
            return false;
        }
        return cls === this.struct_cls[cls[keywords.name]];
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
        let envcode = _static_envcode_null;
        if (env !== undefined) {
            envcode = "";
            for (let i = 0; i < env.length; i++) {
                envcode = "let " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
            }
        }
        let fullcode = "";
        if (envcode !== _static_envcode_null)
            fullcode = envcode + code;
        else
            fullcode = code;
        let func;
        if (!(fullcode in this.compiled_code)) {
            const code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
            try {
                func = struct_eval.structEval(code2);
            }
            catch (err) {
                console.warn(err.stack);
                console.warn(code2);
                console.warn(" ");
                throw err;
            }
            this.compiled_code[fullcode] = func;
        }
        else {
            func = this.compiled_code[fullcode];
        }
        try {
            return func.call(obj, obj, env);
        }
        catch (err) {
            console.warn(err.stack);
            const code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
            console.warn(code2);
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
                if (f.get !== undefined) {
                    val = thestruct._env_call(f.get, obj);
                }
                else {
                    val = f.name === "this" ? obj : obj[f.name];
                }
                if (DEBUG.tinyeval) {
                    console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
                }
                sintern2.do_pack(this, data, val, obj, f, t1);
            }
            else {
                const val = f.name === "this" ? obj : obj[f.name];
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
        const cls = obj.constructor[keywords.name];
        const stt = this.get_struct(cls);
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
     @return Instance of cls_or_struct_id
     */
    readObject(data, cls_or_struct_id, uctx) {
        if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
            data = new DataView(data.buffer);
        }
        else if (data instanceof Array) {
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
    writeJSON(obj, stt) {
        const keywords = this.constructor.keywords;
        const cls = obj.constructor;
        stt = stt || this.get_struct(cls[keywords.name]);
        function use_helper_js(field) {
            const type = field.type.type;
            const fieldCls = StructFieldTypeMap[type];
            return fieldCls.useHelperJS(field);
        }
        const toJSON = sintern2.toJSON;
        const fields = stt.fields;
        const thestruct = this;
        const json = {};
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            let val;
            const t1 = f.type;
            let json2;
            if (use_helper_js(f)) {
                if (f.get !== undefined) {
                    val = thestruct._env_call(f.get, obj);
                }
                else {
                    val = f.name === "this" ? obj : obj[f.name];
                }
                if (DEBUG.tinyeval) {
                    console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
                }
                json2 = toJSON(this, val, obj, f, t1);
            }
            else {
                val = f.name === "this" ? obj : obj[f.name];
                json2 = toJSON(this, val, obj, f, t1);
            }
            if (f.name !== "this") {
                json[f.name] = json2;
            }
            else {
                // f.name was 'this'?
                const isArrayCheck = Array.isArray(json2);
                let isArray = isArrayCheck || f.type.type === StructTypes.ARRAY;
                isArray = isArray || f.type.type === StructTypes.STATIC_ARRAY;
                if (isArray) {
                    const arr = json2;
                    json.length = arr.length;
                    for (let j = 0; j < arr.length; j++) {
                        json[j] = arr[j];
                    }
                }
                else {
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
        let cls;
        let stt;
        if (data instanceof Array) {
            data = new DataView(new Uint8Array(data).buffer);
        }
        if (typeof cls_or_struct_id === "number") {
            cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
        }
        else {
            cls = cls_or_struct_id;
        }
        if (cls === undefined) {
            throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
        }
        stt = this.structs[cls[keywords.name]];
        if (uctx === undefined) {
            uctx = new unpack_context();
            packer_debug("\n\n=Begin reading " + cls[keywords.name] + "=");
        }
        const thestruct = this;
        const this2 = this;
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
                const fields = stt.fields;
                const flen = fields.length;
                for (let i = 0; i < flen; i++) {
                    const f = fields[i];
                    if (f.name === "this") {
                        // load data into obj directly
                        unpack_into(f.type, obj);
                    }
                    else {
                        obj[f.name] = unpack_field(f.type);
                    }
                }
            };
        }
        const load = makeLoader(stt);
        if (cls.prototype[keywords.load] !== undefined) {
            let obj = objInstance;
            if (!obj && cls[keywords.new] !== undefined) {
                obj = cls[keywords.new].call(cls, load);
            }
            else if (!obj) {
                obj = new cls();
            }
            obj[keywords.load](load);
            if (!was_run) {
                console.warn("" +
                    cls[keywords.name] +
                    ".prototype[keywords.load]() did not execute its loader callback!");
                load(obj);
            }
            return obj;
        }
        else if (cls[keywords.from] !== undefined) {
            if (warninglvl > 1) {
                console.warn("Warning: class " +
                    unmangle(cls.name) +
                    " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
            }
            const anyCls = cls;
            return anyCls[keywords.from](load);
        }
        else {
            // default case, make new instance and then call load() on it
            let obj = objInstance;
            if (!obj && cls[keywords.new] !== undefined) {
                obj = cls[keywords.new].call(cls, load);
            }
            else if (!obj) {
                obj = new cls();
            }
            load(obj);
            return obj;
        }
    }
    validateJSON(json, cls_or_struct_id, useInternalParser = true, useColors = true, consoleLogger = function (...args) {
        console.log(...args);
    }, _abstractKey = "_structName") {
        if (cls_or_struct_id === undefined) {
            throw new Error(this.constructor.name + ".prototype.validateJSON: Expected at least two arguments");
        }
        try {
            let jsonStr = JSON.stringify(json, undefined, 2);
            this.jsonBuf = jsonStr;
            this.jsonUseColors = useColors;
            this.jsonLogger = consoleLogger;
            // add token annotations
            _defaultParser.logger = this.jsonLogger;
            let parsed;
            if (useInternalParser) {
                parsed = _defaultParser.parse(jsonStr);
            }
            else {
                parsed = JSON.parse(jsonStr);
            }
            this.validateJSONIntern(parsed, cls_or_struct_id, _abstractKey);
        }
        catch (error) {
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
        }
        else if (cls_or_struct_id instanceof NStruct) {
            cls = this.get_struct_cls(cls_or_struct_id.name);
        }
        else {
            cls = cls_or_struct_id;
        }
        if (cls === undefined) {
            throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
        }
        stt = this.structs[cls[keywords.name]];
        if (stt === undefined) {
            throw new Error("unknown class " + cls);
        }
        const fields = stt.fields;
        const flen = fields.length;
        const keys = new Set();
        keys.add(_abstractKey);
        let keyTestJson = json;
        for (let i = 0; i < flen; i++) {
            const f = fields[i];
            let val;
            let tokinfo;
            if (f.name === "this") {
                val = json;
                keyTestJson = {
                    "this": json,
                };
                keys.add("this");
                tokinfo = json[TokSymbol];
            }
            else {
                val = json[f.name];
                keys.add(f.name);
                const jsonTokInfo = json[TokSymbol];
                tokinfo = jsonTokInfo ? jsonTokInfo.fields[f.name] : undefined;
                if (!tokinfo) {
                    const f2 = fields[Math.max(i - 1, 0)];
                    const tokSymTokInfo = TokSymbol[TokSymbol];
                    tokinfo = tokSymTokInfo ? tokSymTokInfo.fields[f2.name] : undefined;
                }
                if (!tokinfo) {
                    tokinfo = json[TokSymbol];
                }
            }
            if (val === undefined) {
                // console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
                // continue;
            }
            const instance = f.name === "this" ? val : json;
            const ret = sintern2.validateJSON(this, val, json, f, f.type, instance, _abstractKey);
            if (!ret || typeof ret === "string") {
                const msg = typeof ret === "string" ? ": " + ret : "";
                if (tokinfo) {
                    this.jsonLogger(printContext(this.jsonBuf, tokinfo, this.jsonUseColors));
                }
                if (val === undefined) {
                    throw new JSONError(stt.name + ": Missing json field " + f.name + msg);
                }
                else {
                    throw new JSONError(stt.name + ": Invalid json field " + f.name + msg);
                }
                return false;
            }
        }
        for (const k in keyTestJson) {
            if (typeof json[k] === "symbol") {
                // ignore symbols
                continue;
            }
            if (!keys.has(k)) {
                this.jsonLogger(cls[keywords.script]);
                throw new JSONError(stt.name + ": Unknown json field " + k);
                return false;
            }
        }
        return true;
    }
    readJSON(json, cls_or_struct_id, objInstance) {
        const keywords = this.constructor.keywords;
        let cls;
        let stt;
        if (typeof cls_or_struct_id === "number") {
            cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
        }
        else if (cls_or_struct_id instanceof NStruct) {
            cls = this.get_struct_cls(cls_or_struct_id.name);
        }
        else {
            cls = cls_or_struct_id;
        }
        if (cls === undefined) {
            throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
        }
        stt = this.structs[cls[keywords.name]];
        packer_debug("\n\n=Begin reading " + cls[keywords.name] + "=");
        const thestruct = this;
        const this2 = this;
        let was_run = false;
        const fromJSON = sintern2.fromJSON;
        function makeLoader(stt) {
            return function load(obj) {
                if (was_run) {
                    return;
                }
                was_run = true;
                const fields = stt.fields;
                const flen = fields.length;
                for (let i = 0; i < flen; i++) {
                    const f = fields[i];
                    let val;
                    if (f.name === "this") {
                        val = json;
                    }
                    else {
                        val = json[f.name];
                    }
                    if (val === undefined) {
                        if (warninglvl > 1) {
                            console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
                        }
                        continue;
                    }
                    const instance = f.name === "this" ? obj : objInstance;
                    const ret = fromJSON(this2, val, obj, f, f.type, instance);
                    if (f.name !== "this") {
                        obj[f.name] = ret;
                    }
                }
            };
        }
        const loader = makeLoader(stt);
        if (cls.prototype[keywords.load] !== undefined) {
            let obj = objInstance;
            if (!obj && cls[keywords.new] !== undefined) {
                obj = cls[keywords.new].call(cls, loader);
            }
            else if (!obj) {
                obj = new cls();
            }
            const anyObj = obj;
            anyObj[keywords.load](loader);
            return obj;
        }
        else if (cls[keywords.from] !== undefined) {
            if (warninglvl > 1) {
                console.warn("Warning: class " +
                    unmangle(cls.name) +
                    " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
            }
            const anyCls = cls;
            return anyCls[keywords.from](loader);
        }
        else {
            // default case, make new instance and then call load() on it
            let obj = objInstance;
            if (!obj && cls[keywords.new] !== undefined) {
                obj = cls[keywords.new].call(cls, loader);
            }
            else if (!obj) {
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
            s += sintern2.formatJSON(this, value, json, f, f.type, undefined, tlvl + 1);
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
        const stt = this.structs[cls[keywords.name]];
        this.formatCtx = {
            addComments,
            validate,
        };
        return this.formatJSON_intern(json, stt);
    }
}
//$KEYWORD_CONFIG_END
STRUCT.setClassKeyword("STRUCT");
function deriveStructManager(keywords = {
    script: "STRUCT",
    name: undefined,
    load: undefined,
    new: undefined,
    from: undefined,
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
    class NewSTRUCT extends STRUCT {
    }
    NewSTRUCT.keywords = keywords;
    return NewSTRUCT;
}
// main struct script manager
exports.manager = new STRUCT();
/**
 * Write all defined structs out to a string.
 *
 * @param nManager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
function write_scripts(nManager = exports.manager, include_code = false) {
    let buf = "";
    /* prevent code generation bugs in configurable mode */
    const nl = String.fromCharCode(10);
    const tab = String.fromCharCode(9);
    nManager.forEach(function (stt) {
        buf += STRUCT.fmt_struct(stt, false, !include_code) + nl;
    });
    let buf2 = buf;
    buf = "";
    for (let i = 0; i < buf2.length; i++) {
        const c = buf2[i];
        if (c === nl) {
            buf += nl;
            const i2 = i;
            while (i < buf2.length && (buf2[i] === " " || buf2[i] === tab || buf2[i] === nl)) {
                i++;
            }
            if (i !== i2)
                i--;
        }
        else {
            buf += c;
        }
    }
    return buf;
}

"use strict";
let nbtoa;
let natob;
if (typeof btoa === "undefined") {
    nbtoa = function (str) {
        const buffer = Buffer.from("" + str, "binary");
        return buffer.toString("base64");
    };
    natob = function (str) {
        return Buffer.from(str, "base64").toString("binary");
    };
}
else {
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
    const ver = versionCoerce(v);
    const mul = 64;
    return ~~(ver.major * mul * mul * mul + ver.minor * mul * mul + ver.micro * mul);
}
const ver_pat = /[0-9]+\.[0-9]+\.[0-9]+$/;
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
            micro: parseInt(ver[2]),
        };
    }
    else if (Array.isArray(v)) {
        return {
            major: v[0],
            minor: v[1],
            micro: v[2],
        };
    }
    else if (typeof v === "object") {
        const test = (k) => k in v && typeof v[k] === "number";
        if (!test("major") || !test("minor") || !test("micro")) {
            throw new Error("invalid version object: " + v);
        }
        return v;
    }
    else {
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
            micro: 1,
        };
    }
}
//used to define blocks
class Block {
    constructor(type, data) {
        this.type = type || "";
        this.data = data;
    }
}
class FileError extends Error {
}
class FileHelper {
    //params can be FileParams instance, or object literal
    //(it will convert to FileParams)
    constructor(params) {
        const fp = new FileParams();
        if (params !== undefined) {
            for (const k in params) {
                fp[k] = params[k];
            }
        }
        this.version = fp.version;
        this.blocktypes = fp.blocktypes;
        this.magic = fp.magic;
        this.ext = fp.ext;
        this.struct = undefined;
        this.unpack_ctx = undefined;
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
            micro: 0,
        };
        this.version.major = unpack_short(dataview, this.unpack_ctx);
        this.version.minor = unpack_byte(dataview, this.unpack_ctx);
        this.version.micro = unpack_byte(dataview, this.unpack_ctx);
        const struct = (this.struct = new STRUCT());
        const scripts = unpack_string(dataview, this.unpack_ctx);
        this.struct.parse_structs(scripts, exports.manager);
        const blocks = [];
        const dviewlen = dataview.buffer.byteLength;
        while (this.unpack_ctx.i < dviewlen) {
            const type = unpack_static_string(dataview, this.unpack_ctx, 4);
            const datalen = unpack_int(dataview, this.unpack_ctx);
            const bstruct = unpack_int(dataview, this.unpack_ctx);
            let bdata;
            if (bstruct === -2) {
                //string data, e.g. JSON
                bdata = unpack_static_string(dataview, this.unpack_ctx, datalen);
            }
            else {
                const rawData = unpack_bytes(dataview, this.unpack_ctx, datalen);
                bdata = struct.read_object(rawData, bstruct, new unpack_context());
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
            //do something
        }
    }
    write(blocks) {
        this.struct = exports.manager;
        this.blocks = blocks;
        const data = [];
        pack_static_string(data, this.magic, 4);
        pack_short(data, this.version.major);
        pack_byte(data, this.version.minor & 255);
        pack_byte(data, this.version.micro & 255);
        const scripts = write_scripts();
        pack_string(data, scripts);
        const struct = this.struct;
        for (const block of blocks) {
            if (typeof block.data === "string") {
                //string data, e.g. JSON
                pack_static_string(data, block.type, 4);
                pack_int(data, block.data.length);
                pack_int(data, -2); //flag as string data
                pack_static_string(data, block.data, block.data.length);
                continue;
            }
            const blockData = block.data;
            const structNameVal = blockData.constructor.structName;
            if (structNameVal === undefined || !(structNameVal in struct.structs)) {
                throw new Error("Non-STRUCTable object " + block.data);
            }
            const data2 = [];
            const stt = struct.structs[structNameVal];
            struct.write_object(data2, block.data);
            pack_static_string(data, block.type, 4);
            pack_int(data, data2.length);
            pack_int(data, stt.id);
            pack_bytes(data, data2);
        }
        return new DataView(new Uint8Array(data).buffer);
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
}

var struct_filehelper = /*#__PURE__*/Object.freeze({
    __proto__: null,
    versionToInt: versionToInt,
    versionCoerce: versionCoerce,
    versionLessThan: versionLessThan,
    FileParams: FileParams,
    Block: Block,
    FileError: FileError,
    FileHelper: FileHelper
});

/** truncate webpack mangled names. defaults to true
 *  so Mesh$1 turns into Mesh */
function truncateDollarSign(value = true) {
    setTruncateDollarSign(value);
}
function validateStructs(onerror) {
    return exports.manager.validateStructs(onerror);
}
/**
 true means little endian, false means big endian
 */
function setEndian(mode) {
    const ret = STRUCT_ENDIAN;
    setBinaryEndian(mode);
    return ret;
}
function consoleLogger(...args) {
    console.log(...args);
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
function validateJSON(json, cls, useInternalParser, printColors = true, logger = consoleLogger) {
    return exports.manager.validateJSON(json, cls, useInternalParser, printColors, logger);
}
function getEndian() {
    return STRUCT_ENDIAN;
}
function setAllowOverriding(t) {
    return (exports.manager.allowOverriding = !!t);
}
function isRegistered(cls) {
    return exports.manager.isRegistered(cls);
}
/** Register a class inline.
 *
 * Note: No need to use nstructjs.inherit,
 * inheritance is handled for you.  Unlike
 * nstructjs.inherit fields can be properly
 * overridden in the child class without
 * being written twice.
 *
 * class Test {
 *  test = 0;
 *
 *  static STRUCT = nstructjs.inlineRegister(this, `
 *  namespace.Test {
 *    test : int;
 *  }
 *  `);
 * }
 **/
function inlineRegister(cls, structScript) {
    return exports.manager.inlineRegister(cls, structScript);
}
/** Register a class with nstructjs **/
function register(cls, structName) {
    return exports.manager.register(cls, structName);
}
function unregister(cls) {
    exports.manager.unregister(cls);
}
function inherit(child, parent, structName = child.name) {
    return STRUCT.inherit(child, parent, structName);
}
/**
 @param data : DataView
 */
function readObject(data, cls, __uctx) {
    return exports.manager.readObject(data, cls, __uctx);
}
/**
 @param data : Array instance to write bytes to
 */
function writeObject(data, obj) {
    return exports.manager.writeObject(data, obj);
}
function writeJSON(obj) {
    return exports.manager.writeJSON(obj);
}
function formatJSON(json, cls, addComments = true, validate = true) {
    return exports.manager.formatJSON(json, cls, addComments, validate);
}
function readJSON(json, class_or_struct_id) {
    return exports.manager.readJSON(json, class_or_struct_id);
}
/*
// @ts-ignore - tinyeval is an untyped JS dependency
import tinyeval1 from "../tinyeval/tinyeval.js";
export const tinyeval = tinyeval1;
import { nGlobal } from "./struct_global.js";
export function useTinyEval() {
    struct_eval.setStructEval((buf) => {
        return tinyeval.eval(buf, nGlobal);
    });
}
*/
   exports.useTinyEval = () => {};

exports.JSONError = JSONError;
exports.STRUCT = STRUCT;
exports._truncateDollarSign = _truncateDollarSign;
exports.binpack = struct_binpack;
exports.consoleLogger = consoleLogger;
exports.deriveStructManager = deriveStructManager;
exports.filehelper = struct_filehelper;
exports.formatJSON = formatJSON;
exports.getEndian = getEndian;
exports.inherit = inherit;
exports.inlineRegister = inlineRegister;
exports.isRegistered = isRegistered;
exports.parser = struct_parser;
exports.parseutil = struct_parseutil;
exports.readJSON = readJSON;
exports.readObject = readObject;
exports.register = register;
exports.setAllowOverriding = setAllowOverriding;
exports.setDebugMode = setDebugMode;
exports.setEndian = setEndian;
exports.setTruncateDollarSign = setTruncateDollarSign;
exports.setWarningMode = setWarningMode;
exports.truncateDollarSign = truncateDollarSign;
exports.typesystem = struct_typesystem;
exports.unpack_context = unpack_context;
exports.unregister = unregister;
exports.validateJSON = validateJSON;
exports.validateStructs = validateStructs;
exports.writeJSON = writeJSON;
exports.writeObject = writeObject;
exports.write_scripts = write_scripts;
  {
    let glob = !((typeof window === "undefined" && typeof self === "undefined") && typeof global !== "undefined");

    //try to detect nodejs in es6 module mode
    glob = glob || (typeof global !== "undefined" && typeof global.require === "undefined");


    if (glob) {
        //not nodejs?
        _nGlobal.nstructjs = module.exports;
        _nGlobal.module = undefined;
    }
  }
  
  return module.exports;
})();

if (typeof window === "undefined" && typeof global !== "undefined" && typeof module !== "undefined") {
  console.log("Nodejs!", nexports);
  module.exports = exports = nexports;
}
