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
            iterkeys(ITERNAME, TYPE)

    field => ID : TYPE
             ID : TYPE | JSCODE

    fieldlist => field ;
                 fieldlist field ;

    STRUCT => header fieldlist }

# Semantics

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
