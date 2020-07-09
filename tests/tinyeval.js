let tinyeval = require("../tinyeval/tinyeval.js");
let a = tinyeval.eval("(function() { return 'asdf';})", {global});
console.log(a())