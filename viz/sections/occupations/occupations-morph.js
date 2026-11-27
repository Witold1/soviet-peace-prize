// Fig. 3 → 3a: keep the real cloud grid, FLIP hexes into the flower on sticky scroll.

var OCC_FLIP_MS = 1400;
var occTargetMorph = 0;
var occVisualMorph = 0;
var occMorphing = false;
var occFlipTimer = 0;
var occFlipArmTimer = 0;
// Until armed, scroll sync only snaps — never starts FLIP. Stops reload storms
// from stacking Fig. 3 + 3a mid-flight.
var occFlipArmed = false;
var OCC_SCROLL = { progress: 0, mode: "clouds" };

function occDisarmFlip(ms) {
  occFlipArmed = false;
  if (occFlipArmTimer) {
    window.clearTimeout(occFlipArmTimer);
    occFlipArmTimer = 0;
  }
  var delay = ms == null ? 120 : ms;
  occFlipArmTimer = window.setTimeout(function () {
    occFlipArmTimer = 0;
    occFlipArmed = true;
  }, delay);
}

function occStickyTop() {
  // Match CSS top on .occ-pin — never tie to live innerHeight (URL bar).
  return 16;
}

function occUseSticky() {
  if (typeof occCloudReduced === "function" && occCloudReduced()) return false;
  if (typeof occChartNarrow === "function" && occChartNarrow()) return false;
  if (typeof occSplitMode === "function" && occSplitMode() !== "occupation") return false;
  return true;
}

function occMorphGate() {
  // Fire while the pin is still the focus, not after a long empty runway.
  return 0.28;
}

function occScrollWantsChord(progress) {
  if (progress == null) progress = occScrollProgress();
  var gate = occMorphGate();
  // Match occDriveFromScroll hysteresis for the cold / post-render path
  // (target still at clouds → need the higher latch).
  if (occTargetMorph >= 0.5) return progress >= gate * 0.18;
  return progress >= gate * 0.82;
}

function layoutOccSticky() {
  var scrolly = document.getElementById("occ-scrolly");
  var steps = document.getElementById("occ-steps");
  if (!steps) return;
  var sticky = occUseSticky();
  steps.style.display = sticky ? "" : "none";
  if (scrolly) {
    scrolly.classList.toggle("is-sticky", sticky);
    if (!sticky) {
      scrolly.classList.remove("is-clouds", "is-chord", "is-flipping");
    }
  }
  if (!sticky) {
    var stage = document.getElementById("occ-stage");
    if (stage) stage.style.minHeight = "";
    occClearFlipStyles();
    return;
  }
  // Same turn as enabling sticky — a 0-height stage for even one frame
  // collapses the pin and yanks scroll on reload@3a.
  occSizeStage();
}

function occClearFlipStyles() {
  var clouds = document.getElementById("clouds");
  var chord = document.getElementById("occ-chord");
  if (clouds) {
    Array.prototype.forEach.call(clouds.querySelectorAll("polygon"), function (poly) {
      poly.style.opacity = "";
      poly.style.transition = "";
      poly.style.transform = "";
      poly.style.transformBox = "";
      poly.style.transformOrigin = "";
    });
  }
  if (chord) {
    Array.prototype.forEach.call(chord.querySelectorAll("polygon"), function (poly) {
      poly.style.opacity = "";
      poly.style.transition = "";
      poly.style.transform = "";
      poly.style.transformBox = "";
      poly.style.transformOrigin = "";
    });
    Array.prototype.forEach.call(
      chord.querySelectorAll(
        ".occ-compound-wash, .occ-compound-hull, .occ-compound-svg-label, .occ-compound-stems"
      ),
      function (el) {
        el.style.opacity = "";
        el.style.transition = "";
      }
    );
  }
  var note = document.getElementById("occ-chord-note");
  if (note) note.style.opacity = "";
}

function occSizeStage() {
  var stage = document.getElementById("occ-stage");
  var fig3 = document.getElementById("occ-fig3-block");
  var chord = document.getElementById("occ-chord-block");
  var pin = document.getElementById("occ-pin");
  if (!stage || !fig3 || !chord || !occUseSticky()) {
    if (stage) stage.style.minHeight = "";
    return;
  }
  // Lock to the taller view for the whole sticky session. Swapping
  // min-height between Fig. 3 and 3a mid-scroll changes pin height /
  // travel and the browser "compensates" with a jump opposite the scroll.
  var h = Math.max(fig3.offsetHeight, chord.offsetHeight, 1);
  var prev = parseFloat(stage.style.minHeight) || 0;
  if (Math.abs(prev - h) <= 1) return;

  // Only compensate when refining an existing lock. Anchoring across the
  // first 0→h lock fights sticky engagement and can invent a jump.
  var pinTop = prev > 0 && pin ? pin.getBoundingClientRect().top : null;
  stage.style.minHeight = h + "px";
  if (pinTop != null && pin) {
    var dy = pin.getBoundingClientRect().top - pinTop;
    if (Math.abs(dy) > 0.5) window.scrollBy(0, dy);
  }
}

function occMarkMap(root) {
  var map = {};
  if (!root) return map;
  Array.prototype.forEach.call(root.querySelectorAll("polygon[data-i]"), function (poly) {
    map[poly.dataset.i] = poly;
  });
  return map;
}

function occChromeNodes(chordRoot) {
  if (!chordRoot) return [];
  return Array.prototype.slice.call(
    chordRoot.querySelectorAll(
      ".occ-compound-wash, .occ-compound-hull, .occ-compound-svg-label, .occ-compound-stems"
    )
  );
}

function refreshOccMorphCopy() {
  var chord = occVisualMorph >= 0.5;
  var figNo = document.getElementById("occ-fig-no");
  var cap = document.getElementById("cap-occ");
  var source = document.getElementById("src-occ");
  if (figNo) {
    var nKey = chord ? "n3a" : "n3";
    figNo.setAttribute("data-i18n", nKey);
    figNo.textContent = t(nKey);
  }
  if (cap) {
    var cKey = chord ? "capOccChord" : "capOcc";
    cap.setAttribute("data-i18n", cKey);
    cap.textContent = t(cKey);
  }
  if (source && occUseSticky()) {
    var sKey = chord ? "srcOccChord" : "srcOcc";
    source.setAttribute("data-i18n", sKey);
    source.textContent = t(sKey);
  }
  OCC_SCROLL.mode = chord ? "chord" : "clouds";
}

function occSnapMorph(toChord) {
  var scrolly = document.getElementById("occ-scrolly");
  var fig3 = document.getElementById("occ-fig3-block");
  var chordBlock = document.getElementById("occ-chord-block");
  if (occFlipTimer) {
    window.clearTimeout(occFlipTimer);
    occFlipTimer = 0;
  }
  occMorphing = false;
  occVisualMorph = toChord ? 1 : 0;
  occTargetMorph = occVisualMorph;
  // Mode classes first — otherwise clearing inline opacity flashes Fig. 3
  // for a frame while is-flipping still leaves both layers paintable.
  if (scrolly) {
    scrolly.classList.toggle("is-clouds", !toChord);
    scrolly.classList.toggle("is-chord", !!toChord);
    scrolly.classList.remove("is-flipping");
  }
  if (fig3) {
    fig3.style.opacity = "";
    fig3.style.visibility = "";
    fig3.style.pointerEvents = "";
  }
  if (chordBlock) {
    chordBlock.style.opacity = "";
    chordBlock.style.visibility = "";
    chordBlock.style.pointerEvents = "";
  }
  occClearFlipStyles();
  occSizeStage();
  refreshOccMorphCopy();
}

function occPlayFlip(toChord) {
  var scrolly = document.getElementById("occ-scrolly");
  var clouds = document.getElementById("clouds");
  var chordHost = document.getElementById("occ-chord");
  var fig3 = document.getElementById("occ-fig3-block");
  var chordBlock = document.getElementById("occ-chord-block");
  if (!scrolly || !clouds || !chordHost || !fig3 || !chordBlock) {
    occSnapMorph(toChord);
    return;
  }

  if (occFlipTimer) {
    window.clearTimeout(occFlipTimer);
    occFlipTimer = 0;
  }

  occMorphing = true;

  // Measure first while the settled CSS hide is still on. Revealing the
  // destination before invert is applied flashes base Fig. 3 for a frame
  // (especially on the 3a → 3 reverse).
  var startMap = occMarkMap(clouds);
  var endMap = occMarkMap(chordHost);
  var flying = toChord ? endMap : startMap;
  var fromMap = toChord ? startMap : endMap;
  var pairs = [];

  Object.keys(flying).forEach(function (id) {
    var dest = flying[id];
    var src = fromMap[id];
    if (!dest || !src) return;
    var s = src.getBoundingClientRect();
    var e = dest.getBoundingClientRect();
    if (!e.width || !s.width) return;
    pairs.push({
      el: dest,
      dx: (s.left + s.width / 2) - (e.left + e.width / 2),
      dy: (s.top + s.height / 2) - (e.top + e.height / 2),
      scale: s.width / e.width
    });
  });

  var hideMap = toChord ? startMap : endMap;
  Object.keys(hideMap).forEach(function (id) {
    hideMap[id].style.opacity = "0";
    hideMap[id].style.transition = "none";
  });

  var chrome = occChromeNodes(chordHost);
  var note = document.getElementById("occ-chord-note");
  if (toChord) {
    chrome.forEach(function (el) {
      el.style.transition = "none";
      el.style.opacity = "0";
    });
    if (note) {
      note.style.transition = "none";
      note.style.opacity = "0";
    }
  } else {
    chrome.forEach(function (el) {
      el.style.transition = "none";
      el.style.opacity = "1";
    });
    if (note) {
      note.style.transition = "none";
      note.style.opacity = "1";
    }
  }

  pairs.forEach(function (p) {
    p.el.style.opacity = "1";
    p.el.style.transformBox = "fill-box";
    p.el.style.transformOrigin = "center";
    p.el.style.transition = "none";
    p.el.style.transform =
      "translate(" + p.dx.toFixed(1) + "px, " + p.dy.toFixed(1) + "px) scale(" + p.scale.toFixed(4) + ")";
  });

  // Invert is in place — now open the flight layer.
  void fig3.offsetWidth;
  scrolly.classList.add("is-flipping");
  occSizeStage();
  fig3.style.opacity = "1";
  chordBlock.style.opacity = "1";
  fig3.style.visibility = "visible";
  chordBlock.style.visibility = "visible";
  fig3.style.pointerEvents = "none";
  chordBlock.style.pointerEvents = "none";

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var ease = "transform " + (OCC_FLIP_MS / 1000).toFixed(2) + "s cubic-bezier(0.22, 1, 0.36, 1)";
      pairs.forEach(function (p) {
        p.el.style.transition = ease;
        p.el.style.transform = "translate(0px, 0px) scale(1)";
      });
      chrome.forEach(function (el) {
        el.style.transition = "opacity 0.7s ease " + (toChord ? "0.35s" : "0s");
        el.style.opacity = toChord ? "1" : "0";
      });
      if (note) {
        note.style.transition = "opacity 0.7s ease " + (toChord ? "0.4s" : "0s");
        note.style.opacity = toChord ? "1" : "0";
      }

      occVisualMorph = toChord ? 0.51 : 0.49;
      refreshOccMorphCopy();

      occFlipTimer = window.setTimeout(function () {
        occFlipTimer = 0;
        occSnapMorph(toChord);
        occResampleScroll();
      }, OCC_FLIP_MS + 80);
    });
  });
}

function occSetTargets(wantMorph) {
  var morph = wantMorph ? 1 : 0;

  if (!occUseSticky()) {
    occSnapMorph(false);
    return;
  }

  // Boot / reload settle: hard cut only. FLIP against unsettled press/hero
  // heights leaves both layers painted (rapid refresh ghost).
  if (!occFlipArmed || (typeof occCloudReduced === "function" && occCloudReduced())) {
    if (!occMorphing && morph === occTargetMorph && Math.abs(occVisualMorph - morph) < 0.001) {
      return;
    }
    occSnapMorph(!!wantMorph);
    return;
  }

  if (occMorphing) return;
  if (morph === occTargetMorph) return;

  if (Math.abs(occVisualMorph - morph) < 0.001) {
    occSnapMorph(!!wantMorph);
    return;
  }

  occTargetMorph = morph;
  occPlayFlip(!!wantMorph);
}

function occScrollProgress() {
  var scrolly = document.getElementById("occ-scrolly");
  var pin = document.getElementById("occ-pin");
  if (!scrolly || !pin || !occUseSticky()) return OCC_SCROLL.progress || 0;
  var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
  var top = occStickyTop();
  var passed = Math.min(travel, Math.max(0, top - scrolly.getBoundingClientRect().top));
  return travel > 0 ? passed / travel : 0;
}

function occStickyInView() {
  var scrolly = document.getElementById("occ-scrolly");
  var pin = document.getElementById("occ-pin");
  if (!scrolly || !pin || !occUseSticky()) return false;
  var top = occStickyTop();
  var rect = scrolly.getBoundingClientRect();
  return rect.top <= top + 1 && rect.bottom > top + 48;
}

// Keep Fig. 3 / 3a sticky progress across layout that changes height above
// (press runway, hero chart) — pixel scrollY alone jumps on reload.
function occScrollToProgress(progress) {
  var scrolly = document.getElementById("occ-scrolly");
  var pin = document.getElementById("occ-pin");
  if (!scrolly || !pin || !occUseSticky()) return;
  // progress 0 means "pin just stuck" — only valid while this scrolly is
  // already the scroll focus. Calling it from the top of the page scrolls
  // the whole document down to Fig. 3 (reload-away-from-occ bug).
  var rect = scrolly.getBoundingClientRect();
  var vh = window.innerHeight || 800;
  if (rect.bottom < -80 || rect.top > vh + 80) return;
  progress = Math.max(0, Math.min(1, Number(progress) || 0));
  var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
  OCC_SCROLL.progress = progress;
  if (travel <= 0) return;
  var desired = occStickyTop() - progress * travel;
  var dy = scrolly.getBoundingClientRect().top - desired;
  if (Math.abs(dy) > 0.5) window.scrollBy(0, dy);
}

var OCC_SCROLL_KEY = "laureates-occ-scroll";

function saveOccScrollAnchor() {
  try {
    if (!occStickyInView()) {
      sessionStorage.removeItem(OCC_SCROLL_KEY);
      return;
    }
    // Prefer the flip *target* — mid-flight visualMorph is a half-state and
    // rapid reloads were restoring into stacked Fig. 3 + 3a.
    var chord = occTargetMorph >= 0.5 || (occVisualMorph >= 0.5 && !occMorphing);
    sessionStorage.setItem(
      OCC_SCROLL_KEY,
      JSON.stringify({
        progress: occScrollProgress(),
        chord: chord ? 1 : 0
      })
    );
  } catch (err) {}
}

function restoreOccScrollAnchor() {
  var raw;
  try {
    raw = sessionStorage.getItem(OCC_SCROLL_KEY);
    sessionStorage.removeItem(OCC_SCROLL_KEY);
  } catch (err) {
    return false;
  }
  if (!raw || !occUseSticky()) return false;
  var data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return false;
  }
  var progress = typeof data.progress === "number" ? data.progress : parseFloat(data.progress);
  if (!(progress >= 0)) return false;

  layoutOccSticky();
  occSizeStage();
  // Bypass the in-view guard: we intentionally jump back into this scrolly.
  var scrolly = document.getElementById("occ-scrolly");
  var pin = document.getElementById("occ-pin");
  if (scrolly && pin) {
    var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
    if (travel > 0) {
      var desired = occStickyTop() - progress * travel;
      var dy = scrolly.getBoundingClientRect().top - desired;
      if (Math.abs(dy) > 0.5) window.scrollBy(0, dy);
    }
    OCC_SCROLL.progress = progress;
  }
  occSnapMorph(data.chord ? true : occScrollWantsChord(progress));
  occSizeStage();
  // Second pass after snap may change pin height.
  if (scrolly && pin) {
    var travel2 = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
    if (travel2 > 0) {
      var desired2 = occStickyTop() - progress * travel2;
      var dy2 = scrolly.getBoundingClientRect().top - desired2;
      if (Math.abs(dy2) > 0.5) window.scrollBy(0, dy2);
    }
    OCC_SCROLL.progress = progress;
  }
  return true;
}

function occResampleScroll() {
  if (!occUseSticky() || occMorphing) return;
  occDriveFromScroll(occScrollProgress());
}

function occDriveFromScroll(progress) {
  if (occMorphing) return;
  OCC_SCROLL.progress = progress;
  // Wide hysteresis once on 3a — tiny scroll jitter must not reverse-flip
  // and flash Fig. 3 for a beat (see occScrollWantsChord).
  occSetTargets(occScrollWantsChord(progress));
}

function syncOccupations() {
  var scrolly = document.getElementById("occ-scrolly");
  var pin = document.getElementById("occ-pin");
  if (!scrolly || !pin) return;
  if (occUseSticky()) {
    occSizeStage();
    occDriveFromScroll(occScrollProgress());
    return;
  }
  // Narrow / reduced: do not thrash polygon styles every scroll frame.
  if (
    scrolly.classList.contains("is-sticky") ||
    scrolly.classList.contains("is-chord") ||
    scrolly.classList.contains("is-flipping") ||
    occVisualMorph !== 0 ||
    occTargetMorph !== 0
  ) {
    occSnapMorph(false);
    var source = document.getElementById("src-occ");
    if (source) {
      source.setAttribute("data-i18n", "srcOcc");
      source.textContent = t("srcOcc");
    }
    var figNo = document.getElementById("occ-fig-no");
    var cap = document.getElementById("cap-occ");
    if (figNo) {
      figNo.setAttribute("data-i18n", "n3");
      figNo.textContent = t("n3");
    }
    if (cap) {
      cap.setAttribute("data-i18n", "capOcc");
      cap.textContent = t("capOcc");
    }
  }
}

function afterRenderOccMorph() {
  occDisarmFlip(180);

  if (!occUseSticky()) {
    layoutOccSticky();
    occSnapMorph(false);
    return;
  }

  // Sticky + min-height + mode snap in one sync turn — avoids a paint with
  // stage height 0 (pin collapses, scroll yanks) then a tall stage (flower
  // jumps). Also kills the Fig. 3 gold ghost over 3a on reload.
  // Prefer the pagehide anchor when present (pixel scrollY is wrong after
  // press/hero heights above this section change).
  if (typeof restoreOccScrollAnchor === "function" && restoreOccScrollAnchor()) {
    requestAnimationFrame(function () {
      occSizeStage();
    });
    return;
  }

  layoutOccSticky();
  occSizeStage();
  // Only re-anchor scroll when this section is already on screen. Otherwise
  // occScrollToProgress(0) yanks the page down to Fig. 3 on every reload.
  if (occStickyInView()) {
    var progress = occScrollProgress();
    occScrollToProgress(progress);
    occSnapMorph(occScrollWantsChord(progress));
    requestAnimationFrame(function () {
      if (!occStickyInView()) return;
      var keep = occScrollProgress();
      occSizeStage();
      occScrollToProgress(keep);
    });
    return;
  }

  occSnapMorph(false);
}
