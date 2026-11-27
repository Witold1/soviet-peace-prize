// Hero mode: default portrait wall (no scrolly morph).

function heroWallRender() {
  var stage = document.getElementById("hero");
  var section = document.getElementById("all");
  if (!stage) return;

  var oldStack = document.getElementById("hero-count-stack");
  if (oldStack && oldStack.parentElement) oldStack.remove();
  stage.replaceChildren();
  heroMarks = [];
  heroLayout = null;
  heroResetMotion();
  heroWidthCached = 0;

  if (section) {
    section.classList.remove("hero-scroll");
    heroClearRunway(section);
  }

  var built = heroBuildBoard({ withTiles: false });
  heroMarks = built.marks;
  stage.appendChild(built.board);
}

function heroWallLayout() {
  var section = document.getElementById("all");
  var board = document.getElementById("hero-board");
  if (section) {
    section.classList.remove("hero-scroll");
    heroClearRunway(section);
  }
  if (board) {
    board.className = "hero portraits";
    board.style.height = "";
  }
  heroLayout = null;
}

function heroWallSync() {}
