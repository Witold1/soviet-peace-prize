function fitCaptionTitle(title, limit) {
  const text = title.textContent;
  if (!text || text.indexOf(" ") === -1) return;
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  title.appendChild(probe);
  function widthOf(sample) {
    probe.textContent = sample;
    return probe.offsetWidth;
  }
  if (widthOf(text) <= limit) {
    probe.remove();
    return;
  }
  let best = null;
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) !== " ") continue;
    const top = text.slice(0, i);
    const bottom = text.slice(i + 1);
    const topWidth = widthOf(top);
    const bottomWidth = widthOf(bottom);
    const widest = Math.max(topWidth, bottomWidth);
    const balance = Math.abs(topWidth - bottomWidth);
    if (!best || widest < best.widest || (widest === best.widest && balance < best.balance)) {
      best = { top: top, bottom: bottom, widest: widest, balance: balance };
    }
  }
  probe.remove();
  if (!best) return;
  title.textContent = "";
  title.appendChild(document.createTextNode(best.top));
  title.appendChild(document.createElement("br"));
  title.appendChild(document.createTextNode(best.bottom));
}

function occSplitKey(person) {
  return person.occupationClass;
}

function occSplitLabel(key) {
  return titleOcc(key);
}

function occSplitGroups() {
  const buckets = new Map();
  for (const person of PEOPLE) {
    const key = occSplitKey(person);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(person);
  }
  return Array.from(buckets.entries()).map(function (entry) {
    const people = entry[1].slice().sort(function (a, b) {
      if (a.gender !== b.gender) return a.gender === "female" ? -1 : 1;
      return byYear(a, b);
    });
    return { key: entry[0], people: people };
  }).sort(function (a, b) {
    return b.people.length - a.people.length || occSplitLabel(a.key).localeCompare(occSplitLabel(b.key), lang);
  });
}

function syncOccSplitChrome() {
  const cap = document.getElementById("cap-occ");
  if (cap) {
    cap.setAttribute("data-i18n", "capOcc");
    cap.textContent = t("capOcc");
  }
  const source = document.getElementById("src-occ");
  if (source) {
    source.setAttribute("data-i18n", "srcOcc");
    source.textContent = t("srcOcc");
  }
}

function renderOccupations() {
  if (typeof beforeRenderOccupations === "function") beforeRenderOccupations();

  const groups = occSplitGroups();
  const women = PEOPLE.filter(function (person) { return person.gender === "female"; });
  const largest = groups.slice().sort(function (a, b) {
    return b.people.length - a.people.length;
  })[0];
  const largestWomen = largest.people.filter(function (person) { return person.gender === "female"; }).length;
  const otherWomenKeys = new Set(
    women.filter(function (person) { return occSplitKey(person) !== largest.key; })
      .map(function (person) { return occSplitKey(person); })
  );

  const mode = typeof occSplitMode === "function" ? occSplitMode() : "occupation";
  document.getElementById("split-lead").textContent = splitLead({
    n: PEOPLE.length,
    clouds: groups.length,
    mode: mode
  });
  document.getElementById("split-finding").textContent = splitFinding({
    mode: mode,
    key: largest.key,
    occupation: largest.key,
    count: largest.people.length,
    n: PEOPLE.length,
    womenHere: largestWomen,
    women: women.length,
    otherWomen: women.length - largestWomen,
    otherOcc: otherWomenKeys.size,
    worlds: groups.map(function (group) {
      return { key: group.key, count: group.people.length };
    })
  });

  syncOccSplitChrome();

  const clouds = document.getElementById("clouds");
  clouds.replaceChildren();
  for (const group of groups) {
    const figure = document.createElement("figure");
    figure.className = "group";
    const svg = renderCloud(
      group.people,
      12,
      function (person) { return person.gender === "female" ? FEMALE : MALE; },
      function (person) { return person.gender === "female" ? FEMALE_HOT : MALE_HOT; }
    );
    const womenHere = group.people.filter(function (person) { return person.gender === "female"; }).length;
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", cloudAria(group.people.length, occSplitLabel(group.key), womenHere));
    svg.setAttribute("width", svg.dataset.w);
    svg.setAttribute("height", svg.dataset.h);
    const caption = document.createElement("figcaption");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = occSplitLabel(group.key);
    caption.appendChild(title);
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = String(group.people.length);
    caption.appendChild(count);
    figure.appendChild(svg);
    figure.appendChild(caption);
    clouds.appendChild(figure);
    fitCaptionTitle(title, Number(svg.dataset.w));
  }
}
