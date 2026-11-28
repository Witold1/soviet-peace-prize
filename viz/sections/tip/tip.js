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
  if (person == null || person.i == null) return "";
  var portraits = typeof PORTRAITS === "object" && PORTRAITS ? PORTRAITS : null;
  if (portraits && portraits[person.i]) return portraits[person.i];
  var ghosts = typeof GHOST_PORTRAITS === "object" && GHOST_PORTRAITS ? GHOST_PORTRAITS : null;
  if (ghosts && ghosts[person.i]) return ghosts[person.i];
  return "";
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
    const native = document.createElement("div");
    native.className = "ru";
    native.textContent = alt;
    tip.appendChild(native);
  }
  const prize = document.createElement("div");
  prize.className = "meta";
  prize.appendChild(document.createTextNode(tipPrizeLine(person)));
  if (person.age != null && person.age !== "") {
    prize.appendChild(document.createElement("br"));
    prize.appendChild(document.createTextNode(agePhrase(person.age)));
  }
  tip.appendChild(prize);
  const placeLine = typeof tipBornAffiliatedLine === "function"
    ? tipBornAffiliatedLine(person)
    : "";
  if (placeLine) {
    const place = document.createElement("div");
    place.className = "meta";
    place.textContent = placeLine;
    tip.appendChild(place);
  }
  const quote = typeof tipOccupationLine === "function"
    ? tipOccupationLine(person)
    : "";
  if (quote) {
    const ukaz = document.createElement("div");
    ukaz.className = "work";
    ukaz.textContent = quote;
    tip.appendChild(ukaz);
  }
  // Temporary: Wikidata occupation / work blurb alongside the Pravda line.
  const wikiWork = typeof workText === "function" ? workText(person) : (person.work || "");
  if (wikiWork && wikiWork !== quote) {
    const work = document.createElement("div");
    work.className = "work";
    work.textContent = wikiWork;
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

function placeTipStep() {
  var block = document.getElementById("map-seq-block");
  return block ? Number(block.getAttribute("data-step") || 2) : 2;
}

function placeTipPeople(group) {
  var people = group.people || [];
  if (group.birthPeople || group.pravdaPeople) {
    var step = placeTipStep();
    if (step >= 3) {
      people = group.pravdaPeople && group.pravdaPeople.length
        ? group.pravdaPeople
        : people;
    } else {
      people = group.birthPeople && group.birthPeople.length
        ? group.birthPeople
        : people;
    }
  }
  return people;
}

function placeTipMode(group) {
  if (!(group.birthPeople || group.pravdaPeople || group.packTip)) return null;
  return placeTipStep() >= 3 ? "affiliation" : "birth";
}

function fillPlaceTip(group) {
  var people = placeTipPeople(group);
  var mode = placeTipMode(group);

  // Region/country packs always stay a list tip - even for a single laureate.
  if (people.length === 1 && !group.packTip) {
    fillTip(people[0]);
    const born = document.createElement("div");
    born.className = "meta";
    born.textContent = bornLine(birthPlaceText(people[0]) || group.label);
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
  meta.textContent = group.packTip && typeof groupPackMeta === "function"
    ? groupPackMeta(people.length, mode)
    : groupBorn(people.length);
  tip.appendChild(meta);
  const list = document.createElement("div");
  list.className = "work";
  const names = people.map(personName);
  const shown = names.slice(0, 8);
  list.textContent = shown.join(", ") + (names.length > shown.length ? moreNames(names.length - shown.length) : "");
  tip.appendChild(list);
}

function isMapSquareMark(mark) {
  return !!(
    mark &&
    (mark.classList.contains("map-square-dot") ||
      mark.classList.contains("map-squares-tile") ||
      mark.classList.contains("map-seq-fly-dot"))
  );
}

function restoreMark(mark) {
  if (
    mark.dataset.kind === "medal" ||
    mark.dataset.kind === "portrait" ||
    mark.dataset.kind === "announce" ||
    mark.dataset.kind === "announce-note"
  ) {
    mark.classList.remove("is-hot");
    if (mark.dataset.kind === "announce") {
      var root = mark.closest("#announce-chart") || mark.closest(".announce-marks");
      if (root) {
        var coldLink = root.querySelector('.announce-link[data-announce="' + mark.dataset.announce + '"]');
        if (coldLink) coldLink.classList.remove("is-hot");
        var coldPrize = root.querySelector('.announce-prize-mark[data-announce="' + mark.dataset.announce + '"]');
        if (coldPrize) coldPrize.classList.remove("is-hot");
      }
    }
    var tile = mark.querySelector(".tile");
    if (tile && tile.dataset.fill) tile.style.background = tile.dataset.fill;
    return;
  }
  // Map packs/dots: class-only highlight - do not rewrite fill/stroke (that
  // turned open dots muddy gray against regional tile colors on phone).
  if (isMapSquareMark(mark)) {
    mark.classList.remove("is-hot");
    return;
  }
  mark.setAttribute("fill", mark.dataset.fill);
  mark.setAttribute("stroke", mark.dataset.stroke || "none");
}

function activate(mark, x, y) {
  if (current && current !== mark) restoreMark(current);
  current = mark;
  if (mark.dataset.kind === "announce") {
    mark.classList.add("is-hot");
    var hotRoot = mark.closest("#announce-chart") || mark.closest(".announce-marks");
    if (hotRoot) {
      var hotLink = hotRoot.querySelector('.announce-link[data-announce="' + mark.dataset.announce + '"]');
      if (hotLink) hotLink.classList.add("is-hot");
      var hotPrize = hotRoot.querySelector('.announce-prize-mark[data-announce="' + mark.dataset.announce + '"]');
      if (hotPrize) hotPrize.classList.add("is-hot");
    }
    if (typeof fillAnnounceTip === "function") {
      fillAnnounceTip(ANNOUNCE_EVENTS[Number(mark.dataset.announce)]);
    }
    placeTip(x, y);
    return;
  }
  if (mark.dataset.kind === "announce-note") {
    mark.classList.add("is-hot");
    if (typeof fillAnnounceNoteTip === "function") {
      fillAnnounceNoteTip(mark.dataset.note);
    }
    placeTip(x, y);
    return;
  }
  if (mark.dataset.kind === "medal" || mark.dataset.kind === "portrait") {
    mark.classList.add("is-hot");
    var tile = mark.querySelector(".tile");
    if (tile && tile.dataset.hot) tile.style.background = tile.dataset.hot;
  } else if (isMapSquareMark(mark)) {
    mark.classList.add("is-hot");
  } else {
    mark.setAttribute("fill", mark.dataset.hot);
    mark.setAttribute("stroke", "#000");
    if (!mark.getAttribute("stroke-width")) mark.setAttribute("stroke-width", "1.25");
    mark.setAttribute("vector-effect", "non-scaling-stroke");
  }
  var onWall = mark.dataset.kind === "medal" || mark.dataset.kind === "portrait" || mark.dataset.kind === "empty";
  if (mark.dataset.g) fillPlaceTip(PLACE_GROUPS[Number(mark.dataset.g)]);
  else fillTip(PEOPLE[Number(mark.dataset.i)], { skipPortrait: onWall });
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

function pinFromEvent(event) {
  // Portrait tips often cover the mark; a press on the tip should pin, not no-op.
  if (insideTip(event.target)) {
    if (current) pinned = true;
    return true;
  }
  const mark = markFrom(event.target);
  if (mark) {
    pinned = true;
    activate(mark, event.clientX, event.clientY);
    return true;
  }
  return false;
}

// Touch/pen: pointerover opens the tip, then pointerout on lift closes it before
// click can pin - open/close/open flicker. Pin on pointerdown so out is ignored.
document.body.addEventListener("pointerdown", function (event) {
  if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
  pinFromEvent(event);
});

document.body.addEventListener("click", function (event) {
  if (pinFromEvent(event)) return;
  if (pinned || current) deactivate(current);
});

document.body.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (current || pinned) {
    event.preventDefault();
    deactivate(current);
  }
});
