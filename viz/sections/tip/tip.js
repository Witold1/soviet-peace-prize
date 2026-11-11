const tip = document.getElementById("tip");
let current = null;
let pinned = false;

function formatCoord(value) {
  return String(Math.round(value * 100000) / 100000);
}

function appendWikiLink(person) {
  const url = wikiFor(person);
  const hintText = wikiHint(person);
  if (!url || !hintText) return;
  const hint = document.createElement("a");
  hint.className = "linkhint";
  hint.href = url;
  hint.target = "_blank";
  hint.rel = "noopener noreferrer";
  hint.textContent = hintText;
  tip.appendChild(hint);
}

function portraitSrc(person) {
  var portraits = typeof PORTRAITS === "object" && PORTRAITS ? PORTRAITS : null;
  if (!portraits || person == null || person.i == null) return "";
  return portraits[person.i] || "";
}

function fillTip(person, options) {
  tip.replaceChildren();
  var withPortrait = !(options && options.skipPortrait);
  var src = withPortrait ? portraitSrc(person) : "";
  if (src) {
    tip.classList.add("has-portrait");
    var face = document.createElement("div");
    face.className = "face";
    var img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.draggable = false;
    img.setAttribute("aria-hidden", "true");
    face.appendChild(img);
    tip.appendChild(face);
  } else {
    tip.classList.remove("has-portrait");
  }
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = personName(person);
  tip.appendChild(name);
  const alt = personAlt(person);
  if (alt) {
    const ru = document.createElement("div");
    ru.className = "ru";
    ru.textContent = alt;
    tip.appendChild(ru);
  }
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.appendChild(document.createTextNode(tipPrizeLine(person)));
  meta.appendChild(document.createElement("br"));
  meta.appendChild(document.createTextNode(tipPlaceAgeLine(person)));
  tip.appendChild(meta);
  const occ = document.createElement("div");
  occ.className = "meta";
  occ.textContent = titleOcc(person.occupation);
  tip.appendChild(occ);
  const workValue = workText(person);
  if (workValue) {
    const work = document.createElement("div");
    work.className = "work";
    work.textContent = workValue;
    tip.appendChild(work);
  }
  appendWikiLink(person);
}

function placeTip(x, y) {
  tip.hidden = false;
  tip.style.left = "0px";
  tip.style.top = "0px";
  const rect = tip.getBoundingClientRect();
  const pad = 14;
  let left = x + pad;
  let top = y + pad;
  if (left + rect.width > window.innerWidth - 8) left = Math.max(8, x - rect.width - pad);
  if (top + rect.height > window.innerHeight - 8) top = Math.max(8, y - rect.height - pad);
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}

function markFrom(target) {
  if (!target || !target.closest) return null;
  return target.closest("[data-mark]");
}

function insideTip(target) {
  return !!(target && tip.contains(target));
}

function fillPlaceTip(group) {
  if (group.people.length === 1) {
    fillTip(group.people[0]);
    const born = document.createElement("div");
    born.className = "meta";
    born.textContent = bornLine(birthPlaceText(group.people[0]) || group.label);
    tip.querySelector(".name").insertAdjacentElement("afterend", born);
    return;
  }
  tip.classList.remove("has-portrait");
  tip.replaceChildren();
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = group.label;
  tip.appendChild(name);
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = groupBorn(group.people.length);
  tip.appendChild(meta);
  const list = document.createElement("div");
  list.className = "work";
  const names = group.people.map(personName);
  const shown = names.slice(0, 8);
  list.textContent = shown.join(", ") + (names.length > shown.length ? moreNames(names.length - shown.length) : "");
  tip.appendChild(list);
}

function restoreMark(mark) {
  if (mark.dataset.kind === "medal" || mark.dataset.kind === "portrait") {
    mark.classList.remove("is-hot");
    var tile = mark.querySelector(".tile");
    if (tile && tile.dataset.fill) tile.style.background = tile.dataset.fill;
    return;
  }
  mark.setAttribute("fill", mark.dataset.fill);
  mark.setAttribute("stroke", mark.dataset.stroke || "none");
}

function activate(mark, x, y) {
  if (current && current !== mark) restoreMark(current);
  current = mark;
  if (mark.dataset.kind === "medal" || mark.dataset.kind === "portrait") {
    mark.classList.add("is-hot");
    var tile = mark.querySelector(".tile");
    if (tile && tile.dataset.hot) tile.style.background = tile.dataset.hot;
  } else {
    mark.setAttribute("fill", mark.dataset.hot);
    mark.setAttribute("stroke", "#000");
    if (!mark.getAttribute("stroke-width")) mark.setAttribute("stroke-width", "1.25");
    mark.setAttribute("vector-effect", "non-scaling-stroke");
  }
  var onWall = mark.dataset.kind === "medal" || mark.dataset.kind === "portrait";
  if (mark.dataset.g) fillPlaceTip(PLACE_GROUPS[Number(mark.dataset.g)]);
  else fillTip(PEOPLE[Number(mark.dataset.i)], { skipPortrait: onWall });
  if (mark.dataset.coords) {
    const person = PEOPLE[Number(mark.dataset.i)];
    const born = document.createElement("div");
    born.className = "meta";
    born.textContent = coordLine(birthPlaceText(person), formatCoord(person.birthLat), formatCoord(person.birthLon));
    tip.querySelector(".name").insertAdjacentElement("afterend", born);
  }
  placeTip(x, y);
}

function deactivate(mark) {
  if (mark && current !== mark) return;
  if (current) restoreMark(current);
  current = null;
  pinned = false;
  tip.hidden = true;
  tip.classList.remove("has-portrait");
}

document.body.addEventListener("pointerover", function (event) {
  if (insideTip(event.target)) return;
  if (pinned) return;
  const mark = markFrom(event.target);
  if (!mark) return;
  activate(mark, event.clientX, event.clientY);
});

document.body.addEventListener("pointermove", function (event) {
  if (!current || pinned || insideTip(event.target)) return;
  placeTip(event.clientX, event.clientY);
});

document.body.addEventListener("pointerout", function (event) {
  const toTip = insideTip(event.relatedTarget);
  const mark = markFrom(event.target);
  if (mark) {
    const next = markFrom(event.relatedTarget);
    if (next === mark || toTip || pinned) return;
    deactivate(mark);
    return;
  }
  if (insideTip(event.target) && !toTip && !markFrom(event.relatedTarget) && !pinned) {
    deactivate(current);
  }
});

document.body.addEventListener("focusin", function (event) {
  if (insideTip(event.target)) return;
  if (pinned) return;
  const mark = markFrom(event.target);
  if (!mark) return;
  const rect = mark.getBoundingClientRect();
  activate(mark, rect.left + rect.width / 2, rect.top);
});

document.body.addEventListener("focusout", function (event) {
  if (insideTip(event.relatedTarget) || pinned) return;
  const mark = markFrom(event.target);
  if (!mark) return;
  deactivate(mark);
});

document.body.addEventListener("click", function (event) {
  // Portrait tips often cover the mark; a click on the tip should pin, not no-op.
  if (insideTip(event.target)) {
    if (current) pinned = true;
    return;
  }
  const mark = markFrom(event.target);
  if (mark) {
    pinned = true;
    activate(mark, event.clientX, event.clientY);
    return;
  }
  if (pinned || current) deactivate(current);
});

document.body.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (current || pinned) {
    event.preventDefault();
    deactivate(current);
  }
});
