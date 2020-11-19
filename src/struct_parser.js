"use strict";
let struct_util = require("./struct_util");
let struct_parseutil = require("./struct_parseutil");

//the discontinuous id's are to make sure
//the version I originally wrote (which had a few application-specific types)
//and this one do not become totally incompatible.
var StructEnum = exports.StructEnum = {
  T_INT      : 0,
  T_FLOAT    : 1,
  T_DOUBLE   : 2,
  T_STRING   : 7,
  T_STATIC_STRING : 8, //fixed-length string
  T_STRUCT   : 9, 
  T_TSTRUCT  : 10,
  T_ARRAY    : 11,
  T_ITER     : 12,
  T_SHORT    : 13,
  T_BYTE     : 14,
  T_BOOL     : 15,
  T_ITERKEYS : 16,
  T_UINT     : 17,
  T_USHORT   : 18,
  T_STATIC_ARRAY : 19
};

var StructTypes = exports.StructTypes = {
  "int": StructEnum.T_INT, 
  "uint": StructEnum.T_UINT, 
  "ushort": StructEnum.T_USHORT, 
  "float": StructEnum.T_FLOAT, 
  "double": StructEnum.T_DOUBLE, 
  "string": StructEnum.T_STRING,
  "static_string": StructEnum.T_STATIC_STRING, 
  "struct": StructEnum.T_STRUCT, 
  "abstract": StructEnum.T_TSTRUCT, 
  "array": StructEnum.T_ARRAY, 
  "iter": StructEnum.T_ITER,
  "short": StructEnum.T_SHORT,
  "byte": StructEnum.T_BYTE,
  "bool": StructEnum.T_BOOL,
  "iterkeys" : StructEnum.T_ITERKEYS
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
    "int", "float", "double", "string", "short", "byte", "bool", "uint", "ushort"
  ]);
  
  var reserved_tokens=new struct_util.set([
    "int", "float", "double", "string", "static_string", "array", 
    "iter", "abstract", "short", "byte", "bool", "iterkeys", "uint", "ushort",
    "static_array"
  ]);

  function tk(name, re, func) {
    return new struct_parseutil.tokdef(name, re, func);
  }
  
  var tokens=[
    tk("ID", /[a-zA-Z_$]+[a-zA-Z0-9_\.$]*/, function(t) {

      if (reserved_tokens.has(t.value)) {
          t.type = t.value.toUpperCase();
      }
      return t;
    }, "identifier"), 
    tk("OPEN", /\{/), 
    tk("EQUALS", /=/), 
    tk("CLOSE", /}/), 
    tk("COLON", /:/), 
    tk("SOPEN", /\[/), 
    tk("SCLOSE", /\]/), 
    tk("JSCRIPT", /\|/, function(t) {
      var js="";
      var lexer=t.lexer;
      while (lexer.lexpos<lexer.lexdata.length) {
        var c=lexer.lexdata[lexer.lexpos];
        if (c=="\n")
          break;
        js+=c;
        lexer.lexpos++;
      }
      
      while (js.trim().endsWith(";")) {
          js = js.slice(0, js.length-1);
          lexer.lexpos--;
      }
      t.value = js.trim();
      return t;
    }), 
    tk("LPARAM", /\(/), 
    tk("RPARAM", /\)/), 
    tk("COMMA", /,/), 
    tk("NUM", /[0-9]+/, undefined, "number"), 
    tk("SEMI", /;/), 
    tk("NEWLINE", /\n/, function(t) {
      t.lexer.lineno+=1;
    }, "newline"),
    tk("SPACE", / |\t/, function(t) {
    }, "whitespace")
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
  
  function p_StaticArray(p) {
    p.expect("STATIC_ARRAY");
    p.expect("SOPEN");
    var arraytype=p_Type(p);
    var itername="";
    
    p.expect("COMMA")
    var size = p.expect("NUM");
    
    if (size < 0 || Math.abs(size - Math.floor(size)) > 0.000001) { 
      console.log(Math.abs(size - Math.floor(size)));
      p.error("Expected an integer");
    }
    
    size = Math.floor(size);
    
    if (p.optional("COMMA")) {
        itername = p_Type(p).data;
    }
    
    p.expect("SCLOSE");
    return {type: StructEnum.T_STATIC_ARRAY, data: {type: arraytype, size: size, iname: itername}}
  }
  
  function p_IterKeys(p) {
    p.expect("ITERKEYS");
    p.expect("LPARAM");
    
    var arraytype=p_Type(p);
    var itername="";
    
    if (p.optional("COMMA")) {
        itername = arraytype.data.replace(/"/g, "");
        arraytype = p_Type(p);
    }
    
    p.expect("RPARAM");
    return {type: StructEnum.T_ITERKEYS, data: {type: arraytype, iname: itername}}
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
    } else if (tok.type=="ITERKEYS") {
        return p_IterKeys(p);
    } else if (tok.type === "STATIC_ARRAY") {
      return p_StaticArray(p);
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
  
  function p_ID_or_num(p) {
    let t = p.peeknext();

    if (t.type == "NUM") {
      p.next();
      return t.value;
    } else {
      return p.expect("ID", "struct field name");
    }
  }
  
  function p_Field(p) {
    var field={}
    
    field.name = p_ID_or_num(p);
    p.expect("COLON");
    
    field.type = p_Type(p);
    field.set = undefined;
    field.get = undefined;
    
    let check = 0;
    
    var tok=p.peek();
    if (tok.type=="JSCRIPT") {
        field.get = tok.value;
        check = 1;
        p.next();
    }
    
    tok = p.peek();
    if (tok.type=="JSCRIPT") {
        check = 1;
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
