document.getElementById("lang").addEventListener("click", function (event) {
  const button = event.target.closest("[data-set-lang]");
  if (!button || button.getAttribute("data-set-lang") === lang) return;
  setLang(button.getAttribute("data-set-lang"));
});

document.getElementById("display").addEventListener("click", function (event) {
  const button = event.target.closest("[data-set-display]");
  if (!button || button.getAttribute("aria-current") === "true") return;
  setDisplay(button.getAttribute("data-set-display"));
});

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
  renderMap();
  if (typeof centerAgeChartScroll === "function") centerAgeChartScroll();
  layoutPress();
  syncPress();
  if (typeof layoutYears === "function") layoutYears();
  if (typeof syncYears === "function") syncYears();
  layoutHero();
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
  renderAges();
  renderMap();
  renderPress();
  syncSectionFade();
  syncToc();
}

window.addEventListener("scroll", function () {
  syncToc();
  syncPress();
  if (typeof syncYears === "function") syncYears();
  syncHero();
  syncSectionFade();
}, { passive: true });
var yearNarrowWas = null;
var mapNarrowWas = null;
window.addEventListener("resize", function () {
  var narrow = typeof yearChartNarrow === "function" && yearChartNarrow();
  if (narrow !== yearNarrowWas) {
    yearNarrowWas = narrow;
    renderYears();
  }
  var mapNarrow = typeof mapChartNarrow === "function" && mapChartNarrow();
  if (mapNarrow !== mapNarrowWas) {
    mapNarrowWas = mapNarrow;
    renderMap();
  }
  if (typeof centerAgeChartScroll === "function") centerAgeChartScroll();
  layoutPress();
  syncPress();
  if (typeof layoutYears === "function") layoutYears();
  if (typeof syncYears === "function") syncYears();
  layoutHero();
  syncHero();
  syncSectionFade();
  syncToc();
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
  try {
    if (sessionStorage.getItem(key) === "1") {
      document.documentElement.setAttribute("data-dev-plain", "");
    }
  } catch (err) {}
  button.addEventListener("click", function () {
    document.documentElement.toggleAttribute("data-dev-plain");
    var plain = document.documentElement.hasAttribute("data-dev-plain");
    try {
      if (plain) sessionStorage.setItem(key, "1");
      else sessionStorage.removeItem(key);
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
  try {
    if (sessionStorage.getItem(key) === "1") {
      document.documentElement.setAttribute("data-dev-hide-tech", "");
    }
  } catch (err) {}
  button.addEventListener("click", function () {
    document.documentElement.toggleAttribute("data-dev-hide-tech");
    var hide = document.documentElement.hasAttribute("data-dev-hide-tech");
    try {
      if (hide) sessionStorage.setItem(key, "1");
      else sessionStorage.removeItem(key);
    } catch (err) {}
    syncDevTech();
  });
  syncDevTech();
})();

setLang(initialLang());
yearNarrowWas = typeof yearChartNarrow === "function" && yearChartNarrow();
mapNarrowWas = typeof mapChartNarrow === "function" && mapChartNarrow();
window.addEventListener("load", function () {
  layoutHero();
  syncHero();
});
