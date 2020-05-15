
function tab(n) {
  let ret = "";
  for (let i=0; i<n; i++) {
    ret += " ";
  }
  
  return ret;
}

let simples = new Set(["number", "boolean", "string"]);
let fmtSymbol = "__myFormatTag"; //Symbol("myFormatSymbol");
let _fmt_idgen = 1;

let colors = [37, 31, 32, 33, 34, 35, 36]

function setColor(c) {
  c = colors[c];
  
  process.stdout.write("\u001b[" + c + "m")
  process.stdout.flush()
}

let _i = 0;
function color(str, c) {
  let pre;
  
  if (c < colors.length) {
    pre = "\u001b[" + colors[c] + "m";
  } else {
    pre = "\u001b[38;5;" + c.toString(10) + "m";
  }
  
  c2 = colors[0];
  return pre + str + "\u001b[0m";
}

function myFormat(v, tlevel=0, visit=undefined) {
  if (!visit) {
    visit = new Set();
  }
  
  if (v !== null && typeof v === "object" || typeof v === "function") {
    let bad;
    
    bad = v[fmtSymbol] === undefined;
    bad = bad || v[fmtSymbol] === v.__proto__[fmtSymbol];
    
    if (bad) {
      
      v[fmtSymbol] = _fmt_idgen++;
    }
    
    if (typeof v === "object" && visit.has(v[fmtSymbol])) {
      let c = 65 + ~~(Math.random()*50.0)
      return color("<circular ref>", c);
    }
    
    visit.add(v[fmtSymbol]);
  }
  
  if (typeof v === "string") {
    v = v.replace(/\n/g, "\\n").replace(/\r/g, "\\r")
    v = '"' + v + '"';
    
    if (v.length > 64) {
      v = v.slice(0, 64);
    }
    
    return color(v, 133);
  } else if (v === undefined) {
    return "undefined";
  } else if (v === null || v === 1) {
    return "null"
  } else if (simples.has(typeof v)) {
    return ""+v;
  } else if (typeof v === "object") {
    let s = "";
    
    if (Array.isArray(v)) {
      let isSubClass = v.constructor !== Array;
      
      if (isSubClass) {
        s += "<" + v.constructor.name + ">(";
      }
      
      let lines = [];
      let line = "";
      let t = tab(tlevel);
      
      let i = 0;
      for (let item of v) {
        if (i > 0) {
          line += ", ";
        }
        
        if (line.length > 80) {
          lines.push(t + line);
          line = "";
        }
        
        line += myFormat(item, tlevel+1, visit);
        
        i++;
      }
      if (lines.length > 0) {
        line = t + line;
      }
      
      lines.push(line);
      
      s += "["
      for (let l of lines) {
        s += l + (lines.length > 1 ? "\n" : "");
      }
      s += "]"
      if (isSubClass) {
        s += ")"
      }
    } else {
      let keys = [];
      let p = v;
      while (p) {
        keys = keys.concat(Object.keys(p), Object.getOwnPropertySymbols(p));
        p = p.__proto__;
      }
      
      let keys2 = new Set();
      for (let k of keys) {
        keys2.add(k);
      }
      
      keys = [];
      for (let k of keys2) {
        keys.push(k);
      }
      function dokey(k) {
        return "" + k.toString();
      }
      keys.sort((a, b) => {
        a = dokey(a);
        b = dokey(b);
        
        if (a > b)
          return 1;
        else if (a === b)
          return 0;
        else 
          return -1;
      });
      
      let t = tab(tlevel);
      let t2 = tab(tlevel+1);
      
      let s = "{\n";
      for (let k of keys) {
        if (k === fmtSymbol) {
          continue;
        }
        
        let k2 = k;
        let clr = 2;
        
        if (typeof k === "symbol") {
          k2 = "[" + k2.toString() + "]";
          clr = 3;
        }
        
        s += t2 + color(k2, clr) + ": "
        
        let v2, bad=0;
        
        try {
          v2 = v[k];
        } catch (error) {
          bad = 1;
        }
        
        if (bad) {
          s += "<access error>";
        } else {
          s += myFormat(v2, tlevel+1, visit);
        }
        s += ",\n"
      }
      
      s += t + "}\n";
      return s;
    }
    return s;
  } else if (typeof v === "function") {
    let is_class = ""+v;
    is_class = is_class.trim().startsWith("class ");
    
    if (is_class) {
      return color("class", 3) + " " + color(v.name, 6);
    } else {
      return color("function", 18) + " " +color(v.name, 6);
    }
  }
}

function myLog(v) {
  console.log(myFormat(v));
}

exports.myLog = myLog;
exports.myFormat = myFormat;
