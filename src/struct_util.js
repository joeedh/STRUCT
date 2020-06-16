let struct_typesystem = require("./struct_typesystem");

var Class = struct_typesystem.Class;
var _o_basic_types = {"String": 0, "Number": 0, "Array": 0, "Function": 0};

exports.cachering = class cachering extends Array {
  constructor(cb, tot) {
    super();
    this.length = tot;
    this.cur = 0;
    
    for (let i=0; i<tot; i++) {
      this[i] = cb();
    }
  }
  
  next() {
    let ret = this[this.cur];
    
    this.cur = (this.cur + 1) % this.length;
    
    return ret;
  }
  
  static fromConstructor(cls, tot) {
    return new exports.cachering(() => new cls(), tot);
  }
}

function isNodeJS() {
  ret = typeof process !== "undefined";
  ret = ret && process.release;
  ret = ret && process.release.name === "node";
  ret = ret && process.version;

  return !!ret;
}

let is_obj_lit = exports.is_obj_lit = function is_obj_lit(obj) {
  if (typeof obj !== "object") {
    return false;
  }
  
  let good = obj.__proto__ && obj.__proto__.constructor && obj.__proto__.constructor === Object;

  if (good) {
    return true;
  }

  let bad = typeof obj !== "object";
  bad = bad || obj.constructor.name in _o_basic_types;
  bad = bad || obj instanceof String;
  bad = bad || obj instanceof Number;
  bad = bad || obj instanceof Boolean;
  bad = bad || obj instanceof Function;
  bad = bad || obj instanceof Array;
  bad = bad || obj instanceof Set;
  bad = bad || (obj.__proto__.constructor && obj.__proto__.constructor !== Object);

  return !bad;
}
_nGlobal.is_obj_lit = is_obj_lit;

function set_getkey(obj) {
  if (typeof obj == "number" || typeof obj == "boolean")
    return "" + obj;
  else if (typeof obj == "string")
    return obj;
  else
    return obj.__keystr__();
}

exports.get_callstack = function get_callstack(err) {
  var callstack = [];
  var isCallstackPopulated = false;

  var err_was_undefined = err == undefined;

  if (err == undefined) {
    try {
      _idontexist.idontexist += 0; //doesn't exist- that's the point
    } catch (err1) {
      err = err1;
    }
  }

  if (err != undefined) {
    if (err.stack) { //Firefox
      var lines = err.stack.split('\n');
      var len = lines.length;
      for (var i = 0; i < len; i++) {
        if (1) {
          lines[i] = lines[i].replace(/@http\:\/\/.*\//, "|")
          var l = lines[i].split("|")
          lines[i] = l[1] + ": " + l[0]
          lines[i] = lines[i].trim()
          callstack.push(lines[i]);
        }
      }

      //Remove call to printStackTrace()
      if (err_was_undefined) {
        //callstack.shift();
      }
      isCallstackPopulated = true;
    }
    else if (window.opera && e.message) { //Opera
      var lines = err.message.split('\n');
      var len = lines.length;
      for (var i = 0; i < len; i++) {
        if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
          var entry = lines[i];
          //Append next line also since it has the file info
          if (lines[i + 1]) {
            entry += ' at ' + lines[i + 1];
            i++;
          }
          callstack.push(entry);
        }
      }
      //Remove call to printStackTrace()
      if (err_was_undefined) {
        callstack.shift();
      }
      isCallstackPopulated = true;
    }
  }

  var limit = 24;
  if (!isCallstackPopulated) { //IE and Safari
    var currentFunction = arguments.callee.caller;
    var i = 0;
    while (currentFunction && i < 24) {
      var fn = currentFunction.toString();
      var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
      callstack.push(fname);
      currentFunction = currentFunction.caller;

      i++;
    }
  }

  return callstack;
}

exports.print_stack = function print_stack(err) {
  try {
    var cs = exports.get_callstack(err);
  } catch (err2) {
    console.log("Could not fetch call stack.");
    return;
  }

  console.log("Callstack:");
  for (var i = 0; i < cs.length; i++) {
    console.log(cs[i]);
  }
}

var set = exports.set = Class([
  function constructor(input) {
    this.items = [];
    this.keys = {};
    this.freelist = [];

    this.length = 0;

    if (input != undefined && input instanceof Array) {
      for (var i = 0; i < input.length; i++) {
        this.add(input[i]);
      }
    } else if (input != undefined && input.forEach != undefined) {
      input.forEach(function (item) {
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
    for (var i = 0; i < this.items.length; i++) {
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
