var structjs = require('../build/structjs').structjs;
var filehelper = structjs.filehelper;
var fs = require('fs');

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
"  flag : int;",
"  id   : int;",
"}"
].join("\n");
structjs.manager.add_class(Point, "node.Point");

class Polygon {
  constructor(points) {
    this.points = [];
    this.flag = 0;
    this.id = -1;
    
    if (points !== undefined) {
      for (var p of points) {
        this.points.push(p);
      }
    }
  }
  
  toJSON() {
    var points = [];
    
    for (var p of this.points) {
      points.push(p.id);
    }
    
    return {
      points : points,
      id     : this.id,
      flag   : this.flag
    }
  }
}

Polygon.STRUCT = [
"node.Polygon {",
"  id     : int;",
"  flag   : int;",
"  points : array(e, int) | e.id;",
"}"
].join("\n");
structjs.manager.add_class(Polygon, "node.Polygon");

class Canvas {
  constructor() {
    this.idgen = 0;
    this.idmap = {};
    this.points = [];
    this.polygons = [];
  }
  
  makePoint(x, y) {
    var p = new Point(x, y);

    p.id = this.idgen++;

    this.idmap[p.id] = p;
    this.points.push(p);
    
    return p;
  }
  
  makePolygon(points) {
    var p = new Polygon(points);

    p.id = this.idgen++;

    this.idmap[p.id] = p;
    this.polygons.push(p);
    
    return p;
  }
  
  onLoadSTRUCT() {
    this.idmap = {};
    
    for (var p of this.points) {
      this.idmap[p.id] = p;
    }
    
    for (var p of this.polygons) {
      this.idmap[p.id] = p;
      
      for (var i=0; i<p.points.length; i++) {
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
  var canvas = new Canvas();
  
  var ps = [
    canvas.makePoint(-1, -1),
    canvas.makePoint(1, -1),
    canvas.makePoint(1, 1),
    canvas.makePoint(-1, 1)
  ];
  
  var poly = canvas.makePolygon(ps);
  
  var params = {
    magic      : "NSTK",
    ext        : ".bin",
    blocktypes : ["DATA"],
    
    version    : {
      major : 0,
      minor : 1,
      micro : 2
    }
  };
  var writer = new filehelper.FileHelper(params);
  
  var data = writer.write([writer.makeBlock("DATA", canvas)]);
  var buf="", data8 = new Uint8Array(data.buffer);
  
  for (var i=0; i<data.length; i++) {
    buf += String.fromCharCode(data8[i]);
  }
  
  fs.writeFileSync("node_test.bin", buf);
  
  //read back data
  var reader = new filehelper.FileHelper(params);
  var blocks = reader.read(data);
  
  var canvas2 = blocks[0].data;
  var json1 = JSON.stringify(canvas, undefined, 2);
  var json2 = JSON.stringify(canvas2, undefined, 2);
  
  var passed = json1.length == json2.length;
  passed = passed && JSON.stringify(writer.version) == JSON.stringify(reader.version);
  
  console.log(passed ? "PASSED" : "FAILED")
}

test_main();
