global.DEBUG = {
  tinyeval : true
};

//let structjs = require('../build/nstructjs');
let structjs = require('../src/structjs');
let filehelper = structjs.filehelper;
let fs = require('fs');

structjs.useTinyEval();

class Point {
  constructor(x, y) {
    this.co = [x, y];
    this.flag = 0;
    this.id = -1;
  }
}

Point.STRUCT = [
"node.Point {",
"  co   : array(float);",
"  flag : int | this.flag;",
"  id   : int;",
"}"
].join("\n");
structjs.manager.add_class(Point, "node.Point");

class Polygon {
  constructor(points) {
    this.points = [];
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
    
    if (points !== undefined) {
      for (let p of points) {
        this.points.push(p);
      }
    }
  }
  
  loadSTRUCT(reader) {
    reader(this);
    
    console.log(this.pointmap);
    console.log(this.pointmap2);
  }
  toJSON() {
    let points = [];
    
    for (let p of this.points) {
      points.push(p.id);
    }
    
    return {
      points : points,
      id     : this.id,
      flag   : this.flag
    }
  }
}

Polygon.STRUCT = `
node.Polygon {
  id        : int;
  flag      : int;
  pointmap  : iterkeys(e, int);
  pointmap2 : iterkeys(int);
  points    : array(e, int) | e.id;
  active    : int | this.points.active !== undefined ? this.points.active : -1;
}`;

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
      this.idmap[p.id] = p;
    }
    
    for (let p of this.polygons) {
      this.idmap[p.id] = p;
      
      for (let i=0; i<p.points.length; i++) {
        p.points[i] = this.idmap[p.points[i]];
      }
    }
  }
}

Canvas.STRUCT = [
"node.Canvas {",
"  idgen    : int;",
"  points   : array(node.Point);",
"  polygons : array(node.Polygon);",
"}"
].join("\n");
structjs.manager.add_class(Canvas, "node.Canvas");

function test_main() {
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
  
  //read back data
  let reader = new filehelper.FileHelper(params);
  let blocks = reader.read(data);
  
  let canvas2 = blocks[0].data;
  let json1 = JSON.stringify(canvas, undefined, 2);
  let json2 = JSON.stringify(canvas2, undefined, 2);
  
  let passed = json1.length == json2.length;
  passed = passed && JSON.stringify(writer.version) == JSON.stringify(reader.version);
  
  if (!passed) {
    console.log(json2);
  }
  
  console.log(passed ? "PASSED" : "FAILED")
}

test_main();
