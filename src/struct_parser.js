define([
  "struct_parseutil", "struct_util"
], function(struct_parseutil, struct_util) {
  "use strict";
  
  var exports = {};
  
  //the discontinuous id's are to make sure
  //the version I originally wrote (which had a few application-specific types)
  //and this one do not become totally incompatible.
  var StructEnum = exports.StructEnum = {
    T_INT    : 0,
    T_FLOAT  : 1,
    T_DOUBLE : 2,
    T_STRING : 7,
    T_STATIC_STRING : 8,
    T_STRUCT : 9, 
    T_TSTRUCT : 10,
    T_ARRAY   : 11,
    T_ITER    : 12,
    T_SHORT   : 13
  };
  
  var StructTypes = exports.StructTypes = {
    "int": StructEnum.T_INT, 
    "float": StructEnum.T_FLOAT, 
    "double": StructEnum.T_DOUBLE, 
    "string": StructEnum.T_STRING,
    "static_string": StructEnum.T_STATIC_STRING, 
    "struct": StructEnum.T_STRUCT, 
    "abstract": StructEnum.T_TSTRUCT, 
    "array": StructEnum.T_ARRAY, 
    "iter": StructEnum.T_ITER,
    "short": StructEnum.T_SHORT
  };
  
  var StructTypeMap = exports.StructTypeMap = {};
  
  for (var k in StructTypes) {
    StructTypeMap[StructTypes[k]] = k;
  }

  function gen_tabstr(t) {
    var s="";
    for (var i=0; i<t; i++) {
        s+="  ";
    }
    return s;
  }
  
  function StructParser() {
    var basic_types=new struct_util.set([
      "int", "float", "double", "string", "short"
    ]);
    
    var reserved_tokens=new struct_util.set([
      "int", "float", "double", "string", "static_string", "array", 
      "iter", "abstract", "short"
    ]);
  
    function tk(name, re, func) {
      return new struct_parseutil.tokdef(name, re, func);
    }
    
    var tokens=[tk("ID", /[a-zA-Z_]+[a-zA-Z0-9_\.]*/, function(t) {
      if (reserved_tokens.has(t.value)) {
          t.type = t.value.toUpperCase();
      }
      return t;
    }), tk("OPEN", /\{/), tk("EQUALS", /=/), tk("CLOSE", /}/), tk("COLON", /:/), tk("SOPEN", /\[/), tk("SCLOSE", /\]/), tk("JSCRIPT", /\|/, function(t) {
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
    }), tk("LPARAM", /\(/), tk("RPARAM", /\)/), tk("COMMA", /,/), tk("NUM", /[0-9]+/), tk("SEMI", /;/), tk("NEWLINE", /\n/, function(t) {
      t.lexer.lineno+=1;
    }), tk("SPACE", / |\t/, function(t) {
    })
    ];
    
    reserved_tokens.forEach(function(rt) {
      tokens.push(tk(rt.toUpperCase()));
    });
    
    function errfunc(lexer) {
      return true;
    }
    
    var lex=new struct_parseutil.lexer(tokens, errfunc);
    var parser=new struct_parseutil.parser(lex);
    
    function p_Static_String(p) {
      p.expect("STATIC_STRING");
      p.expect("SOPEN");
      var num=p.expect("NUM");
      p.expect("SCLOSE");
      return {type: StructEnum.T_STATIC_STRING, data: {maxlength: num}}
    }
    
    function p_DataRef(p) {
      p.expect("DATAREF");
      p.expect("LPARAM");
      var tname=p.expect("ID");
      p.expect("RPARAM");
      return {type: StructEnum.T_DATAREF, data: tname}
    }
    
    function p_Array(p) {
      p.expect("ARRAY");
      p.expect("LPARAM");
      var arraytype=p_Type(p);
      
      var itername="";
      if (p.optional("COMMA")) {
          itername = arraytype.data.replace(/"/g, "");
          arraytype = p_Type(p);
      }
      
      p.expect("RPARAM");
      return {type: StructEnum.T_ARRAY, data: {type: arraytype, iname: itername}}
    }
    
    function p_Iter(p) {
      p.expect("ITER");
      p.expect("LPARAM");
      var arraytype=p_Type(p);
      var itername="";
      
      if (p.optional("COMMA")) {
          itername = arraytype.data.replace(/"/g, "");
          arraytype = p_Type(p);
      }
      
      p.expect("RPARAM");
      return {type: StructEnum.T_ITER, data: {type: arraytype, iname: itername}}
    }
    
    function p_Abstract(p) {
      p.expect("ABSTRACT");
      p.expect("LPARAM");
      var type=p.expect("ID");
      p.expect("RPARAM");
      return {type: StructEnum.T_TSTRUCT, data: type}
    }
    
    function p_Type(p) {
      var tok=p.peek();
      
      if (tok.type=="ID") {
          p.next();
          return {type: StructEnum.T_STRUCT, data: tok.value}
      } else if (basic_types.has(tok.type.toLowerCase())) {
          p.next();
          return {type: StructTypes[tok.type.toLowerCase()]}
      } else if (tok.type=="ARRAY") {
          return p_Array(p);
      } else if (tok.type=="ITER") {
          return p_Iter(p);
      } else if (tok.type=="STATIC_STRING") {
          return p_Static_String(p);
      } else if (tok.type=="ABSTRACT") {
          return p_Abstract(p);
      } else if (tok.type=="DATAREF") {
          return p_DataRef(p);
      } else {
        p.error(tok, "invalid type "+tok.type);
      }
    }
    
    function p_Field(p) {
      var field={}
      
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
      st.id = -1;
      var tok=p.peek();
      var id=-1;
      if (tok.type=="ID"&&tok.value=="id") {
          p.next();
          p.expect("EQUALS");
          st.id = p.expect("NUM");
      }
      
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
    parser.start = p_Struct;
    return parser;
  }
  
  exports.struct_parse = StructParser();
   
  return exports;
});
