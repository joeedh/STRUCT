import * as nstructjs from '../src/structjs.js';

class AbstractClass {
  constructor() {
    this.value = 1;
  }
}

AbstractClass.STRUCT = `
AbstractClass {
  value : int;
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
  }
}

Test.STRUCT = `
Test {
  test : abstract(AbstractClass, "type");
}
`;
nstructjs.register(Test);

let json = nstructjs.writeJSON(new Test());
json.test.value = "wer";

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

