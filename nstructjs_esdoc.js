const marked = require("marked")

const ASTNodeContainer = require('esdoc/out/src/Util/ASTNodeContainer.js').default;
const ASTUtil = require('esdoc/out/src/Util/ASTUtil').default;
const EPlugin = require('esdoc/out/src/Plugin/Plugin').default;

let pathmod = require("path");

let fs = require('fs');
let fmt = require('./myFormat')
let myFormat = fmt.myFormat,
    myLog = fmt.myLog;

let babel = require("@babel/parser");
  
function stop() {
  process.exit(-1);
}

function lpad(s, n) {
  while (n >= 0) {
    s += " ";
    n--;
  }
  return s;
}

let paths = new Set();
function buildPaths() {
  let f = (path) => {
    path = require.resolve(path);
    
    paths.add(path);
    
    require(path);
    let mod = require.cache[path];
    for (let child of mod.children) {
      f(child.filename);
    }
  }
  //global.require.resolve = req.resolve.bind(req);
  
  f("./src/structjs.js");
  
  //console.log(paths)
}

buildPaths();

let anon_idgen = 1;

function printLines(buf) {
  buf = buf.split("\n");
  let s = "";
  
  for (let i=0; i<buf.length; i++) {
    let c = ""+(i+1);
    while (c.length < 4) {
      c = " " + c;
    }
    
    s += c + ": " + buf[i] + "\n";
  }
  
  console.log(s);
  return s;
}

const acorn = require("acorn");
const walk = require("acorn-walk");
let donemap = {};

function parseFile(f, ev) {
  let buf = fs.readFileSync(f, "ascii")
  
  if (f in donemap) {
    return;
  }
  
  donemap[f] = 1;
  
  let tstbuf = `
  class f {
    method(a, b/*b param*/,     sssc=10) {
      return c;
    }
    
  }
  
  let lit = {
    objmethod(a, b, c) {
    }
  };
  `;
  
  //buf = tstbuf;
  
  let node;
  
  let lexlinemap = new Array(buf.length);
  let linelexmap = [[0, 0]];
  let li = 0;
  
  let starti = 0;
  for (let i=0; i<buf.length; i++) {
    if (buf[i] === "\n") {
      linelexmap.push([starti, i]);
      starti = i;
      li++;
    }
    
    lexlinemap[i] = li+1;
  }
  
  let comments = [];
  let commentmap = new Array(buf.length);
  let nodecommentmap = new Array(buf.length);
  
  node = babel.parse(buf, {
  });


  function isNode(n) {
    if (!n || typeof n !== "object")
      return false;
    if (n.constructor !== undefined && n.constructor.name === "Node")
      return true;
    //if (n.type !== undefined && typeof n.type === "string" && n.type[0] === n.type[0].toUpperCase())
      //return true;
  }
  
  let walk = {
    _walkGen : 0,
    base : {
    },
    _basewalk(node1, state, visit) {
      if (node1.__gen === this._walkGen) {
        //console.warn("circular ast tree", this._walkGen, node1.type);
        return;
      }
      
      node1.__gen = this._walkGen;
      
      for (let k in node1) {
        let v = node1[k];
        
        if (v && typeof v === "object" && v.__gen === this._walkGen) {
          continue;
        }
        
        if (!v || typeof v !== "object") {
          continue;
        }
        
        let isArray = false;
        if (Array.isArray(v)) {//v[0] !== undefined && v.length || Array.isArray(v)) {
          isArray = true;
          
          for (let n of v) {
            if (isNode(n)) {
              visit(n, state)
            }
          }
        }
        
        if (!isNode(v) && !isArray) {
          //check immediate children
          for (let k in v) {
            let v2 = v[k];
              
            if (isNode(v2) && v2.__gen !== this._walkGen) {
              visit(v2, state);
            }
          }
          continue;
        } else {        
          visit(v, state);
        }
      }
    },
    
    recursive(node, state, walkers) {
      this._walkGen++;
      
      for (let k in this.base) {
        if (!(k in walkers)) {
          walkers[k] = this.base[k];
        }
      }
      let visit = (node, state) => {
        let type = node.type;
        //console.log(type);
        
        if (type in walkers) {
          if (walkers[type](node, state, visit) === "descend") {
            this._basewalk(node, state, visit);
          }
        } else {
          this._basewalk(node, state, visit);
        }
      }
      
      visit(node, state);
    },
    
    simple(node, walkers) {
      this._walkGen++;
      
      let ws = {};
      function makeWalker(k, w) {
        return function(node, state, visit) {
          w(node);
          return "descend";
        }
      }
      
      for (let k in walkers) {
        ws[k] = makeWalker(k, walkers[k]);
      
      }
      this.recursive(node, {}, ws);
    },
    
    full(node, cb) {
      this._walkGen++;
      
      
      let visit = (n, state) => {
        cb(n);
        this._basewalk(n, state, visit);
      }
      
      this._basewalk(node, {}, visit);
    }
  }

  
  let visit = {};
  
  function onComment(isBlock, text, start, end, line, col) {
   let cmt = {isBlock, text, start, end, line, col};
   
   for (let i=start; i<=end; i++) {
     commentmap[i] = cmt;
   }
   
   let pad = 3;
   for (let i=0; i<pad; i++) {
     let i2 = Math.max(start - i, 0);
     if (!commentmap[i2]) {
       commentmap[i2] = cmt;
     }
   }
   comments.push(cmt)
 }
  
  let _cvisit = {};
  
  walk.full(node, (n) => {
    let key = JSON.stringify(Object.keys(n)).toLowerCase();
    let a = [];
    
    if (n.leadingComments)
      a = a.concat(n.leadingComments);
    if (n.trailingcomments)
      a = a.concat(a.trailingcomments);
    
    for (let cmt of a) {
      let block = cmt.type === "CommentBlock";
      let cmt2 = [block, cmt.value, cmt.start, cmt.end, cmt.loc.start.line, cmt.loc.start.column];
      cmt2 = JSON.stringify(cmt2).trim();
      
      if (!(cmt2 in _cvisit)) {
        //_cvisit.add(cmt2);
        _cvisit[cmt2] = 1;
        //console.log(cmt2);
        onComment(block, cmt.value, cmt.start, cmt.end, cmt.loc.start.line, cmt.loc.start.column);
      }
    }
  });
  
  //console.log(node)
  ///process.exit()
  /*
  node = acorn.parse(buf, {
     ecmaVersion : 6,
     onComment(isBlock, text, start, end, line, col) {
       let cmt = {isBlock, text, start, end, line, col};
       
       for (let i=start; i<=end; i++) {
         commentmap[i] = cmt;
       }
       
       let pad = 3;
       for (let i=0; i<pad; i++) {
         let i2 = Math.max(start - i, 0);
         if (!commentmap[i2]) {
           commentmap[i2] = cmt;
         }
       }
       comments.push(cmt)
     },

     locations : true,
     ranges : true
  });*/

  
  for (let i=0; i<buf.length-1; i++) {
    let c1 = commentmap[i], c2 = commentmap[i+1];
    if (!c1 || !c2 || c1 === c2)
      continue;
    
    
    c1.text += "\n" + c2.text;
    
    while (i < buf.length && commentmap[i]) {
      commentmap[i] = c1;
      i++;
    }
    
  }
  
  function domap(n) {
    for (let i=n.start; i<n.end; i++) {
      nodecommentmap[i] = n;
    }
  }
  
  let __i = 0;
  function findcomment(n, n2, start=n.start, dir=-1, limit=undefined) {
    if (__i++ == 1) {
      //myLog(n);
      //console.log(n);
      //stop()
    }
    
    let i = start;
    let n3 = n;
    let line = n.loc.start.line;
    
    //console.log(line, lexlinemap[i])
    while (i >= 0 && i < buf.length) {
      let cmt = commentmap[i];
      if (nodecommentmap[i]) {
        n3 = nodecommentmap[i];
      }
      
      if (cmt) {
        return cmt;
      }

      let line2 = lexlinemap[i];
      if (line2 < line-3) {// && n3 !== n) {
        break;
      }
      //if (n3 !== n) {
      //  return;
      //}
      
      if (limit !== undefined && Math.abs(i - start) >= limit) {
        break;
      }

      i += dir;
    }
  }
  
  walk.simple(node, {
      FunctionDeclaration(n) {
        domap(n);
      }, 
      FunctionExpression(n) {
        domap(n);
      },
      ClassExpression(n) {
        domap(n);
      },
      ClassDeclaration(n) {
        domap(n);
      },
      ClassMethod(n) {
        domap(n);
      },
      ObjectMethod(n) {
        domap(n);
      }
  });
  /*
  try {
    node = acorn.parse(buf);
  } catch (error) {
    printLines(buf)
    console.log(error.message);
    return -1;
  }//*/
  
  if (!node)
    return -1;
  
  let types = new Set();
  walk.full(node, (node) => {
    types.add(node.type);
  });
  //console.log(types)
  
  function genjs(node) {
    let s = "";
    
    let walkers = {
        Identifier(n) {
          s += n.name;
        },
        RegExpLiteral(n, state, visit) {
          s += n.raw || n.value;
        },
        NullLiteral(n, state, visit) {
          s += n.raw || n.value;
        },        
        BooleanLiteral(n, state, visit) {
          s += n.raw || n.value;
        },
        StringLiteral(n, state, visit) {
          s += n.raw || n.value;
        },
        NumericLiteral(n, state, visit) {
          s += n.value;
        },
        Literal(n, state, visit) {
          s += n.raw;
        },
        ObjectExpression(n, state, visit) {
          s += "{\n";
          
          for (let p of n.properties) {
            s += "    ";
            let l1 = s.length;
            visit(p.key);
            let len = s.length - l1;
            len = Math.max(15 - len, 0);
            s += lpad("", len);
            
            s += ":  "
            visit(p.value);
            //function findcomment(n, n2, start=n.start, dir=-1, limit=undefined) {
            let cmt = findcomment(p.value, undefined, p.end, 1, 3);
              
            s += ",";

            if (cmt) {
              s += ` /*${cmt.text}*/`;
            }
            s += "\n";
          }
          s += "}\n";
        },
        MemberExpression(n, state, visit) {
          visit(n.object);
          s += ".";
          visit(n.property)
        },
        AssignmentExpression(n, state, visit) {
          if (n.operator != "=") {
            visit(n.left);
            s += n.operator;
            visit(n.right);
            return;
          }
          s += " ";
          visit(n.left);
          s += " = ";
          visit(n.right);
          s += " "
        },
        AssignmentPattern(n, state, visit) {
          visit(n.left);
          s += "=";
          visit(n.right);
        },
        FunctionExpression(n, state, visit) {
          s += " function ";
          if (n.id) {
            visit(n.id);
          }
          
          s += "("
          
          let i = 0;
          for (let p of n.params) {
            if (i > 0) {
              s += ", ";
            }
            
            visit(p);
            
            i++;
          }
          ///visit(n.params);
          s += ") {\n";
          visit(n.body);
          s += "}\n";
        },
        FunctionDeclaration(n, state, visit) {
          walkers.FunctionExpression(n, state, visit)
        }
        
    };
    
    walk.recursive(node, {}, walkers);
    
    //return ""
    return s;
  }

  //console.log(types);
  let exports = {};
  
  walk.simple(node, {
    MemberExpression(n) {
      let s = genjs(n);
      //console.log(s)
    },
    AssignmentExpression(n) {
      let s = genjs(n.left).trim();
      if (s.startsWith("exports.") && s.split(".").length == 2) {
        let name = s.split(".")[1]
        
        exports[name] = n.right;
        n.right.exportName = name;
      } else {
        n.right.className = s;
      }
    }
  });

  function setClassName(n) {
    if (n.id) {
      n.className = n.exportName ? n.exportName : n.id.name;
    } else if (n.exportName) {
      n.className = n.exportName;
    } else {
      n.className = "anonymous_objlit_" + (anon_idgen++);
    }
  }
  
  let functions = [];
  let methods = [];
  let classes = [];
  
  console.log("WALK METHODS");
  
  walk.recursive(node, {}, {
    File(n, state, visit) {
      visit(n.program, state);
    },
    Program(n, state, visit) {
      for (let n2 of n.body) {
        visit(n2, state);
      }      
    },
    VariableDeclaration(n, state, visit) {
      visit(n.declarations, state)
    },
    VariableDeclarator(n, state, visit) {
      let name = genjs(n.id)

      if (n.init) {
        n.init.className = name;        
        visit(n.init);
      }
    },
    ClassDeclaration(n, state, visit) {
      state = {Class : n};

      setClassName(n);
      classes.push(n);

      visit(n.body, state);
    },
    ClassExpression(n, state, visit) {
      if (!n.id && n.exportName) {
        n.id = {
          type : "Identifier",
          name : n.exportName
        }
      }
      
      classes.push(n);
      setClassName(n);
      
      state = {Class : n};
      visit(n.body, state);
    },
    
    AssignmentPattern(n, state, visit) {
      if (n.right.type !== "ObjectExpression") {
        visit(n.left, state);
        visit(n.right, state);
        return;
      }
      
      let name = genjs(n.left).trim();
      
      if (name.startsWith("exports.") && name.split(".") == 2) {
        name = name.split(".")[1].trim();
        
        n.exportName = name;
        exports[name] = n;
      }
      
      n.className = name;
      
      visit(n.left, state);
      visit(n.right, state);
    },
    AssignmentExpression(n, state, visit) {
      return this.AssignmentPattern(n, state, visit);
    },
    
    ObjectExpression(n, state, visit) {
      if (!n.className) {
        //n.className = "(anonymous)";
        //n.className = "anonymous_objlit_" + (anon_idgen++);
        
      }
      state = {
        Class : n
      }
      
      for (let p of n.properties) {
        if (isNode(p)) {
          visit(p, state);
        }
      }
    },
    
    ClassMethod(n, state, visit) {
      methods.push(n);
      if (state.Class)
        n.classParent = state.Class;
      
      visit(n.body, state);
      //return "descend";
    },
    
    ObjectMethod(n, state, visit) {
      methods.push(n);
      if (state.Class)
        n.classParent = state.Class;
      visit(n.body, state);
      //return "descend";
    }
  });
  
  if (f.search("struct_intern") >= 0) {
    //console.log("\n", methods);
    //stop();
  }
  
  let idgen = 0;
  for (let d of ev.data.docs) {
    let id = d.__docId__;
    if (id) {
      idgen = Math.max(id+1, idgen);
    }
  }
  idgen = Math.max(idgen, ASTNodeContainer._docId+1);
  
  let _nvisit = new Set();
  
  function makeDoc(args, node) {
    if (args.description) {
      args.description = "<pre>" + args.description + "</pre>";
    }
    
    if (_nvisit.has(node)) {
      return;
    }
    _nvisit.add(node);
    
    if (node === undefined) {
      throw new Error("node cannot be undefined");
    }
    
    let ret = Object.assign({
      __docId__ : idgen++,
      "static" : true
    }, args);
    
    if (!ret.kind) {
      throw new Error("kind field must be specificied");      
    }
    
    myLog(ret);
    
    if (node.classParent) {
      node.parent = node.classParent;
    }
    let found = 0;
    let docs = ev.data.docs;
    for (let i=0; i<docs.length; i++) {
      let d = docs[i];
      
      if (d.longname == ret.longname) {// || d.importPath === ret.importPath) {
        found = 1;
        ret.__docId__ = d.__docId__;
        
        for (let k in d) {
          delete d[k];
        }
        for (let k in ret) {
          d[k] = ret[k];
        }
        ASTNodeContainer._nodes[d.__docId__] = node;
        break;
      }
    }
    
    if (!found) {
      ASTNodeContainer._docId = idgen;
      ASTNodeContainer.addNode(node);
      ev.data.docs.push(ret);
    }
    
    return ret;
  }
  /*
    __docId__: 48,
  access: null,
  content: 
  description: null,
  kind: "file",
  lineNumber: null,
  longname: "C:/dev/nstructjs/etest/test.js",
  name: "etest/test.js",
  static: true,

  */
  
  /*
{
  __docId__: 50,
  access: null,
  async: false,
  description: "yay2",
  generator: false,
  kind: "constructor",
  lineNumber: 11,
  longname: "etest/test.js~Bleh#constructor",
  memberof: "etest/test.js~Bleh",
  name: "constructor",
  params: [{
    description: "int",
    name: "a",
    nullable: null,
    optional: false,
    spread: false,
    types: ["*"],
   }
],
  return: {
   description: "g",
   nullable: null,
   spread: false,
   types: ["*"],
  }
,
  static: false,
 }

{
  __docId__: 51,
  access: null,
  async: false,
  description: "yay2",
  generator: false,
  kind: "method",
  lineNumber: 18,
  longname: "etest/test.js~Bleh#method",
  memberof: "etest/test.js~Bleh",
  name: "method",
  static: false,
 }

  */
  
  let shortname = process.cwd();
  shortname = f.slice(1+shortname.length, f.length);
  
  f = f.replace(/\\/g, "/");
  shortname = shortname.replace(/\\/g, "/");
  
  let fname = pathmod.basename(f);
  
  let prefix = pathmod.basename(process.cwd()) + "/";
  
  let found = 1;
  
  for (let d of ev.data.docs) {
    if (d.kind !== "file") {
      continue;
    }
    
    if (d.longname === f) {
      found = 1;
    }
    
    try {
      let path = require.resolve(d.name);
      found = found || path === f;
    } catch (error) {
      continue;
    }
  }
  
  found=0
  if (!found) {
    //myLog(ev.data.docs)
    let d = makeDoc({
      access : null,
      content : buf,
      description : null,
      longname : f,
      kind : "file",
      name : shortname
    }, node);
  }
  
  for (let n of classes) {
    let cmt = findcomment(n);
    cmt = cmt ? cmt.text : "";
    
    let name = n.exportName ? n.exportName : n.className;
    
    let args = {        
      description : cmt,
      "interface" : false,
      kind : "class",
      lineNumber : n.loc.start.line,
      longname : shortname + "~" + name,
      memberof : shortname,
      name : name,
      static : true
    }
    
    if (n.exportName) {
      args["export"] = true;
      args.importPath = prefix + shortname;
      args.importStyle = "{"+n.exportName+"}";
      
      if (n.exportName in exports) {
        delete exports[n.exportName];
      }
    }
    
    let d = makeDoc(args, n);
  }
  
  function makeParams(m) {
    let params = [];
    
    for (let p of m.params) {
      let pn;
      let opt = false;
      
      if (p.type === "AssignmentExpression" || p.type === "AssignmentPattern") {
        opt = true;
        pn = genjs(p.left);
      } else {
        pn = genjs(p);
      }
      
      let cmt = findcomment(p, undefined, p.end-1, 1, 1);
      cmt = cmt ? cmt.text : "";
      
      params.push({
        description : cmt,
        name : pn,
        nullable : null,
        optional : opt,
        spread : false,
        types : ["*"]
      });
    }
    
    return params;
  }
  
  function doFunc(func) {
    let params = makeParams(func);
    let name = func.exportName ? func.exportName : genjs(func.id);
    let cmt = findcomment(func);
    cmt = cmt ? cmt.text : "";

    let lname = shortname + "~" + name;
    
    let args = {
      accesss : null,
      async : func.async,
      description : cmt,
      kind : "function",
      static : true,
      name : name,
      longname : lname,
      memberof : shortname,
      generator : func.generator,
      params : params
    };
    
    if (func.exportName) {
      args.importPath = prefix + shortname;
      args.importStyle = "{"+name+"}";
      args["export"] = "true";

    }
    makeDoc(args, func);
  }
  
  for (let m of methods) {
    //be compatible with babel
    m.type = "ClassMethod";
    m.classParent.isClass = true;
    
    let params = makeParams(m);
    
    let cmt = findcomment(m);
    cmt = cmt ? cmt.text : "";
    
    let name = genjs(m.key);
    if (m.computed) {
      name = "[" + name + "]"
    }
    
    /*
     params: [{
    description: "",
    name: "a",
    nullable: null,
    optional: false,
    spread: false,
    types: ["*"],
   }

    */
    let cls = m.classParent;
    let cname = cls.exportName ? cls.exportName : cls.className;
    if (""+cname === "undefined") {
      console.log(cname, typeof cname);
      console.log(cls)
      for (let p of cls.properties) {
        console.log(genjs(p.key))
      }
      
      console.log(m, "method error?");
      continue;
    }
    
    let args = {
      accesss : null,
      async : false,
      description : cmt,
      kind : m.kind,
      static : m.static,
      computed : m.computed,
      name : name,
      generator : m.generator,
      params : params
    };
    
    let lname = shortname + "~" + cname;
    args.memberof = lname;
    args.longname = lname + "#" + name
    
    //console.log(m)
    //console.log(name);
    
    let d = makeDoc(args, m);
  }
  
  for (let k in exports) {
    let n = exports[k]
    let cmt = findcomment(n);
    
    cmt = cmt ? cmt.text : "";
    
    if (n.type === "ClassExpression" || n.type === "ClassDeclaration" || (n.type === "ObjectExpression" && n.isClass)) {
      makeDoc({
        "export" : true,
        description : cmt,
        importPath : prefix + shortname,
        importStyle : "{"+k+"}",
        "interface" : false,
        kind : "class",
        lineNumber : n.loc.start.line,
        longname : shortname + "~" + k,
        memberof : shortname,
        name : k,
        static : true
      }, n);
    } else if (n.type === "ObjectExpression") {
      makeDoc({
        "export" : true,
        description : cmt + `<pre>${k} = ${genjs(n)}</pre>`, ///.replace(/\n/g, "</pre>\n"),
        importPath : prefix + shortname,
        importStyle : "{"+k+"}",
        "interface" : false,
        kind : "variable",
        lineNumber : n.loc.start.line,
        longname : shortname + "~" + k,
        memberof : shortname,
        name : k,
        static : true
      }, n);
      
    } else if (n.type === "FunctionExpression") {
      doFunc(n);
    }
  }
  //process.exit(0)
  
  //console.log(idgen)
  //console.log(Object.keys(exports));
  //console.log(node);
}

function* listdir(path) {
  let d = fs.opendirSync(path, {});
  
  for (let item=d.readSync(); item; item=d.readSync()) {
    yield item;
  }
  d.close();
}

function doManual(p) {
  console.log("Generating manual paths... ");
  let opt = p.option;
  
  if (!p.option) {
    p.option = opt = {
      index : "./wiki/Home.md",
      files : []
    }
  }

  let base = "./wiki";
  for (let item of listdir(base)) {
    if (item.isDirectory()) {
      continue;
    }
    
    path = base + "/" + item.name;
    
    let extok = item.name.toLowerCase().endsWith(".md");
    extok = extok || item.name.toLowerCase().endsWith(".html");
    
    if (!extok) {
      continue;
    }
    if (p.option.files.indexOf(path) >= 0) {
      continue;
    }
    p.option.files.push(path);
  }
    
  console.log(p.option.files);
}
class Plugin {
  onHandleDocs(ev) {
    this._docs = ev.data.docs;
    this._option = ev.data.option || {};

    this._ev = ev;
    
    if (!('enable' in this._option)) this._option.enable = true;

    //myLog(ev.data.docs);
    
    console.log(marked.Renderer);
    
    function test(path) {
      for (let p of listdir("./wiki")) {
        if (p.name.trim() === path) {
          return path;
        }
      }
      if (fs.existsSync(path)) {
        ///return path;
      }
      
      return undefined;
    }
    
    /* @ScreenArea @ScreenArea.js~ScreenArea @ScreenArea.js#method @ScreenArea#setCSS 
      ~ is for classes
      # is for functions/methods
    
    **/
    
    let re = /\@[a-zA-Z_$]+[a-zA-Z0-9_$]*/;
    
    function handleRefLink(href, title, text) {
      let matches = [];
      
      let norm = (f) => {
        return f.replace(/\\/g, "/").trim();
      }
      
      if (href.startsWith("@")) {
        href = norm(href.slice(1, href.length));
        
        console.log(href)
        
        for (let doc of ev.data.docs) {
          let w = 0;
          
          if (norm(doc.longname).endsWith(href)) {
            let longname = norm(doc.longname);
            let l = longname.length - href.length;
            let s = longname.slice(0, l);
            
            //console.log("   ------>", s);
            
            if (s.endsWith(".js") || s.endsWith("~") || s.endsWith("#")) {
              matches.push([doc, norm(doc.longname), w]);
            }
            //console.log("->>>>>>.", doc.longname);
          }
          
          if (norm(doc.name) === href) {
            matches.push([doc, norm(doc.name)]);
          }
        }
        console.log("----");
      }
      
      console.log(matches.length);
      let doc;
      let max = -1e17;
      
      for (let r of matches) {
        let doc2 = r[0], key = r[1];
        
        if (doc === undefined || key.length+r[2] > max) {
          doc = doc2;
          max = key.length;
        }
      }
      
      if (doc) {
        let url = doc.longname.replace(/\.js/, ".js.html")
        let type = doc.kind;

        url = type + "/" + url;
        console.log(doc)
        
        let path;
        
        if (doc.memberof) {
          if (doc.kind === "class") {
            path = "class/" + doc.longname + ".html";
          } else {
            path = doc.kind + "/index.html#";
          
            if (doc.static && doc.kind !== "class") {
              path += "static-" + doc.kind + "-" + doc.name;
            } else {
              path += doc.name;
            }
          }
        } else {
          path = doc.longname;
        }
        
        if (path) {
          return {
            href  : path,
            title : title,
            text  : text
          }
        }
      }
    }
    
    
    //stop()
    marked.Renderer.prototype.link = function(href, title, text) {
      href = href.trim();
      
      console.log(href);
      
      let is_href = /https?:\/\//; 
      is_href = href.trim().toLowerCase().search(is_href) == 0.0;
      
      if (!is_href && !href.startsWith("@")) {
        let href2 = href.trim();
        
        href2 = href2.trim();
        if (href2.startsWith("./")) {
          href2 = href2.slice(2, href2.length);
        }
        
        while (href2.startsWith("/")) {
          href2 = href2.slice(1, href2.length).trim();
        }
        
        href = href2;
        
        if (href2.toLowerCase().endsWith(".md")) {
          href2 = href2.slice(0, href2.length-3);
        }
        
        if (test(href2 + ".md") || test(href2 + ".Md") || test(href2 + ".mD") || test(href2 + ".MD")) {
          console.log("found manual page");
          href2 += ".html";
          href = "manual/" + href2;
        }
        
        console.log(href);
        //stop();
      }
      console.log(href, title, text, is_href);
      
      let hr = handleRefLink(href, title, text);
      if (hr) {
        href = "../"+hr.href;
        title = hr.title;
        text = hr.text;
      }
      
      if (this.options.sanitize) {
        try {
          var prot = decodeURIComponent(unescape(href))
            .replace(/[^\w:]/g, '')
            .toLowerCase();
        } catch (e) {
          return text;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return text;
        }
      }
      if (this.options.baseUrl && !originIndependentUrl.test(href)) {
        href = resolveUrl(this.options.baseUrl, href);
      }
      var out = '<a href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    };

    for (let p of EPlugin._plugins) {
      if (p.name === "esdoc-integrate-manual-plugin") {
        console.log(doManual(p));
      }
    }
    
    this._exec();
  }

  _exec() {
    if (!this._option.enable) return this._docs;

    myLog(this._docs);
    
    for (let f of paths) {
      parseFile(f, this._ev);
    }
    
    return this._docs;
  }
}
module.exports = new Plugin();
