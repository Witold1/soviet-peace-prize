function yearChartNarrow() {
  var el = document.getElementById("year-chart");
  if (!el) return false;
  if (el.clientWidth > 0) return el.clientWidth < 640;
  return document.documentElement.getAttribute("data-display") === "phone";
}

function yearRowsAllYears(cohorts) {
  // Same span as the desktop timeline: every calendar year 1950-1990.
  // Multi-year cohorts are placed by midpoint for row labels; marks stretch across years.
  const minYear = 1950;
  const maxYear = 1990;
  const atYear = new Map();
  cohorts.forEach(function (entry) {
    const bounds = cohortBounds(entry[0]);
    const mid = Math.round((bounds[0] + bounds[1]) / 2);
    atYear.set(mid, entry);
  });
  const rows = [];
  for (let year = minYear; year <= maxYear; year++) {
    const people = atYear.has(year) ? atYear.get(year)[1] : [];
    rows.push([String(year), people]);
  }
  return rows;
}

function yearHatchDefs() {
  const defs = svgEl("defs");
  const hatch = svgEl("pattern");
  hatch.setAttribute("id", "year-span-hatch");
  hatch.setAttribute("patternUnits", "userSpaceOnUse");
  hatch.setAttribute("width", "5");
  hatch.setAttribute("height", "5");
  hatch.setAttribute("patternTransform", "rotate(35)");
  const hatchLine = svgEl("line");
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

function renderYearsStacked(cohorts) {
  const minYear = 1950;
  const rows = yearRowsAllYears(cohorts);
  const padR = 6;
  const padT = 8;
  const padB = 8;
  const maxStack = Math.max.apply(null, rows.map(function (entry) { return entry[1].length; }).concat([1]));
  const host = document.getElementById("year-chart");
  const width = Math.max(host && host.clientWidth ? host.clientWidth : 0, 280);
  // Fill the host: step grows with plotW so marks aren't tiny on the left of a wide viewBox.
  const labelSlot = 48;
  const padL = labelSlot + 10;
  const plotW = Math.max(width - padL - padR, maxStack);
  const step = plotW / maxStack;
  const size = Math.max(12, step * 0.74);
  const rowH = Math.max(24, Math.round(size + 8));
  const labelPx = Math.max(15, Math.round(size * 0.76));
  const height = padT + rows.length * rowH + padB;
  const markOrigin = padL;

  function yYear(year) {
    return padT + (year - minYear) * rowH + rowH / 2;
  }

  const svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("class", "wide");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t(typeof yearChartAriaKey === "function" ? yearChartAriaKey() : "yearAria"));
  svg.appendChild(yearHatchDefs());

  const stalinGroup = svgEl("g");
  stalinGroup.setAttribute("class", "era-stalin");
  const leninGroup = svgEl("g");
  leninGroup.setAttribute("class", "era-lenin");
  const hatchGroup = svgEl("g");
  hatchGroup.setAttribute("class", "year-span-hatch");
  hatchGroup.setAttribute("pointer-events", "none");

  rows.forEach(function (entry, row) {
    const y = padT + row * rowH + rowH / 2;
    const label = svgEl("text");
    label.setAttribute("x", markOrigin - 8);
    label.setAttribute("y", y + labelPx * 0.35);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("class", "axis");
    label.setAttribute("style", "font-size:" + labelPx + "px");
    label.textContent = entry[0];
    svg.appendChild(label);
  });

  cohorts.forEach(function (entry) {
    const bounds = cohortBounds(entry[0]);
    const isSpan = bounds[1] > bounds[0];
    const spanY = yYear(bounds[0]) - size / 2;
    const spanH = yYear(bounds[1]) - yYear(bounds[0]) + size;
    const ordered = entry[1].slice().sort(sortYearStack);
    ordered.forEach(function (person, index) {
      const x = markOrigin + index * step;
      const rect = svgEl("rect");
      rect.setAttribute("x", x.toFixed(2));
      rect.setAttribute("y", spanY.toFixed(2));
      rect.setAttribute("width", size.toFixed(2));
      rect.setAttribute("height", spanH.toFixed(2));
      paintYearMark(rect, person);
      if (isSpan) {
        const hatchRect = svgEl("rect");
        hatchRect.setAttribute("x", x.toFixed(2));
        hatchRect.setAttribute("y", spanY.toFixed(2));
        hatchRect.setAttribute("width", size.toFixed(2));
        hatchRect.setAttribute("height", spanH.toFixed(2));
        hatchRect.setAttribute("fill", "url(#year-span-hatch)");
        hatchRect.setAttribute("opacity", "1");
        hatchRect.setAttribute("pointer-events", "none");
        hatchGroup.appendChild(hatchRect);
      }
      (person.series === "stalin" ? stalinGroup : leninGroup).appendChild(rect);
    });
  });

  svg.appendChild(stalinGroup);
  svg.appendChild(leninGroup);
  svg.appendChild(hatchGroup);
  document.getElementById("year-chart").appendChild(svg);
}
