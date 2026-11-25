var heroMarks = [];
var heroLayout = null;
var heroScrubKey = "";
var heroWidthCached = 0;
var heroVisualT = 0;
var heroTargetT = 0;
var heroAnimRaf = 0;
var heroAnimTs = 0;
var heroAnimFrom = 0;
var heroAnimTo = 0;
var heroAnimDur = 0;
var heroAnimTimer = 0;
var heroFaceTimer = 0;
var heroMorphing = false;
var heroCountReveal = 0;
var heroCountRaf = 0;
var heroCountTs = 0;
var heroChartH0 = 0;
var heroChartH1 = 0;
// Canvas flight duration — feel, not a per-frame DOM cost.
var HERO_MORPH_MS = 1350;
// Morph ~halfway; the second half is mostly for the caption ride.
var HERO_MORPH_PROGRESS = 0.4;
var HERO_TRACK_VH = 420;
// Flat-top regular hex bbox: width:height = 2:√3 (same as Fig. 3 / hex.js).
var HERO_HEX_ASPECT = Math.sqrt(3) / 2;
var HERO_MODE_KEY = "laureates-hero-mode";

function heroReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function heroViewportH() {
  return window.innerHeight || 800;
}

function heroClamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function heroLerp(a, b, t) {
  return a + (b - a) * t;
}

function heroSmooth(t) {
  t = heroClamp01(t);
  return t * t * (3 - 2 * t);
}

function heroClearRunway(section) {
  var track = document.getElementById("hero-track");
  var chart = document.getElementById("hero-chart");
  if (track) track.style.height = "";
  if (chart) chart.style.height = "";
  if (section) section.style.height = "";
  heroChartH0 = 0;
  heroChartH1 = 0;
}

function heroCloseTip() {
  if (typeof deactivate === "function") deactivate(null);
  else {
    var tipEl = document.getElementById("tip");
    if (tipEl) tipEl.hidden = true;
  }
}

// 0 = sticky just engaged; 1 = about to release.
function heroTrackProgress() {
  var track = document.getElementById("hero-track");
  var pin = document.getElementById("hero-pin");
  if (!track || !pin) return 0;
  var range = track.offsetHeight - pin.offsetHeight;
  if (range <= 1) return 0;
  var passed = Math.min(range, Math.max(0, -track.getBoundingClientRect().top));
  return heroClamp01(passed / range);
}

function heroApplyChartHeight(t, animate) {
  var chart = document.getElementById("hero-chart");
  if (!chart || !heroChartH0 || !heroChartH1) return;
  var h = Math.round(heroLerp(heroChartH0, heroChartH1, heroClamp01(t)));
  if (!animate) {
    var prev = chart.style.transition;
    chart.style.transition = "none";
    chart.style.height = h + "px";
    void chart.offsetHeight;
    chart.style.transition = prev || "";
    return;
  }
  chart.style.height = h + "px";
}

// Measure chart heights for wall (0) and dove (1) under current width.
function heroMeasureChartHeights() {
  var chart = document.getElementById("hero-chart");
  var board = document.getElementById("hero-board");
  if (!chart || !board || !heroLayout) {
    heroChartH0 = 0;
    heroChartH1 = 0;
    return;
  }
  var prevBoard = board.style.height;
  var prevChart = chart.style.height;
  var prevTransition = chart.style.transition;
  chart.style.transition = "none";

  board.style.height = heroLayout.gridH + "px";
  chart.style.height = "auto";
  heroChartH0 = Math.round(chart.getBoundingClientRect().height);

  board.style.height = heroLayout.cloudH + "px";
  chart.style.height = "auto";
  heroChartH1 = Math.round(chart.getBoundingClientRect().height);

  board.style.height = prevBoard || heroLayout.gridH + "px";
  chart.style.height = prevChart || "";
  void chart.offsetHeight;
  chart.style.transition = prevTransition || "";
}

function heroApplyRunway(section) {
  var track = document.getElementById("hero-track");
  var chart = document.getElementById("hero-chart");
  if (heroReduced() || heroMode() === "wall") {
    heroClearRunway(section);
    return;
  }
  if (track) track.style.height = HERO_TRACK_VH + "vh";
  heroMeasureChartHeights();
  heroApplyChartHeight(heroVisualT, false);
  if (chart) {
    chart.style.setProperty("--hero-morph-ms", HERO_MORPH_MS + "ms");
  }
}

// Room for chart inside sticky pin above the intro copy.
function heroPinBudgetH() {
  var vh = heroViewportH();
  var pin = document.getElementById("hero-pin");
  var intro = pin ? pin.querySelector(".intro") : null;
  var introH = intro ? intro.offsetHeight + 28 : 120;
  // Sticky `top` inset — air above Fig. 1 when pinned, not extra flow gap.
  var inset = pin ? (parseFloat(getComputedStyle(pin).top) || 0) : 0;
  return Math.max(180, vh - introH - inset - 12);
}

function heroCloudMaxH(narrow) {
  var budget = heroPinBudgetH();
  var vh = heroViewportH();
  if (narrow) return Math.min(budget, vh * 0.56);
  return Math.min(budget, Math.max(260, vh * 0.55));
}

function heroStopCountReveal() {
  if (heroCountRaf) {
    cancelAnimationFrame(heroCountRaf);
    heroCountRaf = 0;
  }
  heroCountTs = 0;
}

function heroStopAnim() {
  if (heroAnimRaf) {
    cancelAnimationFrame(heroAnimRaf);
    heroAnimRaf = 0;
  }
  if (heroAnimTimer) {
    clearTimeout(heroAnimTimer);
    heroAnimTimer = 0;
  }
  if (heroFaceTimer) {
    clearTimeout(heroFaceTimer);
    heroFaceTimer = 0;
  }
  heroAnimTs = 0;
  heroMorphing = false;
  heroStopCountReveal();
  if (typeof heroCanvasTeardown === "function" && heroCanvasActive) heroCanvasTeardown();
  var board = document.getElementById("hero-board");
  if (board) {
    board.classList.remove("is-animating", "is-canvas-flight");
    board.style.removeProperty("--hero-morph-ms");
  }
}

function heroResetMotion() {
  heroStopAnim();
  heroVisualT = 0;
  heroTargetT = 0;
  heroCountReveal = 0;
  heroScrubKey = "";
}

function heroApplyVisual() {
  var mode = heroMode();
  if (mode === "hex") return heroHexApply(heroVisualT);
  if (mode === "dove") return heroDoveApply(heroVisualT);
}

function heroCountT() {
  return heroCountReveal;
}

// Caption rides up over the sticky stretch after the morph latch.
// Linear with scroll so the long second half of the track actually reads.
function heroCountRideT(progress) {
  var start = HERO_MORPH_PROGRESS;
  var span = Math.max(0.3, 1 - start);
  return heroClamp01((progress - start) / span);
}

function heroMountCountStack(board, n) {
  if (!board) return null;
  var stack = document.getElementById("hero-count-stack");
  if (stack && stack.parentElement) stack.remove();
  stack = document.createElement("div");
  stack.id = "hero-count-stack";
  stack.className = "hero-count-stack";
  stack.setAttribute("aria-hidden", "true");
  var lines = typeof heroCountLines === "function" ? heroCountLines(n) : [heroCountLabel(n)];
  for (var i = 0; i < lines.length; i++) {
    var line = document.createElement("p");
    line.className = "hero-count";
    if (i === 0) line.id = "hero-count";
    line.textContent = lines[i];
    stack.appendChild(line);
  }
  board.appendChild(stack);
  return stack;
}

function heroPaintCountRide(t) {
  var stack = document.getElementById("hero-count-stack");
  if (!stack || stack.hidden) return;
  t = heroClamp01(t == null ? 0 : t);
  heroCountReveal = t;
  var board = document.getElementById("hero-board");
  var boardH = board ? board.clientHeight : 0;
  // Enter from below the chart; leave by flying out past the top — same ease both ways.
  var travelIn = Math.max(200, boardH * 0.58);
  var travelOut = Math.max(140, boardH * 0.36);
  var restT = 0.46;
  var y;
  if (t <= restT) {
    y = (1 - heroSmooth(t / restT)) * travelIn;
  } else {
    y = -heroSmooth((t - restT) / (1 - restT)) * travelOut;
  }
  stack.style.transform = "translate3d(-50%, " + y.toFixed(1) + "px, 0)";

  var frames = stack.querySelectorAll(".hero-count");
  var n = frames.length || 1;
  // Mirror stagger: same slot and fade length in and out.
  var inSlot = 0.38 / n;
  var fadeSpan = Math.max(0.09, inSlot * 0.95);
  var outStart = restT;
  var outSlot = inSlot;
  var edge = Math.max(18, boardH * 0.035);

  for (var i = 0; i < frames.length; i++) {
    var fadeIn = heroSmooth(heroClamp01((t - i * inSlot) / fadeSpan));
    var fadeOut = heroSmooth(heroClamp01((t - (outStart + i * outSlot)) / fadeSpan));
    var opacity = fadeIn * (1 - fadeOut);
    frames[i].style.opacity = opacity.toFixed(3);
    // From below the edge on the way in; past the top edge on the way out.
    var enterY = (1 - fadeIn) * edge;
    var exitY = fadeOut * -edge;
    frames[i].style.transform = "translate3d(0, " + (enterY + exitY).toFixed(1) + "px, 0)";
  }
}

function heroWantDove() {
  var progress = heroTrackProgress();
  // First ~60% of sticky distance: wall stays for browsing/clicks.
  // Small hysteresis so reverse needs a clear scroll back.
  if (heroTargetT >= 0.5) return progress >= HERO_MORPH_PROGRESS - 0.04;
  return progress >= HERO_MORPH_PROGRESS;
}

function heroAnimTick(ts) {
  heroAnimRaf = 0;
  if (!heroAnimTs) heroAnimTs = ts;
  // Wall-clock progress: dropped frames skip ahead instead of stretching the morph.
  var u = heroAnimDur > 0 ? heroClamp01((ts - heroAnimTs) / heroAnimDur) : 1;
  heroVisualT = heroLerp(heroAnimFrom, heroAnimTo, u);
  heroMorphing = u < 1;
  if (heroCanvasActive && typeof heroCanvasPaint === "function") heroCanvasPaint(heroVisualT);
  else heroApplyVisual();
  if (u < 1) {
    heroAnimRaf = requestAnimationFrame(heroAnimTick);
    return;
  }
  heroFinishMorph();
}

function heroFinishMorph() {
  heroVisualT = heroTargetT;
  heroAnimTs = 0;
  heroMorphing = false;
  if (heroFaceTimer) {
    clearTimeout(heroFaceTimer);
    heroFaceTimer = 0;
  }
  var wasCanvas = !!heroCanvasActive;
  var board = document.getElementById("hero-board");
  if (board) {
    board.classList.remove("is-animating");
    board.style.removeProperty("--hero-morph-ms");
  }
  if (wasCanvas && typeof heroCanvasPaint === "function") {
    // Final canvas frame covers the board while DOM pose is written underneath
    // (marks still visibility:hidden via is-canvas-flight).
    heroCanvasPaint(heroVisualT);
    heroApplyVisual();
    if (typeof heroCanvasTeardown === "function") heroCanvasTeardown();
    // Re-apply once marks are visible again so face/tile classes match rest state.
    heroApplyVisual();
  } else {
    if (board) board.classList.remove("is-canvas-flight");
    heroApplyVisual();
  }
  heroApplyChartHeight(heroVisualT, false);
  heroPaintCountRide(heroCountRideT(heroTrackProgress()));
}

function heroMarkTransform(t, index) {
  var point = heroLayout.points[index];
  var cell = heroLayout.cell;
  var tile = heroLayout.tile;
  var tileH = tile * HERO_HEX_ASPECT;
  var w = heroLerp(cell, tile, t);
  var h = heroLerp(cell, tileH, t);
  var cx = heroLerp(point.x0, point.x1, t);
  var cy = heroLerp(point.y0, point.y1, t);
  return (
    "translate3d(" + (cx - cell / 2).toFixed(2) + "px," + (cy - cell / 2).toFixed(2) + "px,0) scale(" +
    (w / cell).toFixed(4) + "," + (h / cell).toFixed(4) + ")"
  );
}

// Shared paint: board CSS vars + mark transforms.
// opts.heightT overrides board height lerp (defaults to t).
function heroPaintMorph(t, faceT, tileT, silT, opts) {
  if (!heroLayout || !heroMarks.length) return;
  opts = opts || {};
  var board = document.getElementById("hero-board");
  var faceOpacity = 1 - faceT;
  // Board height follows the morph; .hero-chart height transitions in lockstep
  // so the intro under the chart rides up without a jump.
  var heightT = opts.heightT != null ? opts.heightT : t;
  var boardH = Math.round(heroLerp(heroLayout.gridH, heroLayout.cloudH, heightT));

  if (board) {
    if (heroLayout._hPx !== boardH) {
      heroLayout._hPx = boardH;
      board.style.height = boardH + "px";
    }
    board.style.setProperty("--hero-face", faceOpacity.toFixed(3));
    board.style.setProperty("--hero-tile", tileT.toFixed(3));
    if (silT != null) board.style.setProperty("--hero-sil", (silT * 0.28).toFixed(3));
    board.classList.toggle("is-animating", !!heroMorphing || !!opts.animating);
    board.classList.toggle("is-faces-off", faceOpacity <= 0.04);
    board.classList.toggle("is-tiles-on", tileT >= 0.03);
  }

  for (var i = 0; i < heroMarks.length; i++) {
    heroMarks[i].el.style.transform = heroMarkTransform(t, i);
  }

}

function heroSetTargetT(next, section) {
  next = next ? 1 : 0;
  if (heroReduced()) {
    heroStopAnim();
    heroVisualT = next;
    heroTargetT = next;
    heroPaintCountRide(next ? 1 : 0);
    heroApplyVisual();
    heroApplyChartHeight(next, false);
    return;
  }
  if (heroMorphing) return;
  if (next === heroTargetT) return;
  heroTargetT = next;
  heroStopCountReveal();

  if (Math.abs(heroTargetT - heroVisualT) < 0.0005) {
    heroVisualT = heroTargetT;
    heroApplyVisual();
    heroApplyChartHeight(heroVisualT, false);
    return;
  }

  heroCloseTip();

  // One morph engine everywhere (see hero-canvas.js).
  if (typeof heroCanvasFlyTo === "function") {
    heroCanvasFlyTo(next);
    return;
  }

  heroAnimFrom = heroVisualT;
  heroAnimTo = heroTargetT;
  heroAnimDur = HERO_MORPH_MS * Math.max(0.08, Math.abs(heroAnimTo - heroAnimFrom));
  heroMorphing = true;
  heroAnimTs = 0;
  heroApplyChartHeight(heroAnimTo, true);
  heroAnimRaf = requestAnimationFrame(heroAnimTick);
}

function heroDriveFromScroll(section) {
  var progress = heroTrackProgress();
  // Caption tracks scroll even while the dove morph is in flight.
  heroPaintCountRide(heroCountRideT(progress));
  if (heroMorphing) return;
  var want = heroWantDove();
  var key = (want ? "1" : "0") + ":" + heroVisualT.toFixed(3);
  heroSetTargetT(want ? 1 : 0, section);
  if (heroMorphing) return;
  if (key === heroScrubKey) return;
  heroScrubKey = key;
  heroApplyVisual();
}

function heroNeedsLayout() {
  var stage = document.getElementById("hero");
  var width = stage ? stage.clientWidth : 0;
  if (!width) return false;
  if (width === heroWidthCached && heroLayout) return false;
  heroWidthCached = width;
  return true;
}

function heroColumns(width) {
  if (width <= 520) return 10;
  if (width <= 900) return 10;
  // Prefer fewer, larger portraits on laptop; fitGrid may add cols if tall.
  return 12;
}

// Keep marks spanning the full stage width. On wide screens, if the wall is
// taller than the sticky budget, add columns (smaller cells) instead of
// shrinking the cell alone (that left empty side gutters). On narrow, keep
// the base column count so portraits stay large. Caps stay modest so we do
// not collapse back to a dense postage-stamp grid.
function heroFitGrid(width, gap, count, budgetH) {
  var cols = heroColumns(width);
  var maxCols = width <= 520
    ? cols
    : Math.min(count, width <= 900 ? 14 : 16);
  var cell;
  var rows;
  var gridH;
  do {
    cell = (width - gap * (cols - 1)) / cols;
    rows = Math.ceil(count / cols);
    gridH = rows * cell + gap * (rows - 1);
    if (gridH <= budgetH || cols >= maxCols) break;
    cols += 1;
  } while (true);
  return { cols: cols, cell: cell, rows: rows, gridH: gridH };
}

function heroModeFromQuery() {
  try {
    var query = new URLSearchParams(window.location.search).get("hero");
    if (query === "wall" || query === "hex" || query === "dove") return query;
  } catch (err) {}
  return "";
}

function heroMode() {
  var fromQuery = heroModeFromQuery();
  if (fromQuery) return fromQuery;
  try {
    var saved = localStorage.getItem(HERO_MODE_KEY);
    if (saved === "wall" || saved === "hex" || saved === "dove") return saved;
  } catch (err) {}
  return "dove";
}

function setHeroMode(next) {
  var mode = next === "wall" || next === "hex" || next === "dove" ? next : "dove";
  try { localStorage.setItem(HERO_MODE_KEY, mode); } catch (err) {}
  try {
    var url = new URL(window.location.href);
    if (mode === "dove") url.searchParams.delete("hero");
    else url.searchParams.set("hero", mode);
    history.replaceState(null, "", url);
  } catch (err) {}
  document.documentElement.setAttribute("data-hero-mode", mode);
  syncHeroModeControls();
  renderHero();
}

function syncHeroModeControls() {
  var mode = heroMode();
  document.documentElement.setAttribute("data-hero-mode", mode);
  document.querySelectorAll("[data-hero-mode]").forEach(function (button) {
    var id = button.getAttribute("data-hero-mode");
    if (id === mode) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}

function renderHero() {
  var mode = heroMode();
  document.documentElement.setAttribute("data-hero-mode", mode);
  if (mode === "wall") return heroWallRender();
  if (mode === "hex") return heroHexRender();
  return heroDoveRender();
}

function layoutHero(force) {
  var mode = heroMode();
  if (mode === "wall") {
    heroWidthCached = 0;
    heroResetMotion();
    return heroWallLayout();
  }
  if (!force && !heroNeedsLayout() && heroLayout) return;
  if (mode === "hex") return heroHexLayout();
  return heroDoveLayout();
}

function syncHero() {
  var mode = heroMode();
  if (mode === "wall") return heroWallSync();
  if (mode === "hex") return heroHexSync();
  return heroDoveSync();
}

(function bindHeroModeControls() {
  var nav = document.getElementById("hero-mode");
  if (!nav) return;
  syncHeroModeControls();
  nav.addEventListener("click", function (event) {
    var button = event.target.closest("[data-hero-mode]");
    if (!button) return;
    var next = button.getAttribute("data-hero-mode");
    if (!next || next === heroMode()) return;
    setHeroMode(next);
  });
})();
