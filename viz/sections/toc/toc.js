function syncToc() {
  var nav = document.getElementById("toc");
  if (!nav) return;
  var links = nav.querySelectorAll("a");
  if (!links.length) return;
  var current = links[0];
  var line = Math.min(160, window.innerHeight * 0.28);
  var i;
  for (i = 0; i < links.length; i++) {
    var el = document.getElementById(links[i].getAttribute("href").slice(1));
    if (el && el.getBoundingClientRect().top <= line) current = links[i];
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    current = links[links.length - 1];
  }
  for (i = 0; i < links.length; i++) {
    if (links[i] === current) links[i].setAttribute("aria-current", "true");
    else links[i].removeAttribute("aria-current");
  }
  placeSectionMark(links);
}

function tocIsShown() {
  var rail = document.querySelector(".toc-rail");
  return !!rail && getComputedStyle(rail).display !== "none";
}

function placeSectionMark(links) {
  var mark = document.getElementById("section-mark");
  if (!mark) return;
  if (tocIsShown() || !links.length) return;
  var wrap = document.querySelector(".wrap");
  var shell = document.querySelector(".shell");
  if (!wrap || !shell) return;
  var pin = 16;
  var current = links[0];
  var i;
  for (i = 0; i < links.length; i++) {
    var el = document.getElementById(links[i].getAttribute("href").slice(1));
    if (el && el.getBoundingClientRect().top <= pin + 1) current = links[i];
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    current = links[links.length - 1];
  }
  var target = document.getElementById(current.getAttribute("href").slice(1));
  if (!target) return;
  mark.textContent = current.textContent.trim();
  var pad = parseFloat(getComputedStyle(wrap).paddingLeft) || 0;
  var contentLeft = wrap.getBoundingClientRect().left + pad;
  var width = mark.offsetWidth;
  var gap = Math.min(6, Math.max(0, pad - width));
  var left = contentLeft - width - gap;
  var shellLeft = shell.getBoundingClientRect().left;
  if (left < shellLeft) left = shellLeft;
  mark.style.left = left + "px";
  var top = target.getBoundingClientRect().top;
  mark.style.top = Math.max(pin, top) + "px";
}
