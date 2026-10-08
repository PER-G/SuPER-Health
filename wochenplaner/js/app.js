/* SuPER Küche – Familien-Wochenplaner
 * Reines Frontend, Daten pro Nutzerprofil im Browser (localStorage), Export/Import als Backup.
 * Verknüpfung zu SuPER Health (Tracking) über gemeinsamen Speicher (gleiche Domain) oder Link-Übergabe. */
/* global ING, SHOP_CATS, MEMBER_TYPES, ALLERGENS, Core, RECIPES, IMAGE_CREDITS */
(function () {
  'use strict';

  /* ================= Konstanten ================= */
  const MEALS = {
    fruehstueck: { n: 'Frühstück', e: '🥣' },
    mittag: { n: 'Mittagessen', e: '🥗' },
    abend: { n: 'Abendessen', e: '🍲' },
    snack: { n: 'Snack', e: '🍎' },
  };
  const MEAL_ORDER = ['fruehstueck', 'mittag', 'abend', 'snack'];
  const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const DAYS_S = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];
  const STYLES = {
    protein: { n: 'Proteinreich', e: '💪' },
    leicht: { n: 'Kalorienarm', e: '⚖️' },
    comfort: { n: 'Gesunder Comfort', e: '🍲' },
    schnell: { n: 'Schnell (≤ 20 Min.)', e: '⚡' },
    familie: { n: 'Baby & Kleinkind', e: '👶' },
    mealprep: { n: 'Meal Prep', e: '📦' },
    dessert: { n: 'Dessert', e: '🍮' },
  };
  const CUISINES = {
    italienisch: { n: 'Italienisch', d: 'Pasta · Risotto · Gnocchi', pic: 'pesto-pasta-haehnchen' },
    asiatisch: { n: 'Asiatisch', d: 'Nudeln · Curry · Wok', pic: 'pad-thai-haehnchen' },
    mexikanisch: { n: 'Mexikanisch', d: 'Tacos · Bowls · Fajitas', pic: 'rindfleisch-tacos' },
    indisch: { n: 'Indisch', d: 'Curry · Dal · Tandoori', pic: 'chicken-tikka-masala' },
    mediterran: { n: 'Mediterran', d: 'Griechisch · Ofen · Salate', pic: 'griechischer-haehnchensalat' },
    deutsch: { n: 'Hausmannskost', d: 'Klassiker · Suppen · Eintopf', pic: 'huehnersuppe-nudeln-gemuese' },
    amerikanisch: { n: 'Amerikanisch', d: 'Burger · Bowls · Comfort', pic: 'protein-burger' },
    international: { n: 'International', d: 'Frühstück · Snacks · Mehr', pic: 'protein-pancakes' },
    orientalisch: { n: 'Orientalisch', d: 'Hummus · Shakshuka · Gewürze', pic: 'shakshuka' },
  };
  const MARKETS = {
    aldi: { n: 'Aldi', f: 0.93, c: '#1F3C88' }, lidl: { n: 'Lidl', f: 0.94, c: '#0050AA' }, penny: { n: 'Penny', f: 0.95, c: '#CD1719' },
    netto: { n: 'Netto', f: 0.95, c: '#FFD500' }, kaufland: { n: 'Kaufland', f: 1.0, c: '#E10915' }, rewe: { n: 'Rewe', f: 1.1, c: '#CC071E' },
    edeka: { n: 'Edeka', f: 1.12, c: '#1B4B9B' }, bio: { n: 'Bio-Markt', f: 1.45, c: '#4C8C2B' },
  };
  const LIQUIDS = new Set(['milch', 'milch_lf', 'hafermilch', 'mandelmilch', 'gemuesebruehe', 'huehnerbruehe', 'bruehe_fm', 'kokosmilch_light', 'sojasauce', 'tamari', 'fischsauce', 'essig']);
  const TRACKER_DEFAULT = 'https://su-per-health.vercel.app/tracking';
  const TRACK_QUEUE = 'kueche2track';

  /* ================= Icons ================= */
  const IC = {
    plan: '<path d="M9 4h6M8 3h8a1 1 0 0 1 1 1v2H7V4a1 1 0 0 1 1-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 11l1.5 1.5L12 10M8 16l1.5 1.5L12 15M14 11.5h3M14 16.5h3"/>',
    rezepte: '<circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="8.5"/><path d="M3 3v6M1.8 3v3.5a1.2 1.2 0 0 0 2.4 0V3M3 9v12M21 3c-1.7 1-2 3-2 5s.6 3 2 3v10"/>',
    einkauf: '<path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.4-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>',
    einstellungen: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    konto: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
    euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    flame: '<path d="M12 21c4 0 7-2.7 7-6.6 0-3.6-2.6-5.5-3.6-8.4-.4 2-1.4 3-2.6 3.6C13 6.4 11.5 4 9 3c.4 3-3 5.6-3.8 8.6C4 16.4 7.4 21 12 21z"/>',
    baby: '<circle cx="12" cy="7" r="3"/><path d="M8 21v-4l-3-3 2.5-2.5L10 14h4l2.5-2.5L19 14l-3 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15c2.4 0 4.2 1.4 5 4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
  };
  const ic = (n, cls) => '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>';

  /* ================= Hilfsfunktionen ================= */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = v => '€' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
  const eur0 = v => '€' + Math.round(v);
  const r0 = v => Math.round(v);
  const r1 = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
  const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const parseKey = k => new Date(k + 'T12:00:00');
  function mondayOf(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function lsGet(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ================= Rezepte vorbereiten ================= */
  const R = {};
  for (const r of RECIPES) {
    const base = Core.adapt(r, {});
    r._n = Core.nutrition(base.items);
    r._diet = Core.dietStatus(r);
    r._styles = Core.styles(r, r._n);
    r._all = Core.allergens(base.items);
    r._img = 'img/recipes/' + r.id + '.jpg';
    r._search = (r.n + ' ' + r.cu + ' ' + r.i.map(x => (ING[x[0]] || {}).n).join(' ')).toLowerCase();
    R[r.id] = r;
  }

  /* ================= Profile & Zustand ================= */
  const DEFAULT_STATE = () => ({
    v: 1,
    name: '',
    onboarded: false,
    household: { erwachsen: 2, teen: 0, kind: 0, kleinkind: 1, baby: 0 },
    days: [true, true, true, true, true, true, true],
    meals: { fruehstueck: false, mittag: false, abend: true, snack: false },
    diet: { gf: true, lf: false, fm: false, veg: false },
    exclude: [],
    styles: ['protein', 'familie'],
    budget: 120,
    market: 'kaufland',
    goals: { k: 2000, p: 140, c: 200, f: 70, src: 'manual' },
    favorites: [],
    dislikes: [],
    plans: {},
    tracked: [],
    trackerUrl: '',
    shopDays: [0, 3],
    thermomix: false,
    proteinBrand: '',
    noProtein: [],
    noCuisine: [],
    cal: {},
    calV: 0,
    shopState: {},
    mode: {},
    extras: [],
    dayMeals: null,
    stores: [],
    shopGroup: 'store',
    theke: false,
    pantry: {},
    products: {},
    created: Date.now(),
  });
  let profiles = lsGet('sk_profiles', null);
  if (!profiles || !profiles.list || !profiles.list.length) {
    const id = uid();
    profiles = { active: id, list: [{ id, name: 'Mein Profil' }] };
    lsSet('sk_profiles', profiles);
  }
  let S = Object.assign(DEFAULT_STATE(), lsGet('sk_data_' + profiles.active, {}));
  /* Plan-Snapshot für SuPER Health Tracking (gleiche Domain, Schlüssel 'kueche_plan'): alle geplanten Gerichte
   * von letzter bis in vier Wochen mit Nährwerten pro Erwachsenen-Portion. Der Tracker zeigt sie unter
   * „Aus dem Wochenplaner" (Kalorien-Tracker) und im Ernährungsplan an – dort reicht ein Tipp zum Tracken. */
  const PLAN_SNAPSHOT = 'kueche_plan';
  let snapT = null;
  function publishPlan() { clearTimeout(snapT); snapT = setTimeout(writeSnapshot, 120); }
  function writeSnapshot() {
    try {
      const mon = new Date(), from = keyOf(addDays(mon, -14)), to = keyOf(addDays(mon, 35)), f = MEMBER_TYPES.erwachsen.f, days = {};
      Object.keys(S.cal || {}).forEach(date => {
        if (date < from || date > to) return;
        const day = S.cal[date] || {};
        Object.keys(day).forEach(m => {
          const r = R[day[m] && day[m].r];
          if (!r || !MEALS[m]) return;
          const n = nutriFor(r, f);
          (days[date] = days[date] || []).push({ date, meal: m, mealN: MEALS[m].n, recipe: r.id, n: r.n, e: MEALS[m].e, img: r._img, k: r0(n.k), p: +n.p.toFixed(1), c: +n.c.toFixed(1), f: +n.f.toFixed(1) });
        });
      });
      for (const k in days) days[k].sort((a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal));
      lsSet(PLAN_SNAPSHOT, { v: 1, ts: Date.now(), days });
    } catch (e) { console.warn('Plan-Snapshot', e); }
  }
  /* Ergänzt fehlende Felder älterer Profile (Mahlzeiten pro Tag, Einkaufsstätten) */
  function fixState() {
    if (!Array.isArray(S.dayMeals) || S.dayMeals.length !== 7) S.dayMeals = Array.from({ length: 7 }, () => Object.assign({ fruehstueck: false, mittag: false, abend: true, snack: false }, S.meals));
    if (!Array.isArray(S.stores)) S.stores = [];
    if (MARKETS[S.market] && S.stores.indexOf(S.market) < 0) S.stores.unshift(S.market);
    if (MARKETS[S.market] && S.stores[0] !== S.market) { S.stores = S.stores.filter(x => x !== S.market); S.stores.unshift(S.market); }
    if (!S.stores.length) S.stores = ['kaufland'];
    if (!S.noProtein) S.noProtein = [];
    if (!S.noCuisine) S.noCuisine = [];
    // Umstellung von Kalenderwochen (S.plans) auf Datums-Kalender (S.cal) – einmalig
    if (S.calV !== 1) {
      S.cal = S.cal || {}; S.extras = S.extras || []; S.mode = S.mode || {}; S.shopState = S.shopState || {};
      const today = keyOf(new Date());
      for (const wkKey in (S.plans || {})) {
        const p = S.plans[wkKey] || {}, start = parseKey(wkKey);
        for (const sk in (p.slots || {})) { const [d, m] = sk.split('|'), dk = keyOf(addDays(start, +d)); S.cal[dk] = S.cal[dk] || {}; if (!S.cal[dk][m]) S.cal[dk][m] = p.slots[sk]; }
        if (keyOf(addDays(start, 6)) >= today) { (p.extras || []).forEach(e => S.extras.push(e)); Object.assign(S.mode, p.mode || {}); }
      }
      S.calV = 1;
    }
    if (!S.cal) S.cal = {}; if (!S.extras) S.extras = []; if (!S.mode) S.mode = {}; if (!S.shopState) S.shopState = {};
  }
  fixState();
  function save() { S.updated = Date.now(); lsSet('sk_data_' + profiles.active, S); publishPlan(); const p = profiles.list.find(x => x.id === profiles.active); if (p && S.name) { p.name = S.name; lsSet('sk_profiles', profiles); } }

  /* Planungsfenster: 7 Tage ab weekStart (Standard: heute). Ein Slot "d|m" = Tag d (0–6 ab weekStart) + Mahlzeit m. */
  function startOfDay(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; }
  let weekStart = startOfDay(new Date());
  const wk = () => keyOf(weekStart);
  function wdOf(off) { return (addDays(weekStart, off).getDay() + 6) % 7; } // Wochentag (0 = Montag) eines Fenstertags
  function dayName(off) { return DAYS[wdOf(off)]; }
  function dayLabel(off) { const x = addDays(weekStart, off); return DAYS[wdOf(off)] + ' ' + x.getDate() + '.' + (x.getMonth() + 1) + '.'; }
  function rangeNavHtml(compact) {
    const t = startOfDay(new Date()), tom = addDays(t, 1), mon = addDays(t, ((8 - t.getDay()) % 7) || 7), fmt = d => d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' });
    const cur = keyOf(weekStart), chip = (d, label, act) => '<button class="fchip ' + (keyOf(d) === cur ? 'on' : '') + '" data-act="' + act + '">' + label + '</button>';
    return '<div class="week-nav range-nav"><button class="icon-btn" data-act="wprev" title="7 Tage zurück" aria-label="7 Tage zurück">«</button><button class="icon-btn" data-act="dprev" title="1 Tag zurück" aria-label="1 Tag zurück">' + ic('left') + '</button>' +
      '<span class="lbl">' + (todayIndex() === 0 ? 'Ab heute' : todayIndex() === -1 && Math.round((startOfDay(weekStart) - t) / 864e5) === 1 ? 'Ab morgen' : '7 Tage') + '<br><b>' + fmt(weekStart) + ' – ' + fmt(addDays(weekStart, 6)) + '</b></span>' +
      '<button class="icon-btn" data-act="dnext" title="1 Tag weiter" aria-label="1 Tag weiter">' + ic('right') + '</button><button class="icon-btn" data-act="wnext" title="7 Tage weiter" aria-label="7 Tage weiter">»</button></div>' +
      '<div class="filter-row" style="justify-content:center;flex-wrap:wrap;margin-top:6px">' + chip(t, 'Ab heute', 'thisweek') + chip(tom, 'Ab morgen', 'fromtomorrow') + chip(mon, 'Ab Montag ' + mon.getDate() + '.' + (mon.getMonth() + 1) + '. (ganze Woche)', 'nextmonday') + '</div>';
  }
  function shiftRange(days, abs) { weekStart = abs ? startOfDay(abs) : addDays(weekStart, days); if ($('#wzcount')) planWizard(!!$('#wizKeep')); renderPlan(); }
  function shopKeyOf(off, key) { return keyOf(addDays(weekStart, off)) + '|' + key; }
  // plan() liefert eine Sicht auf das aktuelle Fenster; Lesen/Schreiben geht direkt in den Datums-Kalender S.cal
  function plan() {
    const ws = new Date(weekStart), dk = d => keyOf(addDays(ws, +d));
    const slots = new Proxy({}, {
      get(_, k) { if (typeof k !== 'string' || k.indexOf('|') < 0) return undefined; const [d, m] = k.split('|'), day = S.cal[dk(d)]; return day ? day[m] : undefined; },
      set(_, k, v) { const [d, m] = k.split('|'), key = dk(d); (S.cal[key] = S.cal[key] || {})[m] = v; return true; },
      deleteProperty(_, k) { const [d, m] = k.split('|'), key = dk(d); if (S.cal[key]) { delete S.cal[key][m]; if (!Object.keys(S.cal[key]).length) delete S.cal[key]; } return true; },
      has(_, k) { if (typeof k !== 'string' || k.indexOf('|') < 0) return false; const [d, m] = k.split('|'), day = S.cal[dk(d)]; return !!(day && day[m]); },
      ownKeys() { const ks = []; for (let d = 0; d < 7; d++) { const day = S.cal[dk(d)]; if (day) for (const m of MEAL_ORDER) if (day[m]) ks.push(d + '|' + m); } return ks; },
      getOwnPropertyDescriptor(_, k) { const [d, m] = String(k).split('|'), day = S.cal[dk(d)]; return day && day[m] ? { enumerable: true, configurable: true, writable: true, value: day[m] } : undefined; },
    });
    return {
      get slots() { return slots; },
      set slots(obj) { for (let d = 0; d < 7; d++) delete S.cal[dk(d)]; for (const k in obj) slots[k] = obj[k]; },
      get shop() { return S.shopState; }, set shop(v) { S.shopState = v || {}; },
      get mode() { return S.mode; }, set mode(v) { S.mode = v || {}; },
      get extras() { return S.extras; }, set extras(v) { S.extras = v || []; },
    };
  }

  /* ================= Berechnungen ================= */
  function servings() { let s = 0; for (const t in S.household) s += (S.household[t] || 0) * MEMBER_TYPES[t].f; return Math.max(0.2, Math.round(s * 100) / 100); }
  function persons() { let s = 0; for (const t in S.household) s += S.household[t] || 0; return s; }
  function hasLittle() { return (S.household.baby || 0) + (S.household.kleinkind || 0) > 0; }
  function marketF() { return (MARKETS[S.market] || MARKETS.kaufland).f; }
  const PROTEIN_BRANDS = { '': 'Neutral (beliebiges Whey)', esn_designer_whey: 'ESN Designer Whey', esn_isoclear: 'ESN Isoclear (laktosearm, klar)', more_total_sahne: 'More Nutrition Total Protein „Sahne“' };
  const ADAPT_CACHE = new Map();
  function adapted(r) {
    const d = S.proteinBrand ? Object.assign({}, S.diet, { pref: { whey: S.proteinBrand, whey_iso: S.proteinBrand === 'esn_isoclear' ? 'esn_isoclear' : '' } }) : S.diet;
    const key = r.id + '|' + (d.gf ? 1 : 0) + (d.lf ? 1 : 0) + (d.fm ? 1 : 0) + (d.veg ? 1 : 0) + '|' + (S.proteinBrand || '');
    let a = ADAPT_CACHE.get(key);
    if (!a) { a = Core.adapt(r, d); ADAPT_CACHE.set(key, a); }
    return a;
  }
  function nutriFor(r, factor) { return Core.nutrition(adapted(r).items, factor || 1); }
  function costFor(r) { return nutriFor(r).cost * servings() * marketF(); }
  /* Fleisch- & Fischsorten: einzeln an-/abwählbar (S.noProtein = ausgeschlossene Gruppen) */
  const PROTEIN_GROUPS = {
    fleisch: { n: 'Fleisch', e: '🥩', items: {
      gefluegel: { n: 'Hähnchen', keys: ['haehnchenbrust', 'haehnchenschenkel', 'haehnchenkeule', 'huehnerbruehe'] },
      pute: { n: 'Pute', keys: ['putenbrust', 'putenhack'] },
      rind: { n: 'Rind', keys: ['rinderhack', 'rindersteak', 'rindergulasch', 'rinderfilet', 'asia_rinderbruehe', 'gemischtes_hack'] },
      schwein: { n: 'Schwein', keys: ['schweinefilet', 'schweineschnitzel', 'schinken_gekocht', 'gemischtes_hack', 'gelatine'] },
      lamm: { n: 'Lamm', keys: ['lammhack', 'fleisch_lamm'] },
    } },
    fisch: { n: 'Fisch & Meeresfrüchte', e: '🐟', items: {
      lachs: { n: 'Lachs', keys: ['lachs', 'lachs_sushi', 'raeucherlachs'] },
      weissfisch: { n: 'Kabeljau & Seelachs', keys: ['kabeljau', 'seelachs'] },
      forelle: { n: 'Forelle', keys: ['forelle'] },
      edelfisch: { n: 'Zander & Dorade', keys: ['zander', 'dorade'] },
      thunfisch: { n: 'Thunfisch', keys: ['thunfisch_dose', 'fisch_thunfisch'] },
      garnelen: { n: 'Garnelen', keys: ['garnelen', 'austernsauce'] },
    } },
  };
  const PG_KEY = {}; // Zutat → Gruppen
  for (const c in PROTEIN_GROUPS) for (const g in PROTEIN_GROUPS[c].items) for (const k of PROTEIN_GROUPS[c].items[g].keys) (PG_KEY[k] = PG_KEY[k] || []).push(g);
  function proteinBlocked(r) {
    if (!S.noProtein || !S.noProtein.length) return false;
    const fishAll = Object.keys(PROTEIN_GROUPS.fisch.items).every(g => S.noProtein.indexOf(g) >= 0);
    return adapted(r).items.some(it => (PG_KEY[it.key] || []).some(g => S.noProtein.indexOf(g) >= 0) || (fishAll && it.key === 'fischsauce'));
  }
  function proteinPickerHtml() {
    let h = '';
    for (const c in PROTEIN_GROUPS) {
      const grp = PROTEIN_GROUPS[c], ids = Object.keys(grp.items), on = ids.filter(g => S.noProtein.indexOf(g) < 0).length;
      h += '<div class="card pg-card"><button class="pg-all" data-pgall="' + c + '"><span class="pg-cb ' + (on === ids.length ? 'on' : on ? 'part' : '') + '">' + ic('check') + '</span><b>' + grp.e + ' ' + grp.n + '</b><span class="muted" style="margin-left:auto;font-size:12.5px">' + (on === ids.length ? 'alle' : on ? on + ' von ' + ids.length : 'keine') + '</span></button><div class="pg-items">' +
        ids.map(g => '<button class="fchip ' + (S.noProtein.indexOf(g) < 0 ? 'on' : '') + '" data-pg="' + g + '">' + (S.noProtein.indexOf(g) < 0 ? '✓ ' : '') + grp.items[g].n + '</button>').join('') + '</div></div>';
    }
    return h;
  }
  /* Küchen-Auswahl: „Alle Küchen“ mit Aufklappen für einzelne Küchen */
  let cuiOpen = false;
  function cuisinePickerHtml() {
    const ids = Object.keys(CUISINES).filter(c => RECIPES.some(r => r.cu === c)), on = ids.filter(c => S.noCuisine.indexOf(c) < 0).length;
    return '<div class="card pg-card"><div style="display:flex;align-items:center"><button class="pg-all" data-kx="all" style="flex:1"><span class="pg-cb ' + (on === ids.length ? 'on' : on ? 'part' : '') + '">' + ic('check') + '</span><b>🌍 Alle Küchen</b><span class="muted" style="margin-left:auto;font-size:12.5px">' + (on === ids.length ? 'alle' : on + ' von ' + ids.length) + '</span></button>' +
      '<button class="icon-btn" data-kx="open" aria-label="Küchen einzeln wählen" style="margin-left:8px">' + ic(cuiOpen ? 'left' : 'right') + '</button></div>' +
      (cuiOpen ? '<div class="pg-items">' + ids.map(c => '<button class="fchip ' + (S.noCuisine.indexOf(c) < 0 ? 'on' : '') + '" data-kx="one:' + c + '">' + (S.noCuisine.indexOf(c) < 0 ? '✓ ' : '') + CUISINES[c].n + ' <span class="muted" style="font-size:11px">' + RECIPES.filter(r => r.cu === c && r.m.some(x => x === 'mittag' || x === 'abend')).length + '</span></button>').join('') + '</div><p class="muted" style="font-size:12px;margin-top:8px">Gilt für Mittag- und Abendessen.</p>' : '') + '</div>';
  }
  function eligible(r, mealType) {
    if (mealType && r.m.indexOf(mealType) < 0) return false;
    if (!adapted(r).ok) return false;
    if (S.exclude.length && Core.allergens(adapted(r).items).some(a => S.exclude.indexOf(a) >= 0)) return false;
    if (S.dislikes.indexOf(r.id) >= 0) return false;
    if (proteinBlocked(r)) return false;
    if (S.noCuisine.length && S.noCuisine.indexOf(r.cu) >= 0 && (mealType === 'mittag' || mealType === 'abend' || (!mealType && r.m.some(x => x === 'mittag' || x === 'abend')))) return false;
    // Mit Baby im Haushalt: gemeinsame Hauptmahlzeiten müssen babytauglich sein (Snacks & Frühstück dürfen getrennt sein)
    if ((S.household.baby || 0) > 0 && r.baby === 0 && (mealType === 'mittag' || mealType === 'abend')) return false;
    return true;
  }
  function slotKey(day, meal) { return day + '|' + meal; }
  function mealsOf(off) { const w = wdOf(off); return S.days[w] ? MEAL_ORDER.filter(m => S.dayMeals[w] && S.dayMeals[w][m]) : []; }
  function activeMeals() { return MEAL_ORDER.filter(m => S.days.some((on, d) => on && S.dayMeals[d][m])); }
  function setMealAll(m, val) { for (let d = 0; d < 7; d++) S.dayMeals[d][m] = val; S.meals[m] = val; }
  /* Tages-Planer: Tage an/aus + Mini-Kästchen (F/M/A/S) je Tag, Detail per Tipp auf die Kästchen */
  let dmEdit = -1;
  function nextDateOf(wd) { for (let o = 0; o < 7; o++) if (wdOf(o) === wd) { const x = addDays(weekStart, o); return x.getDate() + '.' + (x.getMonth() + 1) + '.'; } return ''; }
  function dayPlannerHtml() {
    const L = { fruehstueck: 'F', mittag: 'M', abend: 'A', snack: 'S' };
    let h = '<div class="dp-grid">' + DAYS_S.map((ds, d) => '<div class="dp-day ' + (S.days[d] ? 'on' : '') + (dmEdit === d ? ' edit' : '') + '"><button class="dp-btn" data-dm="day:' + d + '" title="' + DAYS[d] + ' an/aus">' + ds + '<small>' + nextDateOf(d) + '</small></button>' +
      '<button class="dp-boxes" data-dm="edit:' + d + '" title="Mahlzeiten für ' + DAYS[d] + ' festlegen" aria-label="Mahlzeiten für ' + DAYS[d] + '">' + MEAL_ORDER.map(m => '<i class="' + (S.days[d] && S.dayMeals[d][m] ? 'on' : '') + '">' + L[m] + '</i>').join('') + '</button></div>').join('') + '</div>';
    if (dmEdit >= 0) h += '<div class="card dp-edit"><b>' + DAYS[dmEdit] + ' – welche Mahlzeiten?</b><div class="pick-grid" style="margin-top:8px">' + MEAL_ORDER.map(m => '<button class="' + (S.days[dmEdit] && S.dayMeals[dmEdit][m] ? 'on' : '') + '" data-dm="meal:' + dmEdit + ':' + m + '">' + MEALS[m].e + ' ' + MEALS[m].n + '</button>').join('') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-sec btn-sm" data-dm="copy:' + dmEdit + '">Für alle Tage übernehmen</button><button class="btn btn-pri btn-sm" data-dm="edit:-1" style="margin-left:auto">Fertig</button></div></div>';
    h += '<p class="muted" style="font-size:12px;margin:8px 2px 0">Tag antippen = an/aus · Kästchen antippen = Mahlzeiten festlegen (F Frühstück · M Mittag · A Abend · S Snack)</p>';
    h += '<div class="filter-row" style="flex-wrap:wrap;margin-top:8px"><span class="muted" style="font-size:12.5px;align-self:center">Für alle Tage:</span>' + MEAL_ORDER.map(m => { const days = S.days.map((on, d) => on ? d : -1).filter(d => d >= 0); const all = days.length && days.every(d => S.dayMeals[d][m]); return '<button class="fchip ' + (all ? 'on' : '') + '" data-dm="all:' + m + '">' + MEALS[m].e + ' ' + MEALS[m].n + '</button>'; }).join('') + '</div>';
    return h;
  }

  /* Index des heutigen Tages in der angezeigten Woche: -1 = Woche liegt in der Zukunft, 7 = Woche ist vorbei */
  function todayIndex() {
    const diff = Math.round((startOfDay(new Date()) - startOfDay(weekStart)) / 864e5);
    if (diff < 0) return -1; // Fenster liegt in der Zukunft
    if (diff > 6) return 7;  // Fenster ist vorbei
    return diff;
  }
  function isPast(d) { return d < todayIndex(); }
  function futureMealsCount() { let n = 0; for (let d = 0; d < 7; d++) if (!isPast(d)) n += mealsOf(d).length; return n; }
  function weekStats(k) {
    const p = plan(k); let cost = 0, n = 0; const tot = { k: 0, p: 0, c: 0, f: 0 }; const days = new Set();
    for (const sk in p.slots) {
      const r = R[p.slots[sk].r]; if (!r) continue;
      if (isPast(+sk.split('|')[0])) continue; // vergangene Mahlzeiten zählen nicht mehr
      cost += costFor(r); n++; days.add(sk.split('|')[0]);
      const nu = nutriFor(r); tot.k += nu.k; tot.p += nu.p; tot.c += nu.c; tot.f += nu.f;
    }
    const d = Math.max(1, days.size);
    return { cost, n, days: days.size, avg: { k: tot.k / d, p: tot.p / d, c: tot.c / d, f: tot.f / d } };
  }

  /* ================= Plan-Generator ================= */
  function scoreRecipe(r, ctx) {
    let s = 1 + Math.random() * 1.2;
    for (const st of S.styles) if (r._styles.indexOf(st) >= 0) s += 1.1;
    if (S.favorites.indexOf(r.id) >= 0) s += 1.4;
    if (S.diet.gf && r._diet.gf === 2) s += 0.5;
    if (hasLittle()) s += r.baby * 0.6;
    if (ctx.usedCuisine[r.cu]) s -= 0.6 * ctx.usedCuisine[r.cu];
    if (ctx.prevCuisine === r.cu) s -= 0.8;
    const mp = mainProtein(r); if (mp && ctx.prot[mp]) s -= 0.9 * ctx.prot[mp];
    // Reste-Verwertung: frische Zutaten, die diese Woche schon gekauft werden, nochmal nutzen (weniger Abfall)
    let shared = 0; for (const [k] of r.i) if (ctx.fresh[k] && ING[k].cat !== 'obst') shared++; else if (ctx.fresh[k]) shared += 0.4;
    s += Math.min(1.2, shared * 0.3);
    const n = nutriFor(r);
    if (r.m.indexOf('snack') < 0 || r.m.length > 1) s += Math.min(1.2, n.p / 40);
    // Budget: Kosten im Verhältnis zum Budget pro Mahlzeit
    const perMeal = S.budget / Math.max(1, ctx.mealsInWeek);
    const c = costFor(r);
    if (c > perMeal * 1.25) s -= (c / perMeal - 1) * 2;
    return s;
  }
  function pickFor(meal, ctx, exclude) {
    let cands = RECIPES.filter(r => eligible(r, meal) && !ctx.used.has(r.id) && (!exclude || exclude.indexOf(r.id) < 0));
    if (!cands.length) cands = RECIPES.filter(r => eligible(r, meal) && (!exclude || exclude.indexOf(r.id) < 0));
    if (!cands.length) return null;
    const scored = cands.map(r => ({ r, s: scoreRecipe(r, ctx) })).sort((a, b) => b.s - a.s);
    const top = scored.slice(0, Math.min(5, scored.length));
    return top[Math.floor(Math.random() * top.length)].r;
  }
  /* Merkt verwendete Rezepte, Küchen und frische Zutaten (für Reste-Verwertung) */
  function noteUse(ctx, r) {
    ctx.used.add(r.id); ctx.usedCuisine[r.cu] = (ctx.usedCuisine[r.cu] || 0) + 1;
    for (const [k] of r.i) { const pi = packInfo(k); if (pi.hb < 14 && !pi.vr) ctx.fresh[k] = (ctx.fresh[k] || 0) + 1; }
    const mp = mainProtein(r); if (mp) ctx.prot[mp] = (ctx.prot[mp] || 0) + 1;
  }
  /* Hauptproteinquelle eines Rezepts (für Abwechslung: nicht jeden Tag Hähnchen) */
  function mainProtein(r) { let best = null, bp = 0; for (const [k, g] of r.i) { const ing = ING[k]; if (!ing) continue; const p = ing.p * g / 100; if (p > bp) { bp = p; best = k; } } return best && ING[best].cat === 'fleisch' || best && /tofu|tempeh|linsen|bohnen|kichererbsen|ei$/.test(best) ? best.replace(/schenkel|keule/, 'brust') : null; }
  function makeCtx(p) {
    const ctx = { used: new Set(), usedCuisine: {}, prevCuisine: null, mealsInWeek: 0, fresh: {}, prot: {} };
    ctx.mealsInWeek = Math.max(1, futureMealsCount());
    for (const sk in p.slots) { const r = R[p.slots[sk].r]; if (r) noteUse(ctx, r); }
    return ctx;
  }
  function generateWeek(keepLocked) {
    const p = plan();
    const kept = {};
    for (const sk in p.slots) if ((keepLocked && p.slots[sk].lock) || isPast(+sk.split('|')[0])) kept[sk] = p.slots[sk];
    p.slots = kept;
    const ctx = makeCtx(p);
    for (let d = 0; d < 7; d++) {
      if (isPast(d)) continue; // nie in der Vergangenheit planen
      for (const m of mealsOf(d)) {
        const sk = slotKey(d, m);
        if (p.slots[sk]) continue;
        const r = pickFor(m, ctx);
        if (!r) continue;
        p.slots[sk] = { r: r.id, lock: false };
        noteUse(ctx, r);
        if (m === 'abend' || m === 'mittag') ctx.prevCuisine = r.cu;
      }
    }
    // Budget einhalten: teuerste, nicht fixierte Gerichte durch günstigere ersetzen
    for (let guard = 0; guard < 25 && weekStats().cost > S.budget; guard++) {
      const open = Object.keys(p.slots).filter(sk => !p.slots[sk].lock).sort((a, b) => costFor(R[p.slots[b].r]) - costFor(R[p.slots[a].r]));
      let improved = false;
      for (const sk of open) {
        const cur = R[p.slots[sk].r], meal = sk.split('|')[1];
        const cheaper = RECIPES.filter(r => eligible(r, meal) && !ctx.used.has(r.id) && costFor(r) < costFor(cur) * 0.85)
          .sort((a, b) => scoreRecipe(b, ctx) - scoreRecipe(a, ctx))[0];
        if (cheaper) { ctx.used.delete(cur.id); ctx.used.add(cheaper.id); p.slots[sk].r = cheaper.id; improved = true; break; }
      }
      if (!improved) break;
    }
    p.shop = {};
    save();
  }
  function swapSlot(sk) {
    const p = plan(); const cur = p.slots[sk]; const meal = sk.split('|')[1];
    const ctx = makeCtx(p);
    const r = pickFor(meal, ctx, cur ? [cur.r] : []);
    if (!r) { toast('Keine passende Alternative gefunden'); return; }
    p.slots[sk] = { r: r.id, lock: false };
    save(); renderPlan(); toast('Getauscht: ' + r.n);
  }

  /* ================= SuPER Health Verknüpfung ================= */
  function trackerData() { return lsGet('vf4', null); }
  function trackerUrl() {
    if (S.trackerUrl) return S.trackerUrl;
    if (/su-per-health\.vercel\.app$|paulper\.com$|^localhost$/.test(location.hostname)) return '/tracking';
    return TRACKER_DEFAULT;
  }
  function rechnerUrl() { const t = trackerUrl(); return t.charAt(0) === '/' ? '/#/app' : t.replace(/\/(tracking|tracker)\/?(#.*)?$/, '') + '/#/app'; }
  function healthLinks() {
    return '<div class="sh-links"><span>SuPER Health</span><a href="' + esc(rechnerUrl()) + '">⚙️ Ziele &amp; Rechner</a><a href="' + esc(trackerUrl()) + '">🔥 Kalorien-Tracker</a></div>';
  }
  function importGoalsFromTracker(silent) {
    const d = trackerData();
    if (!d || !d.goals) { if (!silent) toast('Keine SuPER-Health-Daten auf diesem Gerät gefunden'); return false; }
    S.goals = { k: r0(d.goals.k) || S.goals.k, p: r0(d.goals.p) || S.goals.p, c: r0(d.goals.c) || S.goals.c, f: r0(d.goals.f) || S.goals.f, src: 'superhealth' };
    if (!S.name && d.prof && d.prof.name && d.prof.name !== 'Alex') S.name = d.prof.name;
    save();
    if (!silent) toast('Ziele aus SuPER Health übernommen ✓');
    return true;
  }
  /* Mahlzeit an den Tracker übergeben.
   * 1) Gemeinsamer Speicher (gleiche Domain): Eintrag in die Warteschlange 'kueche2track'; der Tracker übernimmt sie beim Öffnen.
   * 2) Andere Domain: Link mit #meals=<base64> öffnet den Tracker und importiert direkt. */
  function trackEntries(entries) {
    const q = lsGet(TRACK_QUEUE, []);
    const items = entries.map(e => Object.assign({ id: uid(), ts: Date.now() }, e));
    q.push(...items);
    lsSet(TRACK_QUEUE, q.slice(-200));
    S.tracked.unshift(...items.map(i => ({ id: i.id, date: i.date, n: i.entry.n, k: i.entry.k, p: i.entry.p, ts: i.ts })));
    S.tracked = S.tracked.slice(0, 100);
    save();
    return items;
  }
  function trackerLink(items) {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(items.map(i => ({ id: i.id, date: i.date, meal: i.meal, recipe: i.recipe, entry: i.entry }))))));
    return trackerUrl() + '#meals=' + encodeURIComponent(payload);
  }
  function entryFor(r, portionType, dateKey, mealType) {
    const f = MEMBER_TYPES[portionType || 'erwachsen'].f;
    const n = nutriFor(r, f);
    return {
      date: dateKey, meal: mealType || r.m[0], recipe: r.id,
      entry: { n: r.n + (portionType && portionType !== 'erwachsen' ? ' (' + MEMBER_TYPES[portionType].n + ')' : ''), e: MEALS[mealType || r.m[0]].e, a: 1, u: 'Portion', k: r0(n.k), p: +n.p.toFixed(1), c: +n.c.toFixed(1), f: +n.f.toFixed(1), fi: +n.fi.toFixed(1), su: +n.su.toFixed(1), sa: +n.sa.toFixed(2), src: 'SuPER Küche' },
    };
  }

  /* ================= Router & Navigation ================= */
  const PAGES = [
    { id: 'plan', n: 'Plan', i: 'plan' },
    { id: 'rezepte', n: 'Rezepte', i: 'rezepte' },
    { id: 'einkauf', n: 'Einkauf', i: 'einkauf' },
    { id: 'einstellungen', n: 'Einstellungen', i: 'einstellungen' },
    { id: 'konto', n: 'Konto', i: 'konto' },
  ];
  function renderNav() {
    const html = PAGES.map(p => '<a href="#' + p.id + '" data-p="' + p.id + '">' + ic(p.i) + '<span>' + p.n + '</span></a>').join('');
    $('#bnav').innerHTML = html; $('#topnav').innerHTML = html;
  }
  let current = 'plan';
  function route() {
    const h = (location.hash || '#plan').slice(1);
    const [page, arg] = h.split('/');
    if (page === 'rezept' && arg && R[arg]) { if (!$('#pg-' + current).classList.contains('act')) show(current); openRecipe(arg); return; }
    show(PAGES.some(p => p.id === page) ? page : 'plan');
  }
  function show(id) {
    current = id;
    $$('.page').forEach(p => p.classList.toggle('act', p.id === 'pg-' + id));
    $$('#bnav a, #topnav a').forEach(a => a.classList.toggle('act', a.dataset.p === id));
    ({ plan: renderPlan, rezepte: renderRecipes, einkauf: renderShop, einstellungen: renderSettings, konto: renderAccount })[id]();
    window.scrollTo({ top: 0 });
  }

  /* ================= Toast & Sheet ================= */
  let toastT;
  function toast(msg, linkHtml) {
    const t = $('#toast'); t.innerHTML = '<span>' + esc(msg) + '</span>' + (linkHtml || '');
    t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), linkHtml ? 6000 : 2600);
  }
  let sheetOnClose = null;
  function openSheet(html, onClose) {
    $('#sheet').innerHTML = '<button class="sheet-close" data-act="close" aria-label="Schließen">' + ic('x') + '</button>' + html;
    $('#sheet').scrollTop = 0;
    $('#overlay').classList.add('open'); document.body.style.overflow = 'hidden';
    sheetOnClose = onClose || null;
  }
  function closeSheet() {
    $('#overlay').classList.remove('open'); document.body.style.overflow = '';
    if (location.hash.startsWith('#rezept/')) history.replaceState(null, '', '#' + current);
    const cb = sheetOnClose; sheetOnClose = null; if (cb) cb();
  }

  /* ================= Bausteine ================= */
  function chipsFor(r, max) {
    const order = ['dessert', 'protein', 'leicht', 'comfort', 'familie', 'schnell', 'mealprep'];
    return order.filter(s => r._styles.indexOf(s) >= 0).slice(0, max || 2).map(s => '<span class="chip ' + s + '">' + (STYLES[s].n.replace(' (≤ 20 Min.)', '')) + '</span>').join('');
  }
  function imgTag(r, cls) { return '<img class="' + (cls || '') + '" src="' + r._img + '" alt="' + esc(r.n) + '" loading="lazy" onerror="this.onerror=null;this.src=\'img/placeholder.svg\'">'; }
  /* Glutenfrei-Hinweise zu einer Zutat (Markenempfehlung bzw. Kennzeichnung prüfen) */
  function gfHint(key, small, store) {
    if (!S.diet.gf) return '';
    const tag = small ? 'small' : 'span';
    const b = gfBrandText(key, store || S.market), note = GF_BRANDS[key] && GF_BRANDS[key].note;
    if (b) return '<' + tag + ' class="hint" style="color:var(--acc2);font-weight:600">🌾 z. B. ' + esc(b) + '</' + tag + '>' + (note && !small ? '<span class="hint" style="color:var(--t3);font-weight:400">' + esc(note) + '</span>' : '');
    if (GF_CHECK.has(key)) return '<' + tag + ' class="hint" style="color:#8A4F12;font-weight:600">🌾 auf „glutenfrei“ achten</' + tag + '>';
    return '';
  }
  function recipeCard(r) {
    const n = nutriFor(r), fav = S.favorites.indexOf(r.id) >= 0;
    return '<article class="card rcard" data-open="' + r.id + '"><div class="imgw">' + imgTag(r) +
      '<button class="fav ' + (fav ? 'on' : '') + '" data-fav="' + r.id + '" aria-label="Favorit">' + ic('heart') + '</button>' +
      '<span class="kc">' + r0(n.k) + ' kcal · ' + r0(n.p) + ' g P</span></div>' +
      '<div class="b"><h3>' + esc(r.n) + '</h3><div class="chips">' + chipsFor(r, 2) + '</div>' +
      '<div class="meta"><span>' + ic('clock') + r.t + 'm</span><span class="sep"></span><span>' + eur(costFor(r) / servings()) + '/P.</span>' + (r.baby >= 2 ? '<span class="sep"></span><span title="Baby-geeignet">👶</span>' : '') + (S.thermomix && r.tm && r.tm.fit === 2 ? '<span class="sep"></span><span class="tm-badge" title="Komplett im Thermomix">TM</span>' : '') + (S.diet.gf ? '<span class="sep"></span><span class="gf-badge" title="' + (r._diet.gf === 2 ? 'Von Natur aus glutenfrei' : 'Glutenfrei mit Austauschprodukt') + '">' + (r._diet.gf === 2 ? 'GF' : 'GF*') + '</span>' : '') + '</div></div></article>';
  }

  /* ================= Seite: Plan ================= */
  function renderPlan() {
    const p = plan(), st = weekStats(), mk = MARKETS[S.market] || MARKETS.kaufland;
    const shopList = buildShop(), done = shopList.filter(i => p.shop[i.tk]).length;
    const isThisWeek = todayIndex() >= 0 && todayIndex() <= 6;
    const todayIdx = isThisWeek ? todayIndex() : -1, tIdx = todayIndex();
    const hello = (() => { const h = new Date().getHours(); return h < 11 ? 'Guten Morgen' : h < 17 ? 'Guten Tag' : 'Guten Abend'; })();
    const wEnd = addDays(weekStart, 6);
    const fmt = d => d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
    let html = '<div class="greet"><div class="eyebrow">' + hello + '</div><h1>' + (S.name ? 'Chefkoch ' + esc(S.name) + '!' : 'Deine Familienküche') + '</h1>' +
      '<span class="pill"><span class="dot" style="color:' + mk.c + '">🛒</span>geplant für ' + mk.n + ' · ' + persons() + ' Pers.</span>' + healthLinks() + '</div>' +
      rangeNavHtml();

    const n = Object.keys(p.slots).length;
    if (tIdx === 7) html += '<div class="diet-row" style="margin-top:12px;background:var(--soft)">🕘 <span>Diese Woche liegt in der Vergangenheit – nur zur Ansicht. <a href="#" data-act="thisweek" style="color:var(--acc2);font-weight:700">Zur aktuellen Woche</a></span></div>';
    else if (false) html += '<div class="diet-row" style="margin-top:12px;background:var(--lime-g);border-color:transparent">📅 <span>Nur noch ' + (7 - tIdx) + ' Tag' + (7 - tIdx > 1 ? 'e' : '') + ' in dieser Woche. <a href="#" data-act="wnext" style="color:var(--acc2);font-weight:700">Nächste Woche planen →</a></span></div>';
    if (!n && tIdx === 7) { $('#pg-plan').innerHTML = html + '<div class="card empty" style="margin-top:16px"><div class="big">🕘</div>Für diese vergangene Woche gibt es keinen Plan.</div>'; return; }
    if (!n) {
      html += '<div class="card empty" style="margin-top:16px"><div class="big">🗓️</div><h2 style="font-size:22px;color:var(--t1)">Noch kein Plan für diese Woche</h2><p style="margin:8px 0 18px">Wir stellen dir passende, proteinreiche Familiengerichte zusammen – abgestimmt auf Haushalt, Budget und Ernährung.</p><button class="btn btn-lime" data-act="generate">' + ic('spark') + 'Wochenplan erstellen</button></div>';
      $('#pg-plan').innerHTML = html; return;
    }
    const pct = Math.min(100, st.cost / S.budget * 100);
    html += '<div class="stats">' +
      '<div class="card stat"><div class="eyebrow">Gesch. Kosten</div><div class="v">' + eur(st.cost) + ' <small>/ ' + eur0(S.budget) + '</small></div><div class="bar"><i class="' + (st.cost > S.budget ? 'over' : '') + '" style="width:' + pct + '%"></i></div></div>' +
      '<div class="stat blue" data-go="einkauf"><div class="eyebrow">Tippen zum Ansehen</div><div class="t">Einkaufsplan</div><div class="muted" style="font-size:13.5px;font-weight:600">' + done + '/' + shopList.length + ' erledigt</div><div class="bar"><i style="width:' + (shopList.length ? done / shopList.length * 100 : 0) + '%"></i></div></div>' +
      '<div class="card stat wide"><div><div class="eyebrow">Ø pro Erwachsenem & Kochtag</div><div class="muted" style="font-size:12.5px;margin-top:2px">Ziel: ' + S.goals.k + ' kcal · ' + S.goals.p + ' g Protein / Tag</div></div><div class="macro-mini">' +
      '<div><b>' + r0(st.avg.k) + '</b><span>kcal</span></div><div><b style="color:#C2477A">' + r0(st.avg.p) + 'g</b><span>Protein</span></div><div><b style="color:#B7801F">' + r0(st.avg.c) + 'g</b><span>Kohlenh.</span></div><div><b style="color:#2F6FB0">' + r0(st.avg.f) + 'g</b><span>Fett</span></div></div></div></div>';
    html += '<div class="plan-actions"><button class="btn btn-sec btn-sm" data-act="regen">' + ic('refresh') + 'Neu mischen</button><button class="btn btn-sec btn-sm" data-act="trackweek">' + ic('send') + 'Woche an SuPER Health</button><button class="btn btn-ghost btn-sm" data-act="clearweek">' + ic('trash') + 'Leeren</button></div>';

    const meals = activeMeals();
    for (let d = 0; d < 7; d++) {
      const slotsOfDay = MEAL_ORDER.filter(m => p.slots[slotKey(d, m)]);
      if (!S.days[wdOf(d)] && !slotsOfDay.length) continue;
      const past = isPast(d);
      if (past && !slotsOfDay.length) continue; // vergangene leere Tage ausblenden
      const dayMeals = MEAL_ORDER.filter(m => mealsOf(d).indexOf(m) >= 0 || p.slots[slotKey(d, m)]);
      let dk = 0, dp = 0;
      let inner = '';
      for (const m of dayMeals) {
        const sk = slotKey(d, m), sl = p.slots[sk];
        if (!sl || !R[sl.r]) { if (past) continue; inner += '<div class="meal-empty" data-addslot="' + sk + '">' + ic('plus') + MEALS[m].n + ' hinzufügen</div>'; continue; }
        const r = R[sl.r], nu = nutriFor(r); dk += nu.k; dp += nu.p;
        inner += '<div class="meal ' + (sl.lock ? 'locked' : '') + '" data-open="' + r.id + '" data-slot="' + sk + '">' + imgTag(r, 'ph') +
          '<div class="info">' + (dayMeals.length > 1 ? '<div class="mt">' + MEALS[m].n + '</div>' : '') + '<div class="nm">' + esc(r.n) + '</div><div class="chips">' + chipsFor(r, 1) + (adapted(r).swaps.length ? '<span class="chip diet">angepasst</span>' : '') + '</div>' +
          '<div class="meta"><span>' + ic('clock') + r.t + 'm</span><span class="sep"></span><span>' + ic('user') + persons() + '</span><span class="sep"></span><span>' + eur(costFor(r)) + '</span><span class="sep"></span><span class="mono" style="font-size:12.5px">' + r0(nu.k) + ' kcal · ' + r0(nu.p) + 'g P</span></div>' +
          (past ? '' : '<div class="acts no-print">') + (past ? '<!--' : '') + '<button class="icon-btn" data-swap="' + sk + '" title="Tauschen" aria-label="Tauschen">' + ic('swap') + '</button><button class="icon-btn ' + (sl.lock ? 'on' : '') + '" data-lock="' + sk + '" title="Fixieren" aria-label="Fixieren">' + ic(sl.lock ? 'lock' : 'unlock') + '</button><button class="icon-btn" data-del="' + sk + '" title="Entfernen" aria-label="Entfernen">' + ic('x') + '</button>' + (past ? '-->' : '</div>') + '</div></div>';
      }
      const dd = addDays(weekStart, d);
      html += '<div class="day' + (past ? ' past' : '') + '"><div class="day-tag"><span class="' + (d === todayIdx ? 'today' : '') + '">' + (d === todayIdx ? 'Heute · ' : '') + dayName(d) + ' · ' + dd.getDate() + '.' + (dd.getMonth() + 1) + '.' + (past ? ' · vorbei' : '') + '</span></div><div class="card day-body">' + inner +
        (dk ? '<div class="day-sum">' + (dayMeals.length > 1 ? '<span>Σ ' + r0(dk) + ' kcal · ' + r0(dp) + ' g P</span>' : '') + '<span class="mbar" title="Anteil am Tagesziel Protein"><i style="width:' + Math.min(100, dp / S.goals.p * 100) + '%"></i></span><span>' + r0(dp / S.goals.p * 100) + '% Protein-Ziel</span></div>' : '') + '</div></div>';
    }
    $('#pg-plan').innerHTML = html;
  }

  /* ================= Seite: Rezepte ================= */
  const RF = { q: '', meal: '', style: '', cu: '', fav: false, baby: false, tm: false, dt: [], dietOnly: true, limit: 48 };
  function filteredRecipes() {
    const q = RF.q.trim().toLowerCase();
    return RECIPES.filter(r => {
      if (q && r._search.indexOf(q) < 0) return false;
      if (RF.meal && r.m.indexOf(RF.meal) < 0) return false;
      if (RF.style && r._styles.indexOf(RF.style) < 0) return false;
      if (RF.cu && r.cu !== RF.cu) return false;
      if (RF.fav && S.favorites.indexOf(r.id) < 0) return false;
      if (RF.baby && r.baby < 2) return false;
      if (RF.tm && !(r.tm && r.tm.fit >= 2)) return false;
      for (const dd of RF.dt) if (!S.diet[dd] && r._diet[dd] !== 2) return false;
      if (RF.dietOnly && !eligible(r)) return false;
      return true;
    }).sort((a, b) => (S.favorites.indexOf(b.id) >= 0) - (S.favorites.indexOf(a.id) >= 0) || nutriFor(b).p / nutriFor(b).k - nutriFor(a).p / nutriFor(a).k);
  }
  let lastRF = '';
  function renderRecipes() {
    const sig = JSON.stringify([RF.q, RF.meal, RF.style, RF.cu, RF.fav, RF.baby, RF.tm, RF.dt, RF.dietOnly]); if (sig !== lastRF) { RF.limit = 48; lastRF = sig; }
    const activeDiets = Object.keys(S.diet).filter(d => S.diet[d]).map(d => Core.DIETS[d].n);
    let html = '<div class="page-head"><div class="eyebrow">' + RECIPES.length + ' Familienrezepte</div><h1>Gerichte</h1></div>' +
      '<div class="search">' + ic('search') + '<input class="input" id="rq" placeholder="Gerichte oder Zutaten suchen" value="' + esc(RF.q) + '" autocomplete="off"></div>';
    const browsing = !RF.q && !RF.meal && !RF.style && !RF.cu && !RF.fav && !RF.baby && !RF.tm && !RF.dt.length;
    if (browsing) {
      html += '<div class="section-t"><h2>Deine Stile</h2><a class="link" href="#einstellungen">Anpassen ' + ic('right') + '</a></div><div class="styles-grid">' +
        Object.keys(STYLES).map(s => '<button class="style-card ' + (S.styles.indexOf(s) >= 0 ? 'on' : '') + '" data-style="' + s + '"><span class="e">' + STYLES[s].e + '</span>' + STYLES[s].n + '</button>').join('') + '</div>';
      html += '<div class="section-t"><h2>Nach Küche entdecken</h2></div><div class="cuisine-grid">';
      for (const c in CUISINES) {
        const list = RECIPES.filter(r => r.cu === c); if (!list.length) continue;
        const pic = R[CUISINES[c].pic] || list[0];
        html += '<button class="card cuisine" data-cu="' + c + '">' + imgTag(pic) + '<div class="b"><h3>' + CUISINES[c].n + '</h3><p>' + list.length + ' Gerichte · ' + CUISINES[c].d + '</p></div></button>';
      }
      html += '</div><div class="section-t"><h2>Alle Gerichte</h2></div>';
    } else {
      html += '<div style="height:14px"></div>';
    }
    html += '<div class="filter-row">' +
      ['', ...MEAL_ORDER].map(m => '<button class="fchip ' + (RF.meal === m ? 'on' : '') + '" data-fmeal="' + m + '">' + (m ? MEALS[m].e + ' ' + MEALS[m].n : 'Alle') + '</button>').join('') +
      '<button class="fchip ' + (RF.fav ? 'on' : '') + '" data-ffav>❤️ Favoriten</button><button class="fchip ' + (RF.baby ? 'on' : '') + '" data-fbaby>👶 Baby-tauglich</button><button class="fchip ' + (RF.tm ? 'on' : '') + '" data-ftm>⚙️ Thermomix</button>' +
      Object.keys(QF_DIETS).filter(dd => !S.diet[dd]).map(dd => '<button class="fchip ' + (RF.dt.indexOf(dd) >= 0 ? 'on' : '') + '" data-fdiet="' + dd + '">' + (dd === 'veg' ? '🥦 ' : '🌾 ') + QF_DIETS[dd] + '</button>').join('') +
      (RF.style ? '<button class="fchip on" data-fstyle-clear>' + STYLES[RF.style].e + ' ' + STYLES[RF.style].n + ' ✕</button>' : '') +
      (RF.cu ? '<button class="fchip on" data-fcu-clear>' + CUISINES[RF.cu].n + ' ✕</button>' : '') + '</div>';
    const list = filteredRecipes();
    html += '<div class="count-l">' + list.length + ' Gerichte' + (activeDiets.length ? ' · passend für <b>' + activeDiets.join(', ') + '</b>' : '') +
      ' · <a href="#" data-act="togglediet" style="color:var(--acc2)">' + (RF.dietOnly ? 'alle zeigen' : 'nur passende') + '</a></div>';
    html += list.length ? '<div class="rgrid">' + list.slice(0, RF.limit).map(recipeCard).join('') + '</div>' + (list.length > RF.limit ? '<div style="text-align:center;margin:20px 0"><button class="btn btn-sec" data-act="moreRecipes">Weitere ' + Math.min(48, list.length - RF.limit) + ' von ' + (list.length - RF.limit) + ' Gerichten anzeigen</button></div>' : '') : '<div class="empty"><div class="big">🔍</div>Keine Gerichte gefunden.</div>';
    $('#pg-rezepte').innerHTML = html;
    const inp = $('#rq');
    inp.addEventListener('input', () => { RF.q = inp.value; const pos = inp.selectionStart; renderRecipes(); const n = $('#rq'); n.focus(); n.setSelectionRange(pos, pos); });
  }

  /* ================= Rezept-Detail ================= */
  let detail = { id: null, tab: 'naehr', portion: 'erwachsen', serv: null, cook: 'klassisch' };
  function openRecipe(id) {
    detail = { id, tab: 'naehr', portion: 'erwachsen', serv: null, cook: S.thermomix && R[id] && R[id].tm ? 'tm' : 'klassisch' };
    renderRecipeSheet();
    if (location.hash !== '#rezept/' + id) history.replaceState(null, '', '#rezept/' + id);
  }
  function ringSvg(n) {
    const tot = n.p * 4 + n.c * 4 + n.f * 9 || 1, C = 2 * Math.PI * 42;
    const seg = [[n.p * 4 / tot, '#D9487A'], [n.c * 4 / tot, '#E3A43B'], [n.f * 9 / tot, '#3F8FD0']];
    let off = 0, s = '';
    for (const [f, col] of seg) { s += '<circle cx="50" cy="50" r="42" fill="none" stroke="' + col + '" stroke-width="11" stroke-dasharray="' + (f * C - 1.5) + ' ' + C + '" stroke-dashoffset="' + (-off * C) + '"/>'; off += f; }
    return '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#EDF2EE" stroke-width="11"/>' + s + '</svg>';
  }
  function fmtQty(key, g) {
    const ing = ING[key];
    const unit = LIQUIDS.has(key) ? 'ml' : 'g';
    const grams = g < 10 ? r1(g) : g < 100 ? Math.round(g) : Math.round(g / 5) * 5;
    if (ing.u && g >= ing.u[0] * 0.4) {
      const n = g / ing.u[0], nr = n < 3 ? Math.round(n * 2) / 2 : Math.round(n);
      return (nr + '').replace('.5', '½').replace(/^0½/, '½') + ' ' + ing.u[1] + ' <span class="muted">(' + grams + ' ' + unit + ')</span>';
    }
    if (key === 'salz' || key === 'gewuerze' || key === 'cajun' || key === 'currypulver' || key === 'vanille') return g < 3 ? 'Prise / nach Geschmack' : grams + ' g';
    if (g >= 1000) return r1(g / 1000) + (unit === 'ml' ? ' l' : ' kg');
    return grams + ' ' + unit;
  }
  function renderRecipeSheet() {
    const r = R[detail.id]; if (!r) return;
    const a = adapted(r), serv = detail.serv || servings();
    const pf = MEMBER_TYPES[detail.portion].f, n = Core.nutrition(a.items, pf);
    const fav = S.favorites.indexOf(r.id) >= 0;
    const cred = (typeof IMAGE_CREDITS !== 'undefined' && IMAGE_CREDITS[r.id]) || null;
    const ds = r._diet, warns = Core.babyWarnings(a.items), alls = Core.allergens(a.items);
    let h = '<img class="hero" src="' + r._img + '" alt="' + esc(r.n) + '" onerror="this.style.display=\'none\'">' +
      (cred ? '<div class="credit">Foto: ' + esc(cred.artist || 'Wikimedia Commons') + ' · <a href="' + esc(cred.page) + '" target="_blank" rel="noopener">' + esc(cred.license || 'Lizenz') + '</a> · Symbolbild</div>' : '') +
      '<div class="sheet-pad"><div class="r-title"><div><div class="eyebrow">' + (CUISINES[r.cu] || {}).n + ' · ' + r.m.map(m => MEALS[m].n).join(' / ') + '</div><h2 style="margin-top:4px">' + esc(r.n) + '</h2></div>' +
      '<button class="icon-btn ' + (fav ? 'on' : '') + '" data-fav="' + r.id + '" aria-label="Favorit" style="' + (fav ? 'color:#D9365E' : '') + '">' + ic('heart') + '</button></div>' +
      '<div class="r-meta">' + (S.diet.gf ? '<span class="chip diet">🌾 ' + (r._diet.gf === 2 ? 'Von Natur aus glutenfrei' : 'Glutenfrei angepasst') + '</span>' : '') + chipsFor(r, 4) + '<span class="chip ghost">' + ic('clock') + ' ' + r.t + ' Min.</span><span class="chip ghost">' + ['', 'Einfach', 'Mittel', 'Anspruchsvoll'][r.d] + '</span><span class="chip ghost">' + eur(costFor(r) / servings()) + ' / Portion</span></div>';
    const chk = S.diet.gf ? a.items.filter(it => GF_CHECK.has(it.key)).map(it => it.ing.n) : [];
    if (chk.length) h += '<div class="diet-row" style="background:var(--orag);border-color:transparent;margin-bottom:8px">🌾 <span><b>Glutenfrei-Check:</b> bei ' + esc(chk.join(', ')) + ' auf „glutenfrei“ bzw. die durchgestrichene Ähre achten.</span></div>';
    if (a.swaps.length) h += '<div class="diet-row" style="background:var(--accg);border-color:transparent">✨ <span><b>Automatisch angepasst</b> für ' + Object.keys(S.diet).filter(d => S.diet[d]).map(d => Core.DIETS[d].n).join(', ') + ': ' + a.swaps.map(s => esc(s.from) + ' → ' + esc(s.to)).join(' · ') + '</span></div>';
    if (!a.ok) h += '<div class="diet-row" style="background:var(--orag);border-color:transparent">⚠️ <span>Nicht passend für deine Ernährung: ' + esc(a.blockers.join(', ')) + '</span></div>';
    h += '<div class="tabs">' + [['naehr', 'Nährwerte'], ['zutaten', 'Zutaten'], ['zubereitung', 'Zubereitung'], ['familie', 'Baby & Kind']].map(t => '<button class="' + (detail.tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';

    if (detail.tab === 'naehr') {
      h += '<div class="portion-sw">' + Object.keys(MEMBER_TYPES).map(t => '<button class="' + (detail.portion === t ? 'on' : '') + '" data-portion="' + t + '">' + MEMBER_TYPES[t].e + ' ' + MEMBER_TYPES[t].n + '</button>').join('') + '</div>';
      const pk = n.p * 4 / (n.k || 1) * 100;
      h += '<div class="card nutri"><div class="nutri-top"><div class="ring">' + ringSvg(n) + '<div class="c"><div><b>' + r0(n.k) + '</b><span>kcal</span></div></div></div><div class="macros">' +
        [['Protein', n.p, 'p', 60 * pf], ['Kohlenhydrate', n.c, 'c', 100 * pf], ['Fett', n.f, 'f', 40 * pf]].map(m => '<div class="mrow"><span>' + m[0] + '</span><span class="mb"><i class="dot-' + m[2] + '" style="width:' + Math.min(100, m[1] / m[3] * 100) + '%"></i></span><span class="val">' + r1(m[1]) + ' g</span></div>').join('') +
        '</div></div><div class="micro"><div><b>' + r1(n.fi) + 'g</b><span>Ballaststoffe</span></div><div><b>' + r1(n.su) + 'g</b><span>Zucker</span></div><div><b>' + r1(n.sa) + 'g</b><span>Salz</span></div><div><b>' + r0(pk) + '%</b><span>kcal aus Protein</span></div></div>' +
        '<p class="muted" style="font-size:12px;margin-top:12px">Pro Portion „' + MEMBER_TYPES[detail.portion].n + '“ (' + r0(n.g) + ' g Zutaten). ' + (detail.portion === 'erwachsen' ? 'Das sind ' + r0(n.k / S.goals.k * 100) + ' % deines Kalorien- und ' + r0(n.p / S.goals.p * 100) + ' % deines Proteinziels.' : 'Richtwert – Kinder essen nach Hunger.') + ' Berechnet aus der Zutaten-Datenbank (BLS/USDA-Richtwerte).</p></div>';
      h += '<div class="section-t" style="margin-top:20px"><h2 style="font-size:18px">Ernährungsformen</h2></div><div class="diet-box">' +
        ['gf', 'lf', 'fm', 'veg'].map(d => '<div class="diet-row"><span>' + Core.DIETS[d].n + '</span><span class="st st-' + ds[d] + '">' + ['✕ nicht möglich', '✓ mit Austausch', '✓ von Natur aus'][ds[d]] + '</span></div>').join('') + '</div>';
      if (alls.length) h += '<p class="muted" style="font-size:13px">Allergene: ' + alls.map(x => ALLERGENS[x]).join(', ') + '</p>';
    }
    if (detail.tab === 'zutaten') {
      h += '<div class="card" style="padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><div><b>Portionen</b><div class="muted" style="font-size:12.5px">Haushalt = ' + r1(servings()) + ' Erwachsenen-Portionen</div></div><div class="stepper sm"><button data-serv="-0.5">−</button><b>' + r1(serv) + '</b><button data-serv="0.5">+</button></div></div>';
      h += '<ul class="ing-list">' + a.items.map(it => '<li><span>' + esc(it.ing.n) + (it.swappedFrom ? '<span class="hint">statt ' + esc(it.swappedFrom) + '</span>' : '') + gfHint(it.key) + '</span><span class="q">' + fmtQty(it.key, it.g * serv) + '</span></li>').join('') + '</ul>';
      h += '<p class="muted" style="font-size:12.5px;margin-top:10px">Geschätzte Kosten: ' + eur(Core.nutrition(a.items, serv).cost * marketF()) + ' bei ' + (MARKETS[S.market] || {}).n + '.</p>';
    }
    if (detail.tab === 'zubereitung') {
      if (r.tm) h += '<div class="portion-sw"><button class="' + (detail.cook === 'klassisch' ? 'on' : '') + '" data-cook="klassisch">🍳 Klassisch</button><button class="' + (detail.cook === 'tm' ? 'on' : '') + '" data-cook="tm">⚙️ Thermomix TM6 / TM7</button></div>';
      if (detail.cook === 'tm' && r.tm) {
        h += '<div class="diet-row" style="margin-bottom:10px;background:' + (r.tm.fit === 2 ? 'var(--accg)' : 'var(--orag)') + ';border-color:transparent">' + (r.tm.fit === 2 ? '✓ Komplett im Thermomix' : r.tm.fit === 1 ? '◐ Teilweise im Thermomix' : '○ Thermomix nur für Teilschritte') + (r.tm.note ? ' · ' + esc(r.tm.note) : '') + '</div>';
        h += '<ol class="steps tm-steps">' + r.tm.steps.map(st => '<li><span>' + esc(st[0]) + (st[1] || st[2] || st[3] || st[4] ? '<span class="tm-set">' + [st[1] ? '⏱ ' + esc(st[1]) : '', st[2] ? '🌡 ' + esc(st[2]) : '', st[4] === 'Linkslauf' ? '↺ Linkslauf' : st[4] ? '◆ ' + esc(st[4]) : '', st[3] ? '⚙ ' + esc(st[3]) : ''].filter(Boolean).map(x => '<b>' + x + '</b>').join('') + '</span>' : '') + '</span></li>').join('') + '</ol>';
        h += '<div class="plan-actions" style="justify-content:flex-start"><button class="btn btn-sec btn-sm" data-act="cookidoo">' + ic('copy') + 'Für Cookidoo kopieren</button><a class="btn btn-sec btn-sm" href="' + cookidooUrl(r) + '" target="_blank" rel="noopener">' + ic('search') + 'Ähnliche Rezepte auf Cookidoo</a></div>' +
          '<p class="muted" style="font-size:12px;margin-top:8px">Einstellungen für ca. 4 Portionen (Mixtopf max. 2,2 l). „Ähnliche Rezepte auf Cookidoo“ öffnet passende Original-Thermomix-Rezepte (Cookidoo-Abo nötig). Eigene Fassung: kopieren und in Cookidoo unter „Meine Rezepte“ → „Rezept erstellen“ einfügen. Mit dem TM5 funktionieren die Werte ebenso – nur den Modus „Anbraten“ gibt es dort nicht (stattdessen Varoma-Temperatur, Deckel ohne Messbecher).</p>';
      } else {
        h += '<ol class="steps">' + r.s.map(s => '<li><span>' + esc(s) + '</span></li>').join('') + '</ol>';
        h += '<div class="plan-actions" style="justify-content:flex-start"><a class="btn btn-sec btn-sm" href="' + cookidooUrl(r) + '" target="_blank" rel="noopener">' + ic('search') + 'Ähnliche Thermomix-Rezepte auf Cookidoo</a></div>';
      }
    }
    if (detail.tab === 'familie') {
      h += '<div class="kid-box"><h3>👶 Für Baby & Kleinkind</h3><p>' + esc(r.kid) + '</p>' +
        '<p style="margin-top:10px;font-size:13px;color:var(--t2)"><b>Eignung:</b> ' + ['Eher nicht fürs Baby – für Kleinkinder mit Anpassung.', 'Mit kleinen Anpassungen gut für die ganze Familie.', 'Super familientauglich – ideal für Baby-led Weaning & Kleinkinder.'][r.baby] + '</p>' +
        (warns.length ? '<div class="warn-list">' + warns.map(w => '<div class="warn-item">⚠️<div><b>' + esc(w.t) + '</b>' + esc(w.d) + '</div></div>').join('') + '</div>' : '') + '</div>';
      const nb = Core.nutrition(a.items, MEMBER_TYPES.baby.f), nk = Core.nutrition(a.items, MEMBER_TYPES.kleinkind.f);
      h += '<div class="grid2"><div class="card" style="padding:14px"><div class="eyebrow">Baby-Portion</div><div class="mono" style="font-size:20px;margin-top:4px">' + r0(nb.k) + ' kcal</div><div class="muted" style="font-size:12.5px">' + r1(nb.p) + ' g Protein · ' + r0(nb.g) + ' g</div></div>' +
        '<div class="card" style="padding:14px"><div class="eyebrow">Kleinkind-Portion</div><div class="mono" style="font-size:20px;margin-top:4px">' + r0(nk.k) + ' kcal</div><div class="muted" style="font-size:12.5px">' + r1(nk.p) + ' g Protein · ' + r0(nk.g) + ' g</div></div></div>' +
        '<p class="muted" style="font-size:12px;margin-top:12px">Allgemeine Hinweise, kein Ersatz für ärztlichen Rat. Neue Lebensmittel einzeln einführen, Allergene früh und regelmäßig anbieten (nach Rücksprache mit der Kinderärztin/dem Kinderarzt).</p>';
    }
    h += '</div><div class="sticky-actions"><button class="btn btn-sec" data-act="addplan">' + ic('plus') + 'Zum Plan</button><button class="btn btn-sec" data-act="recipeshop">' + ic('einkauf') + 'Einkauf</button><button class="btn btn-pri" data-act="trackone">' + ic('send') + 'Tracken</button></div>';
    const keep = $('#overlay').classList.contains('open') ? $('#sheet').scrollTop : 0;
    openSheet(h, null);
    $('#sheet').scrollTop = keep;
  }

  /* Text zum Anlegen in Cookidoo („Meine Rezepte“ → „Rezept erstellen“) – Mengen für 4 Portionen */
  function cookidooUrl(r) { return 'https://cookidoo.de/search/de-DE?query=' + encodeURIComponent(r.ck || r.n.replace(/\(.*?\)/g, '').replace(/\b(Protein|High-Protein|leicht|light)[- ]?/gi, '').replace(/\s+/g, ' ').trim()); }
  function cookidooText(r) {
    const a = adapted(r), P = 4;
    const fmt = st => [st[1], st[2], st[4] === 'Linkslauf' ? 'Linkslauf' : st[4], st[3]].filter(Boolean).join(' / ');
    return r.n + '\n' + P + ' Portionen · ' + r.t + ' Min. · Thermomix TM6/TM7\n\nZUTATEN\n' +
      a.items.map(it => fmtQty(it.key, it.g * P).replace(/<[^>]+>/g, '') + ' ' + it.ing.n).join('\n') +
      '\n\nZUBEREITUNG\n' + r.tm.steps.map((st, i) => (i + 1) + '. ' + st[0] + (fmt(st) ? ' ' + fmt(st) + '.' : '')).join('\n') +
      (r.tm.note ? '\n\nHinweis: ' + r.tm.note : '') + '\n\nBaby & Kleinkind: ' + r.kid + '\n\nQuelle: SuPER Küche';
  }
  function pickSlotSheet(rid) {
    const r = R[rid];
    let h = '<div class="sheet-pad"><h2>Zum Wochenplan</h2><p class="muted" style="margin:6px 0 16px">„' + esc(r.n) + '“ – wähle Tag und Mahlzeit (' + (function () { const e = addDays(weekStart, 6); return weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + '–' + e.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }); })() + ').</p>';
    h += '<div class="field-l" style="font-size:15px">Mahlzeit</div><div class="pick-grid" id="pm">' + r.m.concat(MEAL_ORDER.filter(m => r.m.indexOf(m) < 0)).map((m, i) => '<button class="' + (i === 0 ? 'on' : '') + '" data-pm="' + m + '">' + MEALS[m].e + ' ' + MEALS[m].n + '</button>').join('') + '</div>';
    h += '<div class="field-l" style="font-size:15px;margin-top:16px">Tag</div><div class="pick-grid" id="pd">' + DAYS.map((d, i) => { const sl = plan().slots[slotKey(i, r.m[0])]; return '<button data-pd="' + i + '"' + (isPast(i) ? ' disabled style="opacity:.35" title="Tag ist vorbei"' : '') + '>' + dayName(i).slice(0, 2) + ' ' + addDays(weekStart, i).getDate() + '.' + (addDays(weekStart, i).getMonth() + 1) + '.' + (sl ? ' •' : '') + '</button>'; }).join('') + '</div>';
    h += '<p class="muted" style="font-size:12.5px;margin-top:10px">• = dort steht schon ein Gericht (wird ersetzt).</p></div>';
    openSheet(h);
    let meal = r.m[0];
    $$('#pm button').forEach(b => b.onclick = () => { meal = b.dataset.pm; $$('#pm button').forEach(x => x.classList.toggle('on', x === b)); });
    $$('#pd button:not([disabled])').forEach(b => b.onclick = () => {
      const d = +b.dataset.pd; plan().slots[slotKey(d, meal)] = { r: rid, lock: true };
      plan().shop = {}; save(); closeSheet(); toast(r.n + ' → ' + dayLabel(d) + ' (' + MEALS[meal].n + ') ✓'); if (current === 'plan') renderPlan();
    });
  }
  /* ---------- Schnellfilter (Gericht hinzufügen & Rezepte-Seite) ---------- */
  const QF_STYLES = ['protein', 'leicht', 'dessert', 'schnell', 'familie', 'comfort', 'mealprep'];
  const QF_DIETS = { gf: 'Glutenfrei', lf: 'Laktosefrei', fm: 'FODMAP-arm', veg: 'Vegetarisch' };
  function newFilter() { return { q: '', st: [], dt: [], pg: [], tm: false, fav: false, sort: 'protein' }; }
  /* Diät-Filter: ist die Ernährungsform in den Einstellungen aktiv, sind alle passenden Gerichte schon angepasst.
   * Sonst zeigt der Filter nur Gerichte, die von Natur aus passen (ohne Austausch). */
  function matchF(r, F) {
    if (F.q && r._search.indexOf(F.q.trim().toLowerCase()) < 0) return false;
    for (const st of F.st) if (r._styles.indexOf(st) < 0) return false;
    for (const d of F.dt) if (!S.diet[d] && r._diet[d] !== 2) return false;
    if (F.tm && !(r.tm && r.tm.fit >= 2)) return false;
    if (F.fav && S.favorites.indexOf(r.id) < 0) return false;
    // Sorten-Filter: Gericht muss mindestens eine der gewählten Fleisch-/Fischsorten enthalten
    if (F.pg && F.pg.length && !adapted(r).items.some(it => (PG_KEY[it.key] || []).some(g => F.pg.indexOf(g) >= 0))) return false;
    return true;
  }
  function sortF(list, F) {
    const by = { protein: r => -nutriFor(r).p, kcal: r => nutriFor(r).k, zeit: r => r.t, preis: r => costFor(r) }[F.sort];
    return list.sort((a, b) => (S.favorites.indexOf(b.id) >= 0) - (S.favorites.indexOf(a.id) >= 0) || by(a) - by(b));
  }
  function filterChipsHtml(F, withSearch) {
    const chip = (on, attr, label) => '<button class="fchip ' + (on ? 'on' : '') + '" ' + attr + '>' + label + '</button>';
    return (withSearch ? '<div class="search" style="margin-bottom:10px">' + ic('search') + '<input class="input" data-qfq placeholder="Gericht oder Zutat suchen" value="' + esc(F.q) + '" autocomplete="off"></div>' : '') +
      '<div class="filter-row">' + QF_STYLES.map(s => chip(F.st.indexOf(s) >= 0, 'data-qf="st:' + s + '"', STYLES[s].e + ' ' + STYLES[s].n.replace(' (≤ 20 Min.)', ''))).join('') + '</div>' +
      '<div class="filter-row">' + Object.keys(QF_DIETS).map(d => chip(F.dt.indexOf(d) >= 0 || S.diet[d], 'data-qf="dt:' + d + '"' + (S.diet[d] ? ' disabled title="In den Einstellungen aktiv"' : ''), (d === 'veg' ? '🥦 ' : '🌾 ') + QF_DIETS[d] + (S.diet[d] ? ' ✓' : ''))).join('') +
      chip(F.tm, 'data-qf="tm"', '⚙️ Thermomix') + chip(F.fav, 'data-qf="fav"', '❤️ Favoriten') + '</div>' +
      (S.diet.veg ? '' : '<div class="filter-row">' + Object.keys(PROTEIN_GROUPS).map(c => Object.keys(PROTEIN_GROUPS[c].items).filter(g => S.noProtein.indexOf(g) < 0).map(g => chip(F.pg.indexOf(g) >= 0, 'data-qf="pg:' + g + '"', PROTEIN_GROUPS[c].e + ' ' + PROTEIN_GROUPS[c].items[g].n)).join('')).join('') + '</div>') +
      (F.dt.some(d => !S.diet[d]) ? '<p class="muted" style="font-size:12px;margin:0 2px 8px">Zeigt Gerichte, die von Natur aus ' + F.dt.filter(d => !S.diet[d]).map(d => QF_DIETS[d].toLowerCase()).join(' & ') + ' sind. Aktivierst du das in den <a href="#einstellungen" style="color:var(--acc2)">Einstellungen</a>, werden weitere Gerichte automatisch angepasst.</p>' : '') +
      '<div class="filter-row" style="align-items:center"><span class="muted" style="font-size:12.5px;white-space:nowrap">Sortieren:</span>' + [['protein', 'Meiste Proteine'], ['kcal', 'Wenigste kcal'], ['zeit', 'Schnellste'], ['preis', 'Günstigste']].map(o => chip(F.sort === o[0], 'data-qf="sort:' + o[0] + '"', o[1])).join('') + '</div>';
  }
  /* Bindet die Filter-Chips in einem Container; onChange zeichnet neu */
  function bindFilter(root, F, onChange) {
    $$('[data-qf]', root).forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      const [k, v] = b.dataset.qf.split(':');
      if (k === 'st' || k === 'dt' || k === 'pg') { const a = F[k], i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); }
      else if (k === 'sort') F.sort = v;
      else F[k] = !F[k];
      onChange(false);
    });
    const q = $('[data-qfq]', root);
    if (q) q.oninput = () => { F.q = q.value; onChange(true); };
  }

  let slotF = newFilter();
  function addToSlotSheet(sk) {
    const [d, meal] = sk.split('|');
    slotF = Object.assign(newFilter(), { sort: slotF.sort });
    openSheet('<div class="sheet-pad"><h2>' + MEALS[meal].n + ' · ' + dayLabel(+d) + '</h2><button class="btn btn-lime btn-block" style="margin:14px 0" data-act="autoslot" data-sk="' + sk + '">' + ic('spark') + 'Vorschlag automatisch wählen</button><div id="slotFilter"></div><div id="slotList"></div></div>');
    const drawFilter = () => { $('#slotFilter').innerHTML = filterChipsHtml(slotF, true); bindFilter($('#slotFilter'), slotF, fromSearch => { if (!fromSearch) drawFilter(); drawList(); }); };
    const drawList = () => {
      const list = sortF(RECIPES.filter(r => eligible(r, meal) && matchF(r, slotF)), slotF);
      $('#slotList').innerHTML = '<div class="count-l">' + list.length + ' passende Gerichte' + (slotF.st.length || slotF.dt.length || slotF.pg.length || slotF.q || slotF.tm || slotF.fav ? ' · <a href="#" data-qreset style="color:var(--acc2)">Filter zurücksetzen</a>' : '') + '</div>' +
        (list.length ? '<div class="rgrid">' + list.map(r => recipeCard(r).replace('data-open="' + r.id + '"', 'data-choose="' + r.id + '"')).join('') + '</div>' : '<div class="empty"><div class="big">🔍</div>Keine Gerichte mit diesen Filtern – Filter lockern.</div>');
      const rs = $('[data-qreset]'); if (rs) rs.onclick = ev => { ev.preventDefault(); slotF = Object.assign(newFilter(), { sort: slotF.sort }); drawFilter(); drawList(); };
      $$('#slotList [data-choose]').forEach(el => el.addEventListener('click', ev => { if (ev.target.closest('[data-fav]')) return; ev.stopPropagation(); plan().slots[sk] = { r: el.dataset.choose, lock: true }; plan().shop = {}; save(); closeSheet(); renderPlan(); toast('Hinzugefügt ✓'); }, true));
    };
    drawFilter(); drawList();
  }
  function trackSheet(items, title) {
    const today = keyOf(new Date());
    let h = '<div class="sheet-pad"><h2>' + esc(title) + '</h2><p class="muted" style="margin:6px 0 14px">Jedes Gericht landet mit allen Nährwerten im Ernährungstagebuch von <b>SuPER Health</b> – jeweils am geplanten Tag. Tipp: Im Tracker stehen deine geplanten Gerichte auch unter <b>„Aus dem Wochenplaner“</b> und lassen sich dort mit einem Tipp übernehmen.</p>';
    const sum = items.reduce((a, i) => ({ k: a.k + i.entry.k, p: a.p + i.entry.p, c: a.c + i.entry.c, f: a.f + i.entry.f }), { k: 0, p: 0, c: 0, f: 0 });
    h += '<div class="card" style="padding:4px 16px;margin-bottom:14px">' + items.map(i => '<div class="shop-item" style="cursor:default;padding:12px 0"><div class="n">' + esc(i.entry.n) + '<small>' + parseKey(i.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) + (i.date === today ? ' (heute)' : '') + '</small></div><div class="q">' + i.entry.k + ' kcal<br>' + r1(i.entry.p) + 'P · ' + r1(i.entry.c) + 'K · ' + r1(i.entry.f) + 'F</div></div>').join('') + '</div>';
    if (items.length > 1) h += '<p style="font-weight:700;margin-bottom:12px">Summe: <span class="mono">' + r0(sum.k) + ' kcal · ' + r0(sum.p) + ' g P · ' + r0(sum.c) + ' g K · ' + r0(sum.f) + ' g F</span></p>';
    h += '<button class="btn btn-pri btn-block" data-act="dotrack">' + ic('send') + 'Übertragen & Tracker öffnen</button><button class="btn btn-ghost btn-block" style="margin-top:6px" data-act="dotrack-stay">Nur übertragen (erscheint beim nächsten Öffnen des Trackers)</button>' +
      '<p class="muted" style="font-size:12px;margin-top:12px">Doppelte Einträge werden automatisch erkannt. Tracker-Adresse: ' + esc(trackerUrl()) + '</p></div>';
    openSheet(h);
    const go = open => {
      const done = trackEntries(items);
      closeSheet();
      if (open) window.open(trackerLink(done), 'superhealth');
      else toast(items.length + ' Eintrag' + (items.length > 1 ? 'e' : '') + ' bereit für SuPER Health ✓', '<a href="' + esc(trackerLink(done)) + '" target="superhealth">Öffnen</a>');
    };
    $('[data-act="dotrack"]').onclick = () => go(true);
    $('[data-act="dotrack-stay"]').onclick = () => go(false);
  }
  function trackOneSheet(rid) {
    const r = R[rid];
    const today = keyOf(new Date());
    let date = today, portion = 'erwachsen', meal = r.m[0];
    const draw = () => {
      const e = entryFor(r, portion, date, meal);
      let h = '<div class="sheet-pad"><h2>In SuPER Health tracken</h2><p class="muted" style="margin:6px 0 16px">' + esc(r.n) + '</p>' +
        '<div class="field-l" style="font-size:15px">Portion</div><div class="portion-sw">' + Object.keys(MEMBER_TYPES).map(t => '<button class="' + (portion === t ? 'on' : '') + '" data-tp="' + t + '">' + MEMBER_TYPES[t].e + ' ' + MEMBER_TYPES[t].n + '</button>').join('') + '</div>' +
        '<div class="field-l" style="font-size:15px">Mahlzeit</div><div class="portion-sw">' + MEAL_ORDER.map(m => '<button class="' + (meal === m ? 'on' : '') + '" data-tm="' + m + '">' + MEALS[m].e + ' ' + MEALS[m].n + '</button>').join('') + '</div>' +
        '<div class="field-l" style="font-size:15px">Datum</div><input type="date" class="input" style="border-radius:14px;margin-bottom:16px" id="tdate" value="' + date + '">' +
        '<div class="card" style="padding:16px;display:flex;justify-content:space-around;text-align:center;margin-bottom:16px"><div><b class="mono" style="font-size:20px">' + e.entry.k + '</b><div class="muted" style="font-size:12px">kcal</div></div><div><b class="mono" style="font-size:20px;color:#C2477A">' + r1(e.entry.p) + '</b><div class="muted" style="font-size:12px">Protein g</div></div><div><b class="mono" style="font-size:20px;color:#B7801F">' + r1(e.entry.c) + '</b><div class="muted" style="font-size:12px">Kohlenh. g</div></div><div><b class="mono" style="font-size:20px;color:#2F6FB0">' + r1(e.entry.f) + '</b><div class="muted" style="font-size:12px">Fett g</div></div></div>' +
        '<button class="btn btn-pri btn-block" data-act="t1go">' + ic('send') + 'Übertragen & Tracker öffnen</button><button class="btn btn-ghost btn-block" style="margin-top:6px" data-act="t1stay">Nur übertragen</button>' +
        '<button class="btn btn-ghost btn-block btn-sm" style="margin-top:4px" data-act="t1back">← Zurück zum Rezept</button></div>';
      openSheet(h);
      $$('[data-tp]').forEach(b => b.onclick = () => { portion = b.dataset.tp; draw(); });
      $$('[data-tm]').forEach(b => b.onclick = () => { meal = b.dataset.tm; draw(); });
      $('#tdate').onchange = ev => { date = ev.target.value || today; draw(); };
      const fire = open => { const done = trackEntries([entryFor(r, portion, date, meal)]); closeSheet(); if (open) window.open(trackerLink(done), 'superhealth'); else toast(r.n + ' bereit für SuPER Health ✓', '<a href="' + esc(trackerLink(done)) + '" target="superhealth">Öffnen</a>'); };
      $('[data-act="t1go"]').onclick = () => fire(true);
      $('[data-act="t1stay"]').onclick = () => fire(false);
      $('[data-act="t1back"]').onclick = () => openRecipe(rid);
    };
    draw();
  }

  /* ================= Einkaufsplanung =================
   * Jede Zutat eines geplanten Gerichts wird einem Einkaufstag zugeordnet:
   *  - Haltbares (≥ 14 Tage) → frühester Einkauf vor dem Kochtag (alles auf einmal)
   *  - Frisches → letzter Einkauf vor dem Kochtag; reicht die Haltbarkeit nicht → Hinweis (einfrieren / frisch kaufen)
   * Pro Einkauf werden Mengen addiert und in reale Packungsgrößen umgerechnet (oder exakt an der Theke). */
  function shopDays() { return (S.shopDays && S.shopDays.length ? S.shopDays : [0]).slice().sort((a, b) => a - b); }
  /* Was muss eingekauft werden? Geplante Gerichte ab heute + zusätzlich hinzugefügte Einzelrezepte (Extras) */
  function planEntries() {
    const p = plan(), serv = servings(), out = [];
    for (const sk in p.slots) {
      const r = R[p.slots[sk].r]; if (!r) continue;
      const day = +sk.split('|')[0];
      if (isPast(day)) continue; // Vergangenes muss nicht mehr eingekauft werden
      out.push({ r, day, serv });
    }
    for (const ex of (p.extras || [])) { const r = R[ex.r]; if (r) out.push({ r, day: null, serv: ex.serv || serv, extra: true }); }
    return out;
  }
  function buildTrips(entries, tripDays) {
    const p = plan(), mf = marketF(), tI = todayIndex();
    if (!entries) { if (tI === 7) return []; entries = planEntries(); }
    // Einkaufstage, die schon vorbei sind, rutschen auf heute
    const trips = tripDays || (() => {
      const t0 = Math.max(0, tI), sd = shopDays();
      let t = [0, 1, 2, 3, 4, 5, 6].filter(o => sd.indexOf(wdOf(o)) >= 0).map(o => Math.max(o, t0));
      const first = Math.min(99, ...entries.filter(e => e.day !== null).map(e => e.day));
      if (!t.length || first < Math.min(...t)) t.push(t0); // vor dem ersten Einkaufstag wird gekocht → heute einkaufen
      return [...new Set(t)].sort((a, b) => a - b);
    })();
    const map = {}; // Einkaufstag -> Zutat -> Summe
    for (const en of entries) {
      const r = en.r, day = en.day === null ? trips[0] : en.day, serv = en.serv;
      for (const it of adapted(r).items) {
        const pi = packInfo(it.key);
        const before = trips.filter(t => t <= day);
        let trip, warn = null;
        if (!before.length) { trip = trips[0]; warn = 'vorher'; }
        else if (pi.hb >= 14 || pi.vr) trip = before[0];
        else {
          trip = before[before.length - 1];
          if (day - trip > pi.hb) warn = pi.fr ? 'einfrieren' : 'frisch';
        }
        const m = map[trip] || (map[trip] = {});
        const a = m[it.key] || (m[it.key] = { key: it.key, ing: it.ing, pi, g: 0, uses: [], warns: [] });
        a.g += it.g * serv;
        if (!a.uses.some(u => u.day === day && u.r === r.id)) a.uses.push({ day, r: r.id, n: r.n + (en.extra ? ' (extra)' : ''), extra: !!en.extra });
        if (warn && a.warns.indexOf(warn + ':' + day) < 0) a.warns.push(warn + ':' + day);
      }
    }
    return trips.map(t => {
      const items = Object.values(map[t] || {}).map(a => {
        const prod = S.products[a.key];
        const mode = p.mode && p.mode[a.key];
        // Wo kaufen? Erste gewählte Einkaufsstätte, die das Produkt typischerweise führt
        const car = carriers(a.key), isMeat = a.ing.cat === 'fleisch' && !/F|K/.test(a.ing.fl || ''), isFish = a.ing.cat === 'fleisch' && /F|K/.test(a.ing.fl || '');
        let store = null;
        if (isMeat && S.stores.indexOf('metzger') >= 0 && mode !== 'pack') store = 'metzger';
        else if (isFish && S.stores.indexOf('fisch') >= 0 && mode !== 'pack' && car.indexOf('fisch') >= 0) store = 'fisch';
        else store = S.stores.find(x => x !== 'metzger' && x !== 'fisch' && car.indexOf(x) >= 0) || null;
        const na = !store; if (!store) store = S.stores[0];
        const moved = !na && store !== S.stores[0] && car.indexOf(S.stores[0]) < 0;
        // Alternativen mit passender Eigenmarke (z. B. Kaufland → K-free); Märkte mit Eigenmarke und Drogerie zuerst
        const gb = GF_BRANDS[a.key] || {}, schaer = (gb.all || []).find(b => /^Schär/.test(b));
        const alt = na ? car.filter(x => S.stores.indexOf(x) < 0).sort((p, q) => (gb[q] ? 2 : 0) + (q === 'dm' ? 1 : 0) - (gb[p] ? 2 : 0) - (p === 'dm' ? 1 : 0)).slice(0, 3)
          .map(x => SHOP_PLACES[x].n + (gb[x] ? ' (' + gb[x] + ')' : (x === 'dm' || x === 'rossmann') && schaer ? ' (' + schaer.split(' (')[0] + ')' : '')) : [];
        const loose = !mode && !!a.pi.lose && a.g < a.pi.pk[0] * 0.6;
        const theke = !!a.pi.th && (mode ? mode === 'theke' : ((S.theke || store === 'metzger' || store === 'fisch') && a.ing.cat === 'fleisch') || loose);
        let buy;
        if (theke) { const total = Math.max(a.pi.lose || 10, Math.ceil(a.g / 10) * 10); buy = { theke: true, total, waste: total - a.g, combo: [] }; }
        else buy = bestPacks(a.g, prod && prod.size ? [prod.size] : a.pi.pk);
        return Object.assign(a, { buy, theke, prod, store, na, moved, alt, costUsed: a.ing.pr * a.g / 1000 * mf, costBuy: a.ing.pr * buy.total / 1000 * mf, pantry: !!a.pi.vr });
      }).sort((x, y) => x.ing.n.localeCompare(y.ing.n, 'de'));
      return { day: t, items, buyItems: items.filter(i => !i.pantry), pantryItems: items.filter(i => i.pantry) };
    }).filter(t => t.items.length);
  }
  function buildShop() { return buildTrips().reduce((a, t) => a.concat(t.buyItems.map(i => Object.assign({ tk: shopKeyOf(t.day, i.key) }, i))), []); }
  function fmtSize(s, unit) { return s >= 1000 && s % 100 === 0 ? r1(s / 1000) + (unit === 'ml' ? ' l' : ' kg') : s + ' ' + unit; }
  function packLabel(i) {
    const unit = LIQUIDS.has(i.key) ? 'ml' : 'g';
    if (i.theke) return (i.ing.cat === 'obst' ? 'lose ~' : (i.store === 'metzger' ? 'Metzger ' : i.store === 'fisch' ? 'Fischtheke ' : 'Theke ')) + i.buy.total + ' ' + unit + (i.pi.lose && i.buy.total <= i.pi.lose ? ' (kleines Stück)' : '');
    if (i.pantry) return fmtQty(i.key, i.g).replace(/<[^>]+>/g, '');
    return i.buy.combo.map(([s, n]) => n + ' × ' + fmtSize(s, unit)).join(' + ');
  }
  function warnLabels(warns) {
    const g = {}; warns.forEach(w => { const [k, d] = w.split(':'); (g[k] = g[k] || []).push(dayLabel(+d)); });
    const L = { einfrieren: d => '🧊 Anteil für ' + d + ' direkt einfrieren & am Vortag im Kühlschrank auftauen – oder Einkaufstag ergänzen', frisch: d => '⚠️ Für ' + d + ' nicht lange genug haltbar – Einkaufstag davor ergänzen', vorher: d => '📅 Für ' + d + ' schon vorher einkaufen' };
    return Object.keys(g).map(k => L[k](g[k].join(' & ')));
  }
  function renderShop() {
    const p = plan(), trips = buildTrips();
    const all = trips.reduce((a, t) => a.concat(t.buyItems), []);
    const done = trips.reduce((s, t) => s + t.buyItems.filter(i => p.shop[shopKeyOf(t.day, i.key)]).length, 0);
    const bon = all.reduce((s, i) => s + i.costBuy, 0), used = all.reduce((s, i) => s + i.costUsed, 0);
    const mk = MARKETS[S.market] || MARKETS.kaufland;
    let h = '<div class="page-head"><div class="eyebrow">' + mk.n + ' · ' + r1(servings()) + ' Portionen pro Gericht</div><h1>Einkaufsplan</h1></div>';
    if (!trips.length) { $('#pg-einkauf').innerHTML = h + '<div class="card empty"><div class="big">🛒</div>Erstelle zuerst einen Wochenplan – die Einkäufe werden automatisch geplant.<div style="margin-top:16px"><a class="btn btn-lime" href="#plan">Zum Plan</a></div></div>'; return; }
    h += '<div class="stats"><div class="card stat"><div class="eyebrow">Erledigt</div><div class="v">' + done + ' <small>/ ' + all.length + '</small></div><div class="bar"><i style="width:' + (all.length ? done / all.length * 100 : 0) + '%"></i></div></div>' +
      '<div class="card stat"><div class="eyebrow">Kassenbon ca.</div><div class="v">' + eur(bon) + '</div><div class="muted" style="font-size:12px;margin-top:6px">davon verkocht ' + eur(used) + ' – der Rest bleibt im Vorrat</div></div></div>';
    h += '<div class="card" style="padding:14px 16px;margin-top:12px"><b style="font-size:14px;display:block;margin-bottom:4px">Wo kaufst du ein?</b><div class="muted" style="font-size:12.5px;margin-bottom:8px">Erster Markt = Hauptmarkt (' + esc(MARKETS[S.market] ? MARKETS[S.market].n : '') + '). Jedes Produkt wird dem passenden Geschäft zugeordnet – mit Hinweis, wenn es dort meist nicht erhältlich ist.</div><div class="filter-row" style="flex-wrap:wrap">' + Object.keys(SHOP_PLACES).map(x => '<button class="fchip ' + (S.stores.indexOf(x) >= 0 ? 'on' : '') + '" data-shopplace="' + x + '">' + SHOP_PLACES[x].e + ' ' + SHOP_PLACES[x].n + (x === S.market ? ' ★' : '') + '</button>').join('') + '</div>' + (S.stores.length > 1 ? '<div class="filter-row" style="margin-top:4px"><span class="muted" style="font-size:12.5px;align-self:center">Sortieren nach:</span><button class="fchip ' + (S.shopGroup === 'store' ? 'on' : '') + '" data-shopgroup="store">Geschäft</button><button class="fchip ' + (S.shopGroup !== 'store' ? 'on' : '') + '" data-shopgroup="cat">Kategorie</button></div>' : '') + '</div>';
    h += '<div class="card" style="padding:14px 16px;margin-top:12px"><b style="font-size:14px;display:block;margin-bottom:8px">Einkaufstage</b><div class="days">' + DAYS_S.map((d, i) => '<button class="' + (shopDays().indexOf(i) >= 0 ? 'on' : '') + '" data-shopday="' + i + '" title="' + DAYS[i] + '" style="border-radius:12px;font-size:14px;max-width:46px">' + d + '</button>').join('') + '</div>' +
      '<div class="toggle ' + (S.theke ? 'on' : '') + '" data-act="theke" style="padding:14px 0 2px"><span class="tx"><b>Fleisch & Fisch an der Theke / beim Metzger</b><span>Exakte Menge statt fester Packungsgrößen</span></span><span class="sw"></span></div></div>';
    const ex = p.extras || [];
    if (ex.length) h += '<div class="card" style="padding:12px 16px;margin-top:12px"><b style="font-size:14px">➕ Zusätzliche Rezepte</b><div class="muted" style="font-size:12.5px;margin-bottom:6px">Ohne festen Tag – werden beim nächsten Einkauf mitgekauft.</div>' + ex.map((e, i) => R[e.r] ? '<div class="shop-item" style="cursor:default;padding:8px 0"><span class="n">' + esc(R[e.r].n) + '<small>' + r1(e.serv) + ' Portionen</small></span><button class="icon-btn" data-exrm="' + i + '" aria-label="Entfernen" title="Aus der Einkaufsliste entfernen">' + ic('x') + '</button></div>' : '').join('') + '</div>';
    h += '<div class="plan-actions no-print"><button class="btn btn-sec btn-sm" data-act="copyshop">' + ic('copy') + 'Kopieren</button><button class="btn btn-sec btn-sm" data-act="shareshop">' + ic('send') + 'Teilen</button><button class="btn btn-sec btn-sm" data-act="printshop">' + ic('print') + 'Drucken</button><button class="btn btn-ghost btn-sm" data-act="resetshop">' + ic('refresh') + 'Zurücksetzen</button></div>';
    for (const t of trips) {
      const tripBon = t.buyItems.reduce((s, i) => s + i.costBuy, 0);
      const d = addDays(weekStart, t.day);
      const nx = trips.map(x => x.day).find(x => x > t.day), until = nx === undefined ? dayName(6).slice(0, 2) : dayName(nx - 1).slice(0, 2);
      h += '<div class="day" style="margin-top:26px"><div class="day-tag"><span class="today">🛒 Einkauf ' + dayName(t.day) + ' · ' + d.getDate() + '.' + (d.getMonth() + 1) + '.</span></div><div class="card day-body" style="padding-top:22px">' +
        '<div class="muted" style="font-size:12.5px;text-align:center;margin-bottom:6px">Für die Gerichte ' + dayName(t.day).slice(0, 2) + (until !== dayName(t.day).slice(0, 2) ? '–' + until : '') + ' · ' + t.buyItems.length + ' Artikel · ca. ' + eur(tripBon) + '</div>';
      const byStore = S.shopGroup === 'store' && S.stores.length > 1;
      const groups = byStore ? S.stores.concat(Object.keys(SHOP_PLACES).filter(x => S.stores.indexOf(x) < 0)).map(st => ({ st, items: t.buyItems.filter(i => i.store === st) })).filter(g => g.items.length) : [{ st: null, items: t.buyItems }];
      for (const g of groups) {
        if (g.st) h += '<div class="store-head">' + SHOP_PLACES[g.st].e + ' ' + esc(SHOP_PLACES[g.st].n) + '<span>' + g.items.length + ' Artikel · ca. ' + eur(g.items.reduce((x, i) => x + i.costBuy, 0)) + '</span></div>';
        for (const c in SHOP_CATS) {
          const items = g.items.filter(i => i.ing.cat === c); if (!items.length) continue;
          h += '<div class="shop-cat" style="margin-top:10px"><h3>' + SHOP_CATS[c].e + ' ' + SHOP_CATS[c].n + '</h3>' + items.map(i => shopRow(t.day, i, p)).join('') + '</div>';
        }
      }
      if (t.pantryItems.length) {
        h += '<div class="shop-cat" style="margin-top:10px"><h3>🫙 Vorrat prüfen</h3><p class="muted" style="font-size:12.5px;margin:-4px 4px 6px">Tippe an, was du zu Hause hast – wird gemerkt.</p>' +
          t.pantryItems.map(i => { const have = !!S.pantry[i.key]; return '<div class="shop-item ' + (have ? 'done' : '') + '" data-pantry="' + i.key + '"><span class="cb">' + ic('check') + '</span><span class="n">' + esc(i.ing.n) + '<small>' + (have ? 'Habe ich' : 'Bei Bedarf kaufen' + (S.stores.length > 1 || i.na ? ' · ' + SHOP_PLACES[i.store].e + ' ' + esc(SHOP_PLACES[i.store].n) : '')) + '</small>' + (!have && i.na ? '<small style="color:#B03A2E;font-weight:600">⚠️ Bei ' + esc(SHOP_PLACES[S.stores[0]].n) + ' meist nicht erhältlich – Alternative: ' + esc(i.alt.join(', ') || 'Online') + '</small>' : '') + (!have && i.moved ? '<small style="color:#8A4F12;font-weight:600">↪ nicht bei ' + esc(SHOP_PLACES[S.stores[0]].n) + ' – daher bei ' + esc(SHOP_PLACES[i.store].n) + '</small>' : '') + '</span><span class="q">' + packLabel(i) + '</span></div>'; }).join('') + '</div>';
      }
      h += '</div></div>';
    }
    h += '<p class="muted" style="font-size:12px;margin:18px 4px">Packungsgrößen, Haltbarkeiten & Preise sind typische Richtwerte (' + mk.n + '). Tippe auf 🔍, um echte Produkte im Markt zu finden und deine Packung festzulegen.</p>';
    $('#pg-einkauf').innerHTML = h;
  }
  function shopRow(day, i, p) {
    const k = shopKeyOf(day, i.key), done = !!p.shop[k];
    const uses = i.uses.slice().sort((a, b) => a.day - b.day);
    const uniq = a => a.filter((v, j) => a.indexOf(v) === j);
    const useTxt = uniq(uses.map(u => dayName(u.day).slice(0, 2))).join(', ') + ': ' + uniq(uses.map(u => u.n)).slice(0, 2).join(', ') + (uniq(uses.map(u => u.n)).length > 2 ? ' …' : '');
    const unit = LIQUIDS.has(i.key) ? 'ml' : 'g';
    return '<div class="shop-item ' + (done ? 'done' : '') + '" data-shop="' + k + '" style="align-items:flex-start"><span class="cb" style="margin-top:2px">' + ic('check') + '</span><span class="n">' + esc(i.prod ? i.prod.name + (i.prod.brand ? ' (' + i.prod.brand + ')' : '') : i.ing.n) +
      '<small>' + esc(useTxt) + '</small>' + gfHint(i.key, true, i.store) +
      (i.na ? '<small style="color:#B03A2E;font-weight:600">⚠️ Bei ' + esc(SHOP_PLACES[S.stores[0]].n) + ' meist nicht erhältlich – Alternative: ' + esc(i.alt.join(', ') || 'Online') + '</small>' : '') +
      (i.moved ? '<small style="color:#8A4F12;font-weight:600">↪ Bei ' + esc(SHOP_PLACES[S.stores[0]].n) + ' meist nicht im Sortiment – daher bei ' + esc(SHOP_PLACES[i.store].n) + '</small>' : '') +
      '<small>Bedarf ' + r0(i.g) + ' ' + unit + (i.buy.waste > 0.5 ? ' · Rest ' + r0(i.buy.waste) + ' ' + unit + (i.pi.fr ? ' (einfrierbar)' : '') : '') + ' · haltbar ' + (i.pi.hb >= 60 ? 'lange' : '~' + i.pi.hb + ' T.') + '</small>' +
      warnLabels(i.warns).map(w => '<small style="color:#8A4F12;font-weight:600">' + w + '</small>').join('') +
      '<span style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><span class="chip store-chip' + (i.na ? ' na' : '') + '">' + SHOP_PLACES[i.store].e + ' ' + esc(SHOP_PLACES[i.store].n) + '</span>' + (i.pi.th ? '<button class="chip ' + (i.theke ? 'diet' : 'ghost') + '" data-mode="' + i.key + '" title="Packung oder lose/Theke">' + (i.theke ? (i.ing.cat === 'obst' ? '⚖️ lose' : '🔪 Theke') : '📦 Packung') + ' ⇄</button>' : '') + '<button class="chip ghost" data-prod="' + i.key + '">🔍 Produkte</button></span></span>' +
      '<span class="q"><b style="color:var(--t1)">' + packLabel(i) + '</b><br><span class="muted" style="font-size:11.5px">' + eur(i.costBuy) + '</span></span></div>';
  }
  let recShop = { id: null, serv: null, done: {} };
  function recipeShopSheet(rid) {
    if (recShop.id !== rid) recShop = { id: rid, serv: servings(), done: {} };
    const r = R[rid], day = Math.min(6, Math.max(0, todayIndex()));
    const trip = buildTrips([{ r, day, serv: recShop.serv }], [day])[0] || { buyItems: [], pantryItems: [] };
    const all = trip.buyItems, cost = all.reduce((x, i) => x + i.costBuy, 0);
    const inWeek = (plan().extras || []).some(e => e.r === rid);
    const row = i => '<div class="shop-item ' + (recShop.done[i.key] ? 'done' : '') + '" data-rsdone="' + i.key + '" style="align-items:flex-start"><span class="cb" style="margin-top:2px">' + ic('check') + '</span><span class="n">' + esc(i.ing.n) +
      '<small>Bedarf ' + r0(i.g) + ' ' + (LIQUIDS.has(i.key) ? 'ml' : 'g') + (i.buy.waste > 0.5 ? ' · Rest ' + r0(i.buy.waste) : '') + '</small>' + gfHint(i.key, true, i.store) +
      (i.na ? '<small style="color:#B03A2E;font-weight:600">⚠️ Bei ' + esc(SHOP_PLACES[S.stores[0]].n) + ' meist nicht erhältlich – Alternative: ' + esc(i.alt.join(', ') || 'Online') + '</small>' : '') +
      '<span style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><span class="chip store-chip' + (i.na ? ' na' : '') + '">' + SHOP_PLACES[i.store].e + ' ' + esc(SHOP_PLACES[i.store].n) + '</span></span></span>' +
      '<span class="q"><b style="color:var(--t1)">' + packLabel(i) + '</b><br><span class="muted" style="font-size:11.5px">' + eur(i.costBuy) + '</span></span></div>';
    let h = '<div class="sheet-pad"><div class="eyebrow">Einkaufsliste für ein Gericht</div><h2 style="margin-top:4px">' + esc(r.n) + '</h2>' +
      '<div class="card" style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0"><div><b>Portionen</b><div class="muted" style="font-size:12.5px">Haushalt = ' + r1(servings()) + ' Erwachsenen-Portionen</div></div><div class="stepper sm"><button data-rsserv="-0.5">−</button><b>' + r1(recShop.serv) + '</b><button data-rsserv="0.5">+</button></div></div>' +
      '<div class="card" style="padding:0 14px">' + (all.length ? all.map(row).join('') : '<div class="empty" style="padding:16px">Alles Nötige ist Vorrat.</div>') + '</div>' +
      (trip.pantryItems.length ? '<p class="muted" style="font-size:12.5px;margin:10px 2px">🫙 Vorrat prüfen: ' + esc(trip.pantryItems.map(i => i.ing.n).join(', ')) + '</p>' : '') +
      '<p style="font-weight:700;margin:12px 2px">Ca. ' + eur(cost) + ' an der Kasse</p>' +
      '<button class="btn btn-lime btn-block" data-act="rsweek">' + ic('plus') + (inWeek ? 'Ist schon in der Wochen-Einkaufsliste – nochmal hinzufügen' : 'Zur Wochen-Einkaufsliste hinzufügen') + '</button>' +
      '<div class="grid2" style="margin-top:8px"><button class="btn btn-sec" data-act="rscopy">' + ic('copy') + 'Kopieren</button><button class="btn btn-sec" data-act="rsplan">' + ic('plan') + 'Im Plan einplanen</button></div>' +
      '<button class="btn btn-ghost btn-block btn-sm" style="margin-top:6px" data-act="rsback">← Zurück zum Rezept</button>' +
      '<p class="muted" style="font-size:12px;margin-top:10px">„Zur Wochen-Einkaufsliste“ übernimmt die Zutaten in den nächsten Einkauf – auch ohne festen Tag im Plan.</p></div>';
    openSheet(h);
  }
  function recipeShopText() {
    const r = R[recShop.id], day = Math.min(6, Math.max(0, todayIndex()));
    const trip = buildTrips([{ r, day, serv: recShop.serv }], [day])[0] || { buyItems: [] };
    return 'Einkaufsliste: ' + r.n + ' (' + r1(recShop.serv) + ' Portionen)\n' + trip.buyItems.map(i => '☐ ' + i.ing.n + ' – ' + packLabel(i) + (S.stores.length > 1 ? ' [' + SHOP_PLACES[i.store].n + ']' : '')).join('\n');
  }
  function shopText() {
    const p = plan(); let t = 'Einkaufsplan (SuPER Küche) – ' + weekStart.toLocaleDateString('de-DE') + ' bis ' + addDays(weekStart, 6).toLocaleDateString('de-DE') + ' · ' + (MARKETS[S.market] || {}).n + '\n';
    for (const tr of buildTrips()) {
      t += '\n🛒 ' + dayName(tr.day) + ':\n';
      for (const c in SHOP_CATS) { const items = tr.buyItems.filter(i => i.ing.cat === c && !p.shop[shopKeyOf(tr.day, i.key)]); if (!items.length) continue; t += '  ' + SHOP_CATS[c].n + ':\n' + items.map(i => '  ☐ ' + (i.prod ? i.prod.name : i.ing.n) + ' – ' + packLabel(i) + (S.stores.length > 1 ? ' [' + SHOP_PLACES[i.store].n + ']' : '') + (i.na ? ' (nicht im Hauptmarkt!)' : '')).join('\n') + '\n'; }
      const pan = tr.pantryItems.filter(i => !S.pantry[i.key]); if (pan.length) t += '  Vorrat prüfen: ' + pan.map(i => i.ing.n).join(', ') + '\n';
    }
    return t;
  }

  /* ---------- Produktsuche (Open Food Facts, nach Markt gefiltert) ---------- */
  const prodCache = {};
  async function searchProducts(q, store, gf) {
    const ck = q + '|' + store + '|' + (gf ? 1 : 0); if (prodCache[ck]) return prodCache[ck];
    const qs = '?q=' + encodeURIComponent(q) + '&store=' + encodeURIComponent(store || '') + (gf ? '&gf=1' : '');
    const urls = [];
    if (location.protocol.startsWith('http')) urls.push('/api/product-search' + qs);
    urls.push('https://su-per-health.vercel.app/api/product-search' + qs);
    urls.push('https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q + (store ? ' stores:' + store : '')) + '&page_size=24&langs=de&fields=code,product_name,product_name_de,brands,quantity,product_quantity,stores,image_front_small_url,nutriscore_grade');
    for (const u of urls) {
      try {
        const r = await fetch(u); if (!r.ok) continue;
        const j = await r.json(); const hits = j.results || j.hits; if (!hits) continue;
        const res = hits.map(normProduct).filter(Boolean);
        prodCache[ck] = res; return res;
      } catch (e) { /* nächste Quelle */ }
    }
    return null;
  }
  function parseQty(s) {
    if (!s) return 0; const m = String(s).replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(kg|g|l|ml|cl)\b/i);
    if (!m) return 0; const v = +m[1], u = m[2].toLowerCase();
    return Math.round(u === 'kg' || u === 'l' ? v * 1000 : u === 'cl' ? v * 10 : v);
  }
  function normProduct(p) {
    if (p.size !== undefined) return p; // bereits normalisiert (Proxy)
    const name = (p.product_name_de || p.product_name || '').toString().trim(); if (!name) return null;
    const brand = (Array.isArray(p.brands) ? p.brands[0] : (p.brands || '')).toString().split(',')[0].trim();
    return { code: p.code, name, brand, qty: p.quantity || '', size: parseQty(p.quantity) || Math.round(+p.product_quantity || 0), stores: Array.isArray(p.stores) ? p.stores.join(', ') : (p.stores || ''), img: p.image_front_small_url || '', ns: p.nutriscore_grade || '' };
  }
  function productSheet(key) {
    const ing = ING[key], pi = packInfo(key);
    const assigned = (buildShop().find(x => x.key === key) || {}).store;
    let store = /^more_|^zerup/.test(key) ? 'more' : /^esn_/.test(key) ? 'esn' : (assigned && STORES[assigned] && assigned !== 'bio') ? assigned : (S.market === 'bio' ? '' : S.market), q = pi.q || ing.n;
    const gb = GF_BRANDS[key];
    const brandQ = gb ? [...new Set([gb.kaufland, gb.aldi, gb.rewe].filter(Boolean).concat((gb.all || []).filter(x => /^(Schär|Barilla|3Pauly|Hammermühle|Bauck|Kölln|Kikkoman|Clearspring)/.test(x)).map(x => x.split(/[ (/]/)[0] + ' ' + (pi.q || ing.n).replace(/ ?glutenfrei/i, '') + ' glutenfrei')))] : [];
    const draw = async () => {
      const cur = S.products[key], unit = LIQUIDS.has(key) ? 'ml' : 'g';
      let h = '<div class="sheet-pad"><h2>Produkte finden</h2><p class="muted" style="margin:4px 0 14px">' + esc(ing.n) + ' · übliche Packungen: ' + pi.pk.map(s => fmtSize(s, unit)).join(' / ') + (pi.th ? ' · auch lose an der Theke' : '') + '</p>' +
        (cur ? '<div class="diet-row" style="margin-bottom:12px">⭐ <span><b>Deine Wahl:</b> ' + esc(cur.name) + (cur.brand ? ' (' + esc(cur.brand) + ')' : '') + ' · ' + fmtSize(cur.size, unit) + '</span><button class="chip ghost" data-act="prodclear" data-key="' + key + '" style="margin-left:auto">Entfernen</button></div>' : '') +
        '<div class="search" style="margin-bottom:10px">' + ic('search') + '<input class="input" id="pq" value="' + esc(q) + '"></div>' +
        (brandQ.length ? '<div class="filter-row"><span class="muted" style="font-size:12.5px;white-space:nowrap;align-self:center">🌾 Marken:</span>' + brandQ.map(b => '<button class="fchip ' + (q === b ? 'on' : '') + '" data-pbrand="' + esc(b) + '">' + esc(b) + '</button>').join('') + '</div>' : '') +
        '<div class="filter-row">' + Object.keys(STORES).filter(s => s !== 'bio').map(s => '<button class="fchip ' + (store === s ? 'on' : '') + '" data-pstore="' + s + '">' + STORES[s].n + '</button>').join('') + '<button class="fchip ' + (!store ? 'on' : '') + '" data-pstore="">Alle</button></div>' +
        (store ? '<a class="btn btn-sec btn-sm" style="margin:8px 0 14px" target="_blank" rel="noopener" href="' + esc(STORES[store].url(q)) + '">' + ic('link') + 'Direkt bei ' + STORES[store].n + ' suchen</a>' : '<div style="height:10px"></div>') +
        '<div id="plist"><div class="empty" style="padding:20px">Suche Produkte …</div></div>' +
        '<p class="muted" style="font-size:11.5px;margin-top:12px">Produktdaten: Open Food Facts (offene Datenbank; Sortiment kann je Filiale abweichen). Wählst du ein Produkt, rechnet der Einkaufsplan mit dessen Packungsgröße.' + (S.diet.gf ? ' <b>Bei Zöliakie immer die Verpackung prüfen</b> (durchgestrichene Ähre / „glutenfrei“) – Rezepturen können sich ändern.' : '') + '</p></div>';
      openSheet(h);
      const inp = $('#pq'); inp.onchange = () => { q = inp.value.trim() || q; draw(); };
      $$('[data-pstore]').forEach(b => b.onclick = () => { store = b.dataset.pstore; draw(); });
      $$('[data-pbrand]').forEach(b => b.onclick = () => { q = b.dataset.pbrand; if (/^K-free/.test(q)) store = 'kaufland'; else if (/^enjoy free/.test(q)) store = 'aldi'; else if (/^REWE/.test(q)) store = 'rewe'; else store = ''; draw(); });
      const gfOnly = !!(S.diet.gf && (GF_BRANDS[key] || ING[key].sw && ING[key].sw.gf === undefined && /_gf$/.test(key)));
      const res = await searchProducts(q, store ? STORES[store].off : '', gfOnly);
      const box = $('#plist'); if (!box) return;
      if (res === null) { box.innerHTML = '<div class="empty" style="padding:20px">Produktsuche gerade nicht erreichbar – nutze „Direkt beim Markt suchen“.</div>'; return; }
      if (!res.length) { box.innerHTML = '<div class="empty" style="padding:20px">' + (gfOnly ? 'Keine als glutenfrei gekennzeichneten Produkte gefunden – probiere eine Marke oben (z. B. Schär) oder „Alle“ Märkte.' : 'Keine Produkte gefunden – anderen Markt oder Suchbegriff probieren.') + '</div>'; return; }
      box.innerHTML = '<div class="card" style="padding:0 14px">' + res.slice(0, 16).map((pr, idx) => '<div class="shop-item" style="cursor:default;padding:10px 0;align-items:center">' + (pr.img ? '<img src="' + esc(pr.img) + '" alt="" style="width:48px;height:48px;object-fit:contain;border-radius:8px;background:#fff;flex-shrink:0" loading="lazy">' : '<span style="width:48px;text-align:center;font-size:24px">📦</span>') +
        '<span class="n">' + esc(pr.name) + '<small>' + esc([pr.brand, pr.qty, pr.stores].filter(Boolean).join(' · ')) + (pr.ns && pr.ns.length === 1 ? ' · Nutri-Score ' + esc(pr.ns.toUpperCase()) : '') + '</small>' + (pr.gf ? '<small style="color:var(--acc2);font-weight:700">🌾 als glutenfrei gekennzeichnet</small>' : '') + '</span>' +
        (pr.size ? '<button class="btn btn-sec btn-sm" data-useprod="' + idx + '">Wählen</button>' : '') + '</div>').join('') + '</div>';
      $$('[data-useprod]').forEach(b => b.onclick = () => { const pr = res[+b.dataset.useprod]; S.products[key] = { name: pr.name, brand: pr.brand, size: pr.size, img: pr.img, store }; save(); closeSheet(); renderShop(); toast('Packung ' + fmtSize(pr.size, unit) + ' übernommen ✓'); });
    };
    draw();
  }

  /* ================= Seite: Einstellungen ================= */
  function renderSettings() {
    const mk = MARKETS[S.market] || MARKETS.kaufland;
    const nd = S.days.filter(Boolean).length;
    const td = trackerData();
    let h = '<div class="page-head"><div class="eyebrow">Dein Plan</div><h1>Einstellungen</h1></div>';
    h += '<div class="set-block"><div class="field-l">Supermarkt</div><div class="field-s">Preise werden an den Markt angepasst (Richtwerte).</div><select class="select" id="smarket">' + Object.keys(MARKETS).map(m => '<option value="' + m + '" ' + (S.market === m ? 'selected' : '') + '>' + MARKETS[m].n + '</option>').join('') + '</select></div>';
    h += '<div class="set-block"><div class="field-l">Haushalt</div><div class="field-s">Für wen kochst du? Portionen, Einkauf und Kosten passen sich automatisch an (= ' + r1(servings()) + ' Erwachsenen-Portionen).</div><div class="members">' +
      Object.keys(MEMBER_TYPES).map(t => '<div class="card member"><span class="e">' + MEMBER_TYPES[t].e + '</span><span class="tx"><b>' + MEMBER_TYPES[t].n + '</b><span>' + MEMBER_TYPES[t].age + ' · Portion ×' + MEMBER_TYPES[t].f + '</span></span><div class="stepper sm"><button data-hh="' + t + '" data-d="-1">−</button><b>' + (S.household[t] || 0) + '</b><button data-hh="' + t + '" data-d="1">+</button></div></div>').join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Kochtage & Mahlzeiten</div><div class="field-s">Für jeden Tag festlegen, welche Mahlzeiten geplant werden.</div>' + dayPlannerHtml() + '</div>';
    h += '<div class="set-block"><div class="field-l">Wochenbudget</div><div class="budget-v">€' + S.budget + ' <small>für ' + nd + ' Tage</small></div><input type="range" class="range" id="sbudget" min="30" max="400" step="5" value="' + S.budget + '"><div class="range-l"><span>€30</span><span>€400</span></div></div>';
    h += '<div class="set-block"><div class="field-l">Ernährung</div><div class="field-s">Rezepte werden automatisch angepasst (z. B. glutenfreie Nudeln, laktosefreier Quark, Knoblauch-Öl statt Knoblauch).</div><div class="toggles">' +
      [['gf', 'Glutenfrei', 'Zöliakie / Glutenunverträglichkeit'], ['lf', 'Laktosefrei', 'Laktoseintoleranz'], ['fm', 'FODMAP-arm', 'Reizdarm – nach Monash-Portionsgrenzen'], ['veg', 'Vegetarisch', 'Ohne Fleisch & Fisch']].map(d => '<div class="card toggle ' + (S.diet[d[0]] ? 'on' : '') + '" data-diet="' + d[0] + '"><span class="tx"><b>' + d[1] + '</b><span>' + d[2] + '</span></span><span class="sw"></span></div>').join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Küchengeräte</div><div class="toggles"><div class="card toggle ' + (S.thermomix ? 'on' : '') + '" data-act="tmtoggle"><span class="tx"><b>⚙️ Ich koche mit dem Thermomix</b><span>TM6 / TM7 – Rezepte zeigen zuerst die Thermomix-Einstellungen</span></span><span class="sw"></span></div></div></div>';
    h += '<div class="set-block"><div class="field-l">Proteinpulver</div><div class="field-s">Deine Lieblingsmarke ersetzt in allen Rezepten das Proteinpulver – Nährwerte & Einkauf passen sich an.</div><select class="select" id="sprot">' + Object.keys(PROTEIN_BRANDS).map(k => '<option value="' + k + '" ' + (S.proteinBrand === k ? 'selected' : '') + '>' + PROTEIN_BRANDS[k] + '</option>').join('') + '</select></div>';
    h += '<div class="set-block"><div class="field-l">Küchen</div><div class="field-s">Welche Küchen sollen vorgeschlagen werden?</div><div data-pgscope="settings">' + cuisinePickerHtml() + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Fleisch & Fisch</div><div class="field-s">Abgewählte Sorten werden nicht vorgeschlagen.</div><div class="pg-wrap" data-pgscope="settings">' + proteinPickerHtml() + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Allergene ausschließen</div><div class="field-s">Gerichte mit diesen Zutaten werden nicht vorgeschlagen.</div><div class="filter-row" style="flex-wrap:wrap">' + ['E', 'N', 'P', 'F', 'K', 'Y', 'Z', 'M'].map(a => '<button class="fchip ' + (S.exclude.indexOf(a) >= 0 ? 'on' : '') + '" data-excl="' + a + '">' + ALLERGENS[a] + '</button>').join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Essensstimmung</div><div class="field-s">Wähle bis zu 3 Stile, die bevorzugt werden.</div><div class="styles-grid">' + Object.keys(STYLES).map(s => '<button class="style-card ' + (S.styles.indexOf(s) >= 0 ? 'on' : '') + '" data-sstyle="' + s + '"><span class="e">' + STYLES[s].e + '</span>' + STYLES[s].n + '</button>').join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Tagesziele (pro Erwachsenem)</div><div class="field-s">' + (S.goals.src === 'superhealth' ? '✓ Aus SuPER Health übernommen.' : 'Manuell – oder direkt aus SuPER Health übernehmen.') + '</div><div class="goal-grid">' +
      [['k', 'kcal'], ['p', 'Protein g'], ['c', 'Kohlenh. g'], ['f', 'Fett g']].map(g => '<div><label>' + g[1] + '</label><input type="number" inputmode="numeric" data-goal="' + g[0] + '" value="' + S.goals[g[0]] + '"></div>').join('') + '</div>' +
      '<button class="btn btn-sec btn-sm" style="margin-top:12px" data-act="importgoals" ' + (td ? '' : 'title="Auf diesem Gerät noch keine SuPER-Health-Daten gefunden"') + '>' + ic('download') + 'Ziele aus SuPER Health übernehmen</button></div>';
    h += '<div class="set-block" style="text-align:center;margin:34px 0 10px"><button class="btn btn-lime" data-act="regen-go">' + ic('spark') + 'Plan mit diesen Einstellungen neu erstellen</button></div>';
    $('#pg-einstellungen').innerHTML = h;
    $('#smarket').onchange = e => { S.market = e.target.value; save(); renderSettings(); };
    $('#sprot').onchange = e => { S.proteinBrand = e.target.value; plan().shop = {}; save(); toast('Proteinpulver: ' + PROTEIN_BRANDS[S.proteinBrand]); };
    $('#sbudget').oninput = e => { S.budget = +e.target.value; $('.budget-v').innerHTML = '€' + S.budget + ' <small>für ' + nd + ' Tage</small>'; };
    $('#sbudget').onchange = () => save();
    $$('[data-goal]').forEach(i => i.onchange = () => { S.goals[i.dataset.goal] = Math.max(0, +i.value || 0); S.goals.src = 'manual'; save(); });
  }

  /* ================= Seite: Konto ================= */
  function renderAccount() {
    const td = trackerData(), favs = S.favorites.map(id => R[id]).filter(Boolean);
    const initial = (S.name || 'S').trim().charAt(0).toUpperCase();
    let h = '<div class="page-head"><div class="eyebrow">Profil & Daten</div><h1>Konto</h1></div>';
    h += '<div class="card profile-hd"><div class="avatar">' + esc(initial) + '</div><div style="flex:1"><input class="input" id="pname" placeholder="Dein Name" value="' + esc(S.name) + '" style="border-radius:12px;padding:10px 14px"><div class="muted" style="font-size:12.5px;margin-top:6px">Profil seit ' + new Date(S.created).toLocaleDateString('de-DE') + ' · ' + Object.keys(S.plans).length + ' Wochenpläne · ' + S.favorites.length + ' Favoriten</div></div></div>';
    h += '<div class="section-t"><h2>SuPER Health</h2></div><div class="card connect"><div class="ic">S</div><div class="tx"><b><span class="status-dot ' + (td ? 'on' : '') + '"></span>' + (td ? 'Verbunden mit SuPER Health' : 'SuPER Health Tracking') + '</b><span>' + (td ? 'Ziele: ' + (td.goals ? td.goals.k + ' kcal · ' + td.goals.p + ' g Protein' : '–') + '. Mahlzeiten aus dem Plan landen direkt in deinem Tagebuch.' : 'Übertrage Mahlzeiten mit allen Nährwerten in deinen Kalorien-Tracker.') + '</span></div></div>' +
      '<div class="card" style="margin-top:10px"><a class="list-btn" href="' + esc(trackerUrl()) + '" target="superhealth" style="text-decoration:none;color:inherit">' + ic('link') + '<span class="tx">SuPER Health Tracking öffnen<span>' + esc(trackerUrl()) + '</span></span>' + ic('right') + '</a>' +
      '<a class="list-btn" href="' + esc(rechnerUrl()) + '" style="text-decoration:none;color:inherit">' + ic('einstellungen') + '<span class="tx">Ziele &amp; Rechner öffnen<span>Kalorien- und Makroziele berechnen</span></span>' + ic('right') + '</a>' +
      '<button class="list-btn" data-act="importgoals">' + ic('download') + '<span class="tx">Ziele übernehmen<span>kcal & Makros aus SuPER Health als Tagesziel</span></span></button>' +
      '<button class="list-btn" data-act="trackerurl">' + ic('einstellungen') + '<span class="tx">Tracker-Adresse ändern<span>Für eigene Domain / Self-Hosting</span></span></button></div>';
    if (S.tracked.length) h += '<div class="section-t"><h2 style="font-size:18px">Zuletzt übertragen</h2></div><div class="card" style="padding:0 16px">' + S.tracked.slice(0, 6).map(t => '<div class="shop-item" style="cursor:default;padding:12px 0"><div class="n">' + esc(t.n) + '<small>' + parseKey(t.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) + '</small></div><div class="q">' + t.k + ' kcal · ' + r0(t.p) + ' g P</div></div>').join('') + '</div>';
    if (favs.length) h += '<div class="section-t"><h2 style="font-size:18px">Deine Favoriten</h2></div><div class="fav-strip">' + favs.map(recipeCard).join('') + '</div>';
    h += '<div class="section-t"><h2 style="font-size:18px">Profile auf diesem Gerät</h2></div><div class="card">' + profiles.list.map(p => '<button class="list-btn" data-profile="' + p.id + '">' + ic('user') + '<span class="tx">' + esc(p.name) + '<span>' + (p.id === profiles.active ? 'Aktiv' : 'Wechseln') + '</span></span>' + (p.id === profiles.active ? ic('check') : '') + '</button>').join('') + '<button class="list-btn" data-act="newprofile">' + ic('plus') + '<span class="tx">Neues Profil anlegen<span>z. B. für Partner:in oder eine zweite Familie</span></span></button></div>';
    h += '<div class="section-t"><h2 style="font-size:18px">Daten & Sicherung</h2></div><div class="card"><button class="list-btn" data-act="export">' + ic('download') + '<span class="tx">Backup herunterladen<span>Alle Pläne, Favoriten & Einstellungen als Datei</span></span></button><button class="list-btn" data-act="import">' + ic('upload') + '<span class="tx">Backup wiederherstellen<span>Auf neuem Gerät oder Browser</span></span></button><button class="list-btn" data-act="onboard">' + ic('spark') + '<span class="tx">Einrichtung erneut starten</span></button><button class="list-btn danger" data-act="reset">' + ic('trash') + '<span class="tx">Profil zurücksetzen<span>Löscht alle Daten dieses Profils auf diesem Gerät</span></span></button></div>';
    h += '<p class="muted" style="font-size:12px;text-align:center;margin:26px 0 6px">SuPER Küche · Deine Daten bleiben auf deinem Gerät (kein Konto, keine Cloud nötig).<br>Nährwerte sind berechnete Richtwerte. Rezeptfotos: Wikimedia Commons & Openverse/Flickr (Symbolbilder, CC-Lizenz je Bild).</p>';
    $('#pg-konto').innerHTML = h;
    $('#pname').onchange = e => { S.name = e.target.value.trim(); save(); renderAccount(); };
  }

  /* ================= Plan-Assistent =================
   * Fragt vor dem Erstellen alles Wichtige ab (wie beim ersten Start) – Änderungen gelten auch für die Einstellungen. */
  function planWizard(fromRegen) {
    const hasLocked = Object.values(plan().slots).some(x => x.lock);
    const toggle = (on, attr, label, sub) => '<div class="card toggle ' + (on ? 'on' : '') + '" ' + attr + '><span class="tx"><b>' + label + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</span><span class="sw"></span></div>';
    let h = '<div class="sheet-pad"><div class="ob-hero" style="padding-top:0"><div class="big">🗓️</div><h2>Wochenplan erstellen</h2><p>Kurz prüfen – dann stellen wir die Woche passend zusammen.</p></div>';
    h += '<div class="set-block" style="margin-top:18px"><div class="field-l">Wer isst mit?</div><div class="members">' +
      Object.keys(MEMBER_TYPES).map(t => '<div class="card member" style="padding:9px 14px"><span class="e" style="font-size:22px">' + MEMBER_TYPES[t].e + '</span><span class="tx"><b>' + MEMBER_TYPES[t].n + '</b><span>' + MEMBER_TYPES[t].age + '</span></span><div class="stepper sm"><button data-wz="hh:' + t + ':-1">−</button><b>' + (S.household[t] || 0) + '</b><button data-wz="hh:' + t + ':1">+</button></div></div>').join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Zeitraum</div><div class="field-s">Mit den Pfeilen tageweise (‹ ›) oder wochenweise (« ») verschieben.</div>' + rangeNavHtml() + '</div>';
    h += '<div class="set-block"><div class="field-l">Kochtage & Mahlzeiten</div>' + dayPlannerHtml() + '</div>';
    h += '<div class="set-block"><div class="field-l">Ernährung</div><div class="toggles">' + [['gf', 'Glutenfrei'], ['lf', 'Laktosefrei'], ['fm', 'FODMAP-arm'], ['veg', 'Vegetarisch']].map(d => toggle(S.diet[d[0]], 'data-wz="diet:' + d[0] + '"', d[1])).join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Küchen</div><div data-pgscope="wizard">' + cuisinePickerHtml() + '</div></div>';
    if (!S.diet.veg) h += '<div class="set-block"><div class="field-l">Fleisch & Fisch</div><div class="field-s">Alles angehakt = alles erlaubt. Einzelne Sorten abwählen.</div><div class="pg-wrap" data-pgscope="wizard">' + proteinPickerHtml() + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Stil (bis zu 3)</div><div class="filter-row" style="flex-wrap:wrap">' + Object.keys(STYLES).map(st => '<button class="fchip ' + (S.styles.indexOf(st) >= 0 ? 'on' : '') + '" data-wz="style:' + st + '">' + STYLES[st].e + ' ' + STYLES[st].n + '</button>').join('') + '</div></div>';
    h += '<div class="set-block"><div class="field-l">Wochenbudget: <span id="wzb">€' + S.budget + '</span></div><input type="range" class="range" id="wzbudget" min="30" max="400" step="5" value="' + S.budget + '"></div>';
    if (fromRegen && hasLocked) h += '<div class="set-block">' + toggle(true, 'data-act="wizkeep" id="wizKeep"', 'Fixierte Gerichte behalten', '🔒 markierte Gerichte bleiben im Plan') + '</div>';
    h += '<div class="set-block" style="margin-bottom:6px"><div class="count-l" id="wzcount"></div><button class="btn btn-lime btn-block" data-act="wizgo">' + ic('spark') + 'Plan erstellen</button></div></div>';
    const keepScroll = $('#overlay').classList.contains('open') ? $('#sheet').scrollTop : 0;
    openSheet(h); $('#sheet').scrollTop = keepScroll;
    // Live-Zähler: wie viele Gerichte passen pro Mahlzeit
    const cnt = activeMeals().map(m => MEALS[m].n + ': ' + RECIPES.filter(r => eligible(r, m)).length).join(' · ');
    $('#wzcount').innerHTML = futureMealsCount() + ' Mahlzeiten von ' + dayLabel(Math.max(0, todayIndex())) + ' bis ' + dayLabel(6) + ' · passende Gerichte – ' + cnt;
    const br = $('#wzbudget'); br.oninput = () => { S.budget = +br.value; $('#wzb').textContent = '€' + S.budget; };
    $$('[data-wz]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      const [k, v, x] = b.dataset.wz.split(':');
      if (k === 'hh') { S.household[v] = Math.max(0, Math.min(12, (S.household[v] || 0) + +x)); if (persons() === 0) S.household.erwachsen = 1; }
      if (k === 'day') { S.days[+v] = !S.days[+v]; if (!S.days.some(Boolean)) S.days[+v] = true; }
      if (k === 'meal') { S.meals[v] = !S.meals[v]; if (!activeMeals().length) S.meals[v] = true; }
      if (k === 'diet') S.diet[v] = !S.diet[v];
      if (k === 'style') { const i = S.styles.indexOf(v); if (i >= 0) S.styles.splice(i, 1); else { if (S.styles.length >= 3) S.styles.shift(); S.styles.push(v); } }
      planWizard(fromRegen);
    });
  }

  /* ================= Onboarding ================= */
  let ob = 0;
  function onboarding() {
    const steps = 3;
    const dots = '<div class="ob-steps">' + Array.from({ length: steps }, (_, i) => '<i class="' + (i <= ob ? 'on' : '') + '"></i>').join('') + '</div>';
    let h = '<div class="sheet-pad">' + dots;
    if (ob === 0) {
      h += '<div class="ob-hero"><div class="big">🥗</div><h2>Willkommen in der SuPER Küche</h2><p>Gesunde, proteinreiche Wochenpläne für die ganze Familie – vom Erwachsenen bis zum Baby.</p></div>' +
        '<div class="feature-list"><div><span>💪</span>' + RECIPES.length + ' beliebte Gerichte mit exakt berechneten Nährwerten</div><div><span>👶</span>Jedes Rezept mit Tipps für Baby (Beikost) & Kleinkind</div><div><span>🌾</span>Automatisch glutenfrei, laktosefrei oder FODMAP-arm</div><div><span>🛒</span>Einkaufsplan mit Packungsgrößen, Haltbarkeit & Produktsuche (Kaufland, Lidl, Aldi …)</div><div><span>📲</span>Mahlzeiten mit einem Tipp in SuPER Health tracken</div></div>' +
        '<input class="input" id="obname" placeholder="Wie heißt du? (optional)" value="' + esc(S.name) + '" style="margin-bottom:14px"><button class="btn btn-pri btn-block" data-ob="next">Los geht’s</button>';
    } else if (ob === 1) {
      h += '<div class="ob-hero"><div class="big">👨‍👩‍👧</div><h2>Wer isst mit?</h2><p>Portionen und Einkauf werden passend berechnet.</p></div><div class="members" style="margin:18px 0">' +
        Object.keys(MEMBER_TYPES).map(t => '<div class="card member"><span class="e">' + MEMBER_TYPES[t].e + '</span><span class="tx"><b>' + MEMBER_TYPES[t].n + '</b><span>' + MEMBER_TYPES[t].age + '</span></span><div class="stepper sm"><button data-obhh="' + t + '" data-d="-1">−</button><b>' + (S.household[t] || 0) + '</b><button data-obhh="' + t + '" data-d="1">+</button></div></div>').join('') +
        '</div><div class="grid2"><button class="btn btn-sec" data-ob="back">Zurück</button><button class="btn btn-pri" data-ob="next">Weiter</button></div>';
    } else {
      h += '<div class="ob-hero"><div class="big">🌾</div><h2>Besondere Ernährung?</h2><p>Optional – alles später änderbar.</p></div><div class="toggles" style="margin:18px 0">' +
        [['gf', 'Glutenfrei'], ['lf', 'Laktosefrei'], ['fm', 'FODMAP-arm'], ['veg', 'Vegetarisch']].map(d => '<div class="card toggle ' + (S.diet[d[0]] ? 'on' : '') + '" data-obdiet="' + d[0] + '"><span class="tx"><b>' + d[1] + '</b></span><span class="sw"></span></div>').join('') +
        '</div><div class="field-l" style="font-size:15px">Mahlzeiten planen</div><div class="pick-grid" style="margin:8px 0 18px">' + MEAL_ORDER.map(m => '<button class="' + (S.meals[m] ? 'on' : '') + '" data-obmeal="' + m + '">' + MEALS[m].e + ' ' + MEALS[m].n + '</button>').join('') + '</div>' +
        '<div class="grid2"><button class="btn btn-sec" data-ob="back">Zurück</button><button class="btn btn-lime" data-ob="finish">' + ic('spark') + 'Plan erstellen</button></div>';
    }
    h += '</div>';
    openSheet(h, () => { if (!S.onboarded) { S.onboarded = true; save(); } });
    const nm = $('#obname'); if (nm) nm.oninput = () => { S.name = nm.value.trim(); };
  }

  /* ================= Events ================= */
  document.addEventListener('click', ev => {
    const t = ev.target.closest('[data-act],[data-open],[data-fav],[data-swap],[data-lock],[data-del],[data-addslot],[data-go],[data-style],[data-cu],[data-fmeal],[data-ffav],[data-fbaby],[data-ftm],[data-fdiet],[data-cook],[data-fstyle-clear],[data-fcu-clear],[data-tab],[data-portion],[data-serv],[data-shop],[data-hh],[data-day],[data-meal],[data-diet],[data-excl],[data-sstyle],[data-profile],[data-rsdone],[data-rsserv],[data-exrm],[data-kx],[data-dm],[data-shopplace],[data-shopgroup],[data-pg],[data-pgall],[data-shopday],[data-pantry],[data-mode],[data-prod],[data-ob],[data-obhh],[data-obdiet],[data-obmeal]');
    if (!t) { if (ev.target === $('#overlay')) closeSheet(); return; }
    const d = t.dataset;
    if (d.fav) { ev.preventDefault(); ev.stopPropagation(); const i = S.favorites.indexOf(d.fav); if (i >= 0) S.favorites.splice(i, 1); else S.favorites.push(d.fav); save(); toast(i >= 0 ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt ❤️'); if ($('#sheet [data-choose]')) { t.classList.toggle('on'); refresh(); return; } if ($('#overlay').classList.contains('open') && detail.id === d.fav) renderRecipeSheet(); refresh(); return; }
    if (d.swap) { ev.stopPropagation(); swapSlot(d.swap); return; }
    if (d.lock) { ev.stopPropagation(); const s = plan().slots[d.lock]; s.lock = !s.lock; save(); renderPlan(); toast(s.lock ? 'Fixiert – bleibt beim Neu-Mischen' : 'Fixierung gelöst'); return; }
    if (d.del) { ev.stopPropagation(); delete plan().slots[d.del]; plan().shop = {}; save(); renderPlan(); return; }
    if (d.addslot) { addToSlotSheet(d.addslot); return; }
    if (d.open) { openRecipe(d.open); return; }
    if (d.go) { location.hash = '#' + d.go; return; }
    if (d.style) { RF.style = d.style; renderRecipes(); return; }
    if (d.cu) { RF.cu = d.cu; renderRecipes(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (d.fmeal !== undefined) { RF.meal = d.fmeal; renderRecipes(); return; }
    if ('ffav' in d) { RF.fav = !RF.fav; renderRecipes(); return; }
    if ('fbaby' in d) { RF.baby = !RF.baby; renderRecipes(); return; }
    if ('ftm' in d) { RF.tm = !RF.tm; renderRecipes(); return; }
    if (d.fdiet) { const i = RF.dt.indexOf(d.fdiet); if (i >= 0) RF.dt.splice(i, 1); else RF.dt.push(d.fdiet); renderRecipes(); return; }
    if (d.cook) { detail.cook = d.cook; renderRecipeSheet(); return; }
    if ('fstyleClear' in d) { RF.style = ''; renderRecipes(); return; }
    if ('fcuClear' in d) { RF.cu = ''; renderRecipes(); return; }
    if (d.tab) { detail.tab = d.tab; renderRecipeSheet(); return; }
    if (d.portion) { detail.portion = d.portion; renderRecipeSheet(); return; }
    if (d.serv) { detail.serv = Math.max(0.5, (detail.serv || servings()) + +d.serv); renderRecipeSheet(); return; }
    if (d.prod) { ev.stopPropagation(); productSheet(d.prod); return; }
    if (d.mode) { ev.stopPropagation(); const p = plan(); p.mode = p.mode || {}; const it = buildShop().find(i => i.key === d.mode); p.mode[d.mode] = it && it.theke ? 'pack' : 'theke'; save(); renderShop(); return; }
    if (d.rsdone) { recShop.done[d.rsdone] = !recShop.done[d.rsdone]; t.classList.toggle('done'); return; }
    if (d.rsserv) { recShop.serv = Math.max(0.5, recShop.serv + +d.rsserv); recipeShopSheet(recShop.id); return; }
    if (d.exrm !== undefined) { const p = plan(); (p.extras || []).splice(+d.exrm, 1); save(); renderShop(); toast('Aus der Einkaufsliste entfernt'); return; }
    if (d.shop) { const p = plan(); p.shop[d.shop] = !p.shop[d.shop]; save(); renderShop(); return; }
    if (d.pantry) { S.pantry[d.pantry] = !S.pantry[d.pantry]; save(); renderShop(); return; }
    if (d.shopday) { const i = +d.shopday, sd = shopDays(), j = sd.indexOf(i); if (j >= 0) { if (sd.length > 1) sd.splice(j, 1); } else sd.push(i); S.shopDays = sd.sort((a, b) => a - b); save(); renderShop(); return; }
    if (d.hh) { S.household[d.hh] = Math.max(0, Math.min(12, (S.household[d.hh] || 0) + +d.d)); if (persons() === 0) S.household.erwachsen = 1; plan().shop = {}; save(); renderSettings(); return; }
    if (d.day) { S.days[+d.day] = !S.days[+d.day]; if (!S.days.some(Boolean)) S.days[+d.day] = true; save(); renderSettings(); return; }
    if (d.meal) { S.meals[d.meal] = !S.meals[d.meal]; if (!activeMeals().length) S.meals[d.meal] = true; save(); renderSettings(); return; }
    if (d.diet) { S.diet[d.diet] = !S.diet[d.diet]; save(); renderSettings(); toast(Core.DIETS[d.diet].n + (S.diet[d.diet] ? ' aktiviert' : ' deaktiviert')); return; }
    if (d.excl) { const i = S.exclude.indexOf(d.excl); if (i >= 0) S.exclude.splice(i, 1); else S.exclude.push(d.excl); save(); renderSettings(); return; }
    if (d.sstyle) { const i = S.styles.indexOf(d.sstyle); if (i >= 0) S.styles.splice(i, 1); else { if (S.styles.length >= 3) S.styles.shift(); S.styles.push(d.sstyle); } save(); renderSettings(); return; }
    if (d.kx) {
      ev.stopPropagation();
      const ids = Object.keys(CUISINES).filter(c => RECIPES.some(r => r.cu === c));
      if (d.kx === 'open') cuiOpen = !cuiOpen;
      else if (d.kx === 'all') { const allOn = ids.every(c => S.noCuisine.indexOf(c) < 0); S.noCuisine = allOn ? ids.slice() : []; if (allOn) cuiOpen = true; }
      else { const c = d.kx.split(':')[1], i = S.noCuisine.indexOf(c); if (i >= 0) S.noCuisine.splice(i, 1); else S.noCuisine.push(c); }
      if (ids.every(c => S.noCuisine.indexOf(c) >= 0) && d.kx !== 'all') S.noCuisine = S.noCuisine.filter(c => c !== d.kx.split(':')[1]);
      save();
      if ($('#wzcount')) planWizard(!!$('#wizKeep')); else renderSettings();
      return;
    }
    if (d.dm) {
      ev.stopPropagation();
      const [k, a, b] = d.dm.split(':'), i = +a, any = x => MEAL_ORDER.some(m => S.dayMeals[x][m]);
      if (k === 'day') { S.days[i] = !S.days[i]; if (S.days[i] && !any(i)) S.dayMeals[i].abend = true; if (!S.days.some(Boolean)) S.days[i] = true; }
      if (k === 'edit') { dmEdit = (i === dmEdit || i < 0) ? -1 : i; if (dmEdit >= 0 && !S.days[dmEdit]) { S.days[dmEdit] = true; if (!any(dmEdit)) S.dayMeals[dmEdit].abend = true; } }
      if (k === 'meal') { S.dayMeals[i][b] = !S.dayMeals[i][b]; S.days[i] = any(i); if (!S.days.some(Boolean)) { S.days[i] = true; S.dayMeals[i][b] = true; } }
      if (k === 'copy') { for (let x = 0; x < 7; x++) { S.dayMeals[x] = Object.assign({}, S.dayMeals[i]); S.days[x] = true; } }
      if (k === 'all') { const days = S.days.map((on, x) => on ? x : -1).filter(x => x >= 0); const all = days.every(x => S.dayMeals[x][a]); days.forEach(x => { S.dayMeals[x][a] = !all; if (!any(x)) S.dayMeals[x][a] = true; }); S.meals[a] = !all; }
      plan().shop = {}; save();
      if ($('#wzcount')) planWizard(!!$('#wizKeep')); else renderSettings();
      return;
    }
    if (d.shopplace) {
      ev.stopPropagation();
      const x = d.shopplace, j = S.stores.indexOf(x);
      if (j >= 0) { if (S.stores.length > 1) S.stores.splice(j, 1); } else S.stores.push(x);
      if (S.stores.indexOf(S.market) < 0) { const nm = S.stores.find(y => MARKETS[y]); if (nm) S.market = nm; }
      fixState(); save(); renderShop(); return;
    }
    if (d.shopgroup) { S.shopGroup = d.shopgroup; save(); renderShop(); return; }
    if (d.pg || d.pgall) {
      ev.stopPropagation();
      const toggleG = g => { const i = S.noProtein.indexOf(g); if (i >= 0) S.noProtein.splice(i, 1); else S.noProtein.push(g); };
      if (d.pg) toggleG(d.pg);
      else { const ids = Object.keys(PROTEIN_GROUPS[d.pgall].items), allOn = ids.every(g => S.noProtein.indexOf(g) < 0); S.noProtein = S.noProtein.filter(g => ids.indexOf(g) < 0); if (allOn) S.noProtein.push(...ids); }
      save();
      const scope = t.closest('[data-pgscope]'); if (scope && scope.dataset.pgscope === 'wizard') planWizard(!!$('#wizKeep')); else renderSettings();
      return;
    }
    if (d.profile) { if (d.profile !== profiles.active) switchProfile(d.profile); return; }
    if (d.obhh) { S.household[d.obhh] = Math.max(0, Math.min(12, (S.household[d.obhh] || 0) + +d.d)); if (persons() === 0) S.household.erwachsen = 1; onboarding(); return; }
    if (d.obdiet) { S.diet[d.obdiet] = !S.diet[d.obdiet]; onboarding(); return; }
    if (d.obmeal) { setMealAll(d.obmeal, !S.meals[d.obmeal]); if (!activeMeals().length) setMealAll(d.obmeal, true); onboarding(); return; }
    if (d.ob) {
      if (d.ob === 'next') { ob++; save(); onboarding(); }
      else if (d.ob === 'back') { ob = Math.max(0, ob - 1); onboarding(); }
      else if (d.ob === 'finish') { S.onboarded = true; importGoalsFromTracker(true); generateWeek(false); closeSheet(); location.hash = '#plan'; renderPlan(); toast('Dein Wochenplan ist fertig 🎉'); }
      return;
    }
    if (d.act) action(d.act, t, ev);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay').classList.contains('open')) closeSheet(); });

  function action(a, t, ev) {
    const p = plan();
    switch (a) {
      case 'close': closeSheet(); break;
      case 'generate': planWizard(false); break;
      case 'regen': planWizard(true); break;
      case 'wizgo': { const keep = !!$('#wizKeep') && $('#wizKeep').classList.contains('on'); save(); generateWeek(keep); closeSheet(); location.hash = '#plan'; renderPlan(); const n = Object.keys(plan().slots).length; toast(n ? 'Wochenplan erstellt ✓ (' + n + ' Gerichte)' : 'Keine passenden Gerichte – Auswahl lockern'); break; }
      case 'wizkeep': t.classList.toggle('on'); break;
      case 'regen-go': generateWeek(true); location.hash = '#plan'; toast('Neuer Plan erstellt ✓'); break;
      case 'clearweek': if (confirm('Alle Gerichte dieser 7 Tage entfernen?')) { plan().slots = {}; save(); renderPlan(); planWizard(false); } break;
      case 'thisweek': ev.preventDefault(); shiftRange(0, new Date()); break;
      case 'fromtomorrow': shiftRange(0, addDays(new Date(), 1)); break;
      case 'nextmonday': { const t = new Date(); shiftRange(0, addDays(t, ((8 - t.getDay()) % 7) || 7)); break; }
      case 'dprev': shiftRange(-1); break;
      case 'dnext': shiftRange(1); break;
      case 'wprev': ev.preventDefault(); shiftRange(-7); break;
      case 'wnext': ev.preventDefault(); shiftRange(7); break;
      case 'moreRecipes': { const y = window.scrollY; RF.limit += 48; renderRecipes(); window.scrollTo(0, y); break; }
      case 'togglediet': ev.preventDefault(); RF.dietOnly = !RF.dietOnly; renderRecipes(); break;
      case 'addplan': pickSlotSheet(detail.id); break;
      case 'trackone': trackOneSheet(detail.id); break;
      case 'autoslot': { const sk = t.dataset.sk, ml = sk.split('|')[1], ctx = makeCtx(p); const cands = RECIPES.filter(x => eligible(x, ml) && matchF(x, slotF) && !ctx.used.has(x.id)).sort((a, b) => scoreRecipe(b, ctx) - scoreRecipe(a, ctx)); const r = cands[Math.floor(Math.random() * Math.min(3, cands.length))] || pickFor(ml, ctx); if (r) { p.slots[sk] = { r: r.id, lock: false }; p.shop = {}; save(); } closeSheet(); renderPlan(); break; }
      case 'trackweek': {
        const items = Object.keys(p.slots).sort().map(sk => { const [d, m] = sk.split('|'); return entryFor(R[p.slots[sk].r], 'erwachsen', keyOf(addDays(weekStart, +d)), m); });
        if (!items.length) return;
        trackSheet(items, 'Woche an SuPER Health'); break;
      }
      case 'copyshop': copy(shopText()).then(() => toast('Einkaufsliste kopiert ✓')); break;
      case 'shareshop': if (navigator.share) navigator.share({ title: 'Einkaufsliste', text: shopText() }).catch(() => { }); else copy(shopText()).then(() => toast('Kopiert – jetzt einfügen & teilen')); break;
      case 'printshop': $$('.page').forEach(x => x.classList.toggle('print-me', x.id === 'pg-einkauf')); window.print(); break;
      case 'resetshop': p.shop = {}; p.mode = {}; save(); renderShop(); break;
      case 'tmtoggle': S.thermomix = !S.thermomix; save(); renderSettings(); toast(S.thermomix ? 'Thermomix-Modus aktiv ⚙️' : 'Thermomix-Modus aus'); break;
      case 'cookidoo': copy(cookidooText(R[detail.id])).then(() => toast('Rezept kopiert – in Cookidoo einfügen ✓')); break;
      case 'recipeshop': recipeShopSheet(detail.id); break;
      case 'rsweek': { const p = plan(); p.extras = p.extras || []; p.extras.push({ r: recShop.id, serv: recShop.serv }); save(); closeSheet(); toast(R[recShop.id].n + ' → Wochen-Einkaufsliste ✓', '<a href="#einkauf">Ansehen</a>'); if (current === 'einkauf') renderShop(); else if (current === 'plan') renderPlan(); break; }
      case 'rscopy': copy(recipeShopText()).then(() => toast('Einkaufsliste kopiert ✓')); break;
      case 'rsplan': pickSlotSheet(recShop.id); break;
      case 'rsback': openRecipe(recShop.id); break;
      case 'theke': S.theke = !S.theke; plan().mode = {}; save(); renderShop(); break;
      case 'prodclear': delete S.products[t.dataset.key]; save(); closeSheet(); renderShop(); break;
      case 'importgoals': if (importGoalsFromTracker(false)) refresh(); else if (!trackerData()) toast('Öffne SuPER Health einmal auf dieser Website, dann klappt die Übernahme', '<a href="' + esc(trackerUrl()) + '" target="superhealth">Öffnen</a>'); break;
      case 'trackerurl': { const u = prompt('Adresse deines SuPER-Health-Trackers (leer = Standard):', S.trackerUrl || trackerUrl()); if (u !== null) { S.trackerUrl = u.trim(); save(); renderAccount(); } break; }
      case 'export': exportData(); break;
      case 'import': $('#importFile').click(); break;
      case 'onboard': ob = 0; onboarding(); break;
      case 'newprofile': { const n = prompt('Name des neuen Profils:'); if (n) { const id = uid(); profiles.list.push({ id, name: n.trim() }); lsSet('sk_profiles', profiles); lsSet('sk_data_' + id, Object.assign(DEFAULT_STATE(), { name: n.trim() })); switchProfile(id); } break; }
      case 'reset': if (confirm('Wirklich alle Daten dieses Profils auf diesem Gerät löschen? Tipp: vorher ein Backup herunterladen.')) { S = DEFAULT_STATE(); save(); ob = 0; refresh(); onboarding(); } break;
    }
  }
  function copy(text) { if (navigator.clipboard) return navigator.clipboard.writeText(text); const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve(); }
  function switchProfile(id) { profiles.active = id; lsSet('sk_profiles', profiles); S = Object.assign(DEFAULT_STATE(), lsGet('sk_data_' + id, {})); refresh(); toast('Profil: ' + (S.name || 'gewechselt')); if (!S.onboarded) { ob = 0; onboarding(); } }
  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'SuPER Küche', version: 1, exported: new Date().toISOString(), data: S }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'super-kueche-backup-' + keyOf(new Date()) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup gespeichert ✓');
  }
  $('#importFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { const d = JSON.parse(rd.result); if (!d.data || !d.data.plans) throw new Error('format'); S = Object.assign(DEFAULT_STATE(), d.data); save(); refresh(); toast('Backup wiederhergestellt ✓'); } catch (err) { toast('Datei ist kein gültiges Backup'); } };
    rd.readAsText(f); e.target.value = '';
  });
  function refresh() { fixState(); show(current); }

  /* ================= Start ================= */
  renderNav();
  window.addEventListener('hashchange', route);
  // Datum aktuell halten (App bleibt z. B. über Nacht offen): beim Zurückkehren neu berechnen
  let lastDay = keyOf(new Date());
  function checkDate() { const k = keyOf(new Date()); if (k !== lastDay) { if (keyOf(weekStart) === lastDay) weekStart = startOfDay(new Date()); lastDay = k; refresh(); } }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDate(); });
  window.addEventListener('focus', checkDate);
  setInterval(checkDate, 60000);
  if (S.goals.src === 'superhealth') importGoalsFromTracker(true); // Ziele aktuell halten
  route();
  publishPlan();
  if (!S.onboarded) setTimeout(onboarding, 300);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    // Neue Version veröffentlicht → neuer Service Worker übernimmt → Seite einmal neu laden (immer aktueller Stand)
    const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register('sw.js').then(reg => reg.update()).catch(() => { });
  }
})();
