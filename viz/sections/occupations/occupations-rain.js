// Fig. 3 Pravda-line rain: blurred atmosphere + mono foreground.
// Perf: cached text wrap; soft fg separation only on spawn/resize;
// atm blur via CSS on a second canvas (never ctx.filter).

var OCC_RAIN_HOST = "occ-rain";
var OCC_RAIN_ATM_GHOSTS = 1;
var OCC_RAIN_ATM = {
  blur: 0.65,
  sizeMul: [0.84, 0.96],
  speed: [0.26, 0.36],
  drift: 0.07,
  alpha: [0.26, 0.4],
  count: function (w, h) {
    var n = Math.round((w * h) / 5200);
    return Math.max(8, Math.min(w < 640 ? 12 : 14, n));
  }
};
var OCC_RAIN_FG = {
  sizeMul: 0.9,
  speed: 0.34,
  colFrac: 0.52,
  count: function (w, h) {
    if (w < 640) return Math.max(6, Math.min(9, Math.round(h / 30)));
    return Math.max(9, Math.min(12, Math.round(h / 34)));
  }
};

var occRainState = null;
var occRainRaf = 0;
var occRainPaused = true;
var occRainInView = true;
var occRainBuilt = false;
var occRainResizeObs = null;
var occRainViewObs = null;
var occRainBodySizeCache = { px: 16, at: 0 };

function occRainLines() {
  var rows = [];
  if (typeof PRAVDA_OCC !== "object" || !PRAVDA_OCC) return rows;
  Object.keys(PRAVDA_OCC).forEach(function (key) {
    var row = PRAVDA_OCC[key];
    var text = typeof pravdaOccText === "function"
      ? pravdaOccText(row)
      : (row && (row.text_standardized || row.text));
    if (!text) return;
    rows.push({
      text: String(text).replace(/\s+/g, " ").trim(),
      source: row.source || "caption"
    });
  });
  return rows;
}

function occRainShuffle(list) {
  var out = list.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function occRainDeal(avoidTexts) {
  var state = occRainState;
  if (!state.deck || !state.deck.length) state.deck = occRainShuffle(state.phrases);
  var avoid = avoidTexts || null;
  if (!avoid || !avoid.length) {
    return state.deck.pop() || state.phrases[0];
  }
  var held = [];
  var pick = null;
  while (state.deck.length) {
    var cand = state.deck.pop();
    if (cand && avoid.indexOf(cand.text) === -1) {
      pick = cand;
      break;
    }
    if (cand) held.push(cand);
  }
  while (held.length) state.deck.push(held.pop());
  if (!pick) {
    if (!state.deck.length) state.deck = occRainShuffle(state.phrases);
    pick = state.deck.pop() || state.phrases[0];
  }
  return pick;
}

function occRainBodySize() {
  var now = Date.now();
  if (now - occRainBodySizeCache.at < 800) return occRainBodySizeCache.px;
  var px = parseFloat(window.getComputedStyle(document.body).fontSize);
  occRainBodySizeCache.px = px > 0 ? px : 16;
  occRainBodySizeCache.at = now;
  return occRainBodySizeCache.px;
}

function occRainReduced() {
  return typeof occCloudReduced === "function"
    ? occCloudReduced()
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function occRainIsOrphan(line) {
  var t = String(line || "").trim();
  if (!t || /^\([^)]+\)$/.test(t)) return true;
  return t.split(/\s+/).filter(Boolean).length <= 1;
}

function occRainWrap(ctx, text, maxWidth) {
  var raw = String(text || "").trim();
  if (!raw) return [""];
  if (ctx.measureText(raw).width <= maxWidth) return [raw];
  var tokens = raw.replace(/,\s+/g, ",\u0001").split("\u0001").map(function (t) {
    return t.trim();
  }).filter(Boolean);

  function appendWord(lines, cur, word) {
    var trial = cur ? cur + " " + word : word;
    if (cur && ctx.measureText(trial).width > maxWidth) {
      lines.push(cur);
      return word;
    }
    return trial;
  }

  var lines = [];
  var cur = "";
  tokens.forEach(function (part) {
    if (ctx.measureText(part).width > maxWidth && part.indexOf(" ") !== -1) {
      part.split(/\s+/).forEach(function (word) {
        cur = appendWord(lines, cur, word);
      });
      return;
    }
    cur = appendWord(lines, cur, part);
  });
  if (cur) lines.push(cur);

  var guard = 0;
  while (lines.length > 1 && occRainIsOrphan(lines[lines.length - 1]) && guard++ < 6) {
    var last = lines.pop();
    var prev = lines.pop();
    var merged = prev + " " + last;
    if (ctx.measureText(merged).width <= maxWidth) {
      lines.push(merged);
      break;
    }
    var prevWords = prev.split(/\s+/).filter(Boolean);
    if (prevWords.length >= 2) {
      var moved = prevWords.pop();
      var newPrev = prevWords.join(" ");
      var newLast = moved + " " + last;
      if (!occRainIsOrphan(newPrev) && ctx.measureText(newLast).width <= maxWidth) {
        lines.push(newPrev);
        lines.push(newLast);
        break;
      }
    }
    lines.push(prev);
    lines.push(last);
    break;
  }

  if (lines.length <= 3) return lines;
  var head = lines.slice(0, 2);
  var tail = lines.slice(2).join(" ");
  while (tail.length > 4 && ctx.measureText(tail + "…").width > maxWidth) tail = tail.slice(0, -1);
  head.push(tail + "…");
  return head;
}

function occRainCacheKey(drop) {
  var phrase = drop && drop.phrase;
  return [
    drop.kind || "",
    drop.size || 0,
    drop.colW || 0,
    drop.lineGap || 0,
    phrase && phrase.source || "",
    phrase && phrase.text || ""
  ].join("\u0001");
}

function occRainInvalidate(drop) {
  if (!drop) return;
  drop._cacheKey = null;
  drop._lines = null;
}

function occRainFont(drop) {
  if (drop.kind === "fg") {
    return "600 " + drop.size + "px ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
  }
  var italic = drop.phrase && drop.phrase.source === "decree" ? "italic " : "";
  return italic + drop.size + "px Georgia, 'Palatino Linotype', Palatino, 'Times New Roman', serif";
}

function occRainMeasure(ctx, drop) {
  if (!drop || !drop.phrase) return { lines: [""], height: drop ? drop.size : 14 };
  var key = occRainCacheKey(drop);
  if (drop._cacheKey === key && drop._lines) {
    return { lines: drop._lines, height: drop._h };
  }
  ctx.font = occRainFont(drop);
  var lines = occRainWrap(ctx, drop.phrase.text, drop.colW);
  var height = lines.length * drop.size + Math.max(0, lines.length - 1) * drop.lineGap;
  drop._cacheKey = key;
  drop._lines = lines;
  drop._h = height;
  return { lines: lines, height: height };
}

function occRainDrawDrop(ctx, drop, measured) {
  var y = drop.y;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  if (drop.kind === "atm") {
    ctx.fillStyle = "rgba(90, 82, 72, " + drop.alpha.toFixed(3) + ")";
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, " + drop.alpha.toFixed(3) + ")";
  }
  ctx.font = occRainFont(drop);
  measured.lines.forEach(function (line) {
    ctx.fillText(line, drop.x, y);
    y += drop.size + drop.lineGap;
  });
}

function occRainAtmPlan() {
  var state = occRainState;
  return {
    n: OCC_RAIN_ATM.count(state.cssW, state.cssH),
    blur: OCC_RAIN_ATM.blur,
    sizeMul: OCC_RAIN_ATM.sizeMul,
    speed: OCC_RAIN_ATM.speed,
    drift: OCC_RAIN_ATM.drift,
    alpha: OCC_RAIN_ATM.alpha
  };
}

function occRainFgCount() {
  return OCC_RAIN_FG.count(occRainState.cssW, occRainState.cssH);
}

function occRainFgBox(drop, height) {
  return {
    x: drop.x,
    y: drop.y,
    w: drop.colW,
    h: height != null ? height : (drop._h || drop.size * 2.2)
  };
}

function occRainOverlapArea(a, b, pad) {
  var p = pad || 6;
  var ax2 = a.x + a.w + p;
  var ay2 = a.y + a.h + p;
  var bx2 = b.x + b.w + p;
  var by2 = b.y + b.h + p;
  var ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x - p, b.x - p));
  var iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y - p, b.y - p));
  return ix * iy;
}

function occRainMakeAtm(slotY) {
  var state = occRainState;
  var layer = occRainAtmPlan();
  var base = occRainBodySize();
  var r = Math.random();
  var size = Math.max(12, Math.round(base * (layer.sizeMul[0] + r * (layer.sizeMul[1] - layer.sizeMul[0]))));
  var colW = Math.min(Math.max(72, state.cssW - 24), size * 14);
  var margin = 6;
  var maxX = Math.max(margin, state.cssW - colW - margin);
  var phrase = occRainDeal();
  if (phrase && phrase.text && phrase.text.length > 64) {
    var cut = phrase.text.split(",")[0].trim();
    if (cut.length >= 12) phrase = { text: cut, source: phrase.source };
  }
  var y = typeof slotY === "number"
    ? slotY
    : Math.random() * state.cssH * 1.05 - 16;
  return {
    kind: "atm",
    phrase: phrase,
    x: margin + Math.random() * Math.max(0, maxX - margin),
    y: y,
    speed: layer.speed[0] + Math.random() * (layer.speed[1] - layer.speed[0]),
    drift: (Math.random() - 0.5) * layer.drift,
    size: size,
    colW: colW,
    alpha: layer.alpha[0] + Math.random() * (layer.alpha[1] - layer.alpha[0]),
    lineGap: Math.round(size * 0.26),
    blur: layer.blur,
    _cacheKey: null,
    _lines: null,
    _h: null
  };
}

function occRainPlaceAtm(ghost, avoidDrops, preferY) {
  var state = occRainState;
  var height = ghost.size * 1.8;
  var margin = 6;
  var maxX = Math.max(margin, state.cssW - ghost.colW - margin);
  var span = Math.max(0, maxX - margin);
  var boxes = (avoidDrops || []).map(function (d) {
    return occRainFgBox(d, d._h || d.size * (d.kind === "fg" ? 2.4 : 1.8));
  });
  var y0 = typeof preferY === "number" ? preferY : Math.random() * state.cssH;
  var best = { x: ghost.x, y: y0, score: -Infinity };
  for (var t = 0; t < 18; t++) {
    var x = margin + Math.random() * span;
    var y = y0 + (Math.random() - 0.5) * state.cssH * 0.45;
    var box = { x: x, y: y, w: ghost.colW, h: height };
    var overlap = 0;
    var nearest = Infinity;
    for (var i = 0; i < boxes.length; i++) {
      overlap += occRainOverlapArea(box, boxes[i], 10);
      var d = Math.hypot(
        x + ghost.colW / 2 - (boxes[i].x + boxes[i].w / 2),
        y + height / 2 - (boxes[i].y + boxes[i].h / 2)
      );
      if (d < nearest) nearest = d;
    }
    var score = nearest - overlap * 0.08;
    if (score > best.score) best = { x: x, y: y, score: score };
  }
  ghost.x = best.x;
  ghost.y = best.y;
  return ghost;
}

function occRainTrimAtm(maxN) {
  var state = occRainState;
  var atm = state.drops.filter(function (d) { return d.kind === "atm"; });
  if (atm.length <= maxN) return;
  atm.sort(function (a, b) {
    return (b.y - state.cssH) - (a.y - state.cssH);
  });
  var victims = atm.slice(0, atm.length - maxN);
  state.drops = state.drops.filter(function (d) {
    return victims.indexOf(d) === -1;
  });
}

function occRainSpawnGhosts(fgDrop) {
  if (!OCC_RAIN_ATM_GHOSTS || !fgDrop) return;
  var state = occRainState;
  var layer = occRainAtmPlan();
  var avoid = state.drops.slice();
  if (avoid.indexOf(fgDrop) === -1) avoid.push(fgDrop);
  for (var g = 0; g < OCC_RAIN_ATM_GHOSTS; g++) {
    var ghost = occRainMakeAtm();
    var preferY = fgDrop.y + (Math.random() - 0.35) * (state.cssH * 0.35);
    occRainPlaceAtm(ghost, avoid, preferY);
    ghost.speed = OCC_RAIN_FG.speed * (0.88 + Math.random() * 0.14);
    state.drops.push(ghost);
    avoid.push(ghost);
  }
  var cap = layer.n + Math.ceil((occRainFgCount() * OCC_RAIN_ATM_GHOSTS) * 0.85);
  occRainTrimAtm(cap);
}

function occRainFgMetrics() {
  var state = occRainState;
  var base = occRainBodySize();
  var size = Math.max(13, Math.round(base * OCC_RAIN_FG.sizeMul));
  var colW = Math.min(
    Math.max(120, state.cssW - 20),
    Math.max(size * 12, state.cssW * OCC_RAIN_FG.colFrac)
  );
  return { size: size, colW: colW, lineGap: Math.round(size * 0.26) };
}

function occRainFgEstimateHeight(phrase, size, colW, lineGap) {
  var state = occRainState;
  if (!state.ctx) {
    var chars = Math.max(8, Math.floor(colW / (size * 0.55)));
    var lines = Math.ceil(String(phrase && phrase.text || "").length / chars) || 1;
    return Math.min(3, lines) * size + Math.max(0, Math.min(2, lines - 1)) * lineGap;
  }
  return occRainMeasure(state.ctx, {
    kind: "fg",
    phrase: phrase,
    size: size,
    colW: colW,
    lineGap: lineGap
  }).height;
}

function occRainPeerBoxes(peers) {
  var state = occRainState;
  return peers.map(function (p) {
    var h = p._h;
    if (h == null && state.ctx) h = occRainMeasure(state.ctx, p).height;
    if (h == null) h = p.size * 2.2;
    p._h = h;
    return occRainFgBox(p, h);
  });
}

function occRainPlaceFg(phrase, size, colW, lineGap, peers, preferY) {
  var state = occRainState;
  var height = occRainFgEstimateHeight(phrase, size, colW, lineGap);
  var margin = 10;
  var maxX = Math.max(margin, state.cssW - colW - margin);
  var span = Math.max(0, maxX - margin);
  var boxes = occRainPeerBoxes(peers);
  var y0 = typeof preferY === "number" ? preferY : -16;
  var tries = height > size * 2.2 ? 28 : 16;
  var best = { x: margin + Math.random() * span, y: y0, score: Infinity };

  function scoreAt(x, y) {
    var box = { x: x, y: y, w: colW, h: height };
    var overlap = 0;
    var nearest = Infinity;
    for (var i = 0; i < boxes.length; i++) {
      overlap += occRainOverlapArea(box, boxes[i], 8);
      var cx = x + colW / 2;
      var cy = y + height / 2;
      var px = boxes[i].x + boxes[i].w / 2;
      var py = boxes[i].y + boxes[i].h / 2;
      var d = Math.hypot(cx - px, cy - py);
      if (d < nearest) nearest = d;
    }
    var score = overlap * 40 - Math.min(nearest, 220) * 0.15;
    score += Math.abs(y - y0) * 0.35;
    return score;
  }

  for (var t = 0; t < tries; t++) {
    var x = margin + Math.random() * span;
    var y = y0 - (t % 5) * Math.max(10, height * 0.15);
    var s = scoreAt(x, y);
    if (s < best.score) best = { x: x, y: y, score: s };
    if (s < 0.5) break;
  }

  if (best.score > 1) {
    for (var up = 1; up <= 8; up++) {
      var yUp = y0 - up * (height * 0.55 + 8);
      for (var u = 0; u < 6; u++) {
        var x2 = margin + Math.random() * span;
        var s2 = scoreAt(x2, yUp);
        if (s2 < best.score) best = { x: x2, y: yUp, score: s2 };
        if (s2 < 0.5) break;
      }
      if (best.score < 0.5) break;
    }
  }

  return { x: best.x, y: best.y, height: height };
}

function occRainMakeFg(slotY, peers, fromTop, phrase) {
  var state = occRainState;
  var m = occRainFgMetrics();
  var avoid = (peers || []).map(function (p) {
    return p.phrase && p.phrase.text;
  }).filter(Boolean);
  var text = phrase || occRainDeal(avoid);
  var yHint;
  if (typeof slotY === "number") yHint = slotY;
  else if (fromTop) yHint = -16 - Math.random() * 8;
  else yHint = Math.random() * state.cssH * 0.9;
  var placed = occRainPlaceFg(text, m.size, m.colW, m.lineGap, peers || [], yHint);
  return {
    kind: "fg",
    phrase: text,
    x: placed.x,
    y: placed.y,
    _h: placed.height,
    _cacheKey: null,
    _lines: null,
    speed: OCC_RAIN_FG.speed,
    drift: 0,
    size: m.size,
    colW: m.colW,
    alpha: 0.92,
    lineGap: m.lineGap,
    blur: 0
  };
}

function occRainBuildDrops() {
  var state = occRainState;
  state.deck = occRainShuffle(state.phrases);
  var drops = [];
  var layer = occRainAtmPlan();
  var baseN = Math.max(4, Math.round(layer.n * 0.35));
  for (var i = 0; i < baseN; i++) drops.push(occRainMakeAtm());
  state.drops = drops;
  var nFg = occRainFgCount();
  var fgBuilt = [];
  for (var f = 0; f < nFg; f++) {
    var band = (f + 0.35 + Math.random() * 0.3) / nFg;
    var slotY = band * state.cssH * 0.95 - 10;
    var drop = occRainMakeFg(slotY, fgBuilt, false);
    fgBuilt.push(drop);
    state.drops.push(drop);
    occRainSpawnGhosts(drop);
  }
  state.needSeparate = true;
  return state.drops;
}

function occRainSeparateFg() {
  var state = occRainState;
  var fg = state.drops.filter(function (d) { return d.kind === "fg"; });
  if (fg.length < 2 || !state.ctx) return;
  fg.forEach(function (d) {
    d._h = occRainMeasure(state.ctx, d).height;
  });
  fg.sort(function (a, b) { return a.y - b.y; });
  for (var i = 0; i < fg.length; i++) {
    for (var j = i + 1; j < fg.length; j++) {
      var a = occRainFgBox(fg[i], fg[i]._h);
      var b = occRainFgBox(fg[j], fg[j]._h);
      if (occRainOverlapArea(a, b, 4) <= 0) continue;
      var need = a.y + a.h + 10 - b.y;
      if (need > 0) fg[j].y += need;
    }
  }
  fg.forEach(function (d) {
    d.speed = OCC_RAIN_FG.speed;
    d.drift = 0;
  });
}

function occRainAdvance(drop, measured) {
  var state = occRainState;
  drop.y += drop.speed;
  drop.x += drop.drift;
  drop._h = measured.height;
  var pad = drop.kind === "fg" ? 10 : 2;
  var minX = pad;
  var maxX = Math.max(minX, state.cssW - drop.colW - pad);
  if (drop.x < minX) {
    drop.x = minX;
    drop.drift = Math.abs(drop.drift);
  } else if (drop.x > maxX) {
    drop.x = maxX;
    drop.drift = -Math.abs(drop.drift);
  }
  if (drop.y - measured.height <= state.cssH + 40) return;

  if (drop.kind === "fg") {
    var peers = state.drops.filter(function (d) { return d !== drop && d.kind === "fg"; });
    var onScreen = peers.map(function (p) {
      return p.phrase && p.phrase.text;
    }).filter(Boolean);
    var phrase = occRainDeal(onScreen);
    var next = occRainMakeFg(-16 - Math.random() * 8, peers, true, phrase);
    drop.phrase = next.phrase;
    drop.x = next.x;
    drop.y = next.y;
    drop._h = next._h;
    drop.speed = next.speed;
    drop.drift = next.drift;
    drop.size = next.size;
    drop.colW = next.colW;
    drop.alpha = next.alpha;
    drop.lineGap = next.lineGap;
    occRainInvalidate(drop);
    occRainSpawnGhosts(drop);
    state.needSeparate = true;
    return;
  }

  var fresh = occRainMakeAtm();
  fresh.y = -40 - Math.random() * 120;
  drop.phrase = fresh.phrase;
  drop.x = fresh.x;
  drop.y = fresh.y;
  drop.speed = fresh.speed;
  drop.drift = fresh.drift;
  drop.size = fresh.size;
  drop.colW = fresh.colW;
  drop.alpha = fresh.alpha;
  drop.lineGap = fresh.lineGap;
  drop.blur = fresh.blur;
  occRainInvalidate(drop);
}

function occRainSizeCanvas(canvas, ctx, w, h, dpr) {
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function occRainDrawFrame() {
  var state = occRainState;
  if (!state || !state.ctx || !state.ctxAtm) return;
  var ctxFg = state.ctx;
  var ctxAtm = state.ctxAtm;
  var w = state.cssW;
  var h = state.cssH;

  ctxAtm.clearRect(0, 0, w, h);
  ctxFg.clearRect(0, 0, w, h);

  if (!occRainPaused && !state.static && state.needSeparate) {
    occRainSeparateFg();
    state.needSeparate = false;
  }

  var atmItems = [];
  var fgItems = [];
  for (var i = 0; i < state.drops.length; i++) {
    var drop = state.drops[i];
    var measured = occRainMeasure(ctxFg, drop);
    if (!occRainPaused && !state.static) {
      occRainAdvance(drop, measured);
      measured = occRainMeasure(ctxFg, drop);
    }
    if (drop.y >= h + 40 || drop.y + measured.height <= -60) continue;
    if (drop.kind === "atm" || (drop.blur && drop.blur > 0)) {
      atmItems.push({ drop: drop, measured: measured });
    } else {
      fgItems.push({ drop: drop, measured: measured });
    }
  }

  atmItems.sort(function (a, b) { return a.drop.y - b.drop.y; });
  fgItems.sort(function (a, b) { return a.drop.y - b.drop.y; });
  for (var a = 0; a < atmItems.length; a++) {
    occRainDrawDrop(ctxAtm, atmItems[a].drop, atmItems[a].measured);
  }
  for (var f = 0; f < fgItems.length; f++) {
    occRainDrawDrop(ctxFg, fgItems[f].drop, fgItems[f].measured);
  }
}

function occRainLoop() {
  occRainRaf = 0;
  if (!occRainState || !occRainInView) return;
  occRainDrawFrame();
  if (!occRainPaused && !occRainState.static) {
    occRainRaf = requestAnimationFrame(occRainLoop);
  }
}

function occRainKick() {
  if (occRainRaf || !occRainInView) return;
  occRainRaf = requestAnimationFrame(occRainLoop);
}

function occRainResize(force) {
  var state = occRainState;
  if (!state || !state.host) return false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var rect = state.host.getBoundingClientRect();
  var w = Math.max(0, Math.floor(rect.width));
  var h = Math.max(0, Math.floor(rect.height));
  if (w < 2 || h < 2) return false;
  if (!force && w === state.cssW && h === state.cssH && dpr === state.dpr) return true;
  state.cssW = w;
  state.cssH = h;
  state.dpr = dpr;
  occRainSizeCanvas(state.canvasAtm, state.ctxAtm, w, h, dpr);
  occRainSizeCanvas(state.canvas, state.ctx, w, h, dpr);
  state.canvasAtm.style.filter = OCC_RAIN_ATM.blur > 0
    ? "blur(" + OCC_RAIN_ATM.blur + "px)"
    : "none";
  state.drops = occRainBuildDrops();
  return true;
}

function occRainBind(host) {
  if (typeof ResizeObserver === "function") {
    if (occRainResizeObs) occRainResizeObs.disconnect();
    occRainResizeObs = new ResizeObserver(function () {
      if (!occRainState) return;
      if (occRainResize()) {
        occRainDrawFrame();
        if (!occRainPaused && occRainInView) occRainKick();
      }
    });
    occRainResizeObs.observe(host);
  }
  if (typeof IntersectionObserver === "function") {
    if (occRainViewObs) occRainViewObs.disconnect();
    occRainViewObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        occRainInView = !!entry.isIntersecting;
        if (occRainInView && !occRainPaused) {
          if (occRainResize()) occRainKick();
        }
      });
    }, { threshold: 0.05 });
    occRainViewObs.observe(host);
  }
}

function occRainMakeCanvas(kind) {
  var canvas = document.createElement("canvas");
  canvas.className = "occ-rain-canvas occ-rain-canvas--" + kind;
  canvas.setAttribute("aria-hidden", "true");
  return canvas;
}

function renderOccRain() {
  var host = document.getElementById(OCC_RAIN_HOST);
  if (!host) return;
  var rows = occRainLines();
  host.replaceChildren();
  if (!rows.length) {
    occRainBuilt = false;
    occRainState = null;
    return;
  }
  var want = !occRainReduced();
  host.classList.toggle("is-static", !want);
  var canvasAtm = occRainMakeCanvas("atm");
  var canvasFg = occRainMakeCanvas("fg");
  host.appendChild(canvasAtm);
  host.appendChild(canvasFg);
  occRainState = {
    host: host,
    canvasAtm: canvasAtm,
    canvas: canvasFg,
    ctxAtm: canvasAtm.getContext("2d", { alpha: true }),
    ctx: canvasFg.getContext("2d", { alpha: true }),
    phrases: rows.slice(),
    deck: [],
    drops: [],
    cssW: 0,
    cssH: 0,
    dpr: 1,
    static: !want,
    needSeparate: false
  };
  occRainBind(host);
  occRainResize(true);
  occRainPaused = !want;
  occRainDrawFrame();
  if (want) occRainKick();
  requestAnimationFrame(function () {
    if (!occRainState || occRainState.host !== host) return;
    if (occRainResize()) {
      occRainDrawFrame();
      if (!occRainPaused) occRainKick();
    }
  });
  occRainBuilt = true;
}

function ensureOccRain() {
  if (!occRainBuilt || !document.getElementById(OCC_RAIN_HOST)) {
    renderOccRain();
    return;
  }
  if (!occRainState) return;
  var want = !occRainReduced();
  occRainState.static = !want;
  occRainPaused = !want;
  occRainResize();
  occRainDrawFrame();
  if (want && occRainInView) occRainKick();
}

function syncOccRainMotion(active) {
  var host = document.getElementById(OCC_RAIN_HOST);
  if (!host || !occRainState) return;
  // Sticky: only animate during the rain step. Narrow: always on.
  var want = occRainReduced()
    ? false
    : (typeof occUseSticky === "function" && occUseSticky() ? !!active : true);
  occRainState.static = !want;
  host.classList.toggle("is-static", !want);
  occRainPaused = !want;
  occRainResize();
  if (want) occRainKick();
  else occRainDrawFrame();
}
