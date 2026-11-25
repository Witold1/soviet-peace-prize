// Hero mode: portraits morph into a round cloud of gold hexes.

function heroHexRender() {
  var stage = document.getElementById("hero");
  var section = document.getElementById("all");
  if (!stage) return;

  var oldStack = document.getElementById("hero-count-stack");
  if (oldStack && oldStack.parentElement) oldStack.remove();
  stage.replaceChildren();
  heroMarks = [];
  heroLayout = null;
  heroWidthCached = 0;
  heroResetMotion();

  if (section) section.classList.add("hero-scroll");

  var portraits = typeof PORTRAITS === "object" && PORTRAITS ? PORTRAITS : {};
  var ordered = PEOPLE_SEEN.slice().sort(byYear);
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
  if (typeof heroMountCountStack === "function") heroMountCountStack(hero, ordered.length);
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
    heroClearRunway(section);
    board.className = "hero portraits";
    board.style.height = "";
    heroMarks.forEach(function (item) {
      item.el.style.cssText = "";
      item.face.style.opacity = "";
      if (item.tile) item.tile.style.opacity = "";
    });
    var stack = document.getElementById("hero-count-stack");
    if (stack) stack.style.transform = "";
    heroLayout = null;
    heroWidthCached = 0;
    return;
  }

  var width = stage.clientWidth || board.clientWidth;
  if (!width) return;
  heroWidthCached = width;

  var gap = width <= 520 ? 3 : 5;
  var budgetH = typeof heroPinBudgetH === "function" ? heroPinBudgetH() : window.innerHeight * 0.7;
  var grid = typeof heroFitGrid === "function"
    ? heroFitGrid(width, gap, heroMarks.length, budgetH)
    : null;
  var cols = grid ? grid.cols : heroColumns(width);
  var cell = grid ? grid.cell : (width - gap * (cols - 1)) / cols;
  var rows = grid ? grid.rows : Math.ceil(heroMarks.length / cols);
  var gridH = grid ? grid.gridH : rows * cell + gap * (rows - 1);

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
  // Smaller tiles on phone; a bit larger on normal screens.
  var hexSize = narrow ? 10 : 14;
  var cloudW = cloudW0 * hexSize;
  var cloudH = cloudH0 * hexSize;
  var maxW = narrow ? width * 0.98 : width * 0.72;
  var maxH = Math.min(
    narrow ? width * 1.05 : width * 0.7,
    typeof heroCloudMaxH === "function" ? heroCloudMaxH(narrow) : Math.max(240, window.innerHeight * 0.42)
  );
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

  var cellPx = cell.toFixed(2) + "px";
  heroMarks.forEach(function (item) {
    item.el.style.width = cellPx;
    item.el.style.height = cellPx;
    item.face.style.opacity = "";
    if (item.tile) item.tile.style.opacity = "";
  });
  board.classList.remove("is-animating", "is-faces-off", "is-tiles-on");
  board.style.removeProperty("--hero-face");
  board.style.removeProperty("--hero-tile");
  board.style.removeProperty("--hero-sil");

  heroApplyRunway(section);
  heroScrubKey = "";
}

function heroHexApply(t) {
  if (!heroLayout || !heroMarks.length) return;
  t = heroClamp01(t);
  // Faces return earlier on the reverse (hex → portraits) than on GitHub's 0.05/0.7.
  var faceT = heroSmooth((t - 0.02) / 0.52);
  var tileT = heroSmooth((t - 0.14) / 0.62);
  heroPaintMorph(t, faceT, tileT, null);
}

function heroHexSync() {
  var section = document.getElementById("all");
  var stack = document.getElementById("hero-count-stack");
  if (!section || !heroMarks.length) return;

  if (heroReduced() || !heroLayout) {
    if (stack) stack.style.visibility = heroReduced() ? "hidden" : "";
    return;
  }

  heroDriveFromScroll(section);
}
