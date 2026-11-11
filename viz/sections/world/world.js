function worldGroups() {
  var buckets = { first: [], second: [], third: [] };
  PEOPLE.forEach(function (person) {
    buckets[worldOf(person)].push(person);
  });
  return WORLD_ORDER.map(function (key) {
    var people = buckets[key].slice().sort(function (a, b) {
      if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
      return byYear(a, b);
    });
    return { key: key, people: people };
  }).filter(function (group) {
    return group.people.length > 0;
  });
}

function renderWorld() {
  var clouds = document.getElementById("world-clouds");
  var lead = document.getElementById("world-lead");
  var finding = document.getElementById("world-finding");
  if (!clouds) return;

  var groups = worldGroups();
  var women = PEOPLE.filter(function (person) { return person.gender === "female"; });
  var largest = groups.slice().sort(function (a, b) {
    return b.people.length - a.people.length;
  })[0];
  var largestWomen = largest
    ? largest.people.filter(function (person) { return person.gender === "female"; }).length
    : 0;

  if (lead) {
    lead.textContent = splitLead({
      n: PEOPLE.length,
      clouds: groups.length,
      mode: "world"
    });
  }
  if (finding && largest) {
    finding.textContent = splitFinding({
      mode: "world",
      key: largest.key,
      count: largest.people.length,
      n: PEOPLE.length,
      womenHere: largestWomen,
      women: women.length,
      worlds: groups.map(function (group) {
        return { key: group.key, count: group.people.length };
      })
    });
  }

  clouds.replaceChildren();
  groups.forEach(function (group) {
    var figure = document.createElement("figure");
    figure.className = "group";
    var svg = renderCloud(
      group.people,
      12,
      function (person) { return person.gender === "female" ? FEMALE : MALE; },
      function (person) { return person.gender === "female" ? FEMALE_HOT : MALE_HOT; }
    );
    var womenHere = group.people.filter(function (person) { return person.gender === "female"; }).length;
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", cloudAria(group.people.length, worldLabel(group.key), womenHere));
    svg.setAttribute("width", svg.dataset.w);
    svg.setAttribute("height", svg.dataset.h);
    var caption = document.createElement("figcaption");
    var title = document.createElement("span");
    title.className = "title";
    title.textContent = worldLabel(group.key);
    caption.appendChild(title);
    var count = document.createElement("span");
    count.className = "count";
    count.textContent = String(group.people.length);
    caption.appendChild(count);
    figure.appendChild(svg);
    figure.appendChild(caption);
    clouds.appendChild(figure);
    if (typeof fitCaptionTitle === "function") fitCaptionTitle(title, Number(svg.dataset.w));
  });
}
