# 🤖 AI Instagram DM Auto-Response Setup

## ✅ Was wurde implementiert

Ein vollständiges System zur automatischen Generierung von strukturierten Instagram DM-Antworten mit:

- ✅ **Vercel AI SDK** mit Google Gemini 1.5 Flash
- ✅ **Zod-Schemas** für strukturierte Ausgaben
- ✅ **3 Antwort-Formate**: Direct, Detailed, Quick-Reply
- ✅ **Batch-Generierung**: Bis zu 10 Antworten auf einmal
- ✅ **Demo-UI** zum Testen und Visualisieren
- ✅ **API-Endpunkte** für Integration

## 🚀 Schnellstart

### 1. Google AI API Key erstellen

1. Gehe zu: https://aistudio.google.com/app/apikey
2. Klicke auf "Create API Key"
3. Kopiere den generierten Key

### 2. API Key eintragen

Öffne `.env.local` und ersetze `your_api_key_here`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...dein_echter_key
```

### 3. Server neu starten

```bash
# Strg+C um aktuellen Server zu stoppen
npm run dev
```

### 4. Demo-Seite öffnen

Öffne im Browser: **http://localhost:3000/demo/ai-dm**

Die Seite ist auch in der Sidebar unter "AI DM Demo" 🌟 verlinkt.

## 📝 Features testen

### Einzelne Anfrage

1. Gib eine Kundenanfrage ein, z.B.: "Wie viel kostet eine Maniküre?"
2. Klicke "Antwort generieren"
3. Sieh die strukturierte Antwort mit Format, Kategorie und Meta-Daten

### Beispiel-Anfragen

Klicke auf eine der 6 vordefinierten Anfragen:

- Preisanfragen
- Terminanfragen
- Standort-Fragen
- Stornierungen
- Service-Informationen
- Rabatte

### Batch-Generierung

Klicke "6 Antworten auf einmal generieren" um alle Beispiele gleichzeitig zu verarbeiten.

## 🎯 Die 3 Antwort-Formate

### 1️⃣ Direct Format

**Für**: Einfache, direkte Fragen

```json
{
  "format": "direct",
  "answer": "Hallo! Eine klassische Maniküre kostet 350.000 IDR 💅",
  "meta": {
    "category": "pricing",
    "suggestedAction": "book_now"
  }
}
```

### 2️⃣ Detailed Format

**Für**: Komplexe Anfragen mit Optionen

```json
{
  "format": "detailed",
  "greeting": "Hallo! Vielen Dank 😊",
  "mainAnswer": "Wir bieten verschiedene...",
  "options": [
    {
      "title": "Classic Nail Art",
      "description": "Ab 150.000 IDR"
    }
  ],
  "callToAction": "Möchtest du buchen?"
}
```

### 3️⃣ Quick Reply Format

**Für**: Instagram Button-Antworten

```json
{
  "format": "quick-reply",
  "message": "Wann hättest du Zeit?",
  "quickReplies": ["Heute", "Morgen", "Diese Woche"]
}
```

## 🔌 API Integration

### Einzelne Antwort generieren

```typescript
const response = await fetch('/api/ai/dm-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Kundenanfrage hier',
    studioContext: {
      name: '23 Nailroom',
      services: ['Maniküre', 'Pediküre', 'Gel Nails'],
      location: 'Ubud, Bali',
    },
  }),
})

const data = await response.json()
// data enthält: { format, answer/greeting/message, meta, ... }
```

### Mehrere Antworten (Batch)

```typescript
const response = await fetch('/api/ai/dm-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    queries: [
      'Wie viel kostet eine Maniküre?',
      'Habt ihr morgen frei?',
      // max. 10 Anfragen
    ],
    studioContext: {
      /* ... */
    },
  }),
})

const { responses } = await response.json()
// Array von generierten Antworten
```

## 📁 Code-Struktur

```
lib/ai/
├── schemas.ts              # Zod-Schemas (DirectAnswer, DetailedAnswer, QuickReply)
└── dm-generator.ts         # Generierungsfunktionen mit Gemini

app/api/ai/
├── dm-response/route.ts    # POST /api/ai/dm-response
└── dm-batch/route.ts       # POST /api/ai/dm-batch

app/demo/ai-dm/
└── page.tsx               # Demo-UI mit Beispielen

app/components/
└── SidebarClient.tsx      # "AI DM Demo" Link hinzugefügt
```

## 🎨 Demo-Features

Die Demo-Seite zeigt:

✅ **Visuelles Rendering** jedes Formats mit Farb-Kodierung
✅ **Meta-Informationen**: Kategorie, Topics, Suggested Actions
✅ **JSON-Preview** zum Ansehen der Rohdaten
✅ **Responsive Design** mit PageWrapper
✅ **Error Handling** mit hilfreichen Meldungen

## 🔍 Kategorien & Topics

Das System kategorisiert automatisch:

- `booking` - Terminanfragen
- `pricing` - Preisfragen
- `availability` - Verfügbarkeit
- `services` - Service-Infos
- `location` - Standort
- `cancellation` - Stornierung
- `general` - Allgemeines

Plus automatisch extrahierte **Topics** wie "Maniküre", "Gel Nails", etc.

## 💡 Nächste Schritte

- [ ] **Instagram API** Integration für echte DMs
- [ ] **Webhook** für automatische Antworten
- [ ] **Admin-Interface** zum Anpassen von Antworten
- [ ] **Analytics**: Häufigste Fragen tracken
- [ ] **Multi-Language**: EN, DE, ID Support
- [ ] **Training Data**: Eigene Beispiele hinzufügen

## 🐛 Troubleshooting

### "Failed to generate response"

→ Prüfe ob `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` gesetzt ist

### "API Key not valid"

→ Erstelle einen neuen Key auf https://aistudio.google.com/app/apikey

### Server muss neu gestartet werden

→ Nach Änderungen an `.env.local` immer neu starten!

## 📚 Verwendete Technologien

- **Vercel AI SDK** (`ai`) - Framework für AI-Integration
- **Google Gemini** (`@ai-sdk/google`) - LLM für Textgenerierung
- **Zod** (`zod`) - Schema-Validierung für strukturierte Outputs
- **Next.js 15** - Framework mit App Router
- **TypeScript** - Type-safe Development

---

**Bereit zum Testen?** → http://localhost:3000/demo/ai-dm 🚀
