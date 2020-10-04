global.DEBUG = {
  tinyeval : true
};

//let structjs = require('../build/nstructjs');
let structjs;

try {
  structjs = require('../src/structjs');
} catch (error) {
  console.error("Didn't load src files; trying packed ones. . .");

  try {
    structjs = require('nstructjs');
  } catch (error) {
    structjs = require("../build/nstructjs.js");
  }
}

structjs.setAllowOverriding(false);

let filehelper = structjs.filehelper;
let fs = require('fs');

structjs.useTinyEval();
//structjs.setDebugMode(3);
//structjs.setWarningMode(3);

class Point {
  constructor(x, y) {
    this.co = [x, y];
    this.flag = 0;
    this.id = -1;
    this.sid = 23;
    this.fid = 3.5;
    this.did = 1.5
    this.bid = 255;
  }
}

Point.STRUCT = `
node.Point {
  co   : array(float);
  flag : int | this.flag;
  id   : int;
  sid  : short;
  bid  : byte;
  fid  : float;
  did  : double;
}`;

structjs.manager.add_class(Point, "node.Point");

class Polygon {
  constructor(points) {
    this.points = [];
    this.idgen = 0;
    this.flag = 0;
    this.id = -1;
    
    this.pointmap = {
      a : 1,
      b : 2,
      c : 5
    };
    this.pointmap2 = {
      a : 1,
      b : 2,
      c : 5
    };
    
    this.uid = Math.pow(2, 32)-1;
    this.usid = (1<<16)-1;
    
    if (points !== undefined) {
      for (let p of points) {
        p.id = this.idgen++;
        this.points.push(p);
      }
    }
    
    this.points3 = this.points.concat([]);
    while (this.points3.length < 32) {
      this.points3.push(this.points3[this.points3.length-1]);
    }
  }
  
  loadSTRUCT(reader) {
    reader(this);
    
    console.log("THIS.POINTS", this.points);
    //console.log(this.pointmap);
    //console.log(this.pointmap2);
  }
  
  afterSTRUCT() {
    let idmap = {};
    for (let p of this.points) {
      console.log(this.points);
      idmap[p.id] = p;
    }
    
    //console.log(this.points3);
    //process.exit();

    for (let i=0; i<this.points3.length; i++) {
      this.points3[i] = idmap[this.points3[i]];
    }
  }
  
  toJSON() {
    let points = [];
    
    for (let p of this.points) {
      points.push(p.id);
    }
    
    return {
      points  : points,
      points2 : this.points, 
      points3 : this.points3,
      id      : this.id,
      uid     : this.uid,
      usid    : this.usid
    }
  }
}

Polygon.STRUCT = `
node.Polygon {
  id        : int;
  uid       : uint;
  usid      : ushort;
  flag      : int;
  pointmap  : iterkeys(e, int);
  pointmap2 : iterkeys(int);
  points3   : static_array[short, 32] | this.points3.map(v => v.id);
  str       : static_string[32] | "asdsa";
  points2   : iter(node.Point) | this.points;
  points    : array(e, int) | e.id;
  active    : int | this.points.active !== undefined ? this.points.active : -1;
}`;
//points3   : static_array[short, 32] | [1,2,3];
structjs.manager.add_class(Polygon, "node.Polygon");

class Canvas {
  constructor() {
    this.idgen = 0;
    this.idmap = {};
    this.points = [];
    this.polygons = [];
  }
  
  makePoint(x, y) {
    let p = new Point(x, y);

    p.id = this.idgen++;

    this.idmap[p.id] = p;
    this.points.push(p);
    
    return p;
  }
  
  makePolygon(points) {
    let p = new Polygon(points);

    p.id = this.idgen++;

    this.idmap[p.id] = p;
    this.polygons.push(p);
    
    return p;
  }
  
  loadSTRUCT(reader) {
    reader(this);
    
    this.idmap = {};
    
    for (let p of this.points) {
      console.log("P.ID", p.id, p);
      this.idmap[p.id] = p;
    }
    
    for (let p of this.polygons) {
      this.idmap[p.id] = p;

      for (let i=0; i<p.points.length; i++) {
        p.points[i] = this.idmap[p.points[i]];
      }
    }
    
    for (let p of this.polygons) {
      p.afterSTRUCT();
    }
  }
}

Canvas.STRUCT = [
"node.Canvas {",
"  idgen    : int;",
"  points   : array(abstract(node.Point));",
"  polygons : array(node.Polygon);",
"}"
].join("\n");
structjs.register(Canvas, "node.Canvas");
//structjs.register(Canvas, "node.Canvas");

function test_main() {
  structjs.validateStructs();

  let canvas = new Canvas();
  
  let ps = [
    canvas.makePoint(-1, -1),
    canvas.makePoint(1, -1),
    canvas.makePoint(1, 1),
    canvas.makePoint(-1, 1)
  ];
  
  let poly = canvas.makePolygon(ps);
  
  let params = {
    magic      : "NSTK",
    ext        : ".bin",
    blocktypes : ["DATA"],
    
    version    : {
      major : 0,
      minor : 1,
      micro : 2
    }
  };


  let writer = new filehelper.FileHelper(params);
  
  let data = writer.write([writer.makeBlock("DATA", canvas)]);
  let data8 = new Uint8Array(data.buffer);
  
  fs.writeFileSync("node_test.bin", data8);

  console.log(structjs.write_scripts(writer.struct, true));
  //return;
  
  //read back data
  let reader = new filehelper.FileHelper(params);
  let blocks = reader.read(data);
  
  let canvas2 = blocks[0].data;
  let json1 = JSON.stringify(canvas, undefined, 2);
  let json2 = JSON.stringify(canvas2, undefined, 2);
  
  let passed = json1.length === json2.length;
  passed = passed && JSON.stringify(writer.version) == JSON.stringify(reader.version);
  
  //console.log(json2.points3);
  if (!passed) {
    console.log(json1, "\n\n\n\n\n\n\n\n\n", json2, json1.length, json2.length);
  }

  structjs.validateStructs();

  let jsonout = structjs.writeJSON(canvas);

  console.log("Writing JSON");
  console.log(JSON.stringify(jsonout, undefined, 1));
  console.log("done");
  console.log(structjs.readJSON(jsonout, Canvas));

  {
    let s1 = JSON.stringify(structjs.readJSON(jsonout, Canvas));
    let s2 = JSON.stringify(canvas);
    console.log(s1.length, s2.length);

    passed = passed && s1 === s2;
  }


  console.log(passed ? "PASSED" : "FAILED")
  if (!passed) {
    process.exit(-1);
  }
}

test_main();
