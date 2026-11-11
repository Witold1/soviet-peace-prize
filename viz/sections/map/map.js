var PLACE_GROUPS = [];

function renderMap() {
  document.getElementById("map-chart").replaceChildren();
  const PI = Math.PI;
  const RAD = PI / 180;
  const DEG = 180 / PI;
  const EDGE = 0.9486832980505138;
  const EDGE_REST = 0.31622776601683794;
  const TILT = -PI / 6;
  const TILT_COS = Math.cos(TILT);
  const TILT_SIN = Math.sin(TILT);
  const VERTICES = [[0, 90], [-90, 0], [0, 0], [90, 0], [180, 0], [0, -90]];
  const OCTAHEDRON = [[0, 2, 1], [0, 3, 2], [5, 1, 2], [5, 2, 3], [0, 1, 4], [0, 4, 3], [5, 4, 1], [5, 3, 4]]
    .map(function (face) { return face.map(function (index) { return VERTICES[index]; }); });

  function cartesian(lon, lat) {
    const lambda = lon * RAD;
    const phi = lat * RAD;
    const cosPhi = Math.cos(phi);
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
    let x = 0;
    let y = 0;
    let z = 0;
    coords.forEach(function (pair) {
      const point = cartesian(pair[0], pair[1]);
      x += point[0];
      y += point[1];
      z += point[2];
    });
    const magnitude = Math.hypot(x, y, z);
    return [Math.atan2(y, x) * DEG, Math.asin(z / magnitude) * DEG];
  }

  function rotateToCenter(longitude, latitude) {
    const deltaLambda = -longitude * RAD;
    const deltaPhi = -latitude * RAD;
    const cosDeltaPhi = Math.cos(deltaPhi);
    const sinDeltaPhi = Math.sin(deltaPhi);
    return function (lambda, phi) {
      lambda += deltaLambda;
      if (Math.abs(lambda) > PI) lambda -= Math.round(lambda / (2 * PI)) * (2 * PI);
      const cosPhi = Math.cos(phi);
      const x = Math.cos(lambda) * cosPhi;
      const y = Math.sin(lambda) * cosPhi;
      const z = Math.sin(phi);
      const lift = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        Math.atan2(y, x * cosDeltaPhi - z * sinDeltaPhi),
        Math.asin(Math.max(-1, Math.min(1, lift)))
      ];
    };
  }

  function faceProject(face) {
    const center = face.length === 6 ? centroid(face) : face[0];
    const rotate = rotateToCenter(center[0], center[1]);
    return function (lonlat) {
      const rotated = rotate(lonlat[0] * RAD, lonlat[1] * RAD);
      const cosPhi = Math.cos(rotated[1]);
      const denominator = Math.cos(rotated[0]) * cosPhi;
      if (denominator < 0.05) return null;
      return [cosPhi * Math.sin(rotated[0]) / denominator, -Math.sin(rotated[1]) / denominator];
    };
  }

  function sharedEdge(a, b) {
    let found = null;
    for (let i = 0; i < a.length; i += 1) {
      const start = a[i];
      for (let j = b.length - 1; j >= 0; j -= 1) {
        const end = b[j];
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
    const parentSpan = [parentEdge[1][0] - parentEdge[0][0], parentEdge[1][1] - parentEdge[0][1]];
    const childSpan = [childEdge[1][0] - childEdge[0][0], childEdge[1][1] - childEdge[0][1]];
    const turn = Math.atan2(
      parentSpan[0] * childSpan[1] - parentSpan[1] * childSpan[0],
      parentSpan[0] * childSpan[0] + parentSpan[1] * childSpan[1]
    );
    const scale = Math.hypot(parentSpan[0], parentSpan[1]) / Math.hypot(childSpan[0], childSpan[1]);
    const cosTurn = Math.cos(turn);
    const sinTurn = Math.sin(turn);
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

  const hexagons = OCTAHEDRON.map(function (face) {
    const xyz = face.map(function (pair) { return cartesian(pair[0], pair[1]); });
    let previous = xyz[xyz.length - 1];
    const hexagon = [];
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

  const cornerNormals = [];
  const parents = [-1, 0, 0, 1, 0, 1, 4, 5];
  const polygons = hexagons.slice();
  hexagons.forEach(function (hexagon, index) {
    const face = OCTAHEDRON[index];
    const normals = [];
    cornerNormals[index] = normals;
    for (let i = 0; i < face.length; i += 1) {
      const ahead = hexagon[(i * 2 + 2) % hexagon.length];
      const behind = hexagon[(i * 2 + 1) % hexagon.length];
      polygons.push([face[i], ahead, behind]);
      parents.push(index);
      normals.push(cross(cartesian(ahead[0], ahead[1]), cartesian(behind[0], behind[1])));
    }
  });

  const nodes = polygons.map(function (face) {
    return { project: faceProject(face), face: face, transform: null, children: [] };
  });
  nodes.forEach(function (node, index) {
    // Corner triangles belong to the same octahedron face as their hexagon.
    // Project them from that shared center so the edges meet; a separate
    // gnomonic fit leaves a gap along the shared edge.
    if (index >= 8) node.project = nodes[parents[index]].project;
  });
  parents.forEach(function (parentIndex, index) {
    if (parentIndex >= 0) nodes[parentIndex].children.push(nodes[index]);
  });
  (function attach(node, parent) {
    if (parent) {
      const shared = sharedEdge(node.face, parent.face);
      const matrix = edgeMatrix(shared.map(parent.project), shared.map(node.project));
      node.transform = parent.transform ? multiply(parent.transform, matrix) : matrix;
    }
    node.children.forEach(function (child) { attach(child, node); });
  })(nodes[0], null);

  function faceAt(lon, lat) {
    const lambda = lon * RAD;
    const phi = lat * RAD;
    const cosPhi = Math.cos(phi);
    const vector = [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)];
    const hexagon = lambda < -PI / 2 ? (phi < 0 ? 6 : 4)
      : lambda < 0 ? (phi < 0 ? 2 : 0)
      : lambda < PI / 2 ? (phi < 0 ? 3 : 1)
      : (phi < 0 ? 7 : 5);
    const normals = cornerNormals[hexagon];
    const score = function (normal) { return normal[0] * vector[0] + normal[1] * vector[1] + normal[2] * vector[2]; };
    if (score(normals[0]) < 0) return 8 + 3 * hexagon;
    if (score(normals[1]) < 0) return 8 + 3 * hexagon + 1;
    if (score(normals[2]) < 0) return 8 + 3 * hexagon + 2;
    return hexagon;
  }

  function projectOnNode(node, lon, lat) {
    const point = node.project([lon, lat]);
    if (!point || Math.hypot(point[0], point[1]) > 8) return null;
    let x = point[0];
    let y = point[1];
    if (node.transform) {
      const t = node.transform;
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
    const start = cartesian(a[0], a[1]);
    const end = cartesian(b[0], b[1]);
    const omega = Math.acos(Math.max(-1, Math.min(1, start[0] * end[0] + start[1] * end[1] + start[2] * end[2])));
    if (omega < 1e-6) return [a[0], a[1]];
    const sinOmega = Math.sin(omega);
    const w0 = Math.sin((1 - t) * omega) / sinOmega;
    const w1 = Math.sin(t * omega) / sinOmega;
    const xyz = [w0 * start[0] + w1 * end[0], w0 * start[1] + w1 * end[1], w0 * start[2] + w1 * end[2]];
    const magnitude = Math.hypot(xyz[0], xyz[1], xyz[2]);
    return [Math.atan2(xyz[1], xyz[0]) * DEG, Math.asin(Math.max(-1, Math.min(1, xyz[2] / magnitude))) * DEG];
  }

  function densifyRing(ring) {
    const dense = [];
    for (let i = 0; i < ring.length - 1; i += 1) {
      const start = ring[i];
      const end = ring[i + 1];
      dense.push(start);
      const a = cartesian(start[0], start[1]);
      const b = cartesian(end[0], end[1]);
      const steps = Math.ceil(Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * DEG / 2);
      for (let step = 1; step < steps; step += 1) dense.push(sphereInterpolate(start, end, step / steps));
    }
    if (ring.length) dense.push(ring[ring.length - 1]);
    return dense;
  }

  function inwardNormals(face) {
    const points = face.map(function (pair) { return cartesian(pair[0], pair[1]); });
    const center = [0, 0, 0];
    points.forEach(function (point) {
      center[0] += point[0];
      center[1] += point[1];
      center[2] += point[2];
    });
    return points.map(function (point, index) {
      const next = points[(index + 1) % points.length];
      let normal = cross(point, next);
      if (normal[0] * center[0] + normal[1] * center[1] + normal[2] * center[2] < 0) {
        normal = [-normal[0], -normal[1], -normal[2]];
      }
      return normal;
    });
  }

  function clipToFace(ring, normals) {
    let polygon = ring.map(function (pair) {
      return { lon: pair[0], lat: pair[1], xyz: cartesian(pair[0], pair[1]) };
    });
    if (polygon.length > 1) {
      const first = polygon[0];
      const last = polygon[polygon.length - 1];
      if (first.lon === last.lon && first.lat === last.lat) polygon.pop();
    }
    normals.forEach(function (normal) {
      if (!polygon.length) return;
      const output = [];
      for (let i = 0; i < polygon.length; i += 1) {
        const current = polygon[i];
        const next = polygon[(i + 1) % polygon.length];
        const currentSide = normal[0] * current.xyz[0] + normal[1] * current.xyz[1] + normal[2] * current.xyz[2];
        const nextSide = normal[0] * next.xyz[0] + normal[1] * next.xyz[1] + normal[2] * next.xyz[2];
        const currentIn = currentSide >= -1e-9;
        const nextIn = nextSide >= -1e-9;
        if (currentIn && nextIn) {
          output.push(next);
        } else if (currentIn !== nextIn) {
          const denom = currentSide - nextSide;
          const t = Math.abs(denom) < 1e-12 ? 0 : currentSide / denom;
          const xyz = [
            current.xyz[0] + (next.xyz[0] - current.xyz[0]) * t,
            current.xyz[1] + (next.xyz[1] - current.xyz[1]) * t,
            current.xyz[2] + (next.xyz[2] - current.xyz[2]) * t
          ];
          const magnitude = Math.hypot(xyz[0], xyz[1], xyz[2]);
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

  const missing = [];
  const byPoint = new Map();
  PEOPLE.forEach(function (person) {
    if (person.birthLat == null || person.birthLon == null) {
      missing.push(person);
      return;
    }
    const key = person.birthLat + "," + person.birthLon;
    if (!byPoint.has(key)) byPoint.set(key, []);
    byPoint.get(key).push(person);
  });
  let sharedPlaces = 0;
  let sharedPeople = 0;
  byPoint.forEach(function (people) {
    if (people.length > 1) {
      sharedPlaces += 1;
      sharedPeople += people.length;
    }
  });
  const plotted = PEOPLE.length - missing.length;
  const narrow = mapChartNarrow();
  document.getElementById("map-lead").textContent = mapLead({
    plotted: plotted,
    sharedPeople: sharedPeople,
    sharedPlaces: sharedPlaces,
    narrow: narrow
  });
  document.getElementById("map-source").textContent = mapSource({
    missingCount: missing.length,
    missingNames: missing.map(personName).join(", "),
    narrow: narrow
  });

  const chart = document.getElementById("map-chart");

  function appendMarks(svg, groups, toSvg, projectLonLat, markR, ring) {
    groups.forEach(function (people) {
      const projected = projectLonLat(people[0].birthLon, people[0].birthLat);
      if (!projected) return;
      const xy = toSvg(projected);
      people.forEach(function (person, index) {
        let x = xy[0];
        let y = xy[1];
        if (people.length > 1) {
          const angle = (Math.PI * 2 * index) / people.length - Math.PI / 2;
          x += Math.cos(angle) * ring;
          y += Math.sin(angle) * ring;
        }
        const circle = svgEl("circle");
        circle.setAttribute("cx", x.toFixed(2));
        circle.setAttribute("cy", y.toFixed(2));
        circle.setAttribute("r", markR);
        circle.setAttribute("fill", "transparent");
        circle.setAttribute("stroke", "#000");
        circle.setAttribute("stroke-width", "1.6");
        circle.setAttribute("pointer-events", "all");
        circle.dataset.fill = "transparent";
        circle.dataset.hot = "#000";
        circle.dataset.stroke = "#000";
        circle.dataset.mark = "1";
        circle.dataset.coords = "1";
        circle.dataset.i = String(person.i);
        circle.setAttribute("tabindex", "0");
        circle.setAttribute("role", "img");
        circle.setAttribute("aria-label", mapMarkAria(person));
        if (!wikiFor(person)) circle.classList.add("no-link");
        svg.appendChild(circle);
      });
    });
  }

  // Phone: Mercator regional panels — Waterman folds badly at this size.
  if (narrow) {
    renderMapNarrow(chart, byPoint, appendMarks, densifyRing);
    return;
  }

  chart.classList.remove("is-regions");

  const facePlanes = nodes.map(function (node) { return inwardNormals(node.face); });
  const landShapes = [];
  const coastlines = [];
  const lakeShapes = [];
  const lakeshores = [];

  function projectRing(ring, shapes, outlines) {
    const dense = densifyRing(ring);
    nodes.forEach(function (node, index) {
      const clipped = clipToFace(dense, facePlanes[index]);
      if (clipped.length < 3) return;
      const projected = [];
      for (let i = 0; i < clipped.length; i += 1) {
        const xy = projectOnNode(node, clipped[i].lon, clipped[i].lat);
        if (!xy) continue;
        projected.push(xy);
      }
      if (projected.length >= 3) {
        shapes.push({ points: projected, ringSize: ring.length });
      }
    });
    const outline = [];
    let previous = null;
    dense.forEach(function (pair) {
      const xy = project(pair[0], pair[1]);
      if (!xy || (previous && Math.hypot(xy[0] - previous[0], xy[1] - previous[1]) > 0.2)) {
        if (outline.length > 1) outlines.push(outline.slice());
        outline.length = 0;
      }
      if (!xy) {
        previous = null;
        return;
      }
      outline.push(xy);
      previous = xy;
    });
    if (outline.length > 1) outlines.push(outline);
  }

  LAND.forEach(function (ring) {
    projectRing(ring, landShapes, coastlines);
  });
  LAKES.forEach(function (ring) {
    projectRing(ring, lakeShapes, lakeshores);
  });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  function include(point) {
    if (!point) return;
    if (point[0] < minX) minX = point[0];
    if (point[1] < minY) minY = point[1];
    if (point[0] > maxX) maxX = point[0];
    if (point[1] > maxY) maxY = point[1];
  }
  // Tiny Pacific / Arctic scraps can sit far out in this unfold and steal
  // horizontal space from the Americas. Frame from the main land only.
  landShapes.forEach(function (shape) {
    if (shape.ringSize < 35) return;
    shape.points.forEach(include);
  });
  byPoint.forEach(function (people) {
    include(project(people[0].birthLon, people[0].birthLat));
  });
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const innerW = 960;
  const innerH = innerW * spanY / spanX;
  const pad = 12;
  const mapW = innerW + pad * 2;
  const mapH = innerH + pad * 2;
  function toSvg(point) {
    return [
      pad + (point[0] - minX) / spanX * innerW,
      pad + (maxY - point[1]) / spanY * innerH
    ];
  }

  const svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + mapW + " " + mapH);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("mapAria"));

  const land = svgEl("g");
  land.setAttribute("class", "land");
  function trace(points, close) {
    let d = "";
    points.forEach(function (point, index) {
      const xy = toSvg(point);
      d += (index === 0 ? "M" : "L") + xy[0].toFixed(1) + " " + xy[1].toFixed(1);
    });
    return close ? d + "Z" : d;
  }
  landShapes.forEach(function (shape) {
    const path = svgEl("path");
    path.setAttribute("d", trace(shape.points, true));
    // Fill from .land. No cream stroke: face-edge chords across bays
    // and seams read as stripes when stroked the same color as the fill.
    path.setAttribute("stroke", "none");
    land.appendChild(path);
  });
  lakeShapes.forEach(function (shape) {
    const path = svgEl("path");
    path.setAttribute("class", "lake");
    path.setAttribute("d", trace(shape.points, true));
    path.setAttribute("stroke", "none");
    land.appendChild(path);
  });
  coastlines.forEach(function (line) {
    const path = svgEl("path");
    path.setAttribute("d", trace(line, false));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    land.appendChild(path);
  });
  lakeshores.forEach(function (line) {
    const path = svgEl("path");
    path.setAttribute("d", trace(line, false));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    land.appendChild(path);
  });
  land.setAttribute("pointer-events", "none");
  svg.appendChild(land);

  const groups = [];
  byPoint.forEach(function (people) { groups.push(people); });
  appendMarks(svg, groups, toSvg, project, "4", 5);
  chart.appendChild(svg);
}
