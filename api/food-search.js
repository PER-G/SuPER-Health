// GET /api/food-search?q=<text> — Lebensmittel-Namenssuche.
// Eigenständige Vercel Serverless Function. KEIN API-Key nötig.
// Fragt die offene Open-Food-Facts-Volltextsuche (search-a-licious) serverseitig ab
// (die ist im Browser CORS-blockiert) und liefert normalisierte Treffer pro 100 g zurück.

function pickKcal(nu) {
  let k = nu['energy-kcal_100g'];
  if (k == null && nu['energy_100g'] != null) k = nu['energy_100g'] / 4.184;
  return Math.round(k || 0);
}
function r1(x) { return Math.round((+x || 0) * 10) / 10; }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 1 Tag clientseitig + CDN cachen – die Daten ändern sich kaum.
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = ((req.query && req.query.q) || '').toString().trim();
  if (q.length < 2) return res.status(200).json({ results: [] });

  const fields = 'product_name,product_name_de,brands,nutriments';
  const urls = [
    'https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q) + '&page_size=40&fields=' + fields,
    // Fallback: altes search.pl (manchmal überlastet, aber serverseitig CORS egal)
    'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
      '&search_simple=1&action=process&json=1&page_size=40&lc=de&fields=' + fields,
  ];

  let hits = [];
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'SuPER-Health/1.0 (Ernaehrungs-Tracker)' },
      });
      if (!r.ok) continue;
      const j = await r.json();
      hits = j.hits || j.products || [];
      if (hits.length) break;
    } catch (e) { /* nächste URL versuchen */ }
  }

  const seen = new Set();
  const results = [];
  for (const p of hits) {
    const nu = p.nutriments || {};
    const k = pickKcal(nu);
    let name = ((p.product_name_de || p.product_name) || '').toString().trim();
    if (!name || !k || k > 900) continue;
    let brand = p.brands;
    if (Array.isArray(brand)) brand = brand[0];
    brand = (brand || '').toString().split(',')[0].trim();
    if (brand && !name.toLowerCase().includes(brand.toLowerCase())) name += ' (' + brand + ')';
    if (name.length > 54) name = name.slice(0, 52) + '…';
    const pr = r1(nu['proteins_100g']), c = r1(nu['carbohydrates_100g']), f = r1(nu['fat_100g']);
    if (!pr && !c && !f) continue; // ohne Makros überspringen
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ n: name, k, p: pr, c, f });
    if (results.length >= 25) break;
  }

  return res.status(200).json({ results });
}
