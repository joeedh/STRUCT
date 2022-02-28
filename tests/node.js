global.DEBUG = {
  tinyeval : false
};

//let structjs = require('../build/nstructjs');
import * as structjs from '../src/structjs.js';

/*
try {
  structjs = require('../src/structjs');
} catch (error) {
  console.error("Didn't load src files; trying packed ones. . .");

  try {
    structjs = require('nstructjs');
  } catch (error) {
    try {
      structjs = require("../build/nstructjs.js");
    } catch (error) {
      structjs = require("../nstructjs.js");
    }
  }
}//*/

structjs.setAllowOverriding(false);

let filehelper = structjs.filehelper;
import fs from 'fs';

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
    this.sid = ~~((Math.random()*255) - 127);
    this.strtest = {};
  }

  loadSTRUCT(reader) {
    reader(this);

    this.strtest = JSON.parse(this.strtest);
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
  sid  : sbyte;
  strtest : string | JSON.stringify({});
}`;

structjs.register(Point, "node.Point");

class Polygon {
  constructor(points) {
    this.points = [];
    this.idgen = 5;
    this.flag = 0;
    this.id = -1;

    this.strtest = {a : 2};

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

    this.strtest = JSON.parse(this.strtest);

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
  strtest   : string | JSON.stringify({a:2});
}`;
//points3   : static_array[short, 32] | [1,2,3];
structjs.register(Polygon, "node.Polygon");

class PolygonList extends Array {
  constructor() {
    super();
  }
}
PolygonList.STRUCT = `
node.PolygonList {
  this : array(node.Polygon);
}
`;
structjs.register(PolygonList);

class Canvas {
  constructor() {
    this.idgen = 5;
    this.idmap = {};
    this.points = [];
    this.polygons = new PolygonList();
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
    this.points.length = 0;
    this.polygons.length = 0;

    reader(this);

    let idmap = this.idmap = {};

    for (let p of this.points) {
      console.log("P.ID", p.id, p);
      idmap[p.id] = p;
    }
    
    for (let p of this.polygons) {
      idmap[p.id] = p;

      console.log("POLYGON_POINTS", p.points);

      for (let i=0; i<p.points.length; i++) {
        p.points[i] = idmap[p.points[i]];
      }
    }

    for (let p of this.polygons) {
      console.log("POLYGON", p);
      p.afterSTRUCT();
    }
  }
}

Canvas.STRUCT = `
node.Canvas {
  idgen    : int;
  points   : array(abstract(node.Point, "type"));
  polygons : node.PolygonList;
}`;
structjs.register(Canvas, "node.Canvas");

function test_main() {
  structjs.validateStructs();

  let canvas = new Canvas();
  
  let ps = [
    canvas.makePoint(-1, -1),
    canvas.makePoint(1, -1),
    canvas.makePoint(1, 1),
    canvas.makePoint(-1, 1)
  ];
  
  canvas.makePolygon([ps[0], ps[1], ps[2]]);

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


  let njson1 = structjs.writeJSON(canvas);

  console.log("JSON", JSON.stringify(njson1, undefined, 2));
  let canvas4 = structjs.readJSON(njson1, Canvas);
  console.log(canvas4);

  let s41 = JSON.stringify(canvas);
  let s42 = JSON.stringify(canvas4);

  if (s41 !== s42) {
    throw new Error("JSON api failed");
  }

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
  passed = passed && JSON.stringify(writer.version) === JSON.stringify(reader.version);
  
  //console.log(json2.points3);
  if (!passed) {
    console.log(json1, "\n\n\n\n\n\n\n\n\n", json2, json1.length, json2.length);
  }
  structjs.validateStructs();

  //*
  let jsonout = structjs.writeJSON(canvas);

  console.log("Writing JSON");
  console.log(JSON.stringify(jsonout, undefined, 1));
  console.log("done");
  //console.log(structjs.readJSON(jsonout, Canvas));
  //*/

  if (0) {
    let s1 = JSON.stringify(structjs.readJSON(jsonout, Canvas));
    let s2 = JSON.stringify(canvas);
    console.log(s1.length, s2.length);

    passed = passed && s1 === s2;
  }

  //json2 = JSON.stringify(canvas2.polygons, undefined, 2);
  console.log(json2);

  console.log(passed ? "PASSED" : "FAILED")
  if (!passed) {
    process.exit(-1);
  }

  let json = structjs.writeJSON(canvas);
//  json.polygons[0].points[0] = "sdsdfds";

  console.log(structjs.validateJSON(json, Canvas));
}

test_main();

console.log(structjs.isRegistered(Canvas));
