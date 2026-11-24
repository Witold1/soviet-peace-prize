var ANNOUNCE_EVENTS = [];
var ANNOUNCE_MARKS = [];

// Soft washes that sit with pink/teal without mimicking gender marks.
function announceSeriesFill(series) {
  if (series === "stalin") return "#c9a56e";       // ochre gold
  if (series === "lenin_peace") return "#a88bb8";  // plum
  return "#6d8fb5";                               // steel blue (not teal)
}

function announceSeriesTipFill(series) {
  if (series === "stalin") return "#8a6a2e";
  if (series === "lenin_peace") return "#5c3d6b";
  return "#3a5a7a";
}

function announceSeriesLabel(series) {
  if (series === "stalin") return t("series_stalin");
  if (series === "lenin_peace") return t("series_lenin_peace");
  return t("series_lenin");
}

function announceTipRadius(n) {
  return 2.4 + Math.sqrt(Math.max(1, n || 1)) * 3.1;
}

function announceEvents() {
  var seen = new Map();
  PEOPLE_SEEN.forEach(function (person) {
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

function announceRibbonPath(xLeft, xRight, y0, xTip, y1) {
  var h = y1 - y0;
  var c1 = y0 + h * 0.42;
  var c2 = y0 + h * 0.78;
  return "M" + xLeft.toFixed(2) + " " + y0.toFixed(2) +
    " L" + xRight.toFixed(2) + " " + y0.toFixed(2) +
    " C" + xRight.toFixed(2) + " " + c1.toFixed(2) +
    " " + xTip.toFixed(2) + " " + c2.toFixed(2) +
    " " + xTip.toFixed(2) + " " + y1.toFixed(2) +
    " C" + xTip.toFixed(2) + " " + c2.toFixed(2) +
    " " + xLeft.toFixed(2) + " " + c1.toFixed(2) +
    " " + xLeft.toFixed(2) + " " + y0.toFixed(2) +
    " Z";
}

function announceDiamondPoints(cx, cy, r) {
  return cx.toFixed(2) + "," + (cy - r).toFixed(2) + " " +
    (cx + r).toFixed(2) + "," + cy.toFixed(2) + " " +
    cx.toFixed(2) + "," + (cy + r).toFixed(2) + " " +
    (cx - r).toFixed(2) + "," + cy.toFixed(2);
}

function formatAnnounceDay(iso) {
  if (!iso || iso.length < 10) return "";
  var y = iso.slice(0, 4);
  var m = iso.slice(5, 7);
  var d = iso.slice(8, 10);
  if (lang === "ru") return d + "." + m + "." + y;
  return y + "-" + m + "-" + d;
}

function announceAriaLabel(ev) {
  var prize = shortYear(ev.year);
  var parts;
  if (lang === "ru") {
    parts = ["Премия за " + prize, announceSeriesLabel(ev.series)];
    if (ev.announced) parts.push("объявлена " + formatAnnounceDay(ev.announced));
    else parts.push("дата объявления не записана");
  } else {
    parts = ["Prize year " + prize, announceSeriesLabel(ev.series)];
    if (ev.announced) parts.push("announced " + formatAnnounceDay(ev.announced));
    else parts.push("announcement date not recorded");
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

function announceNestedDiamondSwatch() {
  // Nested ромбы, bottom tips aligned (like a size key without numbers).
  var svg = svgEl("svg");
  svg.setAttribute("class", "announce-size-swatch");
  svg.setAttribute("viewBox", "0 0 28 26");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "26");
  svg.setAttribute("aria-hidden", "true");
  var cx = 14;
  var bottom = 24;
  [11, 7, 4].forEach(function (r) {
    var cy = bottom - r;
    var poly = svgEl("polygon");
    poly.setAttribute("points", announceDiamondPoints(cx, cy, r));
    poly.setAttribute("class", "announce-size-swatch-mark");
    svg.appendChild(poly);
  });
  return svg;
}

function announceNestedRectSwatch() {
  // Nested bars, bottom edges aligned (cohort span width key, no numbers).
  var svg = svgEl("svg");
  svg.setAttribute("class", "announce-size-swatch");
  svg.setAttribute("viewBox", "0 0 28 16");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "16");
  svg.setAttribute("aria-hidden", "true");
  var bottom = 14;
  var h = 6;
  [24, 16, 8].forEach(function (w) {
    var rect = svgEl("rect");
    rect.setAttribute("x", ((28 - w) / 2).toFixed(2));
    rect.setAttribute("y", (bottom - h).toFixed(2));
    rect.setAttribute("width", String(w));
    rect.setAttribute("height", String(h));
    rect.setAttribute("rx", "1.5");
    rect.setAttribute("class", "announce-size-swatch-mark");
    svg.appendChild(rect);
  });
  return svg;
}

function syncAnnounceLegend() {
  var legend = document.getElementById("announce-legend");
  if (!legend) return;
  legend.replaceChildren();

  var prize = document.createElement("span");
  prize.appendChild(announceNestedRectSwatch());
  prize.appendChild(document.createTextNode(" "));
  var prizeLabel = document.createElement("span");
  prizeLabel.setAttribute("data-i18n", "announcePrize");
  prizeLabel.textContent = t("announcePrize");
  prize.appendChild(prizeLabel);
  legend.appendChild(prize);

  var date = document.createElement("span");
  date.appendChild(announceNestedDiamondSwatch());
  date.appendChild(document.createTextNode(" "));
  var dateLabel = document.createElement("span");
  dateLabel.setAttribute("data-i18n", "announceDate");
  dateLabel.textContent = t("announceDate");
  date.appendChild(dateLabel);
  legend.appendChild(date);
}

function appendAnnounceDualMark(layers, ev, index, layout) {
  var wash = announceSeriesFill(ev.series);
  var tipFill = announceSeriesTipFill(ev.series);
  var tipR = layout.tipR;

  var ribbon = svgEl("path");
  ribbon.setAttribute("class", "announce-link");
  ribbon.setAttribute("data-announce", String(index));
  ribbon.setAttribute("fill", wash);
  ribbon.setAttribute("stroke", "none");
  ribbon.setAttribute("d", announceRibbonPath(
    layout.xLeft, layout.xRight, layout.yAward, layout.xTip, layout.yAnnounce
  ));
  ribbon.setAttribute("aria-hidden", "true");
  layers.ribbons.appendChild(ribbon);

  var prize = svgEl("rect");
  prize.setAttribute("class", "announce-prize-mark");
  prize.setAttribute("data-announce", String(index));
  prize.setAttribute("x", layout.xLeft.toFixed(2));
  prize.setAttribute("y", (layout.yAward - 3.5).toFixed(2));
  prize.setAttribute("width", Math.max(layout.xRight - layout.xLeft, 4).toFixed(2));
  prize.setAttribute("height", "7");
  prize.setAttribute("rx", "2");
  prize.setAttribute("fill", tipFill);
  prize.setAttribute("aria-hidden", "true");
  layers.tips.appendChild(prize);

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
  var pad = 10;
  var minX = Math.min(layout.xLeft, layout.xRight, layout.xTip) - pad;
  var maxX = Math.max(layout.xLeft, layout.xRight, layout.xTip) + pad;
  hit.setAttribute("x", minX.toFixed(2));
  hit.setAttribute("y", (layout.yAward - pad).toFixed(2));
  hit.setAttribute("width", (maxX - minX).toFixed(2));
  hit.setAttribute("height", (layout.yAnnounce - layout.yAward + tipR + pad * 2).toFixed(2));
  group.appendChild(hit);

  var tip = svgEl("polygon");
  tip.setAttribute("class", "announce-date-mark");
  tip.setAttribute("points", announceDiamondPoints(layout.xTip, layout.yAnnounce, tipR));
  tip.setAttribute("aria-hidden", "true");
  if (layout.missing) {
    tip.setAttribute("fill", "none");
    tip.setAttribute("stroke", tipFill);
    tip.setAttribute("stroke-width", "1.5");
    tip.setAttribute("stroke-dasharray", "2 2");
  } else {
    tip.setAttribute("fill", tipFill);
    tip.setAttribute("stroke", "#fff");
    tip.setAttribute("stroke-width", "1");
  }
  group.appendChild(tip);
  layers.tips.appendChild(group);

  ANNOUNCE_MARKS.push({ group: group, ribbon: ribbon, tip: tip, prize: prize });
}

function drawAnnounceRail(svg, x0, x1, y) {
  var line = svgEl("line");
  line.setAttribute("x1", x0);
  line.setAttribute("x2", x1);
  line.setAttribute("y1", y);
  line.setAttribute("y2", y);
  line.setAttribute("class", "axis-line");
  svg.appendChild(line);
}

// Same tick cadence as Fig. 4; labels sit outside the ribbon band.
function drawAnnounceYearTicks(svg, xYear, y, minYear, maxYear, side) {
  var tickDir = side === "above" ? -5 : 5;
  var labelY = side === "above" ? y - 10 : y + 18;
  for (var tick = minYear; tick <= maxYear; tick += 5) {
    var x = xYear(tick);
    var tickLine = svgEl("line");
    tickLine.setAttribute("x1", x);
    tickLine.setAttribute("x2", x);
    tickLine.setAttribute("y1", y);
    tickLine.setAttribute("y2", y + tickDir);
    tickLine.setAttribute("class", "axis-line");
    svg.appendChild(tickLine);
    var label = svgEl("text");
    label.setAttribute("x", x);
    label.setAttribute("y", labelY);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis");
    label.textContent = String(tick);
    svg.appendChild(label);
  }
}

function renderAnnounceChart() {
  var host = document.getElementById("announce-chart");
  if (!host) return;
  host.replaceChildren();
  ANNOUNCE_EVENTS = announceEvents();
  ANNOUNCE_MARKS = [];
  syncAnnounceLegend();

  var source = document.getElementById("announce-source");
  if (source) {
    source.setAttribute("data-i18n", "srcAnnounce");
    source.textContent = t("srcAnnounce");
  }
  var cap = document.getElementById("cap-announce");
  if (cap) {
    cap.setAttribute("data-i18n", "capAnnounce");
    cap.textContent = t("capAnnounce");
  }

  // Match Fig. 4 timeline metrics so award marks line up with the year columns.
  var minYear = 1950;
  var maxYear = 1990;
  var plotW = 960;
  var padL = 20;
  var padR = 16;
  var size = 18;
  var padT = 32;
  var gap = 168;
  var padB = 36;
  var yAward = padT;
  var yAnnounce = yAward + gap;
  var width = padL + plotW + padR;
  var height = yAnnounce + padB;

  function xYear(year) {
    return padL + (year - minYear) / (maxYear - minYear) * plotW;
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("announceAria"));

  drawAnnounceRail(svg, padL, padL + plotW, yAward);
  drawAnnounceYearTicks(svg, xYear, yAward, minYear, maxYear, "above");
  drawAnnounceRail(svg, padL, padL + plotW, yAnnounce);
  drawAnnounceYearTicks(svg, xYear, yAnnounce, minYear, maxYear, "below");

  var ribbons = svgEl("g");
  ribbons.setAttribute("class", "announce-ribbons");
  var tips = svgEl("g");
  tips.setAttribute("class", "announce-tips");
  var notes = svgEl("g");
  notes.setAttribute("class", "announce-notes");
  svg.appendChild(ribbons);
  svg.appendChild(tips);
  svg.appendChild(notes);
  var layers = { ribbons: ribbons, tips: tips };

  ANNOUNCE_EVENTS.forEach(function (ev, index) {
    var bounds = cohortBounds(ev.year);
    // Same left/right as Fig. 4 stretched cohort bars.
    var xLeft = xYear(bounds[0]) - size / 2;
    var xRight = xYear(bounds[1]) + size / 2;
    var announcedMs = parseIsoDay(ev.announced);
    var missing = announcedMs == null;
    var xTip = missing ? (xLeft + xRight) / 2 : xYear(dayToYear(announcedMs));
    appendAnnounceDualMark(layers, ev, index, {
      xLeft: xLeft,
      xRight: xRight,
      xTip: xTip,
      yAward: yAward,
      yAnnounce: yAnnounce,
      tipR: announceTipRadius(ev.n),
      missing: missing
    });
  });

  host.appendChild(svg);
  // Notes need layout (getBBox) after the SVG is in the document.
  drawAnnounceNotes(notes, xYear, yAward, yAnnounce);
  centerAnnounceChartScroll();
}

function centerAnnounceChartScroll() {
  // Unlike the beeswarm, start at the left (1950) — title and timeline align.
  var chart = document.getElementById("announce-chart");
  if (!chart) return;
  requestAnimationFrame(function () {
    chart.scrollLeft = 0;
  });
}

function fillAnnounceNoteTip(noteId) {
  var panel = document.getElementById("tip");
  if (!panel || !noteId) return;
  panel.classList.remove("has-portrait");
  panel.replaceChildren();
  var body = document.createElement("div");
  body.className = "meta";
  body.setAttribute("data-i18n", noteId);
  body.textContent = t(noteId);
  panel.appendChild(body);
}

function drawAnnounceNotes(layer, xYear, yAward, yAnnounce) {
  var yMid = (yAward + yAnnounce) / 2;
  // Centered short labels; full copy lives in the tip on click/hover.
  var notes = [
    { year: 1953.0, label: "announceNoteLabelAnnual", detail: "announceNoteAnnualStalin" },
    { year: 1956.8, label: "announceNoteLabelRename", detail: "announceNoteRename" },
    { year: 1963.5, label: "announceNoteLabelAnnual", detail: "announceNoteAnnualLenin" },
    { year: 1974.0, label: "announceNoteLabelBiennial", detail: "announceNoteBiennial" },
    { year: 1981.0, label: "announceNoteLabelGap3", detail: "announceNoteGap3" },
    { year: 1988.5, label: "announceNoteLabelPerestroika", detail: "announceNotePerestroika" }
  ];
  notes.forEach(function (note) {
    var x = xYear(note.year);
    var group = svgEl("g");
    group.setAttribute("class", "announce-note");
    group.setAttribute("data-mark", "1");
    group.setAttribute("data-kind", "announce-note");
    group.setAttribute("data-note", note.detail);
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", t(note.label) + ". " + t(note.detail));

    var text = svgEl("text");
    text.setAttribute("x", x.toFixed(2));
    text.setAttribute("y", yMid.toFixed(2));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("class", "announce-note-label");
    text.setAttribute("data-i18n", note.label);
    text.textContent = t(note.label);
    group.appendChild(text);

    layer.appendChild(group);
    var box = text.getBBox();
    var hit = svgEl("rect");
    hit.setAttribute("class", "announce-note-hit");
    hit.setAttribute("x", (box.x - 4).toFixed(2));
    hit.setAttribute("y", (box.y - 3).toFixed(2));
    hit.setAttribute("width", (box.width + 8).toFixed(2));
    hit.setAttribute("height", (box.height + 6).toFixed(2));
    hit.setAttribute("fill", "transparent");
    group.insertBefore(hit, text);
  });
}
