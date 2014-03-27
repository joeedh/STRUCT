STRUCT
======

A nice little serialization scheme for ES6.
Note that this code probably doesn't compile
with Tracuer yet (need to strip out my in-house
compiler's type annotations).

=Requirements=
Python >= 3.1
PyPLY ( http://www.dabeaz.com/ply/ )

=Compiling=
If you are brave, and wish to try compiling with the included
in-house ES6->ES5 compiler, simply download and install
Python3 and PLY, open a shell, then do this:

  python js_build.py

ES5.1 code will be built and deposited in a new folder, build/.
A concatenated file will also be generated, build/STRUCT.js.
