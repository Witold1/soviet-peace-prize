document.getElementById("lang").addEventListener("click", function (event) {
  const button = event.target.closest("[data-set-lang]");
  if (!button || button.getAttribute("data-set-lang") === lang) return;
  setLang(button.getAttribute("data-set-lang"));
});

document.getElementById("display").addEventListener("click", function (event) {
  const button = event.target.closest("[data-set-display]");
  if (!button || button.hidden || button.getAttribute("aria-current") === "true") return;
  setDisplay(button.getAttribute("data-set-display"));
});

// Tablet shell width from css/base.css. Narrower windows can't host a
// larger display mode, so phone/tablet/laptop all look the same.
var DISPLAY_MIN_CHOICE = 768;

function syncDisplayControls() {
  var nav = document.getElementById("display");
  if (!nav) return;
  nav.hidden = window.innerWidth < DISPLAY_MIN_CHOICE;
}

function setDisplay(next) {
  const display = next === "phone" || next === "tablet" ? next : "laptop";
  document.documentElement.setAttribute("data-display", display);
  mapNarrowWas = null;
  yearNarrowWas = null;
  try { localStorage.setItem("laureates-display", display); } catch (err) {}
  try {
    const url = new URL(window.location.href);
    if (display === "laptop") url.searchParams.delete("display");
    else url.searchParams.set("display", display);
    history.replaceState(null, "", url);
  } catch (err) {}
  applyChrome();
  syncFn();
  renderYears();
  if (typeof renderWorldPark === "function") renderWorldPark();
  if (typeof renderAnnounceChart === "function") renderAnnounceChart();
  renderMap();
  if (typeof centerAgeChartScroll === "function") centerAgeChartScroll();
  if (typeof centerAliveChartScroll === "function") centerAliveChartScroll();
  if (typeof centerAnnounceChartScroll === "function") centerAnnounceChartScroll();
  layoutPress();
  syncPress();
  if (typeof layoutYears === "function") layoutYears();
  if (typeof syncYears === "function") syncYears();
  if (typeof layoutDestalin === "function") layoutDestalin();
  if (typeof syncDestalin === "function") syncDestalin();
  layoutHero(true);
  syncHero();
  syncSectionFade();
  syncToc();
}

function setLang(next) {
  lang = next === "ru" ? "ru" : "en";
  try { localStorage.setItem("laureates-lang", lang); } catch (err) {}
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
  } catch (err) {}
  applyChrome();
  syncFn();
  renderHero();
  renderOccupations();
  renderYears();
  if (typeof renderWorldPark === "function") renderWorldPark();
  if (typeof renderAnnounceChart === "function") renderAnnounceChart();
  renderAges();
  if (typeof renderAliveChart === "function") renderAliveChart();
  renderMap();
  renderPress();
  if (typeof renderGhosts === "function") renderGhosts();
  syncSectionFade();
  syncToc();
}

function viewNear(el, margin) {
  if (!el) return false;
  var rect = el.getBoundingClientRect();
  var pad = margin == null ? 160 : margin;
  return rect.bottom > -pad && rect.top < window.innerHeight + pad;
}

var scrollSyncQueued = false;
var scrollHeroEl = null;
var scrollPrizeEl = null;
var scrollYearsEl = null;
var scrollOccEl = null;
function runScrollSync() {
  scrollSyncQueued = false;
  if (!scrollHeroEl) scrollHeroEl = document.getElementById("all");
  if (!scrollPrizeEl) scrollPrizeEl = document.getElementById("prize");
  if (!scrollYearsEl) scrollYearsEl = document.getElementById("years");
  if (!scrollOccEl) scrollOccEl = document.getElementById("occupation");
  syncToc();
  if (viewNear(scrollPrizeEl, 240)) syncPress();
  if (viewNear(scrollOccEl, 240) && typeof syncOccupations === "function") syncOccupations();
  if (viewNear(scrollYearsEl, 240) && typeof syncYears === "function") syncYears();
  if (
    (typeof heroMorphing !== "undefined" && heroMorphing) ||
    (typeof heroVisualT === "number" && heroVisualT > 0.01) ||
    (typeof heroTargetT === "number" && heroTargetT > 0.01) ||
    viewNear(scrollHeroEl, 320)
  ) {
    syncHero();
  }
  syncSectionFade();
}

window.addEventListener("scroll", function () {
  if (scrollSyncQueued) return;
  scrollSyncQueued = true;
  requestAnimationFrame(runScrollSync);
}, { passive: true });

var yearNarrowWas = null;
var mapNarrowWas = null;
var occNarrowWas = null;
var resizeSyncQueued = false;
var layoutWidthCached = 0;
window.addEventListener("resize", function () {
  if (resizeSyncQueued) return;
  resizeSyncQueued = true;
  requestAnimationFrame(function () {
    resizeSyncQueued = false;
    var width = window.innerWidth;
    // Mobile URL-bar show/hide fires resize with height-only change. Relayout
    // then rewrites sticky section heights and the page jumps a few lines
    // opposite the scroll. Ignore pure height resizes.
    if (width === layoutWidthCached) {
      syncDisplayControls();
      return;
    }
    layoutWidthCached = width;
    if (typeof refreshSectionFadeHeight === "function") refreshSectionFadeHeight();
    var narrow = typeof yearChartNarrow === "function" && yearChartNarrow();
    if (narrow !== yearNarrowWas) {
      yearNarrowWas = narrow;
      renderYears();
      if (typeof renderWorldPark === "function") renderWorldPark();
    }
    var mapNarrow = typeof mapChartNarrow === "function" && mapChartNarrow();
    if (mapNarrow !== mapNarrowWas) {
      mapNarrowWas = mapNarrow;
      renderMap();
    }
    var occNarrow = typeof occChartNarrow === "function" && occChartNarrow();
    if (occNarrow !== occNarrowWas) {
      occNarrowWas = occNarrow;
      renderOccupations();
      if (typeof renderWorldPark === "function") renderWorldPark();
    }
    if (typeof centerAgeChartScroll === "function") centerAgeChartScroll();
    if (typeof centerAliveChartScroll === "function") centerAliveChartScroll();
    if (typeof centerAnnounceChartScroll === "function") centerAnnounceChartScroll();
    layoutPress();
    syncPress();
    if (typeof layoutOccSticky === "function") layoutOccSticky();
    if (typeof syncOccupations === "function") syncOccupations();
    if (typeof layoutYears === "function") layoutYears();
    if (typeof syncYears === "function") syncYears();
    if (typeof layoutDestalin === "function") layoutDestalin();
    if (typeof syncDestalin === "function") syncDestalin();
    layoutHero();
    syncHero();
    syncSectionFade();
    syncToc();
    syncDisplayControls();
  });
});

(function () {
  var button = document.getElementById("dev-plain-toggle");
  if (!button) return;
  var key = "laureates-dev-plain";
  function syncDevPlain() {
    var plain = document.documentElement.hasAttribute("data-dev-plain");
    button.setAttribute("aria-pressed", plain ? "true" : "false");
    button.textContent = plain ? "dev: show section colors" : "dev: drop section colors";
  }
  // Default: section colors dropped. sessionStorage "0" keeps them on for this tab.
  try {
    if (sessionStorage.getItem(key) !== "0") {
      document.documentElement.setAttribute("data-dev-plain", "");
    }
  } catch (err) {
    document.documentElement.setAttribute("data-dev-plain", "");
  }
  button.addEventListener("click", function () {
    document.documentElement.toggleAttribute("data-dev-plain");
    var plain = document.documentElement.hasAttribute("data-dev-plain");
    try {
      if (plain) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, "0");
    } catch (err) {}
    syncDevPlain();
  });
  syncDevPlain();
})();

(function () {
  var button = document.getElementById("dev-tech-toggle");
  if (!button) return;
  var key = "laureates-dev-hide-tech";
  function syncDevTech() {
    var hide = document.documentElement.hasAttribute("data-dev-hide-tech");
    button.setAttribute("aria-pressed", hide ? "true" : "false");
    button.textContent = hide ? "dev: show chart tech notes" : "dev: drop chart tech notes";
  }
  // Default: chart tech notes dropped. sessionStorage "0" keeps them on for this tab.
  try {
    if (sessionStorage.getItem(key) !== "0") {
      document.documentElement.setAttribute("data-dev-hide-tech", "");
    }
  } catch (err) {
    document.documentElement.setAttribute("data-dev-hide-tech", "");
  }
  button.addEventListener("click", function () {
    document.documentElement.toggleAttribute("data-dev-hide-tech");
    var hide = document.documentElement.hasAttribute("data-dev-hide-tech");
    try {
      if (hide) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, "0");
    } catch (err) {}
    syncDevTech();
  });
  syncDevTech();
})();

(function () {
  var button = document.getElementById("dev-press-click-toggle");
  if (!button) return;
  var key = "laureates-dev-press-click";
  function syncDevPressClick() {
    var on = document.documentElement.hasAttribute("data-dev-press-click");
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.textContent = on ? "dev: press titles plain" : "dev: press titles clickable";
  }
  // Default off. sessionStorage "1" enables clickable instability titles for this tab.
  try {
    if (sessionStorage.getItem(key) === "1") {
      document.documentElement.setAttribute("data-dev-press-click", "");
    }
  } catch (err) {}
  button.addEventListener("click", function () {
    document.documentElement.toggleAttribute("data-dev-press-click");
    var on = document.documentElement.hasAttribute("data-dev-press-click");
    try {
      if (on) sessionStorage.setItem(key, "1");
      else sessionStorage.removeItem(key);
    } catch (err) {}
    syncDevPressClick();
  });
  syncDevPressClick();
})();

setLang(initialLang());
layoutWidthCached = window.innerWidth;
if (typeof refreshSectionFadeHeight === "function") refreshSectionFadeHeight();
yearNarrowWas = typeof yearChartNarrow === "function" && yearChartNarrow();
mapNarrowWas = typeof mapChartNarrow === "function" && mapChartNarrow();
occNarrowWas = typeof occChartNarrow === "function" && occChartNarrow();
window.addEventListener("load", function () {
  layoutHero(true);
  syncHero();
});
