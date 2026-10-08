// GET /api/product-search?q=<text>&store=<lidl|kaufland|aldi|rewe|edeka|penny|netto>
// Supermarkt-Produktsuche über die offene Open-Food-Facts-Suche (search-a-licious).
// Kein API-Key nötig. Läuft serverseitig, weil die Suche im Browser CORS-blockiert ist.
// Liefert echte Produkte inkl. Marke, Packungsgröße (in g/ml) und Bild.

function parseQty(s) {
  if (!s) return 0;
  const m = String(s).replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(kg|g|l|ml|cl)\b/i);
  if (!m) return 0;
  const v = +m[1], u = m[2].toLowerCase();
  return Math.round(u === 'kg' || u === 'l' ? v * 1000 : u === 'cl' ? v * 10 : v);
}

// Relevanz: Hauptwort der Suche muss im Produktnamen stehen – oder die gesuchte Marke passt (z. B. „K-free Nudeln“).
const norm = t => String(t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
const BRANDS = ['k-free', 'enjoy free', 'rewe frei von', 'schaer', 'barilla', '3pauly', 'hammermuehle', 'bauck', 'koelln', 'kikkoman', 'clearspring'];
const STOP = /^(mit|ohne|und|frisch|natur|light|tk|glutenfrei|laktosefrei|free|frei|von|enjoy|k)$/;
const SYN = {
  nudeln: ['nudel', 'pasta', 'spaghetti', 'penne', 'fusilli', 'fussili', 'farfalle', 'maccheroni', 'linguine', 'tagliatelle', 'spirelli', 'rigatoni', 'tortiglioni', 'eliche'],
  brot: ['brot', 'toast', 'baguette', 'ciabatta', 'broetchen', 'panini'], broetchen: ['broetchen', 'ciabatta', 'bun', 'panini', 'bon matin', 'baguette'],
  mehl: ['mehl', 'mix', 'backmischung'], haferflocken: ['hafer', 'oats'], lasagne: ['lasagne', 'lasagna'], gnocchi: ['gnocchi'],
  paniermehl: ['paniermehl', 'panier', 'semmelbroesel'], pizzaboden: ['pizza'], pizzateig: ['pizza'], muesli: ['muesli', 'granola', 'musli'],
  tortillas: ['tortilla', 'wrap', 'taco'], tamari: ['tamari', 'soja', 'soy'], sojasauce: ['soja', 'soy', 'tamari'],
};
function nounMatch(name, w) { const list = SYN[w] || [w.slice(0, Math.min(6, w.length))]; return list.some(x => name.includes(x)); }
function score(p, q) {
  const nq = norm(q), name = norm(p.name), brand = norm(p.brand);
  const wantBrand = BRANDS.find(b => nq.includes(b));
  let rest = nq; if (wantBrand) rest = rest.replace(wantBrand, ' ');
  const words = rest.split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !STOP.test(w));
  const noun = words.length ? nounMatch(name, words[0]) : true;
  const ALIAS = { 'k-free': ['k-free', 'k free', 'kaufland free', 'kfree'], 'enjoy free': ['enjoy free'], 'rewe frei von': ['rewe frei von', 'rewe free'] };
  const brandOk = wantBrand ? (ALIAS[wantBrand] || [wantBrand.split(' ')[0]]).some(a => brand.includes(a) || name.includes(a)) : false;
  if (wantBrand) return brandOk ? (noun ? 3 : 2) : (noun ? 1 : 0);
  return noun ? 2 : 0;
}

// Glutenfrei-Prüfung: Kennzeichnung im Namen/Label oder reine Glutenfrei-Marken. Im Zweifel ausblenden.
const GF_RE = /gluten.?fre|glutenfrei|ohne gluten|senza glutine|sans gluten|sin gluten/;
const GF_BRANDS_ONLY = /^(schaer|schar|dr.? schar|enjoy free|k-free|3pauly|hammermuehle|glutenfrei|bezgluten|semper)/;
function isGF(p) {
  const labels = (p.labels_tags || []).join(' ');
  if (/en:gluten-free|en:no-gluten|crossed-grain/.test(labels)) return true;
  if (GF_RE.test(norm(p.product_name_de || p.product_name))) return true;
  const brands = (Array.isArray(p.brands) ? p.brands : String(p.brands || '').split(',')).map(b => norm(b).trim());
  return brands.some(b => GF_BRANDS_ONLY.test(b));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = ((req.query && req.query.q) || '').toString().trim().slice(0, 80);
  const store = ((req.query && req.query.store) || '').toString().replace(/[^a-z-]/gi, '').toLowerCase();
  if (q.length < 2) return res.status(200).json({ results: [] });

  const fields = 'code,product_name,product_name_de,brands,quantity,product_quantity,stores,image_front_small_url,nutriscore_grade,countries_tags,labels_tags';
  const onlyGF = ((req.query && req.query.gf) || '') === '1';
  const url = 'https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q + (store ? ' stores:' + store : '')) +
    '&page_size=' + (onlyGF ? 100 : 40) + '&langs=de&fields=' + fields;

  // Im Glutenfrei-Modus zusätzlich gezielt nach glutenfreien Varianten suchen (mehr Treffer nach der strengen Prüfung)
  const noun = q.replace(/k-free|enjoy free!?|rewe frei von|sch(ä|ae)r|barilla|3pauly|hammerm(ü|ue)hle|glutenfrei/gi, '').trim();
  const urls = [url];
  if (onlyGF && noun) for (const extra of [noun + ' glutenfrei', 'Schär ' + noun]) urls.push('https://search.openfoodfacts.org/search?q=' + encodeURIComponent(extra + (store ? ' stores:' + store : '')) + '&page_size=60&langs=de&fields=' + fields);
  let hits = [];
  await Promise.all(urls.map(async u => {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'SuPER-Kueche/1.0 (Wochenplaner)' } });
      if (r.ok) hits = hits.concat((await r.json()).hits || []);
    } catch (e) { /* weiter */ }
  }));

  const seen = new Set(), results = [];
  for (const p of hits) {
    const name = ((p.product_name_de || p.product_name) || '').toString().trim();
    if (!name) continue;
    if (onlyGF && !isGF(p)) continue;
    const countries = p.countries_tags || [];
    if (countries.length && !countries.some(c => /germany|deutschland|austria/.test(c))) continue;
    const brand = (Array.isArray(p.brands) ? p.brands[0] : (p.brands || '')).toString().split(',')[0].trim();
    const size = parseQty(p.quantity) || Math.round(+p.product_quantity || 0);
    const key = (name + '|' + brand + '|' + size).toLowerCase();
    if (seen.has(key)) continue; seen.add(key);
    results.push({
      code: p.code || '', name: name.length > 70 ? name.slice(0, 68) + '…' : name, brand, qty: p.quantity || '', size,
      stores: Array.isArray(p.stores) ? p.stores.join(', ') : (p.stores || ''), img: p.image_front_small_url || '', ns: p.nutriscore_grade || '', gf: isGF(p),
    });
  }
  for (const r of results) r._s = score(r, q);
  const ranked = results.filter(r => onlyGF ? (r._s === 3 || r._s === 2 && score(r, q.replace(/k-free|enjoy free!?|rewe frei von|sch(ä|ae)r|barilla|3pauly|hammerm(ü|ue)hle/gi, '')) > 0) : r._s > 0).sort((x, y) => y._s - x._s).slice(0, 24).map(r => { delete r._s; return r; });
  return res.status(200).json({ results: ranked });
}
