var pressRows = [];
var pressEvents = [];
var pressTravel = 0;
var pressStory = 0;
var pressEventTravel = 0;
var pressContentTravel = 0;
var pressLift = 0;
var pressStep = 80;
var pressCaptionCached = 0;
var pressSlack = 0;
var pressCurrent = null;
var pressZoomLast = "";
var pressRevealQ = -1;
var pressShiftLast = "";
var pressIssueTopLast = "";

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
  pressEvents = redEvents();
  pressCurrent = null;
  pressZoomLast = "";
  pressRevealQ = -1;
  pressShiftLast = "";
  pressIssueTopLast = "";
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
  pressEvents = redEvents();
  pressEventTravel = pressEvents.length * pressStep;
  pressSlack = frame.clientHeight - reel.scrollHeight;
  pressContentTravel = Math.max(0, -pressSlack);
  pressStory = Math.max(pressEventTravel, pressContentTravel, pressFadeStart() + pressFadeDistance());
  pressTravel = pressStory + pressPageHold() + pressZoomDistance() + pressZoomHold();
  var pinH = pin.offsetHeight;
  pressCaptionCached = pressCaptionSpace(section);
  pressZoomLast = "";
  pressRevealQ = -1;
  pressShiftLast = "";
  pressIssueTopLast = "";
  awaitDecree(0);
  section.style.height = (pressCaptionCached + pinH + pressTravel) + "px";
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
    var resting = pressEvents[0];
    markInstability(resting);
    syncIssue(resting ? resting.dataset.iso : pressRows[0].dataset.iso);
    setFade(frame, 0);
    placeIssue(null);
    syncDecreeZoom(0, false);
    return;
  }
  var passed = Math.min(pressTravel, Math.max(0, 16 - section.getBoundingClientRect().top - pressCaptionCached));
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
  if (shiftChanged || !pressIssueTopLast) placeIssue(document.getElementById("press-list"));
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
    pressZoomLast = "";
    loupe.style.removeProperty("--zoom");
    loupe.classList.remove("is-scrub");
    if (quote) quote.classList.remove("is-zoomed");
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
  if (decree) decree.classList.toggle("is-awaiting", fade < 0.02);
}

function clearAroundPrize(frame, reel, reveal) {
  var decree = document.getElementById("decree-1949");
  var prize = document.getElementById("press-prize");
  var fade = reveal;
  var revealQ = Math.round(fade * 100) / 100;
  if (fade && decree && prize && decree.parentElement === reel) {
    if (revealQ !== pressRevealQ) {
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
    }
  } else if (pressLift || (decree && decree.style.transform)) {
    pressLift = 0;
    if (decree) decree.style.transform = "";
  }
  pressRevealQ = revealQ;
  if (decree) decree.style.pointerEvents = fade <= 0 && decree.parentElement === reel ? "none" : "";
  setFade(frame, fade);
}

function placeIssue(list) {
  var issue = document.getElementById("press-issue");
  var frame = document.getElementById("press-frame");
  if (!issue) return;
  if (!list || !frame) {
    pressIssueTopLast = "";
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
  var half = issue.offsetHeight / 2;
  mid = Math.max(frameRect.top + half, Math.min(mid, frameRect.bottom - half));
  var top = (mid - bandRect.top).toFixed(1) + "px";
  if (top === pressIssueTopLast) return;
  pressIssueTopLast = top;
  issue.style.top = top;
}

function markInstability(current) {
  if (current === pressCurrent) return;
  if (pressCurrent) pressCurrent.classList.remove("is-current");
  if (current) current.classList.add("is-current");
  pressCurrent = current;
}
