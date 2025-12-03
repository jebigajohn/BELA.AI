# AI Instagram DM Auto-Response

Dieses Feature nutzt das Vercel AI SDK mit Google Gemini, um automatisch strukturierte Antworten auf Instagram Direct Messages zu generieren.

## 🚀 Setup

1. **API Key erstellen**

   - Gehe zu [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Erstelle einen neuen API Key

2. **Umgebungsvariable setzen**

   ```bash
   # .env.local
   GOOGLE_GENERATIVE_AI_API_KEY=dein_api_key_hier
   ```

3. **Dependencies installiert** ✅
   ```bash
   npm install ai @ai-sdk/google zod
   ```

## 📁 Struktur

```
lib/ai/
  ├── schemas.ts           # Zod-Schemas für strukturierte Antworten
  └── dm-generator.ts      # AI-Generierungsfunktionen

app/api/ai/
  ├── dm-response/route.ts # Einzelne DM-Antwort generieren
  └── dm-batch/route.ts    # Mehrere Antworten auf einmal

app/demo/ai-dm/
  └── page.tsx            # Demo-UI zum Testen
```

## 🎯 Antwort-Formate

### 1. Direct (Direkte Antwort)

Für einfache Fragen wie Preise oder Öffnungszeiten.

```json
{
  "format": "direct",
  "answer": "Hallo! Eine klassische Maniküre kostet bei uns 350.000 IDR 💅",
  "meta": {
    "category": "pricing",
    "topics": ["Maniküre", "Preise"],
    "suggestedAction": "book_now"
  }
}
```

### 2. Detailed (Detaillierte Antwort)

Für komplexere Anfragen mit mehreren Optionen.

```json
{
  "format": "detailed",
  "greeting": "Hallo! Vielen Dank für deine Nachricht 😊",
  "mainAnswer": "Wir bieten verschiedene Nageldesigns an...",
  "options": [
    {
      "title": "Classic Nail Art",
      "description": "Einfache, elegante Designs - ab 150.000 IDR"
    }
  ],
  "callToAction": "Möchtest du einen Termin buchen?",
  "meta": {...}
}
```

### 3. Quick Reply (Instagram Buttons)

Für Fragen, die mit vordefinierten Antworten beantwortet werden können.

```json
{
  "format": "quick-reply",
  "message": "Gerne! Wann hättest du Zeit?",
  "quickReplies": ["Heute", "Morgen", "Diese Woche"],
  "meta": {...}
}
```

## 🎨 Demo-Seite

Besuche: **http://localhost:3000/demo/ai-dm**

Features:

- ✅ Einzelne Kundenanfragen testen
- ✅ 6 Beispiel-Anfragen mit einem Klick
- ✅ Batch-Generierung (10 Antworten auf einmal)
- ✅ Verschiedene Formate (direct, detailed, quick-reply)
- ✅ Strukturierte JSON-Ausgabe

## 📡 API Endpunkte

### POST /api/ai/dm-response

Einzelne Antwort generieren:

```typescript
fetch('/api/ai/dm-response', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Wie viel kostet eine Maniküre?',
    studioContext: {
      name: '23 Nailroom',
      services: ['Maniküre', 'Pediküre'],
      location: 'Ubud, Bali',
    },
  }),
})
```

### POST /api/ai/dm-batch

Mehrere Antworten auf einmal:

```typescript
fetch('/api/ai/dm-batch', {
  method: 'POST',
  body: JSON.stringify({
    queries: [
      "Wie viel kostet eine Maniküre?",
      "Habt ihr morgen frei?"
    ],
    studioContext: {...}
  })
})
```

## 🔧 Kategorien

- `booking` - Terminanfragen
- `pricing` - Preisfragen
- `availability` - Verfügbarkeit
- `services` - Service-Informationen
- `location` - Standort-Fragen
- `cancellation` - Stornierungen
- `general` - Allgemeine Fragen

## 💡 Nächste Schritte

- [ ] Instagram API Integration für echte DMs
- [ ] Webhook für automatische Antworten
- [ ] Admin-Interface zum Konfigurieren von Antworten
- [ ] Analytics: Welche Fragen werden am häufigsten gestellt?
- [ ] Multi-Language Support (EN, DE, ID)
