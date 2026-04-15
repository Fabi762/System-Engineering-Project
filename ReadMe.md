# StudyBuddy - KI-gestuetzter Lernassistent

## Projektuebersicht

**StudyBuddy** ist eine webbasierte Anwendung, die Studierenden hilft, aus Vorlesungsfolien automatisch Lernmaterialien zu erstellen. Mithilfe von kuenstlicher Intelligenz (OpenAI) und fortschrittlicher Dokumentenanalyse (Docling) werden aus hochgeladenen Vorlesungsunterlagen **strukturierte Lernzettel** generiert.

Die Idee: Vorlesungsfolien hochladen, KI arbeiten lassen, fertige Lernhilfen erhalten.

> **Aktueller Stand: Milestone 3** – Lernzettel-Generierung ist funktional. Karteikarten sind fuer Milestone 4 geplant.

---

## Team

| Name   | Rolle im Projekt                         |
| ------ | ---------------------------------------- |
| Leon   | Entwickler / Scrum Master (Sprint 1 & 2) |
| Mario  | Entwickler / Product Owner               |
| Fabian | Entwickler / Scrum Master (Sprint 3 & 4) |

**Fach**: Software Engineering

---

## Funktionen (Milestone 3)

- **Dokumenten-Upload**: Vorlesungsfolien per Drag & Drop oder Dateiauswahl hochladen
- **Automatische Inhaltsextraktion**: Docling erkennt Text, Tabellen und Strukturen aus PDF, PPTX, DOCX und weiteren Formaten
- **KI-Lernzettel**: Kompakte, strukturierte Zusammenfassungen des Vorlesungsstoffs als PDF
- **Dokumentenverwaltung**: Mehrere Vorlesungen verwalten, zwischen ihnen wechseln

### Geplant fuer Milestone 4
- **KI-Karteikarten**: Automatische Generierung von Frage-Antwort-Karteikarten
- **Interaktive Karteikarten**: Karten mit 3D-Flip-Animation durchgehen
- **UI-Polish**: Finales Design, responsives Layout, Benachrichtigungssystem

---

## Technologie-Stack

| Komponente         | Technologie       | Begruendung                                           |
| ------------------ | ----------------- | ----------------------------------------------------- |
| Frontend           | React 19 + Vite   | Schnelle Entwicklung, komponentenbasierte Architektur |
| Backend            | Python FastAPI     | Moderner, schneller REST-API-Server                   |
| Dokumentenanalyse  | Docling (IBM)      | Open Source, unterstuetzt viele Formate               |
| KI-Generierung     | Azure OpenAI (GPT-4.1) | Enterprise-tauglich, hohe Qualitaet               |
| Styling            | CSS Custom Properties | Konsistentes Design-System ohne Framework-Overhead |
| Versionsverwaltung | Git / GitHub       | Branchenstandard fuer Teamarbeit                     |

---

## Architektur

```
Benutzer (Browser)
       |
       v
+------------------+
|    React Frontend |  Port 5173
|  - Upload-UI     |
|  - Lernzettel    |
|  - Dokumenten-   |
|    verwaltung    |
+--------+---------+
         |
    Vite Dev Proxy  (/api/* -> :8000)
         |
         v
+------------------+
|  FastAPI Backend  |  Port 8000
|  - /api/upload   |-----> Docling (Parsing)
|  - /api/generate |-----> Azure OpenAI (KI)
|  - /api/documents|-----> Dateisystem
+------------------+
```

**Datenfluss**:
1. Student laedt Vorlesungsfolie hoch (Frontend -> Backend)
2. Docling extrahiert den Inhalt und konvertiert ihn in Markdown (Backend)
3. Student sieht den extrahierten Inhalt (Backend -> Frontend)
4. Student klickt "Lernzettel erstellen"
5. Azure OpenAI generiert den Lernzettel aus dem Markdown (Backend -> Azure OpenAI -> Backend)
6. Lernzettel wird als PDF heruntergeladen (Backend -> Frontend)

---

## Agile Vorgehensweise

### Warum Scrum?

Fuer unser Projekt haben wir uns fuer **Scrum** als agiles Framework entschieden. Die Gruende:

- **Kleine Teamgroesse** (3 Personen) passt ideal zu Scrum
- **Iterative Entwicklung** ermoeglicht fruehes Feedback und Anpassungen
- **Klare Rollenverteilung** gibt Struktur ohne zu viel Overhead
- **Regelmaessige Reflexion** durch Retrospektiven foerdert kontinuierliche Verbesserung

### Rollen

| Rolle          | Verantwortung                                                                 | Person(en)          |
| -------------- | ----------------------------------------------------------------------------- | ------------------- |
| Product Owner  | Priorisierung des Backlogs, Vertretung der Nutzerperspektive                  | Mario               |
| Scrum Master   | Moderation der Events, Beseitigung von Hindernissen, Prozesseinhaltung        | Rotierend           |
| Entwickler     | Design, Implementierung, Testing                                              | Alle Teammitglieder |

Die Rolle des Scrum Masters rotierte zwischen den Sprints, damit jedes Teammitglied Erfahrung in dieser Rolle sammeln konnte.

### Scrum-Artefakte

1. **Product Backlog**: Priorisierte Liste aller Anforderungen (User Stories), gepflegt vom Product Owner
2. **Sprint Backlog**: Ausgewaehlte User Stories und Aufgaben fuer den aktuellen Sprint
3. **Increment**: Funktionsfaehiges Produktinkrement am Ende jedes Sprints

### Scrum-Events

| Event                 | Wann                  | Dauer    | Inhalt                                                      |
| --------------------- | --------------------- | -------- | ----------------------------------------------------------- |
| Sprint Planning       | Montag, Sprintbeginn  | 1 Stunde | Auswahl der Stories, Aufwandsschaetzung, Sprint-Ziel setzen |
| Daily Standup         | Taeglich              | 15 Min.  | Was gemacht? Was geplant? Hindernisse?                      |
| Sprint Review         | Freitag, Sprintende   | 30 Min.  | Demo der fertigen Features, Feedback sammeln                |
| Sprint Retrospektive  | Freitag, nach Review  | 30 Min.  | Was lief gut? Was verbessern? Massnahmen ableiten           |

### Sprint-Uebersicht

#### Sprint 1 - Projektsetup & Grundarchitektur (Woche 1-2)

**Sprint-Ziel**: Technische Basis schaffen und Grundgeruest aufbauen

| Aufgabe                           | Verantwortlich | Status     |
| --------------------------------- | -------------- | ---------- |
| Git-Repository einrichten         | Fabian         | Erledigt   |
| React-Projekt mit Vite erstellen  | Leon           | Erledigt   |
| FastAPI-Backend aufsetzen         | Mario          | Erledigt   |
| Projektstruktur festlegen         | Alle           | Erledigt   |
| CI/CD Pipeline (optional)         | Fabian         | Verschoben |

**Ergebnis**: Lauffaehiges Grundgeruest mit Frontend und Backend, Entwicklungsumgebung steht.

**Retrospektive-Erkenntnisse**:
- Gut: Schneller Projektstart durch klare Aufgabenverteilung
- Verbesserung: Entwicklungsumgebung frueher abstimmen (Node.js-Versionen)

---

#### Sprint 2 - Dokumenten-Upload & Parsing (Woche 3-4)

**Sprint-Ziel**: Vorlesungsfolien hochladen und Inhalt extrahieren koennen

| Aufgabe                            | Verantwortlich | Status   |
| ---------------------------------- | -------------- | -------- |
| Drag & Drop Upload implementieren | Leon           | Erledigt |
| Docling-Integration im Backend    | Mario          | Erledigt |
| Dokument-Ansicht (Markdown)       | Fabian         | Erledigt |
| Seitenleiste mit Dokumentenliste  | Leon           | Erledigt |
| API-Endpunkte (Upload, List, Get) | Mario          | Erledigt |
| Fehlerbehandlung                  | Fabian         | Erledigt |

**Ergebnis**: Vollstaendiger Upload-und-Parse-Workflow. Studierende koennen PDFs/PPTX hochladen und den extrahierten Inhalt sehen.

**Retrospektive-Erkenntnisse**:
- Gut: Docling liefert sehr gute Ergebnisse bei PDFs
- Verbesserung: Groessere Dateien brauchen laenger, Ladeanimation verbessern

---

#### Sprint 3 - KI-Integration: Lernzettel (Woche 5-6)

**Sprint-Ziel**: Automatische Generierung von Lernzetteln mittels KI

| Aufgabe                            | Verantwortlich | Status       |
| ---------------------------------- | -------------- | ------------ |
| OpenAI-API Anbindung              | Mario          | Erledigt     |
| Lernzettel-Generierung (Backend)  | Fabian         | Erledigt     |
| Lernzettel-Ansicht (Frontend)     | Leon           | Erledigt     |
| PDF-Export fuer Lernzettel        | Fabian         | Erledigt     |
| Karteikarten-Generierung         | Mario          | Offen (MS4)  |
| Karteikarten-UI                  | Leon           | Offen (MS4)  |

**Ergebnis**: KI generiert Lernzettel aus dem Vorlesungsinhalt und stellt sie als PDF zum Download bereit.

**Retrospektive-Erkenntnisse**:
- Gut: Azure OpenAI (GPT-4.1) liefert qualitativ hochwertige Zusammenfassungen
- Verbesserung: Prompt-Engineering erfordert mehrere Iterationen
- Erkenntnis: Karteikarten-Feature auf Sprint 4 verschoben, um Lernzettel-Qualitaet zu priorisieren

---

#### Sprint 4 - Karteikarten & UI-Polish (geplant, Woche 7-8)

**Sprint-Ziel**: Karteikarten-Feature implementieren, finales Design und Testing

| Aufgabe                            | Verantwortlich | Status   |
| ---------------------------------- | -------------- | -------- |
| Karteikarten-Generierung (Backend)| Mario          | Geplant  |
| Karteikarten-UI mit Flip-Animation| Leon           | Geplant  |
| Tab-Navigation im Viewer          | Leon           | Geplant  |
| Design-System verfeinern          | Fabian         | Geplant  |
| Responsives Design                | Fabian         | Geplant  |
| README und Dokumentation          | Alle           | Geplant  |

### User Stories

| ID    | User Story                                                                                       | Prioritaet | Sprint | Status                   |
| ----- | ------------------------------------------------------------------------------------------------ | ---------- | ------ | ------------------------ |
| US-01 | Als Student moechte ich Vorlesungsfolien hochladen, um sie verarbeiten zu lassen                  | Hoch       | 1, 2   | Erledigt                 |
| US-02 | Als Student moechte ich den extrahierten Inhalt sehen, um die Erkennung zu pruefen               | Hoch       | 2      | Erledigt                 |
| US-03 | Als Student moechte ich automatisch Karteikarten erhalten, um effizient zu lernen                 | Hoch       | 4      | Offen (geplant Sprint 4) |
| US-04 | Als Student moechte ich einen Lernzettel generieren, um eine Zusammenfassung zu haben             | Hoch       | 3      | Erledigt                 |
| US-05 | Als Student moechte ich Karteikarten interaktiv durchgehen, um mein Wissen zu testen              | Mittel     | 4      | Offen (geplant Sprint 4) |
| US-06 | Als Student moechte ich zwischen Dokumenten wechseln, um verschiedene Vorlesungen zu verwalten    | Mittel     | 2      | Erledigt                 |
| US-07 | Als Student moechte ich den Markdown-Text kopieren, um ihn in Notiz-Apps weiterzuverwenden        | Niedrig    | 2      | Erledigt                 |
| US-08 | Als Student moechte ich verschiedene Dateiformate nutzen (PDF, PPTX, DOCX)                        | Mittel     | 2      | Erledigt                 |

### Definition of Done

Eine User Story gilt als **erledigt**, wenn:

- [x] Die Funktion ist vollstaendig implementiert
- [x] Der Code wurde von mindestens einem Teammitglied reviewed
- [x] Es gibt keine offenen Linter-Fehler
- [x] Die Funktion funktioniert im Browser wie erwartet
- [x] Fehlerbehandlung ist vorhanden
- [x] Die README ist aktualisiert (falls relevant)

### Eingesetzte Tools

| Tool               | Einsatzzweck                        |
| ------------------ | ----------------------------------- |
| Git / GitHub       | Versionsverwaltung, Code-Review     |
| GitHub Projects    | Kanban Board, Sprint-Planung        |
| Discord            | Taegliche Kommunikation, Standups   |
| VS Code / Cursor   | Entwicklungsumgebung                |

---

## Setup-Anleitung

### Voraussetzungen

- **Python** >= 3.10
- **Node.js** >= 18
- **Azure OpenAI Zugang** (fuer KI-Funktionen)

### 1. Backend starten

```bash
cd backend
pip install -r requirements.txt
```

Azure OpenAI konfigurieren (`.env`-Datei im `backend/`-Ordner erstellen):

```
AZURE_OPENAI_ENDPOINT=https://dein-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=dein-api-key-hier
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
```

Server starten:

```bash
uvicorn main:app --reload
```

Das Backend laeuft auf `http://localhost:8000`.

### 2. Frontend starten

```bash
cd my-app
npm install
npm run dev
```

Das Frontend laeuft auf `http://localhost:5173` und leitet API-Aufrufe automatisch an das Backend weiter.

### 3. Anwendung nutzen

1. Browser oeffnen: `http://localhost:5173`
2. Vorlesungsfolie hochladen (PDF, PPTX, DOCX, ...)
3. Auf "Lernzettel erstellen" klicken und generieren lassen
4. Lernzettel als PDF herunterladen

---

## API-Endpunkte (Milestone 3)

| Methode | Endpunkt                        | Beschreibung                             | Status   |
| ------- | ------------------------------- | ---------------------------------------- | -------- |
| GET     | `/api/health`                   | Health Check                             | Aktiv    |
| POST    | `/api/upload`                   | Dokument hochladen und parsen            | Aktiv    |
| GET     | `/api/documents`                | Alle Dokumente auflisten                 | Aktiv    |
| GET     | `/api/documents/{id}`           | Einzelnes Dokument abrufen               | Aktiv    |
| DELETE  | `/api/documents/{id}`           | Dokument entfernen                       | Aktiv    |
| POST    | `/api/generate/notes/{id}`      | Lernzettel generieren (KI)              | Aktiv    |
| GET     | `/api/documents/{id}/notes-pdf` | Lernzettel-PDF herunterladen            | Aktiv    |
| POST    | `/api/generate/flashcards/{id}` | Karteikarten generieren (KI)            | Geplant  |

---

## Unterstuetzte Formate

| Format     | Dateityp              |
| ---------- | --------------------- |
| PDF        | `.pdf`                |
| PowerPoint | `.pptx`               |
| Word       | `.docx`               |
| Excel      | `.xlsx`               |
| HTML       | `.html`, `.htm`       |
| Markdown   | `.md`                 |
| AsciiDoc   | `.adoc`               |
| Bilder     | `.png`, `.jpg`, etc.  |
