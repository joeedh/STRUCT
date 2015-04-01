define([
  "struct_typesystem"
], function(struct_typesystem) {
  "use strict";
  
  var Class = struct_typesystem.Class;
  
  var exports = {};
  var _o_basic_types = {"String" : 0, "Number" : 0, "Array" : 0, "Function" : 0};
  
  function is_obj_lit(obj) {
    if (obj.constructor.name in _o_basic_types)
      return false;
      
    if (obj.constructor.name == "Object")
      return true;
    if (obj.prototype == undefined)
      return true;
    
    return false;
  }
  
  function set_getkey(obj) {
    if (typeof obj == "number" || typeof obj == "boolean")
      return ""+obj;
    else if (typeof obj == "string")
      return obj;
    else
      return obj.__keystr__();
  }
  
  var set = exports.set = Class([
    function constructor(input) {
      this.items = [];
      this.keys = {};
      this.freelist = [];
      
      this.length = 0;
      
      if (input != undefined && input instanceof Array) {
        for (var i=0; i<input.length; i++) {
          this.add(input[i]);
        }
      } else if (input != undefined && input.forEach != undefined) {
        input.forEach(function(item) {
          this.add(input[i]);
        }, this);
      }
  },
  function add(obj) {
      var key = set_getkey(obj);
      if (key in this.keys) return;
      
      if (this.freelist.length > 0) {
          var i = this.freelist.pop();
          this.keys[key] = i;
          this.items[i] = obj;
      } else {
        this.keys[key] = this.items.length;
        this.items.push(obj);
      }
      
      this.length++;
    },
    function remove(obj, raise_error) {
      var key = set_getkey(obj);
      
      if (!(keystr in this.keys)) {
        if (raise_error)
          throw new Error("Object not in set");
        else
          console.trace("Object not in set", obj);
        return;
      }
      
      var i = this.keys[keystr];
      
      this.freelist.push(i);
      this.items[i] = undefined;
      
      delete this.keys[keystr];
      this.length--;
    },
    
    function has(obj) {
      return set_getkey(obj) in this.keys;
    },
    
    function forEach(func, thisvar) {
      for (var i=0; i<this.items.length; i++) {
        var item = this.items[i];
        
        if (item == undefined) continue;
        
        if (thisvar != undefined)
          func.call(thisvar, item);
        else
          func(item);
      }
    }
  ]);
  
  var IDGen = exports.IDGen = Class([
    function constructor() {
      this.cur_id = 1;
    },
    
    function gen_id() {
      return this.cur_id++;
    },
    
    Class.static_method(function fromSTRUCT(reader) {
      var ret = new IDGen();
      reader(ret);
      return ret;
    })
  ]);
  
  IDGen.STRUCT = [
    "struct_util.IDGen {",
    "  cur_id : int;",
    "}"
  ].join("\n");
  
  return exports;
});
