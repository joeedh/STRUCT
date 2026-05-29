# nSTRUCT.js

nSTRUCT.js is a [ProtoBuf-like](https://developers.google.com/protocol-buffers/docs/overview)
serialization system for JavaScript.
It's designed with JavaScript in mind, and supports direct serialization/deserialization
of objects (unlike ProtoBuf or JSON, which build intermediary objects).

## Example

```js
import * as nstructjs from "nstructjs";

class Point {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  loadSTRUCT(reader) { reader(this); }

  static STRUCT = nstructjs.inlineRegister(this, `
    Point { x : float; y : float; }
  `);
}

const data = [];                                  // write to a byte array
nstructjs.writeObject(data, new Point(1, 2));

const view = new DataView(new Uint8Array(data).buffer);
const p = nstructjs.readObject(view, Point);      // -> Point { x: 1, y: 2 }
```

## Documentation

The maintained documentation lives in [`documentation/`](documentation/index.md):

- [Introduction and Examples](documentation/Intro-and-Examples.md)
- [Reading and Writing (binary)](documentation/Reading-And-Writing.md)
- [JSON](documentation/JSON.md)
- [Specification](documentation/Specification.md)

The full API reference is generated with [TypeDoc](https://typedoc.org/) (`pnpm docs`, output in
`docs/`) and includes the pages above. The old GitHub wiki is **deprecated**.

## Build

    pnpm install
    pnpm build      # build the library bundles into build/
    pnpm test       # run the vitest suite
    pnpm docs       # generate API docs into docs/


