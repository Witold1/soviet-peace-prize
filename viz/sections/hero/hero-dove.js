// Hero mode: portraits morph into a dove with olive branch (medal колодка motif).

function heroDoveRender() {
  var stage = document.getElementById("hero");
  var section = document.getElementById("all");
  var countEl = document.getElementById("hero-count");
  if (!stage) return;

  if (countEl && countEl.parentElement) countEl.remove();
  stage.replaceChildren();
  heroMarks = [];
  heroLayout = null;
  heroWidthCached = 0;
  heroResetMotion();

  if (section) section.classList.add("hero-scroll");
  if (countEl) {
    countEl.hidden = false;
    countEl.style.opacity = "";
    countEl.style.left = "";
    countEl.style.top = "";
  }

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
  var pin = document.getElementById("hero-pin");
  if (countEl) {
    countEl.textContent = heroCountLabel(ordered.length);
    if (pin) pin.appendChild(countEl);
  }
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
    var countEl = document.getElementById("hero-count");
    var silhouette = document.getElementById("hero-silhouette");
    if (countEl) countEl.style.opacity = "";
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

  var cols = heroColumns(width);
  var gap = width <= 520 ? 3 : 5;
  var cell = (width - gap * (cols - 1)) / cols;
  var rows = Math.ceil(heroMarks.length / cols);
  var gridH = rows * cell + gap * (rows - 1);

  var dove = packPeaceDove(heroMarks.length);
  var aspect = peaceDoveAspect();
  var narrow = width <= 520;
  var cloudMaxW = narrow ? width * 0.98 : width * 0.94;
  var cloudMaxH = narrow
    ? Math.min(width * 1.08, window.innerHeight * 0.52)
    : Math.min(width * 0.72, Math.max(260, window.innerHeight * 0.46));
  var cloudW = cloudMaxW;
  var cloudH = cloudW / aspect;
  if (cloudH > cloudMaxH) {
    cloudH = cloudMaxH;
    cloudW = cloudH * aspect;
  }
  // Smaller hexes on phone; a bit larger on normal screens.
  var tile = narrow
    ? Math.max(9, Math.min(13, cloudW / 32))
    : Math.max(12, Math.min(18, cloudW / 24));
  var inset = tile * 0.55;
  var topPad = Math.max(narrow ? 32 : 24, tile * 2);
  var cloudOriginX = (width - cloudW) / 2;
  var cloudOriginY = topPad;
  var cloudBoardH = cloudH + topPad + inset;
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
  });

  heroClearRunway(section);
  heroScrubKey = "";
}

function heroDoveApply(t) {
  if (!heroLayout || !heroMarks.length) return;
  t = heroClamp01(t);
  var faceT = heroSmooth((t - 0.05) / 0.7);
  var tileT = heroSmooth((t - 0.12) / 0.7);
  var countT = heroCountT();
  var silT = heroSmooth((t - 0.2) / 0.65);

  var cell = heroLayout.cell;
  var tile = heroLayout.tile;
  var board = document.getElementById("hero-board");
  var countEl = document.getElementById("hero-count");
  var silhouette = document.getElementById("hero-silhouette");
  var boardH = heroLerp(heroLayout.gridH, heroLayout.cloudH, t);
  if (board) board.style.height = boardH.toFixed(2) + "px";

  var faceOpacity = (1 - faceT).toFixed(3);
  var tileOpacity = tileT.toFixed(3);
  var tileH = tile * HERO_HEX_ASPECT;
  heroMarks.forEach(function (item, index) {
    var point = heroLayout.points[index];
    var w = heroLerp(cell, tile, t);
    var h = heroLerp(cell, tileH, t);
    var cx = heroLerp(point.x0, point.x1, t);
    var cy = heroLerp(point.y0, point.y1, t);
    var sx = w / cell;
    var sy = h / cell;
    item.el.style.transform =
      "translate3d(" + (cx - cell / 2).toFixed(2) + "px," + (cy - cell / 2).toFixed(2) + "px,0) scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
    item.face.style.opacity = faceOpacity;
    if (item.tile) item.tile.style.opacity = tileOpacity;
  });

  if (silhouette) silhouette.style.opacity = (silT * 0.28).toFixed(3);
  if (countEl) countEl.style.opacity = countT.toFixed(3);
}

function heroDoveSync() {
  var section = document.getElementById("all");
  var countEl = document.getElementById("hero-count");
  var silhouette = document.getElementById("hero-silhouette");
  if (!section || !heroMarks.length) return;

  if (heroReduced() || !heroLayout) {
    if (countEl) countEl.style.opacity = heroReduced() ? "0" : "";
    if (silhouette) silhouette.style.opacity = heroReduced() ? "0" : "";
    return;
  }

  heroDriveFromScroll(section);
}
