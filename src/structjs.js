if (typeof window !== "undefined") {
  window._nGlobal = window;
} else if (typeof self !== "undefined") {
  self._nGlobal = self;
} else {
  global._nGlobal = global;
}

_nGlobal._structEval = eval;


let struct_intern = require("./struct_intern");
let struct_filehelper = require("./struct_filehelper");
let struct_util = require("./struct_util");
let struct_binpack = require("./struct_binpack");
let struct_parseutil = require("./struct_parseutil");
let struct_typesystem = require("./struct_typesystem");
let struct_parser = require("./struct_parser");

exports.unpack_context = struct_binpack.unpack_context;

/**
true means little endian, false means big endian
*/
Object.defineProperty(exports, "STRUCT_ENDIAN", {
  get: function () {
    return struct_binpack.STRUCT_ENDIAN;
  },
  set: function (val) {
    struct_binpack.STRUCT_ENDIAN = val;
  }
});

for (let k in struct_intern) {
  exports[k] = struct_intern[k];
}

var StructTypeMap = struct_parser.StructTypeMap;
var StructTypes = struct_parser.StructTypes;
var Class = struct_typesystem.Class;

//forward struct_intern's exports
for (var k in struct_intern) {
  exports[k] = struct_intern[k];
}

exports.validateStructs = function validateStructs(onerror) {
  return exports.manager.validateStructs(onerror);
}

/** Register a class with nstructjs **/
exports.register = function register(cls, structName) {
  return exports.manager.register(cls, structName);
}
exports.inherit = function (child, parent, structName = child.name) {
  return exports.STRUCT.inherit(...arguments);
}

/**
@param data : DataView
*/
exports.readObject = function(data, cls, __uctx=undefined) {
  return exports.manager.readObject(data, cls, __uctx);
}

/**
@param data : Array instance to write bytes to
*/
exports.writeObject = function(data, obj) {
  return exports.manager.writeObject(data.obj);
}

exports.setDebugMode = struct_intern.setDebugMode;
exports.setWarningMode = struct_intern.setWarningMode;

//$BUILD_TINYEVAL_START
exports.tinyeval = require("../tinyeval/tinyeval.js");

exports.useTinyEval = function() {
  _nGlobal._structEval = (buf) => {
    return exports.tinyeval.eval(buf);
  }
};
//$BUILD_TINYEVAL_END


//export other modules
exports.binpack = struct_binpack;
exports.util = struct_util;
exports.typesystem = struct_typesystem;
exports.parseutil = struct_parseutil;
exports.parser = struct_parser;
exports.filehelper = struct_filehelper;
