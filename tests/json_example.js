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
console.log(JSON.stringify(json, undefined, 2));
