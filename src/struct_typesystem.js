"use strict";
//zebra-style class system, see zebkit.org

function ClassGetter(func) {
  this.func = func;
}
function ClassSetter(func) {
  this.func = func;
}

var prototype_idgen = 1;
var defined_classes = exports.defined_classes = [];

var StaticMethod = function StaticMethod(func) {
  this.func = func;
};

//parent is optional
var handle_statics = function(cls, methods, parent) {
  for (var i=0; i<methods.length; i++) {
    var m = methods[i];
    
    if (m instanceof StaticMethod) {
      cls[m.func.name] = m.func;
    }
  }
  
  //inherit from parent too.
  //only inherit static methods added to parent with this module, though
  if (parent != undefined) {
    for (var k in parent) {
      var v = parent[k];
      
      if ((typeof v == "object"|| typeof v == "function")
           && "_is_static_method" in v && !(k in cls)) 
      {
        cls[k] = v;
      }
    }
  }
}

var Class = exports.Class = function Class(methods) {
  var construct = undefined;
  var parent = undefined;
  
  if (arguments.length > 1) {
    //a parent was passed in
    
    parent = methods;
    methods = arguments[1];
  }
  
  for (var i=0; i<methods.length; i++) {
    var f = methods[i];
    
    if (f.name == "constructor") {
      construct = f;
      break;
    }
  }
  
  if (construct == undefined) {
    console.trace("Warning, constructor was not defined", methods);
    
    if (parent != undefined) {
      construct = function() {
        parent.apply(this, arguments);
      }
    } else {
      construct = function() {
      }
    }
  }
  
  if (parent != undefined) {
    construct.prototype = Object.create(parent.prototype);
  }
  
  construct.prototype.__prototypeid__ = prototype_idgen++;
  construct.__keystr__ = function() {
    return this.prototype.__prototypeid__;
  }
  
  construct.__parent__ = parent;
  construct.__statics__ = [];
  
  var getters = {};
  var setters = {};
  var getset = {};
  
  //handle getters/setters
  for (var i=0; i<methods.length; i++) {
    var f = methods[i];
    if (f instanceof ClassSetter) {
      setters[f.func.name] = f.func;
      getset[f.func.name] = 1;
    } else if (f instanceof ClassGetter) {
      getters[f.func.name] = f.func;
      getset[f.func.name] = 1;
    }
  }
  
  for (var k in getset) {
    var def = {
      enumerable   : true,
      configurable : true,
      get : getters[k],
      set : setters[k]
    }
    
    Object.defineProperty(construct.prototype, k, def);
  }
  
  handle_statics(construct, methods, parent);
  
  if (parent != undefined)
    construct.__parent__ = parent;
  
  for (var i=0; i<methods.length; i++) {
    var f = methods[i];
    
    if (f instanceof StaticMethod || f instanceof ClassGetter || f instanceof ClassSetter)
      continue;

    construct.prototype[f.name] = f;
  }
  
  return construct;
}

Class.getter = function(func) {
  return new ClassGetter(func);
}
Class.setter = function(func) {
  return new ClassSetter(func);
}

Class.static_method = function(func) {
  func._is_static_method = true;
  
  return new StaticMethod(func);
}

var EmptySlot = {};

var set = exports.set = Class([
  function constructor(input) {
    this.items = [];
    this.keys = {};
    this.freelist = [];
    
    this.length = 0;
    
    if (input != undefined) {
      input.forEach(function(item) {
        this.add(item);
      }, this);
    }
  },
  
  function add(item) {
    var key = item.__keystr__();
    
    if (key in this.keys) return;
    
    if (this.freelist.length > 0) {
      var i = this.freelist.pop();
      
      this.keys[key] = i;
      items[i] = i;
    } else {
      var i = this.items.length;
      
      this.keys[key] = i;
      this.items.push(item);
    }
    
    this.length++;
  },
  
  function remove(item) {
    var key = item.__keystr__();
    
    if (!(key in this.keys)) {
      console.trace("Warning, item", item, "is not in set");
      return;
    }
    
    var i = this.keys[key];
    this.freelist.push(i);
    this.items[i] = EmptySlot;
    
    delete this.items[i];
    this.length--;
  },
  
  function has(item) {
    return item.__keystr__() in this.keys;
  },
  
  function forEach(func, thisvar) {
    for (var i=0; i<this.items.length; i++) {
      var item = this.items[i];
      
      if (item === EmptySlot) 
        continue;
        
      thisvar != undefined ? func.call(thisvar, time) : func(item);
    }
  }
]);
