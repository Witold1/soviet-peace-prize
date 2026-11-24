var ALIVE_DEAD = "#c5c1b8";
var ALIVE_DEAD_HOT = "#8f8b84";

function alivePeople() {
  return PEOPLE_SEEN.filter(function (person) { return person.living; });
}

function renderAliveChart() {
  var host = document.getElementById("alive-chart");
  if (!host) return;
  host.replaceChildren();

  var living = alivePeople();
  var lead = document.getElementById("alive-lead");
  if (lead) {
    lead.textContent = aliveLead({
      n: PEOPLE_SEEN.length,
      livingN: living.length,
      names: joinNames(living)
    });
  }

  var source = document.getElementById("alive-source");
  if (source) source.textContent = t("srcAlive");

  renderAliveBeeswarm(living);
}

function renderAliveBeeswarm(living) {
  var minAge = 28;
  var maxAge = 96;
  var plotW = 860;
  var radius = 6.5;
  var padL = 36;
  var padR = 24;
  var padT = 28;
  var padB = 36;

  function xAge(age) {
    return padL + (age - minAge) / (maxAge - minAge) * plotW;
  }

  var ordered = PEOPLE_SEEN.slice().sort(function (a, b) {
    return a.age - b.age || sortName(a).localeCompare(sortName(b), lang);
  });
  var placed = [];
  ordered.forEach(function (person) {
    var x = xAge(person.age);
    var y = 0;
    var found = false;
    for (var mag = 0; mag < 500 && !found; mag += 1) {
      var candidates = mag === 0 ? [0] : [mag, -mag];
      for (var c = 0; c < candidates.length; c += 1) {
        var candidate = candidates[c];
        var hit = placed.some(function (other) {
          return Math.hypot(other.x - x, other.y - candidate) < radius * 2 - 0.4;
        });
        if (!hit) {
          y = candidate;
          found = true;
          break;
        }
      }
    }
    placed.push({ person: person, x: x, y: y });
  });

  var ys = placed.map(function (dot) { return dot.y; });
  var minY = Math.min.apply(null, ys);
  var maxY = Math.max.apply(null, ys);
  var swarmH = maxY - minY + radius * 2 + 8;
  var width = padL + plotW + padR;
  var height = padT + swarmH + padB;
  var axisY = padT + swarmH;

  function screenY(y) {
    return padT + (maxY + radius + 4 - y);
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("aliveAria"));

  var axis = svgEl("line");
  axis.setAttribute("x1", padL);
  axis.setAttribute("x2", padL + plotW);
  axis.setAttribute("y1", axisY);
  axis.setAttribute("y2", axisY);
  axis.setAttribute("class", "axis-line");
  svg.appendChild(axis);

  for (var tick = 30; tick <= 90; tick += 10) {
    var x = xAge(tick);
    var tickLine = svgEl("line");
    tickLine.setAttribute("x1", x);
    tickLine.setAttribute("x2", x);
    tickLine.setAttribute("y1", axisY);
    tickLine.setAttribute("y2", axisY + 5);
    tickLine.setAttribute("class", "axis-line");
    svg.appendChild(tickLine);
    var label = svgEl("text");
    label.setAttribute("x", x);
    label.setAttribute("y", axisY + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis");
    label.textContent = String(tick);
    svg.appendChild(label);
  }

  // Draw the deceased first so the living mark stays on top.
  var livingDots = [];
  placed.forEach(function (dot) {
    if (dot.person.living) livingDots.push(dot);
    else appendAliveMark(svg, dot, screenY, radius, false);
  });
  livingDots.forEach(function (dot) {
    appendAliveMark(svg, dot, screenY, radius, true);
  });

  document.getElementById("alive-chart").appendChild(svg);
  centerAliveChartScroll();
}

function appendAliveMark(svg, dot, screenY, radius, living) {
  var cx = Number(dot.x.toFixed(2));
  var cy = Number(screenY(dot.y).toFixed(2));

  if (living) {
    var ring = svgEl("circle");
    ring.setAttribute("cx", cx);
    ring.setAttribute("cy", cy);
    ring.setAttribute("r", radius + 4);
    ring.setAttribute("class", "alive-ring");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", dot.person.gender === "female" ? FEMALE_HOT : MALE_HOT);
    ring.setAttribute("stroke-width", "1.5");
    ring.setAttribute("pointer-events", "none");
    svg.appendChild(ring);
  }

  var circle = svgEl("circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", living ? radius + 1.2 : radius);
  if (living) {
    paintMark(circle, dot.person);
  } else {
    paintMark(circle, dot.person, ALIVE_DEAD, ALIVE_DEAD_HOT);
  }
  circle.setAttribute("aria-label", aliveMarkAria(dot.person));
  svg.appendChild(circle);
}

function centerAliveChartScroll() {
  var chart = document.getElementById("alive-chart");
  if (!chart) return;
  requestAnimationFrame(function () {
    var maxScroll = chart.scrollWidth - chart.clientWidth;
    if (maxScroll > 0) chart.scrollLeft = maxScroll / 2;
    else chart.scrollLeft = 0;
  });
}
