(function () {
  if (typeof window === "undefined" && typeof global != "undefined") {
    global._nGlobal = global;
  } else if (typeof self !== "undefined") {
    self._nGlobal = self;
  } else {
    window._nGlobal = window;
  }
  
  let exports;
  
  //nodejs?
  if (typeof window === "undefined" && typeof global !== "undefined") {
    console.log("Nodejs!");
  } else {
    exports = {};
    _nGlobal.module = {};
  }
  
  
