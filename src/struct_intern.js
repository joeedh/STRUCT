"use strict";
import * as struct_binpack from './struct_binpack.js';
import * as struct_parser from './struct_parser.js';
import * as _sintern2 from './struct_intern2.js';
import * as struct_eval from './struct_eval.js';

//needed to avoid a rollup bug in configurable mode
var sintern2 = _sintern2;

import {DEBUG} from './struct_global.js';

import {_get_pack_debug, StructFieldTypeMap} from './struct_intern2.js';

let warninglvl = 2;

export var truncateDollarSign = true;
export var manager;

export class JSONError extends Error {};

export function setTruncateDollarSign(v) {
  truncateDollarSign = !!v;
}

export function _truncateDollarSign(s) {
  let i = s.search("$");

  if (i > 0) {
    return s.slice(0, i).trim();
  }

  return s;
}

function unmangle(name) {
  if (truncateDollarSign) {
    return _truncateDollarSign(name);
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
SomeClass[keywords.script] = `
SomeClass {
}
`
nstructjs.register(SomeClass);

*/
import {
  StructTypes, StructTypeMap, StructEnum, NStruct,
  struct_parse
} from './struct_parser.js';

let _static_envcode_null = "";

//truncate webpack-mangled names

function gen_tabstr(tot) {
  let ret = "";

  for (let i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

let packer_debug, packer_debug_start, packer_debug_end;

function update_debug_data() {
  let ret = _get_pack_debug();

  packer_debug = ret.packer_debug;
  packer_debug_start = ret.packer_debug_start;
  packer_debug_end = ret.packer_debug_end;
  warninglvl = ret.warninglvl;
}

update_debug_data();

export function setWarningMode(t) {
  sintern2.setWarningMode(t);

  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl = t;
}

export function setDebugMode(t) {
  sintern2.setDebugMode(t);
  update_debug_data();
}

let _ws_env = [[undefined, undefined]];

function do_pack(data, val, obj, thestruct, field, type) {
  StructFieldTypeMap[field.type.type].pack(manager, data, val, obj, field, type);
}

function define_empty_class(scls, name) {
  let cls = function () {
  };

  cls.prototype = Object.create(Object.prototype);
  cls.constructor = cls.prototype.constructor = cls;

  let keywords = scls.keywords;

  cls[keywords.script] = name + " {\n  }\n";
  cls[keywords.name] = name;

  cls.prototype[keywords.load] = function (reader) {
    reader(this);
  }

  cls[keywords.new] = function () {
    return new this();
  }

  return cls;
}

let haveCodeGen = false;

//$KEYWORD_CONFIG_START

export class STRUCT {
  constructor() {
    this.idgen = 0;
    this.allowOverriding = true;

    this.structs = {}
    this.struct_cls = {}
    this.struct_ids = {}

    this.compiled_code = {}
    this.null_natives = {}

    this.define_null_native("Object", Object);
  }

  static inherit(child, parent, structName = child.name) {
    const keywords = this.keywords;

    if (!parent[keywords.script]) {
      return structName + "{\n";
    }

    let stt = struct_parse.parse(parent[keywords.script]);
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

    if (!bad && parent.prototype[keywords.load] && parent.prototype[keywords.load] !== obj[keywords.load]) { //parent.prototype.hasOwnProperty("loadSTRUCT")) {
      parent.prototype[keywords.load].call(obj, reader2);
    }
  }

  /** deprecated.  used with old fromSTRUCT interface. */
  static chain_fromSTRUCT(cls, reader) {
    if (warninglvl > 0)
      console.warn("Using deprecated (and evil) chain_fromSTRUCT method, eek!");

    let proto = cls.prototype;
    let parent = cls.prototype.prototype.constructor;

    let obj = parent[keywords.from](reader);
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

  //defined_classes is an array of class constructors
  //with STRUCT scripts, *OR* another STRUCT instance
  //

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
        } else {
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

  static setClassKeyword(keyword, nameKeyword = undefined) {
    if (!nameKeyword) {
      nameKeyword = keyword.toLowerCase() + "Name";
    }

    this.keywords = {
      script: keyword,
      name  : nameKeyword,
      load  : "load" + keyword,
      new   : "new" + keyword,
      after : "after" + keyword,
      from  : "from" + keyword
    };
  }

  define_null_native(name, cls) {
    const keywords = this.constructor.keywords;
    let obj = define_empty_class(this.constructor, name);

    let stt = struct_parse.parse(obj[keywords.script]);

    stt.id = this.idgen++;

    this.structs[name] = stt;
    this.struct_cls[name] = cls;
    this.struct_ids[stt.id] = stt;

    this.null_natives[name] = 1;
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

        if (type.type !== StructEnum.T_STRUCT && type.type !== StructEnum.T_TSTRUCT) {
          continue;
        }

        if (!(type.data in this.structs)) {
          let msg = stt.name + ":" + field.name + ": Unknown struct " + type.data + ".";
          throwError(stt, field, msg);
        }
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

  //defaults to structjs.manager
  parse_structs(buf, defined_classes) {
    const keywords = this.constructor.keywords;

    if (defined_classes === undefined) {
      defined_classes = manager;
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

      for (let k in manager.struct_cls) {
        defined_classes.push(manager.struct_cls[k]);
      }
    }

    let clsmap = {}

    for (let i = 0; i < defined_classes.length; i++) {
      let cls = defined_classes[i];

      if (!cls[keywords.name] && cls[keywords.script]) {
        let stt = struct_parse.parse(cls[keywords.script].trim());
        cls[keywords.name] = stt.name;
      } else if (!cls[keywords.name] && cls.name !== "Object") {
        if (warninglvl > 0)
          console.log("Warning, bad class in registered class list", unmangle(cls.name), cls);
        continue;
      }

      clsmap[cls[keywords.name]] = defined_classes[i];
    }

    struct_parse.input(buf);

    while (!struct_parse.at_end()) {
      let stt = struct_parse.parse(undefined, false);

      if (!(stt.name in clsmap)) {
        if (!(stt.name in this.null_natives))
          if (warninglvl > 0)
            console.log("WARNING: struct " + stt.name + " is missing from class list.");

        let dummy = define_empty_class(this.constructor, stt.name);

        dummy[keywords.script] = STRUCT.fmt_struct(stt);
        dummy[keywords.name] = stt.name;

        dummy.prototype[keywords.name] = dummy.name;

        this.struct_cls[dummy[keywords.name]] = dummy;
        this.structs[dummy[keywords.name]] = stt;

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

  /** adds all structs referenced by cls inside of srcSTRUCT
   *  to this */
  registerGraph(srcSTRUCT, cls) {
    if (!cls[keywords.name]) {
      console.warn("class was not in srcSTRUCT");
      return this.register(cls);
    }

    let recStruct;

    let recArray = (t) => {
      switch (t.type) {
        case StructEnum.T_ARRAY:
          return recArray(t.data.type);
        case StructEnum.T_ITERKEYS:
          return recArray(t.data.type);
        case StructEnum.T_STATIC_ARRAY:
          return recArray(t.data.type);
        case StructEnum.T_ITER:
          return recArray(t.data.type);
        case StructEnum.T_STRUCT:
        case StructEnum.T_TSTRUCT: {
          let st = srcSTRUCT.structs[t.data];
          let cls = srcSTRUCT.struct_cls[st.name];

          return recStruct(st, cls);
        }
      }
    }

    recStruct = (st, cls) => {
      if (!(cls[keywords.name] in this.structs)) {
        this.add_class(cls, cls[keywords.name]);
      }

      for (let f of st.fields) {
        if (f.type.type === StructEnum.T_STRUCT || f.type.type === StructEnum.T_TSTRUCT) {
          let st2 = srcSTRUCT.structs[f.type.data];
          let cls2 = srcSTRUCT.struct_cls[st2.name];

          recStruct(st2, cls2);
        } else if (f.type.type === StructEnum.T_ARRAY) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.T_ITER) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.T_ITERKEYS) {
          recArray(f.type);
        } else if (f.type.type === StructEnum.T_STATIC_ARRAY) {
          recArray(f.type);
        }
      }
    }

    let st = srcSTRUCT.structs[cls[keywords.name]];
    recStruct(st, cls);
  }

  register(cls, structName) {
    return this.add_class(cls, structName);
  }

  unregister(cls) {
    const keywords = this.constructor.keywords;

    if (!cls || !cls[keywords.name] || !(cls[keywords.name] in this.struct_cls)) {
      console.warn("Class not registered with nstructjs", cls);
      return;
    }


    let st = this.structs[cls[keywords.name]];

    delete this.structs[cls[keywords.name]];
    delete this.struct_cls[cls[keywords.name]];
    delete this.struct_ids[st.id];
  }

  add_class(cls, structName) {
    //do not register Object
    if (cls === Object) {
      return;
    }

    const keywords = this.constructor.keywords;
    if (cls[keywords.script]) {
      let bad = false;

      let p = cls;
      while (p) {
        p = p.__proto__;

        if (p && p[keywords.script] && p[keywords.script] === cls[keywords.script]) {
          bad = true;
          break;
        }
      }

      if (bad) {
        console.warn("Generating " + keywords.script + " script for derived class " + unmangle(cls.name));
        if (!structName) {
          structName = unmangle(cls.name);
        }

        cls[keywords.script] = STRUCT.inherit(cls, p) + "\n}";
      }
    }

    if (!cls[keywords.script]) {
      throw new Error("class " + unmangle(cls.name) + " has no " + keywords.script + " script");
    }

    let stt = struct_parse.parse(cls[keywords.script]);

    stt.name = unmangle(stt.name);

    cls[keywords.name] = stt.name;

    //create default newSTRUCT
    if (cls[keywords.new] === undefined) {
      cls[keywords.new] = function () {
        return new this();
      }
    }

    if (structName !== undefined) {
      stt.name = cls[keywords.name] = structName;
    } else if (cls[keywords.name] === undefined) {
      cls[keywords.name] = stt.name;
    } else {
      stt.name = cls[keywords.name];
    }

    if (cls[keywords.name] in this.structs) {
      console.warn("Struct " + unmangle(cls[keywords.name]) + " is already registered", cls);

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

    //fullcode = fullcode.replace(/\bthis\b/, "obj");

    if (!(fullcode in this.compiled_code)) {
      let code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      try {
        func = struct_eval.structEval(code2);
      } catch (err) {
        console.warn(err.stack);

        console.warn(code2);
        console.warn(" ");
        throw err;
      }
      this.compiled_code[fullcode] = func;
    } else {
      func = this.compiled_code[fullcode];
    }
    try {
      return func.call(obj, obj, env);
    } catch (err) {
      console.warn(err.stack);

      let code2 = "func = function(obj, env) { " + envcode + "return " + code + "}";
      console.warn(code2);
      console.warn(" ");
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

        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        do_pack(data, val, obj, thestruct, f, t1);
      } else {
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
    const keywords = this.constructor.keywords;

    let cls = obj.constructor[keywords.name];
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
    if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      data = new DataView(data.buffer);
    } else if (data instanceof Array) {
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

  writeJSON(obj, stt = undefined) {
    const keywords = this.constructor.keywords;

    let cls = obj.constructor;
    stt = stt || this.get_struct(cls[keywords.name]);

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
      let val;
      let t1 = f.type;

      let json2;

      if (use_helper_js(f)) {
        if (f.get !== undefined) {
          val = thestruct._env_call(f.get, obj);
        } else {
          val = f.name === "this" ? obj : obj[f.name];
        }

        if (DEBUG.tinyeval) {
          console.log("\n\n\n", f.get, "Helper JS Ret", val, "\n\n\n");
        }

        json2 = toJSON(this, val, obj, f, t1);
      } else {
        val = f.name === "this" ? obj : obj[f.name];
        json2 = toJSON(this, val, obj, f, t1);
      }

      if (f.name !== 'this') {
        json[f.name] = json2;
      } else { //f.name was 'this'?
        let isArray = Array.isArray(json2);
        isArray = isArray || f.type.type === StructTypes.T_ARRAY;
        isArray = isArray || f.type.type === StructTypes.T_STATIC_ARRAY;

        if (isArray) {
          json.length = json2.length;

          for (let i = 0; i < json2.length; i++) {
            json[i] = json2[i];
          }
        } else {
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

    stt = this.structs[cls[keywords.name]];

    if (uctx === undefined) {
      uctx = new struct_binpack.unpack_context();

      packer_debug("\n\n=Begin reading " + cls[keywords.name] + "=");
    }
    let thestruct = this;

    let this2 = this;

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

    if (cls.prototype[keywords.load] !== undefined) {
      let obj = objInstance;

      if (!obj && cls[keywords.new] !== undefined) {
        obj = cls[keywords.new](load);
      } else if (!obj) {
        obj = new cls();
      }

      obj[keywords.load](load);

      if (!was_run) {
        console.warn("" + cls[keywords.name] + ".prototype[keywords.load]() did not execute its loader callback!");
        load(obj);
      }

      return obj;
    } else if (cls[keywords.from] !== undefined) {
      if (warninglvl > 1)
        console.warn("Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
      return cls[keywords.from](load);
    } else { //default case, make new instance and then call load() on it
      let obj = objInstance;

      if (!obj && cls[keywords.new] !== undefined) {
        obj = cls[keywords.new](load);
      } else if (!obj) {
        obj = new cls();
      }

      load(obj);

      return obj;
    }
  }

  validateJSON(json, cls_or_struct_id, _abstractKey="_structName") {
    try {
      this.validateJSONIntern(json, cls_or_struct_id, _abstractKey);
    } catch (error) {
      if (!(error instanceof JSONError)) {
        console.error(error.stack);
      }

      console.error(error.message);
      return false;
    }

    return true;
  }

  validateJSONIntern(json, cls_or_struct_id, _abstractKey="_structName") {
    const keywords = this.constructor.keywords;

    let cls, stt;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls[keywords.name]];

    let fields = stt.fields;
    let flen = fields.length;

    let keys = new Set();
    keys.add(_abstractKey);

    let keyTestJson = json;

    for (let i = 0; i < flen; i++) {
      let f = fields[i];

      let val;

      if (f.name === 'this') {
        val = json;
        keyTestJson = {
          "this" : json
        };
        keys.add("this");
      } else {
        val = json[f.name];
        keys.add(f.name);
      }

      if (val === undefined) {
        //console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
        //continue;
      }

      let instance = f.name === 'this' ? val : json;

      let ret = sintern2.validateJSON(this, val, json, f, f.type, instance, _abstractKey);

      if (!ret || typeof ret === "string") {
        let msg = typeof ret === "string" ? ": " + ret : "";

        console.error(cls[keywords.script]);
        throw new JSONError("Invalid json field " + f.name + msg);

        return false;
      }
    }

    for (let k in keyTestJson) {
      if (typeof json[k] === "symbol") {
        //ignore symbols
        continue;
      }

      if (!keys.has(k)) {
        console.error(cls[keywords.script]);
        throw new JSONError("Unknown json field " + k);
        return false;
      }
    }

    return true;
  }

  readJSON(json, cls_or_struct_id, objInstance = undefined) {
    const keywords = this.constructor.keywords;

    let cls, stt;

    if (typeof cls_or_struct_id === "number") {
      cls = this.struct_cls[this.struct_ids[cls_or_struct_id].name];
    } else if (cls_or_struct_id instanceof NStruct) {
      cls = this.get_struct_cls(cls_or_struct_id.name);
    } else {
      cls = cls_or_struct_id;
    }

    if (cls === undefined) {
      throw new Error("bad cls_or_struct_id " + cls_or_struct_id);
    }

    stt = this.structs[cls[keywords.name]];

    packer_debug("\n\n=Begin reading " + cls[keywords.name] + "=");
    let thestruct = this;
    let this2 = this;
    let was_run = false;
    let fromJSON = sintern2.fromJSON;

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

          let val;

          if (f.name === 'this') {
            val = json;
          } else {
            val = json[f.name];
          }

          if (val === undefined) {
            console.warn("nstructjs.readJSON: Missing field " + f.name + " in struct " + stt.name);
            continue;
          }

          let instance = f.name === 'this' ? obj : objInstance;

          let ret = fromJSON(this2, val, obj, f, f.type, instance);

          if (f.name !== 'this') {
            obj[f.name] = ret;
          }
        }
      }
    }

    let load = makeLoader(stt);

    if (cls.prototype[keywords.load] !== undefined) {
      let obj = objInstance;

      if (!obj && cls[keywords.new] !== undefined) {
        obj = cls[keywords.new](load);
      } else if (!obj) {
        obj = new cls();
      }

      obj[keywords.load](load);
      return obj;
    } else if (cls[keywords.from] !== undefined) {
      if (warninglvl > 1)
        console.warn("Warning: class " + unmangle(cls.name) + " is using deprecated fromSTRUCT interface; use newSTRUCT/loadSTRUCT instead");
      return cls[keywords.from](load);
    } else { //default case, make new instance and then call load() on it
      let obj = objInstance;

      if (!obj && cls[keywords.new] !== undefined) {
        obj = cls[keywords.new](load);
      } else if (!obj) {
        obj = new cls();
      }

      load(obj);

      return obj;
    }
  }
};
//$KEYWORD_CONFIG_END

if (haveCodeGen) {
  var StructClass;

  eval(code);

  STRUCT = StructClass;
}

STRUCT.setClassKeyword("STRUCT");

export function deriveStructManager(keywords = {
  script: "STRUCT",
  name  : undefined, //script.toLowerCase + "Name"
  load  : undefined, //"load" + script
  new   : undefined, //"new" + script
  from  : undefined, //"from" + script
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

  if (haveCodeGen) {
    class NewSTRUCT extends STRUCT {

    }

    NewSTRUCT.keywords = keywords;
    return NewSTRUCT;
  } else {
    var StructClass;

    let code2 = code;
    code2 = code2.replace(/\[keywords.script\]/g, keywords.script)

    eval(code2);
    return StructClass;
  }
}

//main struct script manager
manager = new STRUCT();

/**
 * Write all defined structs out to a string.
 *
 * @param nManager STRUCT instance, defaults to nstructjs.manager
 * @param include_code include save code snippets
 * */
export function write_scripts(nManager = manager, include_code = false) {
  let buf = "";

  nManager.forEach(function (stt) {
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
    } else {
      buf += c;
    }
  }

  return buf;
}
