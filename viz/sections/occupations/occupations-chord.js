// Fig. 3a: exclusive class hex clouds + separate pairwise intersection hubs
// parked in the same neighborhood as the singles they bridge (not merged into
// class outlines). Triple+ Pravda sets fold to their strongest pair.

var OCC_CLUSTER_ORDER = [
  "politician",
  "culture",
  "public_figure",
  "scientist",
  "clergy",
  "labor_movement"
];

var OCC_CLUSTER_RING = [
  "culture",
  "public_figure",
  "politician",
  "scientist",
  "clergy",
  "labor_movement"
];

// Clockwise from the top.
var OCC_CLUSTER_PETALS = [
  "labor_movement",
  "culture",
  "politician",
  "scientist",
  "clergy"
];

var OCC_CLUSTER_COLOR = {
  politician: "#0f6a72",
  culture: "#b43d5c",
  public_figure: "#a87410",
  scientist: "#2f5a40",
  clergy: "#5a4638",
  labor_movement: "#7a3f1c"
};

function occClusterSortClasses(classes) {
  return classes.slice().sort(function (a, b) {
    return OCC_CLUSTER_ORDER.indexOf(a) - OCC_CLUSTER_ORDER.indexOf(b);
  });
}

function occClusterKey(classes) {
  return occClusterSortClasses(classes).join("|");
}

function occClusterLabel(classes) {
  return occClusterSortClasses(classes).map(occLabel).join(" · ");
}

function occClusterMain(person) {
  var pravda = typeof pravdaOccClass === "function" ? pravdaOccClass(person) : null;
  return pravda || person.occupationClass;
}

function occClusterRawClasses(person) {
  var classes = typeof pravdaOccClasses === "function" ? pravdaOccClasses(person) : [];
  var seen = {};
  var uniq = [];
  classes.forEach(function (key) {
    if (!key || seen[key]) return;
    seen[key] = true;
    uniq.push(key);
  });
  if (!uniq.length) {
    var main = occClusterMain(person);
    if (main) uniq.push(main);
  }
  return occClusterSortClasses(uniq);
}

function occPairScores() {
  var scores = {};
  PEOPLE_SEEN.forEach(function (person) {
    var classes = occClusterRawClasses(person);
    if (classes.length < 2) return;
    for (var i = 0; i < classes.length; i++) {
      for (var j = i + 1; j < classes.length; j++) {
        var key = occClusterKey([classes[i], classes[j]]);
        scores[key] = (scores[key] || 0) + 1;
      }
    }
  });
  return scores;
}

// Folds 3+ classes to one pair. The pair must keep the person's Fig. 3 main
// class, so a cloud plus its bridges always covers that class's Fig. 3 count.
function occPairwiseClasses(raw, scores, main) {
  if (raw.length <= 2) return raw.slice();
  var keepMain = raw.indexOf(main) !== -1;
  var best = null;
  var bestScore = -1;
  for (var i = 0; i < raw.length; i++) {
    for (var j = i + 1; j < raw.length; j++) {
      if (keepMain && raw[i] !== main && raw[j] !== main) continue;
      var pair = occClusterSortClasses([raw[i], raw[j]]);
      var key = pair.join("|");
      var score = scores[key] || 0;
      if (score > bestScore) {
        bestScore = score;
        best = pair;
      }
    }
  }
  return best || raw.slice(0, 2);
}

function occClusterRecords() {
  var scores = occPairScores();
  return PEOPLE_SEEN.map(function (person) {
    var raw = occClusterRawClasses(person);
    var fig3Main = occClusterMain(person);
    var classes = occPairwiseClasses(raw, scores, fig3Main);
    var main = fig3Main || classes[0];
    return {
      person: person,
      main: main,
      classes: classes,
      multi: classes.length >= 2,
      key: classes.length >= 2 ? occClusterKey(classes) : main
    };
  });
}

function occClusterPickQuote(person) {
  var row = typeof pravdaOccFor === "function" ? pravdaOccFor(person) : null;
  if (!row || !row.text) return "";
  var text = row.text.replace(/\s+/g, " ").trim();
  if (row.source === "decree") return "«" + text + "»";
  return text;
}

// disk() neighbors sit √3 apart; normalize so neighbors are exactly `step` apart.
function occLocalPack(n, step) {
  var k = step / Math.sqrt(3);
  return disk(n).map(function (pt) {
    return { x: pt.x * k, y: pt.y * k };
  });
}

function occPackRadius(n, step, hexR) {
  if (n <= 0) return hexR * 1.2;
  var local = occLocalPack(n, step);
  var r = hexR * 1.15;
  local.forEach(function (c) {
    var d = Math.hypot(c.x, c.y) + hexR * 1.05;
    if (d > r) r = d;
  });
  return r;
}

function occMinDist2(placed, x, y) {
  var best = Infinity;
  for (var i = 0; i < placed.length; i++) {
    var dx = placed[i].x - x;
    var dy = placed[i].y - y;
    var d2 = dx * dx + dy * dy;
    if (d2 < best) best = d2;
  }
  return best;
}

function occFindFreeSpot(placed, x0, y0, minDist) {
  var min2 = minDist * minDist;
  if (occMinDist2(placed, x0, y0) >= min2) return { x: x0, y: y0 };
  for (var ring = 1; ring <= 40; ring++) {
    var rad = minDist * ring;
    var turns = Math.max(6, ring * 6);
    for (var k = 0; k < turns; k++) {
      var ang = (Math.PI * 2 * k) / turns + ring * 0.31;
      var x = x0 + Math.cos(ang) * rad;
      var y = y0 + Math.sin(ang) * rad;
      if (occMinDist2(placed, x, y) >= min2) return { x: x, y: y };
    }
  }
  return { x: x0 + minDist, y: y0 };
}

function occSeparate(placed, minDist) {
  var min2 = minDist * minDist;
  for (var iter = 0; iter < 40; iter++) {
    var moved = false;
    for (var i = 0; i < placed.length; i++) {
      for (var j = i + 1; j < placed.length; j++) {
        var dx = placed[j].x - placed[i].x;
        var dy = placed[j].y - placed[i].y;
        var d2 = dx * dx + dy * dy;
        if (d2 >= min2 && d2 > 0) continue;
        if (d2 < 1e-8) {
          dx = 0.4;
          dy = 0.25;
          d2 = dx * dx + dy * dy;
        }
        var d = Math.sqrt(d2);
        var push = (minDist - d) * 0.5;
        var ux = dx / d;
        var uy = dy / d;
        placed[i].x -= ux * push;
        placed[i].y -= uy * push;
        placed[j].x += ux * push;
        placed[j].y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function occAnchorPull(placed, strength) {
  placed.forEach(function (p) {
    if (p.ax == null) return;
    p.x += (p.ax - p.x) * strength;
    p.y += (p.ay - p.y) * strength;
  });
}

function occHexCorner(cx, cy, radius, i) {
  var ang = (Math.PI / 3) * i;
  return {
    x: cx + radius * Math.cos(ang),
    y: cy + radius * Math.sin(ang)
  };
}

function occConvexHull(points) {
  if (points.length <= 1) return points.slice();
  var pts = points.slice().sort(function (a, b) {
    return a.x - b.x || a.y - b.y;
  });
  function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
  var lower = [];
  for (var i = 0; i < pts.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) {
      lower.pop();
    }
    lower.push(pts[i]);
  }
  var upper = [];
  for (var j = pts.length - 1; j >= 0; j--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[j]) <= 0) {
      upper.pop();
    }
    upper.push(pts[j]);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function occHullPath(centers, pad) {
  var ring = [];
  centers.forEach(function (c) {
    for (var i = 0; i < 6; i++) ring.push(occHexCorner(c.x, c.y, pad, i));
  });
  var hull = occConvexHull(ring);
  if (!hull.length) return "";
  var d = "M" + hull[0].x.toFixed(2) + "," + hull[0].y.toFixed(2);
  for (var k = 1; k < hull.length; k++) {
    d += "L" + hull[k].x.toFixed(2) + "," + hull[k].y.toFixed(2);
  }
  return d + "Z";
}

function occBlendColor(a, b) {
  function parse(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }
  var ca = parse(a || "#888888");
  var cb = parse(b || "#888888");
  var r = Math.round((ca[0] + cb[0]) / 2);
  var g = Math.round((ca[1] + cb[1]) / 2);
  var bl = Math.round((ca[2] + cb[2]) / 2);
  return "#" + [r, g, bl].map(function (n) {
    return ("0" + n.toString(16)).slice(-2);
  }).join("");
}

function occClusterLayout(records, hexR) {
  // One neighbor spacing for every cloud and hub — the Fig. 3 lattice pitch.
  var step = hexR * Math.sqrt(3);
  var minDist = step * 0.98;
  var counts = {};
  records.forEach(function (rec) {
    counts[rec.main] = (counts[rec.main] || 0) + 1;
  });

  var classOrder = OCC_CLUSTER_RING.filter(function (key) {
    return counts[key];
  }).concat(Object.keys(counts).filter(function (key) {
    return OCC_CLUSTER_RING.indexOf(key) < 0;
  }).sort(function (a, b) {
    return counts[b] - counts[a];
  }));

  var singles = {};
  var multi = [];
  classOrder.forEach(function (key) { singles[key] = []; });
  records.forEach(function (rec, index) {
    if (rec.multi) multi.push(index);
    else {
      if (!singles[rec.main]) singles[rec.main] = [];
      singles[rec.main].push(index);
    }
  });

  var compounds = {};
  multi.forEach(function (recIndex) {
    var rec = records[recIndex];
    if (!compounds[rec.key]) {
      compounds[rec.key] = {
        key: rec.key,
        classes: rec.classes.slice(),
        people: []
      };
    }
    compounds[rec.key].people.push(recIndex);
  });
  var compoundRows = Object.keys(compounds).map(function (key) {
    return compounds[key];
  }).sort(function (a, b) {
    return b.people.length - a.people.length ||
      occClusterLabel(a.classes).localeCompare(occClusterLabel(b.classes), lang);
  });

  var clusters = classOrder.map(function (key) {
    var idxs = (singles[key] || []).slice().sort(function (a, b) {
      var pa = records[a].person;
      var pb = records[b].person;
      if (pa.gender !== pb.gender) return pa.gender === "female" ? -1 : 1;
      return byYear(pa, pb);
    });
    var local = occLocalPack(Math.max(idxs.length, 1), step);
    return {
      key: key,
      idxs: idxs,
      local: local,
      radius: occPackRadius(idxs.length, step, hexR),
      color: OCC_CLUSTER_COLOR[key] || "#666"
    };
  });

  var byKey = {};
  clusters.forEach(function (c) { byKey[c.key] = c; });

  var hubs = compoundRows.map(function (row) {
    return {
      key: row.key,
      classes: row.classes,
      people: row.people,
      local: occLocalPack(row.people.length, step),
      radius: occPackRadius(row.people.length, step, hexR),
      color: occBlendColor(
        OCC_CLUSTER_COLOR[row.classes[0]],
        OCC_CLUSTER_COLOR[row.classes[1]]
      )
    };
  });

  // The class that touches the most pairwise people becomes the center; the
  // rest are petals around it.
  var touch = {};
  hubs.forEach(function (hub) {
    hub.classes.forEach(function (cls) {
      touch[cls] = (touch[cls] || 0) + hub.people.length;
    });
  });
  var centerKey = classOrder.slice().sort(function (a, b) {
    return (touch[b] || 0) - (touch[a] || 0);
  })[0];
  var center = byKey[centerKey];
  center.origin = { x: 0, y: 0 };

  var hubByPair = {};
  hubs.forEach(function (hub) { hubByPair[hub.key] = hub; });

  // Petal order keeps non-center pairs adjacent; a petal without a center
  // bridge goes on top so the center label has a clear spoke.
  var petals = OCC_CLUSTER_PETALS.filter(function (key) {
    return key !== centerKey && byKey[key];
  }).concat(classOrder.filter(function (key) {
    return key !== centerKey && OCC_CLUSTER_PETALS.indexOf(key) < 0;
  })).map(function (key) { return byKey[key]; });

  // Every petal sits just far enough out for its bridge hub plus the same
  // clearance on both sides, so the gaps read evenly across the figure.
  var clear = step * 2.1;
  var bareGap = step * 4.2;
  var spokeLen = {};
  petals.forEach(function (petal) {
    var bridge = hubByPair[occClusterKey([centerKey, petal.key])];
    var gap = bridge ? bridge.radius * 2 + clear * 2 : bareGap;
    spokeLen[petal.key] = center.radius + gap + petal.radius;
  });

  var np = petals.length;
  var stretch = 1;
  for (var tries = 0; tries < 30; tries++) {
    petals.forEach(function (petal, index) {
      var ang = -Math.PI / 2 + (2 * Math.PI * index) / np;
      var dist = spokeLen[petal.key] * stretch;
      petal.angle = ang;
      petal.dist = dist;
      petal.origin = { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist };
    });
    var crowded = false;
    for (var pi = 0; pi < np; pi++) {
      var p1 = petals[pi];
      var p2 = petals[(pi + 1) % np];
      var rimHub = hubByPair[occClusterKey([p1.key, p2.key])];
      var need = p1.radius + p2.radius + (rimHub ? rimHub.radius * 2 + clear * 2 : bareGap);
      if (Math.hypot(p1.origin.x - p2.origin.x, p1.origin.y - p2.origin.y) < need) {
        crowded = true;
        break;
      }
    }
    if (!crowded) break;
    stretch += 0.06;
  }

  // Spoke hubs sit between the center and the petal edge; rim hubs sit
  // between two petals, pushed outward so they clear the spokes.
  hubs.forEach(function (hub) {
    var a = byKey[hub.classes[0]];
    var b = byKey[hub.classes[1]];
    if (!a || !b) {
      hub.origin = { x: 0, y: 0 };
      return;
    }
    if (a === center || b === center) {
      var petal = a === center ? b : a;
      var inner = center.radius;
      var outer = petal.dist - petal.radius;
      var r = (inner + outer) / 2;
      hub.kind = "spoke";
      hub.petal = petal.key;
      hub.origin = { x: Math.cos(petal.angle) * r, y: Math.sin(petal.angle) * r };
      return;
    }
    var mx = (a.origin.x + b.origin.x) / 2;
    var my = (a.origin.y + b.origin.y) / 2;
    var len = Math.hypot(mx, my) || 1;
    var rim = Math.max(len, (a.dist + b.dist) / 2 * 0.9);
    hub.kind = "rim";
    hub.origin = { x: (mx / len) * rim, y: (my / len) * rim };
  });

  var placed = [];

  clusters.forEach(function (cluster) {
    cluster.idxs.forEach(function (recIndex, i) {
      var local = cluster.local[i] || { x: 0, y: 0 };
      var x = cluster.origin.x + local.x;
      var y = cluster.origin.y + local.y;
      placed.push({
        rec: records[recIndex],
        x: x,
        y: y,
        ax: x,
        ay: y,
        cluster: cluster.key,
        hub: null
      });
    });
  });

  hubs.forEach(function (hub) {
    hub.people.forEach(function (recIndex, i) {
      var local = hub.local[i] || { x: 0, y: 0 };
      var seed = {
        x: hub.origin.x + local.x,
        y: hub.origin.y + local.y
      };
      var spot = occFindFreeSpot(placed, seed.x, seed.y, minDist);
      placed.push({
        rec: records[recIndex],
        x: spot.x,
        y: spot.y,
        ax: spot.x,
        ay: spot.y,
        cluster: records[recIndex].main,
        hub: hub.key
      });
    });
  });

  for (var pass = 0; pass < 6; pass++) {
    occSeparate(placed, minDist);
    occAnchorPull(placed, 0.14);
  }
  occSeparate(placed, minDist);

  return {
    placed: placed,
    clusters: clusters,
    hubs: hubs,
    centerKey: centerKey,
    centerTouch: touch[centerKey] || 0,
    classOrder: Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] ||
        OCC_CLUSTER_ORDER.indexOf(a) - OCC_CLUSTER_ORDER.indexOf(b);
    }),
    counts: counts,
    multiCount: multi.length,
    compoundRows: compoundRows,
    byKey: byKey
  };
}

// Best space split into two lines (character balance — SVG has no CSS wrap).
function occWrapCaptionLines(text) {
  if (!text || text.indexOf(" ") === -1) return [text];
  var best = null;
  for (var i = 0; i < text.length; i++) {
    if (text.charAt(i) !== " ") continue;
    var top = text.slice(0, i);
    var bottom = text.slice(i + 1);
    if (!bottom) continue;
    var widest = Math.max(top.length, bottom.length);
    var balance = Math.abs(top.length - bottom.length);
    if (!best || widest < best.widest || (widest === best.widest && balance < best.balance)) {
      best = { lines: [top, bottom], widest: widest, balance: balance };
    }
  }
  if (!best || best.widest >= text.length) return [text];
  return best.lines;
}

// fs: label font sizes in viewBox units ({ label, hub }).
// narrow: straight wrapped captions; wide: arcs hugging each cloud.
function renderOccClusterCloud(layout, hexR, fs, narrow) {
  var draw = hexR * 0.93;
  var hullPad = hexR * 1.4;
  var pad = hexR * 2.6;
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;

  layout.placed.forEach(function (p) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  var svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("occ-compound-union");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("occChordAria"));

  var washLayer = document.createElementNS(SVG_NS, "g");
  washLayer.setAttribute("class", "occ-compound-washes");
  svg.appendChild(washLayer);

  var hexLayer = document.createElementNS(SVG_NS, "g");
  hexLayer.setAttribute("class", "occ-compound-hexes");
  svg.appendChild(hexLayer);

  var borderLayer = document.createElementNS(SVG_NS, "g");
  borderLayer.setAttribute("class", "occ-compound-borders");
  svg.appendChild(borderLayer);

  var labelLayer = document.createElementNS(SVG_NS, "g");
  labelLayer.setAttribute("class", "occ-compound-labels");
  svg.appendChild(labelLayer);

  function centroid(pts) {
    var cx = 0;
    var cy = 0;
    pts.forEach(function (p) { cx += p.x; cy += p.y; });
    cx /= pts.length || 1;
    cy /= pts.length || 1;
    var reach = 0;
    pts.forEach(function (p) {
      var d = Math.hypot(p.x - cx, p.y - cy);
      if (d > reach) reach = d;
    });
    return { x: cx, y: cy, reach: reach };
  }

  function pointsOf(filter) {
    return layout.placed.filter(filter).map(function (p) { return { x: p.x, y: p.y }; });
  }

  function labelBox(text, hub) {
    var lines = Array.isArray(text) ? text : [text];
    var size = hub ? fs.hub : fs.label;
    var maxLen = 0;
    lines.forEach(function (line) { maxLen = Math.max(maxLen, line.length); });
    var lineH = size * 1.2;
    return {
      lines: lines,
      hw: maxLen * size * 0.29 + size * 0.2,
      hh: (lines.length * lineH) / 2,
      size: size,
      lineH: lineH
    };
  }

  // Seat a label just outside a circle (cx, cy, r) in direction (ux, uy),
  // pushing by the box's support distance so no corner cuts into the cloud.
  function seatLabel(cx, cy, r, ux, uy, text, key, hub) {
    var b = labelBox(text, hub);
    var gap = b.size * 0.35;
    var push = r + gap + Math.abs(ux) * b.hw + Math.abs(uy) * b.hh;
    addLabel(cx + ux * push, cy + uy * push, text, key, hub);
  }

  function addLabel(x, y, text, key, hub) {
    var b = labelBox(text, hub);
    minX = Math.min(minX, x - b.hw);
    maxX = Math.max(maxX, x + b.hw);
    minY = Math.min(minY, y - b.hh);
    maxY = Math.max(maxY, y + b.hh);
    var label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("font-size", b.size.toFixed(2));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("class", "occ-compound-svg-label" + (hub ? " is-hub" : ""));
    label.dataset.key = key;
    label.dataset.kind = hub ? "hub" : "class";
    if (b.lines.length === 1) {
      label.setAttribute("x", x.toFixed(1));
      label.setAttribute("y", y.toFixed(1));
      label.textContent = b.lines[0];
    } else {
      var startY = y - ((b.lines.length - 1) * b.lineH) / 2;
      b.lines.forEach(function (line, i) {
        var tspan = document.createElementNS(SVG_NS, "tspan");
        tspan.setAttribute("x", x.toFixed(1));
        tspan.setAttribute("y", (startY + i * b.lineH).toFixed(1));
        tspan.textContent = line;
        label.appendChild(tspan);
      });
    }
    labelLayer.appendChild(label);
  }

  // Stems run center to center and are masked out inside the hulls, so each
  // one meets its cloud exactly at the border.
  var stemDefs = document.createElementNS(SVG_NS, "defs");
  var stemMask = document.createElementNS(SVG_NS, "mask");
  stemMask.setAttribute("id", "occ-stem-mask");
  stemMask.setAttribute("maskUnits", "userSpaceOnUse");
  stemMask.setAttribute("x", "-100000");
  stemMask.setAttribute("y", "-100000");
  stemMask.setAttribute("width", "200000");
  stemMask.setAttribute("height", "200000");
  var maskBg = document.createElementNS(SVG_NS, "rect");
  maskBg.setAttribute("x", "-100000");
  maskBg.setAttribute("y", "-100000");
  maskBg.setAttribute("width", "200000");
  maskBg.setAttribute("height", "200000");
  maskBg.setAttribute("fill", "#fff");
  stemMask.appendChild(maskBg);
  stemDefs.appendChild(stemMask);
  svg.insertBefore(stemDefs, svg.firstChild);
  var stemLayer = document.createElementNS(SVG_NS, "g");
  stemLayer.setAttribute("class", "occ-compound-stems");
  stemLayer.setAttribute("mask", "url(#occ-stem-mask)");
  svg.insertBefore(stemLayer, washLayer);

  var cloudInfo = {};
  layout.clusters.forEach(function (cluster) {
    var pts = pointsOf(function (p) { return !p.hub && p.cluster === cluster.key; });
    if (!pts.length) return;
    cloudInfo[cluster.key] = centroid(pts);
    cloudInfo[cluster.key].pts = pts;
    var hull = occHullPath(pts, hullPad);
    var isCenter = cluster.key === layout.centerKey;

    var cut = document.createElementNS(SVG_NS, "path");
    cut.setAttribute("d", hull);
    cut.setAttribute("fill", "#000");
    stemMask.appendChild(cut);

    var wash = document.createElementNS(SVG_NS, "path");
    wash.setAttribute("d", hull);
    wash.setAttribute("class", "occ-compound-wash");
    wash.dataset.key = cluster.key;
    wash.dataset.kind = "class";
    wash.setAttribute("fill", cluster.color);
    wash.setAttribute("fill-opacity", isCenter ? "0.14" : "0.09");
    wash.setAttribute("stroke", "none");
    washLayer.appendChild(wash);

    var border = document.createElementNS(SVG_NS, "path");
    border.setAttribute("d", hull);
    border.setAttribute("class", "occ-compound-hull");
    border.dataset.key = cluster.key;
    border.dataset.kind = "class";
    border.setAttribute("fill", "none");
    border.setAttribute("stroke", cluster.color);
    border.setAttribute("stroke-width", isCenter ? "2.6" : "2");
    border.setAttribute("stroke-linejoin", "round");
    border.setAttribute("vector-effect", "non-scaling-stroke");
    borderLayer.appendChild(border);
  });

  // Hubs have no hull of their own: a soft stem connects them to both
  // parent clouds, so the overlap reads as a bridge.
  layout.hubs.forEach(function (hub) {
    var pts = pointsOf(function (p) { return p.hub === hub.key; });
    if (!pts.length) return;
    var c = centroid(pts);
    var a = cloudInfo[hub.classes[0]];
    var b = cloudInfo[hub.classes[1]];
    if (a && b) {
      var ctrlX = 2 * c.x - (a.x + b.x) / 2;
      var ctrlY = 2 * c.y - (a.y + b.y) / 2;
      var at = function (t) {
        var u = 1 - t;
        return {
          x: u * u * a.x + 2 * u * t * ctrlX + t * t * b.x,
          y: u * u * a.y + 2 * u * t * ctrlY + t * t * b.y
        };
      };
      // Where the curve leaves each hull (hull ≈ points + pad along that ray).
      var exitT = function (cloud, fromStart) {
        for (var i = 1; i <= 100; i++) {
          var t = fromStart ? i / 100 : 1 - i / 100;
          var q = at(t);
          var dx = q.x - cloud.x;
          var dy = q.y - cloud.y;
          var len = Math.hypot(dx, dy) || 1;
          var along = 0;
          cloud.pts.forEach(function (p) {
            along = Math.max(along, ((p.x - cloud.x) * dx + (p.y - cloud.y) * dy) / len);
          });
          if (len > along + hullPad) return t;
        }
        return fromStart ? 0.3 : 0.7;
      };
      var tA = exitT(a, true);
      var tB = exitT(b, false);
      var flareLen = Math.max(0.06, (tB - tA) * 0.16);
      // Width grows gently with the overlap size: a thread for 2, a lane for 31.
      var base = hexR * (0.6 + 0.28 * Math.sqrt(pts.length));
      var flare = function (t) {
        var g = 0;
        if (t < tA + flareLen) g = Math.pow(Math.min(1, (tA + flareLen - t) / flareLen), 2);
        if (t > tB - flareLen) g = Math.max(g, Math.pow(Math.min(1, (t - (tB - flareLen)) / flareLen), 2));
        return base * (1 + 0.75 * g) / 2;
      };
      var left = [];
      var right = [];
      var N = 64;
      for (var i = 0; i <= N; i++) {
        var t = i / N;
        var p0 = at(Math.max(0, t - 0.005));
        var p1 = at(Math.min(1, t + 0.005));
        var tx = p1.x - p0.x;
        var ty = p1.y - p0.y;
        var tl = Math.hypot(tx, ty) || 1;
        var nx = -ty / tl;
        var ny = tx / tl;
        var q = at(t);
        var w = flare(t);
        left.push((q.x + nx * w).toFixed(1) + " " + (q.y + ny * w).toFixed(1));
        right.unshift((q.x - nx * w).toFixed(1) + " " + (q.y - ny * w).toFixed(1));
      }

      var gradId = "occ-stem-grad-" + hub.key.replace(/[^a-z0-9]/gi, "-");
      var grad = document.createElementNS(SVG_NS, "linearGradient");
      grad.setAttribute("id", gradId);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      grad.setAttribute("x1", a.x.toFixed(1));
      grad.setAttribute("y1", a.y.toFixed(1));
      grad.setAttribute("x2", b.x.toFixed(1));
      grad.setAttribute("y2", b.y.toFixed(1));
      [
        [tA, OCC_CLUSTER_COLOR[hub.classes[0]] || "#999", 0.22],
        [(tA + tB) / 2, "#e9e5de", 1],
        [tB, OCC_CLUSTER_COLOR[hub.classes[1]] || "#999", 0.22]
      ].forEach(function (s) {
        var stop = document.createElementNS(SVG_NS, "stop");
        stop.setAttribute("offset", s[0].toFixed(3));
        stop.setAttribute("stop-color", s[1]);
        stop.setAttribute("stop-opacity", String(s[2]));
        grad.appendChild(stop);
      });
      stemDefs.appendChild(grad);

      var stem = document.createElementNS(SVG_NS, "path");
      stem.setAttribute("d", "M" + left.join(" L") + " L" + right.join(" L") + " Z");
      stem.setAttribute("class", "occ-compound-wash is-band");
      stem.dataset.key = hub.key;
      stem.dataset.kind = "hub";
      stem.setAttribute("fill", "url(#" + gradId + ")");
      stem.setAttribute("stroke", "none");
      stemLayer.appendChild(stem);
    }

    // Count sits directly above its hub, like a caption.
    var topY = Infinity;
    pts.forEach(function (p) { topY = Math.min(topY, p.y); });
    seatLabel(c.x, c.y, c.y - topY + draw * 0.8, 0, -1, String(pts.length), hub.key, true);
  });

  // Wide: class names bend along an arc hugging the cloud. Narrow: same
  // above/below placement as straight wrapped lines (like Fig. 3 captions).
  var arcDefs = null;
  var arcId = 0;

  function arcLabel(info, text, key, top) {
    if (!arcDefs) {
      arcDefs = document.createElementNS(SVG_NS, "defs");
      svg.insertBefore(arcDefs, svg.firstChild);
    }
    var size = fs.label;
    var gap = size * 0.3;
    // Glyphs rise outward on the top arc and inward on the bottom one.
    var hug = info.reach + hullPad + gap + (top ? 0 : size * 0.72);
    // Long names on small clouds flatten the arc (bigger radius) instead of
    // wrapping down the sides; the arc still touches the cloud's top/bottom.
    var textLen = text.length * size * 0.55;
    var r = Math.max(hug, textLen / 2.2);
    var cx = info.x;
    var cy = top ? info.y - hug + r : info.y + hug - r;
    var start = top ? cy + r : cy - r;
    var end = top ? cy - r : cy + r;
    var sweep = top ? 1 : 0;
    var path = document.createElementNS(SVG_NS, "path");
    var id = "occ-arc-" + (arcId++);
    path.setAttribute("id", id);
    path.setAttribute("d",
      "M" + cx.toFixed(1) + " " + start.toFixed(1) +
      " A" + r.toFixed(1) + " " + r.toFixed(1) + " 0 1 " + sweep + " " + cx.toFixed(1) + " " + end.toFixed(1) +
      " A" + r.toFixed(1) + " " + r.toFixed(1) + " 0 1 " + sweep + " " + cx.toFixed(1) + " " + start.toFixed(1));
    arcDefs.appendChild(path);

    var label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("font-size", size.toFixed(2));
    label.setAttribute("class", "occ-compound-svg-label is-arc");
    label.dataset.key = key;
    label.dataset.kind = "class";
    var tp = document.createElementNS(SVG_NS, "textPath");
    tp.setAttribute("href", "#" + id);
    tp.setAttribute("startOffset", "50%");
    tp.setAttribute("text-anchor", "middle");
    tp.textContent = text;
    label.appendChild(tp);
    labelLayer.appendChild(label);

    // Bounds: the arc spans roughly the text length around the circle.
    var half = Math.min(Math.PI, textLen / (2 * r));
    var outer = r + (top ? size : 0);
    var spanX = half > Math.PI / 2 ? outer : outer * Math.sin(half);
    minX = Math.min(minX, cx - spanX);
    maxX = Math.max(maxX, cx + spanX);
    if (top) minY = Math.min(minY, cy - outer);
    else maxY = Math.max(maxY, cy + outer);
  }

  layout.clusters.forEach(function (cluster) {
    var info = cloudInfo[cluster.key];
    if (!info) return;
    var top = cluster.key === layout.centerKey || info.y < 0;
    var text = typeof occCountCaption === "function"
      ? occCountCaption(cluster.key, info.pts.length)
      : occLabel(cluster.key);
    if (narrow) {
      seatLabel(
        info.x,
        info.y,
        info.reach + hullPad,
        0,
        top ? -1 : 1,
        occWrapCaptionLines(text),
        cluster.key,
        false
      );
    } else {
      arcLabel(info, text, cluster.key, top);
    }
  });

  minX -= hexR * 0.6;
  minY -= hexR * 0.6;
  maxX += hexR * 0.6;
  maxY += hexR * 0.6;
  svg.setAttribute("viewBox", minX + " " + minY + " " + (maxX - minX) + " " + (maxY - minY));
  svg.dataset.w = String(maxX - minX);
  svg.dataset.h = String(maxY - minY);

  layout.placed.forEach(function (p) {
    var person = p.rec.person;
    var poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", hexPoints(p.x, p.y, draw));
    var fill = person.gender === "female" ? FEMALE : MALE;
    var hot = person.gender === "female" ? FEMALE_HOT : MALE_HOT;
    poly.setAttribute("fill", fill);
    poly.dataset.fill = fill;
    poly.dataset.hot = hot;
    poly.dataset.i = String(person.i);
    poly.dataset.mark = "1";
    poly.dataset.cluster = p.cluster;
    poly.dataset.compound = p.hub || "";
    poly.dataset.multi = p.hub ? "1" : "0";
    if (p.hub) poly.classList.add("is-multi");
    poly.dataset.stroke = "none";
    poly.setAttribute("tabindex", "0");
    poly.setAttribute("role", "img");
    poly.setAttribute("aria-label", markAria(person));
    if (!wikiFor(person)) poly.classList.add("no-link");
    hexLayer.appendChild(poly);
  });

  return svg;
}

// How tall Fig. 3a may grow inside the sticky pin. The old 0.58×vh cap left
// a crumpled flower on short laptop viewports (MacBook Air): spokes read short
// and the stage (sized to Fig. 3) showed empty cream around 3a.
function occChordMaxH() {
  if (typeof occUseSticky !== "function" || !occUseSticky()) return Infinity;
  var vh = window.innerHeight || 800;
  var pinTop = typeof occStickyTop === "function" ? occStickyTop() : 16;
  var reserved = pinTop + 20;
  ["occ-main-cap", "occ-legend"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) reserved += el.offsetHeight;
  });
  // Note sits under the stage; reserve a band even before final copy lands.
  var note = document.getElementById("occ-chord-note");
  reserved += note && note.offsetHeight > 8 ? note.offsetHeight + 12 : 72;
  reserved += 16;
  return Math.max(380, vh - reserved);
}

function renderOccChord() {
  var host = document.getElementById("occ-chord");
  var note = document.getElementById("occ-chord-note");
  if (!host) return;

  var records = occClusterRecords();
  var narrow = typeof occChartNarrow === "function" && occChartNarrow();
  // Same tile size as the Fig. 3 clouds.
  var hexR = typeof occHexSize === "function" ? occHexSize() : (narrow ? 9 : 12);
  var layout = occClusterLayout(records, hexR);
  // Narrow screens keep full-size hexes and labels and scroll sideways (like
  // the age chart) instead of shrinking the flower to fit.
  var maxW = narrow ? Infinity : Math.min(920, host.clientWidth || 920);
  // viewBox scaling shrinks SVG text, and label extents change the viewBox.
  // Probe once, then one corrective render (was up to 4 full rebuilds).
  var maxH = occChordMaxH();
  var scale = narrow ? 1 : 0.75;
  var svg = renderOccClusterCloud(layout, hexR, { label: 16 / scale, hub: 14 / scale }, narrow);
  if (!narrow) {
    var next = Math.min(1, maxW / Number(svg.dataset.w), maxH / Number(svg.dataset.h));
    if (Math.abs(next - scale) >= 0.005) {
      scale = next;
      svg = renderOccClusterCloud(layout, hexR, { label: 16 / scale, hub: 14 / scale }, narrow);
    }
  }
  svg.setAttribute("width", Number(svg.dataset.w) * scale);
  svg.setAttribute("height", Number(svg.dataset.h) * scale);

  var wrap = document.createElement("div");
  wrap.className = "occ-compound-union-wrap" + (narrow ? " is-scroll" : "");
  wrap.appendChild(svg);
  host.replaceChildren(wrap);
  if (narrow) {
    requestAnimationFrame(function () {
      var maxScroll = wrap.scrollWidth - wrap.clientWidth;
      wrap.scrollLeft = maxScroll > 0 ? maxScroll / 2 : 0;
    });
  }

  var hulls = Array.prototype.slice.call(svg.querySelectorAll(".occ-compound-hull"));
  var washes = Array.prototype.slice.call(svg.querySelectorAll(".occ-compound-wash"));
  var labels = Array.prototype.slice.call(svg.querySelectorAll(".occ-compound-svg-label"));
  var hexes = Array.prototype.slice.call(svg.querySelectorAll("polygon[data-cluster]"));

  function clearHot() {
    svg.classList.remove("is-filtering");
    hulls.forEach(function (h) { h.classList.remove("is-hot"); });
    washes.forEach(function (w) { w.classList.remove("is-hot"); });
    labels.forEach(function (l) { l.classList.remove("is-hot"); });
    hexes.forEach(function (poly) { poly.classList.remove("is-hot"); });
  }

  function hotClass(key) {
    if (!key) return;
    clearHot();
    svg.classList.add("is-filtering");
    hulls.forEach(function (h) {
      var on = h.dataset.kind === "class"
        ? h.dataset.key === key
        : h.dataset.key.split("|").indexOf(key) !== -1;
      if (on) h.classList.add("is-hot");
    });
    washes.forEach(function (w) {
      var on = w.dataset.kind === "class"
        ? w.dataset.key === key
        : w.dataset.key.split("|").indexOf(key) !== -1;
      if (on) w.classList.add("is-hot");
    });
    labels.forEach(function (l) {
      var on = l.dataset.kind === "class"
        ? l.dataset.key === key
        : l.dataset.key.split("|").indexOf(key) !== -1;
      if (on) l.classList.add("is-hot");
    });
    hexes.forEach(function (poly) {
      var parts = poly.dataset.compound ? poly.dataset.compound.split("|") : [];
      if (poly.dataset.cluster === key || parts.indexOf(key) !== -1) poly.classList.add("is-hot");
    });
  }

  function hotCompound(key) {
    if (!key) return;
    clearHot();
    svg.classList.add("is-filtering");
    var parts = key.split("|");
    hulls.forEach(function (h) {
      var on = h.dataset.key === key ||
        (h.dataset.kind === "class" && parts.indexOf(h.dataset.key) !== -1);
      if (on) h.classList.add("is-hot");
    });
    washes.forEach(function (w) {
      var on = w.dataset.key === key ||
        (w.dataset.kind === "class" && parts.indexOf(w.dataset.key) !== -1);
      if (on) w.classList.add("is-hot");
    });
    labels.forEach(function (l) {
      var on = l.dataset.key === key ||
        (l.dataset.kind === "class" && parts.indexOf(l.dataset.key) !== -1);
      if (on) l.classList.add("is-hot");
    });
    hexes.forEach(function (poly) {
      if (poly.dataset.compound === key) poly.classList.add("is-hot");
    });
  }

  hulls.forEach(function (hull) {
    hull.addEventListener("pointerenter", function () {
      if (hull.dataset.kind === "hub") hotCompound(hull.dataset.key);
      else hotClass(hull.dataset.key);
    });
    hull.addEventListener("pointerleave", clearHot);
  });
  svg.addEventListener("pointerover", function (event) {
    var poly = event.target.closest && event.target.closest("polygon[data-cluster]");
    if (!poly) return;
    if (poly.dataset.multi === "1" && poly.dataset.compound) hotCompound(poly.dataset.compound);
    else hotClass(poly.dataset.cluster);
  });
  svg.addEventListener("pointerout", function (event) {
    var next = event.relatedTarget && event.relatedTarget.closest
      ? event.relatedTarget.closest("polygon[data-cluster], .occ-compound-hull")
      : null;
    if (next) return;
    clearHot();
  });

  if (note) {
    note.textContent = t("occChordHint")
      .replace("{n}", String(records.length))
      .replace("{k}", String(layout.classOrder.length))
      .replace("{m}", String(layout.multiCount))
      .replace("{p}", String(layout.hubs.length))
      .replace("{c}", String(layout.centerTouch))
      .replace("{cls}", occLabel(layout.centerKey).toLowerCase());
  }
}
