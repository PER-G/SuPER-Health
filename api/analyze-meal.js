// POST /api/analyze-meal — Mahlzeit-Foto-Analyse mit Claude Vision.
// Eigenständige Vercel Serverless Function. Benötigt ENV: ANTHROPIC_API_KEY
// Optional ENV: MEAL_API_TOKEN (wenn gesetzt, muss der Client ihn als Bearer mitsenden).
import Anthropic from '@anthropic-ai/sdk';

// Haiku 4.5 = günstig & für Erkennung + Mengen ausreichend. Für höhere Genauigkeit:
// 'claude-sonnet-4-6'. (Modell-IDs siehe Anthropic-Doku.)
const MODEL = process.env.MEAL_MODEL || 'claude-haiku-4-5';

const SYS = `Du bist ein präziser Ernährungs-Analyse-Assistent. Auf dem Foto ist eine Mahlzeit.
Aufgabe:
1) Erkenne die Mahlzeit und ihre sichtbaren Einzelzutaten (2–8 Stück).
2) Schätze für jede Zutat eine realistische Portionsmenge in GRAMM für diesen Teller.
3) Gib die Nährwerte PRO 100 g an: Kalorien (k), Protein (p), Kohlenhydrate (c), Fett (f).

Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown, ohne Codeblock, ohne Erklärtext, exakt in diesem Schema:
{"meal":"<kurzer Name>","ingredients":[{"name":"<Zutat, deutsch>","emoji":"<genau 1 passendes Emoji>","grams":<ganzzahl>,"per100":{"k":<ganzzahl>,"p":<zahl>,"c":<zahl>,"f":<zahl>}}],"note":"<kurzer Hinweis oder leerer String>"}

Regeln:
- Werte in per100 sind PRO 100 g, NICHT pro Portion.
- Mengen realistisch für eine normale Portion (z. B. gekochte Pasta 150–250 g).
- Keine Getränke, außer sie sind klar Teil der Mahlzeit.
- Bei Unsicherheit eher konservativ schätzen und das in "note" erwähnen.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const need = process.env.MEAL_API_TOKEN;
  if (need) {
    const tok = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (tok !== need) return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { image, mediaType = 'image/jpeg', hint = '' } = req.body || {};
    if (!image || typeof image !== 'string') return res.status(400).json({ error: 'No image provided' });
    if (image.length > 9_000_000) return res.status(413).json({ error: 'Image too large (max ~6.5 MB base64)' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY missing' });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const content = [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
      { type: 'text', text: hint ? ('Hinweis vom Nutzer: ' + String(hint).slice(0, 200)) : 'Analysiere diese Mahlzeit.' },
    ];

    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYS,
      messages: [{ role: 'user', content }],
    });

    const text = r.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const data = extractJson(text);
    if (!data || !Array.isArray(data.ingredients) || !data.ingredients.length) {
      return res.status(502).json({ error: 'Could not parse meal from response', raw: text.slice(0, 500) });
    }
    // Normalisieren / absichern
    data.ingredients = data.ingredients.slice(0, 12).map(ig => ({
      name: String(ig.name || 'Zutat').slice(0, 80),
      emoji: (typeof ig.emoji === 'string' && ig.emoji) ? ig.emoji.slice(0, 4) : '🍽️',
      grams: Math.max(0, Math.round(+ig.grams || 0)),
      per100: {
        k: Math.max(0, Math.round(+(ig.per100 && ig.per100.k) || 0)),
        p: Math.max(0, +(+(ig.per100 && ig.per100.p) || 0).toFixed(1)),
        c: Math.max(0, +(+(ig.per100 && ig.per100.c) || 0).toFixed(1)),
        f: Math.max(0, +(+(ig.per100 && ig.per100.f) || 0).toFixed(1)),
      },
    }));
    return res.status(200).json({
      success: true,
      meal: String(data.meal || 'Mahlzeit').slice(0, 80),
      ingredients: data.ingredients,
      note: String(data.note || '').slice(0, 200),
      usage: r.usage,
    });
  } catch (err) {
    console.error('analyze-meal error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}

function extractJson(t) {
  if (!t) return null;
  try { return JSON.parse(t); } catch {}
  const m = t.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}
