// Optional product: Cold War “world” coloring for Fig. 4.
// Loaded after years.js. Remove this script to drop the › control.

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

function ensureYearWorldChrome() {
  var legend = document.getElementById("year-legend");
  if (!legend) return null;
  var toolbar = legend.closest(".split-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "split-toolbar";
    legend.parentNode.insertBefore(toolbar, legend);
    toolbar.appendChild(legend);
  }
  var button = document.getElementById("year-color-next");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "split-next";
    button.id = "year-color-next";
    button.textContent = "›";
    toolbar.appendChild(button);
  }
  return button;
}

function syncYearColorChrome() {
  var button = ensureYearWorldChrome();
  if (button) {
    button.setAttribute("aria-label", t(YEAR_COLOR === "world" ? "yearColorNextToGender" : "yearColorNextToWorld"));
  }

  var legend = document.getElementById("year-legend");
  if (!legend) return;
  legend.replaceChildren();

  if (YEAR_COLOR === "world") {
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
    return;
  }

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

  if (YEAR_COLOR === "world") {
    var counts = { first: 0, second: 0, third: 0 };
    PEOPLE.forEach(function (person) { counts[worldOf(person)] += 1; });
    WORLD_ORDER.forEach(function (key, index) {
      if (index) tally.append(document.createTextNode(lang === "ru" ? ", " : "; "));
      var el = document.createElement("span");
      el.className = "w-" + key;
      el.textContent = worldLabel(key) + " " + counts[key];
      tally.appendChild(el);
    });
    tally.append(".");
    return;
  }

  var menCount = PEOPLE.filter(function (person) { return person.gender === "male"; }).length;
  var womenCount = PEOPLE.length - menCount;
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
  if (YEAR_COLOR === "world") YEAR_SCROLL.year = peakYear;
}

function beforeRenderYears() {
  var button = ensureYearWorldChrome();
  if (!button || button.dataset.bound === "1") return;
  button.dataset.bound = "1";
  button.addEventListener("click", function () {
    YEAR_COLOR = YEAR_COLOR === "world" ? "gender" : "world";
    renderYears();
  });
}
