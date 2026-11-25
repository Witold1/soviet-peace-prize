// Hero mode: portraits morph into a dove with olive branch (medal колодка motif).

function heroDoveRender() {
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

  if (typeof buildPeaceDoveSvg === "function") {
    var silhouette = buildPeaceDoveSvg();
    silhouette.id = "hero-silhouette";
    silhouette.classList.add("hero-silhouette");
    hero.appendChild(silhouette);
  }

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
  heroDoveLayout();
  heroDoveSync();
}

function heroDoveLayout() {
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
    var silhouette = document.getElementById("hero-silhouette");
    if (stack) stack.style.transform = "";
    if (silhouette) {
      silhouette.style.opacity = "";
      silhouette.style.left = "";
      silhouette.style.top = "";
      silhouette.style.width = "";
      silhouette.style.height = "";
    }
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

  var dove = packPeaceDove(heroMarks.length);
  var aspect = peaceDoveAspect();
  var narrow = width <= 520;
  var cloudMaxW = narrow ? width * 0.98 : width * 0.94;
  var cloudW = cloudMaxW;
  var cloudH;
  var tile;
  var inset;
  var topPad;
  var cloudBoardH;

  if (narrow) {
    // Stretch dove to the wall height so board/chart stay put and intro
    // copy does not jump when the morph runs (aspect may go tall).
    tile = Math.max(9, Math.min(14, cloudW / 28));
    inset = tile * 0.55;
    topPad = Math.max(24, tile * 1.5);
    cloudH = Math.max(tile * 4, gridH - topPad - inset);
    cloudBoardH = gridH;
  } else {
    var cloudMaxH = Math.min(
      width * 0.72,
      typeof heroCloudMaxH === "function" ? heroCloudMaxH(false) : budgetH
    );
    cloudH = cloudW / aspect;
    if (cloudH > cloudMaxH) {
      cloudH = cloudMaxH;
      cloudW = cloudH * aspect;
    }
    tile = Math.max(12, Math.min(18, cloudW / 24));
    inset = tile * 0.55;
    topPad = Math.max(24, tile * 2);
    cloudBoardH = cloudH + topPad + inset;
  }

  var cloudOriginX = (width - cloudW) / 2;
  var cloudOriginY = topPad;
  var innerW = Math.max(tile, cloudW - inset * 2);
  var innerH = Math.max(tile, cloudH - inset * 2);

  board.className = "hero portraits is-morph";
  board.style.height = gridH + "px";

  var silhouette = document.getElementById("hero-silhouette");
  if (silhouette) {
    silhouette.style.left = cloudOriginX.toFixed(2) + "px";
    silhouette.style.top = cloudOriginY.toFixed(2) + "px";
    silhouette.style.width = cloudW.toFixed(2) + "px";
    silhouette.style.height = cloudH.toFixed(2) + "px";
  }

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
      var p = dove[index] || { x: 0.5, y: 0.5 };
      var x1 = cloudOriginX + inset + p.x * innerW;
      var y1 = cloudOriginY + inset + p.y * innerH;
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

function heroDoveApply(t) {
  if (!heroLayout || !heroMarks.length) return;
  t = heroClamp01(t);
  // Faces return earlier on the reverse (hex → portraits) than on GitHub's 0.05/0.7.
  var faceT = heroSmooth((t - 0.02) / 0.52);
  var tileT = heroSmooth((t - 0.14) / 0.62);
  var silT = heroSmooth((t - 0.2) / 0.65);
  heroPaintMorph(t, faceT, tileT, silT);
}

function heroDoveSync() {
  var section = document.getElementById("all");
  var stack = document.getElementById("hero-count-stack");
  var silhouette = document.getElementById("hero-silhouette");
  if (!section || !heroMarks.length) return;

  if (heroReduced() || !heroLayout) {
    if (stack) stack.style.visibility = heroReduced() ? "hidden" : "";
    if (silhouette) silhouette.style.opacity = heroReduced() ? "0" : "";
    return;
  }

  heroDriveFromScroll(section);
}
