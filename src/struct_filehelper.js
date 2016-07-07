if (typeof btoa == "undefined") {
  btoa = function btoa(str) {
    var buffer = new Buffer(""+str, 'binary');
    return buffer.toString('base64');
  }
  
  atob = function atob(str) {
    return new Buffer(str, 'base64').toString('binary');
  }
}

define([
  "struct_intern", "struct_util", "struct_binpack", "struct_parseutil",
  "struct_typesystem", "struct_parser"
], function(structjs, struct_util, struct_binpack, struct_parseutil, 
            struct_typesystem, struct_parser) 
{
  'use strict';
  
  var exports = {};
  var Class = struct_typesystem.Class;
  
  /*
  file format:
    magic signature              : 4 bytes
    file version major           : 2 bytes
    file version minor           : 1 bytes
    file version micro           : 1 bytes
    length of struct scripts     : 4 bytes
    struct scripts for this file : ...
    
    block:
      magic signature for block              : 4 bytes
      length of data  (not including header) : 4 bytes
      id of struct type                      : 4 bytes
      
      data                                   : ...
  */
  
  var FileParams = exports.FileParams = class FileParams {
    constructor() {
      this.magic = "STRT";
      this.ext = ".bin";
      this.blocktypes = ["DATA"];
      
      this.version = {
        major : 0,
        minor : 0,
        micro : 1
      };
    }
  }
  
  //used to define blocks
  var Block = exports.Block = Class([
    function constructor(type_magic, data) {
      this.type = type_magic;
      this.data = data;
    }
  ]);
  
  var FileError = exports.FileError = class FileError {
  };
    
  var FileHelper = exports.FileHelper = Class([
    //params can be FileParams instance, or object literal
    //(it will convert to FileParams)
    function constructor(params) {
      if (params === undefined) {
        params = new FileParams();
      } else {
        var fp = new FileParams();
        
        for (var k in params) {
          fp[k] = params[k];
        }
        params = fp;
      }
      
      this.version = params.version;
      this.blocktypes = params.blocktypes;
      this.magic = params.magic;
      this.ext = params.ext;
      this.struct = undefined;
      this.unpack_ctx = undefined;
    },
    
    function read(dataview) {
      this.unpack_ctx = new struct_binpack.unpack_context();
      
      var magic = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, 4);
      
      if (magic !== this.magic) {
        throw new FileError("corrupted file");
      }
      
      this.version = {};
      this.version.major = struct_binpack.unpack_short(dataview, this.unpack_ctx);
      this.version.minor = struct_binpack.unpack_byte(dataview, this.unpack_ctx);
      this.version.micro = struct_binpack.unpack_byte(dataview, this.unpack_ctx);
      
      var struct = this.struct = new structjs.STRUCT();
      
      var scripts = struct_binpack.unpack_string(dataview, this.unpack_ctx);
      this.struct.parse_structs(scripts, structjs.manager);
      
      var blocks = [];
      var dviewlen = dataview.buffer.byteLength;
      
      while (this.unpack_ctx.i < dviewlen) {
        //console.log("reading block. . .", this.unpack_ctx.i, dviewlen);
        
        var type = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, 4);
        var datalen = struct_binpack.unpack_int(dataview, this.unpack_ctx);
        var bstruct = struct_binpack.unpack_int(dataview, this.unpack_ctx);
        var bdata;
        
        //console.log(type, datalen, bstruct);
        
        if (bstruct == -2) { //string data, e.g. JSON
          bdata = struct_binpack.unpack_static_string(dataview, this.unpack_ctx, datalen);
        } else {
          bdata = struct_binpack.unpack_bytes(dataview, this.unpack_ctx, datalen);
          bdata = struct.read_object(bdata, bstruct, new struct_binpack.unpack_context());
        }
        
        var block = new Block();
        block.type = type;
        block.data =  bdata;
        
        blocks.push(block);
      }
      
      this.blocks = blocks;
      return blocks;
    },
    
    function write(blocks) {
      this.struct = structjs.manager;
      this.blocks = blocks;
      
      var data = [];
      
      struct_binpack.pack_static_string(data, this.magic, 4);
      struct_binpack.pack_short(data, this.version.major);
      struct_binpack.pack_byte(data, this.version.minor & 255);
      struct_binpack.pack_byte(data, this.version.micro & 255);
      
      var scripts = structjs.write_scripts();
      struct_binpack.pack_string(data, scripts);
      
      var struct = this.struct;
      
      for (var block of blocks) {
        if (typeof block.data == "string") { //string data, e.g. JSON
          struct_binpack.pack_static_string(data, block.type, 4);
          struct_binpack.pack_int(data, block.data.length);
          struct_binpack.pack_int(data, -2); //flag as string data
          struct_binpack.pack_static_string(data, block.data, block.data.length);
          continue;
        } 
        
        var structName = block.data.constructor.structName;
        if (structName===undefined || !(structName in struct.structs)) {
          throw new Error("Non-STRUCTable object " + block.data);
        }
        
        var data2 = [];
        var stt = struct.structs[structName];
        
        struct.write_object(data2, block.data);
        
        struct_binpack.pack_static_string(data, block.type, 4);
        struct_binpack.pack_int(data, data2.length);
        struct_binpack.pack_int(data, stt.id);
        
        struct_binpack.pack_bytes(data, data2);
      }
      
      return new DataView(new Uint8Array(data).buffer);
    },
    
    function writeBase64(blocks) {
      var dataview = this.write(blocks);
      
      var str = "";
      var bytes = new Uint8Array(dataview.buffer);
      
      for (var i=0; i<bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      
      return btoa(str);
    },
    
    function makeBlock(type, data) {
      return new Block(type, data);
    },
    
    function readBase64(base64) {
      var data = atob(base64);
      var data2 = new Uint8Array(data.length);
      
      for (var i=0; i<data.length; i++) {
        data2[i] = data.charCodeAt(i);
      }
      
      return this.read(new DataView(data2.buffer));
    }
  ]);
  /*
    //get type data from structjs.manager
    var classes = {};
    structjs.manager.forEach(function(stt) {
      classes[stt] 
    }, this);
  */
  
  return exports;
});
