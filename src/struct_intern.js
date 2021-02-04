"use strict";
let struct_util = require("./struct_util");
let struct_binpack = require("./struct_binpack");
let struct_parseutil = require("./struct_parseutil");
let struct_parser = require("./struct_parser");

let sintern2 = require("./struct_intern2.js");
let StructFieldTypeMap = sintern2.StructFieldTypeMap;

let warninglvl = 2;

function unmangle(name) {
  if (exports.truncateDollarSign) {
    return struct_util.truncateDollarSign(name);
  } else {
    return name;
  }
}

/*

class SomeClass {
  static newSTRUCT() {
    //optional method, returns a new, empty instance of SomeClass
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
let StructTypeMap = struct_parser.StructTypeMap;
let StructTypes = struct_parser.StructTypes;

let struct_parse = struct_parser.struct_parse;
let StructEnum = struct_parser.StructEnum;

let _static_envcode_null = "";
let debug_struct = 0;
let packdebug_tablevel = 0;

//truncate webpack-mangled names
exports.truncateDollarSign = true;

function gen_tabstr(tot) {
  let ret = "";

  for (let i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

let packer_debug, packer_debug_start, packer_debug_end;

if (debug_struct) {
  packer_debug = function (msg) {
    if (msg !== undefined) {
      let t = gen_tabstr(packdebug_tablevel);
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
      if (msg !== undefined) {
        let t = gen_tabstr(packdebug_tablevel);
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

let _ws_env = [[undefined, undefined]];

function do_pack(data, val, obj, thestruct, field, type) {
  StructFieldTypeMap[field.type.type].pack(manager, data, val, obj, field, type);
}

function define_empty_class(name) {
  let cls = function () {
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

let STRUCT = exports.STRUCT = class STRUCT {
  constructor() {
    this.idgen = new struct_util.IDGen();
    this.allowOverriding = true;

    this.structs = {}
    this.struct_cls = {}
    this.struct_ids = {}

    this.compiled_code = {}
    this.null_natives = {}

    function define_null_native(name, cls) {
      let obj = define_empty_class(name);

      let stt = struct_parse.parse(obj.STRUCT);

      stt.id = this.idgen.gen_id();

      this.structs[name] = stt;
      this.struct_cls[name] = cls;
      this.struct_ids[stt.id] = stt;

      this.null_natives[name] = 1;
    }

    define_null_native.call(this, "Object", Object);
  }

  validateStructs(onerror) {
    function getType(type) {
      switch (type.type) {
        case StructEnum.T_ITERKEYS:
        case StructEnum.T_ITER:
        case StructEnum.T_STATIC_ARRAY:
        case StructEnum.T_ARRAY:
          return getType(type.data.type);
        case StructEnum.T_TSTRUCT:
          return type;
        case StructEnum.T_STRUCT:
        default:
          return type;
      }
    }

    function formatType(type) {
      let ret = {};

      ret.type = type.type;

      if (typeof ret.type === "number") {
        for (let k in StructEnum) {
          if (StructEnum[k] === ret.type) {
            ret.type = k;
            break;
          }
        }
      } else if (typeof ret.type === "object") {
        ret.type = formatType(ret.type);
      }

      if (typeof type.data === "object") {
        ret.data = formatType(type.data);
      } else {
        ret.data = type.data;
      }

      return ret;
    }

    function throwError(stt, field, msg) {
      let buf = STRUCT.formatStruct(stt);

      console.error(buf + "\n\n" + msg);

      if (onerror) {
        onerror(msg, stt, field);
      } else {
        throw new Error(msg);
      }
    }

    for (let k in this.structs) {
      let stt = this.structs[k];

      for (let field of stt.fields) {
        if (field.name === "this") {
          let type = field.type.type;

          if (struct_parser.ValueTypes.has(type)) {
            throwError(stt, field, "'this' cannot be used with value types");
          }
        }

        let type = getType(field.type);

        //console.log(formatType(type));

        if (type.type !== StructEnum.T_STRUCT && type.type !== StructEnum.T_TSTRUCT) {
          continue;
        }

        if (!(type.data in this.structs)) {
          let msg = stt.name + ":" + field.name + ": Unknown struct " + type.data + ".";
          throwError(stt, field, msg);
        }
        //console.log(formatType(field.type));
      }
    }
  }

  forEach(func, thisvar) {
    for (let k in this.structs) {
      let stt = this.structs[k];

      if (thisvar !== undefined)
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
      let struct2 = defined_classes;
      defined_classes = [];

      for (let k in struct2.struct_cls) {
        defined_classes.push(struct2.struct_cls[k]);
      }
    }

    if (defined_classes === undefined) {
      defined_classes = [];

      for (let k in exports.manager.struct_cls) {
        defined_classes.push(exports.manager.struct_cls[k]);
      }
    }

    let clsmap = {}

    for (let i = 0; i < defined_classes.length; i++) {
      let cls = defined_classes[i];

      if (!cls.structName && cls.STRUCT) {
        let stt = struct_parse.parse(cls.STRUCT.trim());
        cls.structName = stt.name;
      } else if (!cls.structName && cls.name !== "Object") {
        if (warninglvl > 0) 
          console.log("Warning, bad class in registered class list", unmangle(cls.name), cls);
        continue;
      }

      clsmap[cls.structName] = defined_classes[i];
    }

    struct_parse.input(buf);

    while (!struct_parse.at_end()) {
      let stt = struct_parse.parse(undefined, false);

      if (!(stt.name in clsmap)) {
        if (!(stt.name in this.null_natives))
        if (warninglvl > 0) 
          console.log("WARNING: struct " + stt.name + " is missing from class list.");

        let dummy = define_empty_class(stt.name);

        dummy.STRUCT = STRUCT.fmt_struct(stt);
        dummy.structName = stt.name;

        dummy.prototype.structName = dummy.name;

        this.struct_cls[dummy.structName] = dummy;
        this.structs[dummy.structName] = stt;

        if (stt.id !== -1)
          this.struct_ids[stt.id] = stt;
      } else {
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
        console.warn("Generating STRUCT script for derived class " + unmangle(cls.name));
        if (!structName) {
          structName = unmangle(cls.name);
        }
        
        cls.STRUCT = STRUCT.inherit(cls, p) + `\n}`;
      }
    }
    
    if (!cls.STRUCT) {
      throw new Error("class " + unmangle(cls.name) + " has no STRUCT script");
    }

    let stt = struct_parse.parse(cls.STRUCT);

    stt.name = unmangle(stt.name);

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
    } else {
      stt.name = cls.structName;
    }

    if (cls.structName in this.structs) {
      console.warn("Struct " + unmangle(cls.structName) + " is already registered", cls);

      if (!this.allowOverriding) {
        throw new Error("Struct " + unmangle(cls.structName) + " is already registered");
      }

      return;
    }

    if (stt.id === -1)
      stt.id = this.idgen.gen_id();

    this.structs[cls.structName] = stt;
    this.struct_cls[cls.structName] = cls;
    this.struct_ids[stt.id] = stt;
  }

  isRegistered(cls) {
    if (!cls.hasOwnProperty("structName")) {
      return false;
    }

    return cls === this.struct_cls[cls.structName];
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

    let stt = struct_parse.parse(parent.STRUCT);
    let code = structName + "{\n";
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

    let proto = cls.prototype;
    let parent = cls.prototype.prototype.constructor;

    let obj = parent.fromSTRUCT(reader);
    let obj2 = new cls();

    let keys = Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
    //let keys=Object.keys(proto);

    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];

      try {
        obj2[k] = obj[k];
      } catch (error) {
        if (warninglvl > 0) 
          console.warn("  failed to set property", k);
      }
      //let k=keys[i];
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
    if (internal_only === undefined)
      internal_only = false;
    if (no_helper_js === undefined)
      no_helper_js = false;

    let s = "";
    if (!internal_only) {
      s += stt.name;
      if (stt.id !== -1)
        s += " id=" + stt.id;
      s += " {\n";
    }
    let tab = "  ";

    function fmt_type(type) {
      return StructFieldTypeMap[type.type].format(type);
      
      if (type.type === StructEnum.T_ARRAY || type.type === StructEnum.T_ITER || type.type === StructEnum.T_ITERKEYS) {
        if (type.data.iname !== "" && type.data.iname !== undefined) {
          return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
        }
        else {
          return "array(" + fmt_type(type.data.type) + ")";
        }
      } else if (type.type === StructEnum.T_STATIC_STRING) {
        return "static_string[" + type.data.maxlength + "]";
      } else if (type.type === StructEnum.T_STRUCT) {
        return type.data;
      } else if (type.type === StructEnum.T_TSTRUCT) {
        return "abstract(" + type.data + ")";
      } else {
        return StructTypeMap[type.type];
      }
    }

    let fields = stt.fields;
    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      s += tab + f.name + " : " + fmt_type(f.type);
      if (!no_helper_js && f.get !== undefined) {
        s += " | " + f.get.trim();
      }
      s += ";\n";
    }
    if (!internal_only)
      s += "}";
    return s;
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

    //fullcode = fullcode.replace(/\bthis\b/, "obj");

    if (!(fullcode in this.compiled_code)) {
      let code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
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

      let code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      console.log(code2);
      console.log(" ");
      throw err;
    }
  }

  write_struct(data, obj, stt) {
    function use_helper_js(field) {
      let type = field.type.type;
      let cls = StructFieldTypeMap[type];
      return cls.useHelperJS(field);
    }

    let fields = stt.fields;
    let thestruct = this;
    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let t1 = f.type;
      let t2 = t1.type;

      if (use_helper_js(f)) {
        let val;
        let type = t2;
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }
        
        if (_nGlobal.DEBUG && _nGlobal.DEBUG.tinyeval) { 
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        do_pack(data, val, obj, thestruct, f, t1);
      }
      else {
        let val = f.name === "this" ? obj : obj[f.name];
        do_pack(data, val, obj, thestruct, f, t1);
      }
    }
  }

  /**
  @param data : array to write data into,
  @param obj  : structable object
  */
  write_object(data, obj) {
    let cls = obj.constructor.structName;
    let stt = this.get_struct(cls);

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
  writeObject(data, obj) {
    return this.write_object(data, obj);
  }

  writeJSON(obj, stt=undefined) {
    let cls = obj.constructor.structName;
    stt = stt || this.get_struct(cls);

    function use_helper_js(field) {
      let type = field.type.type;
      let cls = StructFieldTypeMap[type];
      return cls.useHelperJS(field);
    }

    let toJSON = sintern2.toJSON;

    let fields = stt.fields;
    let thestruct = this;
    let json = {};

    for (let i = 0; i < fields.length; i++) {
      let f = fields[i];
      let t1 = f.type;
      let t2 = t1.type;
      let val;

      if (use_helper_js(f)) {
        let type = t2;
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        }
        else {
          val = obj[f.name];
        }

        if (_nGlobal.DEBUG && _nGlobal.DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        json[f.name] = toJSON(this, val, obj, f, t1);
      }
      else {
        val = obj[f.name];
        json[f.name] = toJSON(this, val, obj, f, t1);
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
    let cls, stt;

    if (data instanceof Array) {
      data = new DataView(new Uint8Array(data).buffer);
    }

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls.structName];

    if (uctx === undefined) {
      uctx = new struct_binpack.unpack_context();

      packer_debug("\n\n=Begin reading " + cls.structName + "=");
    }
    let thestruct = this;

    let this2  = this;
    function unpack_field(type) {
      return StructFieldTypeMap[type.type].unpack(this2, data, type, uctx);
    }

    function unpack_into(type, dest) {
      console.log(type);
      return StructFieldTypeMap[type.type].unpackInto(this2, data, type, uctx, dest);
    }

    let was_run = false;

    function makeLoader(stt) {
      return function load(obj) {
        if (was_run) {
          return;
        }

        was_run = true;

        let fields = stt.fields;
        let flen = fields.length;

        for (let i = 0; i < flen; i++) {
          let f = fields[i];

          if (f.name === 'this') {
            //load data into obj directly
            unpack_into(f.type, obj);
          } else {
            obj[f.name] = unpack_field(f.type);
          }
        }
      }
    }

    let load = makeLoader(stt);

    if (cls.prototype.loadSTRUCT !== undefined) {
      let obj = objInstance;

      if (!obj && cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT();
      } else if (!obj) {
        obj = new cls();
      }

      obj.loadSTRUCT(load);
      return obj;
    } else if (cls.fromSTRUCT !== undefined) {
      if (warninglvl > 1) 
        console.warn("Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
      return cls.fromSTRUCT(load);
    } else { //default case, make new instance and then call load() on it
      let obj = objInstance;

      if (!obj && cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT();
      } else if (!obj) {
        obj = new cls();
      }

      load(obj);

      return obj;
    }
  }

  readJSON(data, cls_or_struct_id) {
    let cls, stt;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls.structName];

    let fromJSON = sintern2.fromJSON;
    let thestruct = this;

    let this2  = this;

    let was_run = false;

    function reader(obj) {
      if (was_run) {
        return;
      }

      was_run = true;

      let fields = stt.fields;
      let flen = fields.length;
      for (let i = 0; i < flen; i++) {
        let f = fields[i];

        packer_debug("Load field " + f.name);
        obj[f.name] = fromJSON(thestruct, data[f.name], data, f.type);
      }
    }

    if (cls.prototype.loadSTRUCT !== undefined) {
      let obj;

      if (cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT();
      } else {
        obj = new cls();
      }

      obj.loadSTRUCT(reader);

      return obj;
    } else if (cls.fromSTRUCT !== undefined) {
      if (warninglvl > 1)
        console.warn("Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");

      return cls.fromSTRUCT(reader);
    } else { //default case, make new instance and then call reader() on it
      let obj;
      if (cls.newSTRUCT !== undefined) {
        obj = cls.newSTRUCT();
      } else {
        obj = new cls();
      }

      reader(obj);

      return obj;
    }
  }
}

//main struct script manager
let manager = exports.manager = new STRUCT();

/**
 * Write all defined structs out to a string.
 *
 * @param manager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
let write_scripts = exports.write_scripts = function write_scripts(manager, include_code = false) {
  if (manager === undefined)
    manager = exports.manager;

  let buf = "";

  manager.forEach(function (stt) {
    buf += STRUCT.fmt_struct(stt, false, !include_code) + "\n";
  });

  let buf2 = buf;
  buf = "";

  for (let i = 0; i < buf2.length; i++) {
    let c = buf2[i];
    if (c === "\n") {
      buf += "\n";
      let i2 = i;
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
