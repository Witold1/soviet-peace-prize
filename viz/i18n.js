var lang = "ru";

var OCC = {
  "Anglican priest": "англиканский священник",
  "Buddhist monk": "буддийский монах",
  "Catholic priest": "католический священник",
  "Politician and public figure": "политик и общественный деятель",
  "academic": "ученый",
  "activist": "активист",
  "anthropologist": "антрополог",
  "architect": "архитектор",
  "biographer": "биограф",
  "caricaturist": "карикатурист",
  "chemist": "химик",
  "choir director": "хормейстер",
  "composer": "композитор",
  "diplomat": "дипломат",
  "dressmaker": "портниха",
  "entrepreneur": "предприниматель",
  "film director": "кинорежиссер",
  "historian": "историк",
  "human rights defender": "правозащитник",
  "journalist": "журналист",
  "legal counselor": "юрист",
  "linguist": "лингвист",
  "mathematician": "математик",
  "military officer": "военный",
  "minister": "священник",
  "missionary": "миссионер",
  "novelist": "писатель",
  "nuclear physicist": "физик-ядерщик",
  "painter": "художник",
  "philanthropist": "филантроп",
  "physician": "врач",
  "physician writer": "врач и писатель",
  "physicist": "физик",
  "playwright": "драматург",
  "poet": "поэт",
  "political activist": "политический активист",
  "political scientist": "политолог",
  "politician": "политик",
  "priest": "священник",
  "public figure": "общественный деятель",
  "screenwriter": "сценарист",
  "sculptor": "скульптор",
  "singer": "певец",
  "social worker": "общественный работник",
  "teacher": "учитель",
  "theologian": "богослов",
  "trade unionist": "профсоюзный деятель",
  "translator": "переводчик",
  "university teacher": "преподаватель",
  "women's rights activist": "активистка за права женщин",
  "writer": "писатель",
  "public_figure": "общественный деятель",
  "scientist": "ученый",
  "culture": "деятель культуры",
  "clergy": "религиозный деятель",
  "labor_movement": "деятель рабочего движения"
};

var COUNTRY = {
  "Algeria": "Алжир",
  "Angola": "Ангола",
  "Argentina": "Аргентина",
  "Australia": "Австралия",
  "Austria": "Австрия",
  "Belgium": "Бельгия",
  "Brazil": "Бразилия",
  "Bulgaria": "Болгария",
  "Burma": "Бирма",
  "Canada": "Канада",
  "Ceylon": "Цейлон",
  "Chile": "Чили",
  "China": "Китай",
  "Colombia": "Колумбия",
  "Croatia": "Хорватия",
  "Cuba": "Куба",
  "Czech Republic": "Чехия",
  "Czechoslovakia": "Чехословакия",
  "Denmark": "Дания",
  "East Germany": "ГДР",
  "Egypt": "Египет",
  "Finland": "Финляндия",
  "France": "Франция",
  "Germany": "Германия",
  "Ghana": "Гана",
  "Greece": "Греция",
  "Guatemala": "Гватемала",
  "Guinea": "Гвинея",
  "Hungary": "Венгрия",
  "India": "Индия",
  "Indonesia": "Индонезия",
  "Iraq": "Ирак",
  "Ireland": "Ирландия",
  "Italy": "Италия",
  "Japan": "Япония",
  "Lebanon": "Ливан",
  "Mali": "Мали",
  "Mandatory Palestine": "Подмандатная Палестина",
  "Mexico": "Мексика",
  "Mongolia": "Монголия",
  "Mozambique": "Мозамбик",
  "Namibia": "Намибия",
  "Netherlands": "Нидерланды",
  "Nicaragua": "Никарагуа",
  "Nigeria": "Нигерия",
  "North Korea": "КНДР",
  "Norway": "Норвегия",
  "Pakistan": "Пакистан",
  "Palestine": "Палестина",
  "People's Republic of China": "КНР",
  "Peru": "Перу",
  "Poland": "Польша",
  "Romania": "Румыния",
  "Russia": "Россия",
  "Slovenia": "Словения",
  "South Africa": "ЮАР",
  "South Vietnam": "Южный Вьетнам",
  "Soviet Union": "СССР",
  "Spain": "Испания",
  "Sudan": "Судан",
  "Sweden": "Швеция",
  "Switzerland": "Швейцария",
  "Syria": "Сирия",
  "Tanzania": "Танзания",
  "Ukraine": "Украина",
  "United Kingdom": "Великобритания",
  "United States": "США",
  "Uruguay": "Уругвай",
  "Venezuela": "Венесуэла",
  "Vietnam": "Вьетнам",
  "West Germany": "ФРГ"
};

var I18N = {
  en: {
    title: "From the Stalin Prize to the Lenin Prize: the Soviet international prize for strengthening peace among the peoples",
    langLabel: "Language",
    displayLabel: "Display",
    display_phone: "Phone",
    display_tablet: "Tablet",
    display_laptop: "Laptop",
    fnTitle: "Footnote",
    fnHide: "Hide footnote",
    fnClose: "Close footnote",
    fnRef: "Footnote",
    fnListTitle: "Footnotes",
    fnBack: "Back to the text",
    fnBackLink: "To the text",
    tocLabel: "Contents",
    tocOpening: "Forty years of one prize",
    tocPrize: "How the prize was founded",
    tocRename: "From Stalin to Lenin",
    tocRename1989: "The Lenin Peace Prize",
    pressPlateKicker: "Decree",
    pressPlateWho: "of the Presidium of the Supreme Soviet of the USSR",
    fn1: "For example, here are two lists of peace prizes: <a href=\"https://en.wikipedia.org/wiki/List_of_peace_prizes\">List of peace prizes from English Wikipedia</a> and <a href=\"https://peacebellfoundation.org/peace-prizes/\">Peace Prizes, from the Peace Bell Foundation (501(c)(3) non-profit)</a>.",
    fn2: "For example, see Taylor O’Connor’s account of seventy-two peace prizes: descriptions of each, then a generalization and an analysis. <a href=\"https://everydaypeacebuilding.com/peace-prize-award/\">Mapping 72 Peace Prize Award Programs Around the World, by Taylor O’Connor from Everyday Peacebuilding consultancy, 7 September 2023</a>.",
    fn3: "The decree is also available online in the official bulletin of state acts of the Soviet Supreme Soviet — a rough analogue of the American Federal Register. <a href=\"https://docs.historyrussia.org/ru/nodes/521433-o-pereimenovanii-mezhdunarodnyh-stalinskih-premiy-v-mezhdunarodnye-leninskie-premii-locale-nil-za-ukreplenie-mira-mezhdu-narodami-locale-nil-ukaz-prezidiuma-verhovnogo-soveta-sssr-moskva-6-sentyabrya-1956-g#mode/inspect/page/1/zoom/4\">Scan: Vedomosti of the Supreme Soviet of the USSR, 1956, no. 18, art. 393, page 258</a>.",
    h1: "From the Stalin Prize to the Lenin Prize: the Soviet international prize for strengthening peace among the peoples",
    opener: "For forty years, from 1950 to 1990, the Soviet Union awarded a peace prize of its own. It ended with the state that gave it.",
    intro: "Peace prizes are awarded by many kinds of institutions<sup class=\"fn\"><button type=\"button\" class=\"fn-ref\" id=\"fnref-1\" data-fn=\"1\">1</button></sup>. Governments give them, and so do religious organizations, universities, and private foundations. Some are known around the world, and some are known mainly to the people who receive them. Some last only a few years and then disappear. Others are still awarded decades after they were founded. Each prize works from its own definition of peace and of peacebuilding, and each awarding committee judges by its own standards and its own biases<sup class=\"fn\"><button type=\"button\" class=\"fn-ref\" id=\"fnref-2\" data-fn=\"2\">2</button></sup>. The prize followed here is one of the long ones that later closed.",
    hook: "<p>The International Lenin Prize for Strengthening Peace Among Peoples (until 1955: International Stalin Prize for Strengthening Peace Among Peoples) was established on December 20, 1949, by the Presidium of the Supreme Soviet of the USSR on the occasion of Joseph Stalin's seventieth birthday. It was awarded annually in Moscow to up to ten people.</p><p>The award was considered the Soviet Union's answer to the Nobel Peace Prize and was bestowed by an international prize committee. Usually, several people were honored at a time. The chairman of the prize committee was the physicist Dmitri Skobelzyn from 1950 to 1973, followed by the oncologist Nikolai Blokhin until 1987, and finally, after the prize was restructured in 1989, the welding engineer Borys Paton.</p><p>In the course of de-Stalinization, the name was changed by decree of the Presidium of the Supreme Soviet on September 6, 1956, to the International Lenin Prize for Strengthening Peace Among Peoples (Russian: Международная Ленинская премия «За укрепление мира между народами»). All previous laureates were asked to return their medals for exchange. Subsequently, the announcement of the laureates no longer took place on Stalin's birthday in December, but usually on May 1.</p><p>On December 11, 1989, the Supreme Soviet reorganized the awarding of the prize. It was to be awarded every two years; the recipient(s) were to be announced on Lenin's birthday, April 22. Only one more prize was awarded under the new rules until the dissolution of the Soviet Union in 1991.</p>",
    coldWarEssay: "<p>The prize's founding document declared it to be an award for people who contributed to strengthening peace and fought against warmongers. It claimed to be free from political, religious, racial, or other biases. However, as multiple “fires” kept flaring up across various theaters of the global standoff popularized under the name of the Cold War, the Capitalist bloc came to frame the Soviet peace prize as an instrument of ideological influence from the Communist bloc. Unambiguous affiliation—the Soviet legislative branch established it and selected the international committee to discuss the nominations—with the leading player of the rival camp didn't ease the hostility. Notably, a very similar distrust existed on the other side of the “Iron Curtain” regarding the West’s own premier award, the Nobel Peace Prize.</p>",
    occEssay: "<p>The decree of 1949 assigns the prize to citizens of any country for the struggle against the instigators of war. The clouds show the kind of public life those people brought into the list.</p><p>Of the 167 people, 67 are classed as politicians and 50 as cultural figures. Together they are most of the list. There are 15 scientists, 18 public figures, 10 religious figures, and 7 labor-movement figures. Twenty-nine are women. Thirteen of the women are in the political cloud, and eight are public figures. The cultural cloud holds four women. The religious cloud and the labor cloud hold none.</p>",
    yearEssay: "<p>The decree of 1949 promised five to ten prizes a year. The columns keep that promise only at the start.</p><p>From 1950 through 1955 there are six full years and 45 people. The shortest of those columns has six, and in 1953 the column reaches ten, the ceiling the decree set for itself. From 1956 the prize goes on, but the columns sit lower, often at four or five, and from the late 1960s a cohort often covers two years. The span 1980-1982 covers three. There are thirty cohorts in all. Two of them, 1988 and 1990, are a single person. The list has no cohort of its own for 1987 or for 1989.</p><p>Women are in the prize from the first year: three of the seven in 1950. After that, whole years pass without them. They stand thickest in the 1977-1978 cohort, four of six. Among the Stalin-year laureates, 10 of 45 are women. Among the later laureates, 19 of 122.</p>",
    renameEssay: "<p>On the chart, 1956 is not an empty year. That cohort has eight people, and the list already counts them as Lenin laureates. Between Stalin’s death and the renaming there are about three years of <em>Pravda</em> — on the order of a thousand issues. The carousel opens on the death announcement and then on ordinary front pages of a party struggle already under way: a crisis of leadership, and conflicting views and strategic plans in politics and the economy. The pattern is familiar — not a repeat, but a rhyme: like the Second Triumvirate after Caesar’s death (Octavian, Antony, Lepidus), or the Thermidorian Reaction in France after Robespierre’s execution. History doesn't repeat itself, but it often rhymes. Most of that carousel is noise for this story. Two frames matter: on 2 July 1956 the paper prints the Central Committee resolution “On overcoming the cult of personality and its consequences”; in September the prize changes its name, and the portrait on the medal.</p><p>The renaming decree is dated 6 September 1956. It does not found a new prize, and it does not close the old one. The first sentence explains the renaming by the wishes of the committees. The sum does not change: still 100,000 rubles. Point 3 extends to the laureates of 1950-1955 only the diploma and the medal, subparagraphs (a) and (b), and does not extend the cash. Those earlier laureates, as the text above has already said, were asked to hand the medal back for exchange: the old one bears Stalin, the new one bears Lenin. The decree still says each year, and up to ten. No column after 1953 reaches ten.</p>",
    destalinLabel: "De-Stalinization in Pravda, 1953–1956",
    destalinNext: "Next",
    destalinPrev: "Previous",
    destalinWhy: "But why did it turn out this way?",
    destalinDeathScanAlt: "Pravda, 6 March 1953, page 1, announcing the death of J. V. Stalin.",
    destalinDeathSide: "Enlarge the death announcement",
    destalinDeathSource: "Front page of <em>Pravda</em> announcing the death of J. V. Stalin, including the medical report. <a href=\"https://archive.org/details/195365_1389\">Scan of the issue: Pravda, 6 March 1953, no. 65 (12633), page 1</a>.",
    destalin1953191ScanAlt: "Pravda, 10 July 1953, page 1, with the report on Beria’s removal.",
    destalinBeriaSide: "Enlarge the Beria report",
    destalin1953191Source: "Front page of <em>Pravda</em> with the Central Committee report and the Presidium decree removing L. P. Beria. <a href=\"https://archive.org/details/1953191_3088\">Scan of the issue: Pravda, 10 July 1953, no. 191 (12759), page 1</a>.",
    destalin1955040ScanAlt: "Pravda, 9 February 1955, page 1, with Malenkov’s resignation from the Council of Ministers.",
    destalinMalenkovSide: "Enlarge the Malenkov resignation",
    destalin1955040Source: "Front page of <em>Pravda</em> with the Supreme Soviet session that accepted G. M. Malenkov’s resignation as Chairman of the Council of Ministers. <a href=\"https://archive.org/details/195540_9158\">Scan of the issue: Pravda, 9 February 1955, no. 40 (13338), page 1</a>.",
    destalinCultScanAlt: "Pravda, 2 July 1956, page 1, with the Central Committee resolution on overcoming the cult of personality.",
    destalinCultSide: "Enlarge the resolution title",
    destalinCultSource: "Front page of <em>Pravda</em> with the Central Committee resolution on overcoming the cult of personality. <a href=\"https://archive.org/details/1956184_2372\">Scan of the issue: Pravda, 2 July 1956, no. 184 (13847), page 1</a>.",
    ageEssay: "<p>The decree speaks of outstanding service. On the age chart that service belongs to a long public life. The mean sits near sixty, and the dashed line stands about there. Only eight people were under forty. Eighteen were seventy-five or older. The mass of the list lies between those edges: 76 people from 40 to 59, and 65 from 60 to 74.</p><p>The women are a little younger than the men on average, about 57 against about 61. The gap is small. In this too the prize reads as a list of public lives already made. The youngest and the oldest are named in the line under this paragraph. The empty left end of the scale matters more than the extreme.</p>",
    mapEssay: "<p>The same decree says: citizens of any country, with no regard to political, religious, and racial differences. The map tests the geography in that sentence. It does not test the rest. Birth is not citizenship, and it is not the country that put a person forward. A prize that was a domestic honor of the Soviet Union would have piled its births up there.</p><p>The births pile up elsewhere. The largest numbers on record are France, 13, then Germany, 12, the United States, 9, and India, 7. Germany is one label in the file, with East and West not split. Russia and Ukraine together account for eight births. No other Soviet republic appears as a birth country. More than fifty birth countries are named, so the list is wide. Every recorded birth has coordinates on the map. The world of this prize is mostly a world of people born outside the state that signed it.</p>",
    decree: "<header class=\"ukaz-head\"><p class=\"ukaz-kicker\">Decree</p><p>of the Presidium of the Supreme Soviet of the USSR</p><p>On the establishment of the international</p><p>Stalin Prizes</p><p>\"For strengthening peace among the peoples\"</p></header><div class=\"ukaz-body\"><p>1. Establish the international Stalin Prizes \"For strengthening peace among the peoples.\"</p><p>The prizes are awarded to citizens of any country in the world, regardless of political, religious, and racial differences, for outstanding service in the struggle against the instigators of war and for the strengthening of peace.</p><p>2. Establish that persons awarded the international Stalin Prize receive:</p><ul class=\"ukaz-items\"><li>a) a diploma of laureate of the international Stalin Prize;</li><li>b) a gold breast medal with a portrait of J. V. Stalin;</li><li>c) a cash prize of 100,000 rubles.</li></ul><p>3. Establish that the international Stalin Prizes \"For strengthening peace among the peoples\" are awarded each year, from 5 to 10 prizes, by a special Committee for the International Stalin Prizes, formed by the Presidium of the Supreme Soviet of the USSR from representatives of the democratic forces of various countries of the world.</p><p>4. Award the prizes on the birthday of Joseph Vissarionovich Stalin - 21 December of each year.</p><p>Award the first prizes in 1950.</p></div><footer class=\"ukaz-signoff\"><p class=\"ukaz-sign\">Chairman of the Presidium of the Supreme Soviet of the USSR <span class=\"ukaz-who\">N. SHVERNIK.</span></p><p class=\"ukaz-sign\">Secretary of the Presidium of the Supreme Soviet of the USSR <span class=\"ukaz-who\">A. GORKIN.</span></p><p class=\"ukaz-place\">Moscow, the Kremlin. 20 December 1949.</p></footer>",
    seeOriginal: "See the original",
    seeText: "See the transcription",
    decreeScanAlt: "Pravda, 21 December 1949, page 2, with the decree marked in the upper left column.",
    decreeSide: "Enlarge the decree",
    decreePage: "Whole page",
    decreeSource: "The picture is a page of the official newspaper of the Soviet Communist Party devoted to the 70th anniversary of J. V. Stalin, with the printed decree establishing the prize. <a href=\"https://oldgazette.org/pravda/21121949/text2.html\">Transcription of the decree</a>. <a href=\"https://archive.org/details/1949355_7165\">Scan of the issue: Pravda, 21 December 1949, no. 355 (11462), page 2</a>.",
    rename: "<header class=\"ukaz-head\"><p class=\"ukaz-kicker\">Decree</p><p>of the Presidium of the Supreme Soviet of the USSR</p><p>On renaming the international</p><p>Stalin Prizes</p><p>as the international Lenin Prizes</p><p>\"For strengthening peace among the peoples\"</p></header><div class=\"ukaz-body\"><p>1. Taking into account the wishes of the Committees for the International Stalin Prizes,<sup>1</sup> rename the international Stalin Prizes as the international Lenin Prizes \"For strengthening peace among the peoples.\"</p><p>2. Establish that persons awarded the international Lenin Prize receive:</p><ul class=\"ukaz-items\"><li>a) a diploma of laureate of the international Lenin Prize;</li><li>b) a gold breast medal with a portrait of V. I. Lenin;</li><li>c) a cash prize of 100,000 rubles.</li></ul><p>3. Extend subparagraphs (a) and (b) of § 2 of this Decree also to persons who received the International Prize \"For strengthening peace among the peoples\" in 1950-1955.</p><p>4. Establish that the international Lenin Prizes \"For strengthening peace among the peoples\" are awarded each year, up to 10 prizes, by the Committee for the International Lenin Prizes.</p><p>5. The procedure for nominating candidates for the international Lenin Prizes \"For strengthening peace among the peoples,\" and the conditions for awarding these prizes, are drawn up and published by the Committee for the International Lenin Prizes.</p></div><footer class=\"ukaz-signoff\"><p class=\"ukaz-place\">Moscow, the Kremlin. 6 September 1956.</p></footer><p class=\"ukaz-note\"><sup>1</sup> They were established by the Decree of the Presidium of the Supreme Soviet of the USSR of 20 December 1949 (Vedomosti of the Supreme Soviet of the USSR, 1949, no. 66).</p>",
    renameScanAlt: "Pravda, 8 September 1956, page 1, with the renaming decree marked in the lower left.",
    renameSource: "The picture is a page of <em>Pravda</em> with the printed decree renaming the prize.<sup class=\"fn\"><button type=\"button\" class=\"fn-ref\" id=\"fnref-3\" data-fn=\"3\">3</button></sup> <a href=\"https://archive.org/details/1956252_3945\">Scan of the issue: Pravda, 8 September 1956, no. 252 (13915), page 1</a>.",
    rename1989Essay: "<p>By late 1989 the country was already deep in perestroika: shortages, political instability, a growing internal crisis. Against that noise a second renaming of a peace prize was a small act. The resolution below is dated 11 December 1989. It does not found a new prize, and it does not close the old one. It shortens the name to the International Lenin Peace Prize, and it replaces the statute and the committee rules. The prize itself was already slipping toward the far edge of the story.</p><p>The opening sentence explains the change by the present stage of the movement for human survival, a nuclear-free and nonviolent world, and new political thinking. Point 1 is the rename. Points 2 and 3 approve the new statute and the new committee regulations. Point 4 repeals earlier acts, including the renaming decree of 6 September 1956 as later amended. Only one prize was given under the new name: Mandela, for 1990. The Union dissolved the next year.</p>",
    rename1989: "<header class=\"ukaz-head\"><p class=\"ukaz-kicker\">Resolution</p><p>of the Presidium of the Supreme Soviet of the USSR</p><p>of 11 December 1989, No. 905-1</p><p>On the International Lenin Peace Prize</p></header><div class=\"ukaz-body\"><p>Having considered the proposal of the Committee of the Supreme Soviet of the USSR on International Affairs on transforming the International Lenin Prize \"For strengthening peace among the peoples\" and improving the practice of its awarding in light of the present stage of the movement of broad public forces for the survival of humanity, the building of a nuclear-free and nonviolent world, and the establishment in international affairs of new political thinking, the Presidium of the Supreme Soviet of the USSR resolves:</p><p>1. Consider it expedient henceforth to name the International Lenin Prize \"For strengthening peace among the peoples\" the International Lenin Peace Prize.</p><p>2. Approve the Statute of the International Lenin Peace Prize.</p><p>3. Approve the Regulations on the Committee for the International Lenin Peace Prizes.</p><p>4. Consider as no longer in force:</p><ul class=\"ukaz-items\"><li>the Decree of the Presidium of the Supreme Soviet of the USSR of 6 September 1956 \"On the international Lenin Prizes 'For strengthening peace among the peoples'\" as amended by the Decrees of 15 February 1980 and 26 November 1986;</li><li>the Decree of the Presidium of the Supreme Soviet of the USSR of 22 April 1957 \"On the approval of the diploma and the gold breast medal of a laureate of the International Lenin Prize 'For strengthening peace among the peoples'\" as amended by the Decree of 15 February 1980;</li><li>the Resolution of the Presidium of the Supreme Soviet of the USSR of 22 April 1966 \"On the Committee for the international Lenin Prizes 'For strengthening peace among the peoples'\" as amended by the Decrees of 15 February 1980 and 26 November 1986.</li></ul></div><footer class=\"ukaz-signoff\"><p class=\"ukaz-place\">Moscow, the Kremlin. 11 December 1989.</p></footer>",
    rename1989ScanAlt: "Pravda, 12 December 1989, page 1, with the Presidium meeting note marked in the upper right column.",
    rename1989Source: "The picture is a page of <em>Pravda</em> reporting the Presidium meeting the day after the resolution. The full text is the resolution as published. <a href=\"http://pravo.levonevsky.org/baza/soviet/sssr1118.htm\">Transcription of the resolution</a>. <a href=\"https://archive.org/details/1989346_4216\">Scan of the issue: Pravda, 12 December 1989, no. 346 (26064), page 1</a>. <a href=\"https://vedomosti.sssr.su/1989/29/\">Vedomosti of the Congress of People's Deputies of the USSR and the Supreme Soviet of the USSR, 1989, no. 27, art. 534</a>.",
    n1: "Fig. 1.",
    hAll: "Who received the prize",
    capAll: "Everyone who received the prize",
    n2: "Fig. 2.",
    capPress: "The world the prize was founded in",
    hOcc: "Who they were",
    capOcc: "What work did they do?",
    capOccWorld: "Which “world” did they come from?",
    splitNextAria: "Next grouping",
    splitNextToWorld: "Show Cold War worlds",
    splitNextToWork: "Show work classes",
    yearColorNextAria: "Next coloring",
    yearColorNextToWorld: "Color by Cold War world",
    yearColorNextToGender: "Color by gender",
    world_first: "“First world”",
    world_second: "“Second world”",
    world_third: "“Third world”",
    srcOcc: "Each cloud is one class from WINNER_BIO_occupation_class: politician, public figure, scientist, cultural figure, religious figure, or labor-movement figure. Writers, painters, composers, and filmmakers share cultural figure. Trade-union leaders are labor-movement figures. Women are drawn toward the center of their cloud. The class is a reading of the Wikidata occupations and the work note, not the wording of a Pravda decree. Source: laureates.csv.",
    srcOccWorld: "Each cloud is a Cold War three-world reading of WINNER_COUNTRY: “First world” = US / Western sphere, “Second world” = Soviet / socialist sphere, “Third world” = other. Dual listings use the first country. Women are drawn toward the center of their cloud. Source: laureates.csv.",
    n3: "Fig. 3.",
    hYear: "When it was awarded",
    capYear: "Which year did each person receive it?",
    srcYear: "Each column is one prize cohort, placed at the middle of the year or span in the decree. Women are drawn at the foot of the column. The Stalin Prize runs through 1955; from 1956 the prize is the Lenin Prize, and 1990 is the single Lenin Peace Prize. Source: laureates.csv.",
    srcYearWorld: "Each column is one prize cohort, placed at the middle of the year or span in the decree. Marks are colored by a Cold War three-world reading of WINNER_COUNTRY: “First world” = US / Western sphere, “Second world” = Soviet / socialist sphere, “Third world” = other. “First world” sits at the foot of the column. Source: laureates.csv.",
    srcYearSpan: "Scroll stretches each multi-year cohort across the years named in the decree; the hatch marks those spans. Single-year prizes stay one square. Women stay at the foot of the stack. Source: laureates.csv.",
    srcYearSpanWorld: "Scroll stretches each multi-year cohort across the years named in the decree; the hatch marks those spans. Marks stay colored by Cold War world. “First world” sits at the foot of the stack. Source: laureates.csv.",
    yearAriaWorld: "Laureates by prize year. Each square is one person, colored by Cold War world.",
    n4: "Fig. 4.",
    n4a: "Fig. 4a.",
    capAnnounce: "When was each prize announced?",
    announcePrize: "Year in the decree",
    announceDate: "Announcement",
    announcePravda: "Pravda issue (if different day)",
    announceAria: "Prize announcement timeline. Each open square is the year named in the decree; each filled circle is the announcement date; a tick marks the Pravda issue when it falls on another day.",
    srcAnnounce: "Each open square sits at the year named in the decree (META_prize_year). The filled circle is the announcement or decision day (META_announced_date). A short tick beside the circle marks the Pravda issue date (META_pravda_date) when that day is different. The line is the wait between the named year and the announcement. Stalin prizes for 1951-1955 were announced in December of that year; the 1950 prize came in April 1951; Lenin prizes usually around 1 May for the previous year or span. One 1983-1984 name (Florakis) is dated earlier than the rest of that cohort; 1988 has no recorded announcement day. Source: laureates.csv.",
    hAge: "How old they were",
    capAge: "How old were they when they received it?",
    n5: "Fig. 5.",
    n6: "Fig. 6.",
    hMap: "Where they came from",
    capMap: "Where were they born?",
    female: "Female",
    male: "Male",
    methTitle: "How the list was made",
    meth1: "Sources for the roster: year-by-year lists on the prize pages in <a href=\"https://de.wikipedia.org/wiki/Internationaler_Lenin-Friedenspreis\">German</a>, <a href=\"https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B6%D0%B4%D1%83%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F_%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%8F_%C2%AB%D0%97%D0%B0_%D1%83%D0%BA%D1%80%D0%B5%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BC%D0%B8%D1%80%D0%B0_%D0%BC%D0%B5%D0%B6%D0%B4%D1%83_%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%B0%D0%BC%D0%B8%C2%BB\">Russian</a>, and <a href=\"https://en.wikipedia.org/wiki/Lenin_Peace_Prize\">English</a> Wikipedia; the Yearbook of the Great Soviet Encyclopedia (Ежегодник Большой советской энциклопедии); a database of scanned <em>Pravda</em> archives; and a database of the archive of the Committee on the International Lenin Peace Prizes, 1949–1991 (<a href=\"https://guides.rusarchives.ru/terms/6/346/mezhdunarodnye-otnosheniya\">fond R-9522, 1 inventory, 194 files, extreme dates 1949–1991, State Archive of the Russian Federation</a>).",
    meth2: "The roster follows the German Wikipedia chronology, which footnotes the <em>Pravda</em> decree for each year. Six people named only on the English or Russian page are kept. Picasso and Niemeyer keep the years those pages give them. Where a footnote points to a decree, the issue was read in the scanned <em>Pravda</em> archives. Fond R-9522 would be the fullest FOIA-like holding; that fund was not opened for this project.",
    meth3: "The prize year is the year named in the decree, not the day the medal was handed over.",
    meth4: "Stalin prizes for 1951-1955 were announced in December of that year. The 1950 prize was announced on 6 April 1951. Lenin prizes were usually announced around 1 May and named the previous year, or a span such as 1968-1969.",
    meth5: "Stalin laureates who later exchanged the medal for a Lenin medal are one row, under the Stalin prize.",
    meth6: "Occupation is the text before the first semicolon in the Wikidata list. Near-synonyms are not merged.",
    meth7: "Age is the first year of the prize minus the birth year, the age turned during that calendar year.",
    meth8: "The map places each person at the recorded birth coordinates. Shared points are drawn as a small ring. People with no coordinates are left off.",
    meth9: "Halldór Laxness, Martin Andersen Nexø, and names found only on incomplete lists are left out. Laxness's 1952 Soviet prize was the World Peace Council literary prize. Nexø sat on the committee and is not in a decree.",
    meth10: "Biography, occupation, and coordinates come from Wikidata. Arthur Moulton's birth place follows his English Wikipedia infobox. John Hanly Morgan has no Wikidata item; his dates and New Albany birthplace come from a Unitarian Universalist Ministers Association obituary. A few other birth places without Wikidata coordinates (Thakin Kodaw Hmaing, Ragnar Forbech, Udakendawala Siri Saranankara Thero, Peter Ayodele Curtis Joseph, Hikmat Abu Zayd, Gordon Schaffer) are filled from Wikipedia or local gazetteers. Schaffer's place is Clapham, South London, where Wikipedia says he grew up.",
    meth11: "Headlines in the title wall are generated, not copied from Pravda. The exception is five lines from 19-21 December 1949, the decree on the Stalin Prizes, and «События в Корее» from Pravda, 3 November 1950, no. 307 (11779), which stays in the wall. The date and issue at the side change with the red event then in view. Issue numbers are counted from 18 December 1949, no. 352 (11459), and are not an archival record.",
    hintEn: "English Wikipedia article",
    hintRu: "Russian Wikipedia article",
    occMissing: "Occupation not recorded",
    birthCoords: "Birth coordinates",
    series_stalin: "Stalin Prize",
    series_lenin: "Lenin Prize",
    series_lenin_peace: "Lenin Peace Prize",
    yearAria: "Laureates by prize year. Each square is one person. Pink squares are women, teal squares are men.",
    mapAria: "Waterman butterfly world map of laureates at their recorded birth coordinates. Each circle is one person. The Americas are on one wing and Africa, Eurasia, and Australia are on the other, with the southern continents kept large.",
    mapAriaRegion: "Regional Mercator map of laureates at their recorded birth coordinates. Each circle is one person.",
    mapRegionAmericas: "Americas",
    mapRegionEuropeAfrica: "Europe, Africa, and West Asia",
    mapRegionAsiaOceania: "Asia and Oceania"
  },
  ru: {
    title: "От Сталинской до Ленинской: советская международная премия «За укрепление мира между народами»",
    langLabel: "Язык",
    displayLabel: "Экран",
    display_phone: "Телефон",
    display_tablet: "Планшет",
    display_laptop: "Ноутбук",
    fnTitle: "Сноска",
    fnHide: "Скрыть сноску",
    fnClose: "Закрыть сноску",
    fnRef: "Сноска",
    fnListTitle: "Сноски",
    fnBack: "Вернуться к тексту",
    fnBackLink: "К тексту",
    tocLabel: "Содержание",
    tocOpening: "Сорок лет одной премии",
    tocPrize: "История создания премии",
    tocRename: "От Сталинской к Ленинской",
    tocRename1989: "Ленинская премия мира",
    pressPlateKicker: "Указ",
    pressPlateWho: "Президиума Верховного Совета СССР",
    fn1: "Например, вот два списка премий мира: <a href=\"https://en.wikipedia.org/wiki/List_of_peace_prizes\">List of peace prizes from English Wikipedia</a> и <a href=\"https://peacebellfoundation.org/peace-prizes/\">Peace Prizes, авторства Peace Bell Foundation (501(c)(3) non-profit)</a>.",
    fn2: "Например, смотрите разбор семидесяти двух премий мира от Taylor O’Connor: описания, обобщение и затем анализ. <a href=\"https://everydaypeacebuilding.com/peace-prize-award/\">Mapping 72 Peace Prize Award Programs Around the World, авторства Taylor O’Connor из Everyday Peacebuilding consultancy, 7 September 2023</a>.",
    fn3: "Указ также доступен онлайн в официальном бюллетене государственных актов советского Верховного Совета. <a href=\"https://docs.historyrussia.org/ru/nodes/521433-o-pereimenovanii-mezhdunarodnyh-stalinskih-premiy-v-mezhdunarodnye-leninskie-premii-locale-nil-za-ukreplenie-mira-mezhdu-narodami-locale-nil-ukaz-prezidiuma-verhovnogo-soveta-sssr-moskva-6-sentyabrya-1956-g#mode/inspect/page/1/zoom/4\">Скан: «Ведомости Верховного Совета СССР», 1956, № 18, ст. 393, стр. 258</a>.",
    h1: "От Сталинской до Ленинской: советская международная премия «За укрепление мира между народами»",
    opener: "Сорок лет, с 1950 по 1990 год, Советский Союз присуждал собственную премию мира. Она закончилась вместе с государством, которое её давало.",
    intro: "Премии мира присуждают самые разные учреждения<sup class=\"fn\"><button type=\"button\" class=\"fn-ref\" id=\"fnref-1\" data-fn=\"1\">1</button></sup>. Их дают правительства, и их дают религиозные организации, университеты и частные фонды. Одни известны по всему миру, другие известны главным образом тем, кто их получил. Одни длятся всего несколько лет и затем исчезают. Другие присуждают и десятилетия спустя после учреждения. У каждой премии своё определение мира и миростроительства, и каждый наградный комитет судит по своим критериям и своим пристрастиям<sup class=\"fn\"><button type=\"button\" class=\"fn-ref\" id=\"fnref-2\" data-fn=\"2\">2</button></sup>. Премия, о которой здесь речь, из числа долгих, которые потом прекратились.",
    hook: "<p>Международная Ленинская премия «За укрепление мира между народами» (до 1955 года: Международная Сталинская премия «За укрепление мира между народами») учреждена 20 декабря 1949 года Президиумом Верховного Совета СССР к семидесятилетию Иосифа Сталина. Её присуждали ежегодно в Москве, не более чем десяти человекам.</p><p>Премия считалась ответом Советского Союза на Нобелевскую премию мира, и её присуждал международный комитет. Обычно награждали сразу нескольких человек. Председателем комитета с 1950 по 1973 год был физик Дмитрий Скобельцын, затем до 1987 года онколог Николай Блохин и, наконец, после того как в 1989 году порядок премии изменили, инженер-сварщик Борис Патон.</p><p>В ходе десталинизации название изменили указом Президиума Верховного Совета от 6 сентября 1956 года на Международную Ленинскую премию «За укрепление мира между народами». Всех прежних лауреатов попросили вернуть медали для обмена. После этого лауреатов объявляли уже не в день рождения Сталина в декабре, а обычно 1 мая.</p><p>11 декабря 1989 года Верховный Совет заново установил порядок присуждения премии. Её должны были присуждать раз в два года, а лауреата или лауреатов объявлять в день рождения Ленина, 22 апреля. До распада Советского Союза в 1991 году по новым правилам премию присудили только ещё один раз.</p>",
    coldWarEssay: "<p>Учредительный документ объявил премию наградой людям, которые способствовали укреплению мира и боролись против поджигателей войны. Он заявлял о свободе от политических, религиозных, расовых и иных пристрастий. Однако по мере того как во всё новых театрах глобального противостояния, известного как холодная война, вспыхивали всё новые «пожары», капиталистический блок стал представлять советскую премию мира орудием идеологического влияния коммунистического блока. Однозначная связь с ведущим игроком противоположного лагеря — премию учредила советская законодательная власть и она же формировала международный комитет для рассмотрения номинаций — не смягчала враждебности. Примечательно, что очень похожее недоверие существовало и по другую сторону «железного занавеса» в отношении главной западной награды — Нобелевской премии мира.</p>",
    occEssay: "<p>Указ 1949 года назначает премию гражданам любой страны за борьбу против поджигателей войны. Облака показывают, из какой публичной жизни эти люди попали в список.</p><p>Из 167 человек 67 отнесены к политикам и 50 к деятелям культуры. Вместе они составляют большую часть списка. Ученых 15, общественных деятелей 18, религиозных деятелей 10, деятелей рабочего движения 7. Женщин 29. Тринадцать из них стоят в политическом облаке, восемь среди общественных деятелей. В культурном облаке женщин четыре. Среди религиозных деятелей и в рабочем движении женщин нет.</p>",
    yearEssay: "<p>Указ 1949 года обещал от пяти до десяти премий в год. Столбики держат это обещание только вначале.</p><p>На 1950-1955 годы приходятся шесть полных лет и 45 человек. Самый короткий из этих столбиков насчитывает шесть человек, а в 1953 году столбик доходит до десяти, до потолка, который указ сам себе поставил. С 1956 года премия не прерывается, но столбики становятся ниже, часто в четыре или пять человек, а с конца 1960-х одна группа часто покрывает два года. Промежуток 1980-1982 покрывает три года. Всего групп тридцать. Две группы, за 1988 и за 1990 год, состоят из одного человека. Отдельной группы за 1987 и за 1989 год в списке нет.</p><p>Женщины в премии с первого года: в 1950-м их трое из семи. Дальше целые годы проходят без них. Плотнее всего они стоят в группе 1977-1978 годов: четыре из шести. Среди лауреатов сталинских лет женщин 10 из 45, среди более поздних 19 из 122.</p>",
    renameEssay: "<p>На графике 1956 год не пустой. В этой группе восемь человек, и в списке они уже идут как лауреаты Ленинской премии. Между смертью Сталина и переименованием — около трёх лет «Правды», порядка тысячи номеров. Карусель начинается с сообщения о смерти и дальше идёт через обычные полосы уже начавшейся партийной борьбы: кризис лидерства, конфликт взглядов и планов — стратегий в политике и экономике. Рисунок знаком — не повтор, а рифма: как Второй триумвират после смерти Цезаря (Октавиан, Антоний, Лепид) или термидорианский переворот во Франции после казни Робеспьера. История не повторяется, но часто рифмуется. Для этой истории почти вся карусель — шум. Важны два кадра: 2 июля 1956 года газета печатает постановление ЦК «О преодолении культа личности и его последствий»; в сентябре премия меняет имя и портрет на медали.</p><p>Указ о переименовании датирован 6 сентября 1956 года. Он не учреждает новую премию и не закрывает старую. Первая фраза объясняет переименование пожеланиями комитетов. Сумма не меняется: по-прежнему 100 тысяч рублей. Пункт 3 распространяет на лауреатов 1950-1955 годов только диплом и медаль, подпункты «а» и «б», и не распространяет на них денежную часть. Прежних лауреатов, как уже сказано выше, просили вернуть медаль для обмена: на старой портрет Сталина, на новой портрет Ленина. Указ по-прежнему говорит «ежегодно» и «до десяти». Ни один столбик после 1953 года до десяти не доходит.</p>",
    destalinLabel: "Десталинизация в «Правде», 1953–1956",
    destalinNext: "Дальше",
    destalinPrev: "Назад",
    destalinWhy: "Но почему так получилось?",
    destalinDeathScanAlt: "«Правда», 6 марта 1953 г., стр. 1. Сообщение о смерти И. В. Сталина.",
    destalinDeathSide: "Увеличить сообщение о смерти",
    destalinDeathSource: "Первая полоса «Правды» с сообщением о смерти И. В. Сталина, включая медицинское заключение. <a href=\"https://archive.org/details/195365_1389\">Скан номера: «Правда», 6 марта 1953 г., № 65 (12633), стр. 1</a>.",
    destalin1953191ScanAlt: "«Правда», 10 июля 1953 г., стр. 1. Сообщение о снятии Берии.",
    destalinBeriaSide: "Увеличить сообщение о Берии",
    destalin1953191Source: "Первая полоса «Правды» с сообщением ЦК и указом Президиума о снятии Л. П. Берии. <a href=\"https://archive.org/details/1953191_3088\">Скан номера: «Правда», 10 июля 1953 г., № 191 (12759), стр. 1</a>.",
    destalin1955040ScanAlt: "«Правда», 9 февраля 1955 г., стр. 1. Освобождение Маленкова от обязанностей Председателя Совета Министров.",
    destalinMalenkovSide: "Увеличить сообщение об отставке Маленкова",
    destalin1955040Source: "Первая полоса «Правды» с заседанием Верховного Совета, принявшим заявление Г. М. Маленкова об освобождении от обязанностей Председателя Совета Министров. <a href=\"https://archive.org/details/195540_9158\">Скан номера: «Правда», 9 февраля 1955 г., № 40 (13338), стр. 1</a>.",
    destalinCultScanAlt: "«Правда», 2 июля 1956 г., стр. 1. Постановление ЦК о преодолении культа личности.",
    destalinCultSide: "Увеличить заголовок постановления",
    destalinCultSource: "Первая полоса «Правды» с постановлением ЦК о преодолении культа личности. <a href=\"https://archive.org/details/1956184_2372\">Скан номера: «Правда», 2 июля 1956 г., № 184 (13847), стр. 1</a>.",
    ageEssay: "<p>Указ говорит о выдающихся заслугах. На графике возраста эти заслуги принадлежат долгой публичной жизни. Средний возраст около шестидесяти лет, и пунктир стоит примерно там. Моложе сорока только восемь человек. Семидесяти пяти и старше восемнадцать человек. Основная масса списка между этими краями: 76 человек от 40 до 59 лет и 65 человек от 60 до 74.</p><p>Женщины в среднем немного моложе мужчин: около 57 лет против около 61. Разрыв небольшой. И в этом премия читается как список уже состоявшихся общественных биографий. Самых молодых и самых старых называет строка под этим абзацем. Важнее не край, а то, как пуст левый конец шкалы.</p>",
    mapEssay: "<p>Тот же указ говорит: граждане любой страны, независимо от политических, религиозных и расовых различий. Карта проверяет географию в этой фразе и не проверяет остальное. Рождение не есть гражданство и не есть страна, от которой человека выдвинули. Будь премия домашней почестью Советского Союза, рождения сгустились бы там.</p><p>Они сгустились в других местах. Больше всего записанных рождений во Франции, 13, затем в Германии, 12, в США, 9, и в Индии, 7. Германия в файле одна подпись, без деления на восточную и западную. Россия и Украина вместе дают восемь рождений. Других советских республик среди стран рождения нет. Названных стран рождения больше пятидесяти, так что список широкий. У каждого записанного рождения есть координаты на карте. Мир этой премии - по большей части мир людей, родившихся вне государства, которое её подписало.</p>",
    decree: "<header class=\"ukaz-head\"><p class=\"ukaz-kicker\">Указ</p><p>Президиума Верховного Совета СССР</p><p>Об учреждении международных</p><p>Сталинских премий</p><p>«За укрепление мира между народами»</p></header><div class=\"ukaz-body\"><p>1. Учредить международные Сталинские премии «За укрепление мира между народами».</p><p>Премии присуждаются гражданам любой страны мира, независимо от их политических, религиозных и расовых различий, за выдающиеся заслуги в деле борьбы против поджигателей войны и за укрепление мира.</p><p>2. Установить, что лица, награждаемые международной Сталинской премией, получают:</p><ul class=\"ukaz-items\"><li>а) диплом лауреата международной Сталинской премии;</li><li>б) золотую нагрудную медаль с изображением И. В. Сталина;</li><li>в) денежную премию в размере 100 тысяч рублей.</li></ul><p>3. Установить, что международные Сталинские премии «За укрепление мира между народами» присуждаются ежегодно в количестве от 5 до 10 премий специальным Комитетом по международным Сталинским премиям, образуемым Президиумом Верховного Совета СССР из представителей демократических сил различных стран мира.</p><p>4. Присуждение премий производить в день рождения Иосифа Виссарионовича Сталина - 21 декабря каждого года.</p><p>Первые премии присудить в 1950 году.</p></div><footer class=\"ukaz-signoff\"><p class=\"ukaz-sign\">Председатель Президиума Верховного Совета СССР <span class=\"ukaz-who\">Н. ШВЕРНИК.</span></p><p class=\"ukaz-sign\">Секретарь Президиума Верховного Совета СССР <span class=\"ukaz-who\">А. ГОРКИН.</span></p><p class=\"ukaz-place\">Москва, Кремль. 20 декабря 1949 г.</p></footer>",
    seeOriginal: "Увидеть оригинал",
    seeText: "Увидеть расшифровку",
    decreeScanAlt: "«Правда», 21 декабря 1949 г., стр. 2. Указ отмечен в левой колонке сверху.",
    decreeSide: "Увеличить указ",
    decreePage: "Вся полоса",
    decreeSource: "На снимке полоса официальной газеты советской компартии, посвящённая 70-летию И. В. Сталина, с напечатанным указом об учреждении премии. <a href=\"https://oldgazette.org/pravda/21121949/text2.html\">Расшифровка указа</a>. <a href=\"https://archive.org/details/1949355_7165\">Скан номера: «Правда», 21 декабря 1949 г., № 355 (11462), стр. 2</a>.",
    rename: "<header class=\"ukaz-head\"><p class=\"ukaz-kicker\">Указ</p><p>Президиума Верховного Совета СССР</p><p>О переименовании международных</p><p>Сталинских премий</p><p>в международные Ленинские премии</p><p>«За укрепление мира между народами»</p></header><div class=\"ukaz-body\"><p>1. Учитывая пожелания Комитетов по международным Сталинским премиям<sup>1</sup>, переименовать международные Сталинские премии в международные Ленинские премии «За укрепление мира между народами».</p><p>2. Установить, что лица, награждаемые международной Ленинской премией, получают:</p><ul class=\"ukaz-items\"><li>а) диплом лауреата международной Ленинской премии;</li><li>б) золотую нагрудную медаль с изображением В. И. Ленина;</li><li>в) денежную премию в размере 100 тысяч рублей.</li></ul><p>3. П. п. а) и б) § 2 настоящего Указа распространить также и на лиц, получивших Международную премию «За укрепление мира между народами» в период 1950-1955 гг.</p><p>4. Установить, что международные Ленинские премии «За укрепление мира между народами» присуждаются ежегодно в количестве до 10 премий Комитетом по международным Ленинским премиям.</p><p>5. Порядок выдвижения кандидатов на международные Ленинские премии «За укрепление мира между народами» и условия присуждения этих премий разрабатывает и публикует Комитет по международным Ленинским премиям.</p></div><footer class=\"ukaz-signoff\"><p class=\"ukaz-place\">Москва, Кремль. 6 сентября 1956 г.</p></footer><p class=\"ukaz-note\"><sup>1</sup> Были учреждены Указом Президиума Верховного Совета СССР от 20 декабря 1949 г. («Ведомости Верховного Совета СССР», 1949, № 66).</p>",
    renameScanAlt: "«Правда», 8 сентября 1956 г., стр. 1. Указ о переименовании отмечен слева внизу.",
    renameSource: "На снимке полоса «Правды» с напечатанным указом о переименовании премии.<sup class=\"fn\"><button type=\"button\" class=\"fn-ref\" id=\"fnref-3\" data-fn=\"3\">3</button></sup> <a href=\"https://archive.org/details/1956252_3945\">Скан номера: «Правда», 8 сентября 1956 г., № 252 (13915), стр. 1</a>.",
    rename1989Essay: "<p>К концу 1989 года страна уже была глубоко в «перестройке»: дефицит, политическая нестабильность, нарастающий внутренний кризис. На этом фоне второе переименование премии мира - малый жест. Постановление ниже датировано 11 декабря 1989 года. Оно не учреждает новую премию и не закрывает старую. Оно сокращает имя до Международной Ленинской премии мира и заменяет статут и положение о комитете. Сама премия уже отходила на дальний план истории.</p><p>Первая фраза объясняет перемену современным этапом движения за выживание человечества, строительство безъядерного и ненасильственного мира и утверждение нового политического мышления. Пункт 1 - переименование. Пункты 2 и 3 утверждают новый статут и новое положение о комитете. Пункт 4 признаёт утратившими силу прежние акты, в том числе указ о переименовании от 6 сентября 1956 года в позднейших редакциях. Под новым именем премию присудили только один раз: Манделе, за 1990 год. На следующий год Союз распался.</p>",
    rename1989: "<header class=\"ukaz-head\"><p class=\"ukaz-kicker\">Постановление</p><p>Президиума Верховного Совета СССР</p><p>от 11 декабря 1989 г. № 905-1</p><p>О Международной Ленинской премии мира</p></header><div class=\"ukaz-body\"><p>Рассмотрев предложение Комитета Верховного Совета СССР по международным делам о преобразовании международной Ленинской премии «За укрепление мира между народами» и совершенствовании практики ее присуждения с учетом современного этапа движения широких общественных сил за выживание человечества, строительство безъядерного и ненасильственного мира, утверждение в международных делах нового политического мышления, Президиум Верховного Совета СССР постановляет:</p><p>1. Считать целесообразным впредь именовать международную Ленинскую премию «За укрепление мира между народами» международной Ленинской премией мира.</p><p>2. Утвердить Статут международной Ленинской премии мира.</p><p>3. Утвердить Положение о Комитете по международным Ленинским премиям мира.</p><p>4. Считать утратившими силу:</p><ul class=\"ukaz-items\"><li>Указ Президиума Верховного Совета СССР от 6 сентября 1956 года «О международных Ленинских премиях «За укрепление мира между народами»» в редакции Указов от 15 февраля 1980 года и 26 ноября 1986 года;</li><li>Указ Президиума Верховного Совета СССР от 22 апреля 1957 года «Об утверждении диплома и золотой нагрудной медали лауреата международной Ленинской премии «За укрепление мира между народами»» в редакции Указа от 15 февраля 1980 года;</li><li>Постановление Президиума Верховного Совета СССР от 22 апреля 1966 года «О Комитете по международным Ленинским премиям «За укрепление мира между народами»» в редакции Указов от 15 февраля 1980 года и 26 ноября 1986 года.</li></ul></div><footer class=\"ukaz-signoff\"><p class=\"ukaz-place\">Москва, Кремль. 11 декабря 1989 г.</p></footer>",
    rename1989ScanAlt: "«Правда», 12 декабря 1989 г., стр. 1. Заметка о заседании Президиума отмечена в правой колонке сверху.",
    rename1989Source: "На снимке полоса «Правды» с сообщением о заседании Президиума на следующий день после постановления. Полный текст - постановление в публикации. <a href=\"http://pravo.levonevsky.org/baza/soviet/sssr1118.htm\">Расшифровка постановления</a>. <a href=\"https://archive.org/details/1989346_4216\">Скан номера: «Правда», 12 декабря 1989 г., № 346 (26064), стр. 1</a>. <a href=\"https://vedomosti.sssr.su/1989/29/\">«Ведомости Съезда народных депутатов СССР и Верховного Совета СССР», 1989, № 27, ст. 534</a>.",
    n1: "Рис. 1.",
    hAll: "Кто получил премию",
    capAll: "Все, кто получил премию",
    n2: "Рис. 2.",
    capPress: "Мир, в котором учреждали премию",
    hOcc: "Кем они были",
    capOcc: "Чем они занимались?",
    capOccWorld: "Из какого «мира» они были?",
    splitNextAria: "Следующая группировка",
    splitNextToWorld: "Показать миры холодной войны",
    splitNextToWork: "Показать занятия",
    yearColorNextAria: "Следующая окраска",
    yearColorNextToWorld: "Окрасить по миру холодной войны",
    yearColorNextToGender: "Окрасить по полу",
    world_first: "«Первый мир»",
    world_second: "«Второй мир»",
    world_third: "«Третий мир»",
    srcOcc: "Каждое облако - один класс из WINNER_BIO_occupation_class: политик, общественный деятель, ученый, деятель культуры, религиозный деятель или деятель рабочего движения. Писатели, художники, композиторы и кинематографисты вместе в «деятеле культуры». Профсоюзные лидеры - в «деятелях рабочего движения». Женщины ближе к центру своего облака. Класс прочитан по занятиям Викиданных и заметке о работе, а не по формулировке указа в «Правде». Источник: laureates.csv.",
    srcOccWorld: "Каждое облако - чтение WINNER_COUNTRY по трём мирам холодной войны: «Первый мир» = сфера США / Запада, «Второй мир» = советская / социалистическая сфера, «Третий мир» = остальные. При двух странах берётся первая. Женщины ближе к центру своего облака. Источник: laureates.csv.",
    n3: "Рис. 3.",
    hYear: "Когда присуждали премию",
    capYear: "В каком году каждый её получил?",
    srcYear: "Каждый столбик - одна группа премии, на середине года или промежутка в указе. Женщины внизу столбика. Сталинская премия идет по 1955 год. С 1956 года это Ленинская премия, а 1990 год - единственная Ленинская премия мира. Источник: laureates.csv.",
    srcYearWorld: "Каждый столбик - одна группа премии, на середине года или промежутка в указе. Знаки окрашены по трём мирам холодной войны из WINNER_COUNTRY: «Первый мир» = сфера США / Запада, «Второй мир» = советская / социалистическая сфера, «Третий мир» = остальные. «Первый мир» внизу столбика. Источник: laureates.csv.",
    srcYearSpan: "При прокрутке группы за несколько лет растягиваются на годы из указа; штриховка отмечает эти промежутки. Однолетние премии остаются квадратом. Женщины по-прежнему внизу столбика. Источник: laureates.csv.",
    srcYearSpanWorld: "При прокрутке группы за несколько лет растягиваются на годы из указа; штриховка отмечает эти промежутки. Окраска по миру холодной войны сохраняется. «Первый мир» внизу столбика. Источник: laureates.csv.",
    yearAriaWorld: "Лауреаты по году премии. Каждый квадрат - один человек, цвет - мир холодной войны.",
    n4: "Рис. 4.",
    n4a: "Рис. 4а.",
    capAnnounce: "Когда объявляли каждую премию?",
    announcePrize: "Год в указе",
    announceDate: "Объявление",
    announcePravda: "Выпуск «Правды» (если другой день)",
    announceAria: "Хронология объявления премий. Каждый открытый квадрат — год в указе; залитый кружок — день объявления; чёрточка отмечает выпуск «Правды», если он в другой день.",
    srcAnnounce: "Каждый открытый квадрат стоит на годе из указа (META_prize_year). Залитый кружок — день объявления или решения (META_announced_date). Короткая чёрточка рядом с кружком отмечает дату выпуска «Правды» (META_pravda_date), если день другой. Линия — ожидание между названным годом и объявлением. Сталинские премии за 1951-1955 годы объявляли в декабре того же года; премию за 1950 год — в апреле 1951-го; Ленинские обычно около 1 мая за предыдущий год или промежуток. Одно имя за 1983-1984 (Флоракис) датировано раньше остальных в этой группе; у 1988 года дня объявления в таблице нет. Источник: laureates.csv.",
    hAge: "Сколько им было лет",
    capAge: "Сколько им было лет, когда их наградили?",
    n5: "Рис. 5.",
    n6: "Рис. 6.",
    hMap: "Откуда они родом",
    capMap: "Где они родились?",
    female: "Женщины",
    male: "Мужчины",
    methTitle: "Методология",
    meth1: "Источники списка: списки по годам на страницах премии в <a href=\"https://de.wikipedia.org/wiki/Internationaler_Lenin-Friedenspreis\">немецкой</a>, <a href=\"https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B6%D0%B4%D1%83%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F_%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%8F_%C2%AB%D0%97%D0%B0_%D1%83%D0%BA%D1%80%D0%B5%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BC%D0%B8%D1%80%D0%B0_%D0%BC%D0%B5%D0%B6%D0%B4%D1%83_%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%B0%D0%BC%D0%B8%C2%BB\">русской</a> и <a href=\"https://en.wikipedia.org/wiki/Lenin_Peace_Prize\">английской</a> Википедии; Ежегодник Большой советской энциклопедии; база архивов сканов «Правды»; база архива Комитета по Международным Ленинским премиям мира, 1949–1991 (<a href=\"https://guides.rusarchives.ru/terms/6/346/mezhdunarodnye-otnosheniya\">Ф. Р-9522, 1 оп., 194 ед. хр., крайние даты: 1949–1991, Государственный архив Российской Федерации</a>).",
    meth2: "Список идет за немецкой хронологией Википедии, где к каждому году есть сноска на указ в «Правде». Шестеро, названные только в английской или русской статье, оставлены. Пикассо и Нимейер стоят в годах, которые дают эти статьи. Там, где сноска указывает на указ, номер читался по сканам «Правды». Фонд Р-9522 был бы самым полным «FOIA-подобным» корпусом; к нему для проекта доступа не было.",
    meth3: "Год премии - это год в заголовке указа, а не день вручения медали.",
    meth4: "Сталинские премии за 1951-1955 годы объявляли в декабре того же года. Премию за 1950 год объявили 6 апреля 1951 года. Ленинские премии обычно объявляли около 1 мая и называли предыдущим годом или промежутком, например 1968-1969.",
    meth5: "Сталинские лауреаты, которых позже просили обменять медаль на ленинскую, записаны один раз, как лауреаты Сталинской премии.",
    meth6: "Род занятий - текст до первой точки с запятой в списке Викиданных. Близкие названия не объединяются.",
    meth7: "Возраст - первый год премии минус год рождения, возраст, который исполняется в этом календарном году.",
    meth8: "На карте каждый человек стоит в записанных координатах рождения. Общие точки рисуются маленьким кольцом. Люди без координат не показаны.",
    meth9: "Халлдоур Лакснесс, Мартин Андерсен-Нексё и имена только из неполных списков не включены. Советская премия Лакснесса за 1952 год была литературной премией Всемирного совета мира. Нексё входил в комитет, и в указах его нет.",
    meth10: "Биография, род занятий и координаты взяты из Викиданных. Место рождения Артура Моултона взято из карточки английской Википедии. У Джона Хэнли Моргана нет объекта Викиданных; даты и место рождения в Нью-Олбани взяты из некролога Ассоциации унитарианских священников. Несколько других мест рождения без координат в Викиданных (Такин Кодо Хмайн, Рагнар Форбекк, Удакендавала Сарананкара Тхеро, Питер Айоделе Куртис Джозеф, Хикмат Абу-Зейд, Гордон Шаффер) заполнены по Википедии или местным справочникам. У Шаффера это Клапхем в Южном Лондоне, где, по Википедии, он вырос.",
    meth11: "Заголовки в стене составлены искусственно, а не взяты из «Правды». Исключение - пять строк 19-21 декабря 1949 года, указ об учреждении Сталинских премий и «События в Корее» из «Правды» от 3 ноября 1950 года, № 307 (11779): этот заголовок остается в стене. Дата и номер «Правды» сбоку меняются вместе с красным событием, которое сейчас на экране. Номера выпусков отсчитаны от 18 декабря 1949 года, № 352 (11459), и не являются архивной справкой.",
    hintEn: "Статья английской Википедии",
    hintRu: "Статья русской Википедии",
    occMissing: "Занятие не записано",
    birthCoords: "Координаты рождения",
    series_stalin: "Сталинская премия",
    series_lenin: "Ленинская премия",
    series_lenin_peace: "Ленинская премия мира",
    yearAria: "Лауреаты по году премии. Каждый квадрат - один человек. Розовые квадраты - женщины, бирюзовые - мужчины.",
    mapAria: "Карта лауреатов в координатах рождения, проекция «бабочка Уотермана». Каждый кружок - один человек. Америки на одном крыле, Африка, Евразия и Австралия на другом, южные материки остаются крупными.",
    mapAriaRegion: "Региональная карта лауреатов в координатах рождения, проекция Меркатора. Каждый кружок - один человек.",
    mapRegionAmericas: "Америки",
    mapRegionEuropeAfrica: "Европа, Африка и Западная Азия",
    mapRegionAsiaOceania: "Азия и Океания"
  }
};

function t(key) {
  var pack = I18N[lang] || I18N.en;
  if (pack[key] != null) return pack[key];
  return I18N.en[key] != null ? I18N.en[key] : "";
}

function ruPlural(n, one, few, many) {
  var n10 = n % 10;
  var n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
  return many;
}

function enPlural(n, one, many) {
  return n === 1 ? one : many;
}

function countNoun(n, enOne, enMany, ruOne, ruFew, ruMany) {
  if (lang === "ru") return n + " " + ruPlural(n, ruOne, ruFew, ruMany);
  return n + " " + enPlural(n, enOne, enMany);
}

function personName(person) {
  if (lang === "ru" && person.nameRu) return person.nameRu;
  return person.name;
}

function personAlt(person) {
  var primary = personName(person);
  var alt = lang === "ru" ? person.name : person.nameRu;
  return alt && alt !== primary ? alt : "";
}

function sortName(person) {
  return personName(person);
}

function occLabel(value) {
  if (!value) return t("occMissing");
  var english = {
    politician: "Politician",
    public_figure: "Public figure",
    scientist: "Scientist",
    culture: "Cultural figure",
    clergy: "Religious figure",
    labor_movement: "Labor-movement figure"
  };
  if (lang === "ru" && OCC[value]) return OCC[value].charAt(0).toUpperCase() + OCC[value].slice(1);
  if (english[value]) return english[value];
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function worldLabel(value) {
  return t("world_" + value) || value;
}

function countryLabel(value) {
  if (!value) return "";
  return value.split(";").map(function (part) {
    var name = part.trim();
    if (lang === "ru" && COUNTRY[name]) return COUNTRY[name];
    return name;
  }).join(", ");
}

function seriesLabel(code) {
  return t("series_" + code) || code;
}

function workText(person) {
  var raw = lang === "ru" && person.workRu ? person.workRu : (person.work || "");
  return raw.replace(/\u2013|\u2014/g, "-");
}

function birthPlaceText(person) {
  if (lang === "ru" && person.birthPlaceRu) return person.birthPlaceRu;
  return person.birthPlace || "";
}

function wikiFor(person) {
  if (lang === "ru") return person.wikiRu || person.wiki || "";
  return person.wiki || person.wikiRu || "";
}

function wikiHint(person) {
  var url = wikiFor(person);
  if (!url) return "";
  if (person.wikiRu && url === person.wikiRu) return t("hintRu");
  return t("hintEn");
}

function agePhrase(age) {
  if (lang === "ru") return age + " " + ruPlural(age, "год", "года", "лет") + " в год премии";
  return "age " + age + " in the prize year";
}

function tipPrizeLine(person) {
  var year = person.year;
  var span = String(year).indexOf("-") >= 0;
  if (lang === "ru") {
    return seriesLabel(person.series) + " за " + year + (span ? " годы" : " год");
  }
  return seriesLabel(person.series) + " for " + year;
}

function tipPlaceAgeLine(person) {
  return countryLabel(person.country) + ". " + agePhrase(person.age);
}

function tipMeta(person) {
  return tipPrizeLine(person) + "\n" + tipPlaceAgeLine(person);
}

function bornLine(place) {
  if (lang === "ru") return "Место рождения: " + place;
  return "Born in " + place;
}

function coordLine(place, lat, lon) {
  return (place || t("birthCoords")) + ", " + lat + ", " + lon;
}

function joinNames(people) {
  var names = people.map(personName);
  if (names.length <= 1) return names[0] || "";
  if (names.length === 2) return names[0] + (lang === "ru" ? " и " : " and ") + names[1];
  return names.slice(0, -1).join(", ") + (lang === "ru" ? " и " : ", and ") + names[names.length - 1];
}

function moreNames(n) {
  if (lang === "ru") return " и еще " + n;
  return ", and " + n + " more";
}

function groupBorn(n) {
  if (lang === "ru") return countNoun(n, "", "", "лауреат", "лауреата", "лауреатов") + " родились здесь";
  return countNoun(n, "laureate", "laureates", "", "", "") + " born here";
}

function heroAria(n) {
  if (lang === "ru") return countNoun(n, "", "", "лауреат", "лауреата", "лауреатов") + " рядами, затем силуэтом голубя с оливковой ветвью";
  return countNoun(n, "laureate", "laureates", "", "", "") + " in rows, then as a dove with an olive branch";
}

function heroCountLabel(n) {
  if (lang === "ru") {
    return "Все " + countNoun(n, "", "", "человек", "человека", "человек") + ", награждённых премией";
  }
  return "All " + countNoun(n, "person", "people", "", "", "") + " awarded the prize";
}

function markAria(person) {
  return personName(person) + ", " + person.year + ", " + occLabel(person.occupation);
}

function ageMarkAria(person) {
  if (lang === "ru") return personName(person) + ", " + person.year + ", " + person.age + " " + ruPlural(person.age, "год", "года", "лет");
  return personName(person) + ", " + person.year + ", age " + person.age;
}

function mapMarkAria(person) {
  return personName(person) + ", " + person.birthLat + ", " + person.birthLon;
}

function cloudAria(n, label, women) {
  if (lang === "ru") {
    return countNoun(n, "", "", "лауреат", "лауреата", "лауреатов") + ", " + label + ", " + countNoun(women, "", "", "женщина", "женщины", "женщин");
  }
  return countNoun(n, "laureate", "laureates", "", "", "") + ", " + label + ", " + countNoun(women, "woman", "women", "", "", "");
}

function splitLead(d) {
  if (d.mode === "world") {
    if (lang === "ru") {
      return "Те же " + countNoun(d.n, "", "", "человек", "человека", "человек") + " разложены по трём мирам холодной войны.";
    }
    return "The same " + d.n + " people, repacked into the three Cold War worlds.";
  }
  if (lang === "ru") {
    return "Те же " + countNoun(d.n, "", "", "человек", "человека", "человек") + " разложены по " + d.clouds + " " + ruPlural(d.clouds, "облаку", "облакам", "облакам") + ".";
  }
  return "The same " + d.n + " people, repacked into " + d.clouds + " clouds.";
}

function splitFinding(d) {
  if (d.mode === "world") {
    var parts = (d.worlds || []).map(function (row) {
      return worldLabel(row.key) + " " + row.count;
    });
    if (lang === "ru") {
      return "По стране премии: " + parts.join("; ") + ". Крупнее всех " + worldLabel(d.key) + " - " + d.count + " из " + d.n + ", в том числе " + d.womenHere + " из " + d.women + " женщин.";
    }
    return "By prize country: " + parts.join("; ") + ". Largest is " + worldLabel(d.key) + " - " + d.count + " of " + d.n + ", including " + d.womenHere + " of the " + d.women + " women.";
  }
  if (lang === "ru") {
    return occLabel(d.occupation) + " - класс у " + d.count + " из " + d.n + " лауреатов, в том числе у " + d.womenHere + " из " + d.women + " женщин. Вне этой группы " + countNoun(d.otherWomen, "", "", "женщина", "женщины", "женщин") + " и " + countNoun(d.otherOcc, "", "", "класс", "класса", "классов") + ".";
  }
  return occLabel(d.occupation) + " is the class for " + d.count + " of the " + d.n + " laureates, including " + d.womenHere + " of the " + d.women + " women. The other " + d.otherWomen + " women are spread across " + d.otherOcc + " classes.";
}

function tallyMen(n) {
  if (lang === "ru") return countNoun(n, "", "", "мужчина", "мужчины", "мужчин");
  return countNoun(n, "man", "men", "", "", "");
}

function tallyWomen(n) {
  if (lang === "ru") return countNoun(n, "", "", "женщина", "женщины", "женщин");
  return countNoun(n, "woman", "women", "", "", "");
}

function tallyBefore() {
  return lang === "ru" ? "" : "For ";
}

function tallyMid() {
  return lang === "ru" ? ", " : ", there are ";
}

function yearLead(d) {
  var scrollHint = d.canScroll
    ? (lang === "ru"
      ? " Прокрутите дальше - и они растянутся на свой промежуток."
      : " Keep scrolling to stretch them across that span.")
    : "";
  if (d.color === "world") {
    if (d.mode === "span") {
      if (lang === "ru") {
        return "Группы вроде 1968-1969 теперь закрывают годы из указа; штриховка отмечает промежуток. Цвет - мир холодной войны. Больше всего из одного мира в группе - " + d.peakCount + " из " + worldLabel(d.peakWorld) + ", в " + d.year + ".";
      }
      return "Cohorts such as 1968-1969 now cover the years named in the decree; the hatch marks the span. Color is Cold War world. The most from one world in a cohort is " + d.peakCount + " from " + worldLabel(d.peakWorld) + ", in " + d.year + ".";
    }
    if (lang === "ru") {
      return "Каждый квадрат - один лауреат, цвет - мир холодной войны." + scrollHint + " " + worldLabel("first") + " внизу столбика. Больше всего из одного мира в группе - " + d.peakCount + " из " + worldLabel(d.peakWorld) + ", в " + d.year + ".";
    }
    return "Each square is one laureate, colored by Cold War world." + scrollHint + " " + worldLabel("first") + " at the foot. The most from one world in a cohort is " + d.peakCount + " from " + worldLabel(d.peakWorld) + ", in " + d.year + ".";
  }
  if (d.mode === "span") {
    if (lang === "ru") {
      return "Каждый квадрат - один лауреат. Женщины внизу. Иногда премия вручалась за каждый год, например «за 1954 год», а иногда за группу в несколько лет. Больше всего женщин - " + d.women + ", в «группе» «за " + d.year + "гг.». Штриховка выделяет группы.";
    }
    return "Cohorts such as 1968-1969 now cover the years named in the decree («за 1968—69 гг.»); the hatch marks the span. One person is still one mark. The most women in one cohort is " + d.women + ", in " + d.year + ".";
  }
  if (lang === "ru") {
    return "Каждый квадрат - один лауреат. Женщины внизу. Иногда премия вручалась за каждый год, например «за 1954 год», а иногда за группу в несколько лет. Больше всего женщин - " + d.women + ", в «группе» «за " + d.year + "гг.».";
  }
  return "Each square is one laureate. A cohort sits at the middle of its decree year or span." + scrollHint + " Women at the foot. The most in one cohort is " + d.women + ", in " + d.year + ".";
}

function ageLead(d) {
  if (lang === "ru") {
    return "Моложе всех " + d.youngNames + ", " + d.youngAge + " " + ruPlural(d.youngAge, "год", "года", "лет") + ". Старше всех " + d.oldNames + ", " + d.oldAge + " " + ruPlural(d.oldAge, "год", "года", "лет") + ". Средний возраст " + d.meanText.replace(".", ",") + ".";
  }
  var young = d.youngN === 1 ? "The youngest is " + d.youngNames : "The youngest are " + d.youngNames;
  var old = d.oldN === 1 ? "The oldest is " + d.oldNames : "The oldest are " + d.oldNames;
  return young + ", at " + d.youngAge + ". " + old + ", at " + d.oldAge + ". The mean is " + d.meanText + ".";
}

function ageAria(meanText) {
  if (lang === "ru") return "Рой возрастов в год премии. Каждая точка - один лауреат. Пунктир - средний возраст, " + meanText.replace(".", ",") + " года.";
  return "Beeswarm of age at the prize. Each dot is one laureate. The dashed line is the mean age, " + meanText + " years.";
}

function ageMean(meanText) {
  if (lang === "ru") return "Средний возраст " + meanText.replace(".", ",") + " года";
  return "Average " + meanText + " years";
}

function mapLead(d) {
  if (lang === "ru") {
    var ruCore = countNoun(d.plotted, "", "", "лауреат", "лауреата", "лауреатов") + " в координатах рождения из файла. ";
    var ruMap = d.narrow
      ? "На узком экране вместо бабочки Уотермана - три региональных панели в проекции Меркатора. "
      : "Карта - бабочка Уотермана: глобус разрезан по океанам, Америки на одном крыле, Африка, Евразия и Австралия на другом, южные материки остаются крупными. ";
    return ruCore + ruMap + d.sharedPeople + " из них " + ruPlural(d.sharedPeople, "делит", "делят", "делят") + " " + d.sharedPlaces + " " + ruPlural(d.sharedPlaces, "точку", "точки", "точек") + ", эти метки стоят маленьким кольцом вокруг точки.";
  }
  var enCore = d.plotted + " laureates, each at the birth latitude and longitude in the file. ";
  var enMap = d.narrow
    ? "On a narrow screen the Waterman butterfly gives way to three regional Mercator panels. "
    : "The map is a Waterman butterfly: the globe is opened along the oceans so the Americas sit on one wing and Africa, Eurasia, and Australia on the other, with the southern continents kept large. ";
  return enCore + enMap + d.sharedPeople + " of them share " + d.sharedPlaces + " recorded points; those dots sit in a small ring around that point.";
}

function mapSource(d) {
  var base = lang === "ru"
    ? "WINNER_BIRTH_lat и WINNER_BIRTH_lon. Проекция: " + (d.narrow ? "Меркатор, три региональных панели" : "бабочка Уотермана") + ". "
    : "WINNER_BIRTH_lat and WINNER_BIRTH_lon. Projection: " + (d.narrow ? "Mercator, three regional panels" : "Waterman butterfly") + ". ";
  var mid;
  if (!d.missingCount) {
    mid = lang === "ru" ? "Координаты есть у каждого." : "Every laureate has coordinates.";
  } else if (lang === "ru") {
    mid = "Без координат и вне карты " + countNoun(d.missingCount, "", "", "лауреат", "лауреата", "лауреатов") + ": " + d.missingNames + ".";
  } else {
    mid = d.missingCount + " " + enPlural(d.missingCount, "laureate has", "laureates have") + " no coordinates and " + enPlural(d.missingCount, "is", "are") + " left off the map: " + d.missingNames + ".";
  }
  return base + mid + (lang === "ru" ? " Источник: laureates.csv." : " Source: laureates.csv.");
}

function applyChrome() {
  document.documentElement.lang = lang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var value = t(el.getAttribute("data-i18n"));
    if (el.hasAttribute("data-i18n-html")) el.innerHTML = value;
    else el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
    el.alt = t(el.getAttribute("data-i18n-alt"));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });
    syncOriginalButton();
    if (typeof syncPageZoom === "function") syncPageZoom();
    if (typeof syncDestalin === "function") syncDestalin();
  document.querySelectorAll("[data-set-lang]").forEach(function (button) {
    if (button.getAttribute("data-set-lang") === lang) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  var nav = document.getElementById("lang");
  if (nav) nav.setAttribute("aria-label", t("langLabel"));
  var shown = document.documentElement.getAttribute("data-display");
  document.querySelectorAll("[data-set-display]").forEach(function (button) {
    var id = button.getAttribute("data-set-display");
    button.setAttribute("aria-label", t("display_" + id));
    if (id === shown) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  var displayNav = document.getElementById("display");
  if (displayNav) displayNav.setAttribute("aria-label", t("displayLabel"));
  document.querySelectorAll('a[href^="http"]').forEach(function (anchor) {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  });
}

function syncOriginalButton() {
  document.querySelectorAll(".ukaz").forEach(function (quote) {
    var button = quote.querySelector(".ukaz-original");
    if (!button) return;
    var open = quote.classList.contains("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
    var label = button.querySelector(".ukaz-original-label");
    if (label) label.textContent = t(open ? "seeText" : "seeOriginal");
  });
}

function initialLang() {
  var query = new URLSearchParams(window.location.search).get("lang");
  if (query === "ru" || query === "en") return query;
  try {
    var saved = localStorage.getItem("laureates-lang");
    if (saved === "ru" || saved === "en") return saved;
  } catch (err) {}
  return "ru";
}
