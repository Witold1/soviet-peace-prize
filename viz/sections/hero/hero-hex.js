// Hero mode: portraits morph into a round cloud of gold hexes.

function heroHexRender() {
  var stage = document.getElementById("hero");
  var section = document.getElementById("all");
  var countEl = document.getElementById("hero-count");
  if (!stage) return;

  stage.replaceChildren();
  heroMarks = [];
  heroLayout = null;

  if (section) section.classList.add("hero-scroll");
  if (countEl) {
    countEl.hidden = false;
    countEl.style.opacity = "";
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

    var tile = document.createElement("div");
    tile.className = "tile";
    tile.style.background = GOLD;
    tile.dataset.fill = GOLD;
    tile.dataset.hot = GOLD_HOT;
    tile.setAttribute("aria-hidden", "true");

    mark.appendChild(face);
    mark.appendChild(tile);
    hero.appendChild(mark);
    heroMarks.push({ el: mark, face: face, tile: tile, index: index });
  });

  stage.appendChild(hero);
  if (countEl) countEl.textContent = heroCountLabel(ordered.length);
  heroHexLayout();
  heroHexSync();
}

function heroHexLayout() {
  var section = document.getElementById("all");
  var pin = document.getElementById("hero-pin");
  var stage = document.getElementById("hero");
  var board = document.getElementById("hero-board");
  if (!section || !pin || !stage || !board || !heroMarks.length) return;

  section.classList.add("hero-scroll");

  if (heroReduced()) {
    section.style.height = "";
    board.className = "hero portraits";
    board.style.height = "";
    heroMarks.forEach(function (item) {
      item.el.style.cssText = "";
      item.face.style.opacity = "";
      if (item.tile) item.tile.style.opacity = "";
    });
    var countEl = document.getElementById("hero-count");
    if (countEl) countEl.style.opacity = "";
    heroLayout = null;
    heroTravel = 0;
    heroHold = 0;
    return;
  }

  var width = stage.clientWidth || board.clientWidth;
  if (!width) return;

  var cols = heroColumns(width);
  var gap = width <= 520 ? 3 : 5;
  var cell = (width - gap * (cols - 1)) / cols;
  var rows = Math.ceil(heroMarks.length / cols);
  var gridH = rows * cell + gap * (rows - 1);

  var units = disk(heroMarks.length);
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  units.forEach(function (center) {
    minX = Math.min(minX, center.x);
    minY = Math.min(minY, center.y);
    maxX = Math.max(maxX, center.x);
    maxY = Math.max(maxY, center.y);
  });
  var cloudPad = 1.05;
  var cloudW0 = (maxX - minX) + cloudPad * 2;
  var cloudH0 = (maxY - minY) + cloudPad * 2;
  var narrow = width <= 520;
  var hexSize = narrow ? 14 : 12;
  var cloudW = cloudW0 * hexSize;
  var cloudH = cloudH0 * hexSize;
  var maxW = narrow ? width * 0.98 : width * 0.72;
  var maxH = narrow
    ? Math.min(width * 1.05, window.innerHeight * 0.5)
    : Math.min(width * 0.7, Math.max(240, window.innerHeight * 0.42));
  var scale = Math.min(1, maxW / cloudW, maxH / cloudH);
  hexSize *= scale;
  cloudW *= scale;
  cloudH *= scale;

  var tile = hexSize * 1.68;
  var inset = tile * 0.55;
  var topPad = Math.max(narrow ? 32 : 24, tile * 2);
  var cloudOriginX = (width - cloudW) / 2;
  var cloudOriginY = topPad;
  var cloudBoardH = cloudH + topPad + inset;

  board.className = "hero portraits is-morph";
  board.style.height = gridH + "px";

  var silhouette = document.getElementById("hero-silhouette");
  if (silhouette) silhouette.remove();

  heroLayout = {
    width: width,
    cell: cell,
    tile: tile,
    gridH: gridH,
    cloudH: cloudBoardH,
    points: heroMarks.map(function (item, index) {
      var col = index % cols;
      var row = Math.floor(index / cols);
      var x0 = col * (cell + gap) + cell / 2;
      var y0 = row * (cell + gap) + cell / 2;
      var center = units[index];
      var x1 = cloudOriginX + inset + ((center.x - minX) / Math.max(0.001, maxX - minX)) * Math.max(tile, cloudW - inset * 2);
      var y1 = cloudOriginY + inset + ((center.y - minY) / Math.max(0.001, maxY - minY)) * Math.max(tile, cloudH - inset * 2);
      return { x0: x0, y0: y0, x1: x1, y1: y1 };
    })
  };

  heroTravel = Math.round(Math.min(180, Math.max(110, window.innerHeight * 0.18)));
  heroHold = Math.round(Math.min(140, Math.max(72, window.innerHeight * 0.1)));
  section.style.height = (heroCaptionSpace(section) + pin.offsetHeight + heroTravel + heroHold) + "px";
}

function heroHexSync() {
  var section = document.getElementById("all");
  var countEl = document.getElementById("hero-count");
  if (!section || !heroMarks.length) return;

  if (heroReduced() || !heroLayout) {
    if (countEl) countEl.style.opacity = heroReduced() ? "0" : "";
    return;
  }

  var totalTravel = heroTravel + heroHold;
  var passed = Math.min(
    totalTravel,
    Math.max(0, 28 - section.getBoundingClientRect().top - heroCaptionSpace(section))
  );
  var raw = heroTravel ? Math.min(1, passed / heroTravel) : 0;
  var t = heroSmooth((raw - 0.06) / 0.78);
  var faceT = heroSmooth((t - 0.05) / 0.7);
  var tileT = heroSmooth((t - 0.12) / 0.7);
  var countT = heroSmooth((raw - 0.58) / 0.2);
  var cell = heroLayout.cell;
  var tile = heroLayout.tile;
  var board = document.getElementById("hero-board");
  var pin = document.getElementById("hero-pin");
  if (board) {
    board.style.height = heroLerp(heroLayout.gridH, heroLayout.cloudH, t).toFixed(2) + "px";
  }

  heroMarks.forEach(function (item, index) {
    var point = heroLayout.points[index];
    var size = heroLerp(cell, tile, t);
    var cx = heroLerp(point.x0, point.x1, t);
    var cy = heroLerp(point.y0, point.y1, t);
    var el = item.el;
    el.style.width = size.toFixed(2) + "px";
    el.style.height = size.toFixed(2) + "px";
    el.style.transform = "translate(" + (cx - size / 2).toFixed(2) + "px," + (cy - size / 2).toFixed(2) + "px)";
    item.face.style.opacity = (1 - faceT).toFixed(3);
    if (item.tile) item.tile.style.opacity = tileT.toFixed(3);
  });

  if (countEl) countEl.style.opacity = countT.toFixed(3);
  if (pin) {
    var remain = Math.max(0, totalTravel - passed);
    section.style.height = (heroCaptionSpace(section) + pin.offsetHeight + remain) + "px";
  }
}
