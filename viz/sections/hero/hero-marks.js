// Shared portrait/medal mark DOM for hero wall / hex / dove modes.

function heroBuildBoard(opts) {
  opts = opts || {};
  var withTiles = !!opts.withTiles;
  var portraits = typeof PORTRAITS === "object" && PORTRAITS ? PORTRAITS : {};
  var ordered = PEOPLE_SEEN.slice().sort(byYear);
  var withPortrait = ordered.filter(function (person) { return portraits[person.i]; }).length;

  var hero = document.createElement("div");
  hero.className = "hero portraits";
  hero.id = "hero-board";
  hero.setAttribute("role", "img");
  hero.setAttribute("aria-label", heroAria(ordered.length) + " · " + withPortrait + "/" + ordered.length);

  if (typeof opts.prepend === "function") opts.prepend(hero);

  var marks = [];
  ordered.forEach(function (person, index) {
    var hasPortrait = !!portraits[person.i];
    var mark = document.createElement("div");
    mark.className = "mark " + (hasPortrait ? "portrait" : "medal");
    mark.dataset.kind = hasPortrait ? "portrait" : "medal";
    mark.dataset.mark = "1";
    mark.dataset.i = String(person.i);
    mark.tabIndex = 0;
    mark.setAttribute("role", "img");
    mark.setAttribute("aria-label", markAria(person));
    if (!wikiFor(person)) mark.classList.add("no-link");

    var face = document.createElement("div");
    face.className = "face";
    var img = document.createElement("img");
    if (hasPortrait) {
      img.src = portraits[person.i];
    } else {
      img.src = person.series === "stalin" ? "medals/stalin.png" : "medals/lenin.png";
      if (person.series === "stalin" || index === ordered.length - 1) img.classList.add("is-mirrored");
    }
    img.alt = "";
    img.draggable = false;
    img.setAttribute("aria-hidden", "true");
    if ("loading" in img) img.loading = "lazy";
    face.appendChild(img);
    mark.appendChild(face);

    var tile = null;
    if (withTiles) {
      tile = document.createElement("div");
      tile.className = "tile";
      tile.style.background = GOLD;
      tile.dataset.fill = GOLD;
      tile.dataset.hot = GOLD_HOT;
      tile.setAttribute("aria-hidden", "true");
      mark.appendChild(tile);
    }

    hero.appendChild(mark);
    marks.push({ el: mark, face: face, tile: tile, index: index });
  });

  return { board: hero, marks: marks, ordered: ordered, withPortrait: withPortrait };
}
