var CENTURY_OTHER = "#c5c1b8";
var CENTURY_OTHER_HOT = "#8f8b84";

function isBorn19th(person) {
  return person.birthYear != null && person.birthYear < 1900;
}

function century19People() {
  return PEOPLE_SEEN.filter(isBorn19th);
}

function renderCenturyChart() {
  var host = document.getElementById("century-chart");
  if (!host) return;
  host.replaceChildren();

  var born19 = century19People();
  var lead = document.getElementById("century-lead");
  if (lead) {
    var years = born19.map(function (person) { return person.birthYear; });
    var oldest = born19.slice().sort(function (a, b) {
      return a.birthYear - b.birthYear || sortName(a).localeCompare(sortName(b), lang);
    });
    lead.textContent = centuryLead({
      n: PEOPLE_SEEN.length,
      bornN: born19.length,
      minBirth: years.length ? Math.min.apply(null, years) : null,
      maxBirth: years.length ? Math.max.apply(null, years) : null,
      oldestNames: joinNames(oldest.slice(0, 1))
    });
  }

  var source = document.getElementById("century-source");
  if (source) source.textContent = t("srcCentury");

  renderCenturyBeeswarm();
}

function renderCenturyBeeswarm() {
  var swarm = beeswarmPlace(PEOPLE_SEEN);
  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + swarm.width + " " + swarm.height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("centuryAria"));

  beeswarmAxis(svg, swarm);

  var hotDots = [];
  swarm.placed.forEach(function (dot) {
    if (isBorn19th(dot.person)) hotDots.push(dot);
    else appendCenturyMark(svg, dot, swarm.screenY, swarm.radius, false);
  });
  hotDots.forEach(function (dot) {
    appendCenturyMark(svg, dot, swarm.screenY, swarm.radius, true);
  });

  document.getElementById("century-chart").appendChild(svg);
  centerCenturyChartScroll();
}

function appendCenturyMark(svg, dot, screenY, radius, born19) {
  var cx = Number(dot.x.toFixed(2));
  var cy = Number(screenY(dot.y).toFixed(2));

  if (born19) {
    var ring = svgEl("circle");
    ring.setAttribute("cx", cx);
    ring.setAttribute("cy", cy);
    ring.setAttribute("r", radius + 4);
    ring.setAttribute("class", "century-ring");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", dot.person.gender === "female" ? FEMALE_HOT : MALE_HOT);
    ring.setAttribute("stroke-width", "1.5");
    ring.setAttribute("pointer-events", "none");
    svg.appendChild(ring);
  }

  var circle = svgEl("circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", born19 ? radius + 1.2 : radius);
  if (born19) {
    paintMark(circle, dot.person);
  } else {
    paintMark(circle, dot.person, CENTURY_OTHER, CENTURY_OTHER_HOT);
  }
  circle.setAttribute("aria-label", centuryMarkAria(dot.person, born19));
  svg.appendChild(circle);
}

function centerCenturyChartScroll() {
  var chart = document.getElementById("century-chart");
  if (!chart) return;
  requestAnimationFrame(function () {
    var maxScroll = chart.scrollWidth - chart.clientWidth;
    if (maxScroll > 0) chart.scrollLeft = maxScroll / 2;
    else chart.scrollLeft = 0;
  });
}
