global.DEBUG = {
  tinyeval : false
};

import * as nstructjs from '../src/structjs.js';

export class A {
  static STRUCT = nstructjs.inlineRegister(this, `
  A {
    a : int;
  }
  `);
}

export class B extends A {
  static STRUCT = nstructjs.inlineRegister(this, `
  B {
    b : int;
  }
  `);
}

export class C extends B {
  static STRUCT = nstructjs.inlineRegister(this, `
  C {
    c : int | this.c.fix();
    a : float | 1;
  }
  `);
}
