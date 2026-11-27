// Fig. 8a: proportional squares on a Mercator underlay. Europe and Asia are
// geographic subregions from coordinates; North America goes down to countries;
// other parts of the world stay whole. Each square sits near its group's mean
// birth location.
var MAP_SQUARE_UNITS = [
  { key: "mapSqCanada", kind: "country", matchCountry: "Canada", fill: "#7fa0b8", hot: "#4f738c", gx: 0.10, gy: 0.06 },
  { key: "mapSqUnitedStates", kind: "country", matchCountry: "United States", fill: "#5b87ad", hot: "#3a6588", gx: 0.12, gy: 0.22 },
  { key: "mapSqCentralAmerica", kind: "region", fill: "#6f93b0", hot: "#3f6a8a", gx: 0.12, gy: 0.42 },
  { key: "mapSqCuba", kind: "country", matchCountry: "Cuba", fill: "#88a9bc", hot: "#587890", gx: 0.24, gy: 0.34 },
  { key: "mapSqCaribbean", kind: "region", fill: "#9ebac9", hot: "#6c8898", gx: 0.28, gy: 0.46 },
  { key: "mapSqSouthAmerica", kind: "region", fill: "#5f8f9a", hot: "#3a6872", gx: 0.18, gy: 0.72 },
  { key: "mapSqNorthernEurope", kind: "region", fill: "#b8935e", hot: "#8e6c38", gx: 0.50, gy: 0.04 },
  { key: "mapSqWesternEurope", kind: "region", fill: "#d0a45c", hot: "#a57c30", gx: 0.34, gy: 0.26 },
  { key: "mapSqCentralEurope", kind: "region", fill: "#c49a55", hot: "#9a7030", gx: 0.50, gy: 0.22 },
  { key: "mapSqEasternEurope", kind: "region", fill: "#b8874e", hot: "#8c6230", gx: 0.68, gy: 0.26 },
  { key: "mapSqSouthernEurope", kind: "region", fill: "#d4a86a", hot: "#a87e3e", gx: 0.50, gy: 0.52 },
  { key: "mapSqAfrica", kind: "region", fill: "#c17f5a", hot: "#945536", gx: 0.50, gy: 0.80 },
  { key: "mapSqWestAsia", kind: "region", fill: "#8fad7a", hot: "#628454", gx: 0.74, gy: 0.44 },
  { key: "mapSqSouthAsia", kind: "region", fill: "#6f9f7a", hot: "#3f7a52", gx: 0.80, gy: 0.58 },
  { key: "mapSqEastAsia", kind: "region", fill: "#7a9a6f", hot: "#557848", gx: 0.90, gy: 0.20 },
  { key: "mapSqSoutheastAsia", kind: "region", fill: "#5f9470", hot: "#3c7050", gx: 0.88, gy: 0.66 },
  { key: "mapSqOceania", kind: "region", fill: "#6a9274", hot: "#466c52", gx: 0.92, gy: 0.86 }
];

function birthContinent(lon, lat) {
  if (lon < -25) {
    if (lat < 8) return "south";
    if (lat < 13 && lon > -79) return "south";
    return "north";
  }
  if (lon >= 125 && lat < -5) return "oceania";
  if (lon >= 150) return lat < 20 ? "oceania" : "asia";
  if (-18 <= lon && lon <= 52 && -35 <= lat && lat <= 37.5) {
    if (lat >= 36 && lon >= -10 && lon <= 28.5) {
      if (lon < 0) return "europe";
      if (lon <= 12) return "africa";
      return "europe";
    }
    if (lat >= 29 && lat <= 32 && lon >= 24 && lon <= 36) return "africa";
    if (lon >= 32 && lat >= 29) return "asia";
    if (lat < 36) return "africa";
  }
  if (-25 <= lon && lon < 55 && lat > 35) return "europe";
  if (lon >= 26) return "asia";
  return "europe";
}

function europeSubregionKey(lon, lat) {
  if (lat >= 55) return "mapSqNorthernEurope";
  if (lon >= 24 && lat >= 41) return "mapSqEasternEurope";
  if (lat < 44) return "mapSqSouthernEurope";
  if (lon >= 8) return "mapSqCentralEurope";
  return "mapSqWesternEurope";
}

function asiaSubregionKey(lon, lat) {
  if (lon < 60) return "mapSqWestAsia";
  if (lon < 95 && lat > 5 && lat < 38) return "mapSqSouthAsia";
  if (lon < 141 && lat > -12 && lat < 25) return "mapSqSoutheastAsia";
  return "mapSqEastAsia";
}

function northAmericaUnitKey(person) {
  var country = person.birthCountry || "";
  if (country === "United States") return "mapSqUnitedStates";
  if (country === "Canada") return "mapSqCanada";
  if (country === "Cuba") return "mapSqCuba";
  if (country === "Mexico" || country === "Guatemala") return "mapSqCentralAmerica";
  var lon = person.birthLon;
  var lat = person.birthLat;
  if (lon <= -74 && lon >= -85 && lat >= 19 && lat <= 24) return "mapSqCuba";
  if (lon <= -88 && lon >= -118 && lat >= 13.5 && lat <= 33) return "mapSqCentralAmerica";
  if (lon <= -66 && lon >= -125 && lat >= 24 && lat <= 50) return "mapSqUnitedStates";
  if (lat >= 48) return "mapSqCanada";
  return "mapSqCaribbean";
}

function birthSquareUnitKey(person) {
  var lon = person.birthLon;
  var lat = person.birthLat;
  var continent = birthContinent(lon, lat);
  if (continent === "north") return northAmericaUnitKey(person);
  if (continent === "south") return "mapSqSouthAmerica";
  if (continent === "africa") return "mapSqAfrica";
  if (continent === "oceania") return "mapSqOceania";
  if (continent === "europe") return europeSubregionKey(lon, lat);
  return asiaSubregionKey(lon, lat);
}

function squareUnitLabel(unit) {
  if (unit.kind === "country" && unit.matchCountry) return countryLabel(unit.matchCountry);
  return t(unit.key);
}

function mapPackDotsInSquare(cx, cy, side, n, baseR) {
  // Keep inset tight so small tiles (Canada, Cuba, Oceania, …) can still
  // hold full-size marks instead of shrinking to a different weight.
  var inset = Math.max(2, baseR * 0.55);
  var inner = Math.max(baseR * 2.2, side - inset * 2);
  var cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  var rows = Math.max(1, Math.ceil(n / cols));
  // Sparse packs: prefer a short wide grid so two–six dots stay near baseR.
  if (n <= 3) {
    cols = n;
    rows = 1;
  } else if (n <= 6) {
    cols = Math.ceil(n / 2);
    rows = Math.ceil(n / cols);
  }
  var cell = Math.min(inner / cols, inner / rows);
  var r = Math.min(baseR, cell * 0.42);
  if (n <= 8) r = Math.min(baseR, Math.max(r, baseR * 0.9));
  var gridW = Math.max(0, (cols - 1) * cell);
  var gridH = Math.max(0, (rows - 1) * cell);
  var x0 = cx - gridW / 2;
  var y0 = cy - gridH / 2;
  var slots = [];
  for (var i = 0; i < n; i += 1) {
    var col = i % cols;
    var row = Math.floor(i / cols);
    var rowCount = Math.min(cols, n - row * cols);
    var rowOffset = ((cols - rowCount) * cell) / 2;
    slots.push({
      x: x0 + rowOffset + col * cell,
      y: y0 + row * cell,
      r: r
    });
  }
  return slots;
}

function mapSeparateTiles(placed, tileGap) {
  var gap = tileGap == null ? 6 : tileGap;
  for (var pass = 0; pass < 120; pass += 1) {
    var moved = false;
    for (var i = 0; i < placed.length; i += 1) {
      for (var j = i + 1; j < placed.length; j += 1) {
        var a = placed[i];
        var b = placed[j];
        var mx = (a.side + b.side) / 2 + gap;
        var my = mx;
        var dx = b.cx - a.cx;
        var dy = b.cy - a.cy;
        if (dx === 0 && dy === 0) {
          dx = 0.01 * (j - i);
          dy = 0.01 * (i + 1);
        }
        var ox = mx - Math.abs(dx);
        var oy = my - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        if (ox < oy) {
          var sx = dx < 0 ? -1 : 1;
          var pushX = ox * 0.51;
          a.cx -= sx * pushX;
          b.cx += sx * pushX;
        } else {
          var sy = dy < 0 ? -1 : 1;
          var pushY = oy * 0.51;
          a.cy -= sy * pushY;
          b.cy += sy * pushY;
        }
        moved = true;
      }
    }
    if (!moved) break;
  }
}

// Region names are at most two words. Short / abbreviated labels stay on one
// line ("7 ЮВ Азия"); longer ones keep the count with the first word and wrap
// the second ("25 Центральная" / "Европа").
function mapSquareLabelLines(count, label) {
  var words = String(label || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [String(count)];
  var full = count + " " + words.join(" ");
  if (words.length < 2 || words[0].length <= 4 || full.length <= 16) return [full];
  var lines = [count + " " + words[0]];
  for (var i = 1; i < words.length; i += 1) lines.push(words[i]);
  return lines;
}

function renderMapSquares() {
  var chart = document.getElementById("map-squares-chart");
  var lead = document.getElementById("map-squares-lead");
  var source = document.getElementById("map-squares-source");
  if (!chart) return;

  chart.replaceChildren();
  PLACE_GROUPS = [];

  var byKey = new Map();
  MAP_SQUARE_UNITS.forEach(function (unit) {
    byKey.set(unit.key, []);
  });

  PEOPLE_SEEN.forEach(function (person) {
    if (person.birthLat == null || person.birthLon == null) return;
    var key = birthSquareUnitKey(person);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(person);
  });

  var units = [];
  MAP_SQUARE_UNITS.forEach(function (meta) {
    var people = byKey.get(meta.key) || [];
    if (!people.length) return;
    var lonSum = 0;
    var latSum = 0;
    people.forEach(function (person) {
      lonSum += person.birthLon;
      latSum += person.birthLat;
    });
    units.push({
      meta: meta,
      label: squareUnitLabel(meta),
      people: people,
      count: people.length,
      lon: lonSum / people.length,
      lat: latSum / people.length
    });
  });

  var plotted = units.reduce(function (sum, row) { return sum + row.count; }, 0);
  if (lead) lead.textContent = mapSquaresLead({ units: units, people: plotted });
  if (source) source.textContent = mapSquaresSource();

  var PI = Math.PI;
  var RAD = PI / 180;
  function mercator(lon, lat) {
    var phi = Math.max(-85.05112878, Math.min(85.05112878, lat)) * RAD;
    return [lon * RAD, Math.log(Math.tan(PI / 4 + phi / 2))];
  }

  var scale = 13;
  function sideFor(count) {
    return Math.max(22, scale * Math.sqrt(count));
  }

  var lineH = 17;
  var charW = 7.2;
  // Elbow callouts: square corner → elbow → near edge of the name.
  var calloutStem = 14;
  var calloutGap = 8;
  var labelPad = 8;

  // Prefer outward corners in crowded belts (Europe / Asia).
  var preferredCorners = {
    mapSqCanada: ["bl", "br", "tl", "tr"],
    mapSqUnitedStates: ["bl", "br", "tl", "tr"],
    mapSqCentralAmerica: ["bl", "br", "tl", "tr"],
    mapSqCuba: ["br", "tr", "bl", "tl"],
    mapSqCaribbean: ["br", "bl", "tr", "tl"],
    mapSqSouthAmerica: ["br", "bl", "tr", "tl"],
    mapSqNorthernEurope: ["tl", "tr", "bl", "br"],
    mapSqWesternEurope: ["bl", "tl", "br", "tr"],
    mapSqCentralEurope: ["tr", "tl", "br", "bl"],
    mapSqEasternEurope: ["tr", "br", "tl", "bl"],
    mapSqSouthernEurope: ["br", "bl", "tr", "tl"],
    mapSqAfrica: ["br", "bl", "tr", "tl"],
    mapSqWestAsia: ["bl", "br", "tl", "tr"],
    mapSqSouthAsia: ["br", "bl", "tr", "tl"],
    mapSqEastAsia: ["tr", "tl", "br", "bl"],
    mapSqSoutheastAsia: ["br", "bl", "tr", "tl"],
    mapSqOceania: ["br", "bl", "tr", "tl"]
  };

  // Name-only lines for callouts; count sits inside the square.
  function nameMetrics(label) {
    var words = String(label || "").split(/\s+/).filter(Boolean);
    var lines;
    if (!words.length) lines = [];
    else if (words.length < 2 || words[0].length <= 4 || label.length <= 12) lines = [words.join(" ")];
    else {
      lines = [words[0]];
      for (var i = 1; i < words.length; i += 1) lines.push(words[i]);
    }
    var maxLen = 0;
    lines.forEach(function (line) {
      if (line.length > maxLen) maxLen = line.length;
    });
    return {
      lines: lines,
      w: Math.max(28, maxLen * charW),
      h: Math.max(lineH, lines.length * lineH)
    };
  }

  var minMX = Infinity;
  var minMY = Infinity;
  var maxMX = -Infinity;
  var maxMY = -Infinity;
  function includeMerc(xy) {
    if (xy[0] < minMX) minMX = xy[0];
    if (xy[1] < minMY) minMY = xy[1];
    if (xy[0] > maxMX) maxMX = xy[0];
    if (xy[1] > maxMY) maxMY = xy[1];
  }
  units.forEach(function (row) {
    includeMerc(mercator(row.lon, row.lat));
    row.people.forEach(function (person) {
      if (person.birthLon == null || person.birthLat == null) return;
      includeMerc(mercator(person.birthLon, person.birthLat));
    });
  });
  includeMerc(mercator(-130, 0));
  includeMerc(mercator(155, 0));
  includeMerc(mercator(0, -45));
  includeMerc(mercator(0, 70));
  var padLon = 12 * RAD;
  var padLat = mercator(0, 8)[1] - mercator(0, 0)[1];
  minMX -= padLon;
  maxMX += padLon;
  minMY -= padLat;
  maxMY += padLat;

  var spanMX = maxMX - minMX;
  var spanMY = maxMY - minMY;
  var innerW = 960;
  var innerH = Math.max(420, innerW * spanMY / spanMX);
  var pad = 40;
  var mapW = innerW + pad * 2;
  var mapH = innerH + pad * 2;

  function toSvg(xy) {
    return [
      pad + (xy[0] - minMX) / spanMX * innerW,
      pad + (maxMY - xy[1]) / spanMY * innerH
    ];
  }

  var placed = units.map(function (row) {
    var side = sideFor(row.count);
    var metrics = nameMetrics(row.label);
    var xy = toSvg(mercator(row.lon, row.lat));
    // Full caption fits inside large tiles; otherwise count inside + name callout.
    var full = mapSquareLabelLines(row.count, row.label);
    var fullW = 0;
    full.forEach(function (line) {
      fullW = Math.max(fullW, line.length * charW);
    });
    return {
      row: row,
      side: side,
      nameLines: metrics.lines,
      fullLines: full,
      labelW: metrics.w,
      labelH: metrics.h,
      labelInside: false,
      labelCorner: "br",
      labelPush: 0,
      cx: xy[0],
      cy: xy[1]
    };
  });

  function tileBox(item) {
    var half = item.side / 2;
    return { x0: item.cx - half, y0: item.cy - half, x1: item.cx + half, y1: item.cy + half };
  }

  function padBox(box, pad) {
    return {
      x0: box.x0 - pad,
      y0: box.y0 - pad,
      x1: box.x1 + pad,
      y1: box.y1 + pad
    };
  }

  // Corner → elbow → near edge of the label (not the label center).
  function calloutGeom(item) {
    var half = item.side / 2;
    var sx = item.labelCorner.indexOf("r") >= 0 ? 1 : -1;
    var sy = item.labelCorner.indexOf("b") >= 0 ? 1 : -1;
    var outward = calloutStem + (item.labelPush || 0);
    var lw = item.labelW;
    var lh = item.labelH;

    var x1 = item.cx + sx * half;
    var y1 = item.cy + sy * half;

    var labelCX = x1 + sx * (outward + calloutGap + lw / 2);
    var labelCY = y1 + sy * (Math.min(outward, 18) * 0.4 + lh * 0.08);
    var box = {
      x0: labelCX - lw / 2,
      y0: labelCY - lh / 2,
      x1: labelCX + lw / 2,
      y1: labelCY + lh / 2
    };

    // Leader ends on the label's near vertical edge, mid-height.
    var x3 = sx > 0 ? box.x0 : box.x1;
    var y3 = labelCY;
    var x2 = x1 + sx * Math.max(10, outward * 0.45);
    var y2 = y3;

    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      x3: x3,
      y3: y3,
      anchor: sx > 0 ? "start" : "end",
      box: box
    };
  }

  function labelBox(item) {
    return calloutGeom(item).box;
  }

  function boxesOverlap(a, b) {
    return !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);
  }

  // Positive gap between boxes; 0 if they touch or overlap.
  function boxClearance(a, b) {
    var dx = Math.max(0, Math.max(a.x0 - b.x1, b.x0 - a.x1));
    var dy = Math.max(0, Math.max(a.y0 - b.y1, b.y0 - a.y1));
    if (dx === 0 && dy === 0) return 0;
    if (dx === 0) return dy;
    if (dy === 0) return dx;
    return Math.hypot(dx, dy);
  }

  function scoreLabelPlacement(item, index) {
    var box = labelBox(item);
    var score = 0;
    if (boxesOverlap(box, tileBox(item))) score += 50;
    placed.forEach(function (other, otherIndex) {
      if (otherIndex === index) return;
      var tb = tileBox(other);
      if (boxesOverlap(box, tb)) score += 40;
      else {
        var tileGap = boxClearance(box, tb);
        if (tileGap < labelPad) score += (labelPad - tileGap) * 2;
      }
      if (other.labelInside) return;
      var ob = labelBox(other);
      if (boxesOverlap(padBox(box, labelPad), padBox(ob, 0))) score += 25;
      else {
        var gap = boxClearance(box, ob);
        if (gap < labelPad) score += (labelPad - gap) * 3;
      }
    });
    return score;
  }

  mapSeparateTiles(placed, 6);

  // Pick corners (a few passes so later choices can react), then push crowded labels out.
  for (var round = 0; round < 4; round += 1) {
    placed.forEach(function (item, index) {
      if (item.labelInside) return;
      var corners = preferredCorners[item.row.meta.key] || ["br", "bl", "tr", "tl"];
      var best = corners[0];
      var bestScore = Infinity;
      corners.forEach(function (corner) {
        item.labelCorner = corner;
        var score = scoreLabelPlacement(item, index);
        if (score < bestScore) {
          bestScore = score;
          best = corner;
        }
      });
      item.labelCorner = best;
    });
  }

  for (var sep = 0; sep < 50; sep += 1) {
    var moved = false;
    for (var si = 0; si < placed.length; si += 1) {
      var itemA = placed[si];
      if (itemA.labelInside) continue;
      var boxA = labelBox(itemA);
      var hit = false;
      for (var sj = 0; sj < placed.length; sj += 1) {
        if (si === sj) continue;
        var itemB = placed[sj];
        if (boxesOverlap(padBox(boxA, labelPad), tileBox(itemB))) {
          hit = true;
          break;
        }
        if (itemB.labelInside) continue;
        if (boxesOverlap(padBox(boxA, labelPad), padBox(labelBox(itemB), 0))) {
          hit = true;
          break;
        }
      }
      if (boxesOverlap(padBox(boxA, 4), tileBox(itemA))) hit = true;
      if (!hit) continue;
      itemA.labelPush += 3;
      moved = true;
      // Prefer another corner before the stem gets long.
      if (itemA.labelPush > 28) {
        var opts = preferredCorners[itemA.row.meta.key] || ["br", "bl", "tr", "tl"];
        var at = opts.indexOf(itemA.labelCorner);
        itemA.labelCorner = opts[(at + 1) % opts.length];
        itemA.labelPush = 4;
      }
    }
    if (!moved) break;
  }

  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  placed.forEach(function (item) {
    var tb = tileBox(item);
    var lb = labelBox(item);
    minX = Math.min(minX, tb.x0, lb.x0);
    maxX = Math.max(maxX, tb.x1, lb.x1);
    minY = Math.min(minY, tb.y0, lb.y0);
    maxY = Math.max(maxY, tb.y1, lb.y1);
  });
  var shiftX = pad - minX;
  var shiftY = pad - minY;
  placed.forEach(function (item) {
    item.cx += shiftX;
    item.cy += shiftY;
  });
  mapW = (maxX - minX) + pad * 2;
  mapH = (maxY - minY) + pad * 2;

  function toSvgShifted(xy) {
    var p = toSvg(xy);
    return [p[0] + shiftX, p[1] + shiftY];
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + mapW.toFixed(1) + " " + mapH.toFixed(1));
  svg.setAttribute("class", "wide map-squares");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("mapSquaresAria"));

  if (typeof LAND !== "undefined") {
    function projectRing(dense, shapes, outlines) {
      var shape = [];
      var outline = [];
      var previous = null;
      function flush() {
        if (shape.length >= 3) shapes.push(shape.slice());
        if (outline.length > 1) outlines.push(outline.slice());
        shape = [];
        outline = [];
        previous = null;
      }
      dense.forEach(function (pair) {
        var lon = pair[0];
        if (lon > 180) lon -= 360;
        if (lon < -180) lon += 360;
        var xy = mercator(lon, pair[1]);
        if (previous && Math.abs(xy[0] - previous[0]) > PI * 0.9) flush();
        shape.push(xy);
        outline.push(xy);
        previous = xy;
      });
      flush();
    }
    var densify = typeof mapGetProjection === "function" ? mapGetProjection().densifyRing : null;
    var landDense = typeof mapDensifiedLand === "function"
      ? mapDensifiedLand()
      : LAND.map(function (ring) { return densify ? densify(ring) : ring; });
    var lakeDense = typeof mapDensifiedLakes === "function" && typeof LAKES !== "undefined"
      ? mapDensifiedLakes()
      : (typeof LAKES !== "undefined" ? LAKES.map(function (ring) { return densify ? densify(ring) : ring; }) : []);
    var landShapes = [];
    var coastlines = [];
    var lakeShapes = [];
    var lakeshores = [];
    landDense.forEach(function (ring) {
      projectRing(ring, landShapes, coastlines);
    });
    lakeDense.forEach(function (ring) {
      projectRing(ring, lakeShapes, lakeshores);
    });
    function trace(points, close) {
      var d = "";
      points.forEach(function (point, index) {
        var xy = toSvgShifted(point);
        d += (index === 0 ? "M" : "L") + xy[0].toFixed(1) + " " + xy[1].toFixed(1);
      });
      return close ? d + "Z" : d;
    }
    var land = svgEl("g");
    land.setAttribute("class", "land map-squares-land");
    land.setAttribute("pointer-events", "none");
    landShapes.forEach(function (points) {
      var path = svgEl("path");
      path.setAttribute("d", trace(points, true));
      path.setAttribute("stroke", "none");
      land.appendChild(path);
    });
    lakeShapes.forEach(function (points) {
      var path = svgEl("path");
      path.setAttribute("class", "lake");
      path.setAttribute("d", trace(points, true));
      path.setAttribute("stroke", "none");
      land.appendChild(path);
    });
    coastlines.forEach(function (points) {
      var path = svgEl("path");
      path.setAttribute("d", trace(points, false));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("stroke-linecap", "round");
      land.appendChild(path);
    });
    lakeshores.forEach(function (points) {
      var path = svgEl("path");
      path.setAttribute("d", trace(points, false));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("stroke-linecap", "round");
      land.appendChild(path);
    });
    svg.appendChild(land);
  }

  function setTileRect(el, cx, cy, side) {
    var half = side / 2;
    el.setAttribute("x", (cx - half).toFixed(1));
    el.setAttribute("y", (cy - half).toFixed(1));
    el.setAttribute("width", side.toFixed(1));
    el.setAttribute("height", side.toFixed(1));
  }

  function sideSeed() {
    return Math.max(12, scale * 0.55);
  }

  var marks = svgEl("g");
  marks.setAttribute("class", "map-squares-marks");
  var dotsLayer = svgEl("g");
  dotsLayer.setAttribute("class", "map-square-dots");
  var gather = [];
  var tileAnims = [];
  var markR = 3.2;
  var reduceMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  placed.slice().sort(function (a, b) {
    return b.side - a.side;
  }).forEach(function (item) {
    var gIndex = PLACE_GROUPS.length;
    PLACE_GROUPS.push({
      label: item.row.label,
      people: item.row.people,
      // Region packs: tip breaks down by country of birth (not a flat headcount list).
      countryMode: item.row.meta && item.row.meta.kind === "region" ? "birth" : null
    });
    var side0 = reduceMotion ? item.side : sideSeed();
    var side1 = item.side;
    var rect = svgEl("rect");
    rect.setAttribute("class", "map-squares-tile");
    setTileRect(rect, item.cx, item.cy, side0);
    rect.setAttribute("fill", item.row.meta.fill);
    rect.setAttribute("fill-opacity", "0.42");
    rect.setAttribute("stroke", "#2a2a2a");
    rect.setAttribute("stroke-width", "1");
    rect.dataset.mark = "1";
    rect.dataset.g = String(gIndex);
    rect.dataset.fill = item.row.meta.fill;
    rect.dataset.hot = item.row.meta.hot;
    rect.dataset.stroke = "#2a2a2a";
    rect.setAttribute("tabindex", "0");
    rect.setAttribute("role", "img");
    rect.setAttribute("aria-label", item.row.count + " " + item.row.label);
    marks.appendChild(rect);
    tileAnims.push({
      el: rect,
      cx: item.cx,
      cy: item.cy,
      side0: side0,
      side1: side1
    });

    var slots = mapPackDotsInSquare(item.cx, item.cy, item.side, item.row.people.length, markR);
    item.row.people.forEach(function (person, personIndex) {
      var slot = slots[personIndex] || { x: item.cx, y: item.cy, r: markR };
      var birthXy = (person.birthLon != null && person.birthLat != null)
        ? toSvgShifted(mercator(person.birthLon, person.birthLat))
        : [slot.x, slot.y];
      var circle = svgEl("circle");
      circle.setAttribute("class", "map-square-dot");
      circle.setAttribute("cx", (reduceMotion ? slot.x : birthXy[0]).toFixed(2));
      circle.setAttribute("cy", (reduceMotion ? slot.y : birthXy[1]).toFixed(2));
      circle.setAttribute("r", slot.r.toFixed(2));
      circle.setAttribute("fill", "transparent");
      circle.setAttribute("stroke", "#111");
      circle.dataset.mark = "1";
      circle.dataset.i = String(person.i);
      circle.dataset.fill = "transparent";
      circle.dataset.hot = "#000";
      circle.dataset.stroke = "#111";
      circle.dataset.coords = "1";
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "img");
      circle.setAttribute("aria-label", typeof mapMarkAria === "function" ? mapMarkAria(person) : personName(person));
      if (!wikiFor(person)) circle.classList.add("no-link");
      dotsLayer.appendChild(circle);
      gather.push({
        el: circle,
        x0: birthXy[0],
        y0: birthXy[1],
        x1: slot.x,
        y1: slot.y,
        dist: Math.hypot(slot.x - birthXy[0], slot.y - birthXy[1])
      });
    });

    var geom = calloutGeom(item);
    var leader = svgEl("polyline");
    leader.setAttribute("class", "map-squares-leader");
    leader.setAttribute(
      "points",
      geom.x1.toFixed(1) + "," + geom.y1.toFixed(1) + " " +
      geom.x2.toFixed(1) + "," + geom.y2.toFixed(1) + " " +
      geom.x3.toFixed(1) + "," + geom.y3.toFixed(1)
    );
    marks.appendChild(leader);

    var name = svgEl("text");
    name.setAttribute("class", "map-squares-tile-label");
    name.setAttribute("text-anchor", geom.anchor);
    name.setAttribute("pointer-events", "none");
    var textX = geom.anchor === "start" ? geom.box.x0 : geom.box.x1;
    name.setAttribute("x", textX.toFixed(1));
    name.setAttribute("y", (geom.box.y0 + lineH * 0.8).toFixed(1));
    item.nameLines.forEach(function (line, lineIndex) {
      var tspan = svgEl("tspan");
      tspan.setAttribute("x", textX.toFixed(1));
      if (lineIndex > 0) tspan.setAttribute("dy", "1.05em");
      tspan.textContent = line;
      name.appendChild(tspan);
    });
    marks.appendChild(name);
  });
  marks.appendChild(dotsLayer);
  svg.appendChild(marks);
  if (!reduceMotion) svg.classList.add("is-aggregating");

  chart.appendChild(svg);

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function playAggregate() {
    if (reduceMotion || !gather.length) {
      svg.classList.remove("is-aggregating");
      return;
    }
    var maxDist = 0;
    gather.forEach(function (dot) {
      if (dot.dist > maxDist) maxDist = dot.dist;
    });
    var t0 = performance.now();
    var dur = 1600;
    function frame(now) {
      var t = Math.min(1, (now - t0) / dur);
      var boxE = easeInOut(t);
      tileAnims.forEach(function (tile) {
        setTileRect(tile.el, tile.cx, tile.cy, tile.side0 + (tile.side1 - tile.side0) * boxE);
      });
      gather.forEach(function (dot) {
        var lag = maxDist > 1 ? (dot.dist / maxDist) * 0.3 : 0;
        var local = Math.min(1, Math.max(0, (t - lag) / Math.max(0.001, 1 - lag)));
        var e = easeInOut(local);
        dot.el.setAttribute("cx", (dot.x0 + (dot.x1 - dot.x0) * e).toFixed(2));
        dot.el.setAttribute("cy", (dot.y0 + (dot.y1 - dot.y0) * e).toFixed(2));
      });
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      tileAnims.forEach(function (tile) {
        setTileRect(tile.el, tile.cx, tile.cy, tile.side1);
      });
      svg.classList.remove("is-aggregating");
    }
    requestAnimationFrame(frame);
  }

  function chartInView() {
    var rect = chart.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    return rect.top < vh * 0.75 && rect.bottom > vh * 0.2;
  }

  if (reduceMotion) {
    playAggregate();
  } else if (chartInView()) {
    requestAnimationFrame(function () {
      requestAnimationFrame(playAggregate);
    });
  } else if (typeof IntersectionObserver === "function") {
    var once = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || once) return;
        once = true;
        io.disconnect();
        playAggregate();
      });
    }, { threshold: 0.35 });
    io.observe(chart);
  } else {
    playAggregate();
  }
}

function mapSquaresLead(d) {
  var parts = d.units.map(function (row) {
    return row.count + " " + row.label;
  });
  if (lang === "ru") {
    return (
      "Рис. 8a — сборка: те же точки, что на рис. 8, сначала на сырых координатах рождения, затем стягиваются в региональные квадраты. " +
      "Северная Америка разложена до стран. Площадь квадрата и число точек — одно и то же. " +
      countNoun(d.people, "", "", "человек", "человека", "человек") +
      ": " + parts.join("; ") + "."
    );
  }
  return (
    "Fig. 8a gathers: the same dots as Fig. 8 start on raw birth coordinates, then pull into regional squares. " +
    "North America is split to countries. Square area and the number of dots are the same count. " +
    d.people + " people: " + parts.join("; ") + "."
  );
}

function mapSquaresSource() {
  if (lang === "ru") {
    return "Координаты рождения (WINNER_BIRTH_lat / lon). Европа и Азия — подрегионы по координатам; Северная Америка — по стране рождения; остальные части света целиком. Квадрат в среднем месте рождения группы; площадь пропорциональна числу людей. Проекция: Меркатор. Источник: laureates.csv.";
  }
  return "Birth coordinates (WINNER_BIRTH_lat / lon). Europe and Asia are coordinate subregions; North America uses birth country; other parts of the world stay whole. Each square sits at the group's mean birth location; area is proportional to headcount. Projection: Mercator. Source: laureates.csv.";
}
