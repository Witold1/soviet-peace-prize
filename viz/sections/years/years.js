var YEAR_MARKS = [];
var YEAR_AXIS_LABELS = [];
var YEAR_AXIS = null;
var YEAR_SCROLL = {
  women: 0,
  year: "",
  peakWorld: "",
  peakCount: 0,
  mode: "mid",
  progress: 0
};
var YEAR_MORPH_Q = -1;
var YEARS_MODE_KEY = "laureates-years-mode";
// Fig. 1 style: scroll latches targets; RAF tweens visuals (no per-pixel scrub).
var yearVisualMorph = 0;
var yearTargetMorph = 0;
var yearAnimRaf = 0;
var yearAnimTs = 0;
var yearMorphing = false;
var YEAR_MORPH_MS = 720;

function yearsStickyTop() {
  return 16;
}

function yearsReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function yearsModeOk(mode) {
  return mode === "plain" || mode === "stretched" || mode === "scroll";
}

function yearsModeFromQuery() {
  try {
    var query = new URLSearchParams(window.location.search).get("years");
    if (yearsModeOk(query)) return query;
  } catch (err) {}
  return "";
}

function yearsMode() {
  var fromQuery = yearsModeFromQuery();
  if (fromQuery) return fromQuery;
  try {
    var saved = localStorage.getItem(YEARS_MODE_KEY);
    if (yearsModeOk(saved)) return saved;
  } catch (err) {}
  return "scroll";
}

function setYearsMode(next) {
  var mode = yearsModeOk(next) ? next : "scroll";
  try { localStorage.setItem(YEARS_MODE_KEY, mode); } catch (err) {}
  try {
    var url = new URL(window.location.href);
    if (mode === "scroll") url.searchParams.delete("years");
    else url.searchParams.set("years", mode);
    history.replaceState(null, "", url);
  } catch (err) {}
  document.documentElement.setAttribute("data-years-mode", mode);
  syncYearsModeControls();
  yearResetMotion();
  layoutYears();
  syncYears();
  refreshYearCopy();
}

function syncYearsModeControls() {
  var mode = yearsMode();
  document.documentElement.setAttribute("data-years-mode", mode);
  document.querySelectorAll("[data-years-mode]").forEach(function (button) {
    var id = button.getAttribute("data-years-mode");
    if (id === mode) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}

function yearsUseSticky() {
  return !yearsReduced() && yearsMode() === "scroll";
}

function yearMorphGate() {
  return 0.22;
}

function yearColorMode() {
  return "gender";
}

function yearFillOf(person) {
  return person.gender === "female" ? FEMALE : MALE;
}

function yearHotOf(person) {
  return person.gender === "female" ? FEMALE_HOT : MALE_HOT;
}

function sortYearStack(a, b) {
  if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
  return sortName(a).localeCompare(sortName(b), lang);
}

function paintYearMark(node, person) {
  paintMark(node, person, yearFillOf(person), yearHotOf(person));
}

function yearChartAriaKey() {
  return "yearAria";
}

function yearSourceKey() {
  return YEAR_SCROLL.mode === "span" ? "srcYearSpan" : "srcYear";
}

function yearCaptionKey() {
  return "capYear";
}

function layoutYears() {
  var scrolly = document.getElementById("years-scrolly");
  var steps = document.getElementById("years-steps");
  if (!steps) return;
  var sticky = yearsUseSticky();
  steps.style.display = sticky ? "" : "none";
  if (scrolly) scrolly.classList.toggle("is-sticky", sticky);
}

function yearStopAnim() {
  if (yearAnimRaf) {
    cancelAnimationFrame(yearAnimRaf);
    yearAnimRaf = 0;
  }
  yearAnimTs = 0;
  yearMorphing = false;
}

function yearResetMotion() {
  yearStopAnim();
  yearVisualMorph = 0;
  yearTargetMorph = 0;
  YEAR_MORPH_Q = -1;
}

function applyYearMorph(morphT) {
  var morphQ = morphT >= 1 ? 1 : Math.round(Math.min(1, Math.max(0, morphT)) * 100) / 100;
  if (morphQ === YEAR_MORPH_Q) return;
  YEAR_MORPH_Q = morphQ;
  var morphKey = morphQ.toFixed(3);
  YEAR_MARKS.forEach(function (mark) {
    var x = (mark.midX + (mark.spanX - mark.midX) * morphQ).toFixed(2);
    var y = (mark.midY + (mark.spanY - mark.midY) * morphQ).toFixed(2);
    var w = (mark.midW + (mark.spanW - mark.midW) * morphQ).toFixed(2);
    var h = (mark.midH + (mark.spanH - mark.midH) * morphQ).toFixed(2);
    mark.el.setAttribute("x", x);
    mark.el.setAttribute("y", y);
    mark.el.setAttribute("width", w);
    mark.el.setAttribute("height", h);
    if (mark.hatch) {
      mark.hatch.setAttribute("x", x);
      mark.hatch.setAttribute("y", y);
      mark.hatch.setAttribute("width", w);
      mark.hatch.setAttribute("height", h);
      mark.hatch.setAttribute("opacity", mark.isSpan ? morphKey : "0");
    }
  });
}

function yearApplyVisual() {
  applyYearMorph(yearVisualMorph);
  var mode = yearVisualMorph >= 0.5 ? "span" : "mid";
  if (mode !== YEAR_SCROLL.mode) {
    YEAR_SCROLL.mode = mode;
    refreshYearCopy();
  }
}

function yearAnimTick(ts) {
  yearAnimRaf = 0;
  if (!yearAnimTs) yearAnimTs = ts;
  var dt = Math.min(0.032, (ts - yearAnimTs) / 1000);
  yearAnimTs = ts;
  var morphStep = dt / (YEAR_MORPH_MS / 1000);

  var md = yearTargetMorph - yearVisualMorph;
  if (Math.abs(md) <= morphStep) yearVisualMorph = yearTargetMorph;
  else yearVisualMorph += md < 0 ? -morphStep : morphStep;

  yearApplyVisual();

  var done = yearVisualMorph === yearTargetMorph;
  yearMorphing = !done;
  if (!done) {
    yearAnimRaf = requestAnimationFrame(yearAnimTick);
  } else {
    yearAnimTs = 0;
    yearResampleScroll();
  }
}

function yearScrollProgress() {
  var scrolly = document.getElementById("years-scrolly");
  var pin = document.getElementById("years-pin");
  if (!scrolly || !pin || !yearsUseSticky()) return YEAR_SCROLL.progress || 0;
  var travel = Math.max(0, scrolly.offsetHeight - pin.offsetHeight);
  var top = yearsStickyTop();
  var passed = Math.min(travel, Math.max(0, top - scrolly.getBoundingClientRect().top));
  return travel > 0 ? passed / travel : 0;
}

function yearResampleScroll() {
  if (!yearsUseSticky() || yearMorphing) return;
  yearDriveFromScroll(yearScrollProgress());
}

function yearSetTargets(wantMorph) {
  var morph = wantMorph ? 1 : 0;
  if (morph === yearTargetMorph) return;
  yearTargetMorph = morph;

  if (yearsReduced()) {
    yearStopAnim();
    yearVisualMorph = morph;
    yearApplyVisual();
    return;
  }

  if (Math.abs(yearTargetMorph - yearVisualMorph) < 0.0005) {
    yearVisualMorph = yearTargetMorph;
    yearMorphing = false;
    yearApplyVisual();
    return;
  }

  yearMorphing = true;
  if (!yearAnimRaf) {
    yearAnimTs = 0;
    yearAnimRaf = requestAnimationFrame(yearAnimTick);
  }
}

function yearDriveFromScroll(progress) {
  // Like Fig. 1: ignore scroll while a tween is in flight so layout cannot fight itself.
  if (yearMorphing) return;
  YEAR_SCROLL.progress = progress;
  var morphGate = yearMorphGate();
  var wantMorph = yearTargetMorph >= 0.5
    ? progress >= morphGate * 0.45
    : progress >= morphGate * 0.82;
  yearSetTargets(wantMorph);
}

function syncYears() {
  var scrolly = document.getElementById("years-scrolly");
  var pin = document.getElementById("years-pin");
  if (!scrolly || !pin) return;

  if (yearsUseSticky()) {
    var progress = yearScrollProgress();
    scrubYearsPinScroll(pin, progress);
    yearDriveFromScroll(progress);
  } else {
    pin.scrollTop = 0;
    if (yearsReduced()) yearSetTargets(0);
    else if (yearsMode() === "stretched") yearSetTargets(1);
    else yearSetTargets(0);
  }
}

function scrubYearsPinScroll(pin, progress) {
  if (!yearChartNarrow()) return;
  var maxScroll = pin.scrollHeight - pin.clientHeight;
  var next = maxScroll > 8 ? Math.min(1, Math.max(0, progress)) * maxScroll : 0;
  if (Math.abs(pin.scrollTop - next) > 0.5) pin.scrollTop = next;
}

function refreshYearCopy() {
  var lead = document.getElementById("year-lead");
  if (lead && YEAR_SCROLL.year) {
    lead.textContent = yearLead({
      women: YEAR_SCROLL.women,
      year: YEAR_SCROLL.year,
      mode: YEAR_SCROLL.mode,
      color: yearColorMode(),
      peakWorld: YEAR_SCROLL.peakWorld,
      peakCount: YEAR_SCROLL.peakCount,
      canScroll: yearsUseSticky()
    });
  }
  var cap = document.getElementById("cap-year");
  if (cap) {
    var capKey = yearCaptionKey();
    cap.setAttribute("data-i18n", capKey);
    cap.textContent = t(capKey);
  }
  var source = document.getElementById("year-source");
  if (source) {
    var key = yearSourceKey();
    source.setAttribute("data-i18n", key);
    source.textContent = t(key);
  }
  syncYearColorChrome();
}

function syncYearColorChrome() {
  var legend = document.getElementById("year-legend");
  if (!legend) return;
  legend.replaceChildren();
  [["female", "female"], ["male", "male"]].forEach(function (row) {
    var item = document.createElement("span");
    var swatch = document.createElement("i");
    swatch.className = "swatch sq " + row[0];
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(" "));
    var label = document.createElement("span");
    label.textContent = t(row[1]);
    item.appendChild(label);
    legend.appendChild(item);
  });
}

function renderYearTally() {
  var tally = document.getElementById("year-tally");
  tally.replaceChildren();
  var menCount = PEOPLE_SEEN.filter(function (person) { return person.gender === "male"; }).length;
  var womenCount = PEOPLE_SEEN.length - menCount;
  tally.append(tallyBefore());
  var menEl = document.createElement("span");
  menEl.className = "m";
  menEl.textContent = tallyMen(menCount);
  tally.appendChild(menEl);
  tally.append(tallyMid());
  var womenEl = document.createElement("span");
  womenEl.className = "f";
  womenEl.textContent = tallyWomen(womenCount);
  tally.appendChild(womenEl);
  tally.append(".");
}

function renderYears() {
  if (typeof beforeRenderYears === "function") beforeRenderYears();
  syncYearColorChrome();
  document.getElementById("year-chart").replaceChildren();
  YEAR_MARKS = [];
  YEAR_AXIS_LABELS = [];
  YEAR_AXIS = null;
  yearResetMotion();
  renderYearTally();

  const byYear = new Map();
  PEOPLE_SEEN.forEach(function (person) {
    if (!byYear.has(person.year)) byYear.set(person.year, []);
    byYear.get(person.year).push(person);
  });
  const cohorts = Array.from(byYear.entries()).sort(function (a, b) {
    return a[1][0].yearStart - b[1][0].yearStart || a[0].localeCompare(b[0]);
  });

  let busiest = cohorts[0];
  cohorts.forEach(function (entry) {
    const women = entry[1].filter(function (person) { return person.gender === "female"; }).length;
    const best = busiest[1].filter(function (person) { return person.gender === "female"; }).length;
    if (women > best) busiest = entry;
  });

  YEAR_SCROLL.women = busiest[1].filter(function (person) { return person.gender === "female"; }).length;
  YEAR_SCROLL.year = shortYear(busiest[0]);
  if (typeof afterYearCohorts === "function") afterYearCohorts(cohorts);
  if (yearsReduced()) YEAR_SCROLL.mode = "mid";
  refreshYearCopy();

  if (yearChartNarrow()) renderYearsStacked(cohorts);
  else renderYearsTimeline(cohorts);

  layoutYears();
  syncYears();
}

function renderYearsTimeline(cohorts) {
  const minYear = 1950;
  const maxYear = 1990;
  const plotW = 960;
  const step = 22;
  const size = 18;
  const maxStack = Math.max.apply(null, cohorts.map(function (entry) { return entry[1].length; }));
  const padL = 20;
  const padR = 16;
  const padT = 8;
  const padB = 34;
  const plotH = maxStack * step;
  const width = padL + plotW + padR;
  const height = padT + plotH + padB;
  const axisY = padT + plotH;
  const labelY = axisY + 18;
  YEAR_AXIS = {
    axisY: axisY,
    labelY0: labelY,
    labelY1: labelY,
    width: width,
    height0: height,
    height1: height,
    svg: null
  };

  function xYear(year) {
    return padL + (year - minYear) / (maxYear - minYear) * plotW;
  }

  const svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t(yearChartAriaKey()));
  svg.appendChild(yearHatchDefs());
  YEAR_AXIS.svg = svg;

  const stalinGroup = svgEl("g");
  stalinGroup.setAttribute("class", "era-stalin");
  const leninGroup = svgEl("g");
  leninGroup.setAttribute("class", "era-lenin");
  const hatchGroup = svgEl("g");
  hatchGroup.setAttribute("class", "year-span-hatch");
  hatchGroup.setAttribute("pointer-events", "none");

  const axis = svgEl("line");
  axis.setAttribute("x1", padL);
  axis.setAttribute("x2", padL + plotW);
  axis.setAttribute("y1", axisY);
  axis.setAttribute("y2", axisY);
  axis.setAttribute("class", "axis-line year-axis-baseline");
  svg.appendChild(axis);
  YEAR_AXIS.baseline = axis;
  YEAR_AXIS.ticks = [];

  for (let tick = minYear; tick <= maxYear; tick += 5) {
    const x = xYear(tick);
    const tickLine = svgEl("line");
    tickLine.setAttribute("x1", x);
    tickLine.setAttribute("x2", x);
    tickLine.setAttribute("y1", axisY);
    tickLine.setAttribute("y2", axisY + 5);
    tickLine.setAttribute("class", "axis-line year-axis-tick");
    svg.appendChild(tickLine);
    YEAR_AXIS.ticks.push(tickLine);
    const label = svgEl("text");
    label.setAttribute("x", x);
    label.setAttribute("y", labelY);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis year-axis-label");
    label.textContent = String(tick);
    svg.appendChild(label);
    YEAR_AXIS_LABELS.push({ el: label, y0: labelY, y1: labelY });
  }

  cohorts.forEach(function (entry) {
    const bounds = cohortBounds(entry[0]);
    const isSpan = bounds[1] > bounds[0];
    const mid = (bounds[0] + bounds[1]) / 2;
    const midX = xYear(mid) - size / 2;
    const spanX = xYear(bounds[0]) - size / 2;
    const spanW = xYear(bounds[1]) - xYear(bounds[0]) + size;
    const ordered = entry[1].slice().sort(sortYearStack);
    ordered.forEach(function (person, index) {
      const y = axisY - index * step - size;
      const rect = svgEl("rect");
      rect.setAttribute("x", midX.toFixed(2));
      rect.setAttribute("y", y.toFixed(2));
      rect.setAttribute("width", size);
      rect.setAttribute("height", size);
      paintYearMark(rect, person);
      let hatchRect = null;
      if (isSpan) {
        hatchRect = svgEl("rect");
        hatchRect.setAttribute("x", midX.toFixed(2));
        hatchRect.setAttribute("y", y.toFixed(2));
        hatchRect.setAttribute("width", size);
        hatchRect.setAttribute("height", size);
        hatchRect.setAttribute("fill", "url(#year-span-hatch)");
        hatchRect.setAttribute("opacity", "0");
        hatchRect.setAttribute("pointer-events", "none");
        hatchGroup.appendChild(hatchRect);
      }
      YEAR_MARKS.push({
        el: rect,
        hatch: hatchRect,
        isSpan: isSpan,
        midX: midX,
        midY: y,
        midW: size,
        midH: size,
        spanX: spanX,
        spanY: y,
        spanW: spanW,
        spanH: size
      });
      (person.series === "stalin" ? stalinGroup : leninGroup).appendChild(rect);
    });
  });

  svg.appendChild(stalinGroup);
  svg.appendChild(leninGroup);
  svg.appendChild(hatchGroup);
  document.getElementById("year-chart").appendChild(svg);
}

(function bindYearsModeControls() {
  var nav = document.getElementById("years-mode");
  if (!nav) return;
  syncYearsModeControls();
  nav.addEventListener("click", function (event) {
    var button = event.target.closest("[data-years-mode]");
    if (!button) return;
    var next = button.getAttribute("data-years-mode");
    if (!next || next === yearsMode()) return;
    setYearsMode(next);
  });
})();
