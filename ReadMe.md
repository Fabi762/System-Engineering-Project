# StudyBuddy - KI-gestuetzter Lernassistent

## Was ist StudyBuddy?

**StudyBuddy** ist eine webbasierte Anwendung fuer Studierende. Man laedt Vorlesungsfolien hoch und bekommt automatisch einen strukturierten **Lernzettel als PDF** zurueck – generiert von einer KI.

Unterstuetzte Formate: PDF, PPTX, DOCX, XLSX, HTML, Markdown, AsciiDoc, Bilder.

---

## Team

| Name   | Rolle                                    |
| ------ | ---------------------------------------- |
| Leon   | Entwickler / Scrum Master (Sprint 1 & 2) |
| Mario  | Entwickler / Product Owner               |
| Fabian | Entwickler / Scrum Master (Sprint 3 & 4) |

**Fach**: Software Engineering

---

## Technologie-Stack

| Komponente        | Technologie            |
| ----------------- | ---------------------- |
| Frontend          | React 19 + Vite        |
| Backend           | Python FastAPI         |
| Dokumentenanalyse | Docling (IBM)          |
| KI-Generierung    | Azure OpenAI (GPT-4.1) |
| Styling           | CSS Custom Properties  |
| Versionsverwaltung | Git / GitHub          |

---

## Wie wird ein Lernzettel erstellt?

### Voraussetzungen

- Python >= 3.10
- Node.js >= 18
- Azure OpenAI Zugang

### 1. Backend starten

```bash
cd backend
pip install -r requirements.txt
```

`.env`-Datei im `backend/`-Ordner anlegen:

```
AZURE_OPENAI_ENDPOINT=https://dein-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=dein-api-key-hier
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
```

```bash
uvicorn main:app --reload
```

### 2. Frontend starten

```bash
cd my-app
npm install
npm run dev
```

### 3. Lernzettel generieren

1. Browser oeffnen: `http://localhost:5173`
2. Vorlesungsfolie hochladen (Drag & Drop oder Dateiauswahl)
3. Inhalt wird automatisch per Docling extrahiert
4. Auf **"Lernzettel erstellen"** klicken
5. KI generiert eine strukturierte Zusammenfassung
6. Lernzettel als **PDF herunterladen**
