# Helper Scripts

A field declaration can carry a _helper script_ — a single line of JavaScript after a `|` that
computes the value written for that field, in place of reading the property directly.

    mymodule.SomeClass {
      c : int | obj.c.uuid;
    }

The script is an expression, not a statement list. nstructjs wraps it as
`function(obj, env) { return <script> }` and calls it with the instance as both `this` and `obj`, so
`obj.c.uuid` and `this.c.uuid` are equivalent. The wrapped function is compiled once per distinct
script text and cached on the manager.

A `//` comment ends the script, and so does a newline. The `;` that terminates the field declaration
comes after the script:

    c : int | obj.c.uuid; // stores an id in place of the reference

## The script runs only on the write side

There is no read-side counterpart. The unpacked value is assigned straight to `obj[fieldName]`, so a
field that writes a transformed value has to undo the transform in `loadSTRUCT`:

```js
loadSTRUCT(reader) {
  reader(this);
  this.c = lookup_object_from_uuid(this.c);
}
```

A field takes one script. The `|` opens a snippet that runs to the end of the line, so a further `|`
on the same line is read as part of that JavaScript expression — a bitwise or — not as a second
script.

## Per-item scripts on container types

`array`, `iter`, `iterkeys`, and `static_array` accept an iterator-variable name before the element
type. Naming one changes when the script runs: once per element, with that name bound to the current
element.

    // once per element, `item` is the element
    verts : array(item, int) | item.index;

    // once for the whole field, `obj` is the instance
    verts : array(int) | obj.verts.map(v => v.index);

The iterator name is bound through the same `env` mechanism the compiled script sees, so `obj` and
`this` still refer to the containing instance inside a per-item script.

`iterkeys` iterates an object's own keys with `for-in`, and its iterator variable is the key rather
than the value:

    object : iterkeys(e, Something) | this.object[e].getSomething();

The per-item form disables the bulk primitive fast path (`array(float)` over a plain number array is
otherwise copied in one block), so prefer the whole-field form when the transform can be expressed
over the array as a whole.

## `this` as a field name

A field named `this` unpacks into the instance itself instead of into a property of it. It is how a
class that _is_ a container — a subclass of `Array`, or a typed-array wrapper — gets its elements
filled without an intermediate property:

    mymodule.IndexBuffer {
      this : array(int);
    }

`validateStructs()` rejects `this` on a value type (`int`, `string`, and the rest), because there is
nothing to unpack _into_. In JSON output the field is written inline rather than under a `"this"`
key.

## Helper scripts and `write_scripts`

`write_scripts()` strips helper scripts by default, since the scripts describe how a particular build
reaches its data and mean nothing to a reader that only has the file. Pass `includeCode = true` to
keep them:

```js
nstructjs.write_scripts(nstructjs.manager, true);
```

## Evaluation and `useTinyEval`

Scripts are compiled with the same evaluator used for the generated pack/unpack code — `eval` by
default, or the bundled sandboxed interpreter after a call to `useTinyEval()`. See
[Configuration](Configuration.md#usetinyeval).
