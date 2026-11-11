function mapChartNarrow() {
  var el = document.getElementById("map-chart");
  if (!el) return false;
  if (el.clientWidth > 0) return el.clientWidth < 640;
  return document.documentElement.getAttribute("data-display") === "phone";
}

function renderMapNarrow(chart, byPoint, appendMarks, densifyRing) {
  const PI = Math.PI;
  const RAD = PI / 180;
  chart.classList.add("is-regions");

  function mercator(lon, lat) {
    // Both axes in radians so lon° and Mercator-y stay on one scale.
    const phi = Math.max(-85.05112878, Math.min(85.05112878, lat)) * RAD;
    return [lon * RAD, Math.log(Math.tan(PI / 4 + phi / 2))];
  }

  function projectMercatorRing(ring, lonCenter, shapes, outlines) {
    // Keep the full ring. Lon-window cuts + Z close draw chords across gulfs
    // and the Arctic; the facet viewBox crops what you see instead.
    const dense = densifyRing(ring);
    let shape = [];
    let outline = [];
    let previous = null;
    function flush() {
      if (shape.length >= 3) shapes.push({ points: shape.slice() });
      if (outline.length > 1) outlines.push(outline.slice());
      shape = [];
      outline = [];
      previous = null;
    }
    dense.forEach(function (pair) {
      let lon = pair[0];
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;
      while (lon < lonCenter - 180) lon += 360;
      while (lon > lonCenter + 180) lon -= 360;
      const xy = mercator(lon, pair[1]);
      if (previous && Math.abs(xy[0] - previous[0]) > PI * 0.9) flush();
      shape.push(xy);
      outline.push(xy);
      previous = xy;
    });
    flush();
  }

  function drawMercatorFacet(groups, lonLo, lonHi, ariaLabel) {
    // Frame in geographic degrees, then convert the window to Mercator.
    let lonMin = Infinity;
    let lonMax = -Infinity;
    let latMin = Infinity;
    let latMax = -Infinity;
    groups.forEach(function (people) {
      const lon = people[0].birthLon;
      const lat = people[0].birthLat;
      if (lon < lonMin) lonMin = lon;
      if (lon > lonMax) lonMax = lon;
      if (lat < latMin) latMin = lat;
      if (lat > latMax) latMax = lat;
    });
    if (!isFinite(lonMin)) return null;
    let lonSpan = Math.max(lonMax - lonMin, 28);
    let latSpan = Math.max(latMax - latMin, 28);
    const lonMid = (lonMin + lonMax) / 2;
    const latMid = (latMin + latMax) / 2;
    lonMin = lonMid - lonSpan / 2;
    lonMax = lonMid + lonSpan / 2;
    latMin = latMid - latSpan / 2;
    latMax = latMid + latSpan / 2;
    const padDeg = Math.max(lonSpan, latSpan) * 0.14;
    lonMin -= padDeg;
    lonMax += padDeg;
    latMin = Math.max(-80, latMin - padDeg);
    latMax = Math.min(80, latMax + padDeg);
    lonMin = Math.max(lonLo - 5, lonMin);
    lonMax = Math.min(lonHi + 5, lonMax);

    const minX = mercator(lonMin, 0)[0];
    const maxX = mercator(lonMax, 0)[0];
    const minY = mercator(0, latMin)[1];
    const maxY = mercator(0, latMax)[1];
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const width = 420;
    const height = Math.max(width * 0.75, width * spanY / spanX);
    const pad = 10;
    const mapW = width + pad * 2;
    const mapH = height + pad * 2;
    function toSvg(point) {
      return [
        pad + (point[0] - minX) / spanX * width,
        pad + (maxY - point[1]) / spanY * height
      ];
    }
    const landShapes = [];
    const coastlines = [];
    const lakeShapes = [];
    const lakeshores = [];
    const lonCenter = (lonMin + lonMax) / 2;
    LAND.forEach(function (ring) {
      projectMercatorRing(ring, lonCenter, landShapes, coastlines);
    });
    LAKES.forEach(function (ring) {
      projectMercatorRing(ring, lonCenter, lakeShapes, lakeshores);
    });
    const svg = svgEl("svg");
    svg.setAttribute("viewBox", "0 0 " + mapW + " " + mapH);
    svg.setAttribute("overflow", "hidden");
    svg.setAttribute("class", "wide");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", ariaLabel);
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
      // Fill comes from .land; no cream stroke on chords across bays.
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
    appendMarks(svg, groups, toSvg, mercator, "5", 6);
    return svg;
  }

  const regions = [
    { key: "mapRegionAmericas", test: function (lon) { return lon < -25; }, lonLo: -170, lonHi: -20 },
    { key: "mapRegionEuropeAfrica", test: function (lon) { return lon >= -25 && lon < 60; }, lonLo: -30, lonHi: 65 },
    { key: "mapRegionAsiaOceania", test: function (lon) { return lon >= 60; }, lonLo: 55, lonHi: 180 }
  ];
  regions.forEach(function (region) {
    const groups = [];
    byPoint.forEach(function (people) {
      if (region.test(people[0].birthLon)) groups.push(people);
    });
    if (!groups.length) return;
    const count = groups.reduce(function (sum, people) { return sum + people.length; }, 0);
    const label = t(region.key);
    const facet = document.createElement("figure");
    facet.className = "map-facet";
    const svg = drawMercatorFacet(groups, region.lonLo, region.lonHi, label + ". " + t("mapAriaRegion"));
    if (!svg) return;
    const cap = document.createElement("figcaption");
    cap.className = "map-facet-cap";
    cap.textContent = label + ", " + countNoun(count, "person", "people", "человек", "человека", "человек");
    facet.appendChild(cap);
    facet.appendChild(svg);
    chart.appendChild(facet);
  });
}
