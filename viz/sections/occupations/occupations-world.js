// Optional product: Cold War “world” grouping for Fig. 3.
// Loaded after occupations.js. Remove this script to drop the › control.

var OCC_SPLIT = "occupation";

function occSplitMode() {
  return OCC_SPLIT;
}

function occSplitKey(person) {
  return OCC_SPLIT === "world" ? worldOf(person) : person.occupationClass;
}

function occSplitLabel(key) {
  return OCC_SPLIT === "world" ? worldLabel(key) : titleOcc(key);
}

function occSplitGroups() {
  const buckets = new Map();
  for (const person of PEOPLE) {
    const key = occSplitKey(person);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(person);
  }
  const groups = Array.from(buckets.entries()).map(function (entry) {
    const people = entry[1].slice().sort(function (a, b) {
      if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
      return byYear(a, b);
    });
    return { key: entry[0], people: people };
  });
  if (OCC_SPLIT === "world") {
    groups.sort(function (a, b) {
      return WORLD_ORDER.indexOf(a.key) - WORLD_ORDER.indexOf(b.key);
    });
  } else {
    groups.sort(function (a, b) {
      return b.people.length - a.people.length || occSplitLabel(a.key).localeCompare(occSplitLabel(b.key), lang);
    });
  }
  return groups;
}

function ensureOccWorldChrome() {
  var legend = document.getElementById("occ-legend");
  if (!legend) return null;
  var toolbar = legend.closest(".split-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "split-toolbar";
    legend.parentNode.insertBefore(toolbar, legend);
    toolbar.appendChild(legend);
  }
  var button = document.getElementById("split-next");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "split-next";
    button.id = "split-next";
    button.textContent = "›";
    toolbar.appendChild(button);
  }
  return button;
}

function syncOccSplitChrome() {
  var button = ensureOccWorldChrome();
  if (button) {
    button.setAttribute("aria-label", t(OCC_SPLIT === "world" ? "splitNextToWork" : "splitNextToWorld"));
  }
  var cap = document.getElementById("cap-occ");
  if (cap) {
    var capKey = OCC_SPLIT === "world" ? "capOccWorld" : "capOcc";
    cap.setAttribute("data-i18n", capKey);
    cap.textContent = t(capKey);
  }
  var source = document.getElementById("src-occ");
  if (source) {
    var srcKey = OCC_SPLIT === "world" ? "srcOccWorld" : "srcOcc";
    source.setAttribute("data-i18n", srcKey);
    source.textContent = t(srcKey);
  }
}

function beforeRenderOccupations() {
  var button = ensureOccWorldChrome();
  if (!button || button.dataset.bound === "1") return;
  button.dataset.bound = "1";
  button.addEventListener("click", function () {
    OCC_SPLIT = OCC_SPLIT === "world" ? "occupation" : "world";
    renderOccupations();
  });
}
