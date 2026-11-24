var pressRows = [];
var pressEvents = [];
var pressTravel = 0;
var pressStory = 0;
var pressEventTravel = 0;
var pressContentTravel = 0;
var pressLift = 0;
var pressStep = 96;
var pressSlack = 0;
var pressCurrent = null;
var pressZoomLast = "";
var pressRevealQ = -1;
var pressShiftLast = "";
var pressRainColsLast = 0;

function pressReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pressIssue(iso) {
  var origin = Date.UTC(1949, 11, 18);
  var parts = iso.split("-");
  var year = +parts[0];
  var month = +parts[1];
  var day = +parts[2];
  var utc = Date.UTC(year, month - 1, day);
  var yearStart = Date.UTC(year, 0, 1);
  var delta = Math.round((utc - origin) / 86400000);
  var monthsRu = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  var monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var n = Math.round((utc - yearStart) / 86400000) + 1;
  var serial = 11459 + delta;
  var edition = n + " (" + serial + ")";
  if (lang === "ru") {
    return {
      before: "Правда, ",
      date: day + " " + monthsRu[month - 1] + " " + year + " г.",
      after: ", № " + edition
    };
  }
  return {
    before: "Pravda, ",
    date: monthsEn[month - 1] + " " + day + ", " + year,
    after: ", no. " + edition
  };
}

function syncIssue(iso) {
  var issue = document.getElementById("press-issue");
  if (!issue || !iso) return;
  if (issue.dataset.iso === iso && issue.dataset.lang === lang) return;
  issue.dataset.iso = iso;
  issue.dataset.lang = lang;
  var parts = pressIssue(iso);
  issue.textContent = "";
  issue.appendChild(document.createTextNode(parts.before));
  var date = document.createElement("span");
  date.className = "press-issue-date";
  date.textContent = parts.date;
  issue.appendChild(date);
  issue.appendChild(document.createTextNode(parts.after));
}

function placeDecree() {
  var stage = document.querySelector("#prize .press-stage");
  // Founding decree is the default/core Pravda under the titles;
  // per-title scans can later replace or join this slot.
  var decree = document.getElementById("decree-1949");
  if (!stage || !decree) return;
  if (decree.parentElement !== stage) stage.appendChild(decree);
  decree.dataset.pressCore = "1949";
  decree.style.transform = "";
}

function pressLineText(item) {
  return lang === "ru" ? item.ru : item.en;
}

var PRESS_RAIN_YEARS = [1945, 1946, 1947, 1948, 1949, 1950];

function pressYearFromIso(iso) {
  if (!iso) return null;
  var year = +String(iso).slice(0, 4);
  if (PRESS_RAIN_YEARS.indexOf(year) === -1) return null;
  return year;
}

function pressUtcFromIso(iso) {
  if (!iso) return null;
  var parts = String(iso).split("-");
  if (parts.length < 3) return null;
  return Date.UTC(+parts[0], +parts[1] - 1, +parts[2]);
}

function pressRainByYear(items) {
  var buckets = {};
  var orphans = [];
  var seen = {};
  PRESS_RAIN_YEARS.forEach(function (year) {
    buckets[year] = [];
  });
  function add(ru, en, isHot, iso) {
    var key = (isHot ? "h:" : "o:") + ru + "\0" + en;
    if (seen[key]) return;
    seen[key] = true;
    var year = pressYearFromIso(iso);
    var row = {
      ru: ru,
      en: en,
      hot: !!isHot,
      year: year,
      iso: iso || null,
      utc: pressUtcFromIso(iso)
    };
    if (year) buckets[year].push(row);
    else orphans.push(row);
  }
  items.forEach(function (item) {
    add(item.ru, item.en, !!(item.instability || item.prize), item.iso || null);
  });
  // Full ordinary corpus as undated filler (bypass seen) so year columns stay wall-dense.
  if (typeof PRESS_ORDINARY !== "undefined") {
    PRESS_ORDINARY.forEach(function (pair) {
      orphans.push({
        ru: pair[0],
        en: pair[1],
        hot: false,
        year: null,
        iso: null,
        utc: null
      });
    });
  }
  // Year columns keep their dated/hot lines, but undated wire copy is reused in
  // every year so the wall stays dense (splitting orphans 6 ways thinned it out).
  PRESS_RAIN_YEARS.forEach(function (year) {
    orphans.forEach(function (row, index) {
      var day = Math.round(((index + 1) / (orphans.length + 1)) * 364);
      buckets[year].push({
        ru: row.ru,
        en: row.en,
        hot: false,
        year: year,
        iso: null,
        utc: Date.UTC(year, 0, 1) + day * 86400000
      });
    });
    buckets[year].sort(function (a, b) {
      var left = a.utc == null ? Number.POSITIVE_INFINITY : a.utc;
      var right = b.utc == null ? Number.POSITIVE_INFINITY : b.utc;
      if (left !== right) return left - right;
      if (a.hot !== b.hot) return a.hot ? 1 : -1;
      return (a.ru || "").localeCompare(b.ru || "");
    });
  });
  return buckets;
}

function pressRainColumnCount() {
  // One column per year, 1945–1950.
  return PRESS_RAIN_YEARS.length;
}

function pressMarkJitter(line) {
  line.dataset.mark = String(1 + Math.floor(Math.random() * 4));
  // Most instability lines get a hand underline; a few stay marker-only.
  if (Math.random() < 0.82) line.dataset.underline = "1";
  else delete line.dataset.underline;
  // Per-line marks: vary wash, curve weight, and inset without stretching one blob.
  line.style.setProperty("--mark-alpha", (0.66 + Math.random() * 0.28).toFixed(2));
  line.style.setProperty("--mark-line", (0.38 + Math.random() * 0.4).toFixed(2));
  line.style.setProperty("--mark-pad-x", (0.06 + Math.random() * 0.22).toFixed(2) + "em");
  line.style.setProperty("--mark-pad-y", (0.02 + Math.random() * 0.1).toFixed(2) + "em");
  line.style.setProperty("--mark-tilt", (Math.random() * 2.4 - 1.2).toFixed(2) + "deg");
  line.style.setProperty("--mark-shift", (Math.random() * 18 - 9).toFixed(1) + "%");
  line.style.setProperty("--mark-wash-h", (78 + Math.random() * 28).toFixed(1) + "%");
  line.style.setProperty("--mark-curve-h", (0.3 + Math.random() * 0.28).toFixed(2) + "em");
  line.style.setProperty("--mark-curve-w", (102 + Math.random() * 16).toFixed(1) + "%");
  line.style.setProperty("--mark-curve-y", (88 + Math.random() * 14).toFixed(1) + "%");
}

function renderPressRain(byYear) {
  var rain = document.getElementById("press-rain");
  var frame = document.getElementById("press-frame");
  if (!rain || !frame) return;
  var cols = pressRainColumnCount();
  pressRainColsLast = cols;
  rain.textContent = "";
  if (!byYear) return;
  PRESS_RAIN_YEARS.forEach(function (year, col) {
    var pool = byYear[year] || [];
    var column = document.createElement("div");
    column.className = "press-rain-col";
    column.dataset.year = String(year);
    var label = document.createElement("span");
    label.className = "press-rain-year";
    label.textContent = String(year);
    column.appendChild(label);
    var view = document.createElement("div");
    view.className = "press-rain-view";
    var stack = document.createElement("div");
    stack.className = "press-rain-stack";
    stack.style.setProperty("--rain-dur", "28s");
    if (!pool.length) {
      view.appendChild(stack);
      column.appendChild(view);
      rain.appendChild(column);
      return;
    }
    var lines = pool.slice();
    // Repeat until the column feels like a wall, not a short list.
    while (lines.length < 48) lines = lines.concat(pool);
    function appendPass(pass) {
      pass.forEach(function (item) {
        var line = document.createElement("span");
        line.className = "press-rain-line" + (item.hot ? " is-hot" : "");
        line.dataset.ru = item.ru;
        line.dataset.en = item.en;
        line.dataset.year = String(year);
        if (item.iso) line.dataset.iso = item.iso;
        if (item.hot) {
          var mark = document.createElement("span");
          mark.className = "press-rain-mark";
          mark.textContent = pressLineText(item);
          line.appendChild(mark);
          pressMarkJitter(line);
        } else {
          line.textContent = pressLineText(item);
        }
        stack.appendChild(line);
      });
    }
    appendPass(lines);
    appendPass(lines);
    view.appendChild(stack);
    column.appendChild(view);
    rain.appendChild(column);
  });
  bindPressRainClicks();
}

function bindPressRainClicks() {
  var rain = document.getElementById("press-rain");
  if (!rain || rain.dataset.clickBound === "1") return;
  rain.dataset.clickBound = "1";
  rain.addEventListener("click", function (event) {
    if (!document.documentElement.hasAttribute("data-dev-press-click")) return;
    var line = event.target.closest(".press-rain-line.is-hot");
    if (!line || !rain.contains(line)) return;
    pressJumpToTitle(line.dataset.ru, line.dataset.iso);
  });
}

function pressJumpToTitle(ru, iso) {
  if (!ru) return;
  var index = -1;
  var i;
  for (i = 0; i < pressEvents.length; i++) {
    if (pressEvents[i].dataset.ru === ru) {
      index = i;
      break;
    }
  }
  if (index >= 0) {
    var section = document.getElementById("prize");
    if (!section) return;
    var target = index * pressStep + pressStep * 0.45;
    var top = window.scrollY + section.getBoundingClientRect().top + target - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return;
  }
  // Wall-only titles (e.g. Korea): update the issue line without a foreground zoom.
  if (iso) syncIssue(iso);
  document.querySelectorAll(".press-rain-line.is-hot").forEach(function (line) {
    line.classList.toggle("is-live", line.dataset.ru === ru);
  });
}

function renderPress() {
  placeDecree();
  var list = document.getElementById("press-list");
  var frame = document.getElementById("press-frame");
  if (!list || !frame || typeof buildPressSample !== "function") return;
  var items = buildPressSample();
  var rainPool = pressRainByYear(items);
  list.textContent = "";
  pressRows = [];
  items.forEach(function (item) {
    // Aside lines (e.g. Korea) stay in the year wall only — no foreground zoom.
    if ((!item.instability && !item.prize) || item.aside) return;
    var line = document.createElement("li");
    var text = pressLineText(item);
    line.className = "press-line"
      + (item.filler ? " is-filler" : "")
      + (item.instability ? " is-instability" : "")
      + (item.prize ? " is-prize" : "");
    if (item.prize) line.id = "press-prize";
    line.dataset.iso = item.iso;
    line.dataset.ru = item.ru;
    line.dataset.en = item.en;
    line.textContent = text;
    list.appendChild(line);
    pressRows.push(line);
  });
  renderPressRain(rainPool);
  pressEvents = redEvents();
  pressCurrent = null;
  pressZoomLast = "";
  pressRevealQ = -1;
  pressShiftLast = "";
  bindDecreeLayout();
  layoutPress();
  syncPress();
}

function bindDecreeLayout() {
  var scan = document.getElementById("ukaz-scan");
  if (!scan || scan.dataset.pressBound) return;
  scan.dataset.pressBound = "1";
  scan.addEventListener("load", function () {
    layoutPress();
    syncPress();
  });
}

function layoutPress() {
  var section = document.getElementById("prize");
  var pin = document.getElementById("press-pin");
  var reel = document.getElementById("press-reel");
  var frame = document.getElementById("press-frame");
  if (!section || !pin || !reel || !frame) return;
  placeDecree();
  pressLift = 0;
  var decree = document.getElementById("decree-1949");
  if (decree) {
    decree.classList.remove("is-awaiting", "is-front");
    decree.style.transform = "";
  }
  setFade(frame, 0);
  var cols = pressRainColumnCount();
  if (cols !== pressRainColsLast && typeof buildPressSample === "function") {
    renderPressRain(pressRainByYear(buildPressSample()));
  }
  if (pressReduced()) {
    if (decree) decree.classList.remove("is-awaiting");
    section.style.height = "";
    reel.style.transform = "";
    return;
  }
  reel.style.transform = "none";
  pressEvents = redEvents();
  pressEventTravel = pressEvents.length * pressStep;
  pressSlack = frame.clientHeight - reel.scrollHeight;
  pressContentTravel = Math.max(0, -pressSlack);
  pressStory = Math.max(pressEventTravel, pressContentTravel, pressFadeStart() + pressFadeDistance());
  pressTravel = pressStory + pressPageHold() + pressZoomDistance() + pressZoomHold();
  var pinH = pin.offsetHeight;
  pressZoomLast = "";
  pressRevealQ = -1;
  pressShiftLast = "";
  awaitDecree(0);
  section.style.height = (pinH + pressTravel) + "px";
}

function redEvents() {
  return pressRows.filter(function (row) {
    return row.classList.contains("is-instability") || row.classList.contains("is-prize");
  });
}


function syncPress() {
  var section = document.getElementById("prize");
  var frame = document.getElementById("press-frame");
  var reel = document.getElementById("press-reel");
  if (!section || !frame || !reel || !pressRows.length) return;
  if (pressReduced()) {
    var resting = pressEvents[0];
    markInstability(resting);
    syncIssue(resting ? resting.dataset.iso : pressRows[0].dataset.iso);
    setFade(frame, 0);
    syncDecreeZoom(0, false);
    if (typeof syncDecreeAnnotProgress === "function") syncDecreeAnnotProgress(1, true);
    return;
  }
  var passed = Math.min(pressTravel, Math.max(0, 16 - section.getBoundingClientRect().top));
  var base = pressSlack > 0 ? pressSlack / 2 : 0;
  var storyPassed = Math.min(pressStory, passed);
  var revealStart = pressFadeStart();
  var span = Math.max(pressFadeDistance(), pressStory - revealStart);
  var reveal = Math.min(1, Math.max(0, (storyPassed - revealStart) / span));
  var shift = base - pressContentTravel * reveal;
  var shiftCss = shift ? "translateY(" + shift.toFixed(2) + "px)" : "none";
  var shiftChanged = shiftCss !== pressShiftLast;
  if (shiftChanged) {
    pressShiftLast = shiftCss;
    reel.style.transform = shiftCss;
  }
  var index = 0;
  if (pressEvents.length) {
    index = passed >= pressTravel ? pressEvents.length - 1 : Math.min(pressEvents.length - 1, Math.floor(passed / pressStep));
  }
  var currentEvent = pressEvents[index] || null;
  markInstability(currentEvent);
  syncIssue(currentEvent ? currentEvent.dataset.iso : pressRows[0].dataset.iso);
  clearAroundPrize(frame, reel, reveal);
  awaitDecree(reveal);
  var zoomStart = pressStory + pressPageHold();
  var zoom = Math.min(1, Math.max(0, (passed - zoomStart) / pressZoomDistance()));
  syncDecreeZoom(zoom, true);
}

function pressFadeStart() {
  return pressEventTravel * 0.62;
}

function pressFadeDistance() {
  return pressEventTravel * 0.62;
}

function pressPageHold() {
  return Math.round(window.innerHeight * 0.28);
}

function pressZoomDistance() {
  return Math.round(window.innerHeight * 0.52);
}

function pressZoomHold() {
  return Math.round(window.innerHeight * 0.4);
}

function syncDecreeZoom(zoom, scrub) {
  var loupe = document.getElementById("ukaz-loupe");
  var quote = loupe && loupe.closest(".ukaz");
  if (!loupe) return;
  if (!scrub) {
    pressZoomLast = "";
    loupe.style.removeProperty("--zoom");
    loupe.classList.remove("is-scrub");
    if (quote) quote.classList.remove("is-zoomed");
    if (typeof syncDecreeAnnotProgress === "function") syncDecreeAnnotProgress(0, false);
    return;
  }
  var value = zoom.toFixed(3);
  var zoomed = zoom >= 0.84 ? "1" : "0";
  var key = value + ":" + zoomed;
  if (key === pressZoomLast) return;
  pressZoomLast = key;
  loupe.classList.add("is-scrub");
  loupe.style.setProperty("--zoom", value);
  if (quote) quote.classList.toggle("is-zoomed", zoom >= 0.84);
  var decree = document.getElementById("decree-1949");
  if (typeof syncDecreeAnnotProgress === "function") {
    syncDecreeAnnotProgress(zoom, !!(decree && decree.classList.contains("is-front")));
  }
}

function setFade(frame, fade) {
  var value = fade.toFixed(3);
  if (frame.dataset.fade === value) return;
  frame.dataset.fade = value;
  frame.style.setProperty("--fade", value);
  if (frame.parentElement) frame.parentElement.style.setProperty("--fade", value);
}

function awaitDecree(fade) {
  var decree = document.getElementById("decree-1949");
  if (!decree) return;
  // Full page stays visible; only unlock interaction as the story opens.
  decree.classList.toggle("is-awaiting", fade < 0.12);
  // Once the scan is clearly forward, retire the title card so the decree reads as main.
  decree.classList.toggle("is-front", fade >= 0.42);
  var loupe = document.getElementById("ukaz-loupe");
  var zoom = loupe ? parseFloat(getComputedStyle(loupe).getPropertyValue("--zoom")) || 0 : 0;
  if (typeof syncDecreeAnnotProgress === "function") {
    syncDecreeAnnotProgress(zoom, fade >= 0.42);
  }
}

function clearAroundPrize(frame, reel, reveal) {
  var decree = document.getElementById("decree-1949");
  pressLift = 0;
  pressRevealQ = Math.round(reveal * 100) / 100;
  if (decree) {
    decree.style.transform = "";
    decree.style.pointerEvents = reveal < 0.12 ? "none" : "";
  }
  setFade(frame, reveal);
}

function markInstability(current) {
  if (current !== pressCurrent) {
    if (pressCurrent) pressCurrent.classList.remove("is-current");
    if (current) current.classList.add("is-current");
    pressCurrent = current;
  }
  var key = current ? current.dataset.ru : "";
  document.querySelectorAll(".press-rain-line.is-hot").forEach(function (line) {
    line.classList.toggle("is-live", !!key && line.dataset.ru === key);
  });
}
