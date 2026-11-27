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

  renderAliveBeeswarm();
}

function renderAliveBeeswarm() {
  var swarm = beeswarmPlace(PEOPLE_SEEN);
  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + swarm.width + " " + swarm.height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("aliveAria"));

  beeswarmAxis(svg, swarm);

  // Draw the deceased first so the living mark stays on top.
  var livingDots = [];
  swarm.placed.forEach(function (dot) {
    if (dot.person.living) livingDots.push(dot);
    else appendAliveMark(svg, dot, swarm.screenY, swarm.radius, false);
  });
  livingDots.forEach(function (dot) {
    appendAliveMark(svg, dot, swarm.screenY, swarm.radius, true);
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
