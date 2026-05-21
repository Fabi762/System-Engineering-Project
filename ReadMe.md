# StudyBuddy - KI-gestuetzter Lernassistent

**StudyBuddy** ist eine webbasierte Anwendung fuer Studierende. Vorlesungsfolien hochladen, KI generiert daraus automatisch einen strukturierten **Lernzettel als PDF**.

Unterstuetzte Formate: PDF, PPTX, DOCX, XLSX, HTML, Markdown, Bilder.

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

| Komponente         | Technologie            |
| ------------------ | ---------------------- |
| Frontend           | React 19 + Vite        |
| Backend            | Python FastAPI         |
| Dokumentenanalyse  | PyPDF                  |
| PDF-Generierung    | LaTeX via MiKTeX       |
| KI-Generierung     | Azure OpenAI (GPT-4.1) |
| Styling            | CSS Custom Properties  |
| Versionsverwaltung | Git / GitHub           |

---

## Setup

### Schritt 1 – Voraussetzungen installieren

#### Python (>= 3.10)
Download: https://www.python.org/downloads/  
Bei der Installation **"Add Python to PATH"** anhakeneben.

#### Node.js (>= 18)
Download: https://nodejs.org/

#### MiKTeX (LaTeX-Compiler fuer PDF-Generierung)
Download: https://miktex.org/download  
Installer ausfuehren → Standard-Einstellungen beibehalten.

Nach der Installation einmalig im Terminal ausfuehren:
```
initexmf --set-config-value [MPM]AutoInstall=1
```
Das sorgt dafuer, dass fehlende LaTeX-Pakete automatisch nachgeladen werden.

> **Hinweis:** Beim ersten Lernzettel-Download laedt MiKTeX einige Pakete herunter (~2 Min.). Danach geht es sofort.

---

### Schritt 2 – Repository klonen

```bash
git clone https://github.com/Fabi762/Software-Engineering-Project.git
cd Software-Engineering-Project
```

---

### Schritt 3 – Backend einrichten

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

Abhaengigkeiten installieren:
```bash
pip install -r requirements.txt
```

---

### Schritt 4 – Azure OpenAI konfigurieren

Im `backend/`-Ordner eine Datei namens `.env` anlegen (Vorlage: `.env.example`):

```
AZURE_OPENAI_ENDPOINT=https://dein-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=dein-api-key-hier
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
```

> Die Zugangsdaten bekommst du von Leon oder Mario.  
> Die `.env`-Datei niemals in Git einchecken – sie steht bereits in `.gitignore`.

---

### Schritt 5 – Frontend einrichten

```bash
cd my-app
npm install
```

---

### Schritt 6 – Anwendung starten

**Einfachster Weg (Windows):** Doppelklick auf `start.bat` im Projektordner.  
Das oeffnet Backend und Frontend automatisch und startet den Browser.

**Manuell:**

Terminal 1 – Backend:
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

Terminal 2 – Frontend:
```bash
cd my-app
npm run dev
```

Dann Browser oeffnen: **http://localhost:5173**

---

## Benutzung

1. Vorlesungsfolie hochladen (Drag & Drop oder Dateiauswahl)
2. Dokument wird automatisch analysiert und der Inhalt extrahiert
3. Auf **"Lernzettel erstellen"** klicken
4. KI generiert eine strukturierte Zusammenfassung mit Formeln
5. Lernzettel als **PDF herunterladen**

---

## Haeufige Probleme

| Problem | Loesung |
| ------- | ------- |
| `uvicorn: command not found` | Virtuelle Umgebung aktivieren: `venv\Scripts\activate` |
| `Azure OpenAI nicht konfiguriert` | `.env`-Datei im `backend/`-Ordner pruefen |
| Lernzettel-Generierung schlaegt fehl | Beim ersten Mal laedt MiKTeX Pakete – kurz warten und nochmal versuchen |
| Port 8000 bereits belegt | Anderen Prozess beenden oder Backend auf anderem Port starten |
