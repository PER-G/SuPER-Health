# SuPER Health – Plattform

Gesamte Plattform als **ein** Vercel-Projekt:

| Pfad | Inhalt |
|------|--------|
| `/` | **SuPER Health** Hauptseite (`SuPER-Health.html`): Landing, Rechner (Werte & Ziele, Stufe 1–5), Wissen/„Probleme & Lösungen", FAQ |
| `/tracking` | **Tracking-App** (`SuPER-Health-Tracking.html`): Kalorien-/Fitness-Tracker |
| `/api/analyze-meal` | Serverless-Funktion (Claude Vision) für die Foto-Analyse |
| `/bilder/…` | Körpertypen-Grafiken für den Rechner |

Im Rechner stellt man unter „Stufe 1–5" seine Werte & Ziele ein und schickt sie per **„→ An Tracking senden"** an `/tracking`.

---

Der Tracking-Teil (`SuPER-Health-Tracking.html`):
- Tracking, Tages-Balken & Wochen-Diagramm
- **Barcode-Scanner** (Open Food Facts, kostenlos, kein Backend nötig)
- **KI-Mahlzeit-Analyse per Foto** (Claude Vision) → erkennt Zutaten, schätzt Mengen & Nährwerte, per Klick ins Tagebuch
- On-Device-Assistent
- Übernahme der Werte aus dem SuPER-Health-Rechner

## Ohne Backend nutzen
Datei `SuPER-Health-Tracking.html` einfach im Browser öffnen. Es funktioniert alles **außer** der KI-Foto-Analyse (die braucht Claude Vision). Im Scanner gibt es dafür einen **„Demo"-Button**, der den Ablauf zeigt.

## Mit KI-Foto-Analyse (Backend deployen)
Die Foto-Analyse läuft über die Serverless-Funktion `api/analyze-meal.js` (Claude Vision). Ein API-Key darf **nie** ins Frontend – daher dieses kleine Backend.

### Deployment auf Vercel
1. Dieses Verzeichnis als Vercel-Projekt importieren (oder `npx vercel`).
2. Environment Variables setzen (siehe `.env.example`):
   - `ANTHROPIC_API_KEY` (Pflicht)
   - `MEAL_MODEL` (optional, Standard `claude-haiku-4-5`)
   - `MEAL_API_TOKEN` (optional, schützt den Endpunkt)
3. Deploy. Die App liegt dann unter `https://<projekt>.vercel.app/` (das `vercel.json` leitet `/` auf die HTML), die Funktion unter `/api/analyze-meal`.
4. Im Frontend ist der KI-Endpunkt standardmäßig `/api/analyze-meal` (same-origin) – nichts weiter nötig. Wird die HTML woanders gehostet, im Scanner unter **„⚙️ KI-Endpunkt"** die volle URL eintragen (CORS ist offen).

### Lokal testen
```
npm install
npx vercel dev
```
Dann die App unter `http://localhost:3000` öffnen.

## Kosten (Richtwert)
Pro Foto-Analyse mit Haiku 4.5 ≈ 0,3–1 Cent. Siehe Finanzierungsplan im Chat.
