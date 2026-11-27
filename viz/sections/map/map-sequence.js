// Fig. 8я — three sequential states on one Mercator chart:
// 1) raw birth scatter → 2) birth-region packs → 3) Pravda-region packs.

function mapSeqUnitLabel(meta) {
  if (typeof squareUnitLabel === "function") return squareUnitLabel(meta);
  if (meta.kind === "country" && meta.matchCountry) return countryLabel(meta.matchCountry);
  return t(meta.key);
}

function mapSeqNameLines(label) {
  var words = String(label || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (words.length < 2 || words[0].length <= 4 || label.length <= 12) return [words.join(" ")];
  var lines = [words[0]];
  for (var i = 1; i < words.length; i += 1) lines.push(words[i]);
  return lines;
}

// Shorter region names for phone portholes — long labels collide with packs.
function narrowSeatLabel(key, fallback) {
  var short = lang === "ru"
    ? {
      mapSqWestAsia: "З. Азия",
      mapSqSouthAsia: "Ю. Азия",
      mapSqSoutheastAsia: "ЮВ Азия",
      mapSqEastAsia: "В. Азия",
      mapSqCentralAmerica: "Ц. Америка",
      mapSqSouthAmerica: "Ю. Америка",
      mapSqUnitedStates: "США",
      mapSqNorthernEurope: "С. Европа",
      mapSqWesternEurope: "З. Европа",
      mapSqCentralEurope: "Ц. Европа",
      mapSqSouthernEurope: "Ю. Европа",
      mapSqEasternEurope: "В. Европа"
    }
    : {
      mapSqWestAsia: "W. Asia",
      mapSqSouthAsia: "S. Asia",
      mapSqSoutheastAsia: "SE Asia",
      mapSqEastAsia: "E. Asia",
      mapSqCentralAmerica: "C. America",
      mapSqSouthAmerica: "S. America",
      mapSqUnitedStates: "USA",
      mapSqNorthernEurope: "N. Europe",
      mapSqWesternEurope: "W. Europe",
      mapSqCentralEurope: "C. Europe",
      mapSqSouthernEurope: "S. Europe",
      mapSqEasternEurope: "E. Europe"
    };
  return short[key] || fallback;
}

function renderMapSequence() {
  var chart = document.getElementById("map-seq-chart");
  var source = document.getElementById("map-seq-source");
  if (!chart) return;
  if (typeof MAP_SQUARE_UNITS === "undefined") return;

  chart.replaceChildren();

  var byBirth = new Map();
  var byPravda = new Map();
  MAP_SQUARE_UNITS.forEach(function (unit) {
    byBirth.set(unit.key, []);
    byPravda.set(unit.key, []);
  });

  PEOPLE_SEEN.forEach(function (person) {
    if (person.birthLat != null && person.birthLon != null && typeof birthSquareUnitKey === "function") {
      var birthKey = birthSquareUnitKey(person);
      if (birthKey) {
        if (!byBirth.has(birthKey)) byBirth.set(birthKey, []);
        byBirth.get(birthKey).push(person);
      }
    }
    var pravdaKey = typeof pravdaRegionKey === "function" ? pravdaRegionKey(person) : null;
    if (pravdaKey) {
      if (!byPravda.has(pravdaKey)) byPravda.set(pravdaKey, []);
      byPravda.get(pravdaKey).push(person);
    }
  });

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
      label: mapSeqUnitLabel(meta),
      people: people,
      count: people.length,
      lon: lonSum / people.length,
      lat: latSum / people.length,
      fill: meta.fill,
      hot: meta.hot
    });
  });

  var pravdaUnits = [];
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
    pravdaUnits.push({
      meta: meta,
      key: meta.key,
      label: mapSeqUnitLabel(meta),
      people: people,
      count: people.length,
      lon: lonSum / geoN,
      lat: latSum / geoN,
      fill: meta.fill,
      hot: meta.hot
    });
  });

  if (source) source.textContent = mapSeqSource();

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
  function sideSeed() {
    return Math.max(12, scale * 0.55);
  }

  var lineH = 17;
  var charW = 7.2;
  var calloutStem = 14;
  var calloutGap = 8;
  var labelPad = 8;
  var markR = 3.2;

  function nameMetrics(label) {
    var lines = mapSeqNameLines(label);
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
  birthUnits.forEach(function (row) {
    includeMerc(mercator(row.lon, row.lat));
    row.people.forEach(function (person) {
      includeMerc(mercator(person.birthLon, person.birthLat));
    });
  });
  pravdaUnits.forEach(function (row) {
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

  function packDots(cx, cy, side, n, fixedR) {
    var r0 = fixedR == null ? markR : fixedR;
    // Equal-size dots: never shrink r to fit the tile.
    var cols = Math.max(1, Math.ceil(Math.sqrt(n)));
    var rows = Math.max(1, Math.ceil(n / cols));
    if (n <= 3) {
      cols = n;
      rows = 1;
    } else if (n <= 6) {
      cols = Math.ceil(n / 2);
      rows = Math.ceil(n / cols);
    }
    var inset = Math.max(2, r0 * 0.55);
    var inner = Math.max(r0 * 2.2, side - inset * 2);
    var cell = Math.max(r0 * 2.15, Math.min(inner / cols, inner / rows));
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
        r: r0
      });
    }
    return slots.length ? slots : [{ x: cx, y: cy, r: r0 }];
  }

  function sideForEqualDots(n, r0, minSide) {
    var cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, n))));
    if (n <= 3) cols = Math.max(1, n);
    else if (n <= 6) cols = Math.ceil(n / 2);
    return Math.max(minSide, cols * r0 * 2.35 + r0);
  }

  // One stable seat per region key for both step 2 and step 3, so tiles grow
  // or shrink in place instead of jumping to a new centroid.
  var birthByKey = new Map();
  birthUnits.forEach(function (row) { birthByKey.set(row.key, row); });
  var pravdaByKey = new Map();
  pravdaUnits.forEach(function (row) { pravdaByKey.set(row.key, row); });

  var sharedKeys = [];
  MAP_SQUARE_UNITS.forEach(function (meta) {
    if (birthByKey.has(meta.key) || pravdaByKey.has(meta.key)) sharedKeys.push(meta.key);
  });
  birthUnits.forEach(function (row) {
    if (sharedKeys.indexOf(row.key) < 0) sharedKeys.push(row.key);
  });
  pravdaUnits.forEach(function (row) {
    if (sharedKeys.indexOf(row.key) < 0) sharedKeys.push(row.key);
  });

  var narrow = typeof mapSeqNarrow === "function" && mapSeqNarrow();
  if (narrow) chart.classList.add("is-regions");
  else chart.classList.remove("is-regions");

  var seatMetas = sharedKeys.map(function (key) {
    var birth = birthByKey.get(key);
    var pravda = pravdaByKey.get(key);
    // Prefer Fig. 8c (Pravda) seats so the static shells match that chart.
    var lon = pravda ? pravda.lon : birth.lon;
    var lat = pravda ? pravda.lat : birth.lat;
    var label = (pravda || birth).label;
    var metrics = nameMetrics(label);
    var birthSide = birth ? sideFor(birth.count) : 0;
    var pravdaSide = pravda ? sideFor(pravda.count) : 0;
    // Size + separation follow the Pravda pack when present (same as Fig. 8c).
    var side = Math.max(pravdaSide || birthSide || sideSeed(), sideSeed());
    return {
      key: key,
      lon: lon,
      lat: lat,
      label: label,
      nameLines: metrics.lines,
      labelW: metrics.w,
      labelH: metrics.h,
      labelCorner: "br",
      labelPush: 0,
      side: side,
      birthSide: birthSide,
      pravdaSide: pravdaSide,
      birth: birth || null,
      pravda: pravda || null
    };
  });

  var tilesLayers = [];
  var labelsLayers = [];
  var dots = [];
  var flyHost = null;
  var flyPairs = [];
  var reduceMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var movedFill = "#c43c3c";
  var movedHot = "#8f1f1f";

  function paintLand(svg, localProject, localToSvg, lonLo, lonHi) {
    if (typeof LAND === "undefined") return;
    // Mercator uses radians (~π jump); equirectangular frames use degrees (~180).
    var seamJump = Math.abs(localProject(180, 0)[0] - localProject(0, 0)[0]) * 0.9;
    function projectRing(dense, shapes, outlines, lonCenter) {
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
        while (lon < lonCenter - 180) lon += 360;
        while (lon > lonCenter + 180) lon -= 360;
        var xy = localProject(lon, pair[1]);
        if (previous && Math.abs(xy[0] - previous[0]) > seamJump) flush();
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
    var lonCenter = ((lonLo == null ? -180 : lonLo) + (lonHi == null ? 180 : lonHi)) / 2;
    landDense.forEach(function (ring) {
      projectRing(ring, landShapes, coastlines, lonCenter);
    });
    lakeDense.forEach(function (ring) {
      projectRing(ring, lakeShapes, lakeshores, lonCenter);
    });
    function trace(points, close) {
      var d = "";
      points.forEach(function (point, index) {
        var xy = localToSvg(point);
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

  function layoutSeatsOnFrame(seatList, localMercator, frame) {
    var localToSvg = frame.toSvg;
    seatList.forEach(function (seat) {
      var xy = localToSvg(localMercator(seat.lon, seat.lat));
      seat.cx = xy[0];
      seat.cy = xy[1];
      seat.labelCorner = "br";
      seat.labelPush = 0;
    });
    if (typeof mapSeparateTiles === "function") mapSeparateTiles(seatList, 5);
    pickCorners(seatList);
    // Keep the full geographic canvas by default. Only expand if labels/tiles
    // stick out — never crop land (that cut the bottom off Fig. 8я on desktop).
    if (frame.mapW != null && frame.mapH != null) {
      var minX = 0;
      var minY = 0;
      var maxX = frame.mapW;
      var maxY = frame.mapH;
      function includeBox(b) {
        minX = Math.min(minX, b.x0);
        maxX = Math.max(maxX, b.x1);
        minY = Math.min(minY, b.y0);
        maxY = Math.max(maxY, b.y1);
      }
      seatList.forEach(function (seat) {
        includeBox(tileBox(seat));
        includeBox(labelBox(seat));
      });
      if (minX >= 0 && minY >= 0 && maxX <= frame.mapW && maxY <= frame.mapH) {
        return { toSvg: localToSvg, mapW: frame.mapW, mapH: frame.mapH };
      }
      var shiftX = -minX;
      var shiftY = -minY;
      seatList.forEach(function (seat) {
        seat.cx += shiftX;
        seat.cy += shiftY;
      });
      return {
        toSvg: function (xy) {
          var p = localToSvg(xy);
          return [p[0] + shiftX, p[1] + shiftY];
        },
        mapW: maxX - minX,
        mapH: maxY - minY
      };
    }
    var minX2 = Infinity;
    var minY2 = Infinity;
    var maxX2 = -Infinity;
    var maxY2 = -Infinity;
    seatList.forEach(function (seat) {
      var tb = tileBox(seat);
      var lb = labelBox(seat);
      minX2 = Math.min(minX2, tb.x0, lb.x0);
      maxX2 = Math.max(maxX2, tb.x1, lb.x1);
      minY2 = Math.min(minY2, tb.y0, lb.y0);
      maxY2 = Math.max(maxY2, tb.y1, lb.y1);
    });
    var shiftX2 = frame.pad - minX2;
    var shiftY2 = frame.pad - minY2;
    seatList.forEach(function (seat) {
      seat.cx += shiftX2;
      seat.cy += shiftY2;
    });
    return {
      toSvg: function (xy) {
        var p = localToSvg(xy);
        return [p[0] + shiftX2, p[1] + shiftY2];
      },
      mapW: (maxX2 - minX2) + frame.pad * 2,
      mapH: (maxY2 - minY2) + frame.pad * 2
    };
  }

  function drawSeqPanel(seatList, peopleList, lonLo, lonHi, ariaExtra, latLo, latHi, frameOpts) {
    // Continent frames: lock the geographic window so the silhouette stays
    // readable. Do NOT crop the viewBox to tiles — that zooms into one coast.
    var opts = frameOpts || {};
    var lockFrame = lonLo != null && lonHi != null && latLo != null && latHi != null;
    // Phone portholes: target ~3.5–4 CSS px radius. unitScale keeps Asia
    // (full width) equal to half-width continent circles.
    var disp = opts.disp == null ? 0.5 : opts.disp;
    var unitScale = Math.max(0.35, disp / 0.5);
    var markRPhone = 7.6;
    var markRUse = lockFrame ? markRPhone / unitScale : markR;
    var lineHUse = lockFrame ? Math.max(14, 16 / Math.sqrt(unitScale)) : lineH;
    var calloutStemUse = lockFrame ? Math.max(6, 9 / Math.sqrt(unitScale)) : calloutStem;
    var calloutGapUse = lockFrame ? Math.max(4, 6 / Math.sqrt(unitScale)) : calloutGap;
    // Porthole frames: equirectangular (degrees). Mercator inflates Patagonia
    // and high latitudes until the silhouette looks "wrong".
    var project = lockFrame
      ? function (lon, lat) { return [lon, lat]; }
      : mercator;
    var minMX2;
    var maxMX2;
    var minMY2;
    var maxMY2;
    if (lockFrame) {
      var lon0 = lonLo;
      var lon1 = lonHi;
      var lat0 = latLo;
      var lat1 = latHi;
      // Pad the shorter axis so circular frames get a square degree window.
      if (opts.square !== false) {
        var spanLon = lon1 - lon0;
        var spanLat = lat1 - lat0;
        if (spanLon > spanLat) {
          var dLat = (spanLon - spanLat) / 2;
          lat0 -= dLat;
          lat1 += dLat;
        } else if (spanLat > spanLon) {
          var dLon = (spanLat - spanLon) / 2;
          lon0 -= dLon;
          lon1 += dLon;
        }
      }
      // Light inset so coasts aren't under the dashed ring.
      var insetLon = (lon1 - lon0) * 0.02;
      var insetLat = (lat1 - lat0) * 0.02;
      lon0 += insetLon;
      lon1 -= insetLon;
      lat0 += insetLat;
      lat1 -= insetLat;
      minMX2 = lon0;
      maxMX2 = lon1;
      minMY2 = lat0;
      maxMY2 = lat1;
    } else {
      minMX2 = Infinity;
      minMY2 = Infinity;
      maxMX2 = -Infinity;
      maxMY2 = -Infinity;
      function includeMerc2(xy) {
        if (xy[0] < minMX2) minMX2 = xy[0];
        if (xy[1] < minMY2) minMY2 = xy[1];
        if (xy[0] > maxMX2) maxMX2 = xy[0];
        if (xy[1] > maxMY2) maxMY2 = xy[1];
      }
      seatList.forEach(function (seat) {
        includeMerc2(mercator(seat.lon, seat.lat));
      });
      peopleList.forEach(function (person) {
        includeMerc2(mercator(person.birthLon, person.birthLat));
      });
      if (!isFinite(minMX2)) return null;
      var padLon2 = 8 * RAD;
      var padLat2 = mercator(0, 6)[1] - mercator(0, 0)[1];
      minMX2 -= padLon2;
      maxMX2 += padLon2;
      minMY2 -= padLat2;
      maxMY2 += padLat2;
    }
    var spanMX2 = Math.max(0.01, maxMX2 - minMX2);
    var spanMY2 = Math.max(0.01, maxMY2 - minMY2);
    var innerW2 = narrow ? 360 : 960;
    var naturalH2 = innerW2 * spanMY2 / spanMX2;
    // Never squash locked frames — anisotropic scale was warping continents.
    var innerH2 = lockFrame
      ? naturalH2
      : (narrow
        ? Math.max(150, Math.min(240, naturalH2))
        : Math.max(420, Math.min(900, naturalH2)));
    var pad2 = narrow ? (lockFrame ? 8 : 10) : 40;
    var mapW2 = innerW2 + pad2 * 2;
    var mapH2 = innerH2 + pad2 * 2;
    function localToSvg(xy) {
      return [
        pad2 + (xy[0] - minMX2) / spanMX2 * innerW2,
        pad2 + (maxMY2 - xy[1]) / spanMY2 * innerH2
      ];
    }

    function frameOval() {
      var cxF = opts.ovalCx == null ? 0.5 : opts.ovalCx;
      var cyF = opts.ovalCy == null ? 0.5 : opts.ovalCy;
      return {
        cx: mapW2 * cxF,
        cy: mapH2 * cyF,
        rx: mapW2 * (opts.ovalRx == null ? 0.36 : opts.ovalRx),
        ry: mapH2 * (opts.ovalRy == null ? 0.36 : opts.ovalRy)
      };
    }

    function pullIntoOval(seats) {
      var o = frameOval();
      // Soft edge clip — readability of geography beats fitting the ring.
      var rx = o.rx * 0.98;
      var ry = o.ry * 0.98;
      seats.forEach(function (seat) {
        var dx = seat.cx - o.cx;
        var dy = seat.cy - o.cy;
        var nx = dx / Math.max(1, rx);
        var ny = dy / Math.max(1, ry);
        var d = Math.sqrt(nx * nx + ny * ny);
        if (d > 1) {
          seat.cx = o.cx + dx / d;
          seat.cy = o.cy + dy / d;
        }
      });
    }

    function ovalContainsBox(box) {
      var o = frameOval();
      var rx = o.rx * 0.9;
      var ry = o.ry * 0.9;
      function inside(x, y) {
        var nx = (x - o.cx) / rx;
        var ny = (y - o.cy) / ry;
        return nx * nx + ny * ny <= 1;
      }
      return inside(box.x0, box.y0) && inside(box.x1, box.y0) &&
        inside(box.x0, box.y1) && inside(box.x1, box.y1);
    }

    // Hand-tuned phone label sides (packs stay put).
    // leader:true → polyline callout; otherwise no leader.
    var MANUAL_LABEL_DIR = {
      mapSqNorthernEurope: { sx: 0, sy: -1 },
      mapSqEasternEurope: { sx: 0, sy: 1 },
      mapSqWesternEurope: { sx: 0, sy: -1 },
      mapSqCentralEurope: { sx: 1, sy: -1, leader: true },
      mapSqSouthernEurope: { sx: 0, sy: 1 },
      mapSqCuba: { sx: 0, sy: -1 },
      mapSqCanada: { sx: -1, sy: -1 },
      mapSqUnitedStates: { sx: -1, sy: 0 },
      mapSqCentralAmerica: { sx: 0, sy: 1 },
      mapSqWestAsia: { sx: 0, sy: 1, leader: true },
      mapSqSouthAsia: { sx: 0, sy: 1, leader: true },
      mapSqEastAsia: { sx: 0, sy: 1, leader: true }
    };

    function slotBeside(item, sx, sy, withLeader) {
      var half = item.side / 2;
      var gap = Math.max(3, markRUse * 0.85);
      var lw = item.labelW;
      var lh = item.labelH;
      var ox = sx === 0 ? 0 : sx * (half + gap + lw / 2);
      var oy = sy === 0 ? 0 : sy * (half + gap + lh / 2);
      var labelCX = item.cx + ox;
      var labelCY = item.cy + oy;
      var box = {
        x0: labelCX - lw / 2,
        y0: labelCY - lh / 2,
        x1: labelCX + lw / 2,
        y1: labelCY + lh / 2
      };
      var anchor = sx < 0 ? "end" : sx > 0 ? "start" : "middle";
      var textX = anchor === "end" ? box.x1 : anchor === "start" ? box.x0 : labelCX;
      return {
        box: box,
        anchor: anchor,
        textX: textX,
        textY: box.y0 + lineH * 0.78,
        noLeader: !withLeader,
        x1: item.cx + (sx === 0 ? 0 : sx * half),
        y1: item.cy + (sy === 0 ? 0 : sy * half),
        x2: item.cx + ox * 0.55,
        y2: item.cy + oy * 0.55,
        x3: textX,
        y3: labelCY
      };
    }

    // Place labels beside packs (not on top of dots), prefer rim, stay in oval.
    function placeLabelsBeside(placed) {
      var mx = mapW2 / 2;
      var my = mapH2 / 2;
      var gap = Math.max(3, markRUse * 0.9);
      placed.forEach(function (item) {
        item.labelInside = false;
        item.labelSlot = null;
        var manual = MANUAL_LABEL_DIR[item.key];
        if (manual) item.labelSlot = slotBeside(item, manual.sx, manual.sy, !!manual.leader);
      });
      for (var round = 0; round < 4; round += 1) {
        placed.forEach(function (item, index) {
          if (MANUAL_LABEL_DIR[item.key]) return;
          var half = item.side / 2;
          var lw = item.labelW;
          var lh = item.labelH;
          var outwardX = item.cx >= mx ? 1 : -1;
          var outwardY = item.cy >= my ? 1 : -1;
          var dirs = [
            { sx: outwardX, sy: 0 },
            { sx: 0, sy: outwardY },
            { sx: -outwardX, sy: 0 },
            { sx: 0, sy: -outwardY },
            { sx: outwardX, sy: outwardY },
            { sx: outwardX, sy: -outwardY },
            { sx: -outwardX, sy: outwardY },
            { sx: -outwardX, sy: -outwardY }
          ];
          var best = null;
          var bestHits = Infinity;
          dirs.forEach(function (dir) {
            var ox = dir.sx === 0 ? 0 : dir.sx * (half + gap + lw / 2);
            var oy = dir.sy === 0 ? 0 : dir.sy * (half + gap + lh / 2);
            var labelCX = item.cx + ox;
            var labelCY = item.cy + oy;
            var box = {
              x0: labelCX - lw / 2,
              y0: labelCY - lh / 2,
              x1: labelCX + lw / 2,
              y1: labelCY + lh / 2
            };
            var hits = 0;
            if (!ovalContainsBox(box)) hits += 10;
            if (box.x0 < pad2 || box.y0 < pad2 || box.x1 > mapW2 - pad2 || box.y1 > mapH2 - pad2) hits += 6;
            if (boxesOverlap(padBox(box, 1), tileBox(item))) hits += 14;
            placed.forEach(function (other, otherIndex) {
              if (otherIndex === index) return;
              if (boxesOverlap(padBox(box, 1), tileBox(other))) hits += 9;
              if (other.labelSlot && boxesOverlap(padBox(box, 2), other.labelSlot.box)) hits += 4;
            });
            if (hits < bestHits) {
              bestHits = hits;
              var anchor = dir.sx < 0 ? "end" : dir.sx > 0 ? "start" : "middle";
              var textX = anchor === "end" ? box.x1 : anchor === "start" ? box.x0 : labelCX;
              best = {
                box: box,
                anchor: anchor,
                textX: textX,
                textY: box.y0 + lineH * 0.78,
                noLeader: false,
                x1: item.cx + (dir.sx === 0 ? 0 : dir.sx * half),
                y1: item.cy + (dir.sy === 0 ? 0 : dir.sy * half),
                x2: item.cx + ox * 0.55,
                y2: item.cy + oy * 0.55,
                x3: textX,
                y3: labelCY
              };
            }
          });
          item.labelSlot = best;
        });
      }
    }

    var savedStem = calloutStem;
    var savedGap = calloutGap;
    var savedLineH = lineH;
    if (lockFrame) {
      calloutStem = calloutStemUse;
      calloutGap = calloutGapUse;
      lineH = lineHUse;
    }

    var framed;
    if (lockFrame) {
      // Place seats inside the fixed continent window — never re-crop.
      seatList.forEach(function (seat) {
        // Keep regional centroids inside the porthole (don't project off-frame
        // then drag toward the oval center — that put West Asia on India).
        var seatLon = Math.max(minMX2, Math.min(maxMX2, seat.lon));
        var seatLat = Math.max(minMY2, Math.min(maxMY2, seat.lat));
        var xy = localToSvg(project(seatLon, seatLat));
        seat.cx = xy[0];
        seat.cy = xy[1];
        seat.labelCorner = "br";
        seat.labelPush = 0;
        seat.side = sideForEqualDots(
          Math.max(
            seat.birth ? seat.birth.people.length : 0,
            seat.pravda ? seat.pravda.people.length : 0,
            1
          ),
          markRUse,
          Math.max(18, seat.side * 0.9 / Math.sqrt(unitScale))
        );
        // Keep label boxes large enough to read on phone.
        if (seat.labelW) seat.labelW = Math.max(22, seat.labelW * 0.95 / Math.sqrt(unitScale));
        if (seat.labelH) seat.labelH = Math.max(12, lineHUse * (seat.nameLines ? seat.nameLines.length : 1));
      });
      // Keep geographic pack positions; only separate overlaps, then label.
      var tileGap = seatList.length >= 3
        ? Math.max(6, 7 / Math.sqrt(unitScale))
        : Math.max(4, 5 / Math.sqrt(unitScale));
      if (typeof mapSeparateTiles === "function") mapSeparateTiles(seatList, tileGap);
      pullIntoOval(seatList);
      // Hand nudge: West Asia a bit left + up (toward Middle East).
      seatList.forEach(function (seat) {
        if (seat.key !== "mapSqWestAsia") return;
        seat.cx -= Math.max(10, seat.side * 0.35);
        seat.cy -= Math.max(8, seat.side * 0.28);
      });
      placeLabelsBeside(seatList);
      framed = { toSvg: localToSvg, mapW: mapW2, mapH: mapH2 };
    } else {
      framed = layoutSeatsOnFrame(seatList, mercator, {
        toSvg: localToSvg,
        pad: pad2,
        mapW: mapW2,
        mapH: mapH2
      });
    }
    var svg = svgEl("svg");
    svg.setAttribute("viewBox", "0 0 " + framed.mapW.toFixed(1) + " " + framed.mapH.toFixed(1));
    svg.setAttribute("class", "wide map-squares map-seq");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", (ariaExtra || "") + t("mapSeqAria"));
    if (narrow) {
      svg.style.aspectRatio = framed.mapW + " / " + framed.mapH;
      svg.style.height = "auto";
    }
    // Keep off-window scatter from spilling between oval frames.
    if (lockFrame) svg.style.overflow = "hidden";
    paintLand(svg, project, framed.toSvg, lonLo, lonHi);

    var marks = svgEl("g");
    marks.setAttribute("class", "map-squares-marks");
    var tilesG = svgEl("g");
    tilesG.setAttribute("class", "map-seq-tiles");
    var labelsG = svgEl("g");
    labelsG.setAttribute("class", "map-seq-labels");
    var dotsG = svgEl("g");
    dotsG.setAttribute("class", "map-seq-dots");

    var birthSlotByI = new Map();
    var pravdaSlotByI = new Map();
    seatList.slice().sort(function (a, b) {
      return b.side - a.side;
    }).forEach(function (seat) {
      var row = seat.birth || seat.pravda;
      var birthPeople = seat.birth ? seat.birth.people.slice() : [];
      var pravdaPeople = seat.pravda ? seat.pravda.people.slice() : [];
      var unitMeta = null;
      if (typeof MAP_SQUARE_UNITS !== "undefined") {
        for (var ui = 0; ui < MAP_SQUARE_UNITS.length; ui += 1) {
          if (MAP_SQUARE_UNITS[ui].key === seat.key) {
            unitMeta = MAP_SQUARE_UNITS[ui];
            break;
          }
        }
      }
      var isRegion = !!(unitMeta && unitMeta.kind === "region");
      var gIndex = PLACE_GROUPS.length;
      // Tip picks birth vs affiliation by map-seq step — never union both.
      PLACE_GROUPS.push({
        label: seat.label,
        people: birthPeople.length ? birthPeople : pravdaPeople,
        birthPeople: birthPeople,
        pravdaPeople: pravdaPeople,
        countryMode: isRegion ? "birth" : null
      });
      var rect = svgEl("rect");
      rect.setAttribute("class", "map-squares-tile");
      setTileRect(rect, seat.cx, seat.cy, seat.side);
      rect.setAttribute("fill", row.fill);
      rect.setAttribute("fill-opacity", "0.42");
      rect.setAttribute("stroke", "#2a2a2a");
      rect.setAttribute("stroke-width", "1");
      rect.dataset.mark = "1";
      rect.dataset.g = String(gIndex);
      rect.dataset.fill = row.fill;
      rect.dataset.hot = row.hot;
      rect.dataset.stroke = "#2a2a2a";
      rect.setAttribute("tabindex", "0");
      rect.setAttribute("role", "img");
      rect.setAttribute("aria-label", seat.label);
      tilesG.appendChild(rect);

      var name = svgEl("text");
      name.setAttribute("class", "map-squares-tile-label");
      name.setAttribute("pointer-events", "none");
      if (lockFrame) name.setAttribute("font-weight", "600");
      var slot = seat.labelSlot;
      var geom = slot || null;
      if (!geom) {
        var raw = calloutGeom(seat);
        geom = {
          x1: raw.x1,
          y1: raw.y1,
          x2: raw.x2,
          y2: raw.y2,
          x3: raw.x3,
          y3: raw.y3,
          anchor: raw.anchor,
          textX: raw.anchor === "start" ? raw.box.x0 : raw.box.x1,
          textY: raw.box.y0 + lineH * 0.8,
          box: raw.box,
          noLeader: false
        };
      }
      if (!geom.noLeader) {
        var leader = svgEl("polyline");
        leader.setAttribute("class", "map-squares-leader");
        leader.setAttribute(
          "points",
          geom.x1.toFixed(1) + "," + geom.y1.toFixed(1) + " " +
          geom.x2.toFixed(1) + "," + geom.y2.toFixed(1) + " " +
          geom.x3.toFixed(1) + "," + geom.y3.toFixed(1)
        );
        labelsG.appendChild(leader);
      }
      name.setAttribute("text-anchor", geom.anchor);
      name.setAttribute("x", geom.textX.toFixed(1));
      name.setAttribute("y", geom.textY.toFixed(1));
      seat.nameLines.forEach(function (line, lineIndex) {
        var tspan = svgEl("tspan");
        tspan.setAttribute("x", geom.textX.toFixed(1));
        if (lineIndex > 0) tspan.setAttribute("dy", "1.05em");
        tspan.textContent = line;
        name.appendChild(tspan);
      });
      labelsG.appendChild(name);

      if (seat.birth) {
        var birthSlots = packDots(seat.cx, seat.cy, seat.side, seat.birth.people.length, markRUse);
        seat.birth.people.forEach(function (person, personIndex) {
          birthSlotByI.set(person.i, birthSlots[personIndex] || { x: seat.cx, y: seat.cy, r: markRUse });
        });
      }
      if (seat.pravda) {
        var pravdaSlots = packDots(seat.cx, seat.cy, seat.side, seat.pravda.people.length, markRUse);
        seat.pravda.people.forEach(function (person, personIndex) {
          pravdaSlotByI.set(person.i, pravdaSlots[personIndex] || { x: seat.cx, y: seat.cy, r: markRUse });
        });
      }
    });

    if (lockFrame) {
      calloutStem = savedStem;
      calloutGap = savedGap;
      lineH = savedLineH;
    }

    peopleList.forEach(function (person) {
      var birthXy = framed.toSvg(project(person.birthLon, person.birthLat));
      var birthSlot = birthSlotByI.get(person.i) || { x: birthXy[0], y: birthXy[1], r: markRUse };
      var pravdaSlot = pravdaSlotByI.get(person.i) || null;
      var birthKey = typeof birthSquareUnitKey === "function" ? birthSquareUnitKey(person) : null;
      var pravdaKey = typeof pravdaRegionKey === "function" ? pravdaRegionKey(person) : null;
      var moved = !!(birthKey && pravdaKey && birthKey !== pravdaKey);
      var crossFacet = moved && !pravdaSlot;

      var circle = svgEl("circle");
      circle.setAttribute("class", "map-square-dot map-seq-dot");
      circle.setAttribute("cx", birthXy[0].toFixed(2));
      circle.setAttribute("cy", birthXy[1].toFixed(2));
      circle.setAttribute("r", markRUse.toFixed(2));
      circle.setAttribute("fill", "transparent");
      circle.setAttribute("stroke", "#111");
      circle.dataset.mark = "1";
      circle.dataset.i = String(person.i);
      circle.dataset.fill = "transparent";
      circle.dataset.hot = "#000";
      circle.dataset.stroke = "#111";
      circle.dataset.coords = "1";
      if (moved) circle.dataset.moved = "1";
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "img");
      circle.setAttribute("aria-label", typeof mapMarkAria === "function" ? mapMarkAria(person) : personName(person));
      if (!wikiFor(person)) circle.classList.add("no-link");
      dotsG.appendChild(circle);
      dots.push({
        el: circle,
        moved: moved,
        crossFacet: crossFacet,
        crossFacetArrive: false,
        scatter: { x: birthXy[0], y: birthXy[1], r: markRUse },
        birth: { x: birthSlot.x, y: birthSlot.y, r: markRUse },
        pravda: pravdaSlot
          ? { x: pravdaSlot.x, y: pravdaSlot.y, r: markRUse }
          : { x: birthSlot.x, y: birthSlot.y, r: markRUse }
      });
    });

    // Arrivals from other continent frames: invisible until Pravda flight, then fade in.
    (opts.arrivals || []).forEach(function (person) {
      var pravdaSlot = pravdaSlotByI.get(person.i);
      if (!pravdaSlot) return;
      var circle = svgEl("circle");
      circle.setAttribute("class", "map-square-dot map-seq-dot is-arrival");
      circle.setAttribute("cx", pravdaSlot.x.toFixed(2));
      circle.setAttribute("cy", pravdaSlot.y.toFixed(2));
      circle.setAttribute("r", markRUse.toFixed(2));
      circle.setAttribute("fill", "transparent");
      circle.setAttribute("stroke", "#111");
      circle.style.opacity = "0";
      circle.dataset.mark = "1";
      circle.dataset.i = String(person.i);
      circle.dataset.fill = "transparent";
      circle.dataset.hot = "#000";
      circle.dataset.stroke = "#111";
      circle.dataset.coords = "1";
      circle.dataset.moved = "1";
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "img");
      circle.setAttribute("aria-label", typeof mapMarkAria === "function" ? mapMarkAria(person) : personName(person));
      if (!wikiFor(person)) circle.classList.add("no-link");
      dotsG.appendChild(circle);
      var slot = { x: pravdaSlot.x, y: pravdaSlot.y, r: markRUse };
      dots.push({
        el: circle,
        moved: true,
        crossFacet: false,
        crossFacetArrive: true,
        scatter: slot,
        birth: slot,
        pravda: slot
      });
    });

    marks.appendChild(tilesG);
    marks.appendChild(labelsG);
    marks.appendChild(dotsG);
    svg.appendChild(marks);
    tilesLayers.push(tilesG);
    labelsLayers.push(labelsG);
    return svg;
  }

  function setTileRect(el, cx, cy, side) {
    var half = side / 2;
    el.setAttribute("x", (cx - half).toFixed(1));
    el.setAttribute("y", (cy - half).toFixed(1));
    el.setAttribute("width", side.toFixed(1));
    el.setAttribute("height", side.toFixed(1));
  }

  function tileBox(item) {
    var half = item.side / 2;
    return { x0: item.cx - half, y0: item.cy - half, x1: item.cx + half, y1: item.cy + half };
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
    return {
      x1: x1,
      y1: y1,
      x2: x1 + sx * Math.max(10, outward * 0.45),
      y2: y3,
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

  function padBox(box, amount) {
    return {
      x0: box.x0 - amount,
      y0: box.y0 - amount,
      x1: box.x1 + amount,
      y1: box.y1 + amount
    };
  }

  function preferredCorners(key) {
    if (typeof mapPravdaPreferredCorners === "function") return mapPravdaPreferredCorners(key);
    return ["br", "bl", "tr", "tl"];
  }

  function pickCorners(placed) {
    for (var round = 0; round < 3; round += 1) {
      placed.forEach(function (item, index) {
        var corners = preferredCorners(item.key);
        var best = corners[0];
        var bestHits = Infinity;
        corners.forEach(function (corner) {
          item.labelCorner = corner;
          var box = labelBox(item);
          var hits = 0;
          placed.forEach(function (other, otherIndex) {
            if (otherIndex === index) return;
            if (boxesOverlap(box, tileBox(other))) hits += 3;
            if (boxesOverlap(padBox(box, labelPad), labelBox(other))) hits += 1;
          });
          if (hits < bestHits) {
            bestHits = hits;
            best = corner;
          }
        });
        item.labelCorner = best;
      });
    }
  }

  if (narrow) {
    var host = document.createElement("div");
    host.className = "map-seq-facets";
    var regions = typeof mapSeqContinentFrames === "function"
      ? mapSeqContinentFrames()
      : (typeof mapSeqRegions === "function" ? mapSeqRegions() : []);
    regions.forEach(function (region) {
      function inRegion(lon, lat) {
        return region.test.length > 1 ? region.test(lon, lat) : region.test(lon);
      }
      var people = PEOPLE_SEEN.filter(function (person) {
        if (person.birthLon == null || person.birthLat == null) return false;
        return inRegion(person.birthLon, person.birthLat);
      });
      var pravdaKeysHere = new Set();
      people.forEach(function (person) {
        var pk = typeof pravdaRegionKey === "function" ? pravdaRegionKey(person) : null;
        if (pk) pravdaKeysHere.add(pk);
      });
      // People born elsewhere whose Pravda seat lands in this continent.
      var arrivals = [];
      PEOPLE_SEEN.forEach(function (person) {
        if (person.birthLon == null || person.birthLat == null) return;
        if (inRegion(person.birthLon, person.birthLat)) return;
        var pk = typeof pravdaRegionKey === "function" ? pravdaRegionKey(person) : null;
        if (!pk || !pravdaByKey.has(pk)) return;
        var prow = pravdaByKey.get(pk);
        if (!inRegion(prow.lon, prow.lat)) return;
        arrivals.push(person);
        pravdaKeysHere.add(pk);
      });
      var seats = seatMetas
        .filter(function (seat) {
          // Birth packs that live in this continent.
          if (seat.birth && inRegion(seat.birth.lon, seat.birth.lat)) return true;
          // Pravda destinations for locals or cross-continent arrivals.
          if (seat.pravda && inRegion(seat.pravda.lon, seat.pravda.lat) && pravdaKeysHere.has(seat.key)) {
            return true;
          }
          return false;
        })
        .map(function (seat) {
          // Prefer birth centroid so gather stays inside the continent frame.
          var useBirth = seat.birth && inRegion(seat.birth.lon, seat.birth.lat);
          var lon = useBirth ? seat.birth.lon : (seat.pravda ? seat.pravda.lon : seat.lon);
          var lat = useBirth ? seat.birth.lat : (seat.pravda ? seat.pravda.lat : seat.lat);
          var shortLabel = narrowSeatLabel(seat.key, seat.label);
          var shortLines = mapSeqNameLines(shortLabel);
          var shortMetrics = nameMetrics(shortLabel);
          return {
            key: seat.key,
            lon: lon,
            lat: lat,
            label: shortLabel,
            nameLines: shortLines,
            labelW: shortMetrics.w,
            labelH: shortMetrics.h,
            labelCorner: "br",
            labelPush: 0,
            side: Math.max(18, seat.side * 0.78),
            birthSide: seat.birthSide,
            pravdaSide: seat.pravdaSide,
            birth: seat.birth,
            pravda: seat.pravda
          };
        });
      if (!seats.length && !people.length && !arrivals.length) return;
      var count = people.length;
      var label = t(region.key);
      var facet = document.createElement("figure");
      facet.className = "map-seq-facet" + (region.cls ? " " + region.cls : "");
      var cap = document.createElement("figcaption");
      cap.className = "map-seq-facet-cap";
      cap.textContent = label + ", " + countNoun(count, "person", "people", "человек", "человека", "человек");
      var frame = document.createElement("div");
      frame.className = "map-seq-facet-frame";
      var panel = drawSeqPanel(
        seats,
        people,
        region.lonLo,
        region.lonHi,
        label + ". ",
        region.latLo,
        region.latHi,
        {
          disp: region.disp,
          square: region.square,
          ovalRx: region.ovalRx,
          ovalRy: region.ovalRy,
          ovalCx: region.ovalCx,
          ovalCy: region.ovalCy,
          arrivals: arrivals
        }
      );
      if (!panel) return;
      // Caption outside the oval so it doesn't compete with land / packs.
      facet.appendChild(cap);
      frame.appendChild(panel);
      facet.appendChild(frame);
      host.appendChild(facet);
    });
    // Overlay for true flights between continent frames.
    flyHost = document.createElement("div");
    flyHost.className = "map-seq-fly-layer";
    host.appendChild(flyHost);
    var flyByI = new Map();
    dots.forEach(function (dot) {
      var id = dot.el && dot.el.dataset ? dot.el.dataset.i : null;
      if (id == null) return;
      var row = flyByI.get(id) || {};
      if (dot.crossFacet) row.from = dot;
      if (dot.crossFacetArrive) row.to = dot;
      flyByI.set(id, row);
    });
    flyByI.forEach(function (row) {
      if (!row.from || !row.to) return;
      var flyer = document.createElement("span");
      flyer.className = "map-seq-fly-dot";
      flyer.setAttribute("aria-hidden", "true");
      flyHost.appendChild(flyer);
      flyPairs.push({ from: row.from, to: row.to, el: flyer });
    });
    chart.appendChild(host);
  } else {
    var sharedSeats = seatMetas.map(function (seat) {
      return {
        key: seat.key,
        lon: seat.lon,
        lat: seat.lat,
        label: seat.label,
        nameLines: seat.nameLines.slice(),
        labelW: seat.labelW,
        labelH: seat.labelH,
        labelCorner: "br",
        labelPush: 0,
        side: seat.side,
        birthSide: seat.birthSide,
        pravdaSide: seat.pravdaSide,
        birth: seat.birth,
        pravda: seat.pravda
      };
    });
    var widePeople = PEOPLE_SEEN.filter(function (person) {
      return person.birthLon != null && person.birthLat != null;
    });
    var panel = drawSeqPanel(sharedSeats, widePeople, null, null, "");
    if (panel) chart.appendChild(panel);
  }

  tilesLayers.forEach(function (layer) { layer.style.opacity = "0"; });
  labelsLayers.forEach(function (layer) { layer.style.opacity = "0"; });

  var block = document.getElementById("map-seq-block");
  var comments = document.getElementById("map-seq-comments");
  var askRail = document.getElementById("map-seq-rail-ask");
  var noteRail = document.getElementById("map-seq-rail-note");
  var askSlips = askRail
    ? Array.prototype.slice.call(askRail.querySelectorAll(".map-seq-slip[data-step]"))
    : [];
  var noteSlips = noteRail
    ? Array.prototype.slice.call(noteRail.querySelectorAll(".map-seq-slip[data-step]"))
    : [];
  var allSlips = askSlips.concat(noteSlips);

  var PROGRESS_MAX = 3;
  // Park first slips on the left, readable, before any exit motion.
  var PARK = 0.28;
  var STICKY_TOP = 12;
  var progress = PARK;
  var targetProgress = PARK;
  var progressVel = 0;
  var rafId = 0;
  var lastTs = 0;
  var pin = document.getElementById("map-seq-pin");
  var steps = document.getElementById("map-seq-steps");
  var scrubEl = document.getElementById("map-seq-scrub");
  var scrubInput = document.getElementById("map-seq-scrub-input");
  // Faceted phone layout keeps sticky: three compact panels + stacks.
  var useSticky = !!(block && pin && steps && !reduceMotion);
  var scrubbing = false;
  var railWidth = 1;
  var askWidths = [];
  var noteWidths = [];
  var movedOn = false;
  var lastStep = -1;
  var lastGather = -1;
  var lastFly = -1;
  var lastScrubUi = -1;

  if (block) block.classList.toggle("is-sticky", useSticky);
  if (scrubEl) scrubEl.hidden = false;
  if (scrubInput) scrubInput.setAttribute("aria-label", t("mapSeqScrubAria"));
  if (!useSticky && reduceMotion) {
    progress = targetProgress = PROGRESS_MAX;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Gentler ease for map morphs (scatter→packs, packs→Pravda).
  function smootherstep(t) {
    t = clamp(t, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // Match region-label screen size across differently scaled continent SVGs.
  // Global `.map-squares-tile-label { font-size: 1rem }` otherwise makes Asia huge.
  function syncFacetLabelSizes() {
    if (!narrow) return;
    var targetPx = 11;
    chart.querySelectorAll(".map-seq-facet svg.map-seq").forEach(function (svg) {
      var vb = svg.viewBox && svg.viewBox.baseVal;
      var cssW = svg.getBoundingClientRect().width;
      if (!vb || !vb.width || cssW < 8) return;
      var userFont = targetPx * (vb.width / cssW);
      svg.querySelectorAll(".map-squares-tile-label").forEach(function (el) {
        el.style.setProperty("font-size", userFont.toFixed(2) + "px", "important");
      });
    });
  }

  function measureRail() {
    railWidth = comments ? Math.max(1, comments.clientWidth || comments.getBoundingClientRect().width) : 1;
    askWidths = askSlips.map(function (slip) {
      return slip.offsetWidth || Math.min(272, railWidth * 0.48);
    });
    noteWidths = noteSlips.map(function (slip) {
      return slip.offsetWidth || Math.min(260, railWidth * 0.46);
    });
    // Rails hug the slip box; +2px so overflow:hidden does not clip the bottom border.
    if (askRail) {
      var askH = 0;
      askSlips.forEach(function (slip) {
        askH = Math.max(askH, slip.offsetHeight || 0);
      });
      if (askH > 0) askRail.style.height = Math.ceil(askH) + 2 + "px";
    }
    if (noteRail) {
      var noteH = 0;
      noteSlips.forEach(function (slip) {
        noteH = Math.max(noteH, slip.offsetHeight || 0);
      });
      if (noteH > 0) noteRail.style.height = Math.ceil(noteH) + 2 + "px";
    }
  }

  function rightParkX(cardWidth) {
    return Math.max(0, railWidth - cardWidth - 8);
  }

  // Continuous left→park→right path (no hard velocity break at park edges).
  // Final stage (stayRight) slides to a visible right park instead of exiting.
  function cardOffsetPx(t, cardWidth, stayRight) {
    var leftPark = 0;
    var xEnter = -cardWidth - 12;
    var xEnd = stayRight ? rightParkX(cardWidth) : railWidth + 28;
    var enterEnd = 0.32;
    var exitStart = 0.55;
    if (t <= enterEnd) {
      return xEnter + smootherstep(t / enterEnd) * (leftPark - xEnter);
    }
    if (t >= exitStart) {
      return leftPark + smootherstep((t - exitStart) / (1 - exitStart)) * (xEnd - leftPark);
    }
    return leftPark;
  }

  function cardOpacity(t, stayRight) {
    if (t <= 0.22) return smootherstep(t / 0.22);
    if (stayRight) return 1;
    if (t >= 0.78) return smootherstep((1 - t) / 0.22);
    return 1;
  }

  // Stage n is parked at tick n-1 and fully gone only at tick n.
  // Maps [n-1 → n] onto [PARK → 1] so the next stack is already entering
  // while the current one exits — no empty gap between phases.
  function slipLocal(p, n) {
    if (n <= 1) return p;
    return PARK + (p - (n - 1)) * (1 - PARK);
  }

  function paintSlips(slips, widths, p, fallbackWidth) {
    slips.forEach(function (slip, index) {
      var n = Number(slip.getAttribute("data-step")) || 1;
      var local = slipLocal(p, n);
      var width = widths[index] || fallbackWidth;
      var stayRight = n === 3;
      var x;
      var opacity;
      if (local < 0) {
        x = -width - 32;
        opacity = 0;
      } else if (local > 1) {
        if (stayRight) {
          x = rightParkX(width);
          opacity = 1;
        } else {
          x = railWidth + 32;
          opacity = 0;
        }
      } else {
        x = cardOffsetPx(local, width, stayRight);
        opacity = cardOpacity(local, stayRight);
      }
      slip.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      slip.style.opacity = opacity.toFixed(3);
      slip.classList.toggle("is-live", opacity > 0.15 && (stayRight ? local >= 0 : local >= 0 && local <= 1));
    });
  }

  function setMoved(on) {
    if (on === movedOn) return;
    movedOn = on;
    dots.forEach(function (dot) {
      if (!dot.moved) return;
      if (on) {
        dot.el.classList.add("is-moved");
        dot.el.setAttribute("fill", movedFill);
        dot.el.setAttribute("stroke", movedHot);
        dot.el.dataset.fill = movedFill;
        dot.el.dataset.hot = movedHot;
        dot.el.dataset.stroke = movedHot;
      } else {
        dot.el.classList.remove("is-moved");
        dot.el.setAttribute("fill", "transparent");
        dot.el.setAttribute("stroke", "#111");
        dot.el.dataset.fill = "transparent";
        dot.el.dataset.hot = "#000";
        dot.el.dataset.stroke = "#111";
      }
    });
    flyPairs.forEach(function (pair) {
      pair.el.style.background = on ? movedFill : "transparent";
      pair.el.style.borderColor = on ? movedHot : "#111";
    });
  }

  function pointInFlyHost(svgEl) {
    if (!flyHost || !svgEl) return null;
    var hostRect = flyHost.getBoundingClientRect();
    var r = svgEl.getBoundingClientRect();
    if (!hostRect.width || !r.width) return null;
    return {
      x: r.left + r.width / 2 - hostRect.left,
      y: r.top + r.height / 2 - hostRect.top,
      rad: Math.max(2.2, r.width / 2)
    };
  }

  function updateCrossFacetFlights(t) {
    if (!flyPairs.length) return;
    var e = smootherstep(clamp(t, 0, 1));
    flyPairs.forEach(function (pair) {
      // Park source at birth pack; destination stays on its Pravda seat.
      var fromPos = pair.from.birth || pair.from.scatter;
      pair.from.el.setAttribute("cx", fromPos.x.toFixed(2));
      pair.from.el.setAttribute("cy", fromPos.y.toFixed(2));
      pair.from.el.setAttribute("r", (fromPos.r == null ? markR : fromPos.r).toFixed(2));
      var toPos = pair.to.pravda || pair.to.birth;
      pair.to.el.setAttribute("cx", toPos.x.toFixed(2));
      pair.to.el.setAttribute("cy", toPos.y.toFixed(2));
      pair.to.el.setAttribute("r", (toPos.r == null ? markR : toPos.r).toFixed(2));

      if (t <= 0) {
        pair.from.el.style.opacity = "1";
        pair.to.el.style.opacity = "0";
        pair.el.style.opacity = "0";
        return;
      }

      var a = pointInFlyHost(pair.from.el);
      var b = pointInFlyHost(pair.to.el);
      if (!a || !b) {
        // Fallback: hand off without visible flight if layout isn't ready.
        pair.from.el.style.opacity = t >= 1 ? "0" : "1";
        pair.to.el.style.opacity = t >= 1 ? "1" : "0";
        pair.el.style.opacity = "0";
        return;
      }

      pair.from.el.style.opacity = "0";
      pair.to.el.style.opacity = t >= 1 ? "1" : "0";
      pair.el.style.opacity = t >= 1 ? "0" : "1";
      var x = a.x + (b.x - a.x) * e;
      var y = a.y + (b.y - a.y) * e;
      var rad = a.rad + (b.rad - a.rad) * e;
      pair.el.style.width = (rad * 2).toFixed(2) + "px";
      pair.el.style.height = (rad * 2).toFixed(2) + "px";
      pair.el.style.marginLeft = (-rad).toFixed(2) + "px";
      pair.el.style.marginTop = (-rad).toFixed(2) + "px";
      pair.el.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)";
    });
  }

  function lerpDots(fromKey, toKey, t) {
    var e = smootherstep(t);
    dots.forEach(function (dot) {
      var a = dot[fromKey];
      var b = dot[toKey];
      // Cross-continent pairs are driven by updateCrossFacetFlights().
      if (dot.crossFacet || dot.crossFacetArrive) {
        if (toKey !== "pravda") {
          if (dot.crossFacetArrive) {
            dot.el.style.opacity = "0";
            return;
          }
          dot.el.style.opacity = "1";
          var ar0 = a.r == null ? markR : a.r;
          var br0 = b.r == null ? markR : b.r;
          dot.el.setAttribute("cx", (a.x + (b.x - a.x) * e).toFixed(2));
          dot.el.setAttribute("cy", (a.y + (b.y - a.y) * e).toFixed(2));
          dot.el.setAttribute("r", (ar0 + (br0 - ar0) * e).toFixed(2));
        }
        return;
      }
      dot.el.style.opacity = "1";
      var ar = a.r == null ? markR : a.r;
      var br = b.r == null ? markR : b.r;
      dot.el.setAttribute("cx", (a.x + (b.x - a.x) * e).toFixed(2));
      dot.el.setAttribute("cy", (a.y + (b.y - a.y) * e).toFixed(2));
      dot.el.setAttribute("r", (ar + (br - ar) * e).toFixed(2));
    });
    if (toKey === "pravda") updateCrossFacetFlights(t);
    else updateCrossFacetFlights(0);
  }

  function setLayersOpacity(value) {
    var v = String(value);
    tilesLayers.forEach(function (layer) { layer.style.opacity = v; });
    labelsLayers.forEach(function (layer) { layer.style.opacity = v; });
  }

  function setSeqSettled(on) {
    chart.querySelectorAll("svg.map-seq").forEach(function (node) {
      node.classList.toggle("is-settled", !!on);
    });
  }

  function displayStep(p) {
    if (p >= 2) return 3;
    if (p >= 1) return 2;
    return 1;
  }

  // Progress bar thirds ↔ stages: [PARK→1], [1→2], [2→3].
  var STAGE_N = 3;
  // Hold on each tick so the stacks can be read before the next beat.
  var DWELL = 0.3;

  function progressToT(p) {
    p = clamp(p, 0, PROGRESS_MAX);
    if (p <= PARK) return 0;
    if (p <= 1) return ((p - PARK) / (1 - PARK)) * (1 / STAGE_N);
    if (p <= 2) return (1 / STAGE_N) + (p - 1) * (1 / STAGE_N);
    return (2 / STAGE_N) + (p - 2) * (1 / STAGE_N);
  }

  function tToProgress(t) {
    t = clamp(t, 0, 1);
    if (t <= 1 / STAGE_N) return PARK + (t * STAGE_N) * (1 - PARK);
    if (t <= 2 / STAGE_N) return 1 + (t - 1 / STAGE_N) * STAGE_N;
    return 2 + (t - 2 / STAGE_N) * STAGE_N;
  }

  // Pause on each tick: move through most of the third, then hold.
  // Spring follow softens the freeze/restart so it doesn't jerk.
  function withDwell(t) {
    t = clamp(t, 0, 1);
    if (t >= 1) return 1;
    var seg = Math.min(STAGE_N - 1, Math.floor(t * STAGE_N + 1e-9));
    var local = t * STAGE_N - seg;
    var motion = 1 - DWELL;
    var driven = local <= motion ? smoothstep(local / motion) : 1;
    return (seg + driven) / STAGE_N;
  }

  function updateScrubUi(p) {
    if (!scrubInput && !scrubEl) return;
    var t = progressToT(p);
    var pct = Math.round(t * 1000);
    if (pct === lastScrubUi && !scrubbing) return;
    lastScrubUi = pct;
    if (scrubEl) scrubEl.style.setProperty("--map-seq-t", (t * 100).toFixed(2) + "%");
    if (scrubInput && !scrubbing) scrubInput.value = String(pct);
  }

  function scrollToT(t) {
    t = clamp(t, 0, 1);
    var next = tToProgress(t);
    if (!useSticky || !block || !pin) {
      progress = targetProgress = next;
      progressVel = 0;
      paint(progress);
      return;
    }
    var travel = Math.max(0, block.offsetHeight - pin.offsetHeight);
    if (travel <= 0) {
      progress = targetProgress = next;
      progressVel = 0;
      paint(progress);
      return;
    }
    var desired = STICKY_TOP - t * travel;
    var dy = block.getBoundingClientRect().top - desired;
    if (Math.abs(dy) > 0.5) window.scrollBy(0, dy);
    progress = targetProgress = next;
    progressVel = 0;
    paint(progress);
  }

  function paint(p) {
    progress = clamp(p, 0, PROGRESS_MAX);
    var step = displayStep(progress);
    if (step !== lastStep) {
      lastStep = step;
      chart.querySelectorAll("svg.map-seq").forEach(function (node) {
        node.setAttribute("data-step", String(step));
      });
      if (block) block.setAttribute("data-step", String(step));
    }
    updateScrubUi(progress);

    // Two stacks: question on top, short note below — same progress, move together.
    paintSlips(askSlips, askWidths, progress, Math.min(272, railWidth * 0.48));
    paintSlips(noteSlips, noteWidths, progress, Math.min(260, railWidth * 0.46));

    // Morph on the exit tail of each story beat — same cadence, wider windows:
    // gather during late stage 1; Pravda flight during late stage 2.
    if (progress < 1) {
      setMoved(false);
      var tGather = clamp((progress - 0.52) / 0.48, 0, 1);
      if (tGather !== lastGather || lastFly !== 0) {
        lastGather = tGather;
        lastFly = 0;
        setLayersOpacity(smootherstep(tGather).toFixed(3));
        lerpDots("scatter", "birth", tGather);
        setSeqSettled(false);
      }
    } else if (progress < 2) {
      lastGather = 1;
      setLayersOpacity("1");
      var tFlyEarly = clamp((progress - 1.52) / 0.48, 0, 1);
      if (tFlyEarly !== lastFly) lastFly = tFlyEarly;
      if (tFlyEarly <= 0) {
        setMoved(false);
        lerpDots("birth", "birth", 1);
        setSeqSettled(false);
      } else {
        lerpDots("birth", "pravda", tFlyEarly);
        setMoved(smootherstep(tFlyEarly) > 0.28);
        setSeqSettled(tFlyEarly >= 1);
      }
    } else {
      if (lastFly !== 1) {
        lastFly = 1;
        lastGather = 1;
        setLayersOpacity("1");
        lerpDots("birth", "pravda", 1);
        setMoved(true);
        setSeqSettled(true);
      }
    }
  }

  function scrollT() {
    if (!useSticky || !block || !pin) return reduceMotion ? 1 : 0;
    var travel = Math.max(0, block.offsetHeight - pin.offsetHeight);
    if (travel <= 0) return 0;
    var passed = Math.min(travel, Math.max(0, STICKY_TOP - block.getBoundingClientRect().top));
    return passed / travel;
  }

  function progressFromScroll() {
    return tToProgress(withDwell(scrollT()));
  }

  function queueScrub() {
    if (rafId) return;
    lastTs = 0;
    rafId = requestAnimationFrame(tick);
    if (block) block._mapSeqRaf = rafId;
  }

  function tick(ts) {
    var dt = lastTs ? Math.min(0.04, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    var diff = targetProgress - progress;
    // Damped spring — continuous velocity, no lag-then-catch-up jerk.
    var stiffness = 48;
    var damping = 14;
    progressVel += (diff * stiffness - progressVel * damping) * dt;
    progress += progressVel * dt;
    if (Math.abs(diff) < 0.0012 && Math.abs(progressVel) < 0.02) {
      progress = targetProgress;
      progressVel = 0;
    }
    progress = clamp(progress, 0, PROGRESS_MAX);
    paint(progress);

    if (progress === targetProgress && progressVel === 0) {
      rafId = 0;
      lastTs = 0;
      if (block) block._mapSeqRaf = 0;
      return;
    }
    rafId = requestAnimationFrame(tick);
    if (block) block._mapSeqRaf = rafId;
  }

  function syncFromScroll() {
    if (scrubbing) return;
    targetProgress = progressFromScroll();
    // Only hard-snap on huge jumps (anchor / layout), otherwise spring.
    if (Math.abs(targetProgress - progress) > 0.9) {
      progress = targetProgress;
      progressVel = 0;
      paint(progress);
      return;
    }
    queueScrub();
  }

  function onScrubInput() {
    if (!scrubInput) return;
    scrubbing = true;
    if (scrubEl) scrubEl.classList.add("is-scrubbing");
    var t = Number(scrubInput.value) / 1000;
    if (scrubEl) scrubEl.style.setProperty("--map-seq-t", (clamp(t, 0, 1) * 100).toFixed(2) + "%");
    lastScrubUi = Math.round(clamp(t, 0, 1) * 1000);
    scrollToT(t);
  }

  function onScrubEnd() {
    if (!scrubInput) {
      scrubbing = false;
      if (scrubEl) scrubEl.classList.remove("is-scrubbing");
      return;
    }
    var t = Number(scrubInput.value) / 1000;
    scrollToT(t);
    scrubbing = false;
    if (scrubEl) scrubEl.classList.remove("is-scrubbing");
    syncFromScroll();
  }

  function onResize() {
    measureRail();
    syncFacetLabelSizes();
    syncFromScroll();
  }

  if (block && block._mapSeqRaf) cancelAnimationFrame(block._mapSeqRaf);
  if (block && block._mapSeqClick) block.removeEventListener("click", block._mapSeqClick);
  if (block && block._mapSeqWheel) window.removeEventListener("wheel", block._mapSeqWheel);
  if (block && block._mapSeqScroll) {
    window.removeEventListener("scroll", block._mapSeqScroll);
    window.removeEventListener("resize", block._mapSeqResize);
  }
  if (block && block._mapSeqTouchStart) {
    block.removeEventListener("touchstart", block._mapSeqTouchStart);
    block.removeEventListener("touchmove", block._mapSeqTouchMove);
    block.removeEventListener("touchend", block._mapSeqTouchEnd);
  }
  if (block && block._mapSeqScrubInput && scrubInput) {
    scrubInput.removeEventListener("input", block._mapSeqScrubInput);
    scrubInput.removeEventListener("change", block._mapSeqScrubChange);
    scrubInput.removeEventListener("pointerup", block._mapSeqScrubEnd);
    scrubInput.removeEventListener("keyup", block._mapSeqScrubEnd);
  }

  if (block) {
    block._mapSeqClick = null;
    block._mapSeqWheel = null;
    block._mapSeqTouchStart = null;
    block._mapSeqTouchMove = null;
    block._mapSeqTouchEnd = null;
    block._mapSeqScroll = syncFromScroll;
    block._mapSeqResize = onResize;
    block._mapSeqRaf = 0;
    if (scrubInput) {
      block._mapSeqScrubInput = onScrubInput;
      block._mapSeqScrubChange = onScrubEnd;
      block._mapSeqScrubEnd = onScrubEnd;
      scrubInput.addEventListener("input", onScrubInput);
      scrubInput.addEventListener("change", onScrubEnd);
      scrubInput.addEventListener("pointerup", onScrubEnd);
      scrubInput.addEventListener("keyup", onScrubEnd);
    }
  }
  window.addEventListener("scroll", syncFromScroll, { passive: true });
  window.addEventListener("resize", onResize);

  allSlips.forEach(function (slip) {
    slip.classList.remove("is-active", "is-ahead", "is-behind");
  });
  measureRail();
  syncFacetLabelSizes();
  // Second pass after layout settles (grid widths ready).
  requestAnimationFrame(function () {
    syncFacetLabelSizes();
  });
  syncFromScroll();
}

function mapSeqSource() {
  var narrow = typeof mapSeqNarrow === "function" && mapSeqNarrow();
  if (lang === "ru") {
    return "Скролл по рис. 8я ведёт стопки слева направо, затем сменяет стадию. " +
      "Состояния 1–2: координаты рождения, бины как на рис. 8a. Состояние 3: страна из подписи «Правды». " +
      "Кто сменил регион, заливается красным. Проекция: " +
      (narrow ? "равнопромежуточная в овальных фреймах континентов." : "Меркатор.");
  }
  return "Scrolling through Fig. 8я walks the stacks left→right, then changes stage. " +
    "States 1–2: birth coordinates and Fig. 8a bins. State 3: Pravda’s country line. Movers fill red. Projection: " +
    (narrow ? "equirectangular continent frames." : "Mercator.");
}
