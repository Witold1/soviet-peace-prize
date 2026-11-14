var SECTION_FADE_MQ = window.matchMedia("(prefers-reduced-motion: reduce)");

function sectionFadeReduced() {
  return SECTION_FADE_MQ.matches;
}

var SECTION_FADE_NODES = null;

function sectionFadeNodes() {
  if (!SECTION_FADE_NODES) {
    SECTION_FADE_NODES = Array.prototype.slice.call(
      document.querySelectorAll(".hook, #occupation, #years, #decree-1956, #ages, #decree-1989, #births, #method, #footnotes")
    );
  }
  return SECTION_FADE_NODES;
}

function syncSectionFade() {
  var nodes = sectionFadeNodes();
  if (sectionFadeReduced()) {
    nodes.forEach(function (node) {
      if (node.style.opacity) node.style.opacity = "";
    });
    return;
  }
  var height = window.innerHeight;
  var enterEnd = height * 0.46;
  var leaveStart = height * 0.72;
  var leaveEnd = height * 0.06;
  // Short last section can't scroll into the mid-viewport enter band.
  var atBottom = window.scrollY + height >= document.documentElement.scrollHeight - 2;
  var last = nodes.length ? nodes[nodes.length - 1] : null;
  nodes.forEach(function (node) {
    var rect = node.getBoundingClientRect();
    var opacity;
    if (rect.bottom < -40 || rect.top > height + 40) {
      opacity = 0;
    } else {
      var enter = (height - rect.top) / (height - enterEnd);
      var leave = (rect.bottom - leaveEnd) / (leaveStart - leaveEnd);
      opacity = Math.min(1, Math.max(0, Math.min(enter, leave)));
    }
    if (node === last && atBottom && rect.top < height) opacity = 1;
    var next = opacity.toFixed(3);
    if (node.dataset.fadeOpacity !== next) {
      node.dataset.fadeOpacity = next;
      node.style.opacity = next;
    }
  });
}

window.addEventListener("load", syncSectionFade);
