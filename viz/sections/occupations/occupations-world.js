// Optional product: Cold War “world” grouping — parked at #worlds for now.
// Does not overwrite main occupations.js split hooks.

function worldOccSplitGroups() {
  var buckets = new Map();
  PEOPLE_SEEN.forEach(function (person) {
    var key = worldOf(person);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(person);
  });
  return Array.from(buckets.entries()).map(function (entry) {
    var people = entry[1].slice().sort(function (a, b) {
      if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
      return byYear(a, b);
    });
    return { key: entry[0], people: people };
  }).sort(function (a, b) {
    return WORLD_ORDER.indexOf(a.key) - WORLD_ORDER.indexOf(b.key);
  });
}

function syncWorldParkOccChrome() {
  var cap = document.getElementById("cap-world-occ");
  if (cap) {
    cap.setAttribute("data-i18n", "capOccWorld");
    cap.textContent = t("capOccWorld");
  }
  var source = document.getElementById("src-world-occ");
  if (source) {
    source.setAttribute("data-i18n", "srcOccWorld");
    source.textContent = t("srcOccWorld");
  }
  var legend = document.getElementById("world-occ-legend");
  if (!legend) return;
  legend.replaceChildren();
  [["female", "female"], ["male", "male"]].forEach(function (row) {
    var item = document.createElement("span");
    var swatch = document.createElement("i");
    swatch.className = "swatch " + row[0];
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(" "));
    var label = document.createElement("span");
    label.textContent = t(row[1]);
    item.appendChild(label);
    legend.appendChild(item);
  });
}

function renderWorldParkOcc() {
  var host = document.getElementById("world-clouds");
  if (!host || typeof renderCloud !== "function") return;

  syncWorldParkOccChrome();

  var groups = worldOccSplitGroups();
  host.replaceChildren();
  groups.forEach(function (group) {
    var figure = document.createElement("figure");
    figure.className = "group";
    figure.dataset.worldKey = group.key;
    var svg = renderCloud(
      group.people,
      typeof occHexSize === "function" ? occHexSize() : 12,
      function (person) { return person.gender === "female" ? FEMALE : MALE; },
      function (person) { return person.gender === "female" ? FEMALE_HOT : MALE_HOT; }
    );
    var womenHere = group.people.filter(function (person) { return person.gender === "female"; }).length;
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", cloudAria(group.people.length, worldLabel(group.key), womenHere));
    svg.setAttribute("width", svg.dataset.w);
    svg.setAttribute("height", svg.dataset.h);
    var caption = document.createElement("figcaption");
    var line = document.createElement("span");
    line.className = "caption-line";
    line.textContent = group.people.length + " " + worldLabel(group.key);
    caption.appendChild(line);
    figure.appendChild(svg);
    figure.appendChild(caption);
    host.appendChild(figure);
    if (typeof occChartNarrow === "function" && occChartNarrow()) {
      line.style.whiteSpace = "normal";
    } else if (typeof fitCaptionTitle === "function") {
      fitCaptionTitle(line, Number(svg.dataset.w));
    }
  });
}

function renderWorldPark() {
  renderWorldParkOcc();
  if (typeof renderWorldParkYears === "function") renderWorldParkYears();
}
