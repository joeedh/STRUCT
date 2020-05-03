define([
  "struct_util", "struct_binpack", "struct_parseutil", "struct_typesystem", "struct_parser"
], function(struct_util, struct_binpack, struct_parseutil, struct_typesystem, struct_parser) {
  "use strict";

  var exports = {};
  
  /*
  
  class SomeClass {
    static newSTRUCT() {
      //returns a new, empty instance of SomeClass
    }
    
    loadSTRUCT(reader) {
      reader(this); //reads data into this instance
    }
    
    //the old api, that both creates and reads
    static fromSTRUCT(reader) {
      let ret = new SomeClass();
      reader(ret);
      return ret;
    }
  }
  SomeClass.STRUCT = `
  SomeClass {
  }
  `
  nstructjs.manager.add_class(SomeClass);
  
  */
  var StructTypeMap = struct_parser.StructTypeMap;
  var StructTypes = struct_parser.StructTypes;
  var Class = struct_typesystem.Class;
  
  var struct_parse = struct_parser.struct_parse;
  var StructEnum = struct_parser.StructEnum;
  
  var _static_envcode_null="";
  var debug_struct=0;
  var packdebug_tablevel=0;
  
  function gen_tabstr(tot) {
    var ret = "";
    
    for (var i=0; i<tot; i++) {
      ret += " ";
    }
    
    return ret;
  }
  
  if (debug_struct) {
      var packer_debug=function(msg) {
        if (msg!=undefined) {
            var t=gen_tabstr(packdebug_tablevel);
            console.log(t+msg);
        } else {
          console.log("Warning: undefined msg");
        }
      };
      var packer_debug_start=function(funcname) {
        packer_debug("Start "+funcname);
        packdebug_tablevel++;
      };
      
      var packer_debug_end=function(funcname) {
        packdebug_tablevel--;
        packer_debug("Leave "+funcname);
      };
  }
  else {
    var packer_debug=function() {};
    var packer_debug_start=function() {};
    var packer_debug_end=function() {};
  }
  
  var _ws_env=[[undefined, undefined]];
  
  var pack_callbacks=[
  function pack_int(data, val) {
    packer_debug("int "+val);
    
    struct_binpack.pack_int(data, val);
  }, function pack_float(data, val) {
    packer_debug("float "+val);
    
    struct_binpack.pack_float(data, val);
  }, function pack_double(data, val) {
    packer_debug("double "+val);
    
    struct_binpack.pack_double(data, val);
  }, 0, 0, 0, 0,
  function pack_string(data, val) {
    if (val==undefined)
      val = "";
    packer_debug("string: "+val);
    packer_debug("int "+val.length);
    
    struct_binpack.pack_string(data, val);
  }, function pack_static_string(data, val, obj, thestruct, field, type) {
    if (val==undefined)
      val = "";
    packer_debug("static_string: '"+val+"' length="+type.data.maxlength);
    
    struct_binpack.pack_static_string(data, val, type.data.maxlength);
  }, function pack_struct(data, val, obj, thestruct, field, type) {
    packer_debug_start("struct "+type.data);
    
    thestruct.write_struct(data, val, thestruct.get_struct(type.data));
    
    packer_debug_end("struct");
  }, function pack_tstruct(data, val, obj, thestruct, field, type) {
    var cls=thestruct.get_struct_cls(type.data);
    var stt=thestruct.get_struct(type.data);
    
    //make sure inheritance is correct
    if (val.constructor.structName!=type.data && (val instanceof cls)) {
        //if (DEBUG.Struct) {
        //    console.log(val.constructor.structName+" inherits from "+cls.structName);
        //}
        stt = thestruct.get_struct(val.constructor.structName);
    } else if (val.constructor.structName==type.data) {
        stt = thestruct.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct "+val.constructor.structName+" passed to write_struct");
    }
    
    if (stt.id==0) {
    }
    
    packer_debug_start("tstruct '"+stt.name+"'");
    packer_debug("int "+stt.id);
    
    struct_binpack.pack_int(data, stt.id);
    thestruct.write_struct(data, val, stt);
    
    packer_debug_end("tstruct");
  }, function pack_array(data, val, obj, thestruct, field, type) {
    packer_debug_start("array");
    
    if (val==undefined) {
        console.trace();
        console.log("Undefined array fed to struct struct packer!");
        console.log("Field: ", field);
        console.log("Type: ", type);
        console.log("");
        packer_debug("int 0");
        struct_binpack.pack_int(data, 0);
        return ;
    }
    
    packer_debug("int "+val.length);
    struct_binpack.pack_int(data, val.length);
    
    var d=type.data;
    
    var itername = d.iname;
    var type2 = d.type;
    
    var env=_ws_env;
    for (var i=0; i<val.length; i++) {
        var val2=val[i];
        if (itername!=""&&itername!=undefined&&field.get) {
            env[0][0] = itername;
            env[0][1] = val2;
            val2 = thestruct._env_call(field.get, obj, env);
        }
        var f2={type: type2, get: undefined, set: undefined};
        do_pack(data, val2, obj, thestruct, f2, type2);
    }
    packer_debug_end("array");
  }, function pack_iter(data, val, obj, thestruct, field, type) {
    //this was originally implemented to use ES6 iterators.
    
    packer_debug_start("iter");
    
    if (val==undefined || val.forEach == undefined) {
        console.trace();
        console.log("Undefined iterable list fed to struct struct packer!", val);
        console.log("Field: ", field);
        console.log("Type: ", type);
        console.log("");
        packer_debug("int 0");
        struct_binpack.pack_int(data, 0);
        return ;
    }
    
    var len  = 0.0;
    val.forEach(function(val2) {
      len++;
    }, this);
    
    packer_debug("int "+len);
    struct_binpack.pack_int(data, len);
    
    var d=type.data, itername=d.iname, type2=d.type;
    var env=_ws_env;
    
    var i = 0;
    val.forEach(function(val2) {
      if (i >= len) {
        console.trace("Warning: iterator returned different length of list!", val, i);
        return;
      }
      
      if (itername!=""&&itername!=undefined&&field.get) {
          env[0][0] = itername;
          env[0][1] = val2;
          val2 = thestruct._env_call(field.get, obj, env);
      }
      
      var f2={type: type2, get: undefined, set: undefined};
      do_pack(data, val2, obj, thestruct, f2, type2);
      
      i++;
    }, this);
    
    packer_debug_end("iter");
  }, function pack_short(data, val) {
    packer_debug("short "+val);
    
    struct_binpack.pack_short(data, Math.floor(val));
  }, function pack_byte(data, val) {
    packer_debug("byte "+val);
    
    struct_binpack.pack_byte(data, Math.floor(val));
  }, function pack_bool(data, val) {
    packer_debug("bool "+val);
    
    struct_binpack.pack_byte(data, !!val);
  }];
  
  function do_pack(data, val, obj, thestruct, field, type) {
    pack_callbacks[field.type.type](data, val, obj, thestruct, field, type);
  
  }
  
  function define_empty_class(name) {
    var cls = function() {
    };
    
    cls.prototype = Object.create(Object.prototype);
    cls.constructor = cls.prototype.constructor = cls;
    
    cls.STRUCT = name+" {\n  }\n";
    cls.structName = name;
    
    cls.prototype.loadSTRUCT = function (reader) {
      reader(this);
    }
    
    cls.newSTRUCT = function() {
      return new this();
    }
    
    return cls;
  }
      
  var STRUCT=exports.STRUCT = Class([
    function constructor() {
      this.idgen = new struct_util.IDGen();

      this.structs = {}
      this.struct_cls = {}
      this.struct_ids = {}

      this.compiled_code = {}
      this.null_natives = {}
    
      function define_null_native(name, cls) {
        var obj = define_empty_class(name);
        
        var stt=struct_parse.parse(obj.STRUCT);
        
        stt.id = this.idgen.gen_id();
        
        this.structs[name] = stt;
        this.struct_cls[name] = cls;
        this.struct_ids[stt.id] = stt;
        
        this.null_natives[name] = 1;
      }
      
      define_null_native.call(this, "Object", Object);
    }, 
    
    function forEach(func, thisvar) {
      for (var k in this.structs) {
        var stt = this.structs[k];
        
        if (thisvar != undefined)
          func.call(thisvar, stt);
        else
          func(stt);
      }
    },
    
    //defined_classes is an array of class constructors
    //with STRUCT scripts, *OR* another STRUCT instance
    //
    //defaults to structjs.manager
    function parse_structs(buf, defined_classes) {
      if (defined_classes === undefined) {
        defined_classes = exports.manager;
      }
      
      if (defined_classes instanceof STRUCT) {
        var struct2 = defined_classes;
        defined_classes = [];
        
        for (var k in struct2.struct_cls) {
          defined_classes.push(struct2.struct_cls[k]);
        }
      }
      
      if (defined_classes == undefined) {
        defined_classes = [];
        for (var k in exports.manager.struct_cls) {
          defined_classes.push(exports.manager.struct_cls[k]);
        }
      }
      
      var clsmap={}
      
      for (var i=0; i<defined_classes.length; i++) {
        var cls = defined_classes[i];
        
        if (cls.structName == undefined && cls.STRUCT != undefined) {
          var stt=struct_parse.parse(cls.STRUCT.trim());
          cls.structName = stt.name;
        } else if (cls.structName == undefined && cls.name != "Object") {
          console.log("Warning, bad class in registered class list", cls.name, cls);
          continue;
        }
        
        clsmap[cls.structName] = defined_classes[i];
      }
      
      struct_parse.input(buf);
      
      while (!struct_parse.at_end()) {
        var stt=struct_parse.parse(undefined, false);
        
        if (!(stt.name in clsmap)) {
            if (!(stt.name in this.null_natives))
              console.log("WARNING: struct "+stt.name+" is missing from class list.");

            var dummy = define_empty_class(stt.name);
            
            dummy.STRUCT = STRUCT.fmt_struct(stt);
            dummy.structName = stt.name;
            
            dummy.prototype.structName = dummy.name;
            
            this.struct_cls[dummy.structName] = dummy;
            this.structs[dummy.structName] = stt;
            
            if (stt.id!=-1)
              this.struct_ids[stt.id] = stt;
        } else {
          this.struct_cls[stt.name] = clsmap[stt.name];
          this.structs[stt.name] = stt;
          
          if (stt.id!=-1)
            this.struct_ids[stt.id] = stt;
        }
        
        var tok=struct_parse.peek();
        while (tok!=undefined&&(tok.value=="\n" || tok.value=="\r" || tok.value=="\t" || tok.value==" ")) {
          tok = struct_parse.peek();
        }
      }
    },

    function register(cls, structName) {
      return this.add_class(cls, structName);
    },
    
    function add_class(cls, structName) {
      if (!cls.STRUCT) {
        throw new Error("class " + cls.name + " has no STRUCT script");
      }
      
      var stt=struct_parse.parse(cls.STRUCT);
      
      cls.structName = stt.name;
      
      //create default newSTRUCT
      if (cls.newSTRUCT === undefined) {
        cls.newSTRUCT = function() {
          return new this();
        }
      }
      
      if (structName !== undefined) {
        stt.name = cls.structName = structName;
      } else if (cls.structName === undefined) {
        cls.structName = stt.name;
      } else if (cls.structName !== undefined) {
        stt.name = cls.structName;
      } else {
        throw new Error("Missing structName parameter");
      }
      
      if (stt.id==-1)
        stt.id = this.idgen.gen_id();
        
      this.structs[cls.structName] = stt;
      this.struct_cls[cls.structName] = cls;
      this.struct_ids[stt.id] = stt;
    },

    function get_struct_id(id) {
      return this.struct_ids[id];
    },

    function get_struct(name) {
      if (!(name in this.structs)) {
          console.trace();
          throw new Error("Unknown struct "+name);
      }
      return this.structs[name];
    },

    function get_struct_cls(name) {
      if (!(name in this.struct_cls)) {
          console.trace();
          throw new Error("Unknown struct "+name);
      }
      return this.struct_cls[name];
    },

    Class.static_method(function inherit(child, parent, structName=child.name) {
      if (!parent.STRUCT) {
        return structName+"{\n";
      }
      
      var stt=struct_parse.parse(parent.STRUCT);
      var code=structName+"{\n";
      code+=STRUCT.fmt_struct(stt, true);
      return code;
    }),
    
    /** invoke loadSTRUCT methods on parent objects.  note that 
      reader() is only called once.  it is called however.*/
    Class.static_method(function Super(obj, reader) {
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
    }),
    
    /** deprecated.  used with old fromSTRUCT interface. */
    Class.static_method(function chain_fromSTRUCT(cls, reader) {
      var proto=cls.prototype;
      var parent=cls.prototype.prototype.constructor;
      
      var obj=parent.fromSTRUCT(reader);
      var keys=Object.keys(proto);
      
      for (var i=0; i<keys.length; i++) {
          var k=keys[i];
          if (k=="__proto__")
            continue;
          obj[k] = proto[k];
      }
      
      if (proto.toString!=Object.prototype.toString)
        obj.toString = proto.toString;
        
      return obj;
    }),

    Class.static_method(function fmt_struct(stt, internal_only, no_helper_js) {
      if (internal_only==undefined)
        internal_only = false;
      if (no_helper_js==undefined)
        no_helper_js = false;
        
      var s="";
      if (!internal_only) {
          s+=stt.name;
          if (stt.id!=-1)
            s+=" id="+stt.id;
          s+=" {\n";
      }
      var tab="  ";
      function fmt_type(type) {
        if (type.type==StructEnum.T_ARRAY||type.type==StructEnum.T_ITER) {
            if (type.data.iname!=""&&type.data.iname!=undefined) {
                return "array("+type.data.iname+", "+fmt_type(type.data.type)+")";
            }
            else {
              return "array("+fmt_type(type.data.type)+")";
            }
        } else  if (type.type==StructEnum.T_STATIC_STRING) {
            return "static_string["+type.data.maxlength+"]";
        } else if (type.type==StructEnum.T_STRUCT) {
            return type.data;
        } else if (type.type==StructEnum.T_TSTRUCT) {
            return "abstract("+type.data+")";
        } else {
          return StructTypeMap[type.type];
        }
      }
      
      var fields=stt.fields;
      for (var i=0; i<fields.length; i++) {
          var f=fields[i];
          s += tab + f.name+" : "+fmt_type(f.type);
          if (!no_helper_js&&f.get!=undefined) {
              s += " | "+f.get.trim();
          }
          s+=";\n";
      }
      if (!internal_only)
        s+="}";
      return s;
    }),

    function _env_call(code, obj, env) {
      var envcode=_static_envcode_null;
      if (env!=undefined) {
          envcode = "";
          for (var i=0; i<env.length; i++) {
              envcode = "var "+env[i][0]+" = env["+i.toString()+"][1];\n"+envcode;
          }
      }
      var fullcode="";
      if (envcode!==_static_envcode_null)
        fullcode = envcode+code;
      else 
        fullcode = code;
      var func;
      if (!(fullcode in this.compiled_code)) {
          var code2="func = function(obj, env) { "+envcode+"return "+code+"}";
          try {
            eval(code2);
          }
          catch (err) {
              console.log(code2);
              console.log(" ");
              print_stack(err);
              throw err;
          }
          this.compiled_code[fullcode] = func;
      }
      else {
        func = this.compiled_code[fullcode];
      }
      try {
        return func(obj, env);
      }
      catch (err) {
          var code2="func = function(obj, env) { "+envcode+"return "+code+"}";
          console.log(code2);
          console.log(" ");
          print_stack(err);
          throw err;
      }
    },
    
    function write_struct(data, obj, stt) {
      function use_helper_js(field) {
        if (field.type.type==StructEnum.T_ARRAY||field.type.type==StructEnum.T_ITER) {
            return field.type.data.iname==undefined||field.type.data.iname=="";
        }
        return true;
      }
      
      var fields=stt.fields;
      var thestruct=this;
      for (var i=0; i<fields.length; i++) {
          var f=fields[i];
          var t1=f.type;
          var t2=t1.type;
          
          if (use_helper_js(f)) {
              var val;
              var type=t2;
              if (f.get!=undefined) {
                  val = thestruct._env_call(f.get, obj);
              }
              else {
                val = obj[f.name];
              }
              do_pack(data, val, obj, thestruct, f, t1);
          }
          else {
            var val=obj[f.name];
            do_pack(data, val, obj, thestruct, f, t1);
          }
      }
    },

   function write_object(data, obj) {
      var cls=obj.constructor.structName;
      var stt=this.get_struct(cls);
      
      this.write_struct(data, obj, stt);
    },

    function read_object(data, cls_or_struct_id, uctx) {
      var cls, stt;
      
      if (data instanceof Array) {
        data = new DataView(new Uint8Array(data).buffer);
      }
      
      if (typeof cls_or_struct_id == "number") {
        cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
      } else {
        cls = cls_or_struct_id;
      }
      
      if (cls === undefined) {
        throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
      }
      
      stt=this.structs[cls.structName];
      
      if (uctx==undefined) {
        uctx = new struct_binpack.unpack_context();
        packer_debug("\n\n=Begin reading=");
      }
      var thestruct=this;
      
      var unpack_funcs=[
        function t_int(type) { //int
          var ret=struct_binpack.unpack_int(data, uctx);
          
          packer_debug("-int "+ret);
          
          return ret;
        }, function t_float(type) {
          var ret=struct_binpack.unpack_float(data, uctx);
          
          packer_debug("-float "+ret);
          
          return ret;
        }, function t_double(type) {
          var ret=struct_binpack.unpack_double(data, uctx);
          
          packer_debug("-double "+ret);
          
          return ret;
        }, 0, 0, 0, 0, 
        function t_string(type) {
          packer_debug_start("string");
          
          var s=struct_binpack.unpack_string(data, uctx);
          
          packer_debug("data: '"+s+"'");
          packer_debug_end("string");
          return s;
        }, function t_static_string(type) {
          packer_debug_start("static_string");
          
          var s=struct_binpack.unpack_static_string(data, uctx, type.data.maxlength);
          
          packer_debug("data: '"+s+"'");
          packer_debug_end("static_string");
          
          return s;
        }, function t_struct(type) {
          packer_debug_start("struct "+type.data);
          
          var cls2=thestruct.get_struct_cls(type.data);
          var ret=thestruct.read_object(data, cls2, uctx);
          
          packer_debug_end("struct");
          return ret;
        }, function t_tstruct(type) {
          packer_debug_start("tstruct");
          
          var id=struct_binpack.unpack_int(data, uctx);
          
          packer_debug("-int "+id);
          if (!(id in thestruct.struct_ids)) {
              packer_debug("struct id: "+id);
              console.trace();
              console.log(id);
              console.log(thestruct.struct_ids);
              packer_debug_end("tstruct");
              throw new Error("Unknown struct type "+id+".");
          }
          
          var cls2=thestruct.get_struct_id(id);
          
          packer_debug("struct name: "+cls2.name);
          cls2 = thestruct.struct_cls[cls2.name];
          
          var ret=thestruct.read_object(data, cls2, uctx);
          
          packer_debug_end("tstruct");
          return ret;
        }, function t_array(type) {
          packer_debug_start("array");
          
          var len=struct_binpack.unpack_int(data, uctx);
          packer_debug("-int "+len);
          
          var arr=new Array(len);
          for (var i=0; i<len; i++) {
              arr[i] = unpack_field(type.data.type);
          }
          
          packer_debug_end("array");
          return arr;
        }, function t_iter(type) {
          packer_debug_start("iter");
          
          var len=struct_binpack.unpack_int(data, uctx);
          packer_debug("-int "+len);
          
          var arr=new Array(len);
          for (var i=0; i<len; i++) {
              arr[i] = unpack_field(type.data.type);
          }
          
          packer_debug_end("iter");
          return arr;
        }, function t_short(type) { //int
          var ret=struct_binpack.unpack_short(data, uctx);
          
          packer_debug("-short "+ret);
          
          return ret;
        }, function t_byte(type) {
          var ret=struct_binpack.unpack_byte(data, uctx);
          
          packer_debug("-byte "+ret);
          
          return ret;
        }, function t_bool(type) {
          var ret=struct_binpack.unpack_byte(data, uctx);
          
          packer_debug("-bool "+ret);
          
          return !!ret;
        }          
      ];
      
      function unpack_field(type) {
        return unpack_funcs[type.type](type);
      }
      
      let was_run = false;
      function load(obj) {
        if (was_run) {
          return;
        }
        
        was_run = true;
        
        var fields=stt.fields;
        var flen=fields.length;
        for (var i=0; i<flen; i++) {
            var f=fields[i];
            var val=unpack_field(f.type);
            obj[f.name] = val;
        }
      }
      
      if (cls.prototype.loadSTRUCT !== undefined) {
        let obj;
        
        if (cls.newSTRUCT !== undefined) {
          obj = cls.newSTRUCT();
        } else {
          obj = new cls();
        }
        
        obj.loadSTRUCT(load);
        return obj;
      } else if (cls.fromSTRUCT !== undefined) {
        console.warn("Warning: class " + cls.name + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
        return cls.fromSTRUCT(load);
      } else { //default case, make new instance and then call load() on it
        let obj;
        if (cls.newSTRUCT !== undefined) {
          obj = cls.newSTRUCT();
        } else {
          obj = new cls();
        }
        
        load(obj);
        
        return obj;
      }
    }
  ]);
  
  //main struct script manager
  var manager = exports.manager = new STRUCT();
  
  //manager defaults to structjs.manager
  var write_scripts = exports.write_scripts = function write_scripts(manager) {
    if (manager === undefined)
      manager = exports.manager;
    
    var buf="";
    
    manager.forEach(function(stt) {
      buf+=STRUCT.fmt_struct(stt, false, true)+"\n";
    });
    
    var buf2=buf;
    buf = "";
    
    for (var i=0; i<buf2.length; i++) {
        var c=buf2[i];
        if (c=="\n") {
            buf+="\n";
            var i2=i;
            while (i<buf2.length&&(buf2[i]==" "||buf2[i]=="\t"||buf2[i]=="\n")) {
              i++;
            }
            if (i!=i2)
              i--;
        }
        else {
          buf+=c;
        }
    }
    
    return buf;
  }
  
  return exports;
});
