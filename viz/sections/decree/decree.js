// Yellow-marker guides (page fractions of the full Pravda scan).
var DECREE_1949_ANNOTS = [
  { id: "title", x: 0.036, y: 0.0685, w: 0.300, h: 0.0465, textKey: "decreeAnnotTitle" },
  { id: "anyone", x: 0.0260, y: 0.1337, w: 0.3110, h: 0.0235, textKey: "decreeAnnotAnyone" },
  { id: "gifts", x: 0.0390, y: 0.1799, w: 0.2915, h: 0.0164, textKey: "decreeAnnotGifts" },
  { id: "birthday", x: 0.0309, y: 0.2364, w: 0.3045, h: 0.0148, textKey: "decreeAnnotBirthday" }
];

var DECREE_1956_ANNOTS = [
  { id: "title", x: 0.035, y: 0.484, w: 0.455, h: 0.032, textKey: "renameAnnotTitle" },
  { id: "medal", x: 0.040, y: 0.568, w: 0.228, h: 0.014, textKey: "renameAnnotMedal" },
  { id: "ten", x: 0.268, y: 0.520, w: 0.248, h: 0.023, textKey: "renameAnnotTen" }
];

var DECREE_1989_ANNOTS = [
  // Right-column Pravda paragraph on the International Lenin Peace Prize.
  { id: "title", x: 0.8544, y: 0.1795, w: 0.1144, h: 0.0555, textKey: "rename1989AnnotTitle" }
];

/* Coords are on padded scans matched to the Pravda page aspect (1798/2628). */
var DECREE_1989_UKAZ_ANNOTS = [
  { id: "header", x: 0.08, y: 0.1805, w: 0.84, h: 0.096, textKey: "rename1989AnnotHeader" },
  { id: "thinking", x: 0.05, y: 0.3252, w: 0.90, h: 0.0706, textKey: "rename1989AnnotThinking" },
  { id: "rename", x: 0.05, y: 0.4116, w: 0.90, h: 0.0425, textKey: "rename1989AnnotRename" }
];

var DECREE_1989_STATUTE_ANNOTS = [
  { id: "ideology", x: 0.1317, y: 0.162, w: 0.7367, h: 0.12, textKey: "rename1989AnnotIdeology" },
  { id: "groups", x: 0.1317, y: 0.349, w: 0.7367, h: 0.078, textKey: "rename1989AnnotGroups" },
  { id: "april", x: 0.1317, y: 0.728, w: 0.7367, h: 0.034, textKey: "rename1989AnnotApril" },
  { id: "cash", x: 0.1317, y: 0.798, w: 0.7367, h: 0.046, textKey: "rename1989AnnotCash" }
];

var DECREE_CULT_ANNOTS = [
  { id: "cult", x: 0.07, y: 0.185, w: 0.86, h: 0.065, textKey: "destalinAnnotCult" }
];

var DECREE_DEATH_ANNOTS = [
  { id: "death", x: 0.44, y: 0.065, w: 0.52, h: 0.067, textKey: "destalinAnnotDeath" }
];

var DECREE_BERIA_ANNOTS = [
  { id: "beria", x: 0.035, y: 0.226, w: 0.235, h: 0.032, textKey: "destalinAnnotBeria" }
];

var DECREE_MALENKOV_ANNOTS = [
  { id: "malenkov", x: 0.405, y: 0.054, w: 0.57, h: 0.028, textKey: "destalinAnnotMalenkov" }
];

var UKAZ_ANNOT_SETS = [
  { rootId: "ukaz-annots", loupeId: "ukaz-loupe", items: DECREE_1949_ANNOTS, pressDriven: true },
  { rootId: "ukaz-annots-death", loupeId: "ukaz-loupe-death", items: DECREE_DEATH_ANNOTS },
  { rootId: "ukaz-annots-beria", loupeId: "ukaz-loupe-beria", items: DECREE_BERIA_ANNOTS },
  { rootId: "ukaz-annots-malenkov", loupeId: "ukaz-loupe-malenkov", items: DECREE_MALENKOV_ANNOTS },
  { rootId: "ukaz-annots-cult", loupeId: "ukaz-loupe-cult", items: DECREE_CULT_ANNOTS },
  { rootId: "ukaz-annots-1956", loupeId: "ukaz-loupe-1956", items: DECREE_1956_ANNOTS },
  { rootId: "ukaz-annots-1989", loupeId: "ukaz-loupe-1989", items: DECREE_1989_ANNOTS },
  { rootId: "ukaz-annots-1989-ukaz", loupeId: "ukaz-loupe-1989-ukaz", items: DECREE_1989_UKAZ_ANNOTS },
  { rootId: "ukaz-annots-1989-statute", loupeId: "ukaz-loupe-1989-statute", items: DECREE_1989_STATUTE_ANNOTS }
];

var ukazAnnotState = Object.create(null);

function ukazAnnotSetByRoot(rootId) {
  for (var i = 0; i < UKAZ_ANNOT_SETS.length; i++) {
    if (UKAZ_ANNOT_SETS[i].rootId === rootId) return UKAZ_ANNOT_SETS[i];
  }
  return null;
}

function ukazAnnotStateFor(rootId) {
  if (!ukazAnnotState[rootId]) {
    ukazAnnotState[rootId] = { active: "", pinned: false, built: false };
  }
  return ukazAnnotState[rootId];
}

function syncPageZoom() {
  document.querySelectorAll(".ukaz-loupe.is-page").forEach(function (loupe) {
    var quote = loupe.closest(".ukaz");
    var column = loupe.classList.contains("is-column");
    if (quote) quote.classList.toggle("is-column", column);
    var side = loupe.querySelector(".ukaz-side");
    if (side) {
      side.setAttribute("aria-pressed", column ? "true" : "false");
      var sideKey = side.getAttribute("data-i18n-aria");
      if (column) {
        side.setAttribute("aria-label", t("decreePage"));
      } else if (sideKey) {
        side.setAttribute("aria-label", t(sideKey));
      } else {
        side.setAttribute("aria-label", t("decreeSide"));
      }
    }
    var zoom = quote && quote.querySelector(".ukaz-zoom-label");
    if (zoom) zoom.textContent = t("decreePage");
    var zoomButton = quote && quote.querySelector(".ukaz-zoom");
    if (zoomButton) zoomButton.setAttribute("aria-label", t("decreePage"));
  });
}

function ukazAnnotById(set, id) {
  for (var i = 0; i < set.items.length; i++) {
    if (set.items[i].id === id) return set.items[i];
  }
  return set.items[0];
}

function renderUkazAnnots(set) {
  var root = document.getElementById(set.rootId);
  if (!root) return;
  var state = ukazAnnotStateFor(set.rootId);
  root.textContent = "";
  set.items.forEach(function (item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ukaz-annot";
    btn.dataset.annot = item.id;
    btn.style.setProperty("--x", item.x);
    btn.style.setProperty("--y", item.y);
    btn.style.setProperty("--w", item.w);
    btn.style.setProperty("--h", item.h);
    var text = document.createElement("span");
    text.className = "ukaz-annot-text";
    text.textContent = t(item.textKey);
    btn.appendChild(text);
    btn.setAttribute("aria-label", t(item.textKey));
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setUkazAnnot(set.rootId, item.id, true);
    });
    root.appendChild(btn);
  });
  state.built = true;
  syncUkazAnnotChrome(set.rootId);
}

function renderDecreeAnnots() {
  UKAZ_ANNOT_SETS.forEach(renderUkazAnnots);
}

function setUkazAnnot(rootId, id, force) {
  var state = ukazAnnotStateFor(rootId);
  var next = id || "";
  if (force && state.active === next) next = "";
  state.active = next;
  state.pinned = !!next;
  syncUkazAnnotChrome(rootId);
}

function setDecreeAnnot(id, force) {
  setUkazAnnot("ukaz-annots", id, force);
}

function syncUkazAnnotChrome(rootId) {
  var set = ukazAnnotSetByRoot(rootId);
  var root = document.getElementById(rootId);
  if (!set || !root) return;
  var state = ukazAnnotStateFor(rootId);
  if (!state.built) renderUkazAnnots(set);
  root.querySelectorAll(".ukaz-annot").forEach(function (btn) {
    var row = ukazAnnotById(set, btn.dataset.annot);
    var on = !!state.active && btn.dataset.annot === state.active;
    var label = t(row.textKey);
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", label);
    var text = btn.querySelector(".ukaz-annot-text");
    if (text) text.textContent = label;
  });
}

function syncDecreeAnnotChrome() {
  UKAZ_ANNOT_SETS.forEach(function (set) {
    syncUkazAnnotChrome(set.rootId);
  });
}

function clearUkazAnnot(rootId) {
  var state = ukazAnnotStateFor(rootId);
  state.active = "";
  state.pinned = false;
  syncUkazAnnotChrome(rootId);
}

function loupeZoomProgress(loupe) {
  if (!loupe) return 0;
  if (loupe.classList.contains("is-column")) return 1;
  return parseFloat(getComputedStyle(loupe).getPropertyValue("--zoom")) || 0;
}

function syncUkazAnnotVisibility() {
  UKAZ_ANNOT_SETS.forEach(function (set) {
    if (set.pressDriven) return;
    var root = document.getElementById(set.rootId);
    var loupe = document.getElementById(set.loupeId);
    if (!root || !loupe) return;
    if (!ukazAnnotStateFor(set.rootId).built) renderUkazAnnots(set);
    var show = loupeZoomProgress(loupe) >= 0.9;
    root.hidden = !show;
    if (!show) clearUkazAnnot(set.rootId);
    else syncUkazAnnotChrome(set.rootId);
  });
}

function syncDecreeAnnotProgress(zoom, front) {
  var root = document.getElementById("ukaz-annots");
  if (!root) return;
  var state = ukazAnnotStateFor("ukaz-annots");
  if (!state.built) renderUkazAnnots(ukazAnnotSetByRoot("ukaz-annots"));
  // Markers only after the zoom settles - not while the crop is still moving in.
  var show = !!front && zoom >= 0.9;
  root.hidden = !show;
  if (!show) {
    clearUkazAnnot("ukaz-annots");
    return;
  }
  syncUkazAnnotChrome("ukaz-annots");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderDecreeAnnots);
} else {
  renderDecreeAnnots();
}

function relayoutDecree(quote, target) {
  if (!quote.closest("#decree-1949") || typeof layoutPress !== "function") return;
  var decree = document.getElementById("decree-1949");
  // Inside the press stage the decree is sticky/absolute, so window scroll
  // does not move it - chasing its top would jump the page (esp. on phone).
  if (decree && decree.closest(".press-stage")) {
    if (typeof syncPress === "function") syncPress();
    return;
  }
  layoutPress();
  syncPress();
  if (!decree || target == null) return;
  var root = document.documentElement;
  var prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  var y = window.scrollY;
  for (var i = 0; i < 6; i++) {
    var dy = decree.getBoundingClientRect().top - target;
    if (Math.abs(dy) < 2) break;
    y += dy;
    window.scrollTo(0, Math.max(0, y));
    syncPress();
  }
  root.style.scrollBehavior = prev;
}

function setPageColumn(quote, column) {
  var loupe = quote.querySelector(".ukaz-loupe");
  if (!loupe) return;
  var decree = document.getElementById("decree-1949");
  var target = decree ? decree.getBoundingClientRect().top : null;
  loupe.classList.toggle("is-column", column);
  quote.classList.toggle("is-column", column);
  var lens = loupe.querySelector(".ukaz-lens");
  var mark = loupe.querySelector(".ukaz-mark");
  if (lens) lens.classList.remove("is-on");
  if (mark) mark.classList.remove("is-on");
  syncPageZoom();
  syncUkazAnnotVisibility();
  relayoutDecree(quote, target);
}

document.body.addEventListener("click", function (event) {
  var zoom = event.target.closest(".ukaz-zoom, .ukaz-side");
  if (zoom) {
    var quote = zoom.closest(".ukaz");
    var loupe = quote && quote.querySelector(".ukaz-loupe");
    if (!quote || !loupe || loupe.classList.contains("is-scrub")) return;
    setPageColumn(quote, !loupe.classList.contains("is-column"));
    return;
  }
  var button = event.target.closest(".ukaz-original");
  if (!button) return;
  var quote = button.closest(".ukaz");
  if (!quote) return;
  var decree = document.getElementById("decree-1949");
  var target = decree && quote.closest("#decree-1949") ? decree.getBoundingClientRect().top : null;
  quote.classList.toggle("is-open");
  syncOriginalButton();
  var lens = quote.querySelector(".ukaz-lens");
  var mark = quote.querySelector(".ukaz-mark");
  if (lens) lens.classList.remove("is-on");
  if (mark) mark.classList.remove("is-on");
  relayoutDecree(quote, target);
});

document.querySelectorAll(".ukaz-loupe").forEach(function (loupe) {
  var img = loupe.querySelector(".ukaz-scan");
  var lens = loupe.querySelector(".ukaz-lens");
  var mark = loupe.querySelector(".ukaz-mark");
  var text = loupe.closest(".ukaz-text");
  if (!img || !lens || !mark || !text) return;

  function hideLens() {
    lens.classList.remove("is-on");
    mark.classList.remove("is-on");
  }

  function placeLens(clientX, clientY) {
    // Inside the press sticky stage the floating loupe spills the zoom box;
    // scroll zoom + the side crop already carry the reading.
    if (loupe.closest(".press-stage")) {
      hideLens();
      return;
    }
    var rect = img.getBoundingClientRect();
    var viewEl = loupe.querySelector(".ukaz-view");
    var limit = viewEl ? viewEl.getBoundingClientRect() : rect;
    if (clientX < limit.left || clientY < limit.top || clientX > limit.right || clientY > limit.bottom) {
      hideLens();
      return;
    }
    // Page overview is too small to loupe; allow it once the decree is enlarged
    // by click (is-column) or by the press scroll zoom (is-zoomed / --zoom).
    var quote = loupe.closest(".ukaz");
    var zoom = parseFloat(getComputedStyle(loupe).getPropertyValue("--zoom")) || 0;
    var decreeClose =
      loupe.classList.contains("is-column") ||
      (quote && quote.classList.contains("is-zoomed")) ||
      zoom >= 0.84;
    if (loupe.classList.contains("is-page") && !decreeClose) {
      hideLens();
      return;
    }
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var visX = limit.left - rect.left;
    var visY = limit.top - rect.top;
    var visW = limit.width;
    var visH = limit.height;
    // Prefer the full figure/destalin width (as in 1949/1989), not the narrow page card.
    var frameEl = loupe.closest(".doc") || loupe.closest(".destalin") || text;
    var frame = frameEl.getBoundingClientRect();
    var loupeRect = loupe.getBoundingClientRect();
    var zoom = Math.min(2.15, Math.max(1.65, frame.width / visW));
    var band = Math.max(72, Math.min(visH * 0.2, 128));
    band = Math.min(band, visH * 0.45);
    var paneCap = Math.min(frame.width * 0.62, 440);
    if (band * zoom > paneCap) band = paneCap / zoom;
    var paneW = Math.min(frame.width, visW * zoom);
    var viewW = paneW / zoom;
    if (viewW > visW) {
      viewW = visW;
      paneW = viewW * zoom;
    }
    var srcX = x - viewW / 2;
    srcX = Math.max(visX, Math.min(srcX, visX + visW - viewW));
    var srcY = y - band / 2;
    srcY = Math.max(visY, Math.min(srcY, visY + visH - band));
    var paneH = band * zoom;
    var left = (frame.left + (frame.width - paneW) / 2) - loupeRect.left;
    var top = (rect.top - loupeRect.top) + srcY + band + 10;
    mark.style.left = (rect.left - loupeRect.left + srcX) + "px";
    mark.style.top = (rect.top - loupeRect.top + srcY) + "px";
    mark.style.width = viewW + "px";
    mark.style.height = band + "px";
    lens.style.left = left + "px";
    lens.style.top = top + "px";
    lens.style.width = paneW + "px";
    lens.style.height = paneH + "px";
    lens.style.backgroundImage = "url(\"" + img.src + "\")";
    lens.style.backgroundSize = (rect.width * zoom) + "px " + (rect.height * zoom) + "px";
    lens.style.backgroundPosition = (-srcX * zoom) + "px " + (-srcY * zoom) + "px";
    mark.classList.add("is-on");
    lens.classList.add("is-on");
  }

  loupe.addEventListener("pointermove", function (event) {
    if (event.pointerType === "touch" && event.buttons === 0) return;
    placeLens(event.clientX, event.clientY);
  });
  loupe.addEventListener("pointerdown", function (event) {
    if (event.pointerType !== "touch") return;
    if (event.target.closest(".ukaz-side, .ukaz-zoom")) return;
    loupe.setPointerCapture(event.pointerId);
    placeLens(event.clientX, event.clientY);
  });
  loupe.addEventListener("pointerup", hideLens);
  loupe.addEventListener("pointercancel", hideLens);
  loupe.addEventListener("pointerleave", function (event) {
    if (event.pointerType !== "touch") hideLens();
  });
});

var destalinPrevStop = -1;
var destalinAnimating = false;
var destalinRushBuilt = false;
var destalinRushRaf = 0;
var DESTALIN_RUSH_SRCS = [
  "../figures/pravda-1953-065-blur.jpg",
  "../figures/pravda-1953-191-blur.jpg",
  "../figures/pravda-1955-040-blur.jpg",
  "../figures/destalin-blur.jpg"
];
var DESTALIN_RUSH_COUNT = 18;

// Stable page tilts - same order as stops - so the land doesn't snap upright.
var DESTALIN_TILTS = [-1.15, 0.9, -0.7, 1.05, -0.95];

// Start on the renaming decree; › then walks the earlier destalinization carousel.
var destalinStop = DESTALIN_TILTS.length - 1;
var destalinReady = false;
var destalinCropRaf = 0;

function destalinReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function destalinStops() {
  return Array.prototype.slice.call(document.querySelectorAll("#destalin-carousel .destalin-panel.is-stop"));
}

function destalinRushRand(min, max) {
  return min + Math.random() * (max - min);
}

function destalinRushSoftMask() {
  var x = Math.round(destalinRushRand(15, 85));
  var y = Math.round(destalinRushRand(10, 75));
  var r = Math.round(destalinRushRand(28, 62));
  var x2 = Math.round(destalinRushRand(10, 90));
  var y2 = Math.round(destalinRushRand(15, 85));
  var r2 = Math.round(destalinRushRand(18, 44));
  return (
    "radial-gradient(circle at " +
    x +
    "% " +
    y +
    "%, #000 0%, #000 " +
    Math.round(r * 0.35) +
    "%, transparent " +
    r +
    "%), radial-gradient(circle at " +
    x2 +
    "% " +
    y2 +
    "%, #000 0%, transparent " +
    r2 +
    "%)"
  );
}

function destalinTiltFor(stopIndex) {
  return DESTALIN_TILTS[((stopIndex % DESTALIN_TILTS.length) + DESTALIN_TILTS.length) % DESTALIN_TILTS.length];
}

function dressDestalinGhost(ghost) {
  var tilt = destalinRushRand(-2.8, 2.8);
  var posX = Math.round(destalinRushRand(0, 70));
  var posY = Math.round(destalinRushRand(0, 35));
  ghost.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
  ghost.style.setProperty("--ghost-blur", destalinRushRand(0.15, 0.85).toFixed(2) + "px");
  ghost.style.setProperty("--soft-blur", destalinRushRand(1.4, 3.4).toFixed(2) + "px");
  ghost.style.setProperty("--soft-mask", destalinRushSoftMask());
  ghost.style.setProperty("--ghost-pos", posX + "% " + posY + "%");
}

function buildDestalinRush() {
  var strip = document.getElementById("destalin-rush-strip");
  if (!strip || destalinRushBuilt) return;
  strip.textContent = "";
  var i;
  for (i = 0; i < DESTALIN_RUSH_COUNT; i++) {
    var ghost = document.createElement("div");
    ghost.className = "destalin-rush-ghost";
    var src = DESTALIN_RUSH_SRCS[i % DESTALIN_RUSH_SRCS.length];
    var base = document.createElement("img");
    base.className = "destalin-rush-base";
    base.src = src;
    base.alt = "";
    base.decoding = "async";
    base.draggable = false;
    var soft = document.createElement("img");
    soft.className = "destalin-rush-soft";
    soft.src = src;
    soft.alt = "";
    soft.decoding = "async";
    soft.draggable = false;
    soft.setAttribute("aria-hidden", "true");
    ghost.appendChild(base);
    ghost.appendChild(soft);
    dressDestalinGhost(ghost);
    strip.appendChild(ghost);
  }
  destalinRushBuilt = true;
}

function prepareDestalinRush(fromStop, toStop, forward) {
  var stage = document.getElementById("destalin-stage");
  var rush = document.getElementById("destalin-rush");
  var strip = document.getElementById("destalin-rush-strip");
  var page = document.querySelector("#destalin-carousel .destalin-panel.is-current .destalin-page");
  if (!stage || !rush || !strip || !page || !strip.children.length) return null;
  var stageRect = stage.getBoundingClientRect();
  var pageRect = page.getBoundingClientRect();
  var left = pageRect.left - stageRect.left;
  var top = pageRect.top - stageRect.top;
  var w = page.offsetWidth;
  var h = page.offsetHeight;
  rush.style.left = left.toFixed(1) + "px";
  rush.style.top = top.toFixed(1) + "px";
  rush.style.width = w.toFixed(1) + "px";
  rush.style.height = h.toFixed(1) + "px";
  var gap = parseFloat(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 6;
  var i;
  for (i = 0; i < strip.children.length; i++) {
    var ghost = strip.children[i];
    ghost.style.width = w.toFixed(1) + "px";
    dressDestalinGhost(ghost);
  }
  // Soften the first/last ghost so the upright target handoff is less abrupt.
  var startGhost = forward ? 0 : strip.children.length - 1;
  var endGhost = forward ? strip.children.length - 1 : 0;
  strip.children[startGhost].style.setProperty("--tilt", destalinTiltFor(fromStop).toFixed(2) + "deg");
  strip.children[endGhost].style.setProperty("--tilt", "0deg");
  var step = w + gap;
  var travel = (strip.children.length - 1) * step;
  return { strip: strip, travel: travel };
}

function applyDestalin(stopIndex, opts) {
  opts = opts || {};
  var enterCrop = !!opts.enterCrop;
  var animateCrop = !!opts.animateCrop;
  var stops = destalinStops();
  if (!stops.length) return;
  var index = Math.max(0, Math.min(stops.length - 1, stopIndex));
  if (destalinCropRaf) {
    cancelAnimationFrame(destalinCropRaf);
    destalinCropRaf = 0;
  }
  stops.forEach(function (panel, i) {
    var current = i === index;
    panel.classList.toggle("is-current", current);
    panel.classList.toggle(
      "is-prev",
      destalinPrevStop >= 0 && i === destalinPrevStop && i !== index
    );
    var quote = panel.querySelector(".ukaz");
    if (!quote) return;
    if (!current) {
      setPageColumn(quote, false);
      return;
    }
    if (!enterCrop) return;
    if (animateCrop) {
      setPageColumn(quote, false);
      destalinCropRaf = requestAnimationFrame(function () {
        destalinCropRaf = requestAnimationFrame(function () {
          destalinCropRaf = 0;
          if (destalinStop !== index || !panel.classList.contains("is-current")) return;
          setPageColumn(quote, true);
        });
      });
    } else {
      setPageColumn(quote, true);
    }
  });
  syncUkazAnnotVisibility();
}

var DESTALIN_CAPTION_KEYS = [
  "destalinCapDeath",
  "destalinCapBeria",
  "destalinCapMalenkov",
  "destalinCapCult",
  "destalinCapRename"
];

var DESTALIN_ASK_KEYS = [
  "destalinAskDeath",
  "destalinAskBeria",
  "destalinAskMalenkov",
  "destalinAskCult",
  "destalinAskRename"
];

function syncDestalinButton() {
  var next = document.getElementById("destalin-next");
  var label = document.getElementById("destalin-next-label");
  var caption = document.getElementById("destalin-caption");
  var stops = destalinStops();
  if (!next || !stops.length) return;
  var atRename = destalinStop === stops.length - 1;
  var askKey = DESTALIN_ASK_KEYS[destalinStop] || "destalinWhatNext";
  var capKey = DESTALIN_CAPTION_KEYS[destalinStop] || DESTALIN_CAPTION_KEYS[0];
  next.classList.toggle("is-why", atRename);
  next.disabled = destalinAnimating;
  next.setAttribute("data-i18n-aria", askKey);
  if (caption) {
    caption.setAttribute("data-i18n", capKey);
    if (typeof t === "function") caption.textContent = t(capKey);
  }
  if (label) {
    label.setAttribute("data-i18n", askKey);
    if (typeof t === "function") label.textContent = t(askKey);
  }
  if (typeof t === "function") {
    next.setAttribute("aria-label", t(askKey));
  }
}

function clearDestalinRush(root) {
  if (!root) return;
  root.classList.remove("is-rushing");
}

function setDestalinStop(stopIndex, animate) {
  var root = document.getElementById("destalin");
  var stops = destalinStops();
  if (!stops.length) return;
  var nextStop = Math.max(0, Math.min(stops.length - 1, stopIndex));
  var from = destalinStop;
  var changed = from !== nextStop;
  destalinStop = nextStop;
  if (destalinRushRaf) {
    cancelAnimationFrame(destalinRushRaf);
    destalinRushRaf = 0;
  }
  var enterCrop = changed || !destalinReady;
  if (!animate || destalinReduced() || !changed) {
    clearDestalinRush(root);
    destalinAnimating = false;
    if (animate && changed) destalinPrevStop = from;
    applyDestalin(destalinStop, { enterCrop: enterCrop, animateCrop: false });
    destalinReady = true;
    syncDestalinButton();
    return;
  }
  buildDestalinRush();
  destalinAnimating = true;
  syncDestalinButton();
  // Always leaf forward, including the wrap from last → first.
  var forward = true;
  clearDestalinRush(root);
  if (root) root.classList.add("is-rushing");
  var rush = prepareDestalinRush(from, nextStop, forward);
  if (!rush) {
    clearDestalinRush(root);
    destalinAnimating = false;
    applyDestalin(destalinStop, { enterCrop: true, animateCrop: false });
    destalinReady = true;
    syncDestalinButton();
    return;
  }
  var strip = rush.strip;
  var fromX = 0;
  var toX = -rush.travel;
  strip.style.transform = "translate3d(" + fromX.toFixed(1) + "px,0,0)";
  void strip.offsetWidth;
  var start = performance.now();
  var wrap = nextStop < from;
  var dur = wrap ? 920 : 720;

  function finish() {
    if (!destalinAnimating) return;
    destalinAnimating = false;
    destalinRushRaf = 0;
    destalinPrevStop = from;
    clearDestalinRush(root);
    applyDestalin(destalinStop, { enterCrop: true, animateCrop: !destalinReduced() });
    destalinReady = true;
    syncDestalinButton();
  }

  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    // Ease in-out cubic: slow on the current page, whip through the carousel, settle.
    var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    var x = fromX + (toX - fromX) * eased;
    strip.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
    if (t < 1) {
      destalinRushRaf = requestAnimationFrame(frame);
      return;
    }
    finish();
  }

  destalinRushRaf = requestAnimationFrame(frame);
}

function layoutDestalin() {
  var track = document.getElementById("destalin-carousel");
  var next = document.getElementById("destalin-next");
  if (!track) return;
  buildDestalinRush();
  if (next && !next.dataset.destalinBound) {
    next.dataset.destalinBound = "1";
    function advanceDestalin() {
      if (destalinAnimating) return;
      var stops = destalinStops();
      if (!stops.length) return;
      setDestalinStop((destalinStop + 1) % stops.length, true);
    }
    next.addEventListener("click", advanceDestalin);
  }
  setDestalinStop(destalinStop, false);
}

function syncDestalin() {
  if (!destalinAnimating) applyDestalin(destalinStop);
  syncDestalinButton();
}

layoutDestalin();
syncDestalin();

var rename1989Stop = 0;
var rename1989Ready = false;
var rename1989PrevStop = -1;
var rename1989CropRaf = 0;
var rename1989Animating = false;

var RENAME1989_CAPTION_KEYS = ["rename1989CapPravda", "rename1989CapUkaz", "rename1989CapStatute"];
var RENAME1989_ASK_KEYS = ["rename1989AskPravda", "rename1989AskUkaz", "rename1989AskStatute"];

function rename1989Stops() {
  return Array.prototype.slice.call(
    document.querySelectorAll("#rename-1989-carousel .destalin-panel.is-stop")
  );
}

function syncRename1989Button() {
  var next = document.getElementById("rename-1989-next");
  var label = document.getElementById("rename-1989-next-label");
  var caption = document.getElementById("rename-1989-caption");
  var stops = rename1989Stops();
  if (!next || !stops.length) return;
  var askKey = RENAME1989_ASK_KEYS[rename1989Stop] || RENAME1989_ASK_KEYS[0];
  var capKey = RENAME1989_CAPTION_KEYS[rename1989Stop] || RENAME1989_CAPTION_KEYS[0];
  next.disabled = rename1989Animating;
  next.setAttribute("data-i18n-aria", askKey);
  if (caption) {
    caption.setAttribute("data-i18n", capKey);
    if (typeof t === "function") caption.textContent = t(capKey);
  }
  if (label) {
    label.setAttribute("data-i18n", askKey);
    if (typeof t === "function") label.textContent = t(askKey);
  }
  if (typeof t === "function") next.setAttribute("aria-label", t(askKey));
}

function applyRename1989(stopIndex, opts) {
  opts = opts || {};
  var enterCrop = !!opts.enterCrop;
  var animateCrop = !!opts.animateCrop;
  var stops = rename1989Stops();
  if (!stops.length) return;
  var index = Math.max(0, Math.min(stops.length - 1, stopIndex));
  if (rename1989CropRaf) {
    cancelAnimationFrame(rename1989CropRaf);
    rename1989CropRaf = 0;
  }
  stops.forEach(function (panel, i) {
    var current = i === index;
    panel.classList.toggle("is-current", current);
    panel.classList.toggle(
      "is-prev",
      rename1989PrevStop >= 0 && i === rename1989PrevStop && i !== index
    );
    var quote = panel.querySelector(".ukaz");
    if (!quote) return;
    if (!current) {
      setPageColumn(quote, false);
      return;
    }
    if (!enterCrop) return;
    if (animateCrop) {
      setPageColumn(quote, false);
      rename1989CropRaf = requestAnimationFrame(function () {
        rename1989CropRaf = requestAnimationFrame(function () {
          rename1989CropRaf = 0;
          if (rename1989Stop !== index || !panel.classList.contains("is-current")) return;
          setPageColumn(quote, true);
        });
      });
    } else {
      setPageColumn(quote, true);
    }
  });
  syncUkazAnnotVisibility();
}

function setRename1989Stop(stopIndex, animate) {
  var stops = rename1989Stops();
  if (!stops.length) return;
  var nextStop = Math.max(0, Math.min(stops.length - 1, stopIndex));
  var from = rename1989Stop;
  var changed = from !== nextStop;
  rename1989Stop = nextStop;
  var enterCrop = changed || !rename1989Ready;
  if (animate && changed) rename1989PrevStop = from;
  rename1989Animating = false;
  applyRename1989(rename1989Stop, {
    enterCrop: enterCrop,
    animateCrop: !!(animate && changed && !destalinReduced())
  });
  rename1989Ready = true;
  syncRename1989Button();
}

function layoutRename1989() {
  var track = document.getElementById("rename-1989-carousel");
  var next = document.getElementById("rename-1989-next");
  if (!track) return;
  if (next && !next.dataset.rename1989Bound) {
    next.dataset.rename1989Bound = "1";
    function advanceRename1989() {
      if (rename1989Animating) return;
      var stops = rename1989Stops();
      if (!stops.length) return;
      setRename1989Stop((rename1989Stop + 1) % stops.length, true);
    }
    next.addEventListener("click", advanceRename1989);
  }
  setRename1989Stop(rename1989Stop, false);
}

function syncRename1989() {
  if (!rename1989Animating) applyRename1989(rename1989Stop);
  syncRename1989Button();
}

layoutRename1989();
syncRename1989();
