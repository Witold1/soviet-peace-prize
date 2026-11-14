function syncPageZoom() {
  document.querySelectorAll(".ukaz-loupe.is-page").forEach(function (loupe) {
    var quote = loupe.closest(".ukaz");
    var column = loupe.classList.contains("is-column");
    if (quote) quote.classList.toggle("is-column", column);
    var side = loupe.querySelector(".ukaz-side");
    if (side) {
      side.setAttribute("aria-pressed", column ? "true" : "false");
      side.setAttribute("aria-label", t(column ? "decreePage" : "decreeSide"));
    }
    var zoom = quote && quote.querySelector(".ukaz-zoom-label");
    if (zoom) zoom.textContent = t("decreePage");
    var zoomButton = quote && quote.querySelector(".ukaz-zoom");
    if (zoomButton) zoomButton.setAttribute("aria-label", t("decreePage"));
  });
}

function relayoutDecree(quote, target) {
  if (!quote.closest("#decree-1949") || typeof layoutPress !== "function") return;
  var decree = document.getElementById("decree-1949");
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

var DESTALIN_ISSUES = [
  { iso: "1953-03-06", edition: "65 (12633)" },
  { iso: "1953-07-10", edition: "191 (12759)" },
  { iso: "1955-02-09", edition: "40 (13338)" },
  { iso: "1956-07-02", edition: "184 (13847)" },
  { iso: "1956-09-08", edition: "252 (13915)" }
];

// Start on the renaming decree; › then walks the earlier destalinization carousel.
var destalinStop = DESTALIN_ISSUES.length - 1;

// Stable page tilts — same order as stops — so the land doesn't snap upright.
var DESTALIN_TILTS = [-1.15, 0.9, -0.7, 1.05, -0.95];

function destalinReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function destalinStops() {
  return Array.prototype.slice.call(document.querySelectorAll("#destalin-carousel .destalin-panel.is-stop"));
}

function destalinIssueParts(iso) {
  if (typeof pressIssue === "function") return pressIssue(iso);
  var parts = iso.split("-");
  var year = +parts[0];
  var month = +parts[1];
  var day = +parts[2];
  var monthsRu = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  var monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var langCode = typeof lang === "string" ? lang : "en";
  if (langCode === "ru") {
    return {
      before: "Правда, ",
      date: day + " " + monthsRu[month - 1] + " " + year + " г."
    };
  }
  return {
    before: "Pravda, ",
    date: monthsEn[month - 1] + " " + day + ", " + year
  };
}

function destalinIssueBetween(fromStop, toStop, t) {
  var a = DESTALIN_ISSUES[fromStop] || DESTALIN_ISSUES[0];
  var b = DESTALIN_ISSUES[toStop] || a;
  if (t <= 0) return { iso: a.iso, edition: a.edition };
  if (t >= 1) return { iso: b.iso, edition: b.edition };
  var aMs = Date.parse(a.iso + "T12:00:00Z");
  var bMs = Date.parse(b.iso + "T12:00:00Z");
  var d = new Date(aMs + (bMs - aMs) * t);
  var iso =
    d.getUTCFullYear() +
    "-" +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getUTCDate()).padStart(2, "0");
  // Yearly issue no. resets; derive it from the calendar day, serial from the archival run.
  var yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  var n = Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - yearStart) / 86400000) + 1;
  var aEd = a.edition.match(/\((\d+)\)/);
  var bEd = b.edition.match(/\((\d+)\)/);
  var serial = aEd && bEd ? Math.round(+aEd[1] + (+bEd[1] - +aEd[1]) * t) : n;
  return { iso: iso, edition: n + " (" + serial + ")" };
}

function syncDestalinIssue(meta) {
  var el = document.getElementById("destalin-issue");
  meta = meta || DESTALIN_ISSUES[destalinStop] || DESTALIN_ISSUES[0];
  if (!el || !meta) return;
  var langCode = typeof lang === "string" ? lang : "en";
  if (
    el.dataset.iso === meta.iso &&
    el.dataset.edition === meta.edition &&
    el.dataset.lang === langCode
  ) {
    return;
  }
  el.dataset.iso = meta.iso;
  el.dataset.edition = meta.edition;
  el.dataset.lang = langCode;
  var parts = destalinIssueParts(meta.iso);
  var after = langCode === "ru" ? ", № " + meta.edition : ", no. " + meta.edition;
  el.textContent = "";
  el.appendChild(document.createTextNode(parts.before));
  var date = document.createElement("span");
  date.className = "press-issue-date";
  date.textContent = parts.date;
  el.appendChild(date);
  el.appendChild(document.createTextNode(after));
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

function applyDestalin(stopIndex) {
  var stops = destalinStops();
  if (!stops.length) return;
  var index = Math.max(0, Math.min(stops.length - 1, stopIndex));
  stops.forEach(function (panel, i) {
    panel.classList.toggle("is-current", i === index);
    panel.classList.toggle(
      "is-prev",
      destalinPrevStop >= 0 && i === destalinPrevStop && i !== index
    );
  });
  syncDestalinIssue();
}

function syncDestalinButton() {
  var next = document.getElementById("destalin-next");
  var label = document.getElementById("destalin-next-label");
  var stops = destalinStops();
  if (!next || !stops.length) return;
  // Prompt on the renaming stop; plain next while walking the history.
  var atRename = destalinStop === stops.length - 1;
  var key = atRename ? "destalinWhy" : "destalinNext";
  next.classList.toggle("is-why", atRename);
  next.disabled = destalinAnimating;
  next.setAttribute("data-i18n-aria", key);
  if (label) {
    label.setAttribute("data-i18n", "destalinWhy");
    if (typeof t === "function") label.textContent = t("destalinWhy");
  }
  if (typeof t === "function") {
    next.setAttribute("aria-label", t(key));
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
  destalinStop = nextStop;
  if (destalinRushRaf) {
    cancelAnimationFrame(destalinRushRaf);
    destalinRushRaf = 0;
  }
  if (!animate || destalinReduced() || from === nextStop) {
    clearDestalinRush(root);
    destalinAnimating = false;
    if (animate && from !== nextStop) destalinPrevStop = from;
    applyDestalin(destalinStop);
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
    applyDestalin(destalinStop);
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
  var lastIssueKey = "";
  syncDestalinIssue(destalinIssueBetween(from, nextStop, 0));

  function finish() {
    if (!destalinAnimating) return;
    destalinAnimating = false;
    destalinRushRaf = 0;
    destalinPrevStop = from;
    clearDestalinRush(root);
    applyDestalin(destalinStop);
    syncDestalinButton();
  }

  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    // Ease in-out cubic: slow on the current page, whip through the carousel, settle.
    var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    var x = fromX + (toX - fromX) * eased;
    strip.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
    var page = Math.round(eased * (DESTALIN_RUSH_COUNT - 1));
    var meta = destalinIssueBetween(from, nextStop, page / (DESTALIN_RUSH_COUNT - 1));
    var key = meta.iso + "|" + meta.edition;
    if (key !== lastIssueKey) {
      lastIssueKey = key;
      syncDestalinIssue(meta);
    }
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
    next.addEventListener("click", function () {
      if (destalinAnimating) return;
      var stops = destalinStops();
      if (!stops.length) return;
      setDestalinStop((destalinStop + 1) % stops.length, true);
    });
  }
  setDestalinStop(destalinStop, false);
}

function syncDestalin() {
  if (!destalinAnimating) applyDestalin(destalinStop);
  else syncDestalinIssue();
  syncDestalinButton();
}

layoutDestalin();
syncDestalin();
