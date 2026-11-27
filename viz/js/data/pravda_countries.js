// Country affiliation as Pravda wrote it in the caption / decree line:
// usually a parenthetical ("… (Франция)"), sometimes only in the wording
// ("президент Китайской академии наук"). Keys match COUNTRY / world.js.

var PRAVDA_COUNTRY_PAREN = {
  "США": "United States",
  "Соединенные Штаты Америки": "United States",
  "Франция": "France",
  "Англия": "United Kingdom",
  "Великобритания": "United Kingdom",
  "Япония": "Japan",
  "Италия": "Italy",
  "Швеция": "Sweden",
  "Индия": "India",
  "Республика Индия": "India",
  "Греция": "Greece",
  "СССР": "Soviet Union",
  "Колумбия": "Colombia",
  "Германская Демократическая Республика": "East Germany",
  "ГДР": "East Germany",
  "Народная Республика Болгария": "Bulgaria",
  "Мексика": "Mexico",
  "Германия": "Germany",
  "Бразилия": "Brazil",
  "Бельгия": "Belgium",
  "Чили": "Chile",
  "Финляндия": "Finland",
  "Куба": "Cuba",
  "Республика Куба": "Cuba",
  "Аргентина": "Argentina",
  "Ливан": "Lebanon",
  "Австралия": "Australia",
  "Польская Народная Республика": "Poland",
  "ПНР": "Poland",
  "Польша": "Poland",
  "Венгерская Народная Республика": "Hungary",
  "Испания": "Spain",
  "Чехословацкая Социалистическая Республика": "Czechoslovakia",
  "Чехословакия": "Czechoslovakia",
  "Федеративная Республика Германия": "West Germany",
  "Германская Федеральная Республика": "West Germany",
  "ФРГ": "West Germany",
  "Уругвай": "Uruguay",
  "Швейцария": "Switzerland",
  "Индонезия": "Indonesia",
  "Республика Индонезия": "Indonesia",
  "Бирма": "Burma",
  "Сирия": "Syria",
  "Норвегия": "Norway",
  "Цейлон": "Ceylon",
  "Иракская Республика": "Iraq",
  "Гвинейская Республика": "Guinea",
  "Румынская Народная Республика": "Romania",
  "Пакистан": "Pakistan",
  "Республика Гана": "Ghana",
  "Республика Мали": "Mali",
  "Алжирская Народная Демократическая Республика": "Algeria",
  "Дания": "Denmark",
  "Монгольская Народная Республика": "Mongolia",
  "Республика Гватемала": "Guatemala",
  "Федеративная Республика Нигерия": "Nigeria",
  "Южно-Африканская Республика": "South Africa",
  "ЮАР": "South Africa",
  "Нидерланды": "Netherlands",
  "Южный Вьетнам": "South Vietnam",
  "Объединенная Арабская Республика": "Egypt",
  "Арабская Республика Египет": "Egypt",
  "Судан": "Sudan",
  "Ирландия": "Ireland",
  "Венесуэла": "Venezuela",
  "Канада": "Canada",
  "Палестина": "Palestine",
  "Объединенная Республика Танзания": "Tanzania",
  "Республика Никарагуа": "Nicaragua"
};

// When Pravda skipped parentheses, the country still sits in the wording.
var PRAVDA_COUNTRY_INLINE = [
  [/Китайск/i, "China"],
  [/Кореи/i, "North Korea"],
  [/Французск|Коллеж де Франс|(^|[^А-Яа-я])Франция/i, "France"],
  [/бразильск/i, "Brazil"],
  [/Канада/i, "Canada"],
  [/Германская Демократическая Республика|\bГДР\b/i, "East Germany"],
  [/\bСША\b|Соединенн/i, "United States"],
  [/Всеиндийск|\bИндии\b|Индийск|Индия/i, "India"],
  [/Мексик/i, "Mexico"],
  [/Вьетнам|\bСРВ\b/i, "Vietnam"],
  [/\bСССР\b|\bКПСС\b/i, "Soviet Union"],
  [/Грац|Австри/i, "Austria"],
  [/Чили/i, "Chile"],
  [/Гвинейск/i, "Guinea"],
  [/Ангол/i, "Angola"],
  [/Венгерск/i, "Hungary"],
  [/Мозамбик/i, "Mozambique"],
  [/Финлянд/i, "Finland"],
  [/Англии|Великобритании/i, "United Kingdom"]
];

// Approximate map seats for affiliation squares (not birth means).
var PRAVDA_COUNTRY_GEO = {
  "United States": [-98, 39],
  "Canada": [-96, 56],
  "Mexico": [-102, 23],
  "Cuba": [-79, 22],
  "Guatemala": [-90.5, 15.5],
  "Nicaragua": [-85, 13],
  "Colombia": [-74, 4.5],
  "Venezuela": [-66.5, 7],
  "Brazil": [-52, -12],
  "Argentina": [-64, -35],
  "Chile": [-71, -33],
  "Uruguay": [-56, -33],
  "United Kingdom": [-2, 54],
  "Ireland": [-8, 53],
  "France": [2.3, 46.5],
  "Belgium": [4.5, 50.5],
  "Netherlands": [5.3, 52.2],
  "Switzerland": [8.2, 46.8],
  "Austria": [14.5, 47.5],
  "Italy": [12.5, 42.5],
  "Spain": [-3.5, 40.2],
  "Denmark": [10, 56],
  "Norway": [9, 61],
  "Sweden": [16, 62],
  "Finland": [26, 64],
  "Germany": [10.5, 51.2],
  "West Germany": [8.5, 50.5],
  "East Germany": [13.2, 52.2],
  "Poland": [19.5, 52],
  "Czechoslovakia": [15.5, 49.8],
  "Hungary": [19.5, 47.2],
  "Romania": [25, 46],
  "Bulgaria": [25.5, 42.7],
  "Greece": [22.5, 39.5],
  "Soviet Union": [40, 58],
  "Algeria": [2.5, 28],
  "Guinea": [-11, 10],
  "Mali": [-4, 17],
  "Ghana": [-1.2, 7.9],
  "Nigeria": [8, 9.5],
  "Sudan": [30, 15],
  "Egypt": [30.5, 27],
  "Angola": [17.5, -12.5],
  "Mozambique": [35.5, -18],
  "Tanzania": [35, -6],
  "South Africa": [25, -29],
  "Lebanon": [35.8, 33.9],
  "Syria": [38.5, 35],
  "Iraq": [44, 33],
  "Palestine": [35.2, 31.9],
  "India": [79, 22],
  "Pakistan": [69, 30],
  "Ceylon": [80.7, 7.9],
  "Burma": [96, 20],
  "China": [104, 35],
  "Mongolia": [103, 46.5],
  "North Korea": [127.5, 40.2],
  "Vietnam": [106.5, 16],
  "South Vietnam": [107, 11],
  "Indonesia": [118, -4],
  "Japan": [138, 36],
  "Australia": [134, -25]
};

// Same regional bins as Fig. 8a (MAP_SQUARE_UNITS), keyed from the Pravda country.
var PRAVDA_COUNTRY_TO_REGION = {
  "Canada": "mapSqCanada",
  "United States": "mapSqUnitedStates",
  "Mexico": "mapSqCentralAmerica",
  "Guatemala": "mapSqCentralAmerica",
  "Nicaragua": "mapSqCentralAmerica",
  "Cuba": "mapSqCuba",
  "Colombia": "mapSqSouthAmerica",
  "Venezuela": "mapSqSouthAmerica",
  "Brazil": "mapSqSouthAmerica",
  "Argentina": "mapSqSouthAmerica",
  "Chile": "mapSqSouthAmerica",
  "Uruguay": "mapSqSouthAmerica",
  "United Kingdom": "mapSqWesternEurope",
  "Ireland": "mapSqWesternEurope",
  "France": "mapSqWesternEurope",
  "Belgium": "mapSqWesternEurope",
  "Netherlands": "mapSqWesternEurope",
  "Switzerland": "mapSqWesternEurope",
  "West Germany": "mapSqWesternEurope",
  "Norway": "mapSqNorthernEurope",
  "Sweden": "mapSqNorthernEurope",
  "Finland": "mapSqNorthernEurope",
  "Denmark": "mapSqNorthernEurope",
  "Germany": "mapSqCentralEurope",
  "East Germany": "mapSqCentralEurope",
  "Austria": "mapSqCentralEurope",
  "Czechoslovakia": "mapSqCentralEurope",
  "Poland": "mapSqCentralEurope",
  "Hungary": "mapSqCentralEurope",
  "Soviet Union": "mapSqEasternEurope",
  "Bulgaria": "mapSqEasternEurope",
  "Romania": "mapSqEasternEurope",
  "Italy": "mapSqSouthernEurope",
  "Spain": "mapSqSouthernEurope",
  "Greece": "mapSqSouthernEurope",
  "Algeria": "mapSqAfrica",
  "Guinea": "mapSqAfrica",
  "Mali": "mapSqAfrica",
  "Ghana": "mapSqAfrica",
  "Nigeria": "mapSqAfrica",
  "Sudan": "mapSqAfrica",
  "Egypt": "mapSqAfrica",
  "Angola": "mapSqAfrica",
  "Mozambique": "mapSqAfrica",
  "Tanzania": "mapSqAfrica",
  "South Africa": "mapSqAfrica",
  "Lebanon": "mapSqWestAsia",
  "Syria": "mapSqWestAsia",
  "Iraq": "mapSqWestAsia",
  "Palestine": "mapSqWestAsia",
  "India": "mapSqSouthAsia",
  "Pakistan": "mapSqSouthAsia",
  "Ceylon": "mapSqSouthAsia",
  "Burma": "mapSqSoutheastAsia",
  "China": "mapSqEastAsia",
  "Mongolia": "mapSqEastAsia",
  "North Korea": "mapSqEastAsia",
  "Japan": "mapSqEastAsia",
  "Vietnam": "mapSqSoutheastAsia",
  "South Vietnam": "mapSqSoutheastAsia",
  "Indonesia": "mapSqSoutheastAsia",
  "Australia": "mapSqOceania"
};

function pravdaCountryFromText(text) {
  var raw = String(text || "").trim();
  if (!raw) return null;
  var paren = raw.match(/\(([^)]+)\)\s*$/);
  if (paren) {
    var inside = paren[1].trim();
    if (inside !== "посмертно" && PRAVDA_COUNTRY_PAREN[inside]) {
      return PRAVDA_COUNTRY_PAREN[inside];
    }
  }
  for (var i = 0; i < PRAVDA_COUNTRY_INLINE.length; i += 1) {
    if (PRAVDA_COUNTRY_INLINE[i][0].test(raw)) return PRAVDA_COUNTRY_INLINE[i][1];
  }
  return null;
}

function pravdaCountryKey(person) {
  var row = typeof pravdaOccFor === "function" ? pravdaOccFor(person) : null;
  var fromText = row && row.text ? pravdaCountryFromText(row.text) : null;
  if (fromText) return fromText;
  if (person && person.country) {
    return String(person.country).split(";")[0].trim() || null;
  }
  return null;
}

function pravdaRegionKey(person) {
  var country = pravdaCountryKey(person);
  if (!country) return null;
  if (PRAVDA_COUNTRY_TO_REGION[country]) return PRAVDA_COUNTRY_TO_REGION[country];
  return null;
}
