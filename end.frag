  {
    let glob = !((typeof window === "undefined" && typeof self === "undefined") && typeof global !== "undefined");

    //try to detect nodejs in es6 module mode
    glob = glob || (typeof global !== "undefined" && typeof global.require === "undefined");


    if (glob) {
        //not nodejs?
        _nGlobal.nstructjs = module.exports;
        _nGlobal.module = undefined;
    }
  }
  
  return module.exports;
})();

if (typeof window === "undefined" && typeof global !== "undefined" && typeof module !== "undefined") {
  console.log("Nodejs!", nexports);
  module.exports = exports = nexports;
}
