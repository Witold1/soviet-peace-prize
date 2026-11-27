function renderAges() {
  document.getElementById("age-chart").replaceChildren();
  var youngestAge = Math.min.apply(null, PEOPLE_SEEN.map(function (person) { return person.age; }));
  var oldestAge = Math.max.apply(null, PEOPLE_SEEN.map(function (person) { return person.age; }));
  var youngest = PEOPLE_SEEN.filter(function (person) { return person.age === youngestAge; });
  var oldest = PEOPLE_SEEN.filter(function (person) { return person.age === oldestAge; });
  var mean = PEOPLE_SEEN.reduce(function (sum, person) { return sum + person.age; }, 0) / PEOPLE_SEEN.length;
  var meanText = (Math.round(mean * 10) / 10).toFixed(1);

  document.getElementById("age-lead").textContent = ageLead({
    youngNames: joinNames(youngest),
    youngAge: youngestAge,
    youngN: youngest.length,
    oldNames: joinNames(oldest),
    oldAge: oldestAge,
    oldN: oldest.length,
    meanText: meanText
  });

  renderAgesBeeswarm(mean, meanText);
}

function renderAgesBeeswarm(mean, meanText) {
  var swarm = beeswarmPlace(PEOPLE_SEEN);
  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + swarm.width + " " + swarm.height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", ageAria(meanText));

  var meanX = swarm.xAge(mean);
  var meanLine = svgEl("line");
  meanLine.setAttribute("x1", meanX);
  meanLine.setAttribute("x2", meanX);
  meanLine.setAttribute("y1", 18);
  meanLine.setAttribute("y2", swarm.axisY);
  meanLine.setAttribute("class", "avg-line");
  svg.appendChild(meanLine);
  var meanLabel = svgEl("text");
  meanLabel.setAttribute("x", meanX + 6);
  meanLabel.setAttribute("y", 14);
  meanLabel.setAttribute("class", "avg-label");
  meanLabel.textContent = ageMean(meanText);
  svg.appendChild(meanLabel);

  beeswarmAxis(svg, swarm);

  swarm.placed.forEach(function (dot) {
    var circle = svgEl("circle");
    circle.setAttribute("cx", dot.x.toFixed(2));
    circle.setAttribute("cy", swarm.screenY(dot.y).toFixed(2));
    circle.setAttribute("r", swarm.radius);
    paintMark(circle, dot.person);
    svg.appendChild(circle);
  });

  document.getElementById("age-chart").appendChild(svg);
  centerAgeChartScroll();
}

function centerAgeChartScroll() {
  var chart = document.getElementById("age-chart");
  if (!chart) return;
  requestAnimationFrame(function () {
    var maxScroll = chart.scrollWidth - chart.clientWidth;
    if (maxScroll > 0) chart.scrollLeft = maxScroll / 2;
    else chart.scrollLeft = 0;
  });
}
