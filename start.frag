(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else {
      function getGlobal() {
        return this;
      }
      
      //Browser globals case. Just assign the
      //result to a property on the global.
      
      if (typeof window === "object") {
        window.nstructjs = factory();
      } else if (typeof self === "object") { //browser worker
        self.nstructjs = factory();
      } else if (typeof module === "object") { //node.js
        module.exports = factory();
      }
    }
}(this, function () {
    //almond, and your modules will be inlined here
