// Shared regional bins for Fig. 8 (map sequence). Europe and Asia are
// geographic subregions from coordinates; North America goes down to countries;
// other parts of the world stay whole.
var PLACE_GROUPS = [];
var MAP_SQUARE_UNITS = [
  { key: "mapSqCanada", kind: "country", matchCountry: "Canada", fill: "#7fa0b8", hot: "#4f738c" },
  { key: "mapSqUnitedStates", kind: "country", matchCountry: "United States", fill: "#5b87ad", hot: "#3a6588" },
  { key: "mapSqCentralAmerica", kind: "region", fill: "#6f93b0", hot: "#3f6a8a" },
  { key: "mapSqCuba", kind: "country", matchCountry: "Cuba", fill: "#88a9bc", hot: "#587890" },
  { key: "mapSqCaribbean", kind: "region", fill: "#9ebac9", hot: "#6c8898" },
  { key: "mapSqSouthAmerica", kind: "region", fill: "#5f8f9a", hot: "#3a6872" },
  { key: "mapSqNorthernEurope", kind: "region", fill: "#b8935e", hot: "#8e6c38" },
  { key: "mapSqWesternEurope", kind: "region", fill: "#d0a45c", hot: "#a57c30" },
  { key: "mapSqCentralEurope", kind: "region", fill: "#c49a55", hot: "#9a7030" },
  { key: "mapSqEasternEurope", kind: "region", fill: "#b8874e", hot: "#8c6230" },
  { key: "mapSqSouthernEurope", kind: "region", fill: "#d4a86a", hot: "#a87e3e" },
  { key: "mapSqAfrica", kind: "region", fill: "#c17f5a", hot: "#945536" },
  { key: "mapSqWestAsia", kind: "region", fill: "#8fad7a", hot: "#628454" },
  { key: "mapSqSouthAsia", kind: "region", fill: "#6f9f7a", hot: "#3f7a52" },
  { key: "mapSqEastAsia", kind: "region", fill: "#7a9a6f", hot: "#557848" },
  { key: "mapSqSoutheastAsia", kind: "region", fill: "#5f9470", hot: "#3c7050" },
  { key: "mapSqOceania", kind: "region", fill: "#6a9274", hot: "#466c52" }
];

// Prefer outward corners in crowded belts (Europe / Asia).
var MAP_SQUARE_PREFERRED_CORNERS = {
  mapSqCanada: ["bl", "br", "tl", "tr"],
  mapSqUnitedStates: ["bl", "br", "tl", "tr"],
  mapSqCentralAmerica: ["bl", "br", "tl", "tr"],
  mapSqCuba: ["br", "tr", "bl", "tl"],
  mapSqCaribbean: ["br", "bl", "tr", "tl"],
  mapSqSouthAmerica: ["br", "bl", "tr", "tl"],
  mapSqNorthernEurope: ["tl", "tr", "bl", "br"],
  mapSqWesternEurope: ["bl", "tl", "br", "tr"],
  mapSqCentralEurope: ["tr", "tl", "br", "bl"],
  mapSqEasternEurope: ["tr", "br", "tl", "bl"],
  mapSqSouthernEurope: ["br", "bl", "tr", "tl"],
  mapSqAfrica: ["br", "bl", "tr", "tl"],
  mapSqWestAsia: ["bl", "br", "tl", "tr"],
  mapSqSouthAsia: ["br", "bl", "tr", "tl"],
  mapSqEastAsia: ["tr", "tl", "br", "bl"],
  mapSqSoutheastAsia: ["br", "bl", "tr", "tl"],
  mapSqOceania: ["br", "bl", "tr", "tl"]
};

function mapSquarePreferredCorners(key) {
  return MAP_SQUARE_PREFERRED_CORNERS[key] || ["br", "bl", "tr", "tl"];
}

function birthContinent(lon, lat) {
  if (lon < -25) {
    if (lat < 8) return "south";
    if (lat < 13 && lon > -79) return "south";
    return "north";
  }
  if (lon >= 125 && lat < -5) return "oceania";
  if (lon >= 150) return lat < 20 ? "oceania" : "asia";
  if (-18 <= lon && lon <= 52 && -35 <= lat && lat <= 37.5) {
    if (lat >= 36 && lon >= -10 && lon <= 28.5) {
      if (lon < 0) return "europe";
      if (lon <= 12) return "africa";
      return "europe";
    }
    if (lat >= 29 && lat <= 32 && lon >= 24 && lon <= 36) return "africa";
    if (lon >= 32 && lat >= 29) return "asia";
    if (lat < 36) return "africa";
  }
  if (-25 <= lon && lon < 55 && lat > 35) return "europe";
  if (lon >= 26) return "asia";
  return "europe";
}

function europeSubregionKey(lon, lat) {
  if (lat >= 55) return "mapSqNorthernEurope";
  if (lon >= 24 && lat >= 41) return "mapSqEasternEurope";
  if (lat < 44) return "mapSqSouthernEurope";
  if (lon >= 8) return "mapSqCentralEurope";
  return "mapSqWesternEurope";
}

function asiaSubregionKey(lon, lat) {
  if (lon < 60) return "mapSqWestAsia";
  if (lon < 95 && lat > 5 && lat < 38) return "mapSqSouthAsia";
  if (lon < 141 && lat > -12 && lat < 25) return "mapSqSoutheastAsia";
  return "mapSqEastAsia";
}

function northAmericaUnitKey(person) {
  var country = person.birthCountry || "";
  if (country === "United States") return "mapSqUnitedStates";
  if (country === "Canada") return "mapSqCanada";
  if (country === "Cuba") return "mapSqCuba";
  if (country === "Mexico" || country === "Guatemala") return "mapSqCentralAmerica";
  var lon = person.birthLon;
  var lat = person.birthLat;
  if (lon <= -74 && lon >= -85 && lat >= 19 && lat <= 24) return "mapSqCuba";
  if (lon <= -88 && lon >= -118 && lat >= 13.5 && lat <= 33) return "mapSqCentralAmerica";
  if (lon <= -66 && lon >= -125 && lat >= 24 && lat <= 50) return "mapSqUnitedStates";
  if (lat >= 48) return "mapSqCanada";
  return "mapSqCaribbean";
}

function birthSquareUnitKey(person) {
  var lon = person.birthLon;
  var lat = person.birthLat;
  var continent = birthContinent(lon, lat);
  if (continent === "north") return northAmericaUnitKey(person);
  if (continent === "south") return "mapSqSouthAmerica";
  if (continent === "africa") return "mapSqAfrica";
  if (continent === "oceania") return "mapSqOceania";
  if (continent === "europe") return europeSubregionKey(lon, lat);
  return asiaSubregionKey(lon, lat);
}

function squareUnitLabel(unit) {
  if (unit.kind === "country" && unit.matchCountry) return countryLabel(unit.matchCountry);
  return t(unit.key);
}

function mapSeparateTiles(placed, tileGap) {
  var gap = tileGap == null ? 6 : tileGap;
  for (var pass = 0; pass < 120; pass += 1) {
    var moved = false;
    for (var i = 0; i < placed.length; i += 1) {
      for (var j = i + 1; j < placed.length; j += 1) {
        var a = placed[i];
        var b = placed[j];
        var mx = (a.side + b.side) / 2 + gap;
        var my = mx;
        var dx = b.cx - a.cx;
        var dy = b.cy - a.cy;
        if (dx === 0 && dy === 0) {
          dx = 0.01 * (j - i);
          dy = 0.01 * (i + 1);
        }
        var ox = mx - Math.abs(dx);
        var oy = my - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        if (ox < oy) {
          var sx = dx < 0 ? -1 : 1;
          var pushX = ox * 0.51;
          a.cx -= sx * pushX;
          b.cx += sx * pushX;
        } else {
          var sy = dy < 0 ? -1 : 1;
          var pushY = oy * 0.51;
          a.cy -= sy * pushY;
          b.cy += sy * pushY;
        }
        moved = true;
      }
    }
    if (!moved) break;
  }
}
