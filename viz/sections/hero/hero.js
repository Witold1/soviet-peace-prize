var heroMarks = [];
var heroLayout = null;
var heroTravel = 0;
var heroHold = 0;
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

function heroCaptionSpace(section) {
  var cap = section.querySelector(".figcap");
  if (!cap) return 0;
  var style = getComputedStyle(cap);
  return cap.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
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

function layoutHero() {
  var mode = heroMode();
  if (mode === "wall") return heroWallLayout();
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
