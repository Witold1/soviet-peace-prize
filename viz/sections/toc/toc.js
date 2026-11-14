var TOC_TARGETS = null;
var TOC_CURRENT = null;

function tocLinks() {
  var nav = document.getElementById("toc");
  if (!nav) return [];
  return nav.querySelectorAll("a");
}

function tocTargets(links) {
  if (TOC_TARGETS && TOC_TARGETS.length === links.length) return TOC_TARGETS;
  TOC_TARGETS = [];
  for (var i = 0; i < links.length; i++) {
    TOC_TARGETS.push(document.getElementById(links[i].getAttribute("href").slice(1)));
  }
  return TOC_TARGETS;
}

function syncToc() {
  var links = tocLinks();
  if (!links.length) return;
  var targets = tocTargets(links);
  var current = links[0];
  var line = Math.min(160, window.innerHeight * 0.28);
  var i;
  for (i = 0; i < links.length; i++) {
    var el = targets[i];
    if (el && el.getBoundingClientRect().top <= line) current = links[i];
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    current = links[links.length - 1];
  }
  if (current !== TOC_CURRENT) {
    for (i = 0; i < links.length; i++) {
      if (links[i] === current) links[i].setAttribute("aria-current", "true");
      else links[i].removeAttribute("aria-current");
    }
    TOC_CURRENT = current;
  }
  placeSectionMark(links, targets, current);
}

function tocIsShown() {
  return document.documentElement.getAttribute("data-display") === "laptop" && window.innerWidth >= 1180;
}

function placeSectionMark(links, targets, currentLink) {
  var mark = document.getElementById("section-mark");
  if (!mark) return;
  if (tocIsShown() || !links.length) return;
  var wrap = document.querySelector(".wrap");
  var shell = document.querySelector(".shell");
  if (!wrap || !shell) return;
  var pin = 16;
  var current = currentLink || links[0];
  var i;
  var pinTargets = targets || tocTargets(links);
  for (i = 0; i < links.length; i++) {
    var el = pinTargets[i];
    if (el && el.getBoundingClientRect().top <= pin + 1) current = links[i];
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    current = links[links.length - 1];
  }
  var target = document.getElementById(current.getAttribute("href").slice(1));
  if (!target) return;
  var label = current.textContent.trim();
  if (mark.textContent !== label) mark.textContent = label;
  var pad = parseFloat(getComputedStyle(wrap).paddingLeft) || 0;
  var contentLeft = wrap.getBoundingClientRect().left + pad;
  var width = mark.offsetWidth;
  var gap = Math.min(6, Math.max(0, pad - width));
  var left = contentLeft - width - gap;
  var shellLeft = shell.getBoundingClientRect().left;
  if (left < shellLeft) left = shellLeft;
  var leftPx = left + "px";
  if (mark.style.left !== leftPx) mark.style.left = leftPx;
  var top = target.getBoundingClientRect().top;
  var topPx = Math.max(pin, top) + "px";
  if (mark.style.top !== topPx) mark.style.top = topPx;
}
