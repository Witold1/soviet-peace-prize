const CUBE_DIRS = [
  [1, -1, 0],
  [1, 0, -1],
  [0, 1, -1],
  [-1, 1, 0],
  [-1, 0, 1],
  [0, -1, 1],
];

function cubeAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function cubeScale(a, k) {
  return [a[0] * k, a[1] * k, a[2] * k];
}

function cubeRing(radius) {
  const results = [];
  let hex = cubeScale(CUBE_DIRS[4], radius);
  for (let i = 0; i < 6; i++) {
    for (let step = 0; step < radius; step++) {
      results.push(hex);
      hex = cubeAdd(hex, CUBE_DIRS[i]);
    }
  }
  return results;
}

function spiral(n) {
  const results = [[0, 0, 0]];
  for (let radius = 1; results.length < n; radius++) {
    results.push(...cubeRing(radius));
  }
  return results.slice(0, n);
}

// Same hex lattice as spiral, but keep the n points nearest the origin so the
// silhouette reads as a round disc (Flourish-style) instead of a big hexagon.
function disk(n) {
  const pool = spiral(Math.max(n * 2, n + 36));
  const ranked = pool.map(function (cube) {
    const center = pixel(cube[0], cube[1], 1);
    return {
      x: center.x,
      y: center.y,
      d: center.x * center.x + center.y * center.y,
      q: cube[0],
      r: cube[1],
    };
  });
  ranked.sort(function (a, b) {
    return a.d - b.d || a.q - b.q || a.r - b.r;
  });
  return ranked.slice(0, n).map(function (item) {
    return { x: item.x, y: item.y };
  });
}

function pixel(q, r, size) {
  return {
    x: size * (1.5 * q),
    y: size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r),
  };
}

function hexPoints(cx, cy, radius) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    pts.push(
      (cx + radius * Math.cos(angle)).toFixed(2) + "," +
      (cy + radius * Math.sin(angle)).toFixed(2)
    );
  }
  return pts.join(" ");
}

function titleOcc(value) {
  return occLabel(value);
}

function renderCloud(people, size, fillOf, hotOf) {
  const coords = spiral(people.length);
  const centers = coords.map(([q, r]) => pixel(q, r, size));
  const draw = size * 0.93;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const center of centers) {
    minX = Math.min(minX, center.x);
    minY = Math.min(minY, center.y);
    maxX = Math.max(maxX, center.x);
    maxY = Math.max(maxY, center.y);
  }
  const pad = size + 2;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const width = maxX - minX;
  const height = maxY - minY;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", minX + " " + minY + " " + width + " " + height);
  svg.dataset.w = String(width);
  svg.dataset.h = String(height);
  people.forEach((person, index) => {
    const poly = document.createElementNS(SVG_NS, "polygon");
    const center = centers[index];
    poly.setAttribute("points", hexPoints(center.x, center.y, draw));
    const fill = fillOf(person);
    poly.setAttribute("fill", fill);
    poly.dataset.fill = fill;
    poly.dataset.hot = hotOf(person);
    poly.dataset.i = String(person.i);
    poly.dataset.mark = "1";
    poly.dataset.stroke = "none";
    poly.setAttribute("tabindex", "0");
    poly.setAttribute("role", "img");
    poly.setAttribute("aria-label", markAria(person));
    if (!wikiFor(person)) poly.classList.add("no-link");
    svg.appendChild(poly);
  });
  return svg;
}

function renderRows(people, size, columns, fillOf, hotOf) {
  const radius = size * 0.92;
  const colStep = size * 2.15;
  const rowStep = size * Math.sqrt(3) + 4;
  const cols = Math.min(columns, people.length);
  const rows = Math.ceil(people.length / columns);
  const minX = -radius - 2;
  const minY = -radius - 2;
  const width = (cols - 1) * colStep + radius * 2 + 4;
  const height = (rows - 1) * rowStep + radius * 2 + 4;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", minX + " " + minY + " " + width + " " + height);
  svg.dataset.w = String(width);
  svg.dataset.h = String(height);
  people.forEach(function (person, index) {
    const poly = document.createElementNS(SVG_NS, "polygon");
    poly.setAttribute("points", hexPoints((index % columns) * colStep, Math.floor(index / columns) * rowStep, radius));
    const fill = fillOf(person);
    poly.setAttribute("fill", fill);
    poly.dataset.fill = fill;
    poly.dataset.hot = hotOf(person);
    poly.dataset.i = String(person.i);
    poly.dataset.mark = "1";
    poly.dataset.stroke = "none";
    poly.setAttribute("tabindex", "0");
    poly.setAttribute("role", "img");
    poly.setAttribute("aria-label", markAria(person));
    if (!wikiFor(person)) poly.classList.add("no-link");
    svg.appendChild(poly);
  });
  return svg;
}

function byYear(a, b) {
  return a.yearStart - b.yearStart || sortName(a).localeCompare(sortName(b), lang);
}
