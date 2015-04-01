var _test = undefined;
console.log("main!");

require([
  "struct_typesystem", "struct_util", "struct_binpack", "struct"
], function(struct_typesystem, struct_util, struct_binpack, struct) {
  console.log("initialized!", struct_typesystem, struct_binpack);
  
  var exports = _test = {};
  var Class = struct_typesystem.Class;
  
  var TestClass1 = Class([
    function constructor(a, b, c, d) {
      this.a = 0;
      this.b = "test";
      this.c = [0, 1, 2, 3, 4, 5];
      this.d = new struct_util.set(["a", "b", "c", "d", "e", "f", "g"]);
    },
    Class.static_method(function fromSTRUCT(reader) {
      var ret = new TestClass1();
      reader(ret);
      
      return ret;
    }),
    
    function toString() {
      return JSON.stringify(this, undefined, 1);
    }
  ]);
  TestClass1.STRUCT = [
    "test.TestClass1 {",
    "  a : int;",
    "  b : string;",
    "  c : array(int);",
    "  d : iter(static_string[1]);",
    "}"
  ].join("\n");
  
  var TestClass2 = Class([
    function constructor() {
      this.class1 = new TestClass1();
      this.a = ["a", "b", "c", "d", "e", "f", "g"];
      this.b = ["a", "b", "c", "d", "e", "f", "g"];
    },
    Class.static_method(function fromSTRUCT(reader) {
      var ret = new TestClass2();
      reader(ret);
      
      return ret;
    }),
    
    function toString() {
      return JSON.stringify(this, undefined, 1);
    }
  ]);
  
  TestClass2.STRUCT = [
    "test.TestClass2 {",
    "  class1 : test.TestClass1;",
    "  a      : array(e, int) | e.charCodeAt(0);",   //convert to integer array
    "  b      : string        | obj.b.join(', ');", //concatenate array to string
    "}"
  ].join("\n");
  
  struct.manager.add_class(struct_util.IDGen);
  struct.manager.add_class(TestClass1);
  struct.manager.add_class(TestClass2);
  
  var test_struct = exports.test_struct = function test_struct() {
    var data = [];
    
    var tst1 = new TestClass1();
    var tst2 = new TestClass2();
    
    //console.log(""+tst2);
    struct.manager.write_object(data, tst1);
    data = new DataView(new Uint8Array(data).buffer);
    
    var tst1_read = struct.manager.read_object(data, TestClass1);
    console.log(""+tst1_read);
    
    data = [];
    struct.manager.write_object(data, tst2);
    data = new DataView(new Uint8Array(data).buffer);
    
    var tst2_read = struct.manager.read_object(data, TestClass2);
    console.log(""+tst2_read);
    
    
  }
  
  test_struct();
  
  return exports;
});
