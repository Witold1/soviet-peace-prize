// Shared 1D beeswarm packing for age / alive charts.

function beeswarmPlace(people, opts) {
  opts = opts || {};
  var minAge = opts.minAge == null ? 28 : opts.minAge;
  var maxAge = opts.maxAge == null ? 96 : opts.maxAge;
  var plotW = opts.plotW == null ? 860 : opts.plotW;
  var radius = opts.radius == null ? 6.5 : opts.radius;
  var padL = opts.padL == null ? 36 : opts.padL;
  var padR = opts.padR == null ? 24 : opts.padR;
  var padT = opts.padT == null ? 28 : opts.padT;
  var padB = opts.padB == null ? 36 : opts.padB;

  function xAge(age) {
    return padL + (age - minAge) / (maxAge - minAge) * plotW;
  }

  var ordered = people.slice().sort(function (a, b) {
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

  return {
    placed: placed,
    radius: radius,
    padL: padL,
    padR: padR,
    padT: padT,
    padB: padB,
    plotW: plotW,
    width: width,
    height: height,
    axisY: axisY,
    xAge: xAge,
    screenY: screenY
  };
}

function beeswarmAxis(svg, swarm) {
  var axis = svgEl("line");
  axis.setAttribute("x1", swarm.padL);
  axis.setAttribute("x2", swarm.padL + swarm.plotW);
  axis.setAttribute("y1", swarm.axisY);
  axis.setAttribute("y2", swarm.axisY);
  axis.setAttribute("class", "axis-line");
  svg.appendChild(axis);

  for (var tick = 30; tick <= 90; tick += 10) {
    var x = swarm.xAge(tick);
    var tickLine = svgEl("line");
    tickLine.setAttribute("x1", x);
    tickLine.setAttribute("x2", x);
    tickLine.setAttribute("y1", swarm.axisY);
    tickLine.setAttribute("y2", swarm.axisY + 5);
    tickLine.setAttribute("class", "axis-line");
    svg.appendChild(tickLine);
    var label = svgEl("text");
    label.setAttribute("x", x);
    label.setAttribute("y", swarm.axisY + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis");
    label.textContent = String(tick);
    svg.appendChild(label);
  }
}
