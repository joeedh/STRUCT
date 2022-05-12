import * as struct_binpack from './struct_binpack.js';
import {StructEnum} from './struct_parser.js';

import {
  pack_int, pack_byte, pack_float, pack_sbyte, pack_short,
  pack_string, pack_uint, pack_static_string, pack_ushort, pack_double,
  pack_bytes, unpack_byte, STRUCT_ENDIAN, unpack_int, decode_utf8,
  unpack_double, encode_utf8, test_utf8, unpack_bytes, unpack_float, unpack_sbyte,
  unpack_string, unpack_short, unpack_static_string, unpack_uint, unpack_ushort,
  unpack_context, temp_dataview, uint8_view
} from './struct_binpack.js'

let warninglvl = 2;
let debug = 0;

let _static_envcode_null = "";
let packer_debug, packer_debug_start, packer_debug_end
let packdebug_tablevel = 0;

export function _get_pack_debug() {
  return {
    packer_debug, packer_debug_start, packer_debug_end,
    debug, warninglvl
  }
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

    this.cur = (this.cur + 1)%this.length;

    return ret;
  }
}

function gen_tabstr(tot) {
  let ret = "";

  for (let i = 0; i < tot; i++) {
    ret += " ";
  }

  return ret;
}

export function setWarningMode2(t) {
  if (typeof t !== "number" || isNaN(t)) {
    throw new Error("Expected a single number (>= 0) argument to setWarningMode");
  }

  warninglvl = t;
}

export function setDebugMode2(t) {
  debug = t;

  if (debug) {
    packer_debug = function () {
      let tab = gen_tabstr(packdebug_tablevel);

      if (arguments.length > 0) {
        console.warn(tab, ...arguments);
      } else {
        console.warn("Warning: undefined msg");
      }
    };
    packer_debug_start = function (funcname) {
      packer_debug("Start " + funcname);
      packdebug_tablevel++;
    };

    packer_debug_end = function (funcname) {
      packdebug_tablevel--;

      if (funcname) {
        packer_debug("Leave " + funcname);
      }
    };
  } else {
    packer_debug = function () {
    };
    packer_debug_start = function () {
    };
    packer_debug_end = function () {
    };
  }
}

setDebugMode2(debug);

export const StructFieldTypes = [];
export const StructFieldTypeMap = {};

export function packNull(manager, data, field, type) {
  StructFieldTypeMap[type.type].packNull(manager, data, field, type);
}

export function toJSON(manager, val, obj, field, type) {
  return StructFieldTypeMap[type.type].toJSON(manager, val, obj, field, type);
}

export function fromJSON(manager, val, obj, field, type, instance) {
  return StructFieldTypeMap[type.type].fromJSON(manager, val, obj, field, type, instance);
}

export function validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
  return StructFieldTypeMap[type.type].validateJSON(manager, val, obj, field, type, instance, _abstractKey);
}


function unpack_field(manager, data, type, uctx) {
  let name;

  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("R " + name);
  }

  let ret = StructFieldTypeMap[type.type].unpack(manager, data, type, uctx);

  if (debug) {
    packer_debug_end();
  }

  return ret;
}

let fakeFields = new cachering(() => {
  return {type: undefined, get: undefined, set: undefined}
}, 256);

function fmt_type(type) {
  return StructFieldTypeMap[type.type].format(type);
}

export function do_pack(manager, data, val, obj, field, type) {
  let name;

  if (debug) {
    name = StructFieldTypeMap[type.type].define().name;
    packer_debug_start("W " + name);
  }

  let typeid = type;
  if (typeof typeid !== "number") {
    typeid = typeid.type;
  }

  let ret = StructFieldTypeMap[typeid].pack(manager, data, val, obj, field, type);

  if (debug) {
    packer_debug_end();
  }

  return ret;
}

let _ws_env = [[undefined, undefined]];

export class StructFieldType {
  static pack(manager, data, val, obj, field, type) {
  }

  static unpack(manager, data, type, uctx) {
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
      name: "(error)"
    }
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

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return "" + val + " is not an integer";
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.INT,
      name: "int"
    }
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
      name: "float"
    }
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

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number") {
      return "Not a double: " + val;
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.DOUBLE,
      name: "double"
    }
  }
}

StructFieldType.register(StructDoubleField);

class StructStringField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    val = !val ? "" : val;

    pack_string(data, val);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
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
      name: "string"
    }
  }
}

StructFieldType.register(StructStringField);

class StructStaticStringField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    val = !val ? "" : val;

    pack_static_string(data, val, type.data.maxlength);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
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
      name: "static_string"
    }
  }
}

StructFieldType.register(StructStaticStringField);

class StructStructField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    let stt = manager.get_struct(type.data);

    packer_debug("struct", stt.name);

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

  static toJSON(manager, val, obj, field, type) {
    let stt = manager.get_struct(type.data);
    return manager.writeJSON(val, stt);
  }

  static unpackInto(manager, data, type, uctx, dest) {
    let cls2 = manager.get_struct_cls(type.data);

    packer_debug("struct", cls2 ? cls2.name : "(error)");
    return manager.read_object(data, cls2, uctx, dest);
  }

  static packNull(manager, data, field, type) {
    let stt = manager.get_struct(type.data);

    packer_debug("struct", type);

    for (let field2 of stt.fields) {
      let type2 = field2.type;

      packNull(manager, data, field2, type2);
    }
  }

  static unpack(manager, data, type, uctx) {
    let cls2 = manager.get_struct_cls(type.data);
    packer_debug("struct", cls2 ? cls2.name : "(error)");

    return manager.read_object(data, cls2, uctx);
  }

  static define() {
    return {
      type: StructEnum.STRUCT,
      name: "struct"
    }
  }
}

StructFieldType.register(StructStructField);

class StructTStructField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    let cls = manager.get_struct_cls(type.data);
    let stt = manager.get_struct(type.data);

    const keywords = manager.constructor.keywords;

    //make sure inheritance is correct
    if (val.constructor[keywords.name] !== type.data && (val instanceof cls)) {
      //if (DEBUG.Struct) {
      //    console.log(val.constructor[keywords.name]+" inherits from "+cls[keywords.name]);
      //}
      stt = manager.get_struct(val.constructor[keywords.name]);
    } else if (val.constructor[keywords.name] === type.data) {
      stt = manager.get_struct(type.data);
    } else {
      console.trace();
      throw new Error("Bad struct " + val.constructor[keywords.name] + " passed to write_struct");
    }

    packer_debug("int " + stt.id);

    pack_int(data, stt.id);
    manager.write_struct(data, val, stt);
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    let key = type.jsonKeyword;

    if (typeof val !== "object") {
      return typeof val + " is not an object";
    }

    let stt = manager.get_struct(val[key]);
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

    return manager.validateJSONIntern(val, stt, type.jsonKeyword);
  }


  static fromJSON(manager, val, obj, field, type, instance) {
    let key = type.jsonKeyword;

    let stt = manager.get_struct(val[key]);

    return manager.readJSON(val, stt, instance);
  }

  static toJSON(manager, val, obj, field, type) {
    const keywords = manager.constructor.keywords;

    let stt = manager.get_struct(val.constructor[keywords.name]);
    let ret = manager.writeJSON(val, stt);

    ret[type.jsonKeyword] = "" + stt.name;

    return ret;
  }

  static packNull(manager, data, field, type) {
    let stt = manager.get_struct(type.data);

    pack_int(data, stt.id);
    packNull(manager, data, field, {type: StructEnum.STRUCT, data: type.data});
  }

  static format(type) {
    return "abstract(" + type.data + ")";
  }

  static unpackInto(manager, data, type, uctx, dest) {
    let id = struct_binpack.unpack_int(data, uctx);

    packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }

    let cls2 = manager.get_struct_id(id);

    packer_debug("struct name: " + cls2.name);

    cls2 = manager.struct_cls[cls2.name];

    return manager.read_object(data, cls2, uctx, dest);
    //packer_debug("ret", ret);
  }

  static unpack(manager, data, type, uctx) {
    let id = struct_binpack.unpack_int(data, uctx);

    packer_debug("-int " + id);
    if (!(id in manager.struct_ids)) {
      packer_debug("tstruct id: " + id);
      console.trace();
      console.log(id);
      console.log(manager.struct_ids);
      throw new Error("Unknown struct type " + id + ".");
    }

    let cls2 = manager.get_struct_id(id);

    packer_debug("struct name: " + cls2.name);
    cls2 = manager.struct_cls[cls2.name];

    return manager.read_object(data, cls2, uctx);
    //packer_debug("ret", ret);
  }

  static define() {
    return {
      type: StructEnum.TSTRUCT,
      name: "tstruct"
    }
  }
}

StructFieldType.register(StructTStructField);

class StructArrayField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    if (val === undefined) {
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

    let d = type.data;

    let itername = d.iname;
    let type2 = d.type;

    let env = _ws_env;
    for (let i = 0; i < val.length; i++) {
      let val2 = val[i];
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
    if (type.data.iname !== "" && type.data.iname !== undefined) {
      return "array(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    } else {
      return "array(" + fmt_type(type.data.type) + ")";
    }
  }

  static useHelperJS(field) {
    return !field.type.data.iname;
  }

  static validateJSON(manager, val, obj, field, type, instance, _abstractKey) {
    if (!val) {
      return "not an array: " + val;
    }

    for (let i = 0; i < val.length; i++) {
      let ret = validateJSON(manager, val[i], val, field, type.data.type, undefined, _abstractKey);

      if (typeof ret === "string" || !ret) {
        return ret;
      }
    }

    return true;
  }

  static fromJSON(manager, val, obj, field, type, instance) {
    let ret = instance || [];

    ret.length = 0;

    for (let i = 0; i < val.length; i++) {
      let val2 = fromJSON(manager, val[i], val, field, type.data.type, undefined);

      if (val2 === undefined) {
        console.log(val2);
        console.error("eeek");
        process.exit();
      }

      ret.push(val2);
    }

    return ret;
  }

  static toJSON(manager, val, obj, field, type) {
    val = val || [];
    let json = [];

    let itername = type.data.iname;

    for (let i = 0; i < val.length; i++) {
      let val2 = val[i];
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);

        //console.log("VAL2", val2, toJSON(manager, val2, val, field, type.data.type));
      }

      json.push(toJSON(manager, val2, val, field, type.data.type));
    }

    return json;
  }

  static unpackInto(manager, data, type, uctx, dest) {
    let len = struct_binpack.unpack_int(data, uctx);
    dest.length = 0;

    for (let i = 0; i < len; i++) {
      dest.push(unpack_field(manager, data, type.data.type, uctx));
    }
  }

  static unpack(manager, data, type, uctx) {
    let len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }

  static define() {
    return {
      type: StructEnum.ARRAY,
      name: "array"
    }
  }
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
        val.forEach(function (item) {
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

    /* save space for length */
    let starti = data.length;
    data.length += 4;

    let d = type.data, itername = d.iname, type2 = d.type;
    let env = _ws_env;

    let i = 0;
    forEach(function (val2) {
      if (itername !== "" && itername !== undefined && field.get) {
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

    /* write length */
    temp_dataview.setInt32(0, i, STRUCT_ENDIAN);

    data[starti++] = uint8_view[0];
    data[starti++] = uint8_view[1];
    data[starti++] = uint8_view[2];
    data[starti++] = uint8_view[3];
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    return StructArrayField.validateJSON(...arguments);
  }

  static fromJSON() {
    return StructArrayField.fromJSON(...arguments);
  }

  static toJSON(manager, val, obj, field, type) {
    val = val || [];
    let json = [];

    let itername = type.data.iname;

    for (let val2 of val) {
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);

        //console.log("VAL2", val2, toJSON(manager, val2, val, field, type.data.type));
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
    if (type.data.iname !== "" && type.data.iname !== undefined) {
      return "iter(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    } else {
      return "iter(" + fmt_type(type.data.type) + ")";
    }
  }

  static unpackInto(manager, data, type, uctx, arr) {
    let len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return arr;
  }

  static unpack(manager, data, type, uctx) {
    let len = struct_binpack.unpack_int(data, uctx);
    packer_debug("-int " + len);

    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }

  static define() {
    return {
      type: StructEnum.ITER,
      name: "iter"
    }
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
      name: "short"
    }
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
      name: "byte"
    }
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
      name: "sbyte"
    }
  }
}

StructFieldType.register(StructSignedByteField);

class StructBoolField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    pack_byte(data, !!val);
  }

  static unpack(manager, data, type, uctx) {
    return !!unpack_byte(data, uctx);
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    if (val === 0 || val === 1 || val === true || val === false || val === "true" || val === "false") {
      return true;
    }

    return "" + val + " is not a bool";
  }

  static fromJSON(manager, val, obj, field, type, instance) {
    if (val === "false") {
      val = false;
    }

    return !!val;
  }

  static toJSON(manager, val, obj, field, type) {
    return !!val;
  }

  static define() {
    return {
      type: StructEnum.BOOL,
      name: "bool"
    }
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

      struct_binpack.pack_int(data, 0);
      return;
    }

    let len = 0.0;
    for (let k in val) {
      len++;
    }

    packer_debug("int " + len);
    struct_binpack.pack_int(data, len);

    let d = type.data, itername = d.iname, type2 = d.type;
    let env = _ws_env;

    let i = 0;
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

      let f2 = {type: type2, get: undefined, set: undefined};
      do_pack(manager, data, val2, obj, f2, type2);

      i++;
    }
  }

  static validateJSON(manager, val, obj, field, type, instance) {
    return StructArrayField.validateJSON(...arguments);
  }

  static fromJSON() {
    return StructArrayField.fromJSON(...arguments);
  }

  static toJSON(manager, val, obj, field, type) {
    val = val || [];
    let json = [];

    let itername = type.data.iname;

    for (let k in val) {
      let val2 = val[k];
      let env = _ws_env;

      if (itername !== "" && itername !== undefined && field.get) {
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);

        //console.log("VAL2", val2, toJSON(manager, val2, val, field, type.data.type));
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
    if (type.data.iname !== "" && type.data.iname !== undefined) {
      return "iterkeys(" + type.data.iname + ", " + fmt_type(type.data.type) + ")";
    } else {
      return "iterkeys(" + fmt_type(type.data.type) + ")";
    }
  }

  static unpackInto(manager, data, type, uctx, arr) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    arr.length = 0;

    for (let i = 0; i < len; i++) {
      arr.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return arr;
  }

  static unpack(manager, data, type, uctx) {
    let len = unpack_int(data, uctx);
    packer_debug("-int " + len);

    let arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = unpack_field(manager, data, type.data.type, uctx);
    }

    return arr;
  }

  static define() {
    return {
      type: StructEnum.ITERKEYS,
      name: "iterkeys"
    }
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

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return "" + val + " is not an integer";
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.UINT,
      name: "uint"
    }
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

  static validateJSON(manager, val, obj, field, type, instance) {
    if (typeof val !== "number" || val !== Math.floor(val)) {
      return "" + val + " is not an integer";
    }

    return true;
  }

  static define() {
    return {
      type: StructEnum.USHORT,
      name: "ushort"
    }
  }
}

StructFieldType.register(StructUshortField);

//let writeEmpty = writeEmpty = function writeEmpty(stt) {
//}

class StructStaticArrayField extends StructFieldType {
  static pack(manager, data, val, obj, field, type) {
    if (type.data.size === undefined) {
      throw new Error("type.data.size was undefined");
    }

    let itername = type.data.iname;

    if (val === undefined || !val.length) {
      this.packNull(manager, data, field, type);
      return;
    }

    for (let i = 0; i < type.data.size; i++) {
      let i2 = Math.min(i, Math.min(val.length - 1, type.data.size));
      let val2 = val[i2];

      //*
      if (itername !== "" && itername !== undefined && field.get) {
        let env = _ws_env;
        env[0][0] = itername;
        env[0][1] = val2;
        val2 = manager._env_call(field.get, obj, env);
      }

      do_pack(manager, data, val2, val, field, type.data.type);
    }
  }

  static useHelperJS(field) {
    return !field.type.data.iname;
  }

  static validateJSON() {
    return StructArrayField.validateJSON(...arguments);
  }

  static fromJSON() {
    return StructArrayField.fromJSON(...arguments);
  }

  static packNull(manager, data, field, type) {
    let size = type.data.size;
    for (let i = 0; i < size; i++) {
      packNull(manager, data, field, type.data.type);
    }
  }

  static toJSON(manager, val, obj, field, type) {
    return StructArrayField.toJSON(...arguments);
  }

  static format(type) {
    let type2 = StructFieldTypeMap[type.data.type.type].format(type.data.type);

    let ret = `static_array[${type2}, ${type.data.size}`;

    if (type.data.iname) {
      ret += `, ${type.data.iname}`;
    }
    ret += `]`;

    return ret;
  }

  static unpackInto(manager, data, type, uctx, ret) {
    packer_debug("-size: " + type.data.size);

    ret.length = 0;

    for (let i = 0; i < type.data.size; i++) {
      ret.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return ret;
  }

  static unpack(manager, data, type, uctx) {
    packer_debug("-size: " + type.data.size);

    let ret = [];

    for (let i = 0; i < type.data.size; i++) {
      ret.push(unpack_field(manager, data, type.data.type, uctx));
    }

    return ret;
  }

  static define() {
    return {
      type: StructEnum.STATIC_ARRAY,
      name: "static_array"
    }
  }
}

StructFieldType.register(StructStaticArrayField);

