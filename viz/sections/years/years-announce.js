function parseIsoDay(iso) {
  if (!iso || iso.length < 10) return null;
  var y = +iso.slice(0, 4);
  var m = +iso.slice(5, 7);
  var d = +iso.slice(8, 10);
  if (!y || !m || !d) return null;
  return Date.UTC(y, m - 1, d);
}

function dayToYear(ms) {
  if (ms == null) return null;
  var d = new Date(ms);
  var y = d.getUTCFullYear();
  var start = Date.UTC(y, 0, 1);
  var next = Date.UTC(y + 1, 0, 1);
  return y + (ms - start) / (next - start);
}

var ANNOUNCE_EVENTS = [];
var ANNOUNCE_MARKS = [];

function announceSeriesFill(series) {
  if (series === "stalin") return "#5c4a2e";
  if (series === "lenin_peace") return "#0d545b";
  return "#157e88";
}

function announceSeriesLabel(series) {
  if (series === "stalin") return t("series_stalin");
  if (series === "lenin_peace") return t("series_lenin_peace");
  return t("series_lenin");
}

function announceEvents() {
  var seen = new Map();
  PEOPLE.forEach(function (person) {
    var key = person.year + "\0" + (person.announced || "") + "\0" + person.series;
    var row = seen.get(key);
    if (!row) {
      row = {
        year: person.year,
        yearStart: person.yearStart,
        announced: person.announced || "",
        pravda: person.pravda || "",
        series: person.series,
        n: 0
      };
      seen.set(key, row);
    }
    row.n += 1;
    if (person.pravda && !row.pravda) row.pravda = person.pravda;
  });
  return Array.from(seen.values()).sort(function (a, b) {
    return a.yearStart - b.yearStart ||
      (a.announced || "").localeCompare(b.announced || "") ||
      a.year.localeCompare(b.year);
  });
}

function syncAnnounceLegend() {
  var legend = document.getElementById("announce-legend");
  if (!legend) return;
  legend.replaceChildren();

  function item(swatchClass, labelKey) {
    var span = document.createElement("span");
    var swatch = document.createElement("i");
    swatch.className = "swatch " + swatchClass;
    span.appendChild(swatch);
    span.appendChild(document.createTextNode(" "));
    var label = document.createElement("span");
    label.textContent = t(labelKey);
    span.appendChild(label);
    legend.appendChild(span);
  }

  item("announce-prize", "announcePrize");
  item("announce-date", "announceDate");
  item("announce-pravda", "announcePravda");
}

function announceMorph() {
  if (typeof yearsReduced === "function" && yearsReduced()) return 0;
  if (typeof yearsMode !== "function") return 0;
  var mode = yearsMode();
  if (mode === "plain") return 0;
  if (mode === "stretched") return 1;
  var t = YEAR_SCROLL && YEAR_SCROLL.progress != null ? YEAR_SCROLL.progress : 0;
  var gate = typeof yearMorphGate === "function" ? yearMorphGate() : 0.22;
  return Math.min(1, t / gate);
}

function announceHatchDefs() {
  var defs = svgEl("defs");
  var hatch = svgEl("pattern");
  hatch.setAttribute("id", "announce-span-hatch");
  hatch.setAttribute("patternUnits", "userSpaceOnUse");
  hatch.setAttribute("width", "5");
  hatch.setAttribute("height", "5");
  hatch.setAttribute("patternTransform", "rotate(35)");
  var hatchLine = svgEl("line");
  hatchLine.setAttribute("x1", "0");
  hatchLine.setAttribute("y1", "0");
  hatchLine.setAttribute("x2", "0");
  hatchLine.setAttribute("y2", "5");
  hatchLine.setAttribute("stroke", "rgba(0,0,0,0.42)");
  hatchLine.setAttribute("stroke-width", "1.6");
  hatch.appendChild(hatchLine);
  defs.appendChild(hatch);
  return defs;
}

function appendAnnounceMark(marks, ev, index, layout) {
  var fill = announceSeriesFill(ev.series);
  var size = layout.size;
  var vertical = layout.vertical;
  var cross = layout.cross;
  var annPos = layout.annPos;
  var isSpan = layout.isSpan;
  var group = svgEl("g");
  group.setAttribute("class", "announce-hit");
  group.setAttribute("data-mark", "1");
  group.setAttribute("data-kind", "announce");
  group.setAttribute("data-announce", String(index));
  group.setAttribute("tabindex", "0");
  group.setAttribute("role", "img");
  group.setAttribute("aria-label", announceAriaLabel(ev));

  var hit = svgEl("rect");
  hit.setAttribute("class", "announce-hit-area");
  hit.setAttribute("fill", "transparent");
  group.appendChild(hit);

  var link = null;
  if (annPos != null) {
    link = svgEl("line");
    link.setAttribute("class", "announce-link");
    link.setAttribute("stroke", fill);
    link.setAttribute("aria-hidden", "true");
    group.appendChild(link);
  }

  var prize = svgEl("rect");
  prize.setAttribute("class", "announce-prize-mark");
  prize.setAttribute("fill", "none");
  prize.setAttribute("stroke", fill);
  prize.setAttribute("stroke-width", "1.5");
  prize.setAttribute("aria-hidden", "true");
  group.appendChild(prize);

  var hatch = null;
  if (isSpan) {
    hatch = svgEl("rect");
    hatch.setAttribute("class", "announce-prize-hatch");
    hatch.setAttribute("fill", "url(#announce-span-hatch)");
    hatch.setAttribute("opacity", "0");
    hatch.setAttribute("pointer-events", "none");
    hatch.setAttribute("aria-hidden", "true");
    group.appendChild(hatch);
  }

  if (annPos != null) {
    var dot = svgEl("circle");
    if (vertical) {
      dot.setAttribute("cx", cross.toFixed(2));
      dot.setAttribute("cy", annPos.toFixed(2));
    } else {
      dot.setAttribute("cx", annPos.toFixed(2));
      dot.setAttribute("cy", cross.toFixed(2));
    }
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", fill);
    dot.setAttribute("class", "announce-date-mark");
    dot.setAttribute("aria-hidden", "true");
    group.appendChild(dot);
  }

  if (ev.pravda && ev.pravda !== ev.announced && annPos != null) {
    var tickMark = svgEl("line");
    tickMark.setAttribute("class", "announce-pravda-mark");
    tickMark.setAttribute("stroke", fill);
    tickMark.setAttribute("aria-hidden", "true");
    if (vertical) {
      var tickY = annPos + 6;
      tickMark.setAttribute("x1", (cross - 7).toFixed(2));
      tickMark.setAttribute("x2", (cross + 7).toFixed(2));
      tickMark.setAttribute("y1", tickY.toFixed(2));
      tickMark.setAttribute("y2", tickY.toFixed(2));
    } else {
      var tickX = annPos + 6;
      tickMark.setAttribute("x1", tickX.toFixed(2));
      tickMark.setAttribute("x2", tickX.toFixed(2));
      tickMark.setAttribute("y1", (cross - 7).toFixed(2));
      tickMark.setAttribute("y2", (cross + 7).toFixed(2));
    }
    group.appendChild(tickMark);
  }

  marks.appendChild(group);
  ANNOUNCE_MARKS.push({
    prize: prize,
    hatch: hatch,
    link: link,
    hit: hit,
    vertical: vertical,
    cross: cross,
    annPos: annPos,
    pravdaNudge: ev.pravda && ev.pravda !== ev.announced && annPos != null ? 6 : 0,
    isSpan: isSpan,
    midX: layout.midX,
    midY: layout.midY,
    midW: layout.midW,
    midH: layout.midH,
    spanX: layout.spanX,
    spanY: layout.spanY,
    spanW: layout.spanW,
    spanH: layout.spanH,
    midLink: layout.midLink,
    spanLink: layout.spanLink
  });
}

function applyAnnounceProgress(morph) {
  var m = morph == null ? announceMorph() : Math.min(1, Math.max(0, morph));
  var morphKey = m.toFixed(3);
  ANNOUNCE_MARKS.forEach(function (mark) {
    var x = mark.midX + (mark.spanX - mark.midX) * m;
    var y = mark.midY + (mark.spanY - mark.midY) * m;
    var w = mark.midW + (mark.spanW - mark.midW) * m;
    var h = mark.midH + (mark.spanH - mark.midH) * m;
    mark.prize.setAttribute("x", x.toFixed(2));
    mark.prize.setAttribute("y", y.toFixed(2));
    mark.prize.setAttribute("width", w.toFixed(2));
    mark.prize.setAttribute("height", h.toFixed(2));
    if (mark.hatch) {
      mark.hatch.setAttribute("x", x.toFixed(2));
      mark.hatch.setAttribute("y", y.toFixed(2));
      mark.hatch.setAttribute("width", w.toFixed(2));
      mark.hatch.setAttribute("height", h.toFixed(2));
      mark.hatch.setAttribute("opacity", mark.isSpan ? morphKey : "0");
    }

    var linkPos = mark.midLink + (mark.spanLink - mark.midLink) * m;
    if (mark.link && mark.annPos != null) {
      if (mark.vertical) {
        mark.link.setAttribute("x1", mark.cross.toFixed(2));
        mark.link.setAttribute("y1", linkPos.toFixed(2));
        mark.link.setAttribute("x2", mark.cross.toFixed(2));
        mark.link.setAttribute("y2", mark.annPos.toFixed(2));
      } else {
        mark.link.setAttribute("x1", linkPos.toFixed(2));
        mark.link.setAttribute("y1", mark.cross.toFixed(2));
        mark.link.setAttribute("x2", mark.annPos.toFixed(2));
        mark.link.setAttribute("y2", mark.cross.toFixed(2));
      }
    }

    var endPos = mark.annPos == null ? linkPos : mark.annPos + mark.pravdaNudge;
    if (mark.vertical) {
      var y0 = Math.min(y, endPos);
      var y1 = Math.max(y + h, endPos);
      mark.hit.setAttribute("x", (mark.cross - 10).toFixed(2));
      mark.hit.setAttribute("y", (y0 - 8).toFixed(2));
      mark.hit.setAttribute("width", "20");
      mark.hit.setAttribute("height", Math.max(16, y1 - y0 + 16).toFixed(2));
    } else {
      var x0 = Math.min(x, endPos);
      var x1 = Math.max(x + w, endPos);
      mark.hit.setAttribute("x", (x0 - 8).toFixed(2));
      mark.hit.setAttribute("y", (mark.cross - 10).toFixed(2));
      mark.hit.setAttribute("width", Math.max(16, x1 - x0 + 16).toFixed(2));
      mark.hit.setAttribute("height", "20");
    }
  });
}

function renderAnnounceYears() {
  var host = document.getElementById("announce-chart");
  if (!host) return;
  syncAnnounceLegend();
  host.replaceChildren();
  ANNOUNCE_EVENTS = announceEvents();
  ANNOUNCE_MARKS = [];
  if (typeof yearChartNarrow === "function" && yearChartNarrow()) renderAnnounceYearsStacked();
  else renderAnnounceYearsWide();
  applyAnnounceProgress();
}

function renderAnnounceYearsWide() {
  var host = document.getElementById("announce-chart");
  // Same time axis as Fig. 4 wide (years.js renderYearsTimeline).
  var minYear = 1950;
  var maxYear = 1990;
  var plotW = 900;
  var padL = 28;
  var padR = 24;
  var padT = 12;
  var padB = 36;
  var bandH = 56;
  var width = padL + plotW + padR;
  var height = padT + bandH + padB;
  var axisY = padT + bandH;

  function xYear(year) {
    return padL + (year - minYear) / (maxYear - minYear) * plotW;
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("announceAria"));
  svg.appendChild(announceHatchDefs());

  var axis = svgEl("line");
  axis.setAttribute("x1", padL);
  axis.setAttribute("x2", padL + plotW);
  axis.setAttribute("y1", axisY);
  axis.setAttribute("y2", axisY);
  axis.setAttribute("class", "axis-line");
  svg.appendChild(axis);

  for (var tick = minYear; tick <= maxYear; tick += 5) {
    var tx = xYear(tick);
    var tickLine = svgEl("line");
    tickLine.setAttribute("x1", tx);
    tickLine.setAttribute("x2", tx);
    tickLine.setAttribute("y1", axisY);
    tickLine.setAttribute("y2", axisY + 5);
    tickLine.setAttribute("class", "axis-line");
    svg.appendChild(tickLine);
    var label = svgEl("text");
    label.setAttribute("x", tx);
    label.setAttribute("y", axisY + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis");
    label.textContent = String(tick);
    svg.appendChild(label);
  }

  var marks = svgEl("g");
  marks.setAttribute("class", "announce-marks");
  var size = 8;

  ANNOUNCE_EVENTS.forEach(function (ev, index) {
    var bounds = cohortBounds(ev.year);
    var isSpan = bounds[1] > bounds[0];
    var mid = (bounds[0] + bounds[1]) / 2;
    var midCenter = xYear(mid);
    var spanStart = xYear(bounds[0]);
    var spanEnd = xYear(bounds[1]);
    var announcedMs = parseIsoDay(ev.announced);
    var xAnn = announcedMs == null ? null : xYear(dayToYear(announcedMs));
    var cross = padT + 12 + (index % 3) * 14;
    appendAnnounceMark(marks, ev, index, {
      vertical: false,
      cross: cross,
      size: size,
      annPos: xAnn,
      isSpan: isSpan,
      midX: midCenter - size / 2,
      midY: cross - size / 2,
      midW: size,
      midH: size,
      spanX: spanStart - size / 2,
      spanY: cross - size / 2,
      spanW: spanEnd - spanStart + size,
      spanH: size,
      midLink: midCenter,
      spanLink: spanEnd
    });
  });

  svg.appendChild(marks);
  host.appendChild(svg);
}

function announceMaxStack() {
  var byYear = new Map();
  PEOPLE.forEach(function (person) {
    if (!byYear.has(person.year)) byYear.set(person.year, 0);
    byYear.set(person.year, byYear.get(person.year) + 1);
  });
  var max = 1;
  byYear.forEach(function (n) { if (n > max) max = n; });
  return max;
}

function renderAnnounceYearsStacked() {
  var host = document.getElementById("announce-chart");
  // Same viewBox metrics as Fig. 4 narrow so width:100% scales fonts/rows identically.
  var minYear = 1950;
  var maxYear = 1990;
  var step = 16;
  var rowH = 22;
  var padL = 64;
  var padR = 12;
  var padT = 8;
  var padB = 8;
  var maxStack = announceMaxStack();
  var rows = maxYear - minYear + 1;
  var width = padL + maxStack * step + padR;
  var height = padT + rows * rowH + padB;

  function yYear(year) {
    return padT + (year - minYear) * rowH + rowH / 2;
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("announceAria"));
  svg.appendChild(announceHatchDefs());

  for (var year = minYear; year <= maxYear; year++) {
    var y = yYear(year);
    var label = svgEl("text");
    label.setAttribute("x", padL - 10);
    label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("class", "axis");
    label.textContent = String(year);
    svg.appendChild(label);
  }

  var marks = svgEl("g");
  marks.setAttribute("class", "announce-marks");
  var size = 8;

  ANNOUNCE_EVENTS.forEach(function (ev, index) {
    var bounds = cohortBounds(ev.year);
    var isSpan = bounds[1] > bounds[0];
    var mid = Math.round((bounds[0] + bounds[1]) / 2);
    var midCenter = yYear(mid);
    var spanStart = yYear(bounds[0]);
    var spanEnd = yYear(bounds[1]);
    var announcedMs = parseIsoDay(ev.announced);
    var yAnn = announcedMs == null ? null : yYear(dayToYear(announcedMs));
    var cross = padL + 14 + (index % 3) * 14;
    appendAnnounceMark(marks, ev, index, {
      vertical: true,
      cross: cross,
      size: size,
      annPos: yAnn,
      isSpan: isSpan,
      midX: cross - size / 2,
      midY: midCenter - size / 2,
      midW: size,
      midH: size,
      spanX: cross - size / 2,
      spanY: spanStart - size / 2,
      spanW: size,
      spanH: spanEnd - spanStart + size,
      midLink: midCenter,
      spanLink: spanEnd
    });
  });

  svg.appendChild(marks);
  host.appendChild(svg);
}

function announceAriaLabel(ev) {
  var prize = shortYear(ev.year);
  var parts;
  if (lang === "ru") {
    parts = ["Премия за " + prize];
    if (ev.announced) parts.push("объявлена " + formatAnnounceDay(ev.announced));
    else parts.push("дата объявления не записана");
    if (ev.pravda) parts.push("«Правда» " + formatAnnounceDay(ev.pravda));
  } else {
    parts = ["Prize year " + prize];
    if (ev.announced) parts.push("announced " + formatAnnounceDay(ev.announced));
    else parts.push("announcement date not recorded");
    if (ev.pravda) parts.push("Pravda " + formatAnnounceDay(ev.pravda));
  }
  parts.push(countNoun(ev.n, "person", "people", "человек", "человека", "человек"));
  return parts.join(" · ");
}

function fillAnnounceTip(ev) {
  var panel = document.getElementById("tip");
  if (!panel || !ev) return;
  panel.classList.remove("has-portrait");
  panel.replaceChildren();

  var name = document.createElement("div");
  name.className = "name";
  name.textContent = lang === "ru"
    ? ("Премия за " + shortYear(ev.year))
    : ("Prize year " + shortYear(ev.year));
  panel.appendChild(name);

  var series = document.createElement("div");
  series.className = "ru";
  series.textContent = announceSeriesLabel(ev.series);
  panel.appendChild(series);

  var announced = document.createElement("div");
  announced.className = "meta";
  if (ev.announced) {
    announced.textContent = lang === "ru"
      ? ("Объявлена " + formatAnnounceDay(ev.announced))
      : ("Announced " + formatAnnounceDay(ev.announced));
  } else {
    announced.textContent = lang === "ru"
      ? "Дата объявления не записана"
      : "Announcement date not recorded";
  }
  panel.appendChild(announced);

  if (ev.pravda) {
    var pravda = document.createElement("div");
    pravda.className = "meta";
    pravda.textContent = lang === "ru"
      ? ("«Правда» " + formatAnnounceDay(ev.pravda))
      : ("Pravda " + formatAnnounceDay(ev.pravda));
    panel.appendChild(pravda);
  }

  var count = document.createElement("div");
  count.className = "work";
  count.textContent = countNoun(ev.n, "person", "people", "человек", "человека", "человек");
  panel.appendChild(count);
}

function formatAnnounceDay(iso) {
  if (!iso || iso.length < 10) return iso || "";
  var y = iso.slice(0, 4);
  var m = +iso.slice(5, 7);
  var d = +iso.slice(8, 10);
  if (lang === "ru") {
    var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    return d + " " + months[m - 1] + " " + y;
  }
  var monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return monthsEn[m - 1] + " " + d + ", " + y;
}
