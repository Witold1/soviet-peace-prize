// Hero mode: default portrait wall (no scrolly morph).

function heroWallRender() {
  var stage = document.getElementById("hero");
  var section = document.getElementById("all");
  var countEl = document.getElementById("hero-count");
  if (!stage) return;

  stage.replaceChildren();
  heroMarks = [];
  heroLayout = null;
  heroTravel = 0;
  heroHold = 0;

  if (section) {
    section.classList.remove("hero-scroll");
    section.style.height = "";
  }
  if (countEl) {
    countEl.textContent = "";
    countEl.style.opacity = "";
    countEl.hidden = true;
  }

  var portraits = typeof PORTRAITS === "object" && PORTRAITS ? PORTRAITS : {};
  var ordered = PEOPLE.slice().sort(byYear);
  var withPortrait = ordered.filter(function (person) { return portraits[person.i]; }).length;
  var hero = document.createElement("div");
  hero.className = "hero portraits";
  hero.id = "hero-board";
  hero.setAttribute("role", "img");
  hero.setAttribute("aria-label", heroAria(ordered.length) + " · " + withPortrait + "/" + ordered.length);

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
    face.appendChild(img);
    mark.appendChild(face);
    hero.appendChild(mark);
    heroMarks.push({ el: mark, face: face, tile: null, index: index });
  });

  stage.appendChild(hero);
}

function heroWallLayout() {
  var section = document.getElementById("all");
  var board = document.getElementById("hero-board");
  if (section) {
    section.classList.remove("hero-scroll");
    section.style.height = "";
  }
  if (board) {
    board.className = "hero portraits";
    board.style.height = "";
  }
  heroLayout = null;
  heroTravel = 0;
  heroHold = 0;
}

function heroWallSync() {}
