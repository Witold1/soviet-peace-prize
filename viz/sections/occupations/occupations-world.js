// Optional product: Cold War “world” grouping - parked at #worlds for now.
// Does not overwrite main occupations.js split hooks.

function worldOccSplitGroups() {
  var buckets = new Map();
  PEOPLE_SEEN.forEach(function (person) {
    var key = worldOf(person);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(person);
  });
  return Array.from(buckets.entries()).map(function (entry) {
    return {
      key: entry[0],
      people: entry[1].slice().sort(occSortPeople)
    };
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
    occAppendCloudFigure(host, group, {
      dataAttr: "worldKey",
      label: worldLabel(group.key),
      caption: group.people.length + " " + worldLabel(group.key),
      fitTitle: true
    });
  });
}

function renderWorldPark() {
  renderWorldParkOcc();
  if (typeof renderWorldParkYears === "function") renderWorldParkYears();
}
