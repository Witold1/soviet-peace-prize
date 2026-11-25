// Morph flight: one canvas layer instead of ~161 CSS/DOM transforms.
// Same path on phone and desktop. DOM marks stay for idle click/tip;
// during flight they are hidden and only feed drawImage textures.

var heroCanvasActive = false;
var heroCanvasEl = null;
var heroCanvasCtx = null;
var heroCanvasDpr = 1;
var heroCanvasW = 0;
var heroCanvasH = 0;

function heroCanvasFlight() {
  return !heroReduced();
}

function heroCanvasEnsure() {
  var board = document.getElementById("hero-board");
  if (!board) return null;
  if (heroCanvasEl && heroCanvasEl.parentElement === board) return heroCanvasEl;
  var canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  board.appendChild(canvas);
  heroCanvasEl = canvas;
  heroCanvasCtx = canvas.getContext("2d", { alpha: true });
  return canvas;
}

function heroCanvasResize(cssW, cssH) {
  var canvas = heroCanvasEnsure();
  if (!canvas || !heroCanvasCtx) return;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var w = Math.max(1, Math.round(cssW));
  var h = Math.max(1, Math.round(cssH));
  if (w === heroCanvasW && h === heroCanvasH && dpr === heroCanvasDpr) return;
  heroCanvasW = w;
  heroCanvasH = h;
  heroCanvasDpr = dpr;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  heroCanvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function heroCanvasHexPath(ctx, cx, cy, w, h) {
  // Matches CSS clip-path on .tile (flat-top hex in mark box).
  var x0 = cx - w / 2;
  var y0 = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(x0 + w * 0.25, y0);
  ctx.lineTo(x0 + w * 0.75, y0);
  ctx.lineTo(x0 + w, y0 + h * 0.5);
  ctx.lineTo(x0 + w * 0.75, y0 + h);
  ctx.lineTo(x0 + w * 0.25, y0 + h);
  ctx.lineTo(x0, y0 + h * 0.5);
  ctx.closePath();
}

function heroCanvasDrawCover(ctx, img, x, y, w, h, mirrored) {
  if (!img || !img.naturalWidth) return;
  var iw = img.naturalWidth;
  var ih = img.naturalHeight;
  var scale = Math.max(w / iw, h / ih);
  var dw = iw * scale;
  var dh = ih * scale;
  var dx = x + (w - dw) / 2;
  // object-position: center top
  var dy = y;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (mirrored) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, dx - x, dy - y, dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
}

function heroCanvasDrawContain(ctx, img, x, y, w, h, mirrored) {
  if (!img || !img.naturalWidth) return;
  var iw = img.naturalWidth;
  var ih = img.naturalHeight;
  var scale = Math.min(w / iw, h / ih);
  var dw = iw * scale;
  var dh = ih * scale;
  var dx = x + (w - dw) / 2;
  var dy = y + (h - dh) / 2;
  ctx.save();
  if (mirrored) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, (dx - x), (dy - y), dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
}

function heroCanvasMarkTiming(t) {
  t = heroClamp01(t);
  return {
    faceT: heroSmooth((t - 0.02) / 0.52),
    tileT: heroSmooth((t - 0.14) / 0.62),
    silT: heroMode() === "dove" ? heroSmooth((t - 0.2) / 0.65) : 0
  };
}

function heroCanvasPaint(t) {
  if (!heroLayout || !heroMarks.length) return;
  var board = document.getElementById("hero-board");
  if (!board || !heroCanvasCtx) return;

  var timing = heroCanvasMarkTiming(t);
  var faceOpacity = 1 - timing.faceT;
  var tileOpacity = timing.tileT;
  var boardH = Math.round(heroLerp(heroLayout.gridH, heroLayout.cloudH, t));
  if (heroLayout._hPx !== boardH) {
    heroLayout._hPx = boardH;
    board.style.height = boardH + "px";
  }
  heroCanvasResize(heroLayout.width || board.clientWidth, boardH);

  var silhouette = document.getElementById("hero-silhouette");
  if (silhouette) {
    silhouette.style.opacity = (timing.silT * 0.28).toFixed(3);
  }

  var ctx = heroCanvasCtx;
  var cell = heroLayout.cell;
  var tile = heroLayout.tile;
  var tileH = tile * HERO_HEX_ASPECT;
  var gold = typeof GOLD === "string" ? GOLD : "#e2a320";

  ctx.clearRect(0, 0, heroCanvasW, heroCanvasH);

  for (var i = 0; i < heroMarks.length; i++) {
    var mark = heroMarks[i];
    var point = heroLayout.points[i];
    if (!point) continue;
    var w = heroLerp(cell, tile, t);
    var h = heroLerp(cell, tileH, t);
    var cx = heroLerp(point.x0, point.x1, t);
    var cy = heroLerp(point.y0, point.y1, t);
    var x = cx - w / 2;
    var y = cy - h / 2;
    var img = mark.face && mark.face.querySelector("img");
    var mirrored = !!(img && img.classList.contains("is-mirrored"));
    var isPortrait = mark.el && mark.el.classList.contains("portrait");

    if (faceOpacity > 0.01 && img) {
      ctx.globalAlpha = faceOpacity;
      if (isPortrait) {
        // Mild dark plate under cover crop (matches wall look without CSS filter cost).
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(x, y, w, h);
        heroCanvasDrawCover(ctx, img, x, y, w, h, false);
      } else {
        heroCanvasDrawContain(ctx, img, x, y, w, h, mirrored);
      }
    }

    if (tileOpacity > 0.01) {
      ctx.globalAlpha = tileOpacity;
      ctx.fillStyle = gold;
      heroCanvasHexPath(ctx, cx, cy, w, h);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function heroCanvasMount() {
  var board = document.getElementById("hero-board");
  if (!board || !heroLayout) return false;
  heroCanvasEnsure();
  heroCanvasResize(
    heroLayout.width || board.clientWidth,
    Math.round(heroLerp(heroLayout.gridH, heroLayout.cloudH, heroVisualT))
  );
  board.classList.add("is-canvas-flight", "is-animating", "is-faces-off");
  board.classList.remove("is-tiles-on");
  heroCanvasActive = true;
  return true;
}

function heroCanvasTeardown() {
  var board = document.getElementById("hero-board");
  if (board) {
    board.classList.remove("is-canvas-flight", "is-animating");
  }
  if (heroCanvasEl) {
    heroCanvasEl.style.display = "none";
  }
  heroCanvasActive = false;
  var silhouette = document.getElementById("hero-silhouette");
  if (silhouette) {
    // Rest state drives sil via --hero-sil; clear the inline override from flight.
    silhouette.style.opacity = "";
  }
}

function heroCanvasFlyTo(next) {
  if (!heroLayout || !heroMarks.length) {
    heroVisualT = next ? 1 : 0;
    heroFinishMorph();
    return;
  }
  if (!heroCanvasMount()) {
    heroVisualT = next ? 1 : 0;
    heroFinishMorph();
    return;
  }
  if (heroCanvasEl) heroCanvasEl.style.display = "block";

  heroAnimFrom = heroVisualT;
  heroAnimTo = next ? 1 : 0;
  heroAnimDur = HERO_MORPH_MS * Math.max(0.08, Math.abs(heroAnimTo - heroAnimFrom));
  heroMorphing = true;
  heroAnimTs = 0;
  heroApplyChartHeight(heroAnimTo, true);
  heroCanvasPaint(heroVisualT);
  heroAnimRaf = requestAnimationFrame(heroAnimTick);
}
