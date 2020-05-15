  if (!(typeof window === "undefined" && typeof global !== "undefined")) {
    //not nodejs?
    _nGlobal.nstructjs = module.exports;    
    _nGlobal.module = undefined;
  }
  
  return exports;
})();

