function fitCaptionTitle(title, limit) {
  const text = title.textContent;
  if (!text || text.indexOf(" ") === -1) return;
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  title.appendChild(probe);
  function widthOf(sample) {
    probe.textContent = sample;
    return probe.offsetWidth;
  }
  if (widthOf(text) <= limit) {
    probe.remove();
    return;
  }
  let best = null;
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) !== " ") continue;
    const top = text.slice(0, i);
    const bottom = text.slice(i + 1);
    const topWidth = widthOf(top);
    const bottomWidth = widthOf(bottom);
    const widest = Math.max(topWidth, bottomWidth);
    const balance = Math.abs(topWidth - bottomWidth);
    if (!best || widest < best.widest || (widest === best.widest && balance < best.balance)) {
      best = { top: top, bottom: bottom, widest: widest, balance: balance };
    }
  }
  probe.remove();
  if (!best) return;
  title.textContent = "";
  title.appendChild(document.createTextNode(best.top));
  title.appendChild(document.createElement("br"));
  title.appendChild(document.createTextNode(best.bottom));
}

function occChartNarrow() {
  var el = document.getElementById("clouds");
  if (el && el.clientWidth > 0) return el.clientWidth < 640;
  return document.documentElement.getAttribute("data-display") === "phone";
}

function occHexSize() {
  if (occChartNarrow()) return 9;
  // Sticky 3×2 grid has room - keep hexes readable.
  if (typeof occUseSticky === "function" && occUseSticky()) return 14;
  var el = document.getElementById("clouds");
  var w = el && el.clientWidth > 0 ? el.clientWidth : 900;
  return w < 900 ? 10 : 12;
}

// Balanced two-line split (same idea as Fig. 3b). Shared with chord labels.
function occWrapCaptionLines(text) {
  if (!text || text.indexOf(" ") === -1) return [text];
  var best = null;
  for (var i = 0; i < text.length; i++) {
    if (text.charAt(i) !== " ") continue;
    var top = text.slice(0, i);
    var bottom = text.slice(i + 1);
    if (!bottom) continue;
    var widest = Math.max(top.length, bottom.length);
    var balance = Math.abs(top.length - bottom.length);
    if (!best || widest < best.widest || (widest === best.widest && balance < best.balance)) {
      best = { lines: [top, bottom], widest: widest, balance: balance };
    }
  }
  if (!best || best.widest >= text.length) return [text];
  return best.lines;
}

// Fig. 3a / 3b main class - also used as occClusterMain in chord.
function occSplitKey(person) {
  var pravda = typeof pravdaOccClass === "function" ? pravdaOccClass(person) : null;
  return pravda || person.occupationClass;
}

function occFillOf(person) {
  return person.gender === "female" ? FEMALE : MALE;
}

function occHotOf(person) {
  return person.gender === "female" ? FEMALE_HOT : MALE_HOT;
}

function occWomenCount(people) {
  var n = 0;
  for (var i = 0; i < people.length; i++) {
    if (people[i].gender === "female") n++;
  }
  return n;
}

function occSortPeople(a, b) {
  if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
  return byYear(a, b);
}

function occClearPolyMotion(poly) {
  if (!poly || !poly.style) return;
  poly.style.transition = "";
  poly.style.transform = "";
  poly.style.transformBox = "";
  poly.style.transformOrigin = "";
  poly.style.opacity = "";
  if (poly.dataset) delete poly.dataset.enterDelay;
}

// Shared Fig. 3a / world-park cloud figure builder.
// opts: { dataAttr, label, caption, wrapLines, fitTitle }
function occAppendCloudFigure(host, group, opts) {
  opts = opts || {};
  var figure = document.createElement("figure");
  figure.className = "group";
  if (opts.dataAttr) figure.dataset[opts.dataAttr] = group.key;

  var svg = renderCloud(
    group.people,
    typeof occHexSize === "function" ? occHexSize() : 12,
    occFillOf,
    occHotOf
  );
  var label = opts.label != null ? opts.label : occLabel(group.key);
  var womenHere = occWomenCount(group.people);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", cloudAria(group.people.length, label, womenHere));
  svg.setAttribute("width", svg.dataset.w);
  svg.setAttribute("height", svg.dataset.h);

  var caption = document.createElement("figcaption");
  var line = document.createElement("span");
  line.className = "caption-line";
  var captionText = opts.caption != null
    ? opts.caption
    : cloudCaption(group.people.length, group.key);

  if (opts.wrapLines) {
    var parts = occWrapCaptionLines(captionText);
    line.textContent = "";
    parts.forEach(function (part, i) {
      if (i) line.appendChild(document.createElement("br"));
      line.appendChild(document.createTextNode(part));
    });
    line.style.whiteSpace = "normal";
  } else {
    line.textContent = captionText;
  }

  caption.appendChild(line);
  figure.appendChild(svg);
  figure.appendChild(caption);
  host.appendChild(figure);

  // Width probe needs a laid-out node - fit after append.
  if (!opts.wrapLines) {
    if (typeof occChartNarrow === "function" && occChartNarrow()) {
      line.style.whiteSpace = "normal";
    } else if (opts.fitTitle && typeof fitCaptionTitle === "function") {
      fitCaptionTitle(line, Number(svg.dataset.w));
    }
  }
  return figure;
}

function occSplitGroups() {
  const buckets = new Map();
  for (const person of PEOPLE_SEEN) {
    const key = occSplitKey(person);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(person);
  }
  return Array.from(buckets.entries()).map(function (entry) {
    return { key: entry[0], people: entry[1].slice().sort(occSortPeople) };
  }).sort(function (a, b) {
    return b.people.length - a.people.length ||
      occLabel(a.key).localeCompare(occLabel(b.key), lang);
  });
}

function syncOccSplitChrome() {
  // Narrow stacks Fig. 3 rain + Fig. 3a clouds; sticky chrome swaps one shared caption.
  const cap = document.getElementById("cap-occ");
  if (cap && typeof occUseSticky === "function" && !occUseSticky()) {
    cap.setAttribute("data-i18n", "capOcc");
    cap.textContent = t("capOcc");
    var figNo = document.getElementById("occ-fig-no");
    if (figNo) {
      figNo.setAttribute("data-i18n", "n3a");
      figNo.textContent = t("n3a");
    }
  }
  const source = document.getElementById("src-occ");
  if (source) {
    source.setAttribute("data-i18n", "srcOcc");
    source.textContent = t("srcOcc");
  }
}

function renderOccupations() {
  const groups = occSplitGroups();

  syncOccSplitChrome();

  const clouds = document.getElementById("clouds");
  clouds.replaceChildren();
  for (const group of groups) {
    occAppendCloudFigure(clouds, group, {
      dataAttr: "occKey",
      wrapLines: true
    });
  }

  prepareOccCloudEntrance();

  var chordBlock = document.getElementById("occ-chord-block");
  var note = document.getElementById("occ-chord-note");
  var srcChord = document.getElementById("src-occ-chord");
  if (chordBlock) chordBlock.hidden = false;
  if (note) note.hidden = true;
  if (srcChord) srcChord.hidden = false;
  if (typeof renderOccChord === "function") renderOccChord();
  if (typeof renderOccRain === "function") renderOccRain();
  if (typeof afterRenderOccMorph === "function") afterRenderOccMorph();
}

var occCloudSeen = false;
var occCloudEntering = false;
var occCloudEnterTimer = 0;
var occCloudObserver = null;

function occCloudReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function occCloudViz() {
  return document.getElementById("occ-pin") ||
    (document.getElementById("clouds") && document.getElementById("clouds").closest(".viz"));
}

function occCloudHash(n) {
  // Stable pseudo-random in [-1, 1] from an integer seed.
  var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function occCloudSettleMarks() {
  var clouds = document.getElementById("clouds");
  var viz = occCloudViz();
  if (!clouds) return;
  if (occCloudEnterTimer) {
    window.clearTimeout(occCloudEnterTimer);
    occCloudEnterTimer = 0;
  }
  occCloudEntering = false;
  clouds.classList.add("is-in");
  clouds.classList.remove("is-pending");
  if (viz) {
    viz.classList.add("is-occ-in");
    viz.classList.remove("is-occ-pending");
  }
  Array.prototype.forEach.call(clouds.querySelectorAll("polygon"), occClearPolyMotion);
}

// Arm hexes above the flock - gender colors already on (no gold recolor).
// Like the hero dove: the link is the flight, not a paint change.
function armOccCloudEntrance() {
  var clouds = document.getElementById("clouds");
  var viz = occCloudViz();
  if (!clouds) return;

  if (occCloudReduced()) {
    occCloudSettleMarks();
    return;
  }

  clouds.classList.add("is-pending");
  clouds.classList.remove("is-in");
  if (viz) {
    viz.classList.add("is-occ-pending");
    viz.classList.remove("is-occ-in");
  }

  var flock = clouds.getBoundingClientRect();
  var originX = flock.left + flock.width / 2;
  // Gather from above the stage top - past the frame edge, not from mid-cloud.
  var stage = document.getElementById("occ-stage");
  var stageTop = stage ? stage.getBoundingClientRect().top : flock.top;
  var originY = Math.min(flock.top, stageTop) - Math.max(96, Math.min(200, flock.height * 0.36));

  var figures = clouds.querySelectorAll(".group");
  var seed = 0;
  figures.forEach(function (figure, groupIndex) {
    var polys = figure.querySelectorAll("polygon");
    var groupN = polys.length || 1;
    polys.forEach(function (poly, index) {
      // Hide before the CSS-delta probe - probing at opacity 1 flashes home seats.
      poly.style.transition = "none";
      poly.style.opacity = "0";
      poly.style.transformBox = "fill-box";
      poly.style.transformOrigin = "center";
      // Screen seats (includes parent #clouds scale); CSS translate needs a probe.
      var box = poly.getBoundingClientRect();
      var cx = box.left + box.width / 2;
      var cy = box.top + box.height / 2;
      var jx = occCloudHash(seed++) * 56;
      var jy = occCloudHash(seed++) * 40;
      var screenDx = originX + jx - cx;
      var screenDy = originY + jy - cy;
      var local = typeof occCssDeltaForScreen === "function"
        ? occCssDeltaForScreen(poly, screenDx, screenDy)
        : { x: screenDx, y: screenDy };
      var scale = 0.2 + (occCloudHash(seed++) * 0.5 + 0.5) * 0.3;
      var delay = Math.min(
        1.05,
        groupIndex * 0.07 +
          (index / groupN) * 0.28 +
          (occCloudHash(seed++) * 0.5 + 0.5) * 0.42
      );
      poly.dataset.enterDelay = delay.toFixed(3);
      poly.style.transform =
        "translate(" + local.x.toFixed(1) + "px, " + local.y.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
    });
  });
}

function prepareOccCloudEntrance() {
  var clouds = document.getElementById("clouds");
  if (!clouds) return;

  if (occCloudReduced()) {
    occCloudSettleMarks();
    return;
  }

  // Reload already on Fig. 3b: do not arm a flight that races FLIP.
  if (
    typeof occUseSticky === "function" &&
    occUseSticky() &&
    typeof occScrollWantsChord === "function" &&
    occScrollWantsChord()
  ) {
    occCloudSeen = true;
    occCloudSettleMarks();
    return;
  }

  if (occCloudSeen) {
    occCloudSettleMarks();
    return;
  }

  armOccCloudEntrance();
  ensureOccCloudObserver();
}

// force: replay when arriving from the rain (every time). Observer / snap
// paths stay once-per-session via occCloudSeen.
// alreadyArmed: rain crossfade hid hexes before revealing fig3 - do not re-arm
// (re-probe at visible opacity flashes the settled grid).
function playOccCloudEntrance(force, alreadyArmed) {
  var clouds = document.getElementById("clouds");
  var viz = occCloudViz();
  if (!clouds || occCloudReduced()) return;
  if (!force && occCloudSeen) return;

  // force = rain→3a landing; crossfade sets occMorphing/viewMode before us.
  if (
    !force &&
    typeof occUseSticky === "function" &&
    occUseSticky() &&
    typeof occViewMode !== "undefined" &&
    occViewMode === "rain"
  ) {
    return;
  }
  // Never fight the clouds↔chord FLIP - but do not block rain→3a force landings
  // (crossfade sets occMorphing=true before playOccCloudEntrance(true)).
  if (
    !force &&
    typeof occUseSticky === "function" &&
    occUseSticky() &&
    (occMorphing ||
      (typeof occViewMode !== "undefined" && occViewMode === "chord") ||
      (typeof occScrollWantsChord === "function" && occScrollWantsChord()))
  ) {
    occCloudSeen = true;
    occCloudSettleMarks();
    return;
  }

  if (!alreadyArmed) armOccCloudEntrance();

  occCloudSeen = true;
  occCloudEntering = true;
  clouds.classList.remove("is-pending");
  clouds.classList.add("is-in");
  if (viz) {
    viz.classList.remove("is-occ-pending");
    viz.classList.add("is-occ-in");
  }

  var polys = clouds.querySelectorAll("polygon");
  var seed = 17;
  var settleMs = 0;
  polys.forEach(function (poly) {
    var delay = Number(poly.dataset.enterDelay || 0);
    var dur = 0.82 + (occCloudHash(seed++) * 0.5 + 0.5) * 0.42;
    settleMs = Math.max(settleMs, (delay + dur) * 1000);
    poly.style.transition =
      "transform " + dur.toFixed(2) + "s cubic-bezier(0.22, 1, 0.36, 1) " + delay.toFixed(3) + "s," +
      " opacity 0.35s ease " + delay.toFixed(3) + "s";
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      polys.forEach(function (poly) {
        poly.style.transform = "translate(0px, 0px) scale(1)";
        poly.style.opacity = "1";
      });
    });
  });

  if (occCloudEnterTimer) window.clearTimeout(occCloudEnterTimer);
  occCloudEnterTimer = window.setTimeout(function () {
    occCloudEnterTimer = 0;
    occCloudEntering = false;
    polys.forEach(occClearPolyMotion);
  }, settleMs + 80);
}

function ensureOccCloudObserver() {
  var clouds = document.getElementById("clouds");
  if (!clouds || occCloudReduced()) return;

  if (!("IntersectionObserver" in window)) {
    playOccCloudEntrance();
    return;
  }

  if (occCloudObserver) {
    occCloudObserver.disconnect();
  }
  occCloudObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      playOccCloudEntrance();
      if (occCloudObserver) occCloudObserver.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  occCloudObserver.observe(clouds);
}
