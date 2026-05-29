# JSON serialization

nstructjs can serialize to JSON in addition to its binary format. The same registered classes and
STRUCT scripts are used for both.

## API

- `nstructjs.writeJSON(obj)` — serialize an object to a plain JSON-compatible object.
- `nstructjs.readJSON(json, classOrStructId)` — read an instance back from JSON.
- `nstructjs.formatJSON(json, cls, addComments?, validate?)` — pretty-print JSON, optionally with
  field comments and validation.
- `nstructjs.validateJSON(json, cls, useInternalParser?, printColors?, logger?)` — validate a JSON
  payload against a struct definition. With `useInternalParser` (the default) the internal parser
  produces nicer error messages.

## Example

```js
class AbstractClass {
  constructor() {
    this.value = 1;
  }

  loadSTRUCT(reader) {
    reader(this);
  }
}
AbstractClass.STRUCT = nstructjs.inlineRegister(AbstractClass, `
  AbstractClass {
    value : int;
  }
`);

// Subclasses inherit the parent's fields automatically with inlineRegister —
// no need to repeat them or call the deprecated nstructjs.inherit.
class A extends AbstractClass {}
A.STRUCT = nstructjs.inlineRegister(A, `A {}`);

class B extends AbstractClass {}
B.STRUCT = nstructjs.inlineRegister(B, `B {}`);

class C extends AbstractClass {}
C.STRUCT = nstructjs.inlineRegister(C, `C {}`);

class Test {
  constructor() {
    this.test = new C();
  }

  loadSTRUCT(reader) {
    reader(this);
  }
}
Test.STRUCT = nstructjs.inlineRegister(Test, `
  Test {
    test : abstract(AbstractClass, "type");
  }
`);
```

Note the `"type"` parameter in the `abstract` keyword — it controls which field in the JSON object
stores the object type. (If omitted, `_structName` is used; see the
[Specification](Specification.md#abstract-object-type).)

To save, use `nstructjs.writeJSON`:

```js
nstructjs.writeJSON(new Test());
```

It produces:

```json
{
  "test": {
    "value": 1,
    "type": "C"
  }
}
```

To read it back, use `nstructjs.readJSON` with the target class (or its struct id):

```js
const test = nstructjs.readJSON(json, Test);
```
