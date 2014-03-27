"use strict";

//need to figure out which name to use for this
class Iter {
  reset() {}
  next() {} //returns a {done : bool iteration_done, value: value} object
}

class CanIter {
  __iterator__() : Iter {
  }
}

var int debug_int_1 = 0;
class GArray extends Array {
  constructor(Object input) {
    Array<T>.call(this)

    if (input != undefined) {
      for (var i=0; i<input.length; i++) {
        this.push(input[i]);
      }
    }
  }

  pack(Array<byte> data) {
    pack_int(data, this.length);
    for (var i=0; i<this.length; i++) {
      this[i].pack(data);
    }
  }
  
  has(T item) : Boolean {
    return this.indexOf(item) >= 0;
  }
  
  __iterator__() : GArrayIter<T> {
    return new GArrayIter<T>(this);
  }
    
  toJSON() : Array<Object> {
    var arr = new Array(this.length);
    
    var i = 0;
    for (var i=0; i<this.length; i++) {
      arr[i] = this[i];
    }
    
    return arr;
  }

  //inserts *before* index
  insert(int index, T item) {
    for (var i=this.length; i > index; i--) {
      this[i] = this[i-1];
    }
    
    this[index] = item;
    this.length++;
  }

  prepend(T item) {
    this.insert(0, item);
  }

  remove(T item, Boolean ignore_existence) { //ignore_existence defaults to false
    var int idx = this.indexOf(item);
    
    if (ignore_existence == undefined)
      ignore_existence = false;
      
    if (idx < 0 || idx == undefined) {
      console.log("Yeek! Item " + item + " not in array");
      console.trace();
      
      if (!ignore_existence) {
        console.trace();
        throw "Yeek! Item " + item + " not in array"
      }
      
      return;
    }
    
    for (var int i=idx; i<this.length-1; i++) {
      this[i] = this[i+1];
    }
    
    this.length -= 1;
  }

  replace(T olditem, T newitem) { //ignore_existence defaults to false
    var int idx = this.indexOf(olditem);
    
    if (idx < 0 || idx == undefined) {
      console.log("Yeek! Item " + olditem + " not in array");
      console.trace();
      
      if (!ignore_existence)
        throw "Yeek! Item " + olditem + " not in array"

      return;
    }
    
    this[idx] = newitem;
  }

  /*
  this.pop() {
    if (this.length == 0)
      return undefined;
    
    var ret = this[this.length-1];
    this.length--;
    
    return ret;
  }
  */

  toSource() : String {
    var s = "new GArray" + this.length + "(["
    
    for (var i=0; i<this.length; i++) {
      s += this[i];
      if (i != this.length-1)
        s += ", ";
    }
    
    s += "])";
    
    return s
  }

  toString() : String {
    var s = "[GArray: "
    for (var i=0; i<this.length; i++) {
      s += this[i];
      if (i != this.length-1)
        s += ", ";
    }
    
    s += "])";
    
    return s
  }
}
EXPORT_FUNC(GArray)

//turn defined_classes into a GArray, now that we've defined it (garray)
var Function defined_classes = new GArray(defined_classes);

function obj_value_iter(Object obj) {
  this.ret = {done : false, value : undefined};
  this.obj = obj;
  this.iter = Iterator(obj);
  
  this.next = function() {
    var reti = this.ret;
    
    var ret = this.iter.next()
    if (ret.done) return ret;
    
    reti.value = ret.value[1];
    return reti;
  }
  
  this.__iterator__ = function() {
    return this;
  }
}
EXPORT_FUNC(obj_value_iter)

//turns any iterator into an array
function list<T>(Iterator<T> iter) : GArray<T> {
  var lst = new GArray<T>();

  var i = 0;
  for (var item in iter) {
    lst.push(item);
    i++;
  }
  
  lst.length = i;
  
  return lst;
}
EXPORT_FUNC(list)

var Function g_list = list;

class eid_list extends GArray {
  constructor(GeoArrayIter<Element> iter) {
    GArray.call(this);

    for (var item in iter) {
      this.push([item.type, item.eid]);
    }

    return lst;
  }
}

Number.prototype.__hash__ = function() : String {
  return this;
}

String.prototype.__hash__ = function() : String {
  return this;
}

Array.prototype.__hash__ = function() : String {
  var s = ""
  for (var i=0; i<this.length; i++) {
    s += this[i].__hash__()+"|"
  }
  
  return s
}

//an iterator that allows removing elements from
//a set during iteration
class SafeSetIter {
  constructor(set set1) {
    this.ret = {done : false, value : undefined};
    this.set = set1
    this.iter = new SetIter(set1)
    this.nextitem = undefined;
  }
  
  __iterator__() : SafeSetIter<T> {
    return this;    
  }
  
  next() : T {
    throw new Error("Fix this before using");
    
    var reti = this.ret;
    var iter = this.iter
    
    if (this.nextitem == undefined) {
      this.nextitem = iter.next();
    }
    
    var ret = this.nextitem;
    this.nextitem = iter.next();
    
    return ret;
  }
}
EXPORT_FUNC(SafeSetIter)

/* an even safer version, if the above one doesn't work
function SafeSetIter<T>(set) {
  this.set = set
  this.arr = list(set);
  this.cur = 0;
  
  this.__iterator__ = function() : SafeSetIter<T> {
    return this;    
  }
  
  this.next = function() : T {
    if (this.cur >= this.arr.length)
      throw StopIteration;
    
    return this.arr[this.cur++];
  }
} */

class SetIter {
  constructor(set set1) {
    this.ret = {done : false, value : undefined};
    this.set = set1
    this.iter = Iterator(set1.items)
  }
   
  next() : T {
    var reti = this.ret;
    var iter = this.iter
    var items = this.set.items
    
    var item = iter.next();
    if (item.done)
      return item;
      
    /*skip over any built-in properties*/
    while (!items.hasOwnProperty(item.value[0])) {
      item = iter.next()
      if (item.done) return item;
    }
    
    reti.value = item.value[1];
    return reti;
  }
}
EXPORT_FUNC(SetIter)

class set {
  constructor(Object input) {
    this.items = {}
    this.length = 0;
    
    if (input != undefined) {
      if (input instanceof Array || input instanceof String) {
        for (var i=0; i<input.length; i++) {
          this.add(input[i]);
        }
      } else {
        for (var item in input) {
          this.add(item);
        }
      }
    }
  }

  pack(Array<byte> data) {
    pack_int(data, this.length);
    
    for (var item in this) {
      item.pack(data);
    }
  }

  toJSON() : Array<Object> {
    var arr = new Array(this.length);
    
    var i = 0;
    for (var item in this.items) {
      arr[i] = this.items[item];
      i += 1
    }
    
    return arr;
  }

  toSource() : String {
    return "new set(" + list(this).toSource() + ")";
  }

  toString() : String {
    return "new set(" + list(this).toString() + ")";
  }

  add(T item) {
    /*if (item == undefined || item == null) {
      console.trace(item);
    }*/
    
    if (!(item.__hash__() in this.items)) { //!this.items.hasOwnProperty(item.__hash__())) {
      this.length += 1;
      this.items[item.__hash__()] = item;
    }
  }

  remove(T item) {
    delete this.items[item.__hash__()];
    this.length -= 1;
  }

  safe_iter() : SafeSetIter {
    return new SafeSetIter<T>(this);
  }

  __iterator__() : SetIter {
    return new SetIter<T>(this);
  }

  union(set<T> b) : set {
    var newset = new set<T>(this);
    
    for (var T item in b) {
      newset.add(item);
    }
    
    return newset;
  }

  has(T item) : Boolean {
    if (item == undefined) {
      console.trace();
    }
    return this.items.hasOwnProperty(item.__hash__());
  }
}
EXPORT_FUNC(set)

class GArrayIter {
  constructor(GArray<T> arr) {
    this.ret = {done : false, value : undefined};
    this.arr = arr;
    this.cur = 0;
  }
  
  next() : T {
    var reti = this.ret;
    
    if (this.cur >= this.arr.length) {
      this.cur = 0;
      this.ret = {done : false, value : undefined};
      
      reti.done = true;
      return reti;
    } else { 
      reti.value = this.arr[this.cur++];
      return reti;
    }
  }
  
  reset() {
    this.ret = {done : false, value : undefined};
    this.cur = 0;
  }
}

class HashKeyIter {
  constructor(hashtable hash) {
    this.ret = {done : false, value : undefined};
    this.hash = hash;
    this.iter = Iterator(hash.items);
  }
  
  next() : IterRet {
    var reti = this.ret;
    var iter = this.iter;
    var items = this.hash.items;
    
    var item = iter.next();
    
    if (item.done)
      return item;
      
    while (!items.hasOwnProperty(item.value[0])) {
      if (item.done) return item;
      
      item = iter.next();
    }
    
    reti.value = this.hash.keymap[item.value[0]];
    return reti;
  }
}
EXPORT_FUNC(HashKeyIter)

class hashtable {
  constructor() {
    this.items = {};
    this.keymap = {};
    this.length = 0;
  }

  add(Object key, Object item) {
    if (!this.items.hasOwnProperty(key.__hash__())) 
      this.length++;
    
    this.items[key.__hash__()] = item;
    this.keymap[key.__hash__()] = key;
  }

  remove(Object key) {
    delete this.items[key.__hash__()]
    delete this.keymap[key.__hash__()]
    this.length -= 1;
  }

  __iterator__() : HashKeyIter {
    return new HashKeyIter(this)
  }

  values() : GArray<Object> {
    var ret = new GArray();
    for (var k in this) {
      ret.push(this.items[k]);
    }
    
    return ret;
  }

  keys() : GArray<Object> {
    return list(this);
  }

  get(Object key) : Object {
    return this.items[key.__hash__()];
  }

  set(Object key, Object item) {
    if (!this.has(key)) {
      this.length++;
    }
    
    this.items[key.__hash__()] = item;
    this.keymap[key.__hash__()] = key;
  }

  union(hashtable b) : hashtable {
    var newhash = new hashtable(this)
    
    for (var item in b) {
      newhash.add(item, b.get[item])
    }
    
    return newhash;
  }

  has(Object item) : Boolean {
    if (item == undefined)
      console.trace();
    return this.items.hasOwnProperty(item.__hash__())
  }
}

function validate_mesh_intern(m) {
  var eidmap = {};
  
  for (var f in m.faces) {
    var lset = new set();
    var eset = new set();
    var vset = new set();
    
    
    for (var v in f.verts) {
      if (vset.has(v)) {
        console.trace();
        console.log("Warning: found same vert multiple times in a face");
      }
      vset.add(v);
    }
    
    for (var e in f.edges) {
      if (eset.has(e)) {
        console.trace();
        console.log("Warning: found same edge multiple times in a face");
      }
      
      eset.add(e);
    }
    
    for (var loops in f.looplists) {
      for (var l in loops) {
        if (lset.has(l)) {
          console.trace();
          return false;
        }
        
        lset.add(l);
      }
    }
  }
  
  for (var v in m.verts) {
    if (v._gindex == -1) {
      console.trace();
      return false;
    }
    
    if (v.loop != null && v.loop.f._gindex == -1) {
      console.trace();
      return false;
    }
    
    for (var e in v.edges) {
      if (e._gindex == -1) {
        console.trace();
        return false;
      }
      if (!e.vert_in_edge(v)) {
        console.trace();
        return false;
      }
    }
  }
  
  for (var e in m.edges) {
    if (e._gindex == -1) {
      console.trace();
      return false;
    }
    
    var i = 0;
    
    var lset = new set();
    var fset = new set();
    if (e.loop == null) 
      continue;
      
    var l = e.loop;
    do {
      if (lset.has(l)) {
        console.trace();
        return false;
      }
      lset.add(l);
      
      if (fset.has(l.f)) {
        console.trace();
        console.log("Warning: found the same face multiple times in an edge's radial list");
        //this is not a hard error, don't return false
      }
      fset.add(l.f);
      
      i++;
      if (i == 10000) {
        console.trace();
        return false;
      }
      
      if (l.f._gindex == -1) {
        console.trace();
        console.log("error with edge " + e.eid);
        return false;
      }
      
      l = l.radial_next;
    } while (l != e.loop);
  }
  
  for (var v in m.verts) {
    eidmap[v.eid] = v;
  }
  for (var e in m.edges) {
    eidmap[e.eid] = v;
  }
  for (var f in m.faces) {
    eidmap[f.eid] = v;    
  }
  
  for (var k in m.eidmap) {
    if (!(k in eidmap)) {
      console.trace();
      return true;
    }
  }
  
  for (var k in eidmap) {
    if (!(k in m.eidmap)) {
      console.trace();
      return true;
    }
  }
  
  return true;
}

function validate_mesh(m) {
  if (!validate_mesh_intern(m)) {
    console.log("Mesh validation error.");
    throw "Mesh validation error."
  }
}

function concat_array(a1, a2)
{
  var ret = new GArray();
  
  for (var i=0; i<a1.length; i++) {
    ret.push(a1[i]);
  }
  
  for (var i=0; i<a2.length; i++) {
    ret.push(a2[i]);
  }
  
  return ret;
}
EXPORT_FUNC(concat_array)

function get_callstack(err) {
  var callstack = [];
  var isCallstackPopulated = false;
  
  var err_was_undefined = err == undefined;
  
  if (err == undefined) {
    try {
      _idontexist.idontexist+=0; //doesn't exist- that's the point
    } catch(err1) {
      err = err1;
    }
  }
  
  if (err != undefined) {
    if (err.stack) { //Firefox
      var lines = err.stack.split('\n');
      var len=lines.length;
      for (var i=0; i<len; i++) {
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
      var len=lines.length;
      for (var i=0; i<len; i++) {
        if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
          var entry = lines[i];
          //Append next line also since it has the file info
          if (lines[i+1]) {
            entry += ' at ' + lines[i+1];
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
EXPORT_FUNC(get_callstack)

function print_stack(err) {
  try {
    var cs = get_callstack(err);
  } catch (err2) {
    console.log("Could not fetch call stack.");
    return;
  }
  
  console.log("Callstack:");
  for (var i=0; i<cs.length; i++) {
    console.log(cs[i]);
  }
}
EXPORT_FUNC(print_stack)

function time_ms() {
  if (window.performance)
    return window.performance.now();
  else
    return new Date().getMilliseconds();
}
EXPORT_FUNC(time_ms)

class movavg {
  constructor(length) {
    this.len = length;
    this.value = 0;
    this.arr = [];
  }

  _recalc() {
    if (this.arr.length == 0)
      return;

    var avg = 0.0;
    for (var i=0; i<this.arr.length; i++) {
      avg += this.arr[i];
    }
    
    avg /= this.arr.length;
    this.value = avg;
  }
  
  update(val) {
    if (this.arr.length < this.len) {
      this.arr.push(val);
    } else {
      this.arr.shift();
      this.arr.push(val);
    }
    
    this._recalc();
    
    return this.value;
  }

  valueOf() {
    return this.value; //"movavg(value=" + this.value + ")";
  }
}

class Timer {
  constructor(interval_ms) {
    this.ival = interval_ms;
    this.normval = 0.0; //elapsed time scaled by timer interval
    this.last_ms = time_ms();
  }

  ready() {
    this.normval = (time_ms() - this.last_ms) / this.ival;
    
    if (time_ms() - this.last_ms > this.ival) {
      this.last_ms = time_ms();
      return true;
    }
    
    return false;
  }
}

function other_tri_vert(e, f) {
    for (var v in f.verts) {
        if (v != e.v1 && v != e.v2)
            return v;
    }
    
    return null;
}


var _sran_tab = [0.42858355099189227,0.5574386030715371,0.9436109711290556,
0.11901816474442506,0.05494319267999703,0.4089598843412747,
0.9617377622975879,0.6144736752713642,0.4779527665160106,
0.5358937375859902,0.6392009453796094,0.24893232630444684,
0.33278166078571036,0.23623349009987882,0.6007015401310062,
0.3705022651967115,0.0225052050200355,0.35908220770197297,
0.6762962413645864,0.7286584766550781,0.19885076794257972,
0.6066651236611478,0.23594878250486895,0.9559806203614414,
0.37878311003873877,0.14489505173573436,0.6853451367228348,
0.778201767931336,0.9629591508405009,0.10159174495809686,
0.9956652458055149,0.27241630290235785,0.4657146086929548,
0.7459995799823305,0.30955785437169314,0.7594519036966647,
0.9003876360971134,0.14415784566467216,0.13837285006138467,
0.5708662986155526,0.04911823375362412,0.5182157396751097,
0.24535476698939818,0.4755762294863617,0.6241760808125321,
0.05480018253112229,0.8345698022607818,0.26287656274013016,
0.1025239144443526];

class StupidRandom {
  constructor(seed) {
    if (seed == undefined)
      seed = 0;

    this._seed = seed+1;
    this.i = 1;
  }
  
  seed(seed) {
    this._seed = seed+1;
    this.i = 1;
  }
  
  random() {
    global _sran_tab;
    
    var tab = _sran_tab;
    var i = this.i;
    
    if (i < 0)
      i = Math.abs(i)-1;
    
    i = Math.max(i, 1)
    
    var i1 = Math.max(i, 0) + this._seed;
    var i2 = Math.ceil(i/4 + this._seed);
    var r1 = Math.sqrt(tab[i1%tab.length]*tab[i2%tab.length]);
    
    this.i++;
    
    return r1;
  }
}

var StupidRandom seedrand = new StupidRandom();

function get_nor_zmatrix(Vector3 no)
{
  var axis = new Vector3();
  var cross = new Vector3();
  
  axis.zero();
  axis[2] = 1.0;
  
  cross.load(no);
  cross.cross(axis);
  cross.normalize();
  
  var sign = axis.dot(no) > 0.0 ? 1.0 : -1.0
  
  var a = Math.acos(Math.abs(no.dot(axis)));
  var q = new Quat()
  
  q.axisAngleToQuat(cross, sign*a);
  var mat = q.toMatrix();
  
  return mat;
}

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

class UnitTestError extends Error {
  constructor(msg) {
    Error.call(this, msg);
    this.msg = msg;
  }
}

function utest(func) {
  try {
    func();
  } catch (err) {
    if (err instanceof UnitTestError) {
      console.log("---------------");
      console.log("Error: Unit Test Failure");
      console.log("  " + func.name + ": " + err.msg);
      console.log("---------------");
      
      return false;
    } else {
      print_stack(err);
      throw err;
    }
    
    return false;
  }
  
  console.log(func.name + " succeeded.");
  return true;
}

function do_unit_tests() {
  console.log("-----Unit testing-----")
  console.log("Total number of tests: ", defined_tests.length);
  console.log(" ");
  
  var totok=0, toterr=0;
  console.log("Defined tests:")
  for (var i=0; i<defined_tests.length; i++) {
    var test = defined_tests[i];
    console.log("  " + test.name);
  }
  
  console.log(" ");
  for (var i=0; i<defined_tests.length; i++) {
    var test = defined_tests[i];
    
    if (!utest(test))
      toterr++;
    else
      totok++;
  }
  
  console.log("OK: ", totok);
  console.log("FAILED: ", toterr);
  console.log("-------------------");
  
  return toterr == 0;
}

class EIDGen {  
  constructor() {
    this.cur_eid = 1;
  }
  static fromSTRUCT(unpacker) {
    var g = new EIDGen();
    unpacker(g);
    
    return g;
  }
  set_cur(cur) {
    this.cur_eid = Math.ceil(cur);
  }

  //if cur is >= to this.cur_eid, 
  //set this.cur to cur+1
  max_cur(cur) {
    this.cur_eid = Math.max(Math.ceil(cur)+1, this.cur_eid);
  }
  get_cur(cur) {
    return this.cur_eid;
  }
  gen_eid() {
    return this.cur_eid++;
  }
  gen_id() {
    return this.gen_eid();
  }
  toJSON() {
    return { cur_eid : this.cur_eid };
  }
  static fromJSON(obj) {
    var idgen = new EIDGen()
    idgen.cur_eid = obj.cur_eid;
    
    return idgen;
  }
}
EIDGen.STRUCT = """
  EIDGen {
    cur_eid : int;
  }""";

function copy_into(dst, src) {
  console.log(dst);
  
  var keys2 = list(obj_get_keys(src));
  for (var i=0; i<keys2.length; i++) {
    var k = keys2[i];
    dst[k] = src[k];
  }
  
  console.log(dst);
  
  return dst;
}

var Array<float> __v3d_g_s = [];
function get_spiral(size)
{
  if (__v3d_g_s.length == size*size)
    return __v3d_g_s;
  
  var arr = __v3d_g_s;
  
  var x = Math.floor((size-1)/2);
  var y = Math.floor((size-1)/2);
  
  var c;
  var i;
  
  if (size%2 == 0) {
    arr.push([x, y+1]);
    arr.push([x, y]);
    arr.push([x+1, y]);
    arr.push([x+1, y+1]);
    arr.push([x+1, y+2]);
    c = 5;
    i = 2;
    
    y += 2;
    x += 1;
  } else {
    arr.push([x, y])
    arr.push([x+1, y])
    arr.push([x+1, y+1]);
    c = 3;
    i = 2;
    x++; y++;
  }  
  
  while (c < size*size-1) {
    var sign = (Math.floor(i/2) % 2)==1;
    sign = sign ? -1.0 : 1.0;
    
    for (var j=0; j<i; j++) {
      if ((i%2==0)) {
        if (x+sign < 0 || x+sign >= size)
          break;
        x += sign;
      } else {
        if (y+sign < 0 || y+sign >= size)
          break;
        y += sign;
      }
      
      if (c == size*size)
        break;
        
      arr.push([x, y]);
      c++;
    }
    
    if (c == size*size)
      break;
    i++;
  }
  
  for (var j=0; j<arr.length; j++) {
    arr[j][0] = Math.floor(arr[j][0]);
    arr[j][1] = Math.floor(arr[j][1]);
  }
  
  return __v3d_g_s;
}
  
//ltypeof function, that handles object instances of basic types
var ObjMap<String> _bt_h = {
  "String" : "string",
  "RegExp" : "regexp",
  "Number" : "number",
  "Function" : "function",
  "Array" : "array",
  "Boolean" : "boolean",
  "Error" : "error"
}

function btypeof(obj) {
  if (typeof obj == "object") {
    if (obj.constructor.name in _bt_h)
      return _bt_h[obj.constructor.name];
    else
      return "object";
  } else {
    return typeof obj;
  }
}
