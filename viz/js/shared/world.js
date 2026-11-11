// Cold War three-world reading of WINNER_COUNTRY.
// Optional product used by occupations-world.js / years-world.js.
// first = US / Western sphere; second = Soviet / socialist sphere; third = other.

var WORLD_FIRST_FILL = "#3d5a80";
var WORLD_FIRST_HOT = "#2a3f5c";
var WORLD_SECOND_FILL = "#b85c38";
var WORLD_SECOND_HOT = "#8a3f24";
var WORLD_THIRD_FILL = "#5f7a3e";
var WORLD_THIRD_HOT = "#3f5229";
var WORLD_FILL = {
  first: WORLD_FIRST_FILL,
  second: WORLD_SECOND_FILL,
  third: WORLD_THIRD_FILL
};
var WORLD_HOT = {
  first: WORLD_FIRST_HOT,
  second: WORLD_SECOND_HOT,
  third: WORLD_THIRD_HOT
};

var WORLD_FIRST = {
  "United States": 1,
  "United Kingdom": 1,
  "France": 1,
  "West Germany": 1,
  "Italy": 1,
  "Japan": 1,
  "Canada": 1,
  "Australia": 1,
  "Belgium": 1,
  "Netherlands": 1,
  "Norway": 1,
  "Denmark": 1,
  "Sweden": 1,
  "Austria": 1,
  "Switzerland": 1,
  "Ireland": 1,
  "Spain": 1,
  "Greece": 1,
  "Finland": 1,
  "South Africa": 1,
  "South Vietnam": 1
};

var WORLD_SECOND = {
  "Soviet Union": 1,
  "East Germany": 1,
  "Poland": 1,
  "Czechoslovakia": 1,
  "Hungary": 1,
  "Bulgaria": 1,
  "Romania": 1,
  "Mongolia": 1,
  "North Korea": 1,
  "China": 1,
  "Cuba": 1,
  "Vietnam": 1,
  "Angola": 1,
  "Mozambique": 1,
  "Nicaragua": 1
};

var WORLD_ORDER = ["first", "second", "third"];

function countryParts(country) {
  return String(country || "").split(";").map(function (part) {
    return part.trim();
  }).filter(Boolean);
}

function worldOfCountry(country) {
  var parts = countryParts(country);
  if (!parts.length) return "third";
  var primary = parts[0];
  if (WORLD_SECOND[primary]) return "second";
  if (WORLD_FIRST[primary]) return "first";
  if (parts.some(function (part) { return WORLD_SECOND[part]; })) return "second";
  if (parts.some(function (part) { return WORLD_FIRST[part]; })) return "first";
  return "third";
}

function worldOf(person) {
  if (person && person.world) return person.world;
  return worldOfCountry(person && person.country);
}
