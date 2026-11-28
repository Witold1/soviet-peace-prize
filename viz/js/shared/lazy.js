// Sequential script loader for below-the-fold viz stacks.

function loadScriptOnce(src) {
  return new Promise(function (resolve, reject) {
    var existing = document.querySelector('script[data-lazy-src="' + src + '"]');
    if (existing) {
      if (existing.dataset.lazyReady === "1") resolve();
      else existing.addEventListener("load", function () { resolve(); });
      existing.addEventListener("error", reject);
      return;
    }
    var script = document.createElement("script");
    script.src = src;
    script.dataset.lazySrc = src;
    script.onload = function () {
      script.dataset.lazyReady = "1";
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function loadScripts(srcs) {
  return srcs.reduce(function (chain, src) {
    return chain.then(function () { return loadScriptOnce(src); });
  }, Promise.resolve());
}

function watchNear(id, margin, onNear) {
  var el = document.getElementById(id);
  if (!el) return;
  var pad = margin == null ? 480 : margin;
  function check() {
    var rect = el.getBoundingClientRect();
    if (rect.bottom > -pad && rect.top < window.innerHeight + pad) {
      onNear();
      return true;
    }
    return false;
  }
  if (check()) return;
  if (!("IntersectionObserver" in window)) {
    var onScroll = function () {
      if (check()) window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      onNear();
      obs.disconnect();
    });
  }, { rootMargin: pad + "px" });
  obs.observe(el);
}

// Stub until map-sequence-narrow.js loads - keeps resize gating honest before lazy load.
function mapChartNarrow() {
  if (typeof mapSeqNarrow === "function") return mapSeqNarrow();
  var el = document.getElementById("map-seq-chart");
  if (!el) return false;
  if (el.clientWidth > 0) return el.clientWidth < 640;
  return document.documentElement.getAttribute("data-display") === "phone";
}

var mapLoadPromise = null;
function ensureMapLoaded() {
  if (typeof renderMapSequence === "function") return Promise.resolve();
  if (mapLoadPromise) return mapLoadPromise;
  mapLoadPromise = loadScripts([
    "js/data/land.js",
    "js/data/lakes.js",
    "sections/map/map-squares.js",
    "sections/map/map-sequence-narrow.js",
    "sections/map/map-sequence.js"
  ]).catch(function (err) {
    mapLoadPromise = null;
    throw err;
  });
  return mapLoadPromise;
}

function renderMap() {
  ensureMapLoaded().then(function () {
    if (typeof renderMapSequence === "function") renderMapSequence();
  });
}

var worldLoadPromise = null;
function ensureWorldParkLoaded() {
  if (typeof renderWorldPark === "function") return Promise.resolve();
  if (worldLoadPromise) return worldLoadPromise;
  worldLoadPromise = loadScripts([
    "sections/occupations/occupations-world.js",
    "sections/years/years-world.js"
  ]).catch(function (err) {
    worldLoadPromise = null;
    throw err;
  });
  return worldLoadPromise;
}

function renderWorldParkIfReady() {
  if (typeof renderWorldPark === "function") {
    renderWorldPark();
    return;
  }
  ensureWorldParkLoaded().then(function () {
    if (typeof renderWorldPark === "function") renderWorldPark();
  });
}

var chordLoadPromise = null;
function ensureOccChordLoaded() {
  if (typeof renderOccChord === "function") return Promise.resolve();
  if (chordLoadPromise) return chordLoadPromise;
  chordLoadPromise = loadScripts([
    "sections/occupations/occupations-chord.js"
  ]).catch(function (err) {
    chordLoadPromise = null;
    throw err;
  });
  return chordLoadPromise;
}

function bootLazySections() {
  watchNear("births", 600, function () { renderMap(); });
  watchNear("worlds", 600, function () { renderWorldParkIfReady(); });
  watchNear("occupation", 800, function () {
    ensureOccChordLoaded().then(function () {
      if (typeof renderOccChord === "function") renderOccChord();
    });
  });
}
