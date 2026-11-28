var YEAR_AXIS_LABELS = [];
var YEAR_AXIS = null;
var YEAR_SCROLL = {
  women: 0,
  year: "",
  peakWorld: "",
  peakCount: 0,
  mode: "span"
};
var YEARS_MODE_KEY = "laureates-years-mode";

// Stretched is the only years view; plain/scroll toggles are retired.
function syncYearsModeControls() {
  document.documentElement.setAttribute("data-years-mode", "stretched");
  try { localStorage.setItem(YEARS_MODE_KEY, "stretched"); } catch (err) {}
  try {
    var url = new URL(window.location.href);
    if (url.searchParams.has("years")) {
      url.searchParams.delete("years");
      history.replaceState(null, "", url);
    }
  } catch (err) {}
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
  return "srcYearSpan";
}

function yearCaptionKey() {
  return "capYear";
}

function layoutYears() {
  var scrolly = document.getElementById("years-scrolly");
  var steps = document.getElementById("years-steps");
  if (!steps) return;
  // Sticky mid↔span runway retired - it fought mobile chrome / scroll.
  steps.style.display = "none";
  if (scrolly) scrolly.classList.remove("is-sticky");
}

function syncYears() {
  var pin = document.getElementById("years-pin");
  if (!pin) return;
  pin.scrollTop = 0;
}

function refreshYearCopy() {
  var lead = document.getElementById("year-lead");
  if (lead && YEAR_SCROLL.year) {
    lead.style.minHeight = "";
    lead.textContent = yearLead({
      women: YEAR_SCROLL.women,
      year: YEAR_SCROLL.year,
      color: yearColorMode(),
      peakWorld: YEAR_SCROLL.peakWorld,
      peakCount: YEAR_SCROLL.peakCount
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
    source.style.minHeight = "";
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
  var minY = Infinity;
  var maxY = -Infinity;
  var cohorts = new Set();
  PEOPLE_SEEN.forEach(function (person) {
    cohorts.add(person.year);
    var bounds = cohortBounds(person.year);
    if (bounds[0] < minY) minY = bounds[0];
    if (bounds[1] > maxY) maxY = bounds[1];
  });
  // 1950→1990 reads as forty years in the essay, not 41 inclusive ticks.
  var yearSpan = Math.max(0, maxY - minY);
  var prizeCount = cohorts.size;

  tally.append(tallyYears(yearSpan));
  tally.append(", ");
  tally.append(tallyPrizes(prizeCount));
  tally.append(", ");
  var menEl = document.createElement("span");
  menEl.className = "m";
  menEl.textContent = tallyMen(menCount);
  tally.appendChild(menEl);
  tally.append(", ");
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
  YEAR_AXIS_LABELS = [];
  YEAR_AXIS = null;
  YEAR_SCROLL.mode = "span";
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
    const spanX = xYear(bounds[0]) - size / 2;
    const spanW = xYear(bounds[1]) - xYear(bounds[0]) + size;
    const ordered = entry[1].slice().sort(sortYearStack);
    ordered.forEach(function (person, index) {
      const y = axisY - index * step - size;
      const rect = svgEl("rect");
      rect.setAttribute("x", spanX.toFixed(2));
      rect.setAttribute("y", y.toFixed(2));
      rect.setAttribute("width", spanW.toFixed(2));
      rect.setAttribute("height", size);
      paintYearMark(rect, person);
      if (isSpan) {
        const hatchRect = svgEl("rect");
        hatchRect.setAttribute("x", spanX.toFixed(2));
        hatchRect.setAttribute("y", y.toFixed(2));
        hatchRect.setAttribute("width", spanW.toFixed(2));
        hatchRect.setAttribute("height", size);
        hatchRect.setAttribute("fill", "url(#year-span-hatch)");
        hatchRect.setAttribute("opacity", "1");
        hatchRect.setAttribute("pointer-events", "none");
        hatchGroup.appendChild(hatchRect);
      }
      (person.series === "stalin" ? stalinGroup : leninGroup).appendChild(rect);
    });
  });

  svg.appendChild(stalinGroup);
  svg.appendChild(leninGroup);
  svg.appendChild(hatchGroup);
  document.getElementById("year-chart").appendChild(svg);
}

syncYearsModeControls();
