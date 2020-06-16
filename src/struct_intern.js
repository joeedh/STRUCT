"use strict";
let struct_util = require("./struct_util");
let struct_binpack = require("./struct_binpack");
let struct_parseutil = require("./struct_parseutil");
let struct_typesystem = require("./struct_typesystem");
let struct_parser = require("./struct_parser");

let sintern2 = require("./struct_intern2.js");
let StructFieldTypeMap = sintern2.StructFieldTypeMap;

let warninglvl = 2;

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

var _static_envcode_null = "";
var debug_struct = 0;
var packdebug_tablevel = 0;

function gen_tabstr(tot) {
  var ret = "";

  for (var i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

let packer_debug, packer_debug_start, packer_debug_end;

if (debug_struct) {
  packer_debug = function (msg) {
    if (msg !== undefined) {
      var t = gen_tabstr(packdebug_tablevel);
      console.log(t + msg);
    } else {
      console.log("Warning: undefined msg");
    }
  };
  packer_debug_start = function (funcname) {
    packer_debug("Start " + funcname);
    packdebug_tablevel++;
  };

  packer_debug_end = function (funcname) {
    packdebug_tablevel--;
    packer_debug("Leave " + funcname);
  };
}
else {
  packer_debug = function () {
  };
  packer_debug_start = function () {
  };
  packer_debug_end = function () {
  };
}


exports.setWarningMode = (t) => {
  sintern2.setWarningMode(t);
  
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl = t;
}

exports.setDebugMode = (t) => {
  debug_struct = t;

  sintern2.setDebugMode(t);
  
  if (debug_struct) {
    packer_debug = function (msg) {
      if (msg != undefined) {
        var t = gen_tabstr(packdebug_tablevel);
        console.log(t + msg);
      } else {
        console.log("Warning: undefined msg");
      }
    };
    packer_debug_start = function (funcname) {
      packer_debug("Start " + funcname);
      packdebug_tablevel++;
    };

    packer_debug_end = function (funcname) {
      packdebug_tablevel--;
      packer_debug("Leave " + funcname);
    };
  }
  else {
    packer_debug = function () {
    };
    packer_debug_start = function () {
    };
    packer_debug_end = function () {
    };
  }
}

var _ws_env = [[undefined, undefined]];

function do_pack(data, val, obj, thestruct, field, type) {
  StructFieldTypeMap[field.type.type].pack(manager, data, val, obj, field, type);
}

function define_empty_class(name) {
  var cls = function () {
  };

  cls.prototype = Object.create(Object.prototype);
  cls.constructor = cls.prototype.constructor = cls;

  cls.STRUCT = name + " {\n  }\n";
  cls.structName = name;

  cls.prototype.loadSTRUCT = function (reader) {
    reader(this);
  }

  cls.newSTRUCT = function () {
    return new this();
  }

  return cls;
}

var STRUCT = exports.STRUCT = class STRUCT {
  constructor() {
    this.idgen = new struct_util.IDGen();

    this.structs = {}
    this.struct_cls = {}
    this.struct_ids = {}

    this.compiled_code = {}
    this.null_natives = {}

    function define_null_native(name, cls) {
      var obj = define_empty_class(name);

      var stt = struct_parse.parse(obj.STRUCT);

      stt.id = this.idgen.gen_id();

      this.structs[name] = stt;
      this.struct_cls[name] = cls;
      this.struct_ids[stt.id] = stt;

      this.null_natives[name] = 1;
    }

    define_null_native.call(this, "Object", Object);
  }

  forEach(func, thisvar) {
    for (var k in this.structs) {
      var stt = this.structs[k];

      if (thisvar != undefined)
        func.call(thisvar, stt);
      else
        func(stt);
    }
  }

  //defined_classes is an array of class constructors
  //with STRUCT scripts, *OR* another STRUCT instance
  //
  //defaults to structjs.manager
  parse_structs(buf, defined_classes) {
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

    var clsmap = {}

    for (var i = 0; i < defined_classes.length; i++) {
      var cls = defined_classes[i];

      if (cls.structName == undefined && cls.STRUCT != undefined) {
        var stt = struct_parse.parse(cls.STRUCT.trim());
        cls.structName = stt.name;
      } else if (cls.structName == undefined && cls.name != "Object") {
        if (warninglvl > 0) 
          console.log("Warning, bad class in registered class list", cls.name, cls);
        continue;
      }

      clsmap[cls.structName] = defined_classes[i];
    }

    struct_parse.input(buf);

    while (!struct_parse.at_end()) {
      var stt = struct_parse.parse(undefined, false);

      if (!(stt.name in clsmap)) {
        if (!(stt.name in this.null_natives))
        if (warninglvl > 0) 
          console.log("WARNING: struct " + stt.name + " is missing from class list.");

        var dummy = define_empty_class(stt.name);

        dummy.STRUCT = STRUCT.fmt_struct(stt);
        dummy.structName = stt.name;

        dummy.prototype.structName = dummy.name;

        this.struct_cls[dummy.structName] = dummy;
        this.structs[dummy.structName] = stt;

        if (stt.id != -1)
          this.struct_ids[stt.id] = stt;
      } else {
        this.struct_cls[stt.name] = clsmap[stt.name];
        this.structs[stt.name] = stt;

        if (stt.id != -1)
          this.struct_ids[stt.id] = stt;
      }

      var tok = struct_parse.peek();
      while (tok != undefined && (tok.value == "\n" || tok.value == "\r" || tok.value == "\t" || tok.value == " ")) {
        tok = struct_parse.peek();
      }
    }
  }

  register(cls, structName) {
    return this.add_class(cls, structName);
  }

  add_class(cls, structName) {
    if (cls.STRUCT) {
      let bad = false;
      
      let p = cls;
      while (p) {
        p = p.__proto__;
        
        if (p && p.STRUCT && p.STRUCT === cls.STRUCT) {
          bad = true;
          break;
        }
      }
      
      if (bad) {
        console.warn("Generating STRUCT script for derived class " + cls.name);
        if (!structName) {
          structName = cls.name;
        }
        
        cls.STRUCT = STRUCT.inherit(cls, p) + `\n}`;
      }
    }
    
    if (!cls.STRUCT) {
      throw new Error("class " + cls.name + " has no STRUCT script");
    }

    var stt = struct_parse.parse(cls.STRUCT);

    cls.structName = stt.name;

    //create default newSTRUCT
    if (cls.newSTRUCT === undefined) {
      cls.newSTRUCT = function () {
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

    if (stt.id == -1)
      stt.id = this.idgen.gen_id();

    this.structs[cls.structName] = stt;
    this.struct_cls[cls.structName] = cls;
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

  static inherit(child, parent, structName = child.name) {
    if (!parent.STRUCT) {
      return structName + "{\n";
    }

    var stt = struct_parse.parse(parent.STRUCT);
    var code = structName + "{\n";
    code += STRUCT.fmt_struct(stt, true);
    return code;
  }

  /** invoke loadSTRUCT methods on parent objects.  note that
   reader() is only called once.  it is called however.*/
  static Super(obj, reader) {
    if (warninglvl > 0) 
      console.warn("deprecated");

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
  }

  /** deprecated.  used with old fromSTRUCT interface. */
  static chain_fromSTRUCT(cls, reader) {
    if (warninglvl > 0) 
      console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");

    var proto = cls.prototype;
    var parent = cls.prototype.prototype.constructor;

    var obj = parent.fromSTRUCT(reader);
    let obj2 = new cls();

    let keys = Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
    //var keys=Object.keys(proto);

    for (var i = 0; i < keys.length; i++) {
      let k = keys[i];

      try {
        obj2[k] = obj[k];
      } catch (error) {
        if (warninglvl > 0) 
          console.warn("  failed to set property", k);
      }
      //var k=keys[i];
      //if (k=="__proto__")
      // continue;
      //obj[k] = proto[k];
    }

    /*
    if (proto.toString !== Object.prototype.toString)
      obj2.toString = proto.toString;
    //*/

    return obj2;
  }

  static formatStruct(stt, internal_only, no_helper_js) {
    return this.fmt_struct(stt, internal_only, no_helper_js);
  }

  static fmt_struct(stt, internal_only, no_helper_js) {
    if (internal_only == undefined)
      internal_only = false;
    if (no_helper_js == undefined)
      no_helper_js = false;

    var s = "";
    if (!internal_only) {
      s += stt.name;
      if (stt.id != -1)
        s += " id=" + stt.id;
      s += " {\n";
    }
    var tab = "  ";

    function fmt_type(type) {
      return StructFieldTypeMap[type.type].format(type);
      
      if (type.type == StructEnum.T_ARRAY || type.type == StructEnum.T_ITER || type.type === StructEnum.T_ITERKEYS) {
        if (type.data.iname != "" && type.data.iname != undefined) {
          return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
        }
        else {
          return "array(" + fmt_type(type.data.type) + ")";
        }
      } else if (type.type == StructEnum.T_STATIC_STRING) {
        return "static_string[" + type.data.maxlength + "]";
      } else if (type.type == StructEnum.T_STRUCT) {
        return type.data;
      } else if (type.type == StructEnum.T_TSTRUCT) {
        return "abstract(" + type.data + ")";
      } else {
        return StructTypeMap[type.type];
      }
    }

    var fields = stt.fields;
    for (var i = 0; i < fields.length; i++) {
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
    if (env != undefined) {
      envcode = "";
      for (var i = 0; i < env.length; i++) {
        envcode = "var " + env[i][0] + " = env[" + i.toString() + "][1];\n" + envcode;
      }
    }
    var fullcode = "";
    if (envcode !== _static_envcode_null)
      fullcode = envcode + code;
    else
      fullcode = code;
    var func;

    //fullcode = fullcode.replace(/\bthis\b/, "obj");

    if (!(fullcode in this.compiled_code)) {
      var code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      try {
        func = _structEval(code2);
      }
      catch (err) {
        struct_util.print_stack(err);

        console.log(code2);
        console.log(" ");
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
      struct_util.print_stack(err);

      var code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      console.log(code2);
      console.log(" ");
      throw err;
    }
  }

  write_struct(data, obj, stt) {
    function use_helper_js(field) {
      if (field.type.type == StructEnum.T_ARRAY || field.type.type == StructEnum.T_ITER || field.type.type == StructEnum.T_ITERKEYS) {
        return field.type.data.iname == undefined || field.type.data.iname == "";
      }
      return true;
    }

    var fields = stt.fields;
    var thestruct = this;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var t1 = f.type;
      var t2 = t1.type;

      if (use_helper_js(f)) {
        var val;
        var type = t2;
        if (f.get != undefined) {
          val = thestruct._env_call(f.get, obj);
        }
        else {
          val = obj[f.name];
        }
        do_pack(data, val, obj, thestruct, f, t1);
      }
      else {
        var val = obj[f.name];
        do_pack(data, val, obj, thestruct, f, t1);
      }
    }
  }

  /**
  @param data : array to write data into,
  @param obj  : structable object
  */
  write_object(data, obj) {
    var cls = obj.constructor.structName;
    var stt = this.get_struct(cls);

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
  @return {cls_or_struct_id} Instance of cls_or_struct_id
  */
  readObject(data, cls_or_struct_id, uctx) {
    return this.read_object(data, cls_or_struct_id, uctx);
  }
  
  /**
  @param data array to write data into,
  @param obj structable object
  */
  writeObject() {
    return this.write_object(data, obj);
  }

  /**
  @param data : DataView or Uint8Array instance
  @param cls_or_struct_id : Structable class
  @param uctx : internal parameter
  */
  read_object(data, cls_or_struct_id, uctx) {
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

    stt = this.structs[cls.structName];

    if (uctx == undefined) {
      uctx = new struct_binpack.unpack_context();

      packer_debug("\n\n=Begin reading " + cls.structName + "=");
    }
    var thestruct = this;

    let this2  = this;
    function unpack_field(type) {
      return StructFieldTypeMap[type.type].unpack(this2, data, type, uctx);
    }

    let was_run = false;

    function load(obj) {
      if (was_run) {
        return;
      }

      was_run = true;

      var fields = stt.fields;
      var flen = fields.length;
      for (var i = 0; i < flen; i++) {
        var f = fields[i];
        var val = unpack_field(f.type);
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
      if (warninglvl > 1) 
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
}

//main struct script manager
var manager = exports.manager = new STRUCT();

/**
 * Write all defined structs out to a string.
 *
 * @param manager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
var write_scripts = exports.write_scripts = function write_scripts(manager, include_code = false) {
  if (manager === undefined)
    manager = exports.manager;

  var buf = "";

  manager.forEach(function (stt) {
    buf += STRUCT.fmt_struct(stt, false, !include_code) + "\n";
  });

  var buf2 = buf;
  buf = "";

  for (var i = 0; i < buf2.length; i++) {
    var c = buf2[i];
    if (c === "\n") {
      buf += "\n";
      var i2 = i;
      while (i < buf2.length && (buf2[i] === " " || buf2[i] === "\t" || buf2[i] === "\n")) {
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
