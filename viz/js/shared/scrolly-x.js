var SCROLLY_X = [];

function scrollyXShouldRun(viewport) {
  if (!viewport) return false;
  if (document.documentElement.getAttribute("data-display") === "phone") return true;
  return viewport.clientWidth > 0 && viewport.clientWidth < 640;
}

function scrollyXMax(viewport) {
  return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
}

function scrollyXInBand(viewport) {
  // Prefer the figure/section so the caption counts as “in view” too.
  var host = viewport._scrollyHost;
  if (!host) {
    host = viewport.closest("figure.viz, figure, section") || viewport;
    viewport._scrollyHost = host;
  }
  const rect = host.getBoundingClientRect();
  return rect.top < 120 && rect.bottom > 140;
}

function bindScrollyX(viewport) {
  if (!viewport || viewport.dataset.scrollyXBound === "1") return;
  viewport.dataset.scrollyXBound = "1";
  SCROLLY_X.push(viewport);
}

function syncScrollyX(viewport) {
  if (!viewport || !scrollyXShouldRun(viewport)) return;
  const max = scrollyXMax(viewport);
  if (viewport.scrollLeft > max) viewport.scrollLeft = max;
}

function syncAllScrollyX() {
  SCROLLY_X.forEach(syncScrollyX);
}

function scrollyXConsumeDelta(viewport, delta) {
  if (!delta || !scrollyXShouldRun(viewport) || !scrollyXInBand(viewport)) return false;
  const max = scrollyXMax(viewport);
  if (max <= 8) return false;

  const atStart = viewport.scrollLeft <= 0.5;
  const atEnd = viewport.scrollLeft >= max - 0.5;
  // Scroll down / right → pan right until the end, then page may continue.
  if (delta > 0 && atEnd) return false;
  // Scroll up / left → pan back only while not at the start.
  if (delta < 0 && atStart) return false;

  viewport.scrollLeft = Math.max(0, Math.min(max, viewport.scrollLeft + delta));
  return true;
}

window.addEventListener("wheel", function (event) {
  const delta = event.deltaY + event.deltaX;
  if (!delta) return;
  for (let i = 0; i < SCROLLY_X.length; i += 1) {
    if (scrollyXConsumeDelta(SCROLLY_X[i], delta)) {
      event.preventDefault();
      return;
    }
  }
}, { passive: false });

(function () {
  var touchY = 0;
  var active = null;

  window.addEventListener("touchstart", function (event) {
    if (!event.touches.length) return;
    touchY = event.touches[0].clientY;
    active = null;
    for (let i = 0; i < SCROLLY_X.length; i += 1) {
      const viewport = SCROLLY_X[i];
      if (scrollyXShouldRun(viewport) && scrollyXInBand(viewport) && scrollyXMax(viewport) > 8) {
        active = viewport;
        break;
      }
    }
  }, { passive: true });

  window.addEventListener("touchmove", function (event) {
    if (!active || !event.touches.length) return;
    const y = event.touches[0].clientY;
    const dy = touchY - y;
    touchY = y;
    if (!dy) return;
    if (scrollyXConsumeDelta(active, dy)) {
      event.preventDefault();
    } else {
      active = null;
    }
  }, { passive: false });
})();
