# Reading and Writing (binary)

The API for serializing a registered class instance is straightforward:

```js
let data = [];
nstructjs.writeObject(data, anObject);
```

`writeObject` appends the serialized bytes to the array you pass in and returns that same array.

Reading is slightly different — nstructjs reads from a `DataView` but writes to a plain array. Let's
have it read back the data it just wrote:

```js
const view = new DataView(new Uint8Array(data).buffer);
const anObject2 = nstructjs.readObject(view, anObject.constructor);
```

> The `manager` instance also exposes these as methods (`nstructjs.manager.writeObject` /
> `readObject`, and the legacy snake_case `write_object` / `read_object`). The top-level
> `nstructjs.writeObject` / `nstructjs.readObject` functions shown above are the recommended API.

# Handling data structure changes

nstructjs has facilities to handle changes in data structures. The basic idea is to save a copy of
the STRUCT scripts used to generate a given file *inside that file*. You generate this copy with
`nstructjs.write_scripts()`, which you save before the file contents with
`nstructjs.binpack.pack_string`. Note that **you must use `nstructjs.write_scripts()`**, or else the
`abstract` keyword will not work.

To save space, the `abstract` keyword does not store the full type of an object; instead it stores
an integer ID referencing that object's type within the nstructjs system. These IDs are assigned by
a simple incrementer; thus, any change to the *order* of struct registrations will change existing
IDs.

This is where `nstructjs.write_scripts()` comes in. If you look at its output, you'll see entries
like this:

    mymodule.SomeClass id=1 {
    }

## File writing example

Here's a simple example of generating a file with embedded STRUCT scripts:

```js
let data = [];

// Generate id-enabled struct scripts. Note that helper JS code is excluded.
const scripts = nstructjs.write_scripts();

// Write a UTF-8 representation of the scripts.
nstructjs.binpack.pack_string(data, scripts);

// Write the object.
nstructjs.writeObject(data, anObject);
```

## Reading saved STRUCT scripts

Continuing the example above, to load a file with the STRUCT scripts saved inside it we create our
own instance of the manager class. Use `nstructjs.deriveStructManager()` (or `new nstructjs.STRUCT()`
directly):

```js
const load_manager = nstructjs.deriveStructManager();
```

Then get a `DataView` over the saved bytes:

```js
const view = new DataView(new Uint8Array(data).buffer);
```

Create an "unpack context", which is essentially an `ArrayBuffer` file pointer:

```js
const uctx = new nstructjs.binpack.unpack_context();
```

Read the scripts definition string back out:

```js
const scripts = nstructjs.binpack.unpack_string(view, uctx);
```

Feed it to `load_manager`:

```js
load_manager.parse_structs(scripts);
```

We can now use `load_manager` to read the rest of our file (passing the same `uctx` so reading
resumes at the right offset):

```js
const anObject2 = load_manager.readObject(view, anObject.constructor, uctx);
```
