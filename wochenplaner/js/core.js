/* SuPER Küche – Rechen-Kern: Diät-Anpassung, Nährwerte, Hinweise.
 * Läuft im Browser (globale Funktionen) und in Node (module.exports) für die Datenprüfung. */
(function (root) {
  /* global ING, BABY_WARN */
  const G = (typeof ING !== 'undefined') ? { ING, BABY_WARN } : require('./ingredients.js');
  const ING_ = G.ING, BW = G.BABY_WARN;
  return superKuecheCore(ING_, BW);
})(typeof window !== 'undefined' ? window : globalThis);

function superKuecheCore(ING, BABY_WARN) {
  const root = typeof window !== 'undefined' ? window : globalThis;

  const DIETS = {
    gf: { n: 'Glutenfrei', short: 'GF', flag: 'G' },
    lf: { n: 'Laktosefrei', short: 'LF', flag: 'L' },
    fm: { n: 'FODMAP-arm', short: 'FM' },
    veg: { n: 'Vegetarisch', short: 'VEG', flag: 'X' },
  };

  function hasFlag(ing, f) { return (ing.fl || '').indexOf(f) >= 0; }
  function isHighFodmap(ing, grams) { return ing.fm !== undefined && grams > ing.fm; }

  /* Wendet Ernährungsformen auf ein Rezept an: tauscht Zutaten automatisch aus.
   * diet: {gf, lf, fm, veg} → {items:[{key, g, ing, swappedFrom}], ok, blockers:[], swaps:[]} */
  function adapt(recipe, diet) {
    diet = diet || {};
    const items = [], blockers = [], swaps = [];
    for (const [key0, g] of recipe.i) {
      // Markenvorliebe (z. B. Whey → ESN Designer Whey) vor dem Diät-Austausch anwenden
      const prefKey = diet.pref && diet.pref[key0];
      let key = prefKey && ING[prefKey] ? prefKey : key0, ing = ING[key];
      if (!ing) { blockers.push('Unbekannte Zutat: ' + key0); continue; }
      const swappedFrom = [];
      let grams = g;
      for (let pass = 0; pass < 3; pass++) {
        let next = null;
        if (diet.gf && hasFlag(ing, 'G') && ing.sw && ing.sw.gf) next = ing.sw.gf;
        else if (diet.lf && hasFlag(ing, 'L') && ing.sw && ing.sw.lf) next = ing.sw.lf;
        else if (diet.fm && isHighFodmap(ing, grams) && ing.sw && ing.sw.fm) next = ing.sw.fm;
        if (!next || !ING[next]) break;
        swappedFrom.push(ing.n);
        // swf: Mengenfaktor beim Tausch (z. B. frische Udon → trockene Reisnudeln = 0,4)
        if (ing.swf) grams = Math.round(grams * ing.swf * 10) / 10;
        key = next; ing = ING[next];
      }
      // Knoblauch → Knoblauch-Öl: Menge auf sinnvolle Ölmenge reduzieren
      if (key0 === 'knoblauch' && key === 'knoblauchoel') grams = Math.min(5, g);
      if (swappedFrom.length) swaps.push({ from: swappedFrom[0], to: ing.n });
      if (diet.gf && hasFlag(ing, 'G')) blockers.push(ing.n + ' (Gluten)');
      if (diet.lf && hasFlag(ing, 'L')) blockers.push(ing.n + ' (Laktose)');
      if (diet.fm && isHighFodmap(ing, grams)) blockers.push(ing.n + ' (FODMAPs)');
      if (diet.veg && hasFlag(ing, 'X')) blockers.push(ing.n + ' (nicht vegetarisch)');
      items.push({ key, g: grams, ing, swappedFrom: swappedFrom[0] || null });
    }
    return { items, ok: blockers.length === 0, blockers, swaps };
  }

  /* Nährwerte für eine Liste an Zutaten (Gramm) × Faktor */
  function nutrition(items, factor) {
    factor = factor || 1;
    const t = { k: 0, p: 0, c: 0, f: 0, fi: 0, su: 0, sa: 0, cost: 0, g: 0 };
    for (const it of items) {
      const x = it.g / 100 * factor, n = it.ing;
      t.k += n.k * x; t.p += n.p * x; t.c += n.c * x; t.f += n.f * x;
      t.fi += (n.fi || 0) * x; t.su += (n.su || 0) * x; t.sa += (n.sa || 0) * x;
      t.cost += (n.pr || 0) * it.g / 1000 * factor; t.g += it.g * factor;
    }
    return t;
  }

  /* Natürliche Eignung (ohne Austausch) und mit Austausch */
  function dietStatus(recipe) {
    const res = {};
    for (const d of ['gf', 'lf', 'fm', 'veg']) {
      const natural = adapt(recipe, {}).items.every(it => {
        if (d === 'gf') return !hasFlag(it.ing, 'G');
        if (d === 'lf') return !hasFlag(it.ing, 'L');
        if (d === 'fm') return !isHighFodmap(it.ing, it.g);
        if (d === 'veg') return !hasFlag(it.ing, 'X');
      });
      const o = {}; o[d] = true;
      res[d] = natural ? 2 : (adapt(recipe, o).ok ? 1 : 0); // 2 = von Natur aus, 1 = mit Austausch, 0 = nein
    }
    return res;
  }

  function allergens(items) {
    const s = new Set();
    for (const it of items) for (const ch of (it.ing.fl || '')) if ('GLMENPFKYZ'.indexOf(ch) >= 0) s.add(ch);
    return [...s];
  }

  function babyWarnings(items) {
    const s = new Set();
    for (const it of items) for (const ch of (it.ing.b || '')) s.add(ch);
    return [...s].map(k => Object.assign({ k }, BABY_WARN[k]));
  }

  /* Stil-Kategorien (automatisch) */
  function styles(recipe, n) {
    const out = [];
    const protPct = n.p * 4 / Math.max(1, n.k);
    if (n.p >= 30 || (protPct >= 0.3 && n.p >= 15)) out.push('protein');
    if (n.k <= 450 && recipe.m.indexOf('snack') < 0) out.push('leicht');
    if (recipe.t <= 20) out.push('schnell');
    if ((recipe.st || []).indexOf('comfort') >= 0) out.push('comfort');
    if (recipe.baby >= 2) out.push('familie');
    if ((recipe.st || []).indexOf('mealprep') >= 0) out.push('mealprep');
    return out;
  }

  const api = { DIETS, adapt, nutrition, dietStatus, allergens, babyWarnings, styles, hasFlag };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Core = api;
}
