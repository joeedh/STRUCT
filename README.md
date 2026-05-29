# nSTRUCT.js

nSTRUCT.js is a [ProtoBuf-like](https://developers.google.com/protocol-buffers/docs/overview)
serialization system for JavaScript.
It's designed with JavaScript in mind, and supports direct serialization/deserialization
of objects (unlike ProtoBuf or JSON, which build intermediary objects).

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


