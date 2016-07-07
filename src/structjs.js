define([
  "struct_intern", "struct_filehelper", "struct_util", "struct_binpack", 
  "struct_parseutil", "struct_typesystem", "struct_parser"
], function(struct_intern, struct_filehelper, struct_util, struct_binpack, 
            struct_parseutil, struct_typesystem, struct_parser)
{
  "use strict";

  var exports = {};
  
  var StructTypeMap = struct_parser.StructTypeMap;
  var StructTypes = struct_parser.StructTypes;
  var Class = struct_typesystem.Class;
  
  //forward struct_intern's exports
  for (var k in struct_intern) {
    exports[k] = struct_intern[k];
  }
  
  //export other modules
  exports.binpack = struct_binpack;
  exports.util = struct_util;
  exports.typesystem = struct_typesystem;
  exports.parseutil = struct_parseutil;
  exports.parser = struct_parser;
  exports.filehelper = struct_filehelper;
  
  return exports;
});
