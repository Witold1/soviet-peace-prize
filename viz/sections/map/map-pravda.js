// Fig. 8c: flight from birth-region packs (Fig. 8a bins) to Pravda-region packs.

function mapPravdaNameLines(label) {
  var words = String(label || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (words.length < 2 || words[0].length <= 4 || label.length <= 12) return [words.join(" ")];
  var lines = [words[0]];
  for (var i = 1; i < words.length; i += 1) lines.push(words[i]);
  return lines;
}

function mapPravdaPreferredCorners(key) {
  var preferred = {
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
  return preferred[key] || ["br", "bl", "tr", "tl"];
}

function mapPravdaUnitLabel(meta) {
  if (typeof squareUnitLabel === "function") return squareUnitLabel(meta);
  if (meta.kind === "country" && meta.matchCountry) return countryLabel(meta.matchCountry);
  return t(meta.key);
}

function renderMapFlight() {
  var chart = document.getElementById("map-flight-chart");
  var lead = document.getElementById("map-flight-lead");
  var source = document.getElementById("map-flight-source");
  if (!chart) return;
  if (typeof MAP_SQUARE_UNITS === "undefined") return;

  chart.replaceChildren();

  var byPravda = new Map();
  var byBirth = new Map();
  MAP_SQUARE_UNITS.forEach(function (unit) {
    byPravda.set(unit.key, []);
    byBirth.set(unit.key, []);
  });

  PEOPLE_SEEN.forEach(function (person) {
    var pravdaKey = typeof pravdaRegionKey === "function" ? pravdaRegionKey(person) : null;
    if (pravdaKey) {
      if (!byPravda.has(pravdaKey)) byPravda.set(pravdaKey, []);
      byPravda.get(pravdaKey).push(person);
    }
    if (person.birthLat == null || person.birthLon == null) return;
    if (typeof birthSquareUnitKey !== "function") return;
    var birthKey = birthSquareUnitKey(person);
    if (!birthKey) return;
    if (!byBirth.has(birthKey)) byBirth.set(birthKey, []);
    byBirth.get(birthKey).push(person);
  });

  var units = [];
  MAP_SQUARE_UNITS.forEach(function (meta) {
    var people = byPravda.get(meta.key) || [];
    if (!people.length) return;
    var lonSum = 0;
    var latSum = 0;
    var geoN = 0;
    people.forEach(function (person) {
      var country = typeof pravdaCountryKey === "function" ? pravdaCountryKey(person) : null;
      var geo = country && typeof PRAVDA_COUNTRY_GEO === "object" ? PRAVDA_COUNTRY_GEO[country] : null;
      if (!geo) return;
      lonSum += geo[0];
      latSum += geo[1];
      geoN += 1;
    });
    if (!geoN) return;
    units.push({
      meta: meta,
      key: meta.key,
      label: mapPravdaUnitLabel(meta),
      people: people,
      count: people.length,
      lon: lonSum / geoN,
      lat: latSum / geoN,
      fill: meta.fill,
      hot: meta.hot
    });
  });

  // Fig. 8a-style birth-region seats — flight starts packed here.
  var birthUnits = [];
  MAP_SQUARE_UNITS.forEach(function (meta) {
    var people = byBirth.get(meta.key) || [];
    if (!people.length) return;
    var lonSum = 0;
    var latSum = 0;
    people.forEach(function (person) {
      lonSum += person.birthLon;
      latSum += person.birthLat;
    });
    birthUnits.push({
      meta: meta,
      key: meta.key,
      people: people,
      count: people.length,
      lon: lonSum / people.length,
      lat: latSum / people.length
    });
  });

  var plotted = units.reduce(function (sum, row) { return sum + row.count; }, 0);
  if (lead) lead.textContent = mapFlightLead({ units: units, people: plotted });
  if (source) source.textContent = mapFlightSource();

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
  var calloutStem = 14;
  var calloutGap = 8;
  var labelPad = 8;

  function nameMetrics(label) {
    var lines = mapPravdaNameLines(label);
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
  });
  birthUnits.forEach(function (row) {
    includeMerc(mercator(row.lon, row.lat));
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
    var full = typeof mapSquareLabelLines === "function"
      ? mapSquareLabelLines(row.count, row.label)
      : [row.count + " " + row.label];
    return {
      row: row,
      side: side,
      nameLines: metrics.lines,
      fullLines: full,
      labelW: metrics.w,
      labelH: metrics.h,
      labelInside: false,
      showName: true,
      labelCorner: "br",
      labelPush: 0,
      cx: xy[0],
      cy: xy[1]
    };
  });

  var birthPlaced = birthUnits.map(function (row) {
    var xy = toSvg(mercator(row.lon, row.lat));
    return {
      row: row,
      side: sideFor(row.count),
      cx: xy[0],
      cy: xy[1]
    };
  });

  function packDotsInSquare(cx, cy, side, n, baseR) {
    if (typeof mapPackDotsInSquare === "function") {
      return mapPackDotsInSquare(cx, cy, side, n, baseR);
    }
    return [{ x: cx, y: cy, r: baseR }];
  }

  function tileBox(item) {
    var half = item.side / 2;
    return { x0: item.cx - half, y0: item.cy - half, x1: item.cx + half, y1: item.cy + half };
  }

  function padBox(box, amount) {
    return {
      x0: box.x0 - amount,
      y0: box.y0 - amount,
      x1: box.x1 + amount,
      y1: box.y1 + amount
    };
  }

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
    if (item.labelInside || !item.showName) {
      return { x0: item.cx, y0: item.cy, x1: item.cx, y1: item.cy };
    }
    return calloutGeom(item).box;
  }

  function boxesOverlap(a, b) {
    return !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);
  }

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
      if (!other.showName) return;
      var ob = labelBox(other);
      if (boxesOverlap(padBox(box, labelPad), padBox(ob, 0))) score += 25;
      else {
        var gap = boxClearance(box, ob);
        if (gap < labelPad) score += (labelPad - gap) * 3;
      }
    });
    return score;
  }

  if (typeof mapSeparateTiles === "function") {
    mapSeparateTiles(placed, 6);
    mapSeparateTiles(birthPlaced, 6);
  }

  for (var round = 0; round < 4; round += 1) {
    placed.forEach(function (item, index) {
      if (!item.showName) return;
      var corners = mapPravdaPreferredCorners(item.row.key);
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
      if (!itemA.showName) continue;
      var boxA = labelBox(itemA);
      var hit = false;
      for (var sj = 0; sj < placed.length; sj += 1) {
        if (si === sj) continue;
        var itemB = placed[sj];
        if (boxesOverlap(padBox(boxA, labelPad), tileBox(itemB))) {
          hit = true;
          break;
        }
        if (!itemB.showName) continue;
        if (boxesOverlap(padBox(boxA, labelPad), padBox(labelBox(itemB), 0))) {
          hit = true;
          break;
        }
      }
      if (boxesOverlap(padBox(boxA, 4), tileBox(itemA))) hit = true;
      if (!hit) continue;
      itemA.labelPush += 3;
      moved = true;
      if (itemA.labelPush > 28) {
        var opts = mapPravdaPreferredCorners(itemA.row.key);
        var at = opts.indexOf(itemA.labelCorner);
        itemA.labelCorner = opts[(at + 1) % opts.length];
        itemA.labelPush = 4;
      }
    }
    if (!moved) break;
  }

  // Keep the full Mercator land window; only expand if labels/tiles stick out.
  // Cropping to destination tiles alone shaved the south off Fig. 8в.
  var geoMapW = mapW;
  var geoMapH = mapH;
  var minX = 0;
  var minY = 0;
  var maxX = geoMapW;
  var maxY = geoMapH;
  function includeLayoutBox(tb) {
    minX = Math.min(minX, tb.x0);
    maxX = Math.max(maxX, tb.x1);
    minY = Math.min(minY, tb.y0);
    maxY = Math.max(maxY, tb.y1);
  }
  placed.forEach(function (item) {
    includeLayoutBox(tileBox(item));
    includeLayoutBox(labelBox(item));
  });
  birthPlaced.forEach(function (item) {
    includeLayoutBox(tileBox(item));
  });
  var shiftX = 0;
  var shiftY = 0;
  if (minX < 0 || minY < 0 || maxX > geoMapW || maxY > geoMapH) {
    shiftX = -minX;
    shiftY = -minY;
    placed.forEach(function (item) {
      item.cx += shiftX;
      item.cy += shiftY;
    });
    birthPlaced.forEach(function (item) {
      item.cx += shiftX;
      item.cy += shiftY;
    });
    mapW = maxX - minX;
    mapH = maxY - minY;
  }

  function toSvgShifted(xy) {
    var p = toSvg(xy);
    return [p[0] + shiftX, p[1] + shiftY];
  }

  var startByI = new Map();
  birthPlaced.forEach(function (item) {
    var birthSlots = packDotsInSquare(item.cx, item.cy, item.side, item.row.people.length, 3.2);
    item.row.people.forEach(function (person, personIndex) {
      startByI.set(person.i, birthSlots[personIndex] || { x: item.cx, y: item.cy, r: 3.2 });
    });
  });

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + mapW.toFixed(1) + " " + mapH.toFixed(1));
  svg.setAttribute("class", "wide map-squares map-flight");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("mapFlightAria"));

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

  var birthCountByKey = new Map();
  birthUnits.forEach(function (row) {
    birthCountByKey.set(row.key, row.count);
  });

  function sideSeed(count) {
    if (count <= 0) return Math.max(14, scale * 0.6);
    return sideFor(count);
  }

  function setTileRect(el, cx, cy, side) {
    var half = side / 2;
    el.setAttribute("x", (cx - half).toFixed(1));
    el.setAttribute("y", (cy - half).toFixed(1));
    el.setAttribute("width", side.toFixed(1));
    el.setAttribute("height", side.toFixed(1));
  }

  var marks = svgEl("g");
  marks.setAttribute("class", "map-squares-marks");
  var origins = svgEl("g");
  origins.setAttribute("class", "map-flight-origins");
  origins.setAttribute("pointer-events", "none");
  var originAnims = [];
  birthPlaced.forEach(function (item) {
    var ghost = svgEl("rect");
    ghost.setAttribute("class", "map-flight-origin");
    setTileRect(ghost, item.cx, item.cy, item.side);
    origins.appendChild(ghost);
    originAnims.push({
      el: ghost,
      cx: item.cx,
      cy: item.cy,
      side0: item.side,
      side1: sideSeed(0)
    });
  });
  marks.appendChild(origins);

  var dotsLayer = svgEl("g");
  dotsLayer.setAttribute("class", "map-flight-dots");
  var flight = [];
  var tileAnims = [];
  var markR = 3.2;
  var reduceMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  placed.slice().sort(function (a, b) {
    return b.side - a.side;
  }).forEach(function (item) {
    var gIndex = PLACE_GROUPS.length;
    var unitMeta = null;
    if (typeof MAP_SQUARE_UNITS !== "undefined") {
      for (var ui = 0; ui < MAP_SQUARE_UNITS.length; ui += 1) {
        if (MAP_SQUARE_UNITS[ui].key === item.row.key) {
          unitMeta = MAP_SQUARE_UNITS[ui];
          break;
        }
      }
    }
    PLACE_GROUPS.push({
      label: item.row.label,
      people: item.row.people,
      // Region packs: tip breaks down by Pravda affiliation country.
      countryMode: unitMeta && unitMeta.kind === "region" ? "affiliation" : null
    });
    var side0 = sideSeed(birthCountByKey.get(item.row.key) || 0);
    var side1 = item.side;
    if (reduceMotion) side0 = side1;
    var rect = svgEl("rect");
    rect.setAttribute("class", "map-squares-tile");
    setTileRect(rect, item.cx, item.cy, side0);
    rect.setAttribute("fill", item.row.fill);
    rect.setAttribute("fill-opacity", "0.42");
    rect.setAttribute("stroke", "#2a2a2a");
    rect.setAttribute("stroke-width", "1");
    rect.dataset.mark = "1";
    rect.dataset.g = String(gIndex);
    rect.dataset.fill = item.row.fill;
    rect.dataset.hot = item.row.hot;
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

    var slots = packDotsInSquare(item.cx, item.cy, item.side, item.row.people.length, markR);
    var movedFill = "#c43c3c";
    var movedHot = "#8f1f1f";
    item.row.people.forEach(function (person, personIndex) {
      var slot = slots[personIndex] || { x: item.cx, y: item.cy, r: markR };
      var from = startByI.get(person.i) || slot;
      var birthKey = typeof birthSquareUnitKey === "function" && person.birthLat != null
        ? birthSquareUnitKey(person)
        : null;
      var pravdaKey = item.row.key;
      var moved = !!(birthKey && pravdaKey && birthKey !== pravdaKey);
      var circle = svgEl("circle");
      circle.setAttribute("class", "map-square-dot map-flight-dot" + (moved && reduceMotion ? " is-moved" : ""));
      circle.setAttribute("cx", (reduceMotion ? slot.x : from.x).toFixed(2));
      circle.setAttribute("cy", (reduceMotion ? slot.y : from.y).toFixed(2));
      circle.setAttribute("r", slot.r.toFixed(2));
      circle.setAttribute("fill", moved && reduceMotion ? movedFill : "transparent");
      circle.setAttribute("stroke", moved && reduceMotion ? movedHot : "#111");
      circle.dataset.mark = "1";
      circle.dataset.i = String(person.i);
      circle.dataset.fill = moved && reduceMotion ? movedFill : "transparent";
      circle.dataset.hot = moved ? movedHot : "#000";
      circle.dataset.stroke = moved && reduceMotion ? movedHot : "#111";
      circle.dataset.coords = "1";
      if (moved) circle.dataset.moved = "1";
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "img");
      circle.setAttribute("aria-label", typeof mapMarkAria === "function" ? mapMarkAria(person) : personName(person));
      if (!wikiFor(person)) circle.classList.add("no-link");
      dotsLayer.appendChild(circle);
      flight.push({
        el: circle,
        moved: moved,
        x0: from.x,
        y0: from.y,
        x1: slot.x,
        y1: slot.y,
        dist: Math.hypot(slot.x - from.x, slot.y - from.y)
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
  if (!reduceMotion) svg.classList.add("is-flying");
  else svg.classList.add("is-settled");

  chart.appendChild(svg);

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function paintMoved(dot) {
    if (!dot.moved) return;
    dot.el.classList.add("is-moved");
    dot.el.setAttribute("fill", "#c43c3c");
    dot.el.setAttribute("stroke", "#8f1f1f");
    dot.el.dataset.fill = "#c43c3c";
    dot.el.dataset.hot = "#8f1f1f";
    dot.el.dataset.stroke = "#8f1f1f";
  }

  function playFlight() {
    if (reduceMotion || !flight.length) {
      flight.forEach(paintMoved);
      tileAnims.forEach(function (tile) {
        setTileRect(tile.el, tile.cx, tile.cy, tile.side1);
      });
      svg.classList.remove("is-flying");
      svg.classList.add("is-settled");
      return;
    }
    var maxDist = 0;
    flight.forEach(function (dot) {
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
      originAnims.forEach(function (tile) {
        setTileRect(tile.el, tile.cx, tile.cy, tile.side0 + (tile.side1 - tile.side0) * boxE);
      });
      flight.forEach(function (dot) {
        var lag = maxDist > 1 ? (dot.dist / maxDist) * 0.28 : 0;
        var local = Math.min(1, Math.max(0, (t - lag) / Math.max(0.001, 1 - lag)));
        var e = easeInOut(local);
        dot.el.setAttribute("cx", (dot.x0 + (dot.x1 - dot.x0) * e).toFixed(2));
        dot.el.setAttribute("cy", (dot.y0 + (dot.y1 - dot.y0) * e).toFixed(2));
        if (dot.moved && local > 0.35 && !dot.painted) {
          dot.painted = true;
          paintMoved(dot);
        }
      });
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      flight.forEach(paintMoved);
      tileAnims.forEach(function (tile) {
        setTileRect(tile.el, tile.cx, tile.cy, tile.side1);
      });
      svg.classList.remove("is-flying");
      svg.classList.add("is-settled");
    }
    requestAnimationFrame(frame);
  }

  function chartInView() {
    var rect = chart.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    return rect.top < vh * 0.75 && rect.bottom > vh * 0.2;
  }

  if (reduceMotion) {
    playFlight();
  } else if (chartInView()) {
    requestAnimationFrame(function () {
      requestAnimationFrame(playFlight);
    });
  } else if (typeof IntersectionObserver === "function") {
    var once = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || once) return;
        once = true;
        io.disconnect();
        playFlight();
      });
    }, { threshold: 0.35 });
    io.observe(chart);
  } else {
    playFlight();
  }
}

function mapFlightLead(d) {
  var parts = d.units.map(function (row) {
    return row.count + " " + row.label;
  });
  if (lang === "ru") {
    return (
      "Рис. 8в — перенос между уже собранными регионами: старт как на рис. 8a (рождение), финиш — регион по «Правде». " +
      "Пунктир — старт; цветной квадрат растёт к финишу; кто сменил регион — красным. " +
      countNoun(d.people, "", "", "человек", "человека", "человек") +
      ": " + parts.join("; ") + "."
    );
  }
  return (
    "Fig. 8c moves dots between already aggregated regions: start as in Fig. 8a (birth), finish as Pravda named the country. " +
    "Dashed squares are the start; colored squares grow to the finish; movers fill red. " +
    d.people + " people: " + parts.join("; ") + "."
  );
}

function mapFlightSource() {
  if (lang === "ru") {
    return "Старт — те же региональные бины, что на рис. 8a (агрегация координат рождения). Финиш — страна из подписи «Правды» (скобки; иначе формулировка вроде «Китайской академии наук»), снова в тех же бинах. " +
      "Квадрат — оболочка группы; площадь пропорциональна числу людей. Проекция: Меркатор. Источник: laureates.csv и подписи указов / плашек в «Правде».";
  }
  return "Start seats reuse Fig. 8a’s regional bins (birth coordinates aggregated). End seats take Pravda’s country line (parentheses; otherwise wording such as “Chinese Academy of Sciences”), mapped into the same bins. " +
    "Each square is a group shell; area is proportional to headcount. Projection: Mercator. Source: laureates.csv and Pravda decree / caption lines.";
}

// Keep old name so a stale call cannot blank the section during hot reload.
function renderMapPravda() {
  renderMapFlight();
}
