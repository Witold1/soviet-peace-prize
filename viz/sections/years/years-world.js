// Optional product: Cold War “world” coloring — parked at #worlds for now.
// Loaded after years.js. Remove this script (and occupations-world.js) to drop it.

var YEAR_COLOR = "gender";

function yearColorMode() {
  return YEAR_COLOR;
}

function yearFillOf(person) {
  if (YEAR_COLOR === "world") return WORLD_FILL[worldOf(person)] || WORLD_THIRD_FILL;
  return person.gender === "female" ? FEMALE : MALE;
}

function yearHotOf(person) {
  if (YEAR_COLOR === "world") return WORLD_HOT[worldOf(person)] || WORLD_THIRD_HOT;
  return person.gender === "female" ? FEMALE_HOT : MALE_HOT;
}

function sortYearStack(a, b) {
  if (YEAR_COLOR === "world") {
    var wa = WORLD_ORDER.indexOf(worldOf(a));
    var wb = WORLD_ORDER.indexOf(worldOf(b));
    if (wa !== wb) return wa - wb;
  } else if (a.gender !== b.gender) {
    return a.gender === "female" ? -1 : 1;
  }
  return sortName(a).localeCompare(sortName(b), lang);
}

function yearChartAriaKey() {
  return YEAR_COLOR === "world" ? "yearAriaWorld" : "yearAria";
}

function yearSourceKey() {
  if (YEAR_COLOR === "world") {
    return YEAR_SCROLL.mode === "span" ? "srcYearSpanWorld" : "srcYearWorld";
  }
  return YEAR_SCROLL.mode === "span" ? "srcYearSpan" : "srcYear";
}

function afterYearCohorts(cohorts) {
  var peakWorld = "first";
  var peakCount = 0;
  var peakYear = shortYear(cohorts[0][0]);
  cohorts.forEach(function (entry) {
    var worldCounts = { first: 0, second: 0, third: 0 };
    entry[1].forEach(function (person) { worldCounts[worldOf(person)] += 1; });
    WORLD_ORDER.forEach(function (key) {
      if (worldCounts[key] > peakCount) {
        peakCount = worldCounts[key];
        peakWorld = key;
        peakYear = shortYear(entry[0]);
      }
    });
  });
  YEAR_SCROLL.peakWorld = peakWorld;
  YEAR_SCROLL.peakCount = peakCount;
}

function syncWorldParkYearChrome() {
  var cap = document.getElementById("cap-world-year");
  if (cap) {
    cap.setAttribute("data-i18n", "capYear");
    cap.textContent = t("capYear");
  }
  var source = document.getElementById("src-world-year");
  if (source) {
    source.setAttribute("data-i18n", "srcYearWorld");
    source.textContent = t("srcYearWorld");
  }
  var legend = document.getElementById("world-year-legend");
  if (!legend) return;
  legend.replaceChildren();
  WORLD_ORDER.forEach(function (key) {
    var item = document.createElement("span");
    var swatch = document.createElement("i");
    swatch.className = "swatch sq world-" + key;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(" "));
    var label = document.createElement("span");
    label.textContent = worldLabel(key);
    item.appendChild(label);
    legend.appendChild(item);
  });
}

function renderWorldParkYears() {
  var host = document.getElementById("world-year-chart");
  if (!host || typeof svgEl !== "function") return;

  syncWorldParkYearChrome();
  host.replaceChildren();

  var byYear = new Map();
  PEOPLE_SEEN.forEach(function (person) {
    if (!byYear.has(person.year)) byYear.set(person.year, []);
    byYear.get(person.year).push(person);
  });
  var cohorts = Array.from(byYear.entries()).sort(function (a, b) {
    return a[1][0].yearStart - b[1][0].yearStart || a[0].localeCompare(b[0]);
  });

  var saved = YEAR_COLOR;
  YEAR_COLOR = "world";

  var minYear = 1950;
  var maxYear = 1990;
  var plotW = 960;
  var step = 22;
  var size = 18;
  var maxStack = Math.max.apply(null, cohorts.map(function (entry) { return entry[1].length; }));
  var padL = 20;
  var padR = 16;
  var padT = 8;
  var padB = 34;
  var plotH = maxStack * step;
  var width = padL + plotW + padR;
  var height = padT + plotH + padB;
  var axisY = padT + plotH;
  var labelY = axisY + 18;

  function xYear(year) {
    return padL + (year - minYear) / (maxYear - minYear) * plotW;
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("yearAriaWorld"));

  var stalinGroup = svgEl("g");
  stalinGroup.setAttribute("class", "era-stalin");
  var leninGroup = svgEl("g");
  leninGroup.setAttribute("class", "era-lenin");

  var axis = svgEl("line");
  axis.setAttribute("x1", padL);
  axis.setAttribute("x2", padL + plotW);
  axis.setAttribute("y1", axisY);
  axis.setAttribute("y2", axisY);
  axis.setAttribute("class", "axis-line year-axis-baseline");
  svg.appendChild(axis);

  for (var tick = minYear; tick <= maxYear; tick += 5) {
    var x = xYear(tick);
    var tickLine = svgEl("line");
    tickLine.setAttribute("x1", x);
    tickLine.setAttribute("x2", x);
    tickLine.setAttribute("y1", axisY);
    tickLine.setAttribute("y2", axisY + 5);
    tickLine.setAttribute("class", "axis-line year-axis-tick");
    svg.appendChild(tickLine);
    var label = svgEl("text");
    label.setAttribute("x", x);
    label.setAttribute("y", labelY);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis year-axis-label");
    label.textContent = String(tick);
    svg.appendChild(label);
  }

  cohorts.forEach(function (entry) {
    var bounds = cohortBounds(entry[0]);
    var mid = (bounds[0] + bounds[1]) / 2;
    var midX = xYear(mid) - size / 2;
    var ordered = entry[1].slice().sort(sortYearStack);
    ordered.forEach(function (person, index) {
      var y = axisY - index * step - size;
      var rect = svgEl("rect");
      rect.setAttribute("x", midX.toFixed(2));
      rect.setAttribute("y", y.toFixed(2));
      rect.setAttribute("width", size);
      rect.setAttribute("height", size);
      paintYearMark(rect, person);
      (person.series === "stalin" ? stalinGroup : leninGroup).appendChild(rect);
    });
  });

  svg.appendChild(stalinGroup);
  svg.appendChild(leninGroup);
  host.appendChild(svg);

  YEAR_COLOR = saved;
}
