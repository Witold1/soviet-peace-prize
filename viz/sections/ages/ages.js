function renderAges() {
  document.getElementById("age-chart").replaceChildren();
  const youngestAge = Math.min.apply(null, PEOPLE.map(function (person) { return person.age; }));
  const oldestAge = Math.max.apply(null, PEOPLE.map(function (person) { return person.age; }));
  const youngest = PEOPLE.filter(function (person) { return person.age === youngestAge; });
  const oldest = PEOPLE.filter(function (person) { return person.age === oldestAge; });
  const mean = PEOPLE.reduce(function (sum, person) { return sum + person.age; }, 0) / PEOPLE.length;
  const meanText = (Math.round(mean * 10) / 10).toFixed(1);

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
  const minAge = 28;
  const maxAge = 96;
  const plotW = 860;
  const radius = 6.5;
  const padL = 36;
  const padR = 24;
  const padT = 28;
  const padB = 36;

  function xAge(age) {
    return padL + (age - minAge) / (maxAge - minAge) * plotW;
  }

  const ordered = PEOPLE.slice().sort(function (a, b) {
    return a.age - b.age || sortName(a).localeCompare(sortName(b), lang);
  });
  const placed = [];
  ordered.forEach(function (person) {
    const x = xAge(person.age);
    let y = 0;
    let found = false;
    for (let mag = 0; mag < 500 && !found; mag += 1) {
      const candidates = mag === 0 ? [0] : [mag, -mag];
      for (let c = 0; c < candidates.length; c += 1) {
        const candidate = candidates[c];
        const hit = placed.some(function (other) {
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

  const ys = placed.map(function (dot) { return dot.y; });
  const minY = Math.min.apply(null, ys);
  const maxY = Math.max.apply(null, ys);
  const swarmH = maxY - minY + radius * 2 + 8;
  const width = padL + plotW + padR;
  const height = padT + swarmH + padB;
  const axisY = padT + swarmH;

  function screenY(y) {
    return padT + (maxY + radius + 4 - y);
  }

  const svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", ageAria(meanText));

  const meanX = xAge(mean);
  const meanLine = svgEl("line");
  meanLine.setAttribute("x1", meanX);
  meanLine.setAttribute("x2", meanX);
  meanLine.setAttribute("y1", 18);
  meanLine.setAttribute("y2", axisY);
  meanLine.setAttribute("class", "avg-line");
  svg.appendChild(meanLine);
  const meanLabel = svgEl("text");
  meanLabel.setAttribute("x", meanX + 6);
  meanLabel.setAttribute("y", 14);
  meanLabel.setAttribute("class", "avg-label");
  meanLabel.textContent = ageMean(meanText);
  svg.appendChild(meanLabel);

  const axis = svgEl("line");
  axis.setAttribute("x1", padL);
  axis.setAttribute("x2", padL + plotW);
  axis.setAttribute("y1", axisY);
  axis.setAttribute("y2", axisY);
  axis.setAttribute("class", "axis-line");
  svg.appendChild(axis);

  for (let tick = 30; tick <= 90; tick += 10) {
    const x = xAge(tick);
    const tickLine = svgEl("line");
    tickLine.setAttribute("x1", x);
    tickLine.setAttribute("x2", x);
    tickLine.setAttribute("y1", axisY);
    tickLine.setAttribute("y2", axisY + 5);
    tickLine.setAttribute("class", "axis-line");
    svg.appendChild(tickLine);
    const label = svgEl("text");
    label.setAttribute("x", x);
    label.setAttribute("y", axisY + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis");
    label.textContent = String(tick);
    svg.appendChild(label);
  }

  placed.forEach(function (dot) {
    const circle = svgEl("circle");
    circle.setAttribute("cx", dot.x.toFixed(2));
    circle.setAttribute("cy", screenY(dot.y).toFixed(2));
    circle.setAttribute("r", radius);
    paintMark(circle, dot.person);
    svg.appendChild(circle);
  });

  document.getElementById("age-chart").appendChild(svg);
  centerAgeChartScroll();
}

function centerAgeChartScroll() {
  const chart = document.getElementById("age-chart");
  if (!chart) return;
  requestAnimationFrame(function () {
    const maxScroll = chart.scrollWidth - chart.clientWidth;
    if (maxScroll > 0) chart.scrollLeft = maxScroll / 2;
    else chart.scrollLeft = 0;
  });
}
