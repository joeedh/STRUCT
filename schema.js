"use strict";

/*

Okay.  The serialization system needs to do three things:

1. Handle data model changes.
2. Be lightning fast (which means no excessive creation of objects).
3. Be light-weight.

Thus, all the existing serialization schemes (that I know of) for JS
are ineligible.  Here is my final solution: a serialization language
that can compile itself to JS, and minimizes new object creation.

Note: this is *not* like C structs; specifically, variable-length
member fields are allowed (e.g. arrays, "abstract" sub-structs, etc).
There are no enforced byte alignments, either.

Format:

StructName {
  member-name : data-type ; helper-js-code;
}

where:

member-name = any valid identifier
data-type : int float double vec2 vec3 vec4 mat4

            static_string(max-length) 
            
            array([optional iter name for helepr JS], type),
            
            iter([optional iter name for help JS], type),
            
            dataref(SomeDataBlockType),
            
            NameOfAStruct
            
            abstract(StructName) //write type info for reading child classes
            
helper-js-code : an expression to get a value.  a local variable 'obj'
                 is the equivalent of 'this'.
                 note that this code is not saved when serializing files.
                 
note that the iter type is the same as array, except instead
of fetching list items by iterating over a numeric range,
e.g. for (i=0; i<arr.lenght; i++), it uses the (much slower) 
iteration API.
*/


//stupid statics
var _static_envcode_null = ""
var _tote=0, _cace=0, _compe=0;

#define MAX_CLSNAME 24

#define T_INT 0
#define T_FLOAT 1
#define T_DOUBLE 2
#define T_VEC2 3
#define T_VEC3 4
#define T_VEC4 5
#define T_MAT4 6
#define T_STRING 7
#define T_STATIC_STRING 8
#define T_STRUCT 9

//like struct, but also writes a ref to the type of struct

#define T_TSTRUCT 10
#define T_ARRAY 11
#define T_ITER 12
#define T_DATAREF 13

var SchemaTypes = Object.create({
    "int" : T_INT,
    "float" : T_FLOAT,
    "double" : T_DOUBLE,
    "vec2" : T_VEC2,
    "vec3" : T_VEC3,
    "vec4" : T_VEC4,
    "mat4" : T_MAT4,
    "string" : T_STRING,
    "static_string" : T_STATIC_STRING,
    "struct" : T_STRUCT,
    "abstract" : T_TSTRUCT,
    "array" : T_ARRAY,
    "iter" : T_ITER,
    "dataref" : T_DATAREF
});

var SchemaTypeMap = {}
for (var k in SchemaTypes) {
  SchemaTypeMap[SchemaTypes[k]] = k;
}

function gen_tabstr(t) {
  var s = "";
  for (var i=0; i<t; i++) {
    s += "  ";
  }
  
  return s;
}

function SchemaParser() {
  var basic_types = new set([
    "int", 
    "float", 
    "double",
    "vec2",
    "vec3",
    "vec4",
    "mat4",
    "string"]);
  
  var reserved_tokens = new set([
    "int", 
    "float", 
    "double", 
    "vec2", 
    "vec3", 
    "vec4", 
    "mat4", 
    "string", 
    "static_string",
    "array",
    "iter",
    "dataref",
    "abstract"]);

  function tk(name, re, func) {
    return new PUTL.tokdef(name, re, func);
  }
  
  var tokens = [
    tk("ID", /[a-zA-Z_]+[a-zA-Z0-9_]*/, function(t) {
      if (reserved_tokens.has(t.value)) {
        t.type = t.value.toUpperCase();
      }
      
      return t;
    }),
    tk("OPEN", /\{/),
    tk("EQUALS", /=/),
    tk("CLOSE", /}/),
    tk("COLON", /:/),
    tk("SOPEN", /\[/),
    tk("SCLOSE", /\]/),
    tk("JSCRIPT", /\|/, function(t) {
      var js = ""
      var lexer = t.lexer;
      while (lexer.lexpos < lexer.lexdata.length) {
        var c = lexer.lexdata[lexer.lexpos];
        if (c == "\n") 
          break;
        
        js += c;
        lexer.lexpos++;
      }
      
      if (js.endsWith(";")) {
        js = js.slice(0, js.length-1);
        lexer.lexpos--;
      }
      
      t.value = js;
      return t;
    }),
    tk("LPARAM", /\(/),
    tk("RPARAM", /\)/),
    tk("COMMA", /,/),
    tk("NUM", /[0-9]+/),
    tk("SEMI", /;/),
    tk("NEWLINE", /\n/, function(t) {
      t.lexer.lineno += 1;
    }),
    tk("SPACE", / |\t/, function(t) {
      //throw out non-newline whitespace tokens
    })
  ];

  for (var rt in reserved_tokens) {
    tokens.push(tk(rt.toUpperCase()));
  }
  
  function errfunc(lexer) {
    return true; //throw error
  }
  
  var lex = new PUTL.lexer(tokens, errfunc)
  var parser = new PUTL.parser(lex);
  
  function p_Static_String(p) {
    p.expect("STATIC_STRING");
    p.expect("SOPEN");
    var num = p.expect("NUM");
    
    p.expect("SCLOSE");
    
    return {type : T_STATIC_STRING, data : {maxlength : num}};
  }
  
  function p_DataRef(p) {
    p.expect("DATAREF");
    p.expect("LPARAM");
    
    var tname = p.expect("ID");
    p.expect("RPARAM");
    
    return {type : T_DATAREF, data : tname};
  }
  
  function p_Array(p) {
    p.expect("ARRAY");
    p.expect("LPARAM");
    
    var arraytype = p_Type(p);
    var itername = "";
    
    if (p.optional("COMMA")) {
      itername = arraytype.data.replace(/"/g, "");
      arraytype = p_Type(p);
    }    
    
    p.expect("RPARAM");
    
    return {type : T_ARRAY, data : {type : arraytype, iname : itername}};
  }
  
  function p_Iter(p) {
    p.expect("ITER");
    p.expect("LPARAM");
    
    var arraytype = p_Type(p);
    var itername = "";
    
    if (p.optional("COMMA")) {
      itername = arraytype.data.replace(/"/g, "");
      arraytype = p_Type(p);
    }    
    
    p.expect("RPARAM");
    
    return {type : T_ITER, data : {type : arraytype, iname : itername}};
  }
  
  function p_Abstract(p) {
    p.expect("ABSTRACT");
    p.expect("LPARAM");
    
    var type = p.expect("ID");
    p.expect("RPARAM");
    
    return {type : T_TSTRUCT, data : type};
  }
  
  function p_Type(p) {
    var tok = p.peek()
    
    if (tok.type == "ID") {
      p.next();
      return {type : T_STRUCT, data : tok.value};
    } else if (basic_types.has(tok.type.toLowerCase())) {
      p.next();
      return {type : SchemaTypes[tok.type.toLowerCase()]};
    } else if (tok.type == "ARRAY") {
      return p_Array(p);
    } else if (tok.type == "ITER") {
      return p_Iter(p);
    } else if (tok.type == "STATIC_STRING") {
      return p_Static_String(p);
    } else if (tok.type == "ABSTRACT") {
      return p_Abstract(p);
    } else if (tok.type == "DATAREF") {
      return p_DataRef(p);
    } else {
      p.error(tok, "invalid type " + tok.type); //(tok.value == "" ? tok.type : tok.value));
    }
  }
  
  function p_Field(p) {
    var field = {}
    
    field.name = p.expect("ID", "struct field name");
    p.expect("COLON");
    
    field.type = p_Type(p);    
    field.set = undefined;
    field.get = undefined;
    
    var tok = p.peek();
    if (tok.type == "JSCRIPT") {
      field.get =  tok.value;
      p.next()
    }
    
    tok = p.peek();
    if (tok.type == "JSCRIPT") {
      field.set = tok.value;
      p.next();
    }

    p.expect("SEMI");
    
    return field;
  }
  
  function p_Struct(p) {
    var st = {}
    st.name = p.expect("ID", "struct name")
    st.fields = [];
    st.id = -1;
    
    var tok = p.peek()
    var id = -1;
    
    if (tok.type == "ID" && tok.value == "id") {
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

var schema_parse = SchemaParser();

//replace pack callbacks with stubs
//if in release mode; otherwise, 
//turn on/off with DEBUG.Struct.
var _do_packdebug = !RELEASE;
var _packdebug_tlvl = 0;

if (_do_packdebug) {
  console.log("PACK DEBUG OF DOOM", DEBUG.Struct);
  var packer_debug = function(msg) {
    if (!DEBUG.Struct) return;
   
    if (msg != undefined) {
      var t = gen_tabstr(_packdebug_tlvl);
      console.log(t + msg);
    } else {
      console.log("Warning: undefined msg");
    }
  };

  var packer_debug_start = function(funcname) {
    packer_debug("Start " + funcname);
    _packdebug_tlvl++;
  };

  var packer_debug_end = function(funcname) {
    _packdebug_tlvl--;
    packer_debug("Leave " + funcname);
  };
} else {
  var packer_debug = function() {};
  var packer_debug_start = function() {};
  var packer_debug_end = function() {};
}

var _ws_env = [[undefined, undefined]];
var _st_packers = [
  function(data, val) { //int
    packer_debug("int " + val);
    pack_int(data, val);
  },
  function(data, val) { //float
    packer_debug("float " + val);
    pack_float(data, val);
  },
  function(data, val) { //double
    packer_debug("double " + val);
    pack_double(data, val);
  },
  function(data, val) { //vec2
    if (val == undefined) val = [0, 0];
    
    packer_debug("vec2");
    pack_vec2(data, val);
  },
  function(data, val) { //vec3
    if (val == undefined) val = [0, 0, 0];
    
    packer_debug("vec3")
    pack_vec3(data, val);
  },
  function(data, val) { //vec4
    if (val == undefined) val = [0, 0, 0, 0];
    
    packer_debug("vec4")
    pack_vec4(data, val);
  },
  function(data, val) { //mat4
    if (val == undefined) val = new Matrix4();
    
    packer_debug("mat4")
    pack_mat4(data, val);
  },
  function(data, val) { //string
    if (val == undefined) val = "";
    
    packer_debug("string: " + val)
    packer_debug("int " + val.length);
    pack_string(data, val);
  },
  function(data, val, obj, thestruct, field, type) { //static_string
    if (val == undefined) val = "";
    
    packer_debug("static_string: '" + val + "' length=" + type.data.maxlength);
    pack_static_string(data, val, type.data.maxlength);
  },
  function(data, val, obj, thestruct, field, type) { //struct
    packer_debug_start("struct " + type.data);
    thestruct.write_struct(data, val, thestruct.get_struct(type.data));
    packer_debug_end("struct");
  },  
  function(data, val, obj, thestruct, field, type) { //tstruct (struct with type)
    var cls = thestruct.get_struct_cls(type.data);
    var stt = thestruct.get_struct(type.data);
        
    if (val.constructor.name != type.data && (val instanceof cls)) {
      if (DEBUG.Struct) {
        console.log(val.constructor.name + " inherits from " + cls.name);
      }
      stt = thestruct.get_struct(val.constructor.name);
    } else if (val.constructor.name == type.data) {
      stt = thestruct.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct " + val.constructor.name + " passed to write_struct");
    }
    
    if (stt.id == 0) {
      //console.log("-------------------------------->", stt);
    }
    packer_debug_start("tstruct '" + stt.name + "'");
    
    packer_debug("int " + stt.id);
    pack_int(data, stt.id);
    thestruct.write_struct(data, val, stt);
    
    packer_debug_end("tstruct");
  },
  function(data, val, obj, thestruct, field, type) { //array
    packer_debug_start("array");
  
    if (val == undefined) {
      console.trace();
      console.log("Undefined array fed to schema struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      pack_int(data, 0);
      return;
    }
    
    packer_debug("int " + val.length);
    pack_int(data, val.length);
    
    var d = type.data;
    var itername = d.iname;
    var type2 = d.type;
    var env = _ws_env;
    
    for (var i=0; i<val.length; i++) {
      var val2 = val[i];
      
      if (itername != "" && itername != undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        
        val2 = thestruct._env_call(field.get, obj, env);
      }
      
      var f2 = {type : type2, get : undefined, set: undefined};
      
      _st_pack_type(data, val2, obj, thestruct, f2, type2);
    }
    packer_debug_end("array");
  },
  function(data, val, obj, thestruct, field, type) { //iter
    packer_debug_start("iter");
    
    if (val == undefined) {
      console.trace();
      console.log("Undefined iterable list fed to schema struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      pack_int(data, 0);
      return;
    }
    
    var len = 0;
    for (var val2 in val) {
      len++;
    }
    
    packer_debug("int " + len);
    pack_int(data, len);
    
    var d = type.data;
    var itername = d.iname;
    var type2 = d.type;
    var env = _ws_env;
    
    for (var val2 in val) {
      if (itername != "" && itername != undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        
        val2 = thestruct._env_call(field.get, obj, env);
      }
      
      var f2 = {type : type2, get : undefined, set: undefined};
      _st_pack_type(data, val2, obj, thestruct, f2, type2);
    }
    packer_debug_end("iter");
  },
  function (data, val) { //dataref
    packer_debug("dataref");
    packer_debug("int "+ (val != undefined ? val.lib_id : -1));
    packer_debug("int "+ ((val != undefined && val.lib_lib != undefined) ? val.lib_lib.id : -1));
    
    pack_dataref(data, val);
  }
];

function _st_pack_type(data, val, obj, thestruct, field, type) {
  //packer_debug("pack_type call")
  _st_packers[field.type.type](data, val, obj, thestruct, field, type);
}

class STRUCT {
  constructor()
  {
    this.idgen = new EIDGen();
    
    this.structs = {};
    this.struct_cls = {};
    this.struct_ids = {};
    this.compiled_code = {};
    this.null_natives = {};
    
    var this2 = this;
    function define_null_native(name, cls) {
      var obj = {name : name, prototype : Object.create(Object.prototype)};
      obj.constructor = obj;
      
      obj.STRUCT = name + " {\n  }\n";
      obj.fromSTRUCT = function(reader) {
        var ob = {};
        reader(ob);
        
        return ob;
      }
      
      var stt = schema_parse.parse(obj.STRUCT);
      stt.id = this2.idgen.gen_id();
      
      this2.structs[name] = stt;
      this2.struct_cls[name] = cls;
      this2.struct_ids[stt.id] = stt;
      this2.null_natives[name] = 1;
    }
    
    define_null_native("Object", Object);
  }

  parse_structs(buf) {
    global defined_classes;
    var clsmap = {}
    
    for (var i=0; i<defined_classes.length; i++) {
      clsmap[defined_classes[i].name] = defined_classes[i];
    }
    
    schema_parse.input(buf);
    while (!schema_parse.at_end()) {
      var stt = schema_parse.parse(undefined, false);
      
      //if struct does not exist anymore, load it into a dummy object
      if (!(stt.name in clsmap)) {
        if (!(stt.name in this.null_natives))
          console.log("WARNING: struct " + stt.name + " no longer exists.  will try to convert.");
        
        var dummy = Object.create(Object.prototype);
        dummy.prototype = Object.create(Object.prototype);
        dummy.STRUCT = STRUCT.fmt_struct(stt);
        dummy.fromSTRUCT = function(reader) {
          var obj = {};
          reader(obj);
          
          return obj;
        }
        dummy.name = stt.name;
        dummy.prototype.name = dummy.name;
        dummy.prototype.constructor = dummy;
        
        this.struct_cls[dummy.name] = dummy;
        this.struct_cls[dummy.name] = stt;
        
        if (stt.id != -1)
          this.struct_ids[stt.id] = stt;
      } else {
        this.struct_cls[stt.name] = clsmap[stt.name];
        this.structs[stt.name] = stt;
        if (stt.id != -1)
          this.struct_ids[stt.id] = stt;
      }
      
      var tok = schema_parse.peek()
      while (tok != undefined && tok.value == "\n") {
        tok = schema_parse.peek();
      }
    }  
  }

  add_struct(cls) {
    var stt = schema_parse.parse(cls.STRUCT);
    
    if (stt.id == -1)
      stt.id = this.idgen.gen_id();
    
    this.structs[cls.name] = stt;
    this.struct_cls[cls.name] = cls;
    this.struct_ids[stt.id] = stt;
  }

  get_struct_id(id) {
    return this.struct_ids[id];
  }

  get_struct(name) {
    if (!(name in this.structs)) {
      console.trace();
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

  static inherit(child, parent) {
    var stt = schema_parse.parse(parent.STRUCT);
    var code = child.name + "{\n" 
    code += STRUCT.fmt_struct(stt, true);
    
    return code;
  }
  
  //boilerplate for loading 
  //a struct that's a subclass of
  //another struct
  static chain_fromSTRUCT(cls, reader) {
    var proto = cls.prototype;
    var parent = cls.__clsorder__[cls.__clsorder__.length-1];
    
    /*remember that the struct reader will add members
      whether they technically exist at the time of read
      or not.  thus, we can chain fromSTRUCTs, it just
      a bit of boilerplate*/
    var obj = parent.fromSTRUCT(reader);
    var keys = Object.keys(proto);
    
    for (var i=0; i<keys.length; i++) {
      var k = keys[i];
      if (k == "__proto__") continue;
      
      obj[k] = proto[k];
    }
    
    if (proto.toString != Object.prototype.toString)
      obj.toString = proto.toString;
    
    return obj;
  }
  
  static fmt_struct(stt, internal_only, no_helper_js) {
    //var stt = schema_parse.parse(cls.STRUCT);
    
    if (internal_only == undefined)
      internal_only = false;
    if (no_helper_js == undefined)
      no_helper_js = false;
    
    var s = ""
    
    if (!internal_only) {
      s += stt.name
      if (stt.id != -1)
        s += " id=" + stt.id;
      s += " {\n";
    }
    
    var tab = "  ";
    
    function fmt_type(type) {
      if (type.type == T_ARRAY || type.type == T_ITER) {
        if (type.data.iname != "" && type.data.iname != undefined) {
          return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
        } else {
          return "array(" + fmt_type(type.data.type) + ")";
        }
      } else if (type.type == T_DATAREF) {
        return "dataref(" + type.data + ")";
      } else if (type.type == T_STATIC_STRING) {
        return "static_string[" + type.data.maxlength + "]";
      } else if (type.type == T_STRUCT) {
        return type.data;
      } else if (type.type == T_TSTRUCT) {
        return "abstract(" + type.data + ")";
      } else {
        return SchemaTypeMap[type.type];
      }
    }
    
    var fields = stt.fields;
    for (var i=0; i<fields.length; i++) {
      var f = fields[i];
      
      s += tab + f.name + " : " + fmt_type(f.type);
      if (!no_helper_js && f.get != undefined) {
        s += " | " + f.get.trim();
      }
      s += ";\n";
    }
    
    if (!internal_only)
      s += "}";
    return s;
  }

  _env_call(code, obj, env) {
    var envcode = _static_envcode_null;
    
    _tote++;
    
    if (env != undefined) {
      envcode = "";
      
      for (var i=0; i<env.length; i++) {
        envcode = "var " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
      }
    }
    
    var fullcode = ""
    
    if (envcode !== _static_envcode_null)
      fullcode = envcode + code;
    else
      fullcode = code;
    var func;
    
    if (!(fullcode in this.compiled_code)) {
        var code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
        
        try {
          eval(code2);
        } catch (err) {
          console.log(code2);
          console.log(" ");
          print_stack(err);
          throw err;
        }
        
        this.compiled_code[fullcode] = func;
        _compe++;
    } else {
      func = this.compiled_code[fullcode];
      _cace++;
    }
    
    try {
      return func(obj, env);
    } catch (err) {
        var code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
        console.log(code2);
        console.log(" ");
        print_stack(err);
        throw err;
    }
  }

  write_struct(data, obj, stt) {
    function use_helper_js(field) {
      if (field.type.type == T_ARRAY || field.type.type == T_ITER) {
        return field.type.data.iname == undefined || field.type.data.iname == "";
      }
      return true;
    }
    
    var fields = stt.fields;
    var thestruct = this;
    
    for (var i=0; i<fields.length; i++) {
      var f = fields[i];
      var t1 = f.type;
      var t2 = t1.type;
      
      if (use_helper_js(f)) {
        var val;
        var type = t2;
        
        if (f.get != undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = obj[f.name];
        }
        
        _st_pack_type(data, val, obj, thestruct, f, t1);
      } else { //if (t2 == T_ARRAY || t2 == T_ITER) {
        var val = obj[f.name];
        _st_pack_type(data, val, obj, thestruct, f, t1);
      }
    }
  }

  write_object(data, obj) {
    var cls = obj.constructor.name;
    var stt = this.get_struct(cls);
    this.write_struct(data, obj, stt);  
  }

  //uctx is a private, optional parameter
  read_object(data, cls, unpack_ctx uctx) {
    var stt = this.structs[cls.name];
    if (uctx == undefined)
      uctx = new unpack_ctx();
      
    var thestruct = this;
    
    var unpack_funcs = {
      T_INT : function(type) {
        var ret = unpack_int(data, uctx);
        packer_debug("-int " + ret);
        return ret
      },
      T_FLOAT : function(type) {
        var ret = unpack_float(data, uctx);
        packer_debug("-float " + ret);
        return ret
      },
      T_DOUBLE : function(type) {
        var ret = unpack_double(data, uctx);
        packer_debug("-double " + ret);
        return ret
      },
      
      T_STRING : function(type) {
        packer_debug_start("string");
        var s =  unpack_string(data, uctx);
        packer_debug("data: '"+s+"'");
        packer_debug_end("static_string");
        return s;
      },
      T_STATIC_STRING : function(type) {
        packer_debug_start("static_string");
        var s = unpack_static_string(data, uctx, type.data.maxlength);
        packer_debug("data: '"+s+"'");
        packer_debug_end("static_string");
        return s;
      },
      T_VEC2 : function(type) {
        packer_debug("vec2");
        return unpack_vec2(data, uctx);
      },
      T_VEC3 : function(type) {
        packer_debug("vec3");
        return unpack_vec3(data, uctx);
      },
      T_VEC4 : function(type) {
        packer_debug("vec4");
        return unpack_vec4(data, uctx);
      },
      T_MAT4 : function(type) {
        packer_debug("mat4");
        return unpack_mat4(data, uctx);
      },
      T_ARRAY : function(type) {
        packer_debug_start("array");
        
        var len = unpack_int(data, uctx);
        packer_debug("-int " + len);
        
        var arr = new Array(len);
        for (var i=0; i<len; i++) {
          arr[i] = unpack_field(type.data.type);
        }
        
        packer_debug_end("array");
        return arr;
      },
      T_ITER : function(type) {
        packer_debug_start("iter");
        
        var len = unpack_int(data, uctx);
        packer_debug("-int " + len);

        var arr = new Array(len);
        for (var i=0; i<len; i++) {
          arr[i] = unpack_field(type.data.type);
        }
        
        packer_debug_end("iter");
        return arr;
      },
      T_STRUCT : function(type) {
        packer_debug_start("struct " + type.data);
        var cls2 = thestruct.get_struct_cls(type.data);
        var ret = thestruct.read_object(data, cls2, uctx);
        packer_debug_end("struct");
        return ret;
      },
      T_TSTRUCT : function(type) {
        packer_debug_start("tstruct");
        var id = unpack_int(data, uctx);
        packer_debug("-int " + id);
        
        if (!(id in thestruct.struct_ids)) {
          packer_debug("struct id: " + id);
          console.trace();
          console.log(id);
          console.log(thestruct.struct_ids);
          packer_debug_end("tstruct");
          throw new Error("Unknown struct type " + id + ".");
        }
        
        var cls2 = thestruct.get_struct_id(id);
        packer_debug("struct name: " + cls2.name);
        
        cls2 = thestruct.struct_cls[cls2.name];

        var ret = thestruct.read_object(data, cls2, uctx);
        packer_debug_end("tstruct");
        
        return ret;
      },
      T_DATAREF : function(type) {
        packer_debug("-dataref");
        var ret = unpack_dataref(data, uctx);
        packer_debug("-dataref " + ret[0] + ", " + ret[1]);
        
        return ret
      }
    };
    
    function unpack_field(type) {
      return unpack_funcs[type.type](type);
    }
    
    function load(obj) {
      var fields = stt.fields;
      var flen = fields.length;
      
      for (var i=0; i<flen; i++) {
        var f = fields[i];
        var  val = unpack_field(f.type);
        
        obj[f.name] = val;
      }
    }
    
    return cls.fromSTRUCT(load);
  }
}

var istruct = new STRUCT();

var test_vertex_struct = """
  Vertex {
    eid : int;
    flag : int;
    index : int;
    type : int;
    
    co : vec3;
    no : vec3;
    loop : int | obj.loop == undefined ? -1 : obj.loop.eid;
    edges : array(e, int) | e.eid;
  }
""";
var test_struct_str = """
  Test {
    a : array(iter(Test2));
    b : string;
    c : array(int);
    d : array(string);
  }
""";

var test_struct_str2 = """
  Test2 {
    b : static_string[16];
    c : int;
  }
""";

function test_struct() {
  var stt = schema_parse.parse(test_struct_str);
  
  var t2a = {b: "1dsfsd", c: 3};
  var t2b = {b: "2dsfsd", c: 2};
  var t2c = {b: "3dsfsd", c: 1};
  
  var l1 = new GArray([t2a, t2b, t2c]);
  var l2 = new GArray([t2b, t2a, t2c]);
  
  var obj = {
    a : [l1, l2], 
    b : "test",
    c : [1, 8, 9, 10],
    d : ["d", "e", "g", "t"]
  };
  
  obj.fromSTRUCT = function(unpacker) {
    var obj3 = {};
    unpacker(obj3);
    
    return obj3;
  }
  obj.STRUCT = test_struct_str;
  
  var obj2 = {
    b : "sdfsdf",
    c : 1
  };
  
  obj2.STRUCT = test_struct_str2;
  obj2.fromSTRUCT = function(unpacker) {
    var obj3 = {};
    unpacker(obj3);
    
    return obj3;
  }
  
  obj.name = "Test";
  obj2.name = "Test2";
  
  obj.constructor = {name : "Test"};
  obj2.constructor = {name : "Test2"};
  
  var data = [];
  istruct.add_struct(obj);
  istruct.add_struct(obj2);
  istruct.write_struct(data, obj, stt);
  
  data = new DataView(new Uint8Array(data).buffer);
  
  obj = istruct.read_object(data, obj);
  
  var m = makeBoxMesh(null);
  var data = [];
  istruct.write_object(data, m);
  
  data = new DataView(new Uint8Array(data).buffer);
  m = istruct.read_object(data, Mesh);
}
create_test(test_struct);

function init_struct_packer() {
  global defined_classes, istruct;
  
  console.log("parsing class serialization scripts...");
  
  istruct = new STRUCT();
  
  for (var cls in defined_classes) {
    try {
      if (cls.STRUCT != undefined && cls.fromSTRUCT != undefined) {
        istruct.add_struct(cls);
      }
    } catch (err) {
      if (err instanceof PUTLParseError) {
        console.log("cls.name: ", cls.name)
        print_stack(err);
        console.log("Error parsing struct: " + err.message);
      } else {
        print_stack(err);
        throw err;
      }
    }    
  }
}

function gen_struct_str() {
  var buf = ""
  for (var k in istruct.structs) {
    buf += STRUCT.fmt_struct(istruct.structs[k], false, true) + "\n";
  }
  
  //strip out leading whitespace from lines
  var buf2 = buf;
  buf = "";
  
  for (var i=0; i<buf2.length; i++) {
    var c = buf2[i];
    
    if (c == "\n") {
      buf += "\n"
      var i2 = i;
      
      while (i < buf2.length && (buf2[i] == " " || buf2[i] == "\t" || buf2[i] == "\n")) {
        i++;
      }
      
      if (i != i2) i--;
    } else {
      buf += c;
    }
  } 

  return buf;
}

//stub type
class JSONType {
}

function JSOB(obj) {
  obj.__proto__ = JSONType.prototype;
  obj.constructor = JSONType;
  
  return obj;
}

class StaticString extends String {
  constructor(s, maxlength) {
    if (s.length > maxlength)
      s = s.slice(0, maxlength);
      
    String.call(this, s);
  }
}

var _basic_types = {
  "StaticString" : "static_string",
  "String" : "string",
  "Number" : "number",
  "Vec2" : "vec2",
  "Vec3" : "vec3",
  "Vec4" : "vec4",
  "Matrix4" : "mat4",
  "number" : "number",
  "string" : "string",
};

class SchemaError extends Error {
  constructor(msg) {
    Error.call(this, msg);
    this.msg = msg;
  }
}

//calc_subschema is optional, defaults to false
function gen_schema(obj, calc_subschema) {
  if (calc_subschema == undefined)
    calc_subschema = false;
    
  var s = {};
  
  if (obj == undefined) {
    throw new Error("Undefined not allowed");
  }
  
  if (btypeof(obj) in _basic_types) {
    s["type"] = _basic_types[btypeof(obj)];
    return s;
  } else if (obj.__class__ in _basic_types) {
    s["type"] = _basic_types[obj.__class__];
    return s
  }
  
  if ((obj instanceof Array) || (obj instanceof GArray)) {
    s.type = "array";
    if (obj.length == 0) {
      if ("s_array_type" in obj)
        s.subtype = obj.s_array_type;
      else
        s.subtype = "null";
    } else {
      var type = "s_array_type" in obj ? obj.s_array_type : undefined;
      
      for (var i=0; i<obj.length; i++) {
        var t2 = gen_schema(obj[i]);
        
        /*
        var t2 = {type : t3.type}
        if ("name" in t3)
          t2.name= t3.name
        if ("subtype" in t3)
          t2.subtype = t3.subtype;
        // */
        
        if (type == undefined)
          type = t2;
        
        /*
        if (t2 != type) {
          var is_num = t2 == "number" || t2 == "int32";
          is_num = is_num && (type == "number" || type == "int32");
          
          if (!is_num) 
            throw new Error("Array objects must be of same type");
        }
        */
      }
      
      s.subtype = type;
    }
  } else if (is_obj_lit(obj)) {
    s["type"] = "object";
    
    var fields = [];
    for (var k in obj) {
      if (k == "constructor" || k == "prototype" || k == "__proto__")
        continue;
      
      fields.push([k, gen_schema(obj[k])]);
    }
    
    s["fields"] = fields;
  } else {
    s["type"] = "schema_object";
    s["name"] = obj.__class__;
  }
  
  return s;
}

var SchmTypes = {
  BYTE : 0,
  INT : 1,
  FLOAT : 2,
  DOUBLE : 3,
  STRING : 4,
  FIXEDSTRING : 5,
  ARRAY : 6,
  VEC2 : 7,
  VEC3 : 8,
  VEC4 : 9,
  MAT4 : 10,
  COLOR : 11,
  DATAREF : 12,
  OBJECT : 13,
};


function time_packers() {
  var mesh = makeBoxMesh();
  
  var tot=1000;
  
  var av=0;
  var arr = [];
  
  mesh.pack(arr);
  var tarr = new Array(tot);
  
  for (var i=0; i<tot; i++) {
    arr.length = 0;
    var start = time_ms();
    mesh.pack(arr);
    var end = time_ms();
    
    av += end-start;
    tarr[i] = end-start;
  }
  tarr.sort();
  
  tot = 200;
  tarr = new Array(tot);
  var ist = istruct;
  
  for (var i=0; i<tot; i++) {
    arr.length = 0;
    var start = time_ms();
    ist.write_object(arr, mesh);
    var end = time_ms();
    
    tarr[i] = end-start;
  }
}

function profile_schema() {
  var mesh = makeBoxMesh();

  var tot = 10000;
  var av=0;
  var arr = [];
  
  var tarr = new Array(tot);
  
  tarr = new Array(tot);
  var ist = istruct;
  
  var lastt = time_ms();
  for (var i=0; i<tot; i++) {
  
    if (time_ms() - lastt > 900) {
      lastt = time_ms();
      console.log(i, " of ", tot);
    }
    
    arr.length = 0;
    var start = time_ms();
    ist.write_object(arr, mesh);
    var end = time_ms();
    
    tarr[i] = end-start;
  }
  
  console.log("schema result: ", tarr[tot/2]);
}
