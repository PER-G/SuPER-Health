/* SuPER Küche – Packungsgrößen, Haltbarkeit & Einkaufsdaten
 *  pk  übliche Packungsgrößen im Supermarkt (g bzw. ml), typisch für Kaufland/Aldi/Lidl/Rewe/Edeka
 *  hb  Haltbarkeit nach dem Einkauf in Tagen (gekühlt bzw. Vorrat) – Richtwert für die Einkaufsplanung
 *  th  1 = auch lose an der Theke / beim Metzger / Fischhändler / auf dem Markt in exakter Menge erhältlich
 *  fr  1 = einfrierbar (Tipp, wenn die Haltbarkeit nicht reicht)
 *  vr  1 = Vorrat / Grundausstattung (wird separat als „Vorrat prüfen“ gelistet)
 *  q   Suchbegriff für die Produktsuche (wenn abweichend vom Zutatennamen)
 * Fehlende Einträge erhalten Standardwerte je Einkaufs-Kategorie (siehe PACK_DEFAULTS). */
const PACK_DEFAULTS = {
  fleisch: { pk: [250, 400, 500], hb: 2, th: 1, fr: 1 },
  obst: { pk: [500, 1000], hb: 7, th: 1 },
  milch: { pk: [200, 250, 500], hb: 10 },
  trocken: { pk: [500, 1000], hb: 365 },
  konserve: { pk: [400], hb: 365 },
  backen: { pk: [500], hb: 4, fr: 1 },
  tk: { pk: [300, 450, 750], hb: 90 },
  vorrat: { pk: [250, 500], hb: 180, vr: 1 },
  nuss: { pk: [100, 200], hb: 180 },
  spezial: { pk: [250, 500], hb: 180 },
  sport: { pk: [500, 1000], hb: 365 },
};

const PACKS = {
  /* Fleisch & Geflügel – frisch 1–3 Tage */
  haehnchenbrust: { pk: [400, 600, 800, 1000], hb: 2, th: 1, fr: 1, q: 'Hähnchenbrustfilet' },
  haehnchenschenkel: { pk: [400, 600, 1000], hb: 2, th: 1, fr: 1, q: 'Hähnchenschenkel ohne Knochen' },
  haehnchenkeule: { pk: [500, 1000, 1500], hb: 2, th: 1, fr: 1, q: 'Hähnchenkeulen' },
  putenbrust: { pk: [400, 600], hb: 2, th: 1, fr: 1, q: 'Putenbrust Filet' },
  putenhack: { pk: [400, 500], hb: 1, th: 1, fr: 1, q: 'Putenhackfleisch' },
  rinderhack: { pk: [400, 500, 1000], hb: 1, th: 1, fr: 1, q: 'Rinderhackfleisch' },
  gemischtes_hack: { pk: [400, 500, 1000], hb: 1, th: 1, fr: 1, q: 'Hackfleisch gemischt' },
  rindersteak: { pk: [180, 300, 400], hb: 3, th: 1, fr: 1, q: 'Rinderhüftsteak' },
  rindergulasch: { pk: [400, 500, 1000], hb: 2, th: 1, fr: 1, q: 'Rindergulasch' },
  schweinefilet: { pk: [400, 500], hb: 2, th: 1, fr: 1, q: 'Schweinefilet' },
  schinken_gekocht: { pk: [100, 200], hb: 7, th: 1, q: 'Kochschinken' },
  lammhack: { pk: [400], hb: 1, th: 1, fr: 1, q: 'Lammhackfleisch' },
  /* Fisch */
  lachs: { pk: [250, 400, 500], hb: 2, th: 1, fr: 1, q: 'Lachsfilet' },
  lachs_sushi: { pk: [200, 250], hb: 1, th: 1, q: 'Lachs Sushi Qualität' },
  raeucherlachs: { pk: [100, 200], hb: 10, q: 'Räucherlachs' },
  kabeljau: { pk: [250, 400], hb: 1, th: 1, fr: 1, q: 'Kabeljaufilet' },
  seelachs: { pk: [400, 800], hb: 90, q: 'Seelachsfilet tiefgefroren' },
  thunfisch_dose: { pk: [140, 420], hb: 900, q: 'Thunfisch eigener Saft' },
  garnelen: { pk: [225, 400, 800], hb: 90, q: 'Garnelen roh geschält TK' },
  forelle: { pk: [250], hb: 2, th: 1, fr: 1, q: 'Forellenfilet' },
  /* Eier & Milch */
  ei: { pk: [360, 600], hb: 21, q: 'Eier Freiland' },
  eiklar: { pk: [500, 1000], hb: 14, q: 'Eiklar flüssig' },
  milch: { pk: [1000], hb: 7, q: 'Milch 1,5%' },
  milch_lf: { pk: [1000], hb: 10, q: 'Laktosefreie Milch' },
  hafermilch: { pk: [1000], hb: 300, q: 'Haferdrink' },
  mandelmilch: { pk: [1000], hb: 300, q: 'Mandeldrink ungesüßt' },
  magerquark: { pk: [250, 500], hb: 10, q: 'Magerquark' },
  quark_lf: { pk: [250, 500], hb: 10, q: 'Laktosefreier Magerquark' },
  skyr: { pk: [450, 500], hb: 14, q: 'Skyr natur' },
  skyr_lf: { pk: [400, 450], hb: 14, q: 'Skyr laktosefrei' },
  griech_joghurt: { pk: [150, 500, 1000], hb: 14, q: 'Griechischer Joghurt' },
  joghurt: { pk: [500, 1000], hb: 14, q: 'Naturjoghurt 1,5%' },
  joghurt_lf: { pk: [500], hb: 14, q: 'Laktosefreier Joghurt' },
  huettenkaese: { pk: [200, 400], hb: 10, q: 'Hüttenkäse' },
  huettenkaese_lf: { pk: [200], hb: 10, q: 'Hüttenkäse laktosefrei' },
  koerniger_frischkaese: { pk: [200, 400], hb: 10, q: 'Körniger Frischkäse' },
  frischkaese_light: { pk: [175, 200, 300], hb: 14, q: 'Frischkäse light' },
  frischkaese_lf: { pk: [175, 200], hb: 14, q: 'Frischkäse laktosefrei' },
  ricotta: { pk: [250], hb: 7, q: 'Ricotta' },
  mozzarella: { pk: [125, 250], hb: 10, q: 'Mozzarella light' },
  feta: { pk: [150, 200], hb: 14, q: 'Feta' },
  halloumi: { pk: [200, 225, 250], hb: 30, q: 'Halloumi' },
  parmesan: { pk: [40, 100, 200], hb: 30, th: 1, q: 'Parmesan gerieben' },
  gouda_light: { pk: [150, 200, 250], hb: 21, th: 1, q: 'Gouda gerieben light' },
  cheddar: { pk: [150, 200], hb: 30, th: 1, q: 'Cheddar gerieben' },
  butter: { pk: [250], hb: 45, vr: 1, q: 'Butter' },
  sahne: { pk: [200, 250], hb: 30, q: 'Kochsahne 15%' },
  sahne_lf: { pk: [200], hb: 30, q: 'Kochsahne laktosefrei' },
  schmand_light: { pk: [200], hb: 14, q: 'Saure Sahne' },
  kokosjoghurt: { pk: [400], hb: 14, q: 'Kokosjoghurt' },
  /* Pflanzliches Protein */
  tofu: { pk: [200, 400], hb: 21, q: 'Tofu natur' },
  raeuchertofu: { pk: [200], hb: 21, q: 'Räuchertofu' },
  tempeh: { pk: [200], hb: 14, q: 'Tempeh' },
  edamame: { pk: [400, 500], hb: 90, q: 'Edamame TK' },
  kichererbsen: { pk: [240, 265, 530], hb: 900, q: 'Kichererbsen Dose' },
  rote_linsen: { pk: [500], hb: 365, q: 'Rote Linsen' },
  linsen_dose: { pk: [265, 530], hb: 900, q: 'Linsen Dose' },
  kidneybohnen: { pk: [250, 500], hb: 900, q: 'Kidneybohnen Dose' },
  schwarze_bohnen: { pk: [250], hb: 900, q: 'Schwarze Bohnen Dose' },
  weisse_bohnen: { pk: [250, 530], hb: 900, q: 'Weiße Bohnen Dose' },
  whey: { pk: [500, 1000], hb: 365, vr: 1, q: 'Whey Protein' },
  more_total_sahne: { pk: [600], hb: 365, q: 'More Nutrition Total Protein Sahne' },
  more_pudding: { pk: [360], hb: 365, q: 'More Nutrition Protein Pudding' },
  more_chunky: { pk: [250], hb: 365, vr: 1, q: 'More Nutrition Chunky Flavour' },
  esn_designer_whey: { pk: [908, 2000], hb: 365, q: 'ESN Designer Whey' },
  esn_isoclear: { pk: [908], hb: 365, q: 'ESN Isoclear' },
  esn_flexpresso: { pk: [908], hb: 365, q: 'ESN Flexpresso' },
  whey_iso: { pk: [500, 1000], hb: 365, vr: 1, q: 'Whey Isolat' },
  erbsenprotein: { pk: [500], hb: 365, vr: 1, q: 'Veganes Proteinpulver' },
  /* Getreide */
  reis: { pk: [500, 1000], hb: 365, q: 'Basmati Reis' },
  vollkornreis: { pk: [500, 1000], hb: 365, q: 'Vollkornreis' },
  risottoreis: { pk: [500, 1000], hb: 365, q: 'Risottoreis' },
  sushireis: { pk: [500, 1000], hb: 365, q: 'Sushi Reis' },
  quinoa: { pk: [400, 500], hb: 365, q: 'Quinoa' },
  hirse: { pk: [500], hb: 365, q: 'Hirse' },
  buchweizen: { pk: [500], hb: 365, q: 'Buchweizen' },
  couscous: { pk: [500], hb: 365, q: 'Couscous' },
  bulgur: { pk: [500], hb: 365, q: 'Bulgur' },
  haferflocken: { pk: [500, 1000], hb: 365, q: 'Haferflocken zart' },
  haferflocken_gf: { pk: [500], hb: 365, q: 'Haferflocken glutenfrei' },
  vollkornnudeln: { pk: [500], hb: 365, q: 'Vollkornnudeln' },
  nudeln: { pk: [500, 1000], hb: 365, q: 'Spaghetti' },
  linsennudeln: { pk: [250], hb: 365, q: 'Linsennudeln' },
  nudeln_gf: { pk: [400, 500], hb: 365, q: 'Nudeln glutenfrei' },
  lasagneplatten: { pk: [250, 500], hb: 365, q: 'Lasagneplatten' },
  lasagne_gf: { pk: [250], hb: 365, q: 'Lasagne glutenfrei' },
  reisnudeln: { pk: [200, 250, 400], hb: 365, q: 'Reisnudeln' },
  udon: { pk: [200, 400], hb: 60, q: 'Udon Nudeln' },
  gnocchi: { pk: [400, 500], hb: 30, q: 'Gnocchi' },
  gnocchi_gf: { pk: [400], hb: 30, q: 'Gnocchi glutenfrei' },
  polenta: { pk: [500], hb: 365, q: 'Polenta' },
  mehl: { pk: [1000], hb: 365, vr: 1, q: 'Weizenmehl 405' },
  vollkornmehl: { pk: [1000], hb: 365, q: 'Dinkelvollkornmehl' },
  mehl_gf: { pk: [500, 1000], hb: 365, q: 'Mehl glutenfrei' },
  speisestaerke: { pk: [250, 400], hb: 365, vr: 1, q: 'Speisestärke' },
  paniermehl: { pk: [400], hb: 365, q: 'Paniermehl' },
  paniermehl_gf: { pk: [200, 250], hb: 365, q: 'Paniermehl glutenfrei' },
  backpulver: { pk: [15, 60], hb: 365, vr: 1, q: 'Backpulver' },
  chiasamen: { pk: [200, 300], hb: 365, q: 'Chiasamen' },
  leinsamen: { pk: [250, 500], hb: 180, q: 'Leinsamen geschrotet' },
  granola: { pk: [375, 500, 750], hb: 180, q: 'Knuspermüsli' },
  granola_gf: { pk: [325, 400], hb: 180, q: 'Granola glutenfrei' },
  reiswaffeln: { pk: [100, 130], hb: 180, q: 'Reiswaffeln' },
  /* Brot */
  vollkornbrot: { pk: [500, 750], hb: 6, fr: 1, th: 1, q: 'Vollkornbrot' },
  sauerteigbrot: { pk: [500, 750, 1000], hb: 5, fr: 1, th: 1, q: 'Dinkelbrot' },
  brot_gf: { pk: [250, 500], hb: 7, fr: 1, q: 'Brot glutenfrei' },
  toast_vollkorn: { pk: [500], hb: 7, fr: 1, q: 'Vollkorntoast' },
  tortilla: { pk: [370, 480], hb: 21, q: 'Vollkorn Wraps' },
  tortilla_mais: { pk: [250, 330], hb: 21, q: 'Mais Tortillas' },
  burgerbroetchen: { pk: [300, 420], hb: 7, fr: 1, q: 'Burger Brötchen' },
  broetchen_gf: { pk: [200, 280], hb: 7, fr: 1, q: 'Brötchen glutenfrei' },
  pitabrot: { pk: [280, 400], hb: 7, fr: 1, q: 'Pita Brot' },
  naan: { pk: [240, 260], hb: 14, q: 'Naan Brot' },
  bagel: { pk: [340, 425], hb: 7, fr: 1, q: 'Bagel' },
  pizzateig: { pk: [400, 550], hb: 21, q: 'Pizzateig Kühlregal' },
  pizzateig_gf: { pk: [350], hb: 21, q: 'Pizzateig glutenfrei' },
  /* Gemüse – Haltbarkeit gekühlt */
  zwiebel: { pk: [500, 1000, 2000], hb: 30, th: 1, q: 'Zwiebeln' },
  rote_zwiebel: { pk: [500, 1000], hb: 30, th: 1, q: 'Rote Zwiebeln' },
  fruehlingszwiebel: { pk: [100, 150], hb: 6, q: 'Frühlingszwiebeln' },
  lauchgruen: { pk: [100, 150], hb: 6, q: 'Frühlingszwiebeln' },
  lauch: { pk: [250, 500], hb: 10, th: 1, q: 'Lauch' },
  knoblauch: { pk: [50, 100, 250], hb: 60, th: 1, q: 'Knoblauch' },
  knoblauchoel: { pk: [250], hb: 180, vr: 1, q: 'Knoblauchöl' },
  ingwer: { pk: [100, 150], hb: 21, th: 1, q: 'Ingwer' },
  tomate: { pk: [500, 1000], hb: 6, th: 1, q: 'Tomaten' },
  kirschtomaten: { pk: [250, 500], hb: 6, q: 'Cherrytomaten' },
  paprika: { pk: [500], hb: 7, th: 1, q: 'Paprika Mix' },
  gurke: { pk: [400], hb: 7, th: 1, q: 'Salatgurke' },
  zucchini: { pk: [500], hb: 7, th: 1, q: 'Zucchini' },
  aubergine: { pk: [300], hb: 6, th: 1, q: 'Aubergine' },
  brokkoli: { pk: [500], hb: 5, th: 1, q: 'Brokkoli' },
  blumenkohl: { pk: [800], hb: 6, th: 1, q: 'Blumenkohl' },
  spinat: { pk: [125, 200, 250], hb: 3, q: 'Babyspinat' },
  spinat_tk: { pk: [450, 750], hb: 90, q: 'Blattspinat TK' },
  gruenkohl: { pk: [250, 500], hb: 5, q: 'Grünkohl' },
  rucola: { pk: [100, 125], hb: 3, q: 'Rucola' },
  salat: { pk: [250, 400], hb: 5, th: 1, q: 'Romana Salat' },
  karotte: { pk: [500, 1000, 2000], hb: 21, th: 1, q: 'Karotten' },
  sellerie: { pk: [500], hb: 14, th: 1, q: 'Staudensellerie' },
  champignons: { pk: [250, 400, 500], hb: 4, th: 1, q: 'Champignons' },
  austernpilze: { pk: [150, 200], hb: 4, q: 'Austernpilze' },
  kartoffel: { pk: [1000, 1500, 2500], hb: 30, th: 1, q: 'Kartoffeln festkochend' },
  suesskartoffel: { pk: [500, 1000], hb: 21, th: 1, q: 'Süßkartoffeln' },
  kuerbis: { pk: [1000, 1500], hb: 60, th: 1, q: 'Hokkaido Kürbis' },
  erbsen: { pk: [450, 750, 1000], hb: 90, q: 'Erbsen TK' },
  mais: { pk: [140, 285], hb: 900, q: 'Mais Dose' },
  gruene_bohnen: { pk: [450, 750], hb: 90, q: 'Grüne Bohnen TK' },
  zuckerschoten: { pk: [150, 200], hb: 4, q: 'Zuckerschoten' },
  spargel: { pk: [250, 500], hb: 3, th: 1, q: 'Grüner Spargel' },
  pak_choi: { pk: [250, 300], hb: 4, th: 1, q: 'Pak Choi' },
  weisskohl: { pk: [1000], hb: 21, th: 1, q: 'Spitzkohl' },
  rotkohl: { pk: [1000], hb: 21, th: 1, q: 'Rotkohl' },
  rote_bete: { pk: [500], hb: 21, q: 'Rote Bete vorgegart' },
  wokgemuese: { pk: [450, 750], hb: 90, q: 'Wok Gemüse TK' },
  avocado: { pk: [150, 300, 750], hb: 4, th: 1, q: 'Avocado' },
  oliven: { pk: [150, 330], hb: 365, q: 'Oliven schwarz entsteint' },
  getr_tomaten: { pk: [140, 285], hb: 365, q: 'Getrocknete Tomaten in Öl' },
  passierte_tomaten: { pk: [500, 700], hb: 365, q: 'Passierte Tomaten' },
  tomaten_dose: { pk: [400], hb: 900, q: 'Gehackte Tomaten Dose' },
  tomatenmark: { pk: [70, 200], hb: 365, vr: 1, q: 'Tomatenmark' },
  kraeuter: { pk: [15, 25, 50], hb: 4, th: 1, q: 'Petersilie Koriander Basilikum frisch' },
  limette: { pk: [65, 325], hb: 21, th: 1, q: 'Limetten' },
  zitrone: { pk: [100, 500], hb: 21, th: 1, q: 'Zitronen' },
  chili_frisch: { pk: [50, 100], hb: 10, th: 1, q: 'Chilischoten' },
  /* Obst */
  banane: { pk: [1000], hb: 5, th: 1, q: 'Bananen' },
  apfel: { pk: [1000, 1500], hb: 21, th: 1, q: 'Äpfel' },
  birne: { pk: [1000], hb: 7, th: 1, q: 'Birnen' },
  orange: { pk: [1000, 2000], hb: 21, th: 1, q: 'Orangen' },
  kiwi: { pk: [375, 500], hb: 14, th: 1, q: 'Kiwi' },
  beeren_tk: { pk: [300, 500, 750], hb: 90, q: 'Beerenmischung TK' },
  heidelbeeren: { pk: [125, 250, 500], hb: 5, q: 'Heidelbeeren' },
  himbeeren: { pk: [125, 250], hb: 2, q: 'Himbeeren' },
  erdbeeren: { pk: [250, 500], hb: 3, q: 'Erdbeeren' },
  mango: { pk: [400, 500], hb: 5, th: 1, q: 'Mango' },
  ananas: { pk: [1000], hb: 5, th: 1, q: 'Ananas' },
  datteln: { pk: [200, 250], hb: 180, q: 'Datteln entsteint' },
  rosinen: { pk: [200, 500], hb: 180, q: 'Rosinen' },
  /* Nüsse & Süßes */
  mandeln: { pk: [100, 200], hb: 180, q: 'Mandeln' },
  walnuesse: { pk: [100, 200], hb: 180, q: 'Walnusskerne' },
  cashews: { pk: [150, 200], hb: 180, q: 'Cashewkerne' },
  erdnuesse: { pk: [200, 500], hb: 180, q: 'Erdnüsse ungesalzen' },
  erdnussbutter: { pk: [250, 350, 1000], hb: 180, q: 'Erdnussmus 100%' },
  mandelmus: { pk: [250, 500], hb: 180, q: 'Mandelmus' },
  tahini: { pk: [250, 300], hb: 365, q: 'Tahini' },
  sesam: { pk: [100, 250], hb: 365, vr: 1, q: 'Sesam' },
  kuerbiskerne: { pk: [100, 200], hb: 180, q: 'Kürbiskerne' },
  kokosraspeln: { pk: [200], hb: 180, q: 'Kokosraspeln' },
  kakao: { pk: [125, 250], hb: 365, vr: 1, q: 'Backkakao' },
  zartbitter: { pk: [100], hb: 180, q: 'Zartbitterschokolade 70%' },
  honig: { pk: [250, 500], hb: 730, vr: 1, q: 'Honig' },
  ahornsirup: { pk: [250, 330], hb: 365, vr: 1, q: 'Ahornsirup' },
  zucker: { pk: [500, 1000], hb: 730, vr: 1, q: 'Zucker' },
  /* Vorrat: Öle, Saucen, Gewürze */
  olivenoel: { pk: [500, 750, 1000], hb: 365, vr: 1, q: 'Olivenöl' },
  rapsoel: { pk: [750, 1000], hb: 365, vr: 1, q: 'Rapsöl' },
  sesamoel: { pk: [100, 250], hb: 365, vr: 1, q: 'Sesamöl geröstet' },
  kokosoel: { pk: [200, 450], hb: 365, vr: 1, q: 'Kokosöl' },
  kokosmilch_light: { pk: [400], hb: 900, q: 'Kokosmilch light' },
  sojasauce: { pk: [150, 250, 500], hb: 365, vr: 1, q: 'Sojasauce' },
  tamari: { pk: [150, 250], hb: 365, vr: 1, q: 'Tamari glutenfrei' },
  fischsauce: { pk: [200, 700], hb: 365, vr: 1, q: 'Fischsauce' },
  austernsauce: { pk: [150, 250], hb: 365, vr: 1, q: 'Austernsauce' },
  teriyakisauce: { pk: [250], hb: 365, vr: 1, q: 'Teriyaki Sauce' },
  currypaste: { pk: [50, 115], hb: 365, vr: 1, q: 'Currypaste grün' },
  currypulver: { pk: [40, 100], hb: 365, vr: 1, q: 'Currypulver' },
  gewuerze: { pk: [40, 100], hb: 365, vr: 1, q: 'Gewürze' },
  cajun: { pk: [40, 60], hb: 365, vr: 1, q: 'Cajun Gewürz' },
  salz: { pk: [500], hb: 3650, vr: 1, q: 'Salz' },
  gemuesebruehe: { pk: [500], hb: 365, vr: 1, q: 'Gemüsebrühe' },
  huehnerbruehe: { pk: [500], hb: 365, vr: 1, q: 'Hühnerbrühe' },
  bruehe_fm: { pk: [500, 1000], hb: 365, vr: 1, q: 'Brühe ohne Zwiebel Knoblauch' },
  senf: { pk: [200, 250], hb: 365, vr: 1, q: 'Senf mittelscharf' },
  essig: { pk: [500, 750], hb: 730, vr: 1, q: 'Balsamico Essig' },
  pesto: { pk: [190], hb: 365, q: 'Pesto Genovese' },
  pesto_fm: { pk: [190], hb: 365, q: 'Pesto ohne Knoblauch' },
  mayo_light: { pk: [250, 500], hb: 180, vr: 1, q: 'Salatcreme light' },
  ketchup: { pk: [500], hb: 180, vr: 1, q: 'Ketchup zuckerreduziert' },
  salsa: { pk: [300, 315], hb: 365, q: 'Salsa Dip' },
  hummus: { pk: [175, 200], hb: 10, q: 'Hummus' },
  sriracha: { pk: [200, 435], hb: 365, vr: 1, q: 'Sriracha' },
  vanille: { pk: [10, 40], hb: 365, vr: 1, q: 'Zimt gemahlen' },
  hefe: { pk: [21], hb: 365, vr: 1, q: 'Trockenhefe' },
  asia_reispapier: { pk: [200], hb: 365, q: 'Reispapier' },
  asia_rinderbruehe: { pk: [500], hb: 365, vr: 1, q: 'Rinderbrühe' },
  asia_gochujang: { pk: [170, 500], hb: 365, vr: 1, q: 'Gochujang' },
};

/* Supermärkte: Online-Suche (öffnet die Suche des Marktes) + Open-Food-Facts-Store-Tag */
const STORES = {
  kaufland: { n: 'Kaufland', off: 'kaufland', url: q => 'https://filiale.kaufland.de/suche.html?q=' + encodeURIComponent(q) },
  lidl: { n: 'Lidl', off: 'lidl', url: q => 'https://www.lidl.de/q/search?q=' + encodeURIComponent(q) },
  aldi: { n: 'Aldi', off: 'aldi', url: q => 'https://www.aldi-sued.de/suche?q=' + encodeURIComponent(q) },
  rewe: { n: 'Rewe', off: 'rewe', url: q => 'https://shop.rewe.de/productList?search=' + encodeURIComponent(q) },
  edeka: { n: 'Edeka', off: 'edeka', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' site:edeka.de') },
  penny: { n: 'Penny', off: 'penny', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' site:penny.de') },
  netto: { n: 'Netto', off: 'netto', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' site:netto-online.de') },
  more: { n: 'More Nutrition', off: '', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' site:morenutrition.de') },
  esn: { n: 'ESN', off: '', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' site:esn.com') },
  bio: { n: 'Bio-Markt', off: 'denns', url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q + ' bio denns alnatura') },
};

function packInfo(key) {
  const ing = (typeof ING !== 'undefined' ? ING : globalThis.ING)[key] || {};
  return Object.assign({}, PACK_DEFAULTS[ing.cat] || PACK_DEFAULTS.vorrat, PACKS[key] || {});
}

/* Günstigste Packungskombination: minimiert Rest, dann Anzahl Packungen. */
function bestPacks(need, sizes) {
  sizes = [...new Set(sizes)].sort((a, b) => b - a);
  if (!sizes.length || need <= 0) return { combo: [], total: 0, waste: 0 };
  let best = null;
  const maxN = Math.ceil(need / sizes[sizes.length - 1]) + 1;
  (function rec(i, rest, combo, count) {
    if (count > Math.min(maxN, 12)) return;
    if (rest <= 0) {
      const total = need - rest, waste = total - need;
      if (!best || waste < best.waste - 0.5 || (Math.abs(waste - best.waste) <= 0.5 && count < best.count)) best = { combo: combo.slice(), total, waste, count };
      return;
    }
    if (i >= sizes.length) return;
    const s = sizes[i];
    for (let n = Math.ceil(rest / s); n >= 0; n--) {
      if (n) combo.push([s, n]);
      rec(i + 1, rest - n * s, combo, count + n);
      if (n) combo.pop();
    }
  })(0, need, [], 0);
  return best || { combo: [[sizes[0], Math.ceil(need / sizes[0])]], total: sizes[0] * Math.ceil(need / sizes[0]), waste: sizes[0] * Math.ceil(need / sizes[0]) - need };
}

if (typeof module !== 'undefined') module.exports = { PACKS, PACK_DEFAULTS, STORES, packInfo, bestPacks };

/* ---------- Glutenfrei: Markenempfehlungen & versteckte Gluten-Quellen ----------
 * all: überall erhältliche Marken · kaufland/aldi/rewe: Eigenmarken (K-free, enjoy free!, REWE frei von)
 * Sortiment variiert je Filiale – die Produktsuche zeigt, was es wirklich gibt. */
const GF_BRANDS = {
  nudeln_gf: { all: ['Schär Penne / Spaghetti / Fusilli', 'Barilla glutenfrei'], kaufland: 'K-free Nudeln', aldi: 'enjoy free! Nudeln', rewe: 'REWE frei von Nudeln' },
  lasagne_gf: { all: ['Schär Lasagne'], kaufland: 'K-free Lasagneplatten' },
  gnocchi_gf: { all: ['Schär Gnocchi'] },
  mehl_gf: { all: ['Schär Mix It! / Mix B (Brot)', '3Pauly Mehlmischung', 'Hammermühle'], kaufland: 'K-free Mehlmischung', aldi: 'enjoy free! Mehlmischung' },
  brot_gf: { all: ['Schär Landbrot / Vitalbrot', '3Pauly Brot', 'Hammermühle'], kaufland: 'K-free Brot', aldi: 'enjoy free! Brot', rewe: 'REWE frei von Brot' },
  broetchen_gf: { all: ['Schär Ciabatta / Bon Matin', 'Schär Burger Buns'], kaufland: 'K-free Brötchen', aldi: 'enjoy free! Brötchen' },
  paniermehl_gf: { all: ['Schär Paniermehl', 'alternativ: gemahlene Cornflakes (glutenfrei gekennzeichnet)'] },
  pizzateig_gf: { all: ['Schär Pizzaboden', 'Schär Mix It! Pizza'], aldi: 'enjoy free! Pizzaboden' },
  haferflocken_gf: { all: ['Bauck glutenfreie Haferflocken', 'Kölln glutenfreie Haferflocken'], kaufland: 'K-free Haferflocken', note: 'Reine Hafer-Sorten – bei Zöliakie verträgt nicht jede/r Hafer, ggf. Hirse- oder Buchweizenflocken nehmen.' },
  granola_gf: { all: ['Schär Granola', 'Bauck glutenfreies Müsli'] },
  tortilla_mais: { all: ['Mais-Tortillas mit glutenfrei-Kennzeichnung (100 % Mais)'] },
  tamari: { all: ['Kikkoman glutenfreie Sojasauce', 'Clearspring Tamari'] },
  reisnudeln: { all: ['Reisnudeln (100 % Reis)'] },
  quinoa: { all: ['Quinoa (von Natur aus glutenfrei)'] },
};
/* Produkte, in denen oft verstecktes Gluten steckt: auf „glutenfrei“ / durchgestrichene Ähre achten */
const GF_CHECK = new Set(['more_total_sahne', 'more_pudding', 'more_chunky', 'esn_designer_whey', 'esn_isoclear', 'esn_flexpresso', 'gemuesebruehe', 'huehnerbruehe', 'asia_rinderbruehe', 'bruehe_fm', 'cajun', 'currypulver', 'currypaste', 'fischsauce', 'mayo_light', 'ketchup', 'salsa', 'pesto', 'pesto_fm', 'whey', 'whey_iso', 'erbsenprotein', 'reiswaffeln', 'zartbitter', 'schinken_gekocht', 'backpulver', 'speisestaerke', 'sriracha', 'seelachs', 'garnelen', 'hummus', 'asia_reispapier']);
function gfBrandText(key, market) {
  const b = GF_BRANDS[key]; if (!b) return '';
  const own = b[market] ? [b[market]] : [];
  return own.concat(b.all || []).slice(0, 3).join(' · ');
}
if (typeof module !== 'undefined') Object.assign(module.exports, { GF_BRANDS, GF_CHECK, gfBrandText });
