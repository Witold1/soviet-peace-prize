function syncPageZoom() {
  document.querySelectorAll(".ukaz-loupe.is-page").forEach(function (loupe) {
    var quote = loupe.closest(".ukaz");
    var column = loupe.classList.contains("is-column");
    if (quote) quote.classList.toggle("is-column", column);
    var side = loupe.querySelector(".ukaz-side");
    if (side) {
      side.setAttribute("aria-pressed", column ? "true" : "false");
      side.setAttribute("aria-label", t(column ? "decreePage" : "decreeSide"));
    }
    var zoom = quote && quote.querySelector(".ukaz-zoom-label");
    if (zoom) zoom.textContent = t("decreePage");
    var zoomButton = quote && quote.querySelector(".ukaz-zoom");
    if (zoomButton) zoomButton.setAttribute("aria-label", t("decreePage"));
  });
}

function relayoutDecree(quote, target) {
  if (!quote.closest("#decree-1949") || typeof layoutPress !== "function") return;
  var decree = document.getElementById("decree-1949");
  layoutPress();
  syncPress();
  if (!decree || target == null) return;
  var root = document.documentElement;
  var prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  var y = window.scrollY;
  for (var i = 0; i < 6; i++) {
    var dy = decree.getBoundingClientRect().top - target;
    if (Math.abs(dy) < 2) break;
    y += dy;
    window.scrollTo(0, Math.max(0, y));
    syncPress();
  }
  root.style.scrollBehavior = prev;
}

function setPageColumn(quote, column) {
  var loupe = quote.querySelector(".ukaz-loupe");
  if (!loupe) return;
  var decree = document.getElementById("decree-1949");
  var target = decree ? decree.getBoundingClientRect().top : null;
  loupe.classList.toggle("is-column", column);
  quote.classList.toggle("is-column", column);
  var lens = loupe.querySelector(".ukaz-lens");
  var mark = loupe.querySelector(".ukaz-mark");
  if (lens) lens.classList.remove("is-on");
  if (mark) mark.classList.remove("is-on");
  syncPageZoom();
  relayoutDecree(quote, target);
}

document.body.addEventListener("click", function (event) {
  var zoom = event.target.closest(".ukaz-zoom, .ukaz-side");
  if (zoom) {
    var quote = zoom.closest(".ukaz");
    var loupe = quote && quote.querySelector(".ukaz-loupe");
    if (!quote || !loupe || loupe.classList.contains("is-scrub")) return;
    setPageColumn(quote, !loupe.classList.contains("is-column"));
    return;
  }
  var button = event.target.closest(".ukaz-original");
  if (!button) return;
  var quote = button.closest(".ukaz");
  if (!quote) return;
  var decree = document.getElementById("decree-1949");
  var target = decree && quote.closest("#decree-1949") ? decree.getBoundingClientRect().top : null;
  quote.classList.toggle("is-open");
  syncOriginalButton();
  var lens = quote.querySelector(".ukaz-lens");
  var mark = quote.querySelector(".ukaz-mark");
  if (lens) lens.classList.remove("is-on");
  if (mark) mark.classList.remove("is-on");
  relayoutDecree(quote, target);
});

document.querySelectorAll(".ukaz-loupe").forEach(function (loupe) {
  var img = loupe.querySelector(".ukaz-scan");
  var lens = loupe.querySelector(".ukaz-lens");
  var mark = loupe.querySelector(".ukaz-mark");
  var text = loupe.closest(".ukaz-text");

  function hideLens() {
    lens.classList.remove("is-on");
    mark.classList.remove("is-on");
  }

  function placeLens(clientX, clientY) {
    var rect = img.getBoundingClientRect();
    var viewEl = loupe.querySelector(".ukaz-view");
    var limit = viewEl ? viewEl.getBoundingClientRect() : rect;
    if (clientX < limit.left || clientY < limit.top || clientX > limit.right || clientY > limit.bottom) {
      hideLens();
      return;
    }
    // Page overview is too small to loupe; allow it once the decree is enlarged
    // by click (is-column) or by the press scroll zoom (is-zoomed / --zoom).
    var quote = loupe.closest(".ukaz");
    var zoom = parseFloat(getComputedStyle(loupe).getPropertyValue("--zoom")) || 0;
    var decreeClose =
      loupe.classList.contains("is-column") ||
      (quote && quote.classList.contains("is-zoomed")) ||
      zoom >= 0.84;
    if (loupe.classList.contains("is-page") && !decreeClose) {
      hideLens();
      return;
    }
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var visX = limit.left - rect.left;
    var visY = limit.top - rect.top;
    var visW = limit.width;
    var visH = limit.height;
    var frame = text.getBoundingClientRect();
    var loupeRect = loupe.getBoundingClientRect();
    var zoom = Math.min(2.15, Math.max(1.65, frame.width / visW));
    var band = Math.max(72, Math.min(visH * 0.2, 128));
    band = Math.min(band, visH * 0.45);
    var paneCap = Math.min(frame.width * 0.62, 440);
    if (band * zoom > paneCap) band = paneCap / zoom;
    var paneW = Math.min(frame.width, visW * zoom);
    var viewW = paneW / zoom;
    if (viewW > visW) {
      viewW = visW;
      paneW = viewW * zoom;
    }
    var srcX = x - viewW / 2;
    srcX = Math.max(visX, Math.min(srcX, visX + visW - viewW));
    var srcY = y - band / 2;
    srcY = Math.max(visY, Math.min(srcY, visY + visH - band));
    var paneH = band * zoom;
    var left = (frame.left + (frame.width - paneW) / 2) - loupeRect.left;
    var top = (rect.top - loupeRect.top) + srcY + band + 10;
    mark.style.left = (rect.left - loupeRect.left + srcX) + "px";
    mark.style.top = (rect.top - loupeRect.top + srcY) + "px";
    mark.style.width = viewW + "px";
    mark.style.height = band + "px";
    lens.style.left = left + "px";
    lens.style.top = top + "px";
    lens.style.width = paneW + "px";
    lens.style.height = paneH + "px";
    lens.style.backgroundImage = "url(\"" + img.src + "\")";
    lens.style.backgroundSize = (rect.width * zoom) + "px " + (rect.height * zoom) + "px";
    lens.style.backgroundPosition = (-srcX * zoom) + "px " + (-srcY * zoom) + "px";
    mark.classList.add("is-on");
    lens.classList.add("is-on");
  }

  loupe.addEventListener("pointermove", function (event) {
    if (event.pointerType === "touch" && event.buttons === 0) return;
    placeLens(event.clientX, event.clientY);
  });
  loupe.addEventListener("pointerdown", function (event) {
    if (event.pointerType !== "touch") return;
    if (event.target.closest(".ukaz-side, .ukaz-zoom")) return;
    loupe.setPointerCapture(event.pointerId);
    placeLens(event.clientX, event.clientY);
  });
  loupe.addEventListener("pointerup", hideLens);
  loupe.addEventListener("pointercancel", hideLens);
  loupe.addEventListener("pointerleave", function (event) {
    if (event.pointerType !== "touch") hideLens();
  });
});
