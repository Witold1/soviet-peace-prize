var PLACE_GROUPS = [];

function renderMapChart() {
  document.getElementById("map-chart").replaceChildren();
  var proj = mapGetProjection();
  var nodes = proj.nodes;
  var facePlanes = proj.facePlanes;
  var project = proj.project;
  var projectOnNode = proj.projectOnNode;
  var densifyRing = proj.densifyRing;
  var clipToFace = proj.clipToFace;

  var missing = [];
  var byPoint = new Map();
  PEOPLE_SEEN.forEach(function (person) {
    if (person.birthLat == null || person.birthLon == null) {
      missing.push(person);
      return;
    }
    var key = person.birthLat + "," + person.birthLon;
    if (!byPoint.has(key)) byPoint.set(key, []);
    byPoint.get(key).push(person);
  });
  var sharedPlaces = 0;
  var sharedPeople = 0;
  byPoint.forEach(function (people) {
    if (people.length > 1) {
      sharedPlaces += 1;
      sharedPeople += people.length;
    }
  });
  var plotted = PEOPLE_SEEN.length - missing.length;
  var narrow = mapChartNarrow();
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

  var chart = document.getElementById("map-chart");

  function appendMarks(svg, groups, toSvg, projectLonLat, markR, ring) {
    groups.forEach(function (people) {
      var projected = projectLonLat(people[0].birthLon, people[0].birthLat);
      if (!projected) return;
      var xy = toSvg(projected);
      people.forEach(function (person, index) {
        var x = xy[0];
        var y = xy[1];
        if (people.length > 1) {
          var angle = (Math.PI * 2 * index) / people.length - Math.PI / 2;
          x += Math.cos(angle) * ring;
          y += Math.sin(angle) * ring;
        }
        var circle = svgEl("circle");
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

  var landShapes = [];
  var coastlines = [];
  var lakeShapes = [];
  var lakeshores = [];

  function projectDenseRing(dense, ringSize, shapes, outlines) {
    nodes.forEach(function (node, index) {
      var clipped = clipToFace(dense, facePlanes[index]);
      if (clipped.length < 3) return;
      var projected = [];
      for (var i = 0; i < clipped.length; i += 1) {
        var xy = projectOnNode(node, clipped[i].lon, clipped[i].lat);
        if (!xy) continue;
        projected.push(xy);
      }
      if (projected.length >= 3) {
        shapes.push({ points: projected, ringSize: ringSize });
      }
    });
    var outline = [];
    var previous = null;
    dense.forEach(function (pair) {
      var xy = project(pair[0], pair[1]);
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

  mapDensifiedLand().forEach(function (dense, index) {
    projectDenseRing(dense, LAND[index].length, landShapes, coastlines);
  });
  mapDensifiedLakes().forEach(function (dense, index) {
    projectDenseRing(dense, LAKES[index].length, lakeShapes, lakeshores);
  });

  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
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
  var spanX = maxX - minX;
  var spanY = maxY - minY;
  var innerW = 960;
  var innerH = innerW * spanY / spanX;
  var pad = 12;
  var mapW = innerW + pad * 2;
  var mapH = innerH + pad * 2;
  function toSvg(point) {
    return [
      pad + (point[0] - minX) / spanX * innerW,
      pad + (maxY - point[1]) / spanY * innerH
    ];
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + mapW + " " + mapH);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("mapAria"));

  var land = svgEl("g");
  land.setAttribute("class", "land");
  function trace(points, close) {
    var d = "";
    points.forEach(function (point, index) {
      var xy = toSvg(point);
      d += (index === 0 ? "M" : "L") + xy[0].toFixed(1) + " " + xy[1].toFixed(1);
    });
    return close ? d + "Z" : d;
  }
  landShapes.forEach(function (shape) {
    var path = svgEl("path");
    path.setAttribute("d", trace(shape.points, true));
    // Fill from .land. No cream stroke: face-edge chords across bays
    // and seams read as stripes when stroked the same color as the fill.
    path.setAttribute("stroke", "none");
    land.appendChild(path);
  });
  lakeShapes.forEach(function (shape) {
    var path = svgEl("path");
    path.setAttribute("class", "lake");
    path.setAttribute("d", trace(shape.points, true));
    path.setAttribute("stroke", "none");
    land.appendChild(path);
  });
  coastlines.forEach(function (line) {
    var path = svgEl("path");
    path.setAttribute("d", trace(line, false));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    land.appendChild(path);
  });
  lakeshores.forEach(function (line) {
    var path = svgEl("path");
    path.setAttribute("d", trace(line, false));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    land.appendChild(path);
  });
  land.setAttribute("pointer-events", "none");
  svg.appendChild(land);

  var groups = [];
  byPoint.forEach(function (people) { groups.push(people); });
  appendMarks(svg, groups, toSvg, project, "4", 5);
  chart.appendChild(svg);
}
