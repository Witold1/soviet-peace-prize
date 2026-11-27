function markMethodClamp() {
  document.querySelectorAll(".methodology li").forEach(function (item) {
    var open = item.classList.contains("is-open");
    if (open) {
      item.classList.add("is-clamped");
      item.setAttribute("aria-expanded", "true");
      return;
    }
    item.classList.remove("is-clamped");
    // Force layout while clamped so scrollHeight reflects the full text.
    var overflows = item.scrollHeight > item.clientHeight + 1;
    item.classList.toggle("is-clamped", overflows);
    item.tabIndex = overflows ? 0 : -1;
    if (overflows) item.setAttribute("role", "button");
    else item.removeAttribute("role");
    item.setAttribute("aria-expanded", "false");
  });
}

function syncMethod() {
  markMethodClamp();
}

function toggleMethodItem(item) {
  if (!item.classList.contains("is-clamped") && !item.classList.contains("is-open")) return;
  item.classList.toggle("is-open");
  item.setAttribute("aria-expanded", item.classList.contains("is-open") ? "true" : "false");
  markMethodClamp();
}

(function () {
  var method = document.querySelector(".methodology");
  if (!method) return;

  method.addEventListener("click", function (event) {
    if (event.target.closest("a")) return;
    var item = event.target.closest("li");
    if (!item || !method.contains(item)) return;
    toggleMethodItem(item);
  });

  method.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("a")) return;
    var item = event.target.closest("li");
    if (!item || !method.contains(item)) return;
    event.preventDefault();
    toggleMethodItem(item);
  });

  syncMethod();
  window.addEventListener("resize", syncMethod);
})();
