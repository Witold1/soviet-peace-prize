var pressRows = [];
var pressTravel = 0;
var pressStory = 0;
var pressEventTravel = 0;
var pressContentTravel = 0;
var pressLift = 0;
var pressStep = 80;

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
  var reel = document.getElementById("press-reel");
  var decree = document.getElementById("decree-1949");
  if (!reel || !decree || decree.parentElement === reel) return;
  reel.appendChild(decree);
  decree.style.transform = "";
}

function renderPress() {
  placeDecree();
  var list = document.getElementById("press-list");
  var frame = document.getElementById("press-frame");
  if (!list || !frame || typeof buildPressSample !== "function") return;
  var items = buildPressSample();
  list.textContent = "";
  pressRows = [];
  items.forEach(function (item) {
    var line = document.createElement("li");
    var text = lang === "ru" ? item.ru : item.en;
    line.className = "press-line" + (item.filler ? " is-filler" : "") + (item.instability ? " is-instability" : "") + (item.prize ? " is-prize" : "") + (item.aside ? " is-aside" : "");
    if (item.prize) line.id = "press-prize";
    line.dataset.iso = item.iso;
    line.dataset.ru = item.ru;
    line.dataset.en = item.en;
    line.textContent = text;
    list.appendChild(line);
    list.appendChild(document.createTextNode(" "));
    pressRows.push(line);
  });
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
    decree.classList.remove("is-awaiting");
    decree.style.transform = "";
  }
  setFade(frame, 0);
  if (pressReduced()) {
    if (decree) decree.classList.remove("is-awaiting");
    section.style.height = "";
    reel.style.transform = "";
    placeIssue(null);
    return;
  }
  reel.style.transform = "none";
  var events = redEvents();
  pressEventTravel = events.length * pressStep;
  pressContentTravel = Math.max(0, reel.scrollHeight - frame.clientHeight);
  pressStory = Math.max(pressEventTravel, pressContentTravel, pressFadeStart() + pressFadeDistance());
  pressTravel = pressStory + pressPageHold() + pressZoomDistance() + pressZoomHold();
  var pinH = pin.offsetHeight;
  awaitDecree(0);
  section.style.height = (pressCaptionSpace(section) + pinH + pressTravel) + "px";
}

function redEvents() {
  return pressRows.filter(function (row) {
    return row.classList.contains("is-instability") && !row.classList.contains("is-aside");
  });
}

function syncPress() {
  var section = document.getElementById("prize");
  var frame = document.getElementById("press-frame");
  var reel = document.getElementById("press-reel");
  if (!section || !frame || !reel || !pressRows.length) return;
  if (pressReduced()) {
    var resting = redEvents()[0];
    markInstability(resting);
    syncIssue(resting ? resting.dataset.iso : pressRows[0].dataset.iso);
    setFade(frame, 0);
    placeIssue(null);
    syncDecreeZoom(0, false);
    return;
  }
  var passed = Math.min(pressTravel, Math.max(0, 16 - section.getBoundingClientRect().top - pressCaptionSpace(section)));
  var slack = frame.clientHeight - reel.scrollHeight;
  var base = slack > 0 ? slack / 2 : 0;
  var storyPassed = Math.min(pressStory, passed);
  var revealStart = pressFadeStart();
  var span = Math.max(pressFadeDistance(), pressStory - revealStart);
  var reveal = Math.min(1, Math.max(0, (storyPassed - revealStart) / span));
  var shift = base - pressContentTravel * reveal;
  reel.style.transform = shift ? "translateY(" + shift + "px)" : "none";
  var events = redEvents();
  var index = 0;
  if (events.length) {
    index = passed >= pressTravel ? events.length - 1 : Math.min(events.length - 1, Math.floor(passed / pressStep));
  }
  var currentEvent = events[index] || null;
  markInstability(currentEvent);
  syncIssue(currentEvent ? currentEvent.dataset.iso : pressRows[0].dataset.iso);
  clearAroundPrize(frame, reel, reveal);
  awaitDecree(reveal);
  placeIssue(document.getElementById("press-list"));
  var zoomStart = pressStory + pressPageHold();
  var zoom = Math.min(1, Math.max(0, (passed - zoomStart) / pressZoomDistance()));
  syncDecreeZoom(zoom, true);
}

function pressCaptionSpace(section) {
  var cap = section.querySelector(".figcap");
  if (!cap) return 0;
  var style = getComputedStyle(cap);
  return cap.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
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
    loupe.style.removeProperty("--zoom");
    loupe.classList.remove("is-scrub");
    if (quote) quote.classList.remove("is-zoomed");
    return;
  }
  loupe.classList.add("is-scrub");
  loupe.style.setProperty("--zoom", zoom.toFixed(3));
  if (quote) quote.classList.toggle("is-zoomed", zoom >= 0.84);
}

function setFade(frame, fade) {
  var value = fade.toFixed(3);
  frame.style.setProperty("--fade", value);
  if (frame.parentElement) frame.parentElement.style.setProperty("--fade", value);
}

function awaitDecree(fade) {
  var decree = document.getElementById("decree-1949");
  if (decree) decree.classList.toggle("is-awaiting", fade < 0.02);
}

function clearAroundPrize(frame, reel, reveal) {
  var decree = document.getElementById("decree-1949");
  var prize = document.getElementById("press-prize");
  var fade = reveal;
  if (fade && decree && prize && decree.parentElement === reel) {
    var prizeRect = prize.getBoundingClientRect();
    var decreeRect = decree.getBoundingClientRect();
    var list = document.getElementById("press-list");
    var narrow = frame.clientWidth < 1100;
    var anchor = narrow && list ? list.getBoundingClientRect().bottom : prizeRect.bottom;
    var naturalGap = decreeRect.top - anchor - pressLift;
    var room = narrow ? 10 : 36;
    var lift = -Math.max(0, naturalGap - room) * fade;
    var frameTop = frame.getBoundingClientRect().top;
    var nextTop = decreeRect.top - pressLift + lift;
    if (nextTop < frameTop + 8) lift += frameTop + 8 - nextTop;
    pressLift = lift;
    decree.style.transform = lift ? "translateY(" + lift.toFixed(2) + "px)" : "";
  } else {
    pressLift = 0;
    if (decree) decree.style.transform = "";
  }
  if (decree) decree.style.pointerEvents = fade <= 0 && decree.parentElement === reel ? "none" : "";
  setFade(frame, fade);
}

function placeIssue(list) {
  var issue = document.getElementById("press-issue");
  var frame = document.getElementById("press-frame");
  if (!issue) return;
  if (!list || !frame) {
    issue.style.top = "";
    issue.style.bottom = "";
    issue.style.transform = "";
    return;
  }
  issue.style.bottom = "auto";
  issue.style.transform = "translateY(-50%)";
  var band = issue.parentElement;
  var bandRect = band.getBoundingClientRect();
  var listRect = list.getBoundingClientRect();
  var frameRect = frame.getBoundingClientRect();
  var visibleTop = Math.max(listRect.top, frameRect.top);
  var visibleBottom = Math.min(listRect.bottom, frameRect.bottom);
  var mid = visibleBottom > visibleTop ? (visibleTop + visibleBottom) / 2 : frameRect.top + frameRect.height / 2;
  var half = issue.getBoundingClientRect().height / 2;
  mid = Math.max(frameRect.top + half, Math.min(mid, frameRect.bottom - half));
  issue.style.top = (mid - bandRect.top) + "px";
}

function markInstability(current) {
  pressRows.forEach(function (row) {
    row.classList.toggle("is-current", row === current);
  });
}
