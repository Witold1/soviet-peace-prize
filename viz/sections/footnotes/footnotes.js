var fnOpen = null;

function placeFnDrawer() {
  var drawer = document.getElementById("fn-drawer");
  if (!drawer || drawer.hidden) return;
  var column = document.querySelector(".wrap");
  if (!column) return;
  var rect = column.getBoundingClientRect();
  drawer.style.left = rect.left + "px";
  drawer.style.width = rect.width + "px";
}

function syncFn() {
  var open = Boolean(fnOpen);
  var drawer = document.getElementById("fn-drawer");
  var backdrop = document.getElementById("fn-backdrop");
  var toggle = document.getElementById("fn-toggle");
  if (!drawer || !backdrop || !toggle) return;
  drawer.hidden = !open;
  backdrop.hidden = !open;
  drawer.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", t("fnHide"));
  backdrop.setAttribute("aria-label", t("fnClose"));
  document.querySelectorAll(".footnotes-back").forEach(function (link) {
    link.setAttribute("aria-label", t("fnBack"));
  });
  document.querySelectorAll("[data-fn]").forEach(function (btn) {
    var id = btn.getAttribute("data-fn");
    var on = open && id === fnOpen;
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    btn.setAttribute("aria-label", t("fnRef") + " " + id);
    btn.classList.toggle("is-open", on);
  });
  if (open) {
    var body = document.getElementById("fn-body");
    var title = document.getElementById("fn-title");
    body.innerHTML = t("fn" + fnOpen);
    body.querySelectorAll('a[href^="http"]').forEach(function (anchor) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    });
    if (title) title.textContent = t("fnTitle") + " " + fnOpen;
    placeFnDrawer();
  }
}

function setFn(id) {
  var was = fnOpen;
  fnOpen = id && id !== fnOpen ? id : null;
  syncFn();
  if (fnOpen) {
    document.getElementById("fn-toggle").focus();
  } else if (was) {
    var back = document.querySelector('[data-fn="' + was + '"]');
    if (back) back.focus();
  }
}

document.body.addEventListener("click", function (event) {
  var ref = event.target.closest("[data-fn]");
  if (!ref) return;
  setFn(ref.getAttribute("data-fn"));
});

document.getElementById("fn-toggle").addEventListener("click", function () {
  setFn(null);
});

document.getElementById("fn-backdrop").addEventListener("click", function () {
  setFn(null);
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape" || !fnOpen) return;
  event.preventDefault();
  setFn(null);
});

window.addEventListener("resize", placeFnDrawer);
if (window.ResizeObserver) {
  var fnColumn = document.querySelector(".wrap");
  if (fnColumn) new ResizeObserver(placeFnDrawer).observe(fnColumn);
}
