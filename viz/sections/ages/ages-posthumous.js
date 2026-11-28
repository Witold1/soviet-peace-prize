var POSTHUMOUS_OTHER = "#c5c1b8";
var POSTHUMOUS_OTHER_HOT = "#8f8b84";

function isPosthumous(person) {
  var row = typeof pravdaOccFor === "function" ? pravdaOccFor(person) : null;
  var text = typeof pravdaOccText === "function" ? pravdaOccText(row) : "";
  if (text && text.indexOf("посмертно") !== -1) return true;
  if (person.deathYear == null || !person.announced || person.announced.length < 4) return false;
  var annYear = +person.announced.slice(0, 4);
  if (!annYear) return false;
  // Death year before the announcement year - prize named after death.
  return person.deathYear < annYear;
}

function posthumousPeople() {
  return PEOPLE_SEEN.filter(isPosthumous);
}

function renderPosthumousChart() {
  var host = document.getElementById("posthumous-chart");
  if (!host) return;
  host.replaceChildren();

  var posthumous = posthumousPeople();
  var lead = document.getElementById("posthumous-lead");
  if (lead) {
    lead.textContent = posthumousLead({
      n: PEOPLE_SEEN.length,
      postN: posthumous.length,
      names: joinNames(posthumous)
    });
  }

  var source = document.getElementById("posthumous-source");
  if (source) source.textContent = t("srcPosthumous");

  renderPosthumousBeeswarm();
}

function renderPosthumousBeeswarm() {
  var swarm = beeswarmPlace(PEOPLE_SEEN);
  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + swarm.width + " " + swarm.height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("posthumousAria"));

  beeswarmAxis(svg, swarm);

  var hotDots = [];
  swarm.placed.forEach(function (dot) {
    if (isPosthumous(dot.person)) hotDots.push(dot);
    else appendPosthumousMark(svg, dot, swarm.screenY, swarm.radius, false);
  });
  hotDots.forEach(function (dot) {
    appendPosthumousMark(svg, dot, swarm.screenY, swarm.radius, true);
  });

  document.getElementById("posthumous-chart").appendChild(svg);
  centerPosthumousChartScroll();
}

function appendPosthumousMark(svg, dot, screenY, radius, posthumous) {
  var cx = Number(dot.x.toFixed(2));
  var cy = Number(screenY(dot.y).toFixed(2));

  if (posthumous) {
    var ring = svgEl("circle");
    ring.setAttribute("cx", cx);
    ring.setAttribute("cy", cy);
    ring.setAttribute("r", radius + 4);
    ring.setAttribute("class", "posthumous-ring");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", dot.person.gender === "female" ? FEMALE_HOT : MALE_HOT);
    ring.setAttribute("stroke-width", "1.5");
    ring.setAttribute("pointer-events", "none");
    svg.appendChild(ring);
  }

  var circle = svgEl("circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", posthumous ? radius + 1.2 : radius);
  if (posthumous) {
    paintMark(circle, dot.person);
  } else {
    paintMark(circle, dot.person, POSTHUMOUS_OTHER, POSTHUMOUS_OTHER_HOT);
  }
  circle.setAttribute("aria-label", posthumousMarkAria(dot.person, posthumous));
  svg.appendChild(circle);
}

function centerPosthumousChartScroll() {
  var chart = document.getElementById("posthumous-chart");
  if (!chart) return;
  requestAnimationFrame(function () {
    var maxScroll = chart.scrollWidth - chart.clientWidth;
    if (maxScroll > 0) chart.scrollLeft = maxScroll / 2;
    else chart.scrollLeft = 0;
  });
}
