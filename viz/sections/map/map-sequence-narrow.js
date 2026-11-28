// Fig. 8 on narrow screens: continent frames in one view (Oesch-style),
// so Europe / Africa / N·S America / Asia+Oceania can be read together
// instead of one tiny world map or three tall strips.

function mapSeqNarrow() {
  var el = document.getElementById("map-seq-chart");
  if (!el) return false;
  if (el.clientWidth > 0) return el.clientWidth < 640;
  return document.documentElement.getAttribute("data-display") === "phone";
}

// Continent frames for the simultaneous phone collage.
// Bins match Fig. 8a via birthContinent().
function mapSeqContinentFrames() {
  // Oesch-like slices. Equirectangular portholes (not Mercator).
  // Windows crop to the familiar landmass - not the full geographic bin
  // (e.g. NAM drops the high Arctic so Canada isn't a clipped stump).
  // `disp` ≈ CSS width fraction - keeps mark size equal across frames.
  // Defaults: disp 0.5, square, oval 0.38 - Asia overrides.
  return [
    {
      key: "mapSeqFacetEurope",
      cls: "is-europe",
      test: function (lon, lat) { return birthContinent(lon, lat) === "europe"; },
      lonLo: -14,
      lonHi: 42,
      latLo: 34,
      latHi: 72,
      disp: 0.5,
      square: true,
      ovalRx: 0.38,
      ovalRy: 0.38
    },
    {
      key: "mapSeqFacetAfrica",
      cls: "is-africa",
      test: function (lon, lat) { return birthContinent(lon, lat) === "africa"; },
      lonLo: -20,
      lonHi: 52,
      latLo: -36,
      latHi: 38,
      disp: 0.5,
      square: true,
      ovalRx: 0.38,
      ovalRy: 0.38
    },
    {
      key: "mapSeqFacetNorthAmerica",
      cls: "is-nam",
      test: function (lon, lat) { return birthContinent(lon, lat) === "north"; },
      // Contiguous US + Central America + Caribbean; skip Arctic waste.
      lonLo: -128,
      lonHi: -58,
      latLo: 5,
      latHi: 55,
      disp: 0.5,
      square: true,
      ovalRx: 0.38,
      ovalRy: 0.38
    },
    {
      key: "mapSeqFacetSouthAmerica",
      cls: "is-sam",
      test: function (lon, lat) { return birthContinent(lon, lat) === "south"; },
      lonLo: -82,
      lonHi: -34,
      latLo: -55,
      latHi: 14,
      disp: 0.5,
      square: true,
      ovalRx: 0.38,
      ovalRy: 0.38
    },
    {
      key: "mapSeqFacetAsiaOceania",
      cls: "is-asia",
      test: function (lon, lat) {
        var c = birthContinent(lon, lat);
        return c === "asia" || c === "oceania";
      },
      // Include West Asia (lon < 60); 40° cut was dragging that tile into India.
      lonLo: 24,
      lonHi: 178,
      latLo: -48,
      latHi: 50,
      disp: 1,
      square: false,
      // Soft mask: room west (Middle East) + bottom-right (Oceania).
      ovalRx: 0.51,
      ovalRy: 0.45,
      ovalCx: 0.54,
      ovalCy: 0.46
    }
  ];
}
