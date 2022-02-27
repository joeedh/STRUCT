import * as nstructjs from "../build/nstructjs_configurable.js";

let structclass = nstructjs.deriveStructManager({
  script: "JSON"
});

let manager = new structclass;

class Point {
  constructor(co) {
    this.x = 0;
    this.y = 0;
    this.id = 0;

    if (co) {
      this.x = co[0];
      this.y = co[1];
    }
  }
}
Point.JSON = `
Point {
  x  : float;
  y  : float;
  id : int;
}
`;
manager.register(Point);

class Polygon {
  constructor(points) {
    this.points = [];
    this.id = 0;

    if (points) {
      for (let p of points) {
        this.points.push(new Point(p));
      }
    }
  }
}
Polygon.JSON = `
Polygon {
  id     : int;
  points : array(Point);
}
`;
manager.register(Polygon);

class Mesh {
  constructor() {
    this.polygons = [];
  }

  addPolygon(poly) {
    if (!(poly instanceof Polygon)) {
      poly = new Polygon(poly);
    }

    this.polygons.push(poly);
  }
}
Mesh.JSON = `
Mesh {
  polygons : array(abstract(Polygon, "type"));
}
`
manager.register(Mesh);
manager.validateStructs();

let mesh = new Mesh();
mesh.addPolygon([
  [0, 0], [0, 1], [1, 2], [3, 4]
]);
mesh.addPolygon([
  [1, 0], [10, 1], [10, 2], [3, 44]
]);
mesh.addPolygon([
  [0, 1], [20, 1], [11, 2], [33, 4]
]);

let json = manager.writeJSON(mesh);

let mesh2 = manager.readJSON(json, Mesh);
json = manager.writeJSON(mesh2);

console.log(JSON.stringify(json, undefined, 2));

class Mat {

}
Mat.JSON = `
mat4 {
  mat      : array(float) | this.getAsArray();
  isPersp  : int          | this.isPersp;
}
`;

manager.register(Mat);
