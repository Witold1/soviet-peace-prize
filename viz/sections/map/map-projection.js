// Waterman butterfly projection — built once, reused across map re-renders.

var MAP_PROJ = null;
var MAP_LAND_DENSE = null;
var MAP_LAKES_DENSE = null;

function mapGetProjection() {
  if (MAP_PROJ) return MAP_PROJ;

  var PI = Math.PI;
  var RAD = PI / 180;
  var DEG = 180 / PI;
  var EDGE = 0.9486832980505138;
  var EDGE_REST = 0.31622776601683794;
  var TILT = -PI / 6;
  var TILT_COS = Math.cos(TILT);
  var TILT_SIN = Math.sin(TILT);
  var VERTICES = [[0, 90], [-90, 0], [0, 0], [90, 0], [180, 0], [0, -90]];
  var OCTAHEDRON = [[0, 2, 1], [0, 3, 2], [5, 1, 2], [5, 2, 3], [0, 1, 4], [0, 4, 3], [5, 4, 1], [5, 3, 4]]
    .map(function (face) { return face.map(function (index) { return VERTICES[index]; }); });

  function cartesian(lon, lat) {
    var lambda = lon * RAD;
    var phi = lat * RAD;
    var cosPhi = Math.cos(phi);
    return [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)];
  }

  function spherical(xyz) {
    return [
      Math.atan2(xyz[1], xyz[0]) * DEG,
      Math.asin(Math.max(-1, Math.min(1, xyz[2]))) * DEG
    ];
  }

  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function centroid(coords) {
    var x = 0;
    var y = 0;
    var z = 0;
    coords.forEach(function (pair) {
      var point = cartesian(pair[0], pair[1]);
      x += point[0];
      y += point[1];
      z += point[2];
    });
    var magnitude = Math.hypot(x, y, z);
    return [Math.atan2(y, x) * DEG, Math.asin(z / magnitude) * DEG];
  }

  function rotateToCenter(longitude, latitude) {
    var deltaLambda = -longitude * RAD;
    var deltaPhi = -latitude * RAD;
    var cosDeltaPhi = Math.cos(deltaPhi);
    var sinDeltaPhi = Math.sin(deltaPhi);
    return function (lambda, phi) {
      lambda += deltaLambda;
      if (Math.abs(lambda) > PI) lambda -= Math.round(lambda / (2 * PI)) * (2 * PI);
      var cosPhi = Math.cos(phi);
      var x = Math.cos(lambda) * cosPhi;
      var y = Math.sin(lambda) * cosPhi;
      var z = Math.sin(phi);
      var lift = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        Math.atan2(y, x * cosDeltaPhi - z * sinDeltaPhi),
        Math.asin(Math.max(-1, Math.min(1, lift)))
      ];
    };
  }

  function faceProject(face) {
    var center = face.length === 6 ? centroid(face) : face[0];
    var rotate = rotateToCenter(center[0], center[1]);
    return function (lonlat) {
      var rotated = rotate(lonlat[0] * RAD, lonlat[1] * RAD);
      var cosPhi = Math.cos(rotated[1]);
      var denominator = Math.cos(rotated[0]) * cosPhi;
      if (denominator < 0.05) return null;
      return [cosPhi * Math.sin(rotated[0]) / denominator, -Math.sin(rotated[1]) / denominator];
    };
  }

  function sharedEdge(a, b) {
    var found = null;
    for (var i = 0; i < a.length; i += 1) {
      var start = a[i];
      for (var j = b.length - 1; j >= 0; j -= 1) {
        var end = b[j];
        if (start[0] === end[0] && start[1] === end[1]) {
          if (found) return [found, start];
          found = start;
        }
      }
    }
    return null;
  }

  function multiply(a, b) {
    return [
      a[0] * b[0] + a[1] * b[3],
      a[0] * b[1] + a[1] * b[4],
      a[0] * b[2] + a[1] * b[5] + a[2],
      a[3] * b[0] + a[4] * b[3],
      a[3] * b[1] + a[4] * b[4],
      a[3] * b[2] + a[4] * b[5] + a[5]
    ];
  }

  function edgeMatrix(parentEdge, childEdge) {
    var parentSpan = [parentEdge[1][0] - parentEdge[0][0], parentEdge[1][1] - parentEdge[0][1]];
    var childSpan = [childEdge[1][0] - childEdge[0][0], childEdge[1][1] - childEdge[0][1]];
    var turn = Math.atan2(
      parentSpan[0] * childSpan[1] - parentSpan[1] * childSpan[0],
      parentSpan[0] * childSpan[0] + parentSpan[1] * childSpan[1]
    );
    var scale = Math.hypot(parentSpan[0], parentSpan[1]) / Math.hypot(childSpan[0], childSpan[1]);
    var cosTurn = Math.cos(turn);
    var sinTurn = Math.sin(turn);
    return multiply(
      [1, 0, parentEdge[0][0], 0, 1, parentEdge[0][1]],
      multiply(
        [scale, 0, 0, 0, scale, 0],
        multiply(
          [cosTurn, sinTurn, 0, -sinTurn, cosTurn, 0],
          [1, 0, -childEdge[0][0], 0, 1, -childEdge[0][1]]
        )
      )
    );
  }

  var hexagons = OCTAHEDRON.map(function (face) {
    var xyz = face.map(function (pair) { return cartesian(pair[0], pair[1]); });
    var previous = xyz[xyz.length - 1];
    var hexagon = [];
    xyz.forEach(function (next) {
      hexagon.push(
        spherical([
          previous[0] * EDGE + next[0] * EDGE_REST,
          previous[1] * EDGE + next[1] * EDGE_REST,
          previous[2] * EDGE + next[2] * EDGE_REST
        ]),
        spherical([
          next[0] * EDGE + previous[0] * EDGE_REST,
          next[1] * EDGE + previous[1] * EDGE_REST,
          next[2] * EDGE + previous[2] * EDGE_REST
        ])
      );
      previous = next;
    });
    return hexagon;
  });

  var cornerNormals = [];
  var parents = [-1, 0, 0, 1, 0, 1, 4, 5];
  var polygons = hexagons.slice();
  hexagons.forEach(function (hexagon, index) {
    var face = OCTAHEDRON[index];
    var normals = [];
    cornerNormals[index] = normals;
    for (var i = 0; i < face.length; i += 1) {
      var ahead = hexagon[(i * 2 + 2) % hexagon.length];
      var behind = hexagon[(i * 2 + 1) % hexagon.length];
      polygons.push([face[i], ahead, behind]);
      parents.push(index);
      normals.push(cross(cartesian(ahead[0], ahead[1]), cartesian(behind[0], behind[1])));
    }
  });

  var nodes = polygons.map(function (face) {
    return { project: faceProject(face), face: face, transform: null, children: [] };
  });
  nodes.forEach(function (node, index) {
    // Corner triangles belong to the same octahedron face as their hexagon.
    if (index >= 8) node.project = nodes[parents[index]].project;
  });
  parents.forEach(function (parentIndex, index) {
    if (parentIndex >= 0) nodes[parentIndex].children.push(nodes[index]);
  });
  (function attach(node, parent) {
    if (parent) {
      var shared = sharedEdge(node.face, parent.face);
      var matrix = edgeMatrix(shared.map(parent.project), shared.map(node.project));
      node.transform = parent.transform ? multiply(parent.transform, matrix) : matrix;
    }
    node.children.forEach(function (child) { attach(child, node); });
  })(nodes[0], null);

  function faceAt(lon, lat) {
    var lambda = lon * RAD;
    var phi = lat * RAD;
    var cosPhi = Math.cos(phi);
    var vector = [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)];
    var hexagon = lambda < -PI / 2 ? (phi < 0 ? 6 : 4)
      : lambda < 0 ? (phi < 0 ? 2 : 0)
      : lambda < PI / 2 ? (phi < 0 ? 3 : 1)
      : (phi < 0 ? 7 : 5);
    var normals = cornerNormals[hexagon];
    var score = function (normal) { return normal[0] * vector[0] + normal[1] * vector[1] + normal[2] * vector[2]; };
    if (score(normals[0]) < 0) return 8 + 3 * hexagon;
    if (score(normals[1]) < 0) return 8 + 3 * hexagon + 1;
    if (score(normals[2]) < 0) return 8 + 3 * hexagon + 2;
    return hexagon;
  }

  function projectOnNode(node, lon, lat) {
    var point = node.project([lon, lat]);
    if (!point || Math.hypot(point[0], point[1]) > 8) return null;
    var x = point[0];
    var y = point[1];
    if (node.transform) {
      var t = node.transform;
      x = t[0] * point[0] + t[1] * point[1] + t[2];
      y = -(t[3] * point[0] + t[4] * point[1] + t[5]);
    } else {
      y = -point[1];
    }
    return [TILT_COS * x - TILT_SIN * y, TILT_SIN * x + TILT_COS * y];
  }

  function project(lon, lat) {
    return projectOnNode(nodes[faceAt(lon, lat)], lon, lat);
  }

  function sphereInterpolate(a, b, t) {
    var start = cartesian(a[0], a[1]);
    var end = cartesian(b[0], b[1]);
    var omega = Math.acos(Math.max(-1, Math.min(1, start[0] * end[0] + start[1] * end[1] + start[2] * end[2])));
    if (omega < 1e-6) return [a[0], a[1]];
    var sinOmega = Math.sin(omega);
    var w0 = Math.sin((1 - t) * omega) / sinOmega;
    var w1 = Math.sin(t * omega) / sinOmega;
    var xyz = [w0 * start[0] + w1 * end[0], w0 * start[1] + w1 * end[1], w0 * start[2] + w1 * end[2]];
    var magnitude = Math.hypot(xyz[0], xyz[1], xyz[2]);
    return [Math.atan2(xyz[1], xyz[0]) * DEG, Math.asin(Math.max(-1, Math.min(1, xyz[2] / magnitude))) * DEG];
  }

  function densifyRing(ring) {
    var dense = [];
    for (var i = 0; i < ring.length - 1; i += 1) {
      var start = ring[i];
      var end = ring[i + 1];
      dense.push(start);
      var a = cartesian(start[0], start[1]);
      var b = cartesian(end[0], end[1]);
      var steps = Math.ceil(Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * DEG / 2);
      for (var step = 1; step < steps; step += 1) dense.push(sphereInterpolate(start, end, step / steps));
    }
    if (ring.length) dense.push(ring[ring.length - 1]);
    return dense;
  }

  function inwardNormals(face) {
    var points = face.map(function (pair) { return cartesian(pair[0], pair[1]); });
    var center = [0, 0, 0];
    points.forEach(function (point) {
      center[0] += point[0];
      center[1] += point[1];
      center[2] += point[2];
    });
    return points.map(function (point, index) {
      var next = points[(index + 1) % points.length];
      var normal = cross(point, next);
      if (normal[0] * center[0] + normal[1] * center[1] + normal[2] * center[2] < 0) {
        normal = [-normal[0], -normal[1], -normal[2]];
      }
      return normal;
    });
  }

  function clipToFace(ring, normals) {
    var polygon = ring.map(function (pair) {
      return { lon: pair[0], lat: pair[1], xyz: cartesian(pair[0], pair[1]) };
    });
    if (polygon.length > 1) {
      var first = polygon[0];
      var last = polygon[polygon.length - 1];
      if (first.lon === last.lon && first.lat === last.lat) polygon.pop();
    }
    normals.forEach(function (normal) {
      if (!polygon.length) return;
      var output = [];
      for (var i = 0; i < polygon.length; i += 1) {
        var current = polygon[i];
        var next = polygon[(i + 1) % polygon.length];
        var currentSide = normal[0] * current.xyz[0] + normal[1] * current.xyz[1] + normal[2] * current.xyz[2];
        var nextSide = normal[0] * next.xyz[0] + normal[1] * next.xyz[1] + normal[2] * next.xyz[2];
        var currentIn = currentSide >= -1e-9;
        var nextIn = nextSide >= -1e-9;
        if (currentIn && nextIn) {
          output.push(next);
        } else if (currentIn !== nextIn) {
          var denom = currentSide - nextSide;
          var t = Math.abs(denom) < 1e-12 ? 0 : currentSide / denom;
          var xyz = [
            current.xyz[0] + (next.xyz[0] - current.xyz[0]) * t,
            current.xyz[1] + (next.xyz[1] - current.xyz[1]) * t,
            current.xyz[2] + (next.xyz[2] - current.xyz[2]) * t
          ];
          var magnitude = Math.hypot(xyz[0], xyz[1], xyz[2]);
          xyz[0] /= magnitude;
          xyz[1] /= magnitude;
          xyz[2] /= magnitude;
          output.push({
            lon: Math.atan2(xyz[1], xyz[0]) * DEG,
            lat: Math.asin(Math.max(-1, Math.min(1, xyz[2]))) * DEG,
            xyz: xyz
          });
          if (nextIn) output.push(next);
        }
      }
      polygon = output;
    });
    return polygon;
  }

  var facePlanes = nodes.map(function (node) { return inwardNormals(node.face); });

  MAP_PROJ = {
    nodes: nodes,
    facePlanes: facePlanes,
    project: project,
    projectOnNode: projectOnNode,
    densifyRing: densifyRing,
    clipToFace: clipToFace
  };
  return MAP_PROJ;
}

function mapDensifiedLand() {
  if (MAP_LAND_DENSE) return MAP_LAND_DENSE;
  var proj = mapGetProjection();
  MAP_LAND_DENSE = LAND.map(proj.densifyRing);
  return MAP_LAND_DENSE;
}

function mapDensifiedLakes() {
  if (MAP_LAKES_DENSE) return MAP_LAKES_DENSE;
  var proj = mapGetProjection();
  MAP_LAKES_DENSE = LAKES.map(proj.densifyRing);
  return MAP_LAKES_DENSE;
}
