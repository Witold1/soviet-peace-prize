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
  // Slightly smaller on mid widths so six clouds stay one row for Fig. 3a.
  var el = document.getElementById("clouds");
  var w = el && el.clientWidth > 0 ? el.clientWidth : 900;
  return w < 900 ? 10 : 12;
}

function occSplitKey(person) {
  var pravda = typeof pravdaOccClass === "function" ? pravdaOccClass(person) : null;
  return pravda || person.occupationClass;
}

function occSplitLabel(key) {
  return occLabel(key);
}

function occSplitGroups() {
  const buckets = new Map();
  for (const person of PEOPLE_SEEN) {
    const key = occSplitKey(person);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(person);
  }
  return Array.from(buckets.entries()).map(function (entry) {
    const people = entry[1].slice().sort(function (a, b) {
      if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
      return byYear(a, b);
    });
    return { key: entry[0], people: people };
  }).sort(function (a, b) {
    return b.people.length - a.people.length || occSplitLabel(a.key).localeCompare(occSplitLabel(b.key), lang);
  });
}

function syncOccSplitChrome() {
  const cap = document.getElementById("cap-occ");
  if (cap) {
    cap.setAttribute("data-i18n", "capOcc");
    cap.textContent = t("capOcc");
  }
  const source = document.getElementById("src-occ");
  if (source) {
    source.setAttribute("data-i18n", "srcOcc");
    source.textContent = t("srcOcc");
  }
}

function renderOccupations() {
  if (typeof beforeRenderOccupations === "function") beforeRenderOccupations();

  const groups = occSplitGroups();
  const women = PEOPLE_SEEN.filter(function (person) { return person.gender === "female"; });
  const largest = groups.slice().sort(function (a, b) {
    return b.people.length - a.people.length;
  })[0];
  const largestWomen = largest.people.filter(function (person) { return person.gender === "female"; }).length;
  const otherWomenKeys = new Set(
    women.filter(function (person) { return occSplitKey(person) !== largest.key; })
      .map(function (person) { return occSplitKey(person); })
  );

  const mode = typeof occSplitMode === "function" ? occSplitMode() : "occupation";
  document.getElementById("split-lead").textContent = splitLead({
    n: PEOPLE_SEEN.length,
    clouds: groups.length,
    mode: mode
  });
  document.getElementById("split-finding").textContent = splitFinding({
    mode: mode,
    key: largest.key,
    occupation: largest.key,
    count: largest.people.length,
    n: PEOPLE_SEEN.length,
    womenHere: largestWomen,
    women: women.length,
    otherWomen: women.length - largestWomen,
    otherOcc: otherWomenKeys.size,
    worlds: groups.map(function (group) {
      return { key: group.key, count: group.people.length };
    })
  });

  syncOccSplitChrome();

  const clouds = document.getElementById("clouds");
  clouds.replaceChildren();
  for (const group of groups) {
    const figure = document.createElement("figure");
    figure.className = "group";
    if (mode === "occupation") figure.dataset.occKey = group.key;
    const svg = renderCloud(
      group.people,
      occHexSize(),
      function (person) { return person.gender === "female" ? FEMALE : MALE; },
      function (person) { return person.gender === "female" ? FEMALE_HOT : MALE_HOT; }
    );
    const womenHere = group.people.filter(function (person) { return person.gender === "female"; }).length;
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", cloudAria(group.people.length, occSplitLabel(group.key), womenHere));
    svg.setAttribute("width", svg.dataset.w);
    svg.setAttribute("height", svg.dataset.h);
    const caption = document.createElement("figcaption");
    const line = document.createElement("span");
    line.className = "caption-line";
    line.textContent = cloudCaption(group.people.length, group.key);
    caption.appendChild(line);
    figure.appendChild(svg);
    figure.appendChild(caption);
    clouds.appendChild(figure);
    if (occChartNarrow()) {
      // Let CSS wrap inside the grid cell; balanced <br> splits fight the column.
      line.style.whiteSpace = "normal";
    } else {
      fitCaptionTitle(line, Number(svg.dataset.w));
    }
  }

  prepareOccCloudEntrance();

  var chordBlock = document.getElementById("occ-chord-block");
  var note = document.getElementById("occ-chord-note");
  var srcChord = document.getElementById("src-occ-chord");
  if (chordBlock) chordBlock.hidden = mode !== "occupation";
  if (note) note.hidden = mode !== "occupation";
  if (srcChord) srcChord.hidden = mode !== "occupation";
  if (mode === "occupation" && typeof renderOccChord === "function") {
    renderOccChord();
  }
  if (typeof afterRenderOccMorph === "function") afterRenderOccMorph();
}

var occCloudSeen = false;
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

function prepareOccCloudEntrance() {
  var clouds = document.getElementById("clouds");
  var viz = occCloudViz();
  if (!clouds) return;

  if (occCloudReduced()) {
    clouds.classList.add("is-in");
    clouds.classList.remove("is-pending");
    if (viz) {
      viz.classList.add("is-occ-in");
      viz.classList.remove("is-occ-pending");
    }
    return;
  }

  // Already played once this session — keep final paints on re-render (lang / split).
  if (occCloudSeen) {
    clouds.classList.add("is-in");
    clouds.classList.remove("is-pending");
    if (viz) {
      viz.classList.add("is-occ-in");
      viz.classList.remove("is-occ-pending");
    }
    return;
  }

  // Reload already on Fig. 3a: skip the gold flock. It races morph/FLIP and
  // ghosts Fig. 3 hexes over the chord flower (same class of bug as hero Mandela).
  if (
    typeof occUseSticky === "function" &&
    occUseSticky() &&
    typeof occScrollWantsChord === "function" &&
    occScrollWantsChord()
  ) {
    occCloudSeen = true;
    clouds.classList.add("is-in");
    clouds.classList.remove("is-pending");
    if (viz) {
      viz.classList.add("is-occ-in");
      viz.classList.remove("is-occ-pending");
    }
    return;
  }

  clouds.classList.add("is-pending");
  clouds.classList.remove("is-in");
  if (viz) {
    viz.classList.add("is-occ-pending");
    viz.classList.remove("is-occ-in");
  }

  // Same randomization as the top-rain version, but clustered at top-center
  // of Fig. 3. Measure once per SVG (viewBox → screen) instead of per polygon.
  var flock = clouds.getBoundingClientRect();
  var originX = flock.left + flock.width / 2;
  var originY = flock.top - Math.max(56, Math.min(120, flock.height * 0.18));

  var figures = clouds.querySelectorAll(".group");
  var seed = 0;
  figures.forEach(function (figure, groupIndex) {
    var svg = figure.querySelector("svg");
    var svgBox = svg ? svg.getBoundingClientRect() : null;
    var vb = svg && svg.viewBox && svg.viewBox.baseVal;
    var sx = svgBox && vb && vb.width ? svgBox.width / vb.width : 1;
    var sy = svgBox && vb && vb.height ? svgBox.height / vb.height : 1;
    var ox = svgBox ? svgBox.left - (vb ? vb.x * sx : 0) : 0;
    var oy = svgBox ? svgBox.top - (vb ? vb.y * sy : 0) : 0;
    var polys = figure.querySelectorAll("polygon");
    var groupN = polys.length || 1;
    polys.forEach(function (poly, index) {
      var finalFill = poly.getAttribute("fill") || poly.style.fill || MALE;
      poly.dataset.finalFill = finalFill;
      poly.style.fill = GOLD;
      poly.removeAttribute("fill");

      var cx;
      var cy;
      var pts = poly.points;
      if (pts && pts.numberOfItems) {
        var sumX = 0;
        var sumY = 0;
        for (var p = 0; p < pts.numberOfItems; p++) {
          sumX += pts.getItem(p).x;
          sumY += pts.getItem(p).y;
        }
        cx = ox + (sumX / pts.numberOfItems) * sx;
        cy = oy + (sumY / pts.numberOfItems) * sy;
      } else {
        var box = poly.getBoundingClientRect();
        cx = box.left + box.width / 2;
        cy = box.top + box.height / 2;
      }
      var jx = occCloudHash(seed++) * 48;
      var jy = occCloudHash(seed++) * 36;
      var dx = originX + jx - cx;
      var dy = originY + jy - cy;
      var scale = 0.22 + (occCloudHash(seed++) * 0.5 + 0.5) * 0.28;
      var delay = Math.min(
        1.05,
        groupIndex * 0.07 +
          (index / groupN) * 0.28 +
          (occCloudHash(seed++) * 0.5 + 0.5) * 0.42
      );
      poly.dataset.enterDelay = delay.toFixed(3);

      poly.style.transformBox = "fill-box";
      poly.style.transformOrigin = "center";
      poly.style.transform =
        "translate(" + dx.toFixed(1) + "px, " + dy.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
      poly.style.opacity = "0";
      poly.style.transition = "none";
    });
  });

  ensureOccCloudObserver();
}

function playOccCloudEntrance() {
  var clouds = document.getElementById("clouds");
  var viz = occCloudViz();
  if (!clouds || occCloudSeen || occCloudReduced()) return;
  // Sticky pin can still "intersect" while Fig. 3 is CSS-hidden under 3a.
  if (
    typeof occUseSticky === "function" &&
    occUseSticky() &&
    (occVisualMorph >= 0.5 || occTargetMorph >= 0.5 ||
      (typeof occScrollWantsChord === "function" && occScrollWantsChord()))
  ) {
    occCloudSeen = true;
    clouds.classList.add("is-in");
    clouds.classList.remove("is-pending");
    if (viz) {
      viz.classList.add("is-occ-in");
      viz.classList.remove("is-occ-pending");
    }
    return;
  }
  occCloudSeen = true;
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
    var dur = 0.78 + (occCloudHash(seed++) * 0.5 + 0.5) * 0.4;
    settleMs = Math.max(settleMs, (delay + dur + 0.75) * 1000);
    poly.style.transition =
      "transform " + dur.toFixed(2) + "s cubic-bezier(0.22, 1, 0.36, 1) " + delay.toFixed(3) + "s," +
      " opacity 0.4s ease " + delay.toFixed(3) + "s," +
      " fill 0.75s ease " + (delay + 0.48).toFixed(3) + "s";
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      polys.forEach(function (poly) {
        poly.style.transform = "translate(0px, 0px) scale(1)";
        poly.style.opacity = "1";
        poly.style.fill = poly.dataset.finalFill || MALE;
      });
    });
  });

  // Drop compositor transforms after the flock lands — leftover identity
  // transforms can keep SVG layer bounds clipping oddly in some browsers.
  window.setTimeout(function () {
    polys.forEach(function (poly) {
      poly.style.transition = "";
      poly.style.transform = "";
      poly.style.transformBox = "";
      poly.style.transformOrigin = "";
      poly.style.opacity = "";
      var finalFill = poly.dataset.finalFill;
      if (finalFill) {
        poly.setAttribute("fill", finalFill);
        poly.style.fill = "";
      }
      delete poly.dataset.enterDelay;
      delete poly.dataset.finalFill;
    });
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
