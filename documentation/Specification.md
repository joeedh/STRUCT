# Specification

# Grammar

    ID => [a-zA-Z_+][a-zA-Z0-9]*
          ID . ID

    header => ID {
              ID 'id' = NUMBER {

    type => int
            uint
            float
            bool
            byte
            sbyte
            double
            short
            ushort
            string
            static_string [ NUMBER ]
            ID
            abstract(TYPE)
            abstract(TYPE, STRING)
            array(TYPE)
            array(ITERNAME, TYPE)
            iter(TYPE)
            iter(ITERNAME, TYPE)
            iterkeys(TYPE)
            iterkeys(ITERNAME, TYPE)
            static_array [ TYPE , NUMBER ]
            static_array [ TYPE , NUMBER , ITERNAME ]
            optional(TYPE)
            arraybuffer(TYPE)

    field => ID : TYPE
             ID : TYPE | JSCODE
             ID : TYPE | JSCODE | JSCODE
             ID ?: TYPE

    fieldlist => field ;
                 fieldlist field ;

    STRUCT => header fieldlist }

A field name may also be a number, and a `//` comment after the terminating `;` is retained as the
field's comment and reproduced by `formatJSON`.

# Semantics

## Helper scripts

`JSCODE` is a single line of JavaScript, terminated by a newline or a `//` comment, that computes the
value written for a field. It runs on the write side only. The second `JSCODE` form is parsed and
stored but never executed. See [Helper Scripts](HelperScripts.md).

## Endianness

The byte order is configurable via `nstructjs.setEndian(littleEndian)` / `nstructjs.getEndian()`.
**The default is little-endian.** Set it once, consistently, for both writing and reading a given
file. (Historically the format was specified as network/big-endian; the current default is
little-endian, so do not assume big-endian when reading older specs.)

## Type definitions

### int

The `int` type is a signed 32-bit integer.

### uint

The `uint` type is an unsigned 32-bit integer.

### byte

The `byte` type is an unsigned 8-bit integer.

### sbyte

The `sbyte` type is a signed 8-bit integer.

### bool

The `bool` type is an unsigned 8-bit integer. It is cast to a boolean when read from file.

### float

The `float` type is a 32-bit IEEE float.

### double

The `double` type is a 64-bit IEEE float.

### short

The `short` type is a signed 16-bit integer.

### ushort

The `ushort` type is an unsigned 16-bit integer.

### string

The `string` type is an array of unsigned 8-bit integers, encoded as UTF-8.

#### Semantics

Strings are written in these steps:

1. Write the size of the final encoded byte array as a signed 32-bit integer.
2. Write the encoded byte array.

## static_string

The `static_string` type is a fixed-size array of unsigned 8-bit integers. String data that is too
long is truncated to fit within the array; data that is too short is padded with zeros.

## Object type

Object types declared without `abstract()` are written via their STRUCT definitions.

## Abstract object type

Object types saved with `abstract()` must save a signed integer ID referencing their struct
definition within the manager that created them, then write the object as above.

If the client passes an additional string, it is used in JSON mode as the property key under which
the struct name is stored; otherwise `_structName` is used.

## Array

Arrays may be variable length, of any valid STRUCT type, including abstract types.

### Semantics

To write an array:

1. Write a 32-bit signed integer representing the array length.
2. Write each array item according to the STRUCT type rules.

## Iter

The `iter` type is written identically to `array`, but relaxes the requirement for direct,
contiguous arrays — it works with whatever iterator protocol is appropriate for the language.

## IterKeys

`iterkeys` iterates over an object's own keys (using a `for-in` loop). Like `array` and `iter` it
takes an optional iter-key argument.

Example:

    object : iterkeys(e, Something) | this.object[e].getSomething();

## StaticArray

`static_array[TYPE, NUMBER]` stores exactly `NUMBER` elements and writes no length prefix, so the
field occupies a fixed number of bytes. An optional third argument names a per-item iterator variable
for a [helper script](HelperScripts.md#per-item-scripts-on-container-types):

    coords : static_array[float, 3];
    verts  : static_array[int, 4, item] | item.index;

### Semantics

To write a static_array:

1. Write exactly `NUMBER` elements according to the STRUCT type rules. No length is written.

A source array longer than `NUMBER` is truncated. A shorter one is padded by repeating its last
element. An empty or absent value writes `NUMBER` null elements — the zero value for the element
type. It is read back as a plain array of length `NUMBER`.

## Optional

`optional(TYPE)` stores a value that may be absent. `field ?: TYPE` is equivalent shorthand:

    parent  : optional(SomeClass);
    parent ?: SomeClass;

### Semantics

To write an optional:

1. Write a 32-bit signed integer: 1 when the value is present, 0 when it is `undefined` or `null`.
2. When present, write the value according to the STRUCT type rules.

An absent value reads back as `undefined` in binary mode. In JSON it is written as `null` and read
back as `undefined`.

## ArrayBuffer

`arraybuffer(TYPE)` stores a block of fixed-width numeric elements (`byte`, `sbyte`, `short`,
`ushort`, `int`, `uint`, `float`, `double` — no `bool`/`string`) as one bulk copy rather than
element-by-element. The field value may be an `ArrayBuffer`, a typed array, a `DataView`, or a plain
`number[]`; it is read back as the typed array matching `TYPE` (e.g. `arraybuffer(float)` →
`Float32Array`).

### Semantics

To write an arraybuffer:

1. Write a 32-bit signed integer representing the byte length.
2. Write the raw element bytes in the configured byte order (see [Endianness](#endianness)).

When the host's native byte order differs from the configured order, each multi-byte element is
byteswapped on write and on read, so the values round-trip on any platform.
