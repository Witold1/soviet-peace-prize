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

  var built = heroBuildBoard({
    withTiles: true,
    prepend: function (hero) {
      if (typeof buildPeaceDoveSvg !== "function") return;
      var silhouette = buildPeaceDoveSvg();
      silhouette.id = "hero-silhouette";
      silhouette.classList.add("hero-silhouette");
      hero.appendChild(silhouette);
    }
  });
  heroMarks = built.marks;
  stage.appendChild(built.board);
  if (typeof heroMountCountStack === "function") heroMountCountStack(built.board, built.ordered.length);
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
  var narrow = width <= 520;
  // Stretch dove to the wall/grid height on every breakpoint so board + chart
  // height stay put - intro copy must not ride when the morph runs.
  var cloudW = narrow ? width * 0.98 : width * 0.94;
  var tile = narrow
    ? Math.max(9, Math.min(14, cloudW / 28))
    : Math.max(12, Math.min(18, cloudW / 24));
  var inset = tile * 0.55;
  var topPad = Math.max(narrow ? 24 : 28, tile * (narrow ? 1.5 : 2));
  var cloudH = Math.max(tile * 4, gridH - topPad - inset);
  var cloudBoardH = gridH;

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

  // Relayout must not leave absolute marks without a transform - they stack at
  // (0,0) and the last DOM face (Mandela) reads as a stuck portrait. If a
  // canvas flight was mid-way, className above already dropped is-canvas-flight;
  // snap to the target pose instead of hoping sync finishes the morph.
  heroApplyRunway(section);
  if (heroMorphing) {
    heroSnapPose(heroTargetT);
  } else {
    board.classList.remove("is-animating", "is-faces-off", "is-tiles-on");
    board.style.removeProperty("--hero-face");
    board.style.removeProperty("--hero-tile");
    board.style.removeProperty("--hero-sil");
    heroApplyVisual();
    heroApplyChartHeight(heroVisualT, false);
  }
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
