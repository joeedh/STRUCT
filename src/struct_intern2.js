let warninglvl = 1;
let debug = 0;

let struct_util = require("./struct_util");
let struct_binpack = require("./struct_binpack");
let parser = require("./struct_parser.js");

let pack_int = struct_binpack.pack_int;
let pack_uint = struct_binpack.pack_uint;
let pack_ushort = struct_binpack.pack_ushort;

let pack_float = struct_binpack.pack_float;
let pack_string = struct_binpack.pack_string;
let pack_byte = struct_binpack.pack_byte;
let pack_double = struct_binpack.pack_double;
let pack_static_string = struct_binpack.pack_static_string;
let pack_short = struct_binpack.pack_short;

let unpack_int = struct_binpack.unpack_int;
let unpack_float = struct_binpack.unpack_float;
let unpack_uint = struct_binpack.unpack_uint;
let unpack_ushort = struct_binpack.unpack_ushort;
let unpack_string = struct_binpack.unpack_string;
let unpack_byte = struct_binpack.unpack_byte;
let unpack_double = struct_binpack.unpack_double;
let unpack_static_string = struct_binpack.unpack_static_string;
let unpack_short = struct_binpack.unpack_short;

var _static_envcode_null = "";

let packer_debug, packer_debug_start, packer_debug_end;

var packdebug_tablevel = 0;

function gen_tabstr(tot) {
  var ret = "";

  for (var i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

exports.setWarningMode = (t) => {
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl = t;
}

exports.setDebugMode = (t) => {
  debug = t;

  if (debug) {
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

exports.setDebugMode(debug);

exports.StructFieldTypes = [];
exports.StructFieldTypeMap = {};

function unpack_field(manager, data, type, uctx) {
  let name;
  
  if (debug) {
    name = exports.StructFieldTypeMap[type.type].define().name;
    packer_debug_start("R start " + name);
  }
  
  let ret = exports.StructFieldTypeMap[type.type].unpack(manager, data, type, uctx);
  
  if (debug) {
    packer_debug_end("R end " + name);
  }
  
  return ret;
}

let fakeFields = new struct_util.cachering(() => {return {type : undefined, get : undefined, set : undefined}}, 256);

function fmt_type(type) {
  return exports.StructFieldTypeMap[type.type].format(type);
}

function do_pack(manager, data, val, obj, field, type) {
  let name;
  
  if (debug) {
    name = exports.StructFieldTypeMap[type.type].define().name;
    packer_debug_start("W start " + name);
  }

  let typeid = type;
  if (typeof typeid !== "number") {
    typeid = typeid.type;
  }
  
  let ret = exports.StructFieldTypeMap[typeid].pack(manager, data, val, obj, field, type);
  
  if (debug) {
    packer_debug_end("W end " + name);
  } 
  
  return ret;
}

let StructEnum = parser.StructEnum;

var _ws_env = [[undefined, undefined]];

let StructFieldType = exports.StructFieldType = class StructFieldType {
  static pack(manager, data, val, obj, field, type) {
  }
  
  static unpack(manager, data, type, uctx) {
  }
  
  static format(type) {
    return this.define().name;
  }
  
  static define() {return {
    type : -1,
    name : "(error)"
  }}
  
  static register(cls) {
    if (exports.StructFieldTypes.indexOf(cls) >= 0) {
      throw new Error("class already registered");
    }
    
    if (cls.define === StructFieldType.define) {
      throw new Error("you forgot to make a define() static method");
    }
    
    if (cls.define().type === undefined) {
      throw new Error("cls.define().type was undefined!");
    }
    
    if (cls.define().type in exports.StructFieldTypeMap) {
      throw new Error("type " + cls.define().type + " is used by another StructFieldType subclass");
    }
    
    exports.StructFieldTypes.push(cls);
    exports.StructFieldTypeMap[cls.define().type] = cls;
  }
}

class StructIntField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_int(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_int(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_INT,
    name : "int"
  }}
}
StructFieldType.register(StructIntField);

class StructFloatField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_float(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_float(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_FLOAT,
    name : "float"
  }}
}
StructFieldType.register(StructFloatField);

class StructDoubleField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_double(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_double(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_DOUBLE,
    name : "double"
  }}
}
StructFieldType.register(StructDoubleField);

class StructStringField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    val = !val ? "" : val;
    
    pack_string(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_string(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_STRING,
    name : "string"
  }}
}
StructFieldType.register(StructStringField);

class StructStaticStringField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    val = !val ? "" : val;
    
    pack_static_string(data, val, type.data.maxlength);
  }
  
  static format(type) {
    return `static_string[${type.data.maxlength}]`;
  }
 
  static unpack(manager, data, type, uctx) {
    return unpack_static_string(data, uctx, type.data.maxlength);
  }   
  
  static define() {return {
    type : StructEnum.T_STATIC_STRING,
    name : "static_string"
  }}
}
StructFieldType.register(StructStaticStringField);

class StructStructField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    manager.write_struct(data, val, manager.get_struct(type.data));
  }
  
  static format(type) {
    return type.data;
  }
  
  static unpack(manager, data, type, uctx) {
    var cls2 = manager.get_struct_cls(type.data);
    return manager.read_object(data, cls2, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_STRUCT,
    name : "struct"
  }}
}
StructFieldType.register(StructStructField);

class StructTStructField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    var cls = manager.get_struct_cls(type.data);
    var stt = manager.get_struct(type.data);

    //make sure inheritance is correct
    if (val.constructor.structName != type.data && (val instanceof cls)) {
      //if (DEBUG.Struct) {
      //    console.log(val.constructor.structName+" inherits from "+cls.structName);
      //}
      stt = manager.get_struct(val.constructor.structName);
    } else if (val.constructor.structName == type.data) {
      stt = manager.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct " + val.constructor.structName + " passed to write_struct");
    }

    packer_debug("int " + stt.id);

    struct_binpack.pack_int(data, stt.id);
    manager.write_struct(data, val, stt);
  }
  
  static format(type) {
    return "abstract(" + type.data + ")";
  }
  
  static unpack(manager, data, type, uctx) {
    var id = struct_binpack.unpack_int(data, uctx);

    packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("struct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      packer_debug_end("tstruct");
      throw new Error("Unknown struct type " + id + ".");
    }

    var cls2 = manager.get_struct_id(id);

    packer_debug("struct name: " + cls2.name);
    cls2 = manager.struct_cls[cls2.name];

    let ret =  manager.read_object(data, cls2, uctx);
    //packer_debug("ret", ret);

    return ret;
  }   
  
  static define() {return {
    type : StructEnum.T_TSTRUCT,
    name : "tstruct"
  }}
}
StructFieldType.register(StructTStructField);

class StructArrayField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    if (val == undefined) {
      console.trace();
      console.log("Undefined array fed to struct struct packer!");
      console.log("Field: ", field);
      console.log("Type: ", type);
      console.log("");
      packer_debug("int 0");
      struct_binpack.pack_int(data, 0);
      return;
    }

    packer_debug("int " + val.length);
    struct_binpack.pack_int(data, val.length);

    var d = type.data;

    var itername = d.iname;
    var type2 = d.type;

    var env = _ws_env;
    for (var i = 0; i < val.length; i++) {
      var val2 = val[i];
      if (itername != "" && itername != undefined && field.get) {
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
  
  static format(type) {
    if (type.data.iname != "" && type.data.iname != undefined) {
      return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    }
    else {
      return "array(" + fmt_type(type.data.type) + ")";
    }
  }
  
  static unpack(manager, data, type, uctx) {
    var len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }
    
    return arr;
  }   
  
  static define() {return {
    type : StructEnum.T_ARRAY,
    name : "array"
  }}
}
StructFieldType.register(StructArrayField);

class StructIterField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    //this was originally implemented to use ES6 iterators.
    function forEach(cb, thisvar) {
      if (val && val[Symbol.iterator]) {
        for (let item of val) {
          cb.call(thisvar, item);
        }
      } else if (val && val.forEach) {
        val.forEach(function(item) {
          cb.call(thisvar, item);
        });
      } else {
        console.trace();
        console.log("Undefined iterable list fed to struct struct packer!", val);
        console.log("Field: ", field);
        console.log("Type: ", type);
        console.log("");
      }
    }
    
    let len = 0.0;
    forEach(() => {
      len++;
    });

    packer_debug("int " + len);
    struct_binpack.pack_int(data, len);

    var d = type.data, itername = d.iname, type2 = d.type;
    var env = _ws_env;

    var i = 0;
    forEach(function(val2) {
      if (i >= len) {
        if (warninglvl > 0) 
          console.trace("Warning: iterator returned different length of list!", val, i);
        return;
      }

      if (itername != "" && itername != undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      //XXX not sure I really need this fakeField stub here. . .
      let fakeField = fakeFields.next();
      fakeField.type = type2;
      do_pack(manager, data, val2, obj, fakeField, type2);

      i++;
    }, this);
  }
  
  static format(type) {
    if (type.data.iname != "" && type.data.iname != undefined) {
      return "iter(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    }
    else {
      return "iter(" + fmt_type(type.data.type) + ")";
    }
  }
  
  static unpack(manager, data, type, uctx) {
    var len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }   
  
  static define() {return {
    type : StructEnum.T_ITER,
    name : "iter"
  }}
}
StructFieldType.register(StructIterField);

class StructShortField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_short(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_short(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_SHORT,
    name : "short"
  }}
}
StructFieldType.register(StructShortField);

class StructByteField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_byte(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_byte(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_BYTE,
    name : "byte"
  }}
}
StructFieldType.register(StructByteField);

class StructBoolField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_byte(data, !!val);
  }
  
  static unpack(manager, data, type, uctx) {
    return !!unpack_byte(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_BOOL,
    name : "bool"
  }}
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
        
        struct_binpack.pack_int(data, 0);
        
        packer_debug_end("iterkeys");
        return;
    }

    let len = 0.0;
    for (let k in val) {
      len++;
    }

    packer_debug("int " + len);
    struct_binpack.pack_int(data, len);

    var d = type.data, itername = d.iname, type2 = d.type;
    var env = _ws_env;

    var i = 0;
    for (let val2 in val) {
      if (i >= len) {
        if (warninglvl > 0) 
          console.warn("Warning: object keys magically changed on us", val, i);
        return;
      }

      if (itername && itername.trim().length > 0 && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      } else {
        val2 = val[val2]; //fetch value
      }

      var f2 = {type: type2, get: undefined, set: undefined};
      do_pack(manager, data, val2, obj, f2, type2);

      i++;
    }
  }
  
  static format(type) {
    if (type.data.iname != "" && type.data.iname != undefined) {
      return "iterkeys(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    }
    else {
      return "iterkeys(" + fmt_type(type.data.type) + ")";
    }
  }
  
  static unpack(manager, data, type, uctx) {
    var len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }   
  
  static define() {return {
    type : StructEnum.T_ITERKEYS,
    name : "iterkeys"
  }}
}
StructFieldType.register(StructIterKeysField);

class StructUintField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_uint(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_uint(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_UINT,
    name : "uint"
  }}
}
StructFieldType.register(StructUintField);


class StructUshortField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_ushort(data, val);
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_ushort(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_USHORT,
    name : "ushort"
  }}
}
StructFieldType.register(StructUshortField);

class StructStaticArrayField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_int(data, 1);
  }
  
  static format(type) {
    let type2 = exports.StructFieldTypeMap[type.data.type.type].format(type.data.type);
    
    let ret = `static_array[${type2}, ${type.data.size}`;
    
    if (type.data.iname) {
      ret += `, ${type.data.iname}`;
    }
    ret += `]`;
    
    return ret;
  }
  
  static unpack(manager, data, type, uctx) {
    return unpack_int(data, uctx);
  }   
  
  static define() {return {
    type : StructEnum.T_STATIC_ARRAY,
    name : "static_array"
  }}
}
StructFieldType.register(StructStaticArrayField);

