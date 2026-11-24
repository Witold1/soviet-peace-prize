var heroMarks = [];
var heroLayout = null;
var heroScrubKey = "";
var heroWidthCached = 0;
var heroVisualT = 0;
var heroTargetT = 0;
var heroAnimRaf = 0;
var heroAnimTs = 0;
var heroMorphing = false;
var heroCountReveal = 0;
var heroCountRaf = 0;
var heroCountTs = 0;
var HERO_MORPH_MS = 700;
var HERO_COUNT_DELAY_MS = 180;
var HERO_COUNT_MS = 420;
// Flat-top regular hex bbox: width:height = 2:√3 (same as Fig. 3 / hex.js).
var HERO_HEX_ASPECT = Math.sqrt(3) / 2;
var HERO_MODE_KEY = "laureates-hero-mode";

function heroReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  if (section) section.style.height = "";
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
  heroAnimTs = 0;
  heroMorphing = false;
  heroStopCountReveal();
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

function heroStartCountReveal() {
  heroStopCountReveal();
  if (heroReduced()) {
    heroCountReveal = 1;
    heroApplyVisual();
    return;
  }
  heroCountReveal = 0;
  var started = 0;
  function tick(ts) {
    heroCountRaf = 0;
    if (!started) started = ts;
    var elapsed = ts - started;
    if (elapsed < HERO_COUNT_DELAY_MS) {
      heroCountRaf = requestAnimationFrame(tick);
      return;
    }
    var u = heroClamp01((elapsed - HERO_COUNT_DELAY_MS) / HERO_COUNT_MS);
    heroCountReveal = heroSmooth(u);
    heroApplyVisual();
    if (u < 1) heroCountRaf = requestAnimationFrame(tick);
  }
  heroCountRaf = requestAnimationFrame(tick);
}

function heroWantDove(section) {
  if (!section) return heroTargetT >= 0.5;
  var top = section.getBoundingClientRect().top;
  var vh = window.innerHeight || 800;
  var arm = Math.min(88, vh * 0.12);
  // Use target only for latch so a reverse in progress is not pulled back
  // by visualT still being near 1. Reverse once Fig. 1 drops ~120px below arm.
  if (heroTargetT >= 0.5) {
    return top < arm + 120;
  }
  return top < arm;
}

function heroAnimTick(ts) {
  heroAnimRaf = 0;
  if (!heroAnimTs) heroAnimTs = ts;
  var dt = Math.min(0.032, (ts - heroAnimTs) / 1000);
  heroAnimTs = ts;
  var maxStep = dt / (HERO_MORPH_MS / 1000);
  var delta = heroTargetT - heroVisualT;
  if (Math.abs(delta) <= maxStep) {
    heroVisualT = heroTargetT;
    heroAnimTs = 0;
    heroMorphing = false;
    heroApplyVisual();
    if (heroVisualT >= 0.995) heroStartCountReveal();
    else {
      heroCountReveal = 0;
      heroApplyVisual();
    }
    return;
  }
  heroVisualT += delta < 0 ? -maxStep : maxStep;
  heroMorphing = true;
  heroAnimRaf = requestAnimationFrame(heroAnimTick);
  heroApplyVisual();
}

function heroSetTargetT(next, section) {
  next = next ? 1 : 0;
  if (heroReduced()) {
    heroStopAnim();
    heroVisualT = next;
    heroTargetT = next;
    heroCountReveal = next ? 1 : 0;
    heroApplyVisual();
    return;
  }
  if (heroMorphing) return;
  if (next === heroTargetT) return;
  heroTargetT = next;
  heroStopCountReveal();
  if (next < 1) heroCountReveal = 0;

  if (Math.abs(heroTargetT - heroVisualT) < 0.0005) {
    heroVisualT = heroTargetT;
    heroApplyVisual();
    if (heroVisualT >= 0.995) heroStartCountReveal();
    return;
  }

  // Already scrolled past the figure — snap so a late tween does not yank layout.
  if (next === 1 && section) {
    var rect = section.getBoundingClientRect();
    if (rect.bottom < 64) {
      heroVisualT = 1;
      heroMorphing = false;
      heroApplyVisual();
      heroStartCountReveal();
      return;
    }
  }

  heroMorphing = true;
  heroAnimTs = 0;
  heroAnimRaf = requestAnimationFrame(heroAnimTick);
}

function heroDriveFromScroll(section) {
  if (heroMorphing) return;
  var want = heroWantDove(section);
  var key = (want ? "1" : "0") + ":" + heroVisualT.toFixed(3) + ":" + heroCountReveal.toFixed(3);
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
  if (width <= 900) return 12;
  return 16;
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
