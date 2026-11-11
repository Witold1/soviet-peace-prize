// Pack n points into filled silhouettes via a canvas mask + hex lattice.

function shapePackSelect(pts, n) {
  if (pts.length <= n) return pts.slice();
  var cx = 0;
  var cy = 0;
  for (var i = 0; i < pts.length; i++) {
    cx += pts[i].x;
    cy += pts[i].y;
  }
  cx /= pts.length;
  cy /= pts.length;

  var remaining = pts.slice();
  var selected = [];
  var best = 0;
  var bestD = Infinity;
  for (var i = 0; i < remaining.length; i++) {
    var dx = remaining[i].x - cx;
    var dy = remaining[i].y - cy;
    var d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  selected.push(remaining.splice(best, 1)[0]);

  while (selected.length < n && remaining.length) {
    var pick = 0;
    var pickD = -1;
    for (var i = 0; i < remaining.length; i++) {
      var minD = Infinity;
      for (var j = 0; j < selected.length; j++) {
        var ddx = remaining[i].x - selected[j].x;
        var ddy = remaining[i].y - selected[j].y;
        var dd = ddx * ddx + ddy * ddy;
        if (dd < minD) minD = dd;
      }
      if (minD > pickD) {
        pickD = minD;
        pick = i;
      }
    }
    selected.push(remaining.splice(pick, 1)[0]);
  }
  return selected;
}

function shapePackLattice(isInside, minX, minY, maxX, maxY, step) {
  var pts = [];
  var row = 0;
  for (var y = minY; y <= maxY; y += step * Math.sqrt(3) / 2, row++) {
    var x0 = minX + (row % 2 ? step * 0.5 : 0);
    for (var x = x0; x <= maxX; x += step) {
      if (isInside(x, y)) pts.push({ x: x, y: y });
    }
  }
  return pts;
}

function shapePackFromDraw(n, draw, width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  draw(ctx, width, height);
  var data = ctx.getImageData(0, 0, width, height).data;

  function isInside(x, y) {
    var ix = Math.round(x);
    var iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= width || iy >= height) return false;
    return data[(iy * width + ix) * 4 + 3] > 120;
  }

  var minX = width;
  var minY = height;
  var maxX = 0;
  var maxY = 0;
  var area = 0;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 120) {
        area++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return [];

  var guess = Math.sqrt(area / n) * 1.05;
  var lo = guess * 0.45;
  var hi = guess * 2.4;
  var best = [];
  for (var iter = 0; iter < 22; iter++) {
    var step = (lo + hi) / 2;
    var pts = shapePackLattice(isInside, minX, minY, maxX, maxY, step);
    if (pts.length >= n) {
      best = pts;
      lo = step;
    } else {
      hi = step;
    }
  }
  if (!best.length) {
    best = shapePackLattice(isInside, minX, minY, maxX, maxY, Math.max(2, guess * 0.5));
  }
  return shapePackSelect(best, n);
}

// Emojione dove-with-olive-branch (viewBox 0 0 64 64).
var PEACE_DOVE_SHAPES = [
  { d: "M10 17.1s-2.1 1.9-.9 4.4c1.2 2.5.6 4 .6 4s2.4-3.2 1.5-5.2c-.8-1.9-.9-2.1-1.2-3.2", fill: "#699635" },
  { d: "M4.5 29.8S7 31 8.1 28.4c1.1-2.5 2.5-2.8 2.5-2.8s-3.5-.6-4.4 1.3c-1 1.9-1.1 2.1-1.7 2.9", fill: "#699635" },
  { d: "M14.2 20s-2.5 1-2 3.9c.5 2.8-.4 4.1-.4 4.1s3.1-2.2 2.7-4.4c-.3-2.2-.3-2.5-.3-3.6", fill: "#699635" },
  { d: "M7.5 34s2.6.2 3.1-2.7c.4-2.9 1.6-3.6 1.6-3.6s-3.5.6-3.9 2.8c-.3 2.2-.4 2.4-.8 3.5", fill: "#699635" },
  { d: "M5.6 21.2c2.8 2 5.3 5 7.2 8.2c2 3.3 3.3 7.2 3.1 11.4h-.1c-.7-3.9-1.7-7.7-3.5-11c-.8-1.5-1.7-2.9-2.7-4.2c-.7-.9-1.4-1.8-2.2-2.6c-.3-.4-1.8-1.5-1.8-1.8", fill: "#83bf4f" },
  { d: "M2 19.3s.4 3.2 2.8 3.1c2.4-.1 3.2 1.2 3.2 1.2s-1.2-4-3.1-4c-1.8-.1-2 0-2.9-.3", fill: "#699635" },
  { d: "M16.2 30.5L11.6 34l5.8-.7z", fill: "#ffce31" },
  { d: "M27.8 32.1c.3-8 11.6-14.5 17.6-24.8c2.6-4.4 4.8-2.1 3.2 5.9c10.3 1.9-8 24.5-11.7 26.1l-9.1-7.2", fill: "#8d9ba3" },
  { d: "M27.1 32.8c.3-8 15.1-12 21.6-20.6c13.6-18 16.9-8 9.2-2.1c10.3 1.9-2.4 8.6-2.4 8.6c11.4.6-.9 6.7-.9 6.7c9.5 1.8-3 5.2-3 5.2c6.3 2.3-2.6 4.8-2.6 4.8c4.5 3.5-4.4 3.9-8.1 5.5l-13.8-8.1", fill: "#d0d0d0" },
  { d: "M15.5 32.1c0-1.9 2.3-4.4 5.7-4.4c9.1 0 18.2 9.7 24.8 18.4c3.9 5.1 10.4 2.8 12.4 5.6c1.4 2-1.6 2.9-1.6 2.9s2.5 4.3-2.3 2.7c0 0 1.6 5.1-4.2 2.9c0 0-1.3 3.3-4.1 1.2c-3.7-2.8-.7-11.2-11.5-13.7c-18.2-4.4-14.7-11-15.9-12.6c-.6-.9-3.3-2-3.3-3", fill: "#d0d0d0" },
];

var PEACE_DOVE_PATHS = PEACE_DOVE_SHAPES.map(function (shape) { return shape.d; });

function buildPeaceDoveSvg() {
  var svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "1.5 2.5 58 56");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (var i = 0; i < PEACE_DOVE_SHAPES.length; i++) {
    var shape = PEACE_DOVE_SHAPES[i];
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", shape.d);
    path.setAttribute("fill", shape.fill);
    svg.appendChild(path);
  }
  var eye = document.createElementNS(SVG_NS, "circle");
  eye.setAttribute("cx", "20");
  eye.setAttribute("cy", "30.8");
  eye.setAttribute("r", "1.1");
  eye.setAttribute("fill", "#464d51");
  svg.appendChild(eye);
  return svg;
}

function drawPeaceDove(ctx, width, height) {
  // Trim empty margins in the 64×64 emoji art so the packed shape fills the stage.
  var pad = 1.5;
  var vbX = 1.5 - pad;
  var vbY = 2.5 - pad;
  var vbW = 58 + pad * 2;
  var vbH = 56 + pad * 2;
  var scale = Math.min(width / vbW, height / vbH);
  ctx.save();
  ctx.translate((width - vbW * scale) / 2, (height - vbH * scale) / 2);
  ctx.scale(scale, scale);
  ctx.translate(-vbX, -vbY);
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // Light stroke thickens thin olive leaves so more marks can land there.
  ctx.lineWidth = 1.35;
  for (var i = 0; i < PEACE_DOVE_PATHS.length; i++) {
    var path = new Path2D(PEACE_DOVE_PATHS[i]);
    ctx.fill(path);
    ctx.stroke(path);
  }
  // Eye as solid fill so packing does not leave a hole.
  ctx.beginPath();
  ctx.arc(20, 30.8, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

var peaceDoveCache = null;

function packPeaceDove(n) {
  if (peaceDoveCache && peaceDoveCache.n === n) return peaceDoveCache.pts;
  var width = 560;
  var height = 560;
  var raw = shapePackFromDraw(n, drawPeaceDove, width, height);
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  for (var i = 0; i < raw.length; i++) {
    minX = Math.min(minX, raw[i].x);
    minY = Math.min(minY, raw[i].y);
    maxX = Math.max(maxX, raw[i].x);
    maxY = Math.max(maxY, raw[i].y);
  }
  var pts = raw.map(function (p) {
    return {
      x: (p.x - minX) / Math.max(1, maxX - minX),
      y: (p.y - minY) / Math.max(1, maxY - minY),
    };
  });
  peaceDoveCache = {
    n: n,
    pts: pts,
    aspect: (maxX - minX) / Math.max(1, maxY - minY),
  };
  return pts;
}

function peaceDoveAspect() {
  return peaceDoveCache && peaceDoveCache.aspect ? peaceDoveCache.aspect : 1;
}
