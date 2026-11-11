function svgEl(name) {
  return document.createElementNS(SVG_NS, name);
}

function shortYear(year) {
  const parts = year.split("-");
  if (parts.length === 1) return parts[0];
  return parts[0] + "-" + parts[1].slice(2);
}

function cohortBounds(year) {
  const parts = year.split("-").map(Number);
  return [parts[0], parts.length > 1 ? parts[1] : parts[0]];
}

function paintMark(node, person, fill, hot) {
  if (fill == null) {
    fill = person.gender === "female" ? FEMALE : MALE;
    hot = person.gender === "female" ? FEMALE_HOT : MALE_HOT;
  }
  node.setAttribute("fill", fill);
  node.dataset.fill = fill;
  node.dataset.hot = hot;
  node.dataset.stroke = "none";
  node.dataset.i = String(person.i);
  node.dataset.mark = "1";
  node.setAttribute("tabindex", "0");
  node.setAttribute("role", "img");
  node.setAttribute("aria-label", ageMarkAria(person));
  if (!wikiFor(person)) node.classList.add("no-link");
}
