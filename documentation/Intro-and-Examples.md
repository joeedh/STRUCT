# Introduction

**nstructjs** is a ProtoBuf-like binary serialization system for JavaScript. Developed for
production use, it minimizes both storage space and object creation (the source of virtually all
performance problems in JS). The original use case was implementing undo, which required a fast
method of writing the application state into a memory file.

nstructjs differs from ProtoBuf in that it is tied to JS and that it
[compiles its equivalent to .proto files](https://developers.google.com/protocol-buffers/docs/proto#simple)
at runtime. In fact, these "files" are usually embedded in the JS code.

# Direct serialization of objects

Unlike ProtoBuf, nstructjs is designed to serialize and deserialize existing JS object types. It
does not generate object classes for you, it uses the ones you already have. This avoids a great
deal of duplicate object creation, which in large applications can lead to significant performance
loss.

# Example

Here's a simple example of using nstructjs:

```js
class SomeClass {
  constructor(an_object_reference) {
    this.a = 0;
    this.b = "a string";
    this.c = an_object_reference;
    this.d = new SomeOtherClass();
    this.e = true;
    this.f = 1.23432;
  }

  /*
    Optional method to allocate a new instance.

    reader is the exact same continuation that's passed to loadSTRUCT;
    try not to use it (it's necessary for typed arrays to work properly
    with nstructjs).

    Note that the returned value's .loadSTRUCT method is still called,
    though the call to reader inside of it will be ignored.
  */
  static newSTRUCT(reader) {
    return new SomeClass();
  }

  loadSTRUCT(reader) {
    reader(this);
    // If you want to include the parent class's loadSTRUCT,
    // call super.loadSTRUCT here *after* reader has been called.

    // Turn the stored integer id back into an object reference.
    this.c = lookup_object_from_uuid(this.c);
  }
}

SomeClass.STRUCT = `
  mymodule.SomeClass {
    a : int;
    b : string;
    c : int | obj.c.uuid;
    d : SomeOtherClass;
    e : bool;
    f : float;
  }
`;

nstructjs.register(SomeClass);
```

> Tip: instead of assigning `SomeClass.STRUCT` and calling `nstructjs.register` separately, you can
> use [`inlineRegister`](index.md#public-api-at-a-glance):
> `static STRUCT = nstructjs.inlineRegister(this, "...");`

Let's look at the STRUCT script:

    mymodule.SomeClass {

This has the name of our class as well as a module prefix (which is optional). The next lines are
self-explanatory; things get interesting here:

    c : int | obj.c.uuid;   // store an integer ID for this.c instead of the actual object

The code right of `|` is a "helper script", a line of JS code that tells nstructjs how to serialize
a given field. In this case, we want to save the integer UUID of a referenced object (note that
`obj` represents the `SomeClass` instance's `this`).

We can still save the whole object if we want, so long as its constructor is registered with
nstructjs:

    d : SomeOtherClass;     // store full object

# Arrays

If we want to save an array, we can use:

    some_array : array(SomeType);

What if we want to transform the items in the array? nstructjs provides a simple map mechanism for
that:

    some_array : array(item, SomeType) | [do something with item];

The helper JS code will be called once for each item in `some_array`. If, however, you want the
helper code to be executed only once (for the whole array), simply omit the first argument:

    some_array : array(SomeType) | [do something with obj.some_array];

# Abstract Classes

What if you don't know the exact class of a property? In that case, you use the `abstract` keyword:

    some_property : abstract(SomeBaseClass);

This tells nstructjs that `some_property` may be a subclass of `SomeBaseClass`. Since nstructjs is
designed to be very compact, objects are normally saved without any sort of type information; the
`abstract` keyword simply tells nstructjs to write a type ID before `some_property`.

See [Reading and Writing](Reading-And-Writing.md) for how to keep those type IDs stable across
schema changes, and [JSON](JSON.md) for the JSON form of abstract types.
