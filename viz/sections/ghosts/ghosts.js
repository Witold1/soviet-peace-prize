function renderGhosts() {
  var list = document.getElementById("ghost-list");
  if (!list || typeof PEOPLE_GHOST === "undefined") return;
  list.replaceChildren();
  if (!PEOPLE_GHOST.length) {
    list.hidden = true;
    return;
  }
  list.hidden = false;
  PEOPLE_GHOST.slice().sort(byYear).forEach(function (person) {
    var item = document.createElement("li");
    var name = document.createElement(wikiFor(person) ? "a" : "span");
    name.textContent = personName(person);
    if (wikiFor(person)) {
      name.href = wikiFor(person);
      name.target = "_blank";
      name.rel = "noopener noreferrer";
    }
    item.appendChild(name);
    var meta = document.createElement("span");
    meta.className = "ghost-meta";
    meta.textContent = " · " + person.year + " · " + occLabel(person.occupation);
    item.appendChild(meta);
    list.appendChild(item);
  });
}
