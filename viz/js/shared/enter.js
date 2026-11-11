function bindEntrance() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var nodes = document.querySelectorAll("#all .hero-pin");
  if (!nodes.length) return;
  document.documentElement.classList.add("js-enter");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach(function (node) { node.classList.add("is-in"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      nodes.forEach(function (node) { observer.observe(node); });
    });
  });
}

bindEntrance();
