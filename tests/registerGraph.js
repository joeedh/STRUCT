import * as nstructjs from '../src/structjs.js';

function makeDummyClass(key) {
  let ret = class {
    constructor() {

    }
  }

  ret.STRUCT = key + ` {
}`;
  nstructjs.register(ret, key);

  return ret;
}

let B = makeDummyClass("B");
let C = makeDummyClass("C");
let D = makeDummyClass("D");
let E = makeDummyClass("E");
let F = makeDummyClass("F");
let G = makeDummyClass("G");

class A {
  constructor() {
    this.a = 1;
    this.b = 2;
    this.c = [
      [0, 0, 0],
      [1, 1, 1]
    ];
    this.d = [
      [new B(), new B(), new B()],
      [new B(), new B(), new B()]
    ]
  }
}
A.STRUCT = `
A {
  a : float;
  b : int;
  c : iter(iter(int));
  d : iter(iter(G));
  e : B;
  f : abstract(F);
  g : iter(array(C));
  h : array(iterkeys(static_array[E, 5]));
}
`;
nstructjs.register(A);

let istruct = new nstructjs.STRUCT();
istruct.registerGraph(nstructjs.manager, A);

console.log(Object.keys(istruct.structs));