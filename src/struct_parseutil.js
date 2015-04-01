var _struct_parseutil = undefined;

/*
The lexical scanner in this module was inspired by PyPLY

http://www.dabeaz.com/ply/ply.html
*/

define([
  "struct_typesystem", "struct_util"
], function(struct_typesystem, struct_util) {
  "use strict";
  var t;
  
  var Class = struct_typesystem.Class;
  
  var exports = _struct_parseutil = {};
  exports.token = Class([
    function constructor(type, val, lexpos, lineno, lexer, parser) {
      this.type = type;
      this.value = val;
      this.lexpos = lexpos;
      this.lineno = lineno;
      this.lexer = lexer;
      this.parser = parser;
    },
    function toString() {
      if (this.value!=undefined)
        return "token(type="+this.type+", value='"+this.value+"')";
      else 
        return "token(type="+this.type+")";
    }
  ]);
  
  exports.tokdef = Class([
    function constructor(name, regexpr, func) {
      this.name = name;
      this.re = regexpr;
      this.func = func;
    }
  ]);
  
  var PUTIL_ParseError = exports.PUTIL_ParseError = Class(Error, [
    function constructor(msg) {
      Error.call(this);
    }
  ]);
  
  exports.lexer = Class([
    function constructor(tokdef, errfunc) {
      this.tokdef = tokdef;
      this.tokens = new Array();
      this.lexpos = 0;
      this.lexdata = "";
      this.lineno = 0;
      this.errfunc = errfunc;
      this.tokints = {}
      for (var i=0; i<tokdef.length; i++) {
          this.tokints[tokdef[i].name] = i;
      }
      this.statestack = [["__main__", 0]];
      this.states = {"__main__": [tokdef, errfunc]}
      this.statedata = 0;
    },
    function add_state(name, tokdef, errfunc) {
      if (errfunc==undefined) {
          errfunc = function(lexer) {
            return true;
          };
      }
      this.states[name] = [tokdef, errfunc];
    },
    function tok_int(name) {
    },
    function push_state(state, statedata) {
      this.statestack.push([state, statedata]);
      state = this.states[state];
      this.statedata = statedata;
      this.tokdef = state[0];
      this.errfunc = state[1];
    },
    function pop_state() {
      var item=this.statestack[this.statestack.length-1];
      var state=this.states[item[0]];
      this.tokdef = state[0];
      this.errfunc = state[1];
      this.statedata = item[1];
    },
    function input(str) {
      while (this.statestack.length>1) {
        this.pop_state();
      }
      this.lexdata = str;
      this.lexpos = 0;
      this.lineno = 0;
      this.tokens = new Array();
      this.peeked_tokens = [];
    },
    function error() {
      if (this.errfunc != undefined && !this.errfunc(this))
        return;
        
      console.log("Syntax error near line "+this.lineno);

      var next=Math.min(this.lexpos+8, this.lexdata.length);
      console.log("  "+this.lexdata.slice(this.lexpos, next));

      throw new PUTIL_ParseError("Parse error");
    },
    function peek() {
      var tok=this.next(true);
      if (tok==undefined)
        return undefined;
      this.peeked_tokens.push(tok);
      return tok;
    },
    function at_end() {
      return this.lexpos>=this.lexdata.length&&this.peeked_tokens.length==0;
    },
    
    //ignore_peek is optional, false
    function next(ignore_peek) {
      if (!ignore_peek && this.peeked_tokens.length>0) {
          var tok=this.peeked_tokens[0];
          this.peeked_tokens.shift();
          return tok;
      }
      
      if (this.lexpos>=this.lexdata.length)
        return undefined;
        
      var ts=this.tokdef;
      var tlen=ts.length;
      var lexdata=this.lexdata.slice(this.lexpos, this.lexdata.length);
      var results=[];
      
      for (var i=0; i<tlen; i++) {
          var t=ts[i];
          if (t.re==undefined)
            continue;
          var res=t.re.exec(lexdata);
          if (res!=null&&res!=undefined&&res.index==0) {
              results.push([t, res]);
          }
      }
      
      var max_res=0;
      var theres=undefined;
      for (var i=0; i<results.length; i++) {
          var res=results[i];
          if (res[1][0].length>max_res) {
              theres = res;
              max_res = res[1][0].length;
          }
      }
      
      if (theres==undefined) {
          this.error();
          return ;
      }
      
      var def=theres[0];
      var token=new exports.token(def.name, theres[1][0], this.lexpos, this.lineno, this, undefined);
      this.lexpos+=token.value.length;
      
      if (def.func) {
          token = def.func(token);
          if (token==undefined) {
              return this.next();
          }
      }
      
      return token;
    }
  ]);
  
  exports.parser = Class([
    function constructor(lexer, errfunc) {
      this.lexer = lexer;
      this.errfunc = errfunc;
      this.start = undefined;
    },
    function parse(data, err_on_unconsumed) {
      if (err_on_unconsumed==undefined)
        err_on_unconsumed = true;
        
      if (data!=undefined)
        this.lexer.input(data);
        
      var ret=this.start(this);
      
      if (err_on_unconsumed && !this.lexer.at_end() && this.lexer.next() != undefined) {
          this.error(undefined, "parser did not consume entire input");
      }
      return ret;
    },
      
    function input(data) {
      this.lexer.input(data);
    },
    
    function error(token, msg) {
      if (msg==undefined)
        msg = "";
      if (token==undefined)
        var estr="Parse error at end of input: "+msg;
      else 
        estr = "Parse error at line "+(token.lineno+1)+": "+msg;
      var buf="1| ";
      var ld=this.lexer.lexdata;
      var l=1;
      for (var i=0; i<ld.length; i++) {
          var c=ld[i];
          if (c=='\n') {
              l++;
              buf+="\n"+l+"| ";
          }
          else {
            buf+=c;
          }
      }
      console.log("------------------");
      console.log(buf);
      console.log("==================");
      console.log(estr);
      if (this.errfunc&&!this.errfunc(token)) {
          return ;
      }
      throw new PUTIL_ParseError(estr);
    },
    function peek() {
      var tok=this.lexer.peek();
      if (tok!=undefined)
        tok.parser = this;
      return tok;
    },
    function next() {
      var tok=this.lexer.next();
      if (tok!=undefined)
        tok.parser = this;
      return tok;
    },
    function optional(type) {
      var tok=this.peek();
      if (tok==undefined)
        return false;
      if (tok.type==type) {
          this.next();
          return true;
      }
      return false;
    },
    function at_end() {
      return this.lexer.at_end();
    },
    function expect(type, msg) {
      var tok=this.next();
      if (msg==undefined)
        msg = type;
      if (tok==undefined||tok.type!=type) {
          this.error(tok, "Expected "+msg);
      }
      return tok.value;
    }
  ]);
  function test_parser() {
    var basic_types=new set(["int", "float", "double", "vec2", "vec3", "vec4", "mat4", "string"]);
    var reserved_tokens=new set(["int", "float", "double", "vec2", "vec3", "vec4", "mat4", "string", "static_string", "array"]);
    function tk(name, re, func) {
      return new exports.tokdef(name, re, func);
    }
    var tokens=[tk("ID", /[a-zA-Z]+[a-zA-Z0-9_]*/, function(t) {
      if (reserved_tokens.has(t.value)) {
          t.type = t.value.toUpperCase();
      }
      return t;
    }), tk("OPEN", /\{/), tk("CLOSE", /}/), tk("COLON", /:/), tk("JSCRIPT", /\|/, function(t) {
      var js="";
      var lexer=t.lexer;
      while (lexer.lexpos<lexer.lexdata.length) {
        var c=lexer.lexdata[lexer.lexpos];
        if (c=="\n")
          break;
        js+=c;
        lexer.lexpos++;
      }
      if (js.endsWith(";")) {
          js = js.slice(0, js.length-1);
          lexer.lexpos--;
      }
      t.value = js;
      return t;
    }), tk("LPARAM", /\(/), tk("RPARAM", /\)/), tk("COMMA", /,/), tk("NUM", /[0-9]/), tk("SEMI", /;/), tk("NEWLINE", /\n/, function(t) {
      t.lexer.lineno+=1;
    }), tk("SPACE", / |\t/, function(t) {
    })];
    var __iter_rt=__get_iter(reserved_tokens);
    var rt;
    while (1) {
      var __ival_rt=__iter_rt.next();
      if (__ival_rt.done) {
          break;
      }
      rt = __ival_rt.value;
      tokens.push(tk(rt.toUpperCase()));
    }
    var a="\n  Loop {\n    eid : int;\n    flag : int;\n    index : int;\n    type : int;\n\n    co : vec3;\n    no : vec3;\n    loop : int | eid(loop);\n    edges : array(e, int) | e.eid;\n\n    loops : array(Loop);\n  }\n  ";
    function errfunc(lexer) {
      return true;
    }
    var lex=new exports.lexer(tokens, errfunc);
    console.log("Testing lexical scanner...");
    lex.input(a);
    var token;
    while (token = lex.next()) {
      console.log(token.toString());
    }
    var parser=new exports.parser(lex);
    parser.input(a);
    function p_Array(p) {
      p.expect("ARRAY");
      p.expect("LPARAM");
      var arraytype=p_Type(p);
      var itername="";
      if (p.optional("COMMA")) {
          itername = arraytype;
          arraytype = p_Type(p);
      }
      p.expect("RPARAM");
      return {type: "array", data: {type: arraytype, iname: itername}}
    }
    function p_Type(p) {
      var tok=p.peek();
      if (tok.type=="ID") {
          p.next();
          return {type: "struct", data: "\""+tok.value+"\""}
      }
      else 
        if (basic_types.has(tok.type.toLowerCase())) {
          p.next();
          return {type: tok.type.toLowerCase()}
      }
      else 
        if (tok.type=="ARRAY") {
          return p_Array(p);
      }
      else {
        p.error(tok, "invalid type "+tok.type);
      }
    }
    function p_Field(p) {
      var field={}
      console.log("-----", p.peek().type);
      field.name = p.expect("ID", "struct field name");
      p.expect("COLON");
      field.type = p_Type(p);
      field.set = undefined;
      field.get = undefined;
      var tok=p.peek();
      if (tok.type=="JSCRIPT") {
          field.get = tok.value;
          p.next();
      }
      tok = p.peek();
      if (tok.type=="JSCRIPT") {
          field.set = tok.value;
          p.next();
      }
      p.expect("SEMI");
      return field;
    }
    function p_Struct(p) {
      var st={}
      st.name = p.expect("ID", "struct name");
      st.fields = [];
      p.expect("OPEN");
      while (1) {
        if (p.at_end()) {
            p.error(undefined);
        }
        else 
          if (p.optional("CLOSE")) {
            break;
        }
        else {
          st.fields.push(p_Field(p));
        }
      }
      return st;
    }
    var ret=p_Struct(parser);
    console.log(JSON.stringify(ret));
  }
  
  return exports;
});