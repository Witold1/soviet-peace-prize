function sectionFadeReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sectionFadeNodes() {
  return document.querySelectorAll(".hook, #occupation, #years, #decree-1956, #ages, #decree-1989, #births, #world, #method, #footnotes");
}

function syncSectionFade() {
  var nodes = sectionFadeNodes();
  if (sectionFadeReduced()) {
    nodes.forEach(function (node) { node.style.opacity = ""; });
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
    var enter = (height - rect.top) / (height - enterEnd);
    var leave = (rect.bottom - leaveEnd) / (leaveStart - leaveEnd);
    var opacity = Math.min(1, Math.max(0, Math.min(enter, leave)));
    if (node === last && atBottom && rect.top < height) opacity = 1;
    node.style.opacity = opacity.toFixed(3);
  });
}

window.addEventListener("load", syncSectionFade);
