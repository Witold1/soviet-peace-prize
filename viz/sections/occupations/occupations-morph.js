// Fig. 3 sticky: rain (Pravda lines) → clouds (3a) → chord (3b).
// Rain↔clouds crossfade; clouds↔chord hex FLIP; chord→rain via clouds.

var OCC_FLIP_MS = 2200;
var OCC_RAIN_FADE_MS = 780;
var OCC_STACK_PARK = 0.22;
var OCC_STACK_LERP = 0.14;
var OCC_SCROLL_KEY = "laureates-occ-scroll";
var OCC_CHROME_SEL = ".occ-compound-wash, .occ-compound-hull, .occ-compound-svg-label, .occ-compound-stems";

var occMorphing = false;
var occFlipArmed = false;
var occFlipTimer = 0;
var occRainFadeTimer = 0;
var occFlipArmTimer = 0;
var occStackRaf = 0;
var occStackLive = Object.create(null);
var occStageLockH = 0;
var occGatesCache = null;
var occScrubbing = false;
var occScrubLastUi = -1;
var occScrubBound = false;
var occScrollProgressCached = 0;
var occViewMode = "rain";
var occPendingMode = null;

function occDisarmFlip(ms) {
  occFlipArmed = false;
  if (occFlipArmTimer) {
    window.clearTimeout(occFlipArmTimer);
    occFlipArmTimer = 0;
  }
  occFlipArmTimer = window.setTimeout(function () {
    occFlipArmTimer = 0;
    occFlipArmed = true;
  }, ms == null ? 120 : ms);
}

function occStickyTop() {
  return 16; // match CSS .occ-pin top - never live innerHeight
}

function occUseSticky() {
  return !(
    (typeof occCloudReduced === "function" && occCloudReduced()) ||
    (typeof occChartNarrow === "function" && occChartNarrow())
  );
}

function occEl(id) {
  return document.getElementById(id);
}

function occAbortTimers() {
  if (occFlipTimer) {
    window.clearTimeout(occFlipTimer);
    occFlipTimer = 0;
  }
  if (occRainFadeTimer) {
    window.clearTimeout(occRainFadeTimer);
    occRainFadeTimer = 0;
  }
}

function occClearLayerInline(el) {
  if (!el) return;
  el.style.display = "";
  el.style.opacity = "";
  el.style.visibility = "";
  el.style.pointerEvents = "";
  el.style.transition = "";
}

function occRefreshGates() {
  var steps = document.querySelectorAll("#occ-steps .occ-step");
  var total = 0;
  var heights = [];
  Array.prototype.forEach.call(steps, function (step) {
    var h = step.offsetHeight || 0;
    heights.push(h);
    total += h;
  });
  if (total < 1 || heights.length < 5) {
    return (occGatesCache = { rain: 0.24, morph: 0.46, triple: 0.63, civic: 0.81 });
  }
  var acc = 0;
  var cuts = [];
  for (var i = 0; i < heights.length - 1; i++) {
    acc += heights[i];
    cuts.push(acc / total);
  }
  return (occGatesCache = {
    rain: cuts[0],
    morph: cuts[1],
    triple: cuts[2],
    civic: cuts[3]
  });
}

function occGates() {
  return occGatesCache || occRefreshGates();
}

function occBindScrub() {
  var scrub = occEl("occ-scrub");
  var input = occEl("occ-scrub-input");
  if (!scrub || !input) return;
  var sticky = occUseSticky();
  scrub.hidden = !sticky;
  if (!sticky) return;
  input.setAttribute("aria-label", t("occScrubAria"));
  var host = occEl("occ-scrub-marks");
  if (host) {
    var g = occRefreshGates();
    host.replaceChildren();
    [0, g.rain, g.morph, g.triple, g.civic, 1].forEach(function (mark) {
      var span = document.createElement("span");
      span.style.left = (Math.max(0, Math.min(1, mark)) * 100).toFixed(2) + "%";
      host.appendChild(span);
    });
  }
  if (occScrubBound) return;
  occScrubBound = true;

  function scrubTo(p) {
    p = Math.max(0, Math.min(1, p));
    scrub.style.setProperty("--occ-t", (p * 100).toFixed(2) + "%");
    occScrubLastUi = Math.round(p * 1000);
    occScrollToProgress(p);
    occDriveFromScroll(p);
  }

  input.addEventListener("input", function () {
    occScrubbing = true;
    scrub.classList.add("is-scrubbing");
    scrubTo(Number(input.value) / 1000);
  });
  function onEnd() {
    scrubTo(Number(input.value) / 1000);
    occScrubbing = false;
    scrub.classList.remove("is-scrubbing");
  }
  input.addEventListener("change", onEnd);
  input.addEventListener("pointerup", onEnd);
  input.addEventListener("keyup", onEnd);
}

function occUpdateScrubUi(progress) {
  var scrub = occEl("occ-scrub");
  var input = occEl("occ-scrub-input");
  if (!scrub && !input) return;
  progress = Math.max(0, Math.min(1, Number(progress) || 0));
  var pct = Math.round(progress * 1000);
  if (pct === occScrubLastUi && !occScrubbing) return;
  occScrubLastUi = pct;
  if (scrub) scrub.style.setProperty("--occ-t", (progress * 100).toFixed(2) + "%");
  if (input && !occScrubbing) input.value = String(pct);
}

// Absolute stage from progress - for scrub seek (no hysteresis).
function occModeAtProgress(progress) {
  var g = occGates();
  progress = Math.max(0, Math.min(1, Number(progress) || 0));
  if (progress < g.rain) return "rain";
  if (progress < g.morph) return "clouds";
  return "chord";
}

// Scroll hysteresis - stops tiny wheel jitter from bouncing rain↔clouds↔chord.
function occScrollMode(progress) {
  if (progress == null) progress = occScrollProgress();
  var g = occGates();
  var rainGate = g.rain;
  var chordGate = g.morph;
  var mode = occViewMode || "rain";

  if (mode === "chord") {
    if (progress < chordGate * 0.72) {
      return progress < rainGate * 0.55 ? "rain" : "clouds";
    }
    return "chord";
  }
  if (mode === "clouds") {
    if (progress >= chordGate * 0.92) return "chord";
    if (progress < rainGate * 0.55) return "rain";
    return "clouds";
  }
  if (progress >= chordGate * 0.92) return "chord";
  if (progress >= rainGate * 0.92) return "clouds";
  return "rain";
}

function occScrollWantsChord(progress) {
  return occScrollMode(progress) === "chord";
}

var occNarrowActiveStep = null;
var occNarrowStoryBound = false;
var OCC_NARROW_CHORD_STEPS = ["3", "4", "5"];

function occAllSlips() {
  var pin = occEl("occ-pin");
  if (!pin) return [];
  return Array.prototype.slice.call(pin.querySelectorAll(".occ-slip[data-step]"));
}

function occNarrowChordStep() {
  if (OCC_NARROW_CHORD_STEPS.indexOf(occNarrowActiveStep) !== -1) return occNarrowActiveStep;
  return "3";
}

function occClearSlipInline() {
  occAllSlips().forEach(function (slip) {
    slip.style.transform = "";
    slip.style.opacity = "";
    slip.style.willChange = "";
    slip.classList.remove("is-live");
  });
}

function occNarrowToggleLabel(hidden) {
  var key = hidden ? "occStackShow" : "occStackHide";
  return typeof t === "function" ? t(key) : (hidden ? "(show)" : "(hide)");
}

function occSyncNarrowToggle(frame) {
  if (!frame) return;
  var btn = frame.querySelector(".occ-narrow-toggle");
  if (!btn) return;
  var hidden = frame.classList.contains("is-stacks-hidden");
  var key = hidden ? "occStackShow" : "occStackHide";
  btn.textContent = occNarrowToggleLabel(hidden);
  btn.setAttribute("data-i18n", key);
  btn.setAttribute("aria-pressed", hidden ? "true" : "false");
}

function occEnsureNarrowToggle(host, frame) {
  if (!host || !frame) return null;
  var btn = host.querySelector(".occ-narrow-toggle");
  if (!btn) {
    // May already sit inside a slip after a previous park.
    btn = frame.querySelector(".occ-narrow-toggle");
  }
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "occ-narrow-toggle";
  }
  var hidden = frame.classList.contains("is-stacks-hidden");
  if (hidden) {
    if (btn.parentNode !== host) host.appendChild(btn);
  } else {
    var live = host.querySelector(".occ-slip.is-live") || host.querySelector(".occ-slip");
    if (live) live.appendChild(btn);
    else host.appendChild(btn);
  }
  occSyncNarrowToggle(frame);
  return btn;
}

function occNarrowHostFor(chart) {
  if (!chart) return null;
  var frame = chart.parentNode;
  if (!frame || !frame.classList || !frame.classList.contains("occ-narrow-frame")) {
    var parent = chart.parentNode;
    if (!parent) return null;
    frame = document.createElement("div");
    frame.className = "occ-narrow-frame";
    parent.insertBefore(frame, chart);
    frame.appendChild(chart);
  }
  var host = frame.querySelector(".occ-narrow-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "occ-narrow-host";
    frame.appendChild(host);
  }
  return host;
}

function occParkSlipsSticky() {
  var comments = occEl("occ-comments");
  if (!comments) return;
  occAllSlips()
    .sort(function (a, b) {
      return (Number(a.getAttribute("data-step")) || 0) - (Number(b.getAttribute("data-step")) || 0);
    })
    .forEach(function (slip) {
      comments.appendChild(slip);
      slip.removeAttribute("role");
      slip.removeAttribute("tabindex");
      slip.removeAttribute("aria-pressed");
    });
}

function occParkSlipsNarrow() {
  var slips = Object.create(null);
  occAllSlips().forEach(function (slip) {
    slips[slip.getAttribute("data-step") || ""] = slip;
  });
  var rainHost = occNarrowHostFor(occEl("occ-rain"));
  var cloudHost = occNarrowHostFor(occEl("clouds"));
  var chordHost = occNarrowHostFor(occEl("occ-chord"));
  if (rainHost && slips["1"]) rainHost.appendChild(slips["1"]);
  if (cloudHost && slips["2"]) cloudHost.appendChild(slips["2"]);
  if (chordHost) {
    ["3", "4", "5"].forEach(function (step) {
      if (slips[step]) chordHost.appendChild(slips[step]);
    });
  }
  [rainHost, cloudHost, chordHost].forEach(function (host) {
    if (!host || !host.parentNode) return;
    occEnsureNarrowToggle(host, host.parentNode);
  });
}

function occPaintNarrowChordStory() {
  if (typeof occChordSetStory !== "function") return;
  var step = occNarrowChordStep();
  var story = null;
  if (step === "5") story = "civic";
  else if (step === "4") story = "triples";
  occChordSetStory(story);
}

function occSyncNarrowSlipChrome() {
  var chordStep = occNarrowChordStep();
  occAllSlips().forEach(function (slip) {
    var step = slip.getAttribute("data-step");
    var isChord = OCC_NARROW_CHORD_STEPS.indexOf(step) !== -1;
    var on = isChord ? step === chordStep : step === occNarrowActiveStep;
    slip.classList.toggle("is-live", on);
    slip.setAttribute("role", "button");
    slip.setAttribute("tabindex", on || !isChord ? "0" : "-1");
    slip.setAttribute("aria-pressed", on ? "true" : "false");
  });
  Array.prototype.forEach.call(document.querySelectorAll(".occ-narrow-frame"), function (frame) {
    var host = frame.querySelector(".occ-narrow-host");
    if (host) occEnsureNarrowToggle(host, frame);
  });
  occPaintNarrowChordStory();
}

function occAdvanceNarrowChord() {
  var cur = occNarrowChordStep();
  var i = OCC_NARROW_CHORD_STEPS.indexOf(cur);
  occNarrowActiveStep = OCC_NARROW_CHORD_STEPS[(i + 1) % OCC_NARROW_CHORD_STEPS.length];
  occSyncNarrowSlipChrome();
}

function occSetNarrowStep(step) {
  if (!step) return;
  if (OCC_NARROW_CHORD_STEPS.indexOf(step) !== -1) {
    occAdvanceNarrowChord();
    return;
  }
  occNarrowActiveStep = occNarrowActiveStep === step ? null : step;
  occSyncNarrowSlipChrome();
}

function occNarrowStoryClick(e) {
  if (occUseSticky()) return;
  var toggle = e.target.closest ? e.target.closest(".occ-narrow-toggle") : null;
  if (toggle) {
    var frame = toggle.closest(".occ-narrow-frame");
    if (!frame) return;
    var hide = !frame.classList.contains("is-stacks-hidden");
    frame.classList.toggle("is-stacks-hidden", hide);
    var host = frame.querySelector(".occ-narrow-host");
    if (host) occEnsureNarrowToggle(host, frame);
    else occSyncNarrowToggle(frame);
    // Keep Fig. 3b story highlights while the stack is tucked away.
    return;
  }
  if (e.target.closest && e.target.closest(".fn-ref, button, a")) return;
  var slip = e.target.closest ? e.target.closest(".occ-slip[data-step]") : null;
  if (!slip) return;
  occSetNarrowStep(slip.getAttribute("data-step"));
}

function occNarrowStoryKey(e) {
  if (occUseSticky()) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  var slip = e.target.closest ? e.target.closest(".occ-slip[data-step]") : null;
  if (!slip) return;
  e.preventDefault();
  occSetNarrowStep(slip.getAttribute("data-step"));
}

function occBindNarrowStory() {
  var pin = occEl("occ-pin");
  if (!pin) return;
  if (occUseSticky()) {
    occNarrowActiveStep = null;
    occParkSlipsSticky();
    if (typeof occChordSetStory === "function") occChordSetStory(null);
    return;
  }
  occParkSlipsNarrow();
  if (!occNarrowStoryBound) {
    pin.addEventListener("click", occNarrowStoryClick);
    pin.addEventListener("keydown", occNarrowStoryKey);
    occNarrowStoryBound = true;
  }
  occSyncNarrowSlipChrome();
}

function layoutOccSticky() {
  var scrolly = occEl("occ-scrolly");
  var steps = occEl("occ-steps");
  if (!steps) return;
  var sticky = occUseSticky();
  steps.style.display = sticky ? "" : "none";
  if (scrolly) {
    scrolly.classList.toggle("is-sticky", sticky);
    if (!sticky) {
      scrolly.classList.remove("is-rain", "is-clouds", "is-chord", "is-flipping", "is-rain-fading");
    }
  }
  if (!sticky) {
    var stage = occEl("occ-stage");
    if (stage) stage.style.minHeight = "";
    if (occStackRaf) {
      window.cancelAnimationFrame(occStackRaf);
      occStackRaf = 0;
    }
    occStackLive = Object.create(null);
    occAbortTimers();
    occPendingMode = null;
    occMorphing = false;
    occClearFlipStyles();
    occClearSlipInline();
    var scrubOff = occEl("occ-scrub");
    if (scrubOff) scrubOff.hidden = true;
    if (typeof ensureOccRain === "function") ensureOccRain();
    if (typeof syncOccRainMotion === "function") syncOccRainMotion(true);
    occBindNarrowStory();
    return;
  }
  occBindNarrowStory();
  if (typeof ensureOccRain === "function") ensureOccRain();
  occRefreshGates();
  occBindScrub();
  occSizeStage();
}

function occClearFlipStyles() {
  var clouds = occEl("clouds");
  var chord = occEl("occ-chord");
  var keepEntrance = typeof occCloudEntering !== "undefined" && occCloudEntering;
  var clearPoly = typeof occClearPolyMotion === "function"
    ? occClearPolyMotion
    : function (poly) {
      poly.style.opacity = "";
      poly.style.transition = "";
      poly.style.transform = "";
      poly.style.transformBox = "";
      poly.style.transformOrigin = "";
    };
  if (clouds && !keepEntrance) {
    Array.prototype.forEach.call(clouds.querySelectorAll("polygon"), clearPoly);
  }
  if (chord) {
    Array.prototype.forEach.call(chord.querySelectorAll("polygon"), clearPoly);
    Array.prototype.forEach.call(chord.querySelectorAll(OCC_CHROME_SEL), function (el) {
      el.style.opacity = "";
      el.style.transition = "";
    });
  }
  var note = occEl("occ-chord-note");
  if (note) note.style.opacity = "";
}

function occLayerNaturalHeight(el) {
  if (!el) return 0;
  var inner = el.firstElementChild;
  if (!inner) return el.scrollHeight || el.offsetHeight || 0;
  var top = Infinity;
  var bot = -Infinity;
  Array.prototype.forEach.call(el.children, function (child) {
    if (child.id === "occ-comments") return;
    var h = child.offsetHeight || 0;
    if (!h) return;
    top = Math.min(top, child.offsetTop);
    bot = Math.max(bot, child.offsetTop + h);
  });
  if (!(bot > top)) return inner.offsetHeight || el.scrollHeight || 0;
  return bot - top;
}

function clearOccCloudFit() {
  var clouds = occEl("clouds");
  if (!clouds) return;
  clouds.style.transform = "";
  clouds.style.transformOrigin = "";
}

function fitOccCloudsToStage() {
  var stage = occEl("occ-stage");
  var clouds = occEl("clouds");
  if (!stage || !clouds || !occUseSticky()) {
    clearOccCloudFit();
    return;
  }
  clearOccCloudFit();
  var naturalH = clouds.offsetHeight || 0;
  var naturalW = clouds.offsetWidth || 0;
  if (naturalH < 8 || naturalW < 8) return;
  var scale = Math.min(
    (stage.clientWidth || naturalW) / naturalW,
    ((stage.clientHeight || occStageLockH || naturalH) * 0.98) / naturalH
  );
  if (!(scale > 0) || !isFinite(scale)) return;
  clouds.style.transformOrigin = "top center";
  clouds.style.transform = "scale(" + scale.toFixed(4) + ")";
}

function fitOccRainNarrow() {
  var rain = occEl("occ-rain");
  var clouds = occEl("clouds");
  if (!rain) return;
  if (occUseSticky() || !clouds) {
    rain.style.height = "";
    return;
  }
  var h = Math.round(clouds.getBoundingClientRect().height || clouds.offsetHeight || 0);
  if (h < 8) {
    rain.style.height = "";
    return;
  }
  if (Math.abs((parseFloat(rain.style.height) || 0) - h) <= 1) return;
  rain.style.height = h + "px";
}

function occSizeStage() {
  var stage = occEl("occ-stage");
  var rain = occEl("occ-rain-block");
  var fig3 = occEl("occ-fig3-block");
  var chord = occEl("occ-chord-block");
  var pin = occEl("occ-pin");
  if (!stage || !fig3 || !chord || !occUseSticky()) {
    occStageLockH = 0;
    clearOccCloudFit();
    if (stage) {
      stage.style.minHeight = "";
      stage.style.height = "";
    }
    fitOccRainNarrow();
    return;
  }
  clearOccCloudFit();
  var rainHost = occEl("occ-rain");
  if (rainHost) rainHost.style.height = "";
  var h = Math.max(
    occLayerNaturalHeight(rain),
    occLayerNaturalHeight(fig3),
    occLayerNaturalHeight(chord),
    1
  );
  if (occStageLockH > 0) h = Math.max(h, occStageLockH);
  var prev = parseFloat(stage.style.height) || parseFloat(stage.style.minHeight) || 0;
  if (Math.abs(prev - h) <= 1) {
    occStageLockH = Math.max(occStageLockH, prev);
    fitOccCloudsToStage();
    return;
  }
  var pinTop = prev > 0 && pin ? pin.getBoundingClientRect().top : null;
  occStageLockH = h;
  stage.style.minHeight = h + "px";
  stage.style.height = h + "px";
  fitOccCloudsToStage();
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

function occPolyCenter(el) {
  var r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

// CSS translate px on SVG marks ≠ screen px (viewBox + parent #clouds scale).
function occCssDeltaForScreen(el, dxScreen, dyScreen) {
  el.style.transition = "none";
  el.style.transformBox = "fill-box";
  el.style.transformOrigin = "center";
  el.style.transform = "translate(0px, 0px)";
  var a = occPolyCenter(el);
  el.style.transform = "translate(40px, 0px)";
  var b = occPolyCenter(el);
  el.style.transform = "translate(0px, 0px)";
  var moved = b.x - a.x;
  var k = Math.abs(moved) > 0.01 ? 40 / moved : 1;
  return { x: dxScreen * k, y: dyScreen * k };
}

function occSmootherStep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function occStackTick(progress) {
  var g = occGates();
  progress = Math.max(0, Math.min(1, Number(progress) || 0));
  if (progress <= g.rain) return progress / Math.max(g.rain, 1e-6);
  if (progress <= g.morph) return 1 + (progress - g.rain) / Math.max(g.morph - g.rain, 1e-6);
  if (progress <= g.triple) return 2 + (progress - g.morph) / Math.max(g.triple - g.morph, 1e-6);
  if (progress <= g.civic) return 3 + (progress - g.triple) / Math.max(g.civic - g.triple, 1e-6);
  return 4 + (progress - g.civic) / Math.max(1 - g.civic, 1e-6) * 1.35;
}

function occSlipLocal(p, n) {
  if (n <= 1) return p;
  return OCC_STACK_PARK + (p - (n - 1)) * (1 - OCC_STACK_PARK);
}

function occSlipOffsetY(t, stageH, slipH) {
  var yEnter = stageH + 8;
  var yPark = Math.max(0, (stageH - slipH) * 0.5);
  var yExit = -(slipH + 16);
  if (t <= 0.42) return yEnter + occSmootherStep(t / 0.42) * (yPark - yEnter);
  if (t >= 0.62) return yPark + occSmootherStep((t - 0.62) / 0.38) * (yExit - yPark);
  return yPark;
}

function occSlipOpacity(t) {
  if (t <= 0.28) return occSmootherStep(t / 0.28);
  if (t >= 0.78) return occSmootherStep((1 - t) / 0.22);
  return 1;
}

function occStackApplySlip(slip, y, opacity, live) {
  slip.style.transform = "translate3d(-50%," + y.toFixed(2) + "px,0)";
  slip.style.opacity = opacity.toFixed(3);
  slip.classList.toggle("is-live", live);
}

function occStackTickRaf() {
  occStackRaf = 0;
  if (!occUseSticky()) return;
  var comments = occEl("occ-comments");
  if (!comments) return;
  var settling = false;
  Array.prototype.forEach.call(comments.querySelectorAll(".occ-slip[data-step]"), function (slip) {
    var live = occStackLive[slip.getAttribute("data-step") || "1"];
    if (!live) return;
    var dy = live.ty - live.y;
    var dOp = live.to - live.o;
    if (Math.abs(dy) > 0.35 || Math.abs(dOp) > 0.008) {
      live.y += dy * OCC_STACK_LERP;
      live.o += dOp * OCC_STACK_LERP;
      settling = true;
    } else {
      live.y = live.ty;
      live.o = live.to;
    }
    occStackApplySlip(slip, live.y, live.o, live.o > 0.15 && live.local >= 0 && live.local <= 1);
  });
  if (settling) occStackRaf = window.requestAnimationFrame(occStackTickRaf);
}

function paintOccStacks(progress) {
  var comments = occEl("occ-comments");
  var stage = occEl("occ-stage");
  if (!comments || !stage || !occUseSticky()) return;
  var slips = comments.querySelectorAll(".occ-slip[data-step]");
  if (!slips.length) return;
  var stageH = stage.clientHeight || stage.offsetHeight || 360;
  var p = occStackTick(progress == null ? occScrollProgressCached : progress);

  Array.prototype.forEach.call(slips, function (slip) {
    var n = Number(slip.getAttribute("data-step")) || 1;
    var key = String(n);
    var local = occSlipLocal(p, n);
    var h = slip.offsetHeight || 44;
    var y;
    var opacity;
    if (local < 0) {
      y = stageH + 12;
      opacity = 0;
    } else if (local > 1) {
      y = -(h + 16);
      opacity = 0;
    } else {
      y = occSlipOffsetY(local, stageH, h);
      opacity = occSlipOpacity(local);
    }
    var live = occStackLive[key];
    if (!live) {
      occStackLive[key] = { y: y, o: opacity, ty: y, to: opacity, local: local };
      occStackApplySlip(slip, y, opacity, opacity > 0.15 && local >= 0 && local <= 1);
      return;
    }
    live.ty = y;
    live.to = opacity;
    live.local = local;
  });
  if (!occStackRaf) occStackRaf = window.requestAnimationFrame(occStackTickRaf);
}

function refreshOccMorphCopy() {
  var mode = occViewMode || "clouds";
  var figNo = occEl("occ-fig-no");
  var cap = occEl("cap-occ");
  var source = occEl("src-occ");
  var nKey = mode === "chord" ? "n3b" : mode === "clouds" ? "n3a" : "n3";
  var cKey = mode === "chord" ? "capOccChord" : mode === "rain" ? "capOccRain" : "capOcc";
  var sKey = mode === "chord" ? "srcOccChord" : mode === "rain" ? "srcOccRain" : "srcOcc";
  if (figNo) {
    figNo.setAttribute("data-i18n", nKey);
    figNo.textContent = t(nKey);
  }
  if (cap) {
    cap.setAttribute("data-i18n", cKey);
    cap.textContent = t(cKey);
  }
  if (source && occUseSticky()) {
    source.setAttribute("data-i18n", sKey);
    source.textContent = t(sKey);
  }
  paintOccStacks(occScrollProgressCached);
}

function occApplyModeClasses(mode) {
  var scrolly = occEl("occ-scrolly");
  if (!scrolly) return;
  scrolly.classList.toggle("is-rain", mode === "rain");
  scrolly.classList.toggle("is-clouds", mode === "clouds");
  scrolly.classList.toggle("is-chord", mode === "chord");
  scrolly.classList.remove("is-flipping");
}

function occClearRainFadeStyles() {
  var scrolly = occEl("occ-scrolly");
  var rainBlock = occEl("occ-rain-block");
  var fig3 = occEl("occ-fig3-block");
  var legend = occEl("occ-legend");
  if (scrolly) scrolly.classList.remove("is-rain-fading");
  occClearLayerInline(rainBlock);
  occClearLayerInline(fig3);
  if (legend) {
    legend.style.opacity = "";
    legend.style.visibility = "";
    legend.style.transition = "";
    legend.style.pointerEvents = "";
  }
}

function occSnapMode(mode) {
  if (mode !== "rain" && mode !== "clouds" && mode !== "chord") mode = "clouds";
  var rainBlock = occEl("occ-rain-block");
  var fig3 = occEl("occ-fig3-block");
  var chordBlock = occEl("occ-chord-block");
  occAbortTimers();
  occMorphing = false;
  occViewMode = mode;
  // Classes before clearing inline - avoids a one-frame flash of both layers.
  occApplyModeClasses(mode);
  occClearRainFadeStyles();
  occClearLayerInline(rainBlock);
  occClearLayerInline(fig3);
  occClearLayerInline(chordBlock);
  occClearFlipStyles();
  if (typeof ensureOccRain === "function") ensureOccRain();
  if (typeof syncOccRainMotion === "function") syncOccRainMotion(mode === "rain");
  if (!(typeof occCloudEntering !== "undefined" && occCloudEntering)) occSizeStage();
  refreshOccMorphCopy();
  if (typeof occChordSetStory === "function") {
    if (occUseSticky()) {
      occChordSetStory(mode === "chord" ? occChordStoryForProgress(occScrollProgressCached) : null);
    } else {
      occPaintNarrowChordStory();
    }
  }
  if (
    mode === "clouds" &&
    typeof playOccCloudEntrance === "function" &&
    typeof occCloudSeen !== "undefined" &&
    !occCloudSeen
  ) {
    playOccCloudEntrance();
  }

  var pending = occPendingMode;
  occPendingMode = null;
  if (pending && pending !== mode && occUseSticky() && occFlipArmed) {
    requestAnimationFrame(function () {
      if (!occMorphing && occUseSticky()) occSetMode(pending);
    });
  }
}

function occPlayRainCrossfade(toClouds) {
  var scrolly = occEl("occ-scrolly");
  var rainBlock = occEl("occ-rain-block");
  var fig3 = occEl("occ-fig3-block");
  var chordBlock = occEl("occ-chord-block");
  var legend = occEl("occ-legend");
  if (!scrolly || !rainBlock || !fig3) {
    occSnapMode(toClouds ? "clouds" : "rain");
    return;
  }
  if (scrolly.classList.contains("is-chord") && !scrolly.classList.contains("is-flipping")) {
    occPendingMode = toClouds ? "clouds" : "rain";
    occPlayFlip(false);
    return;
  }

  occAbortTimers();
  var landFlock =
    toClouds &&
    typeof playOccCloudEntrance === "function" &&
    !(typeof occCloudReduced === "function" && occCloudReduced());

  occMorphing = true;
  occViewMode = toClouds ? "clouds" : "rain";
  refreshOccMorphCopy();

  if (chordBlock) {
    chordBlock.style.opacity = "0";
    chordBlock.style.visibility = "hidden";
    chordBlock.style.pointerEvents = "none";
  }

  rainBlock.style.transition = "none";
  fig3.style.transition = "none";
  rainBlock.style.pointerEvents = "none";
  fig3.style.pointerEvents = "none";

  if (landFlock) {
    fig3.style.visibility = "hidden";
    fig3.style.opacity = "0";
  }

  scrolly.classList.add("is-rain-fading");
  scrolly.classList.toggle("is-rain", !toClouds);
  scrolly.classList.toggle("is-clouds", toClouds);
  scrolly.classList.remove("is-chord", "is-flipping");

  if (typeof syncOccRainMotion === "function") syncOccRainMotion(true);
  occSizeStage();

  if (landFlock && typeof armOccCloudEntrance === "function") {
    fig3.style.visibility = "visible";
    armOccCloudEntrance();
    fig3.style.opacity = "1";
    rainBlock.style.visibility = "visible";
    rainBlock.style.opacity = "1";
  } else {
    rainBlock.style.visibility = "visible";
    fig3.style.visibility = "visible";
    rainBlock.style.opacity = toClouds ? "1" : "0";
    fig3.style.opacity = toClouds ? "0" : "1";
  }

  if (legend) {
    legend.style.transition = "none";
    legend.style.visibility = "visible";
    legend.style.pointerEvents = "none";
    legend.style.opacity = toClouds ? "0" : "1";
  }

  void rainBlock.offsetWidth;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var fade = "opacity " + (OCC_RAIN_FADE_MS / 1000).toFixed(2) + "s ease";
      rainBlock.style.transition = fade;
      fig3.style.transition = landFlock ? "none" : fade;
      rainBlock.style.opacity = toClouds ? "0" : "1";
      if (!landFlock) fig3.style.opacity = toClouds ? "1" : "0";
      if (legend) {
        legend.style.transition = "opacity 0.45s ease " + (toClouds ? "0.18s" : "0s");
        legend.style.opacity = toClouds ? "1" : "0";
      }
      if (landFlock) playOccCloudEntrance(true, true);
      occRainFadeTimer = window.setTimeout(function () {
        occRainFadeTimer = 0;
        if (typeof syncOccRainMotion === "function") syncOccRainMotion(!toClouds);
        occSnapMode(toClouds ? "clouds" : "rain");
      }, OCC_RAIN_FADE_MS + 50);
    });
  });
}

function occPlayFlip(toChord) {
  var scrolly = occEl("occ-scrolly");
  var clouds = occEl("clouds");
  var chordHost = occEl("occ-chord");
  var fig3 = occEl("occ-fig3-block");
  var chordBlock = occEl("occ-chord-block");
  var rainBlock = occEl("occ-rain-block");
  if (!scrolly || !clouds || !chordHost || !fig3 || !chordBlock) {
    occSnapMode(toChord ? "chord" : "clouds");
    return;
  }

  occAbortTimers();
  occClearRainFadeStyles();
  if (typeof syncOccRainMotion === "function") syncOccRainMotion(false);
  if (rainBlock) {
    rainBlock.style.display = "none";
    rainBlock.style.opacity = "0";
    rainBlock.style.visibility = "hidden";
    rainBlock.style.pointerEvents = "none";
  }
  if (typeof occCloudSettleMarks === "function") occCloudSettleMarks();
  if (typeof occCloudSeen !== "undefined") occCloudSeen = true;

  occMorphing = true;
  occViewMode = toChord ? "chord" : "clouds";

  fig3.style.opacity = "1";
  chordBlock.style.opacity = "1";
  fig3.style.visibility = "visible";
  chordBlock.style.visibility = "visible";
  fig3.style.pointerEvents = "none";
  chordBlock.style.pointerEvents = "none";
  scrolly.classList.add("is-flipping");
  scrolly.classList.toggle("is-clouds", !toChord);
  scrolly.classList.toggle("is-chord", toChord);
  scrolly.classList.remove("is-rain", "is-rain-fading");
  occSizeStage();
  void fig3.offsetWidth;
  void chordBlock.offsetWidth;

  var cloudMap = occMarkMap(clouds);
  var chordMap = occMarkMap(chordHost);
  var flyingMap = toChord ? chordMap : cloudMap;
  var fromMap = toChord ? cloudMap : chordMap;
  var pairs = [];

  Object.keys(flyingMap).forEach(function (id) {
    var el = flyingMap[id];
    var src = fromMap[id];
    if (!el || !src) return;
    var from = occPolyCenter(src);
    var to = occPolyCenter(el);
    if (!from.w || !to.w) return;
    var screenDx = from.x - to.x;
    var screenDy = from.y - to.y;
    var local = occCssDeltaForScreen(el, screenDx, screenDy);
    pairs.push({
      el: el,
      dx: local.x,
      dy: local.y,
      screenDist: Math.hypot(screenDx, screenDy),
      scale: from.w / to.w
    });
  });

  if (!pairs.length) {
    occSnapMode(toChord ? "chord" : "clouds");
    return;
  }

  Object.keys(fromMap).forEach(function (id) {
    fromMap[id].style.opacity = "0";
    fromMap[id].style.transition = "none";
  });

  var chrome = Array.prototype.slice.call(chordHost.querySelectorAll(OCC_CHROME_SEL));
  var note = occEl("occ-chord-note");
  chrome.forEach(function (el) {
    el.style.transition = "none";
    el.style.opacity = toChord ? "0" : "1";
  });
  if (note) {
    note.style.transition = "none";
    note.style.opacity = toChord ? "0" : "1";
  }

  pairs.forEach(function (p) {
    p.el.style.opacity = "1";
    p.el.style.transformBox = "fill-box";
    p.el.style.transformOrigin = "center";
    p.el.style.transition = "none";
    p.el.style.transform =
      "translate(" + p.dx.toFixed(2) + "px, " + p.dy.toFixed(2) + "px) scale(" +
      p.scale.toFixed(4) + ")";
  });

  void fig3.offsetWidth;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var ease = "cubic-bezier(0.4, 0.0, 0.2, 1)";
      var maxDist = 0;
      pairs.forEach(function (p) {
        maxDist = Math.max(maxDist, p.screenDist);
      });
      var maxStagger = 0.42;
      var dur = (OCC_FLIP_MS / 1000).toFixed(2) + "s";
      pairs.forEach(function (p) {
        var delay = maxDist > 1 ? (p.screenDist / maxDist) * maxStagger : 0;
        p.el.style.transition = "transform " + dur + " " + ease + " " + delay.toFixed(3) + "s";
        p.el.style.transform = "translate(0px, 0px) scale(1)";
      });
      var chromeIn = toChord ? "0.55s" : "0s";
      chrome.forEach(function (el) {
        el.style.transition = "opacity 1.05s " + ease + " " + chromeIn;
        el.style.opacity = toChord ? "1" : "0";
      });
      if (note) {
        note.style.transition = "opacity 1.05s " + ease + " " + (toChord ? "0.65s" : "0s");
        note.style.opacity = toChord ? "1" : "0";
      }
      refreshOccMorphCopy();
      occFlipTimer = window.setTimeout(function () {
        occFlipTimer = 0;
        occSnapMode(toChord ? "chord" : "clouds");
      }, OCC_FLIP_MS + maxStagger * 1000 + 120);
    });
  });
}

function occSetMode(mode) {
  if (mode !== "rain" && mode !== "clouds" && mode !== "chord") mode = "clouds";

  if (!occUseSticky()) {
    occPendingMode = null;
    occSnapMode("clouds");
    return;
  }

  // Progress-bar seek: hard cut to the stage under the thumb. No FLIP /
  // crossfade path through clouds - scrub is "go there", not "play the story".
  if (occScrubbing) {
    if (!occMorphing && mode === occViewMode) {
      occPendingMode = null;
      return;
    }
    occPendingMode = null;
    if (mode === "chord" || mode === "clouds") {
      if (typeof occCloudSettleMarks === "function") occCloudSettleMarks();
      if (typeof occCloudSeen !== "undefined") occCloudSeen = true;
    }
    occSnapMode(mode);
    return;
  }

  if (!occFlipArmed || (typeof occCloudReduced === "function" && occCloudReduced())) {
    if (!occMorphing && mode === occViewMode) return;
    occPendingMode = null;
    occSnapMode(mode);
    return;
  }
  if (occMorphing) {
    occPendingMode = mode;
    return;
  }
  if (mode === occViewMode) {
    occPendingMode = null;
    return;
  }

  // rain↔clouds crossfade; clouds↔chord FLIP;
  // rain→chord FLIP direct; chord→rain FLIP to clouds then fade.
  if (occViewMode === "chord" && mode === "rain") {
    occPendingMode = "rain";
    occPlayFlip(false);
    return;
  }
  if (occViewMode === "rain" && mode === "chord") {
    occPlayFlip(true);
    return;
  }
  if (occViewMode === "rain" || mode === "rain") {
    occPlayRainCrossfade(mode === "clouds");
    return;
  }
  occPlayFlip(mode === "chord");
}

function occScrollProgress() {
  var scrolly = occEl("occ-scrolly");
  var pin = occEl("occ-pin");
  if (!scrolly || !pin || !occUseSticky()) return occScrollProgressCached;
  var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
  var top = occStickyTop();
  var passed = Math.min(travel, Math.max(0, top - scrolly.getBoundingClientRect().top));
  return travel > 0 ? passed / travel : 0;
}

function occStickyInView() {
  var scrolly = occEl("occ-scrolly");
  var pin = occEl("occ-pin");
  if (!scrolly || !pin || !occUseSticky()) return false;
  var top = occStickyTop();
  var rect = scrolly.getBoundingClientRect();
  return rect.top <= top + 1 && rect.bottom > top + 48;
}

function occScrollToProgress(progress) {
  var scrolly = occEl("occ-scrolly");
  var pin = occEl("occ-pin");
  if (!scrolly || !pin || !occUseSticky()) return;
  var rect = scrolly.getBoundingClientRect();
  var vh = window.innerHeight || 800;
  if (rect.bottom < -80 || rect.top > vh + 80) return;
  progress = Math.max(0, Math.min(1, Number(progress) || 0));
  var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
  occScrollProgressCached = progress;
  if (travel <= 0) return;
  var desired = occStickyTop() - progress * travel;
  var dy = scrolly.getBoundingClientRect().top - desired;
  if (Math.abs(dy) > 0.5) window.scrollBy(0, dy);
}

function saveOccScrollAnchor() {
  try {
    if (!occStickyInView()) {
      sessionStorage.removeItem(OCC_SCROLL_KEY);
      return;
    }
    var mode = occPendingMode || occViewMode;
    sessionStorage.setItem(
      OCC_SCROLL_KEY,
      JSON.stringify({ progress: occScrollProgress(), mode: mode })
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
  var scrolly = occEl("occ-scrolly");
  var pin = occEl("occ-pin");
  function jump() {
    if (!scrolly || !pin) return;
    var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
    if (travel <= 0) return;
    var desired = occStickyTop() - progress * travel;
    var dy = scrolly.getBoundingClientRect().top - desired;
    if (Math.abs(dy) > 0.5) window.scrollBy(0, dy);
    occScrollProgressCached = progress;
  }
  jump();
  var restoreMode = data.mode === "rain" || data.mode === "clouds" || data.mode === "chord"
    ? data.mode
    : (data.chord ? "chord" : occScrollMode(progress));
  occPendingMode = null;
  occSnapMode(restoreMode);
  occSizeStage();
  jump();
  return true;
}

function occChordStoryForProgress(progress) {
  if ((occViewMode || "") !== "chord") return null;
  var tick = occStackTick(progress);
  var civic = occSlipLocal(tick, 5);
  var triples = occSlipLocal(tick, 4);
  if (civic >= 0.12 && civic <= 1.02) return "civic";
  if (triples >= 0.12 && triples <= 1.02) return "triples";
  return null;
}

function occDriveFromScroll(progress) {
  occScrollProgressCached = progress;
  paintOccStacks(progress);
  if (!occScrubbing) occUpdateScrubUi(progress);
  if (typeof occChordSetStory === "function") {
    occChordSetStory(occChordStoryForProgress(progress));
  }
  // Scrub uses absolute stage cuts; wheel scroll keeps hysteresis.
  occSetMode(occScrubbing ? occModeAtProgress(progress) : occScrollMode(progress));
}

function syncOccupations() {
  var scrolly = occEl("occ-scrolly");
  var pin = occEl("occ-pin");
  if (!scrolly || !pin) return;
  if (occUseSticky()) {
    if (occScrubbing) return;
    if (!occMorphing) occSizeStage();
    occDriveFromScroll(occScrollProgress());
    return;
  }
  if (
    scrolly.classList.contains("is-sticky") ||
    scrolly.classList.contains("is-rain") ||
    scrolly.classList.contains("is-chord") ||
    scrolly.classList.contains("is-flipping") ||
    scrolly.classList.contains("is-rain-fading") ||
    occViewMode !== "clouds"
  ) {
    occPendingMode = null;
    occSnapMode("clouds");
    if (typeof ensureOccRain === "function") ensureOccRain();
    if (typeof syncOccRainMotion === "function") syncOccRainMotion(true);
  }
}

function afterRenderOccMorph() {
  occDisarmFlip(180);
  occPendingMode = null;
  if (typeof ensureOccRain === "function") ensureOccRain();

  if (!occUseSticky()) {
    layoutOccSticky();
    occSnapMode("clouds");
    fitOccRainNarrow();
    requestAnimationFrame(fitOccRainNarrow);
    return;
  }

  if (restoreOccScrollAnchor()) {
    requestAnimationFrame(occSizeStage);
    return;
  }

  layoutOccSticky();
  occSizeStage();
  if (occStickyInView()) {
    var progress = occScrollProgress();
    occScrollToProgress(progress);
    occSnapMode(occScrollMode(progress));
    requestAnimationFrame(function () {
      if (!occStickyInView()) return;
      var keep = occScrollProgress();
      occSizeStage();
      occScrollToProgress(keep);
    });
    return;
  }

  occSnapMode("rain");
}
