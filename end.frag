  if (!(typeof window === "undefined" && typeof global !== "undefined")) {
    //not nodejs?
    _nGlobal.nstructjs = module.exports;    
    _nGlobal.module = undefined;
  }
  
  return module.exports;
})();

if (typeof window === "undefined" && typeof global !== "undefined" && typeof module !== "undefined") {
  console.log("Nodejs!", nexports);
  module.exports = exports = nexports;
}
