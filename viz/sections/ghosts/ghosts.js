function ghostPortraitSrc(person) {
  var ghosts = typeof GHOST_PORTRAITS === "object" && GHOST_PORTRAITS ? GHOST_PORTRAITS : null;
  if (ghosts && person && person.i != null && ghosts[person.i]) return ghosts[person.i];
  var portraits = typeof PORTRAITS === "object" && PORTRAITS ? PORTRAITS : null;
  if (portraits && person && person.i != null && portraits[person.i]) return portraits[person.i];
  return "";
}

function renderGhosts() {
  var wall = document.getElementById("ghost-wall");
  if (!wall || typeof PEOPLE_GHOST === "undefined") return;

  wall.replaceChildren();
  if (!PEOPLE_GHOST.length) {
    wall.hidden = true;
    return;
  }
  wall.hidden = false;

  var ordered = PEOPLE_GHOST.slice().sort(byYear);

  wall.setAttribute("role", "list");
  wall.setAttribute(
    "aria-label",
    (typeof t === "function" ? t("capGhost") : "Ghost winners") +
      " · " +
      ordered.length
  );

  ordered.forEach(function (person) {
    var cell = document.createElement("div");
    cell.className = "ghost-cell";
    cell.setAttribute("role", "listitem");

    var src = ghostPortraitSrc(person);
    var hasPortrait = !!src;
    var mark = document.createElement("div");
    mark.className = "mark " + (hasPortrait ? "portrait" : "empty");
    mark.dataset.kind = hasPortrait ? "portrait" : "empty";
    mark.dataset.mark = "1";
    mark.dataset.i = String(person.i);
    mark.tabIndex = 0;
    mark.setAttribute("role", "img");
    mark.setAttribute("aria-label", markAria(person));
    if (!wikiFor(person)) mark.classList.add("no-link");

    var face = document.createElement("div");
    face.className = "face";
    if (hasPortrait) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      img.setAttribute("aria-hidden", "true");
      if ("loading" in img) img.loading = "lazy";
      face.appendChild(img);
    }
    mark.appendChild(face);
    cell.appendChild(mark);

    var caption = document.createElement("div");
    caption.className = "ghost-caption";

    var name = document.createElement(wikiFor(person) ? "a" : "span");
    name.className = "ghost-name";
    name.textContent = personName(person);
    if (wikiFor(person)) {
      name.href = wikiFor(person);
      name.target = "_blank";
      name.rel = "noopener noreferrer";
    }
    caption.appendChild(name);

    var meta = document.createElement("span");
    meta.className = "ghost-meta";
    meta.textContent = person.year + " · " + occLabel(person.occupation);
    caption.appendChild(meta);

    cell.appendChild(caption);
    wall.appendChild(cell);
  });
}
