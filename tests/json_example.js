import * as nstructjs from '../src/structjs.js';

class AbstractClass {
  constructor() {
    this.value = 1;
    this.farray = [0, 1, 2, 3];
  }
}

AbstractClass.STRUCT = `
AbstractClass {
  value : int; //value field
  farray : array(float); //float values
}
`;
nstructjs.register(AbstractClass);

class A extends AbstractClass {
}

A.STRUCT = nstructjs.inherit(A, AbstractClass) + "}";
nstructjs.register(A);

class B extends AbstractClass {
}

B.STRUCT = nstructjs.inherit(B, AbstractClass) + "}";
nstructjs.register(B);

class C extends AbstractClass {
}

C.STRUCT = nstructjs.inherit(C, AbstractClass) + "}";
nstructjs.register(C);

class Test {
  constructor() {
    this.test = new C();
    this.tarray = [
      new C(),
      new C(),
      new C()
    ];
  }
}

Test.STRUCT = `
Test {
  test : abstract(AbstractClass, "type"); //comment 2
  tarray : array(abstract(AbstractClass, "type")); //array comment 2
  iarray : iter(abstract(AbstractClass, "type")) | this.tarray; //array comment 2
}
`;
nstructjs.register(Test);

let json = nstructjs.writeJSON(new Test());
//json.test.value = "wer";

console.log("TEST:", nstructjs.formatJSON(json, Test, true));

let s = '';

function logger() {
  for (let arg of arguments) {
    s += arg + " ";
  }

  s += "\n"
}

nstructjs.validateJSON(json, Test, true, true, logger);

console.log(s)
console.log(JSON.stringify(json, undefined, 2));

