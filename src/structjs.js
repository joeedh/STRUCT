if (typeof window !== "undefined") {
  window._nGlobal = window;
} else if (typeof self !== "undefined") {
  self._nGlobal = self;
} else {
  global._nGlobal = global;
}

let struct_intern = require("./struct_intern");
let struct_filehelper = require("./struct_filehelper");
let struct_util = require("./struct_util");
let struct_binpack = require("./struct_binpack");
let struct_parseutil = require("./struct_parseutil");
let struct_typesystem = require("./struct_typesystem");
let struct_parser = require("./struct_parser");

Object.defineProperty(exports, "STRUCT_ENDIAN", {
  get : function() {
    return struct_binpack.STRUCT_ENDIAN;
  },
  set : function(val) {
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

/** Register a class with nstructjs **/
exports.register = function register(cls, name) {
  return exports.manager.register(cls, name);
}
exports.inherit = function() {
  return exports.STRUCT.inherit(...arguments);
}

exports.setDebugMode = struct_intern.setDebugMode;

//export other modules
exports.binpack = struct_binpack;
exports.util = struct_util;
exports.typesystem = struct_typesystem;
exports.parseutil = struct_parseutil;
exports.parser = struct_parser;
exports.filehelper = struct_filehelper;
