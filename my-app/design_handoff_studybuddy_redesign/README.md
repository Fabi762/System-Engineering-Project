# Handoff: StudyBuddy Redesign

## Overview

Dieses Handoff-Paket enthält das **neue UI-Design für StudyBuddy** — den KI-gestützten
Lernassistenten aus dem Software-Engineering-Projekt. Das Redesign ersetzt das aktuelle
„generic SaaS"-Layout (Inter, Blau, Sidebar) durch eine deutlich ruhigere, akademisch-paperartige
Optik mit warmem Cremehintergrund, Terrakotta-Akzent und einer einzigen Sans-Serif-Schrift.

**Zielzustand:**
- Drei Hauptansichten: **Bibliothek (Dashboard)** → **Vorlesungs-Detail (mit Tabs)** → **Upload**
- Karteikarten- und Quiz-Modus (Milestone 4) komplett ausgearbeitet
- Light- und Dark-Modus
- Klare Typo-Hierarchie über Gewicht + Größe — **keine Kursiv-/Serif-Schriften**

---

## About the Design Files

Die Dateien unter `mockup/` sind **Design-Referenzen** — HTML-Prototypen, die das beabsichtigte
Aussehen und Verhalten zeigen. Sie sind **nicht** als direkter Drop-in-Code gedacht.

**Deine Aufgabe als implementierender Entwickler:** Die Designs in die bestehende
React-19-+-Vite-Codebase unter `my-app/` zu **rekonstruieren** — unter Verwendung der
vorhandenen Komponentenstruktur (`my-app/src/components/*.jsx`) und mit normalen
CSS-Custom-Properties (das Repo nutzt bereits `index.css` für Tokens und `App.css`
für Layout).

Konkrete Mapping-Empfehlung:
- `mockup/studybuddy.css` → Tokens nach `src/index.css`, Komponenten-Styles nach `src/App.css`
- `mockup/library.jsx` → neuer `src/components/Library.jsx` (Dashboard-Ansicht)
- `mockup/lecture.jsx` → ersetzt/erweitert `src/components/DocumentViewer.jsx`
- `mockup/upload.jsx` → ersetzt `src/components/FileUpload.jsx`
- `mockup/app.jsx` → Vorlage für `src/App.jsx` (Routing-State, Toast, Tweaks)
- `mockup/data.js` → **nur als Beispieldaten**; im echten Code kommen die Daten weiter
  über die FastAPI-Endpunkte (`/api/documents` etc.)
- `mockup/icons.jsx` → kann direkt nach `src/components/icons.jsx` übernommen werden
- `mockup/tweaks-panel.jsx` → **NICHT übernehmen** (interner Authoring-Helfer, nicht für Produktion)

---

## Fidelity

**High-fidelity (hifi).** Farben, Spacings, Font-Sizes und Border-Radii sind final
und exakt einzuhalten. Hover/Active-States und Animationen sind ebenfalls spezifiziert.

---

## Aktuelles Repo (Stand vor Redesign)

```
my-app/
├── src/
│   ├── App.jsx              # Root: State, handlers, layout
│   ├── App.css              # Layout-Styles, ~1000 Zeilen
│   ├── index.css            # CSS variables (--color-primary etc.), ~155 Zeilen
│   ├── main.jsx             # React-Mount
│   └── components/
│       ├── Header.jsx
│       ├── Sidebar.jsx           ← entfällt
│       ├── FileUpload.jsx        ← Upload.jsx
│       ├── DocumentViewer.jsx    ← Lecture.jsx (mit Tabs)
│       ├── StudyNotes.jsx        ← Teil von Lecture.jsx (Notes-Tab)
│       └── Flashcards.jsx        ← Teil von Lecture.jsx (Cards-Tab)
```

Das Backend (`/api/upload`, `/api/documents`, `/api/generate/notes/{id}`,
`/api/documents/{id}/notes-pdf`) bleibt **unverändert**.

---

## Neue Komponentenstruktur (Ziel)

```
src/
├── App.jsx              # View-State (library | lecture | upload), Toast
├── App.css              # Komponenten-Styles
├── index.css            # Design-Tokens (CSS custom props)
└── components/
    ├── Masthead.jsx     # Top-Bar (Logo, Nav, Theme-Toggle, „Neu"-Button)
    ├── Library.jsx      # Dashboard mit Stat-Strip, Filter, Karten-Grid
    ├── Lecture.jsx      # Detail-Ansicht mit Tabs
    ├── LectureTabs/
    │   ├── Overview.jsx
    │   ├── Notes.jsx
    │   ├── Flashcards.jsx
    │   └── Quiz.jsx
    ├── Upload.jsx       # Drop-Zone + Parsing-Stages
    ├── Toast.jsx
    └── icons.jsx        # Zentrale Icon-Komponenten
```

---

## Design Tokens

In `src/index.css` als CSS Custom Properties anzulegen.

### Farben — Paper-Modus (default)

| Token            | Hex                  | Verwendung                              |
|------------------|----------------------|-----------------------------------------|
| `--bg`           | `#f3ecda`            | App-Hintergrund (warmes Creme)          |
| `--bg-2`         | `#ece4ce`            | Sekundärer Hintergrund                  |
| `--panel`        | `#fbf7ea`            | Karten, Panels, Dokumente               |
| `--panel-2`      | `#f4eed9`            | Hover-Hintergründe, Code-Inline-BG      |
| `--ink`          | `#1d1c17`            | Primäre Schriftfarbe                    |
| `--ink-2`        | `#4f4a3f`            | Sekundär (Body, Labels)                 |
| `--ink-3`        | `#8a8273`            | Tertiär (Meta, Hilfe-Text)              |
| `--ink-4`        | `#b8af9b`            | Disabled, Decorative                    |
| `--line`         | `#d8ceb4`            | Borders, Dividers                       |
| `--line-soft`    | `#e5dcc1`            | Innere Dividers                         |
| `--accent`       | `#b04a28`            | Terrakotta — Buttons, Highlights        |
| `--accent-2`     | `#d97757`            | Hover-Variante                          |
| `--accent-soft`  | `rgba(176,74,40,.08)`| Soft-Fills                              |
| `--accent-ink`   | `#ffffff`            | Schrift auf Akzent                      |
| `--success`      | `#4d6b3a`            | Erfolg                                  |
| `--error`        | `#a8392a`            | Fehler                                  |

### Farben — Dark-Modus (`[data-theme="dark"]` am `<html>`)

| Token            | Hex                  |
|------------------|----------------------|
| `--bg`           | `#16140f`            |
| `--bg-2`         | `#1c1914`            |
| `--panel`        | `#1b1814`            |
| `--panel-2`      | `#221e17`            |
| `--ink`          | `#ece5d3`            |
| `--ink-2`        | `#aea795`            |
| `--ink-3`        | `#7a7263`            |
| `--ink-4`        | `#4a4538`            |
| `--line`         | `#2c2820`            |
| `--accent`       | `#e08a64`            |
| `--accent-2`     | `#f0a07c`            |
| `--accent-ink`   | `#16140f`            |

### Akzent-Varianten (optional, via `[data-accent="..."]` am `<html>`)

| Wert         | Light             | Dark              |
|--------------|-------------------|-------------------|
| `terracotta` | `#b04a28/#d97757` | `#e08a64/#f0a07c` |
| `ink`        | `#1c1b16/#4a463c` | `#ece5d3/#b2a995` |
| `ocre`       | `#8a6914/#b3902c` | `#d4a847/#e3bc66` |
| `moss`       | `#4a6b3a/#6b8a55` | `#9ab877/#b8d093` |

### Typografie

**Eine Schrift, keine Italic, keine Serifs.**

- **Body / UI / Headings**: `"Nunito", "IBM Plex Sans", -apple-system, system-ui, sans-serif`
- **Page-Titles (h1)** (optional, Stil-Akzent): `"IBM Plex Mono", monospace`
- **Mono-Labels** (IDs, Dateigrößen, Tasten): `"JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace`

Google Fonts Link (im `<head>` der `index.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Type Scale:
| Anwendung                | Größe | Gewicht | Line-Height |
|--------------------------|-------|---------|-------------|
| Page-Title (h1)          | 32px  | 600     | 1.15        |
| Lecture-Detail-Title     | 30px  | 600     | 1.15        |
| Notes-Doc h1             | 28px  | 600     | 1.2         |
| Section h2               | 20px  | 600     | 1.3         |
| Card-Title (Vorlesung)   | 16px  | 600     | 1.3         |
| Feature-Card h3          | 17px  | 600     | 1.25        |
| Body                     | 14px  | 400     | 1.55        |
| Notes-Body               | 14.5px| 400     | 1.7         |
| Meta / Secondary         | 12px  | 400/500 | 1.5         |
| Mono-Labels              | 10–11px| 400    | 1           |
| Stat-Value               | 28px  | 600     | 1           |

### Spacing-Scale

| Token | Wert  | Verwendung                |
|-------|-------|---------------------------|
| —     | 4px   | Inline-Gaps (Icon ↔ Text) |
| —     | 8px   | Tight Stacks              |
| —     | 12px  | Standard-Gap              |
| —     | 14px  | Card-Gap                  |
| —     | 16px  | Section-Gap               |
| —     | 24px  | Page-Section-Gap          |
| —     | 32px  | Major Section             |
| —     | 44px  | Page-Head Top             |

Keine Spacing-Variablen nötig — direkt verwenden.

### Border-Radius

| Token        | Wert  |
|--------------|-------|
| `--radius-sm`| `4px` |
| `--radius-md`| `6px` |
| `--radius-lg`| `10px`|
| (Pills)      | `999px` |

### Shadows

| Token           | Wert                                          |
|-----------------|-----------------------------------------------|
| `--shadow-card` | `0 1px 2px rgba(28,27,22,0.05)`               |
| `--shadow-pop`  | `0 8px 24px -12px rgba(28,27,22,0.2)`         |

Im Dark-Modus: `rgba(0,0,0,0.4)` bzw. `rgba(0,0,0,0.6)`.

---

## Screens

### 1. Masthead (Top-Bar) — überall sichtbar

**Layout**: Sticky `top: 0`, `border-bottom: 1px solid var(--line)`, Höhe ~56px,
Padding `14px 32px`, max-width `1180px` zentriert.

```
┌─────────────────────────────────────────────────────────────────────┐
│  [S] StudyBuddy   Bibliothek  Hochladen          [🌙]  [+ Neu]      │
└─────────────────────────────────────────────────────────────────────┘
```

- **Logo „S"**: 26×26 quadratisch, `background: var(--ink)`, `color: var(--bg)`,
  `border-radius: 4px`, `font-size: 14px`, `font-weight: 600`. Im Dark-Modus
  Background = `var(--accent)`.
- **Brand-Name** „StudyBuddy": `font-size: 15px; font-weight: 600; letter-spacing: -0.01em`
- **Nav-Buttons**: `font-size: 13px`, `font-weight: 500`, `color: var(--ink-3)`.
  Active-State: `color: var(--ink); background: var(--accent-soft)`. Padding `6px 12px`.
- **Icon-Buttons** (Theme-Toggle): 32×32, `border-radius: 4px`, Hover: `background: var(--accent-soft)`
- **„Neu"-Button**: Ghost-Style (siehe Button-Specs)

### 2. Library (Dashboard) — Default-View

**Layout**: max-width `1180px`, Padding `0 32px 80px`.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Sommersemester 2026                                                 │
│  Bibliothek                                  [+ Neue Vorlesung]      │
│  Deine Vorlesungen, Lernzettel und Karteikarten an einem Ort.        │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────┬─────────┬─────────┬─────────┐                          │
│  │ 7       │ 6       │ 84      │ 7       │     (Stat-Strip)         │
│  │ gesamt  │ PDF     │ Karten  │ Tage    │                          │
│  └─────────┴─────────┴─────────┴─────────┘                          │
│                                                                      │
│  Vorlesungen (7)        Alle  Mit Lernzettel  Mit Karteikarten ...  │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │ Card         │ │ Card         │ │ Card         │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Page-Head:**
- Eyebrow „Sommersemester 2026": `12px`, `var(--ink-3)`, `font-weight: 500`, margin-bottom `8px`
- Title „Bibliothek": `32px`, `600`, optional `font-family: "IBM Plex Mono"`
- Sub-Text: `14px`, `var(--ink-2)`, max-width `560px`
- Padding `44px 0 28px`, Border-bottom, margin-bottom `32px`

**Stat-Strip:**
- 4 Spalten Grid, `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 6px`
- Jede Zelle: Padding `18px 20px`, `border-right: 1px solid var(--line)` (letzte ohne)
- Stat-Label: `12px`, `var(--ink-3)`, margin-bottom `8px`
- Stat-Value: `28px`, `600`, `line-height: 1`
- Stat-Unit: `12px`, `var(--ink-3)`, `font-weight: 400`, margin-left `6px`

**Toolbar:**
- Title links („Vorlesungen (N)"), Filter-Chips rechts
- Filter-Chip: `font-size: 12px`, `padding: 5px 10px`, `border-radius: 4px`,
  `font-weight: 500`. Active: `color: var(--ink); background: var(--accent-soft)`

**Lecture-Card:**
- Grid: `grid-template-columns: repeat(3, 1fr)`, gap `14px`
- `min-height: 160px`, `padding: 18px 20px`, `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 6px`
- Hover: `border-color: var(--ink-3)`, `box-shadow: var(--shadow-card)`
- Aufbau (top-to-bottom, mit `flex-direction: column; gap: 12px`):
  1. **Head-Row**: Kurs · VL XX (links, `12px`, `var(--ink-3)`, `500`) + Format-Pill (rechts)
     - Format-Pill: `font-family: var(--mono)`, `10px`, `padding: 2px 6px`, `border: 1px solid var(--line)`, `border-radius: 3px`
  2. **Title** (`16px`, `600`, `line-height: 1.3`)
  3. **Status-Pills**: 1–2 Pills, `font-size: 11px`, `padding: 2px 8px`, `border-radius: 999px`, `background: var(--accent-soft)`, `color: var(--accent)`
  4. **Meta** (margin-top: auto): Seitenzahl + Datum, `12px`, `var(--ink-3)`, `border-top: 1px solid var(--line-soft)`, padding-top `12px`

**Daten (echt aus API)**: id, course, courseCode, chapter, title, filename, format, pages,
uploaded (relative), uploadedAbs, notesReady (bool), cardsReady (bool), progress (0–1).

### 3. Lecture Detail

**Layout**: Eine Spalte, max-width identisch zu Library.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Bibliothek / Datenbanksysteme / VL 04                               │
│                                                                      │
│  INFB 304 · Vorlesung 04                                             │
│  Normalformen & Funktionale Abhängigkeiten     [🗑 Entfernen]        │
│  PDF · 47 Seiten   Hochgeladen 12. Mai 2026   Fortschritt 72%        │
│                                                                      │
│  ────────────────────────────────────────────                       │
│   Übersicht   Lernzettel •   Karteikarten [8]   Quiz [3]            │
│  ─────────────────────────────────────────────                      │
│                                                                      │
│  [ Tab-Content ]                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Breadcrumb**: `12px`, `var(--ink-3)`, margin-top `24px`. Separatoren `/` in `var(--ink-4)`.
Erstes Element ist Link zurück zur Bibliothek.

**Lecture-Head:**
- Eyebrow: `12px`, `var(--ink-3)`, `500` — `{courseCode} · Vorlesung {chapter}`
- Title: `30px`, `600`, `letter-spacing: -0.02em`, margin-top `6px`
- Meta-Row: 4 Items horizontal mit Gap `20px`, `font-size: 12.5px`, `var(--ink-3)`
  Werte fett (`var(--ink)`, `font-weight: 600`). Letztes Item (Entfernen-Button) `margin-left: auto`
- Padding `12px 0 24px`, border-bottom, margin-bottom `24px`

**Tabs:**
- `display: flex`, `border-bottom: 1px solid var(--line)`, margin-bottom `28px`
- Tab-Button: Padding `10px 16px 12px`, `font-size: 13px`, `font-weight: 500`, `color: var(--ink-3)`
- Active: `color: var(--ink)`, `border-bottom: 2px solid var(--accent)` (margin-bottom `-1px`)
- Badge (z.B. „8"): `background: var(--accent-soft); color: var(--accent); font-size: 10px; padding: 1px 6px; border-radius: 999px`
- Dot („Lernzettel verfügbar"): 6×6px grüner Kreis `var(--success)`

#### 3a. Tab „Übersicht"

4 Feature-Cards im 2×2 Grid (Gap `14px`) + darunter Inhaltsverzeichnis.

**Feature-Card** (`padding: 20px 22px`, `background: var(--panel)`, `border: 1px solid var(--line)`):
1. Tag-Zeile (`11px`, `var(--ink-3)`, `500`): „Lernzettel · verfügbar" etc.
2. h3 (`17px`, `600`)
3. Beschreibung (`13px`, `var(--ink-2)`, `line-height: 1.55`)
4. Meta-Footer (`12px`, `var(--ink-3)`, border-top dashed) mit „öffnen →" rechts in `var(--accent)`

Klick auf Card → wechselt zum entsprechenden Tab.

**Outline / Inhaltsverzeichnis:**
- `border-top: 1px solid var(--line)`, padding-top `24px`, margin-top `32px`
- `<ol>` mit Custom-Counter (`decimal-leading-zero`), Grid `40px 1fr 60px`
- Pro Item: Nummer (mono, `var(--ink-3)`), Titel + Sub, Seitenzahl rechts
- `border-bottom: 1px solid var(--line-soft)` pro Item

#### 3b. Tab „Lernzettel"

**Toolbar** über dem Dokument:
- Links: Meta-Info (`4 Abschnitte · 1.240 Wörter · generiert mit GPT-4.1`)
- Rechts: „Neu generieren" (Ghost) + „Als PDF" (Primary) — beide `btn-sm`
- `background: var(--panel-2)`, `padding: 10px 14px`, `border-radius: 4px`

**Notes-Doc:**
- `background: var(--panel)`, `border: 1px solid var(--line)`, `border-radius: 6px`
- Padding `48px 56px 56px`, max-width `760px`
- Header mit Meta-Zeile (id mono, Kurs, Datum) + h1
- h2 mit Sektions-Nummer (`§ 1` etc.) in `var(--accent)` mono, margin-right `10px`
- Body-Paragraphs: `14.5px`, `line-height: 1.7`, `text-wrap: pretty`
- Inline-Code: `font-family: var(--mono)`, `background: var(--panel-2)`, padding `1px 5px`, `border-radius: 3px`, `border: 1px solid var(--line)`, `color: var(--accent)`
- `.formula` Block: zentriert, `padding: 14px`, `background: var(--panel-2)`, `border-radius: 4px`, mono

**Wichtig**: KEIN Blockquote-Schmuck, KEINE Fußnoten, KEINE Highlights, KEINE Italic-Sätze.

#### 3c. Tab „Karteikarten"

Zentriert, max-width `600px`.

**Progress-Strip**: Topic links / `1 / 8` rechts, darunter 3px-Progress-Bar in `var(--accent)`.

**Flashcard** (340×600px, perspective `1600px`):
- 3D-Flip via `transform: rotateY(180deg)` auf `.flashcard-inner` (`transform-style: preserve-3d`)
- Transition `540ms cubic-bezier(0.5, 0.1, 0.25, 1.2)`
- Beide Faces `position: absolute; inset: 0; backface-visibility: hidden`
- Front: `var(--panel)`, Back: `var(--panel-2)`
- Border `1px solid var(--line)`, border-radius `6px`, padding `36px 40px`
- Corner top-right: mono `var(--ink-3)`, Nummer (`01`–`08`)
- Label oben: „FRAGE" / „ANTWORT", `11px`, `600`, `letter-spacing: 0.04em`, uppercase, `var(--accent)`
- Body zentriert: Frage `22px`/`500`, Antwort `16px`/`400`. `<strong>` in Antwort: `var(--accent)`, `600`
- Foot: Topic links, Kbd-Hinweis „␣ zum Umdrehen" rechts

**Controls unter Karte:**
- Prev/Next Icon-Buttons (40×40, border)
- Trennlinie, dann 4 Rating-Buttons: Nochmal / Schwer / Gut / Einfach
  (alle gleicher Stil — `12px`, `border: 1px solid var(--line)`, `padding: 7px 14px`)

**Keyboard**: Leertaste flippt, ← / → navigieren. Window-Listener registrieren/aufräumen.

#### 3d. Tab „Quiz"

Multiple-Choice. Eine Frage zur Zeit, max-width `720px`.

**Progress-Strip** identisch zu Karteikarten.

**Quiz-Card** (`padding: 32px 38px`):
- Frage-Zähler oben (`Frage X von N`), `12px`, `var(--accent)`, `500`
- Frage h2: `20px`, `600`, `line-height: 1.3`, `text-wrap: balance`, margin-bottom `22px`
- Optionen als Buttons im Stack (Gap `8px`):
  - `padding: 12px 16px`, `border: 1px solid var(--line)`, `border-radius: 4px`
  - Option-Key A/B/C/D in 22×22 Mono-Box links, dann Text
  - Hover: `border-color: var(--ink-3); background: var(--panel-2)`
- Nach Auswahl: korrekte Option grün (`var(--success)`), falsche rot (`var(--error)`)
- Feedback-Section erscheint: kleine Label-Zeile + Erklärung, `border-top: 1px solid var(--line)`, padding-top `16px`
- „Nächste Frage" Button (Accent) rechts darunter

### 4. Upload

**Layout** ähnlich Page-Head wie Library, dann zentrierte Drop-Zone.

**Upload-Zone:**
- `border: 1.5px dashed var(--line)`, `border-radius: 6px`, padding `64px 40px`
- `background: var(--panel)`, max-width `640px`, margin auto, min-height `320px`
- `text-align: center`, flex column, items center, gap `14px`
- Hover/Drag-Over: `border-color: var(--accent); border-style: solid; background: var(--accent-soft)`

**Idle-State:**
1. Upload-Icon: 44×44 Kreis, `border: 1.5px solid var(--ink-2)`, mit Upload-Pfeil-SVG drin
2. h-Text „Folien hier ablegen", `20px`, `600`
3. Sub „oder eine Datei auswählen" (Link in `var(--accent)`)
4. Format-Badges: PDF, PPTX, DOCX, XLSX, HTML, MD, PNG — mono `10px`, border, padding `3px 8px`
5. Hint „max. 50 MB", `12px`, `var(--ink-3)`

**Uploading-State**: Spinner 32×32, Dateiname (`16px`, `600`), Status-Hint (`12px`, `var(--ink-3)`).

**Done-State**: Grüner Check-Kreis 44×44, „Bereit zum Lernen" (`16px`, `600`), Meta („47 Seiten · in Bibliothek übernommen").

Nach „Done" 800ms später `onDone()` → zurück zur Library.

---

## Components

### Buttons

```css
.btn          { padding: 8px 14px; border-radius: 4px; font-size: 13px;
                font-weight: 500; border: 1px solid transparent;
                transition: all 140ms; display: inline-flex; align-items: center; gap: 7px; }
.btn-primary  { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.btn-accent   { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.btn-ghost    { background: var(--panel); color: var(--ink-2); border-color: var(--line); }
.btn-sm       { padding: 5px 10px; font-size: 12px; }
.btn-lg       { padding: 10px 18px; font-size: 14px; }
```

Im Dark-Mode wird `.btn-primary` zu `.btn-accent` (Akzent-Farbe statt Ink).

### Pills

```css
.pill         { font-size: 11px; padding: 2px 8px; border-radius: 999px;
                background: var(--accent-soft); color: var(--accent); font-weight: 500; }
.pill-muted   { background: transparent; color: var(--ink-4); border: 1px solid var(--line); }
```

### Kbd

```css
.kbd          { font-family: var(--mono); font-size: 10px; padding: 2px 6px;
                border: 1px solid var(--line); border-radius: 3px;
                color: var(--ink-3); background: var(--panel); }
```

### Icons

Alle Icons sind stroke-only SVGs (24×24 viewBox), `stroke-width: 1.5`, `stroke-linecap: round`, `stroke-linejoin: round`, `currentColor`. Siehe `mockup/icons.jsx` für die fertigen Komponenten — können 1:1 übernommen werden. **Keine externe Icon-Library nutzen.**

---

## Interactions & Behavior

### Navigation (in `App.jsx`)

State: `{ name: "library" | "lecture" | "upload", lecture: Doc | null }`

- **Library → Lecture**: Klick auf Lecture-Card → `setView({name: "lecture", lecture: l})`
- **Lecture → Library**: Klick auf Breadcrumb „Bibliothek" oder Masthead-Logo
- **Library → Upload**: „Neue Vorlesung" Button oder Masthead „Neu"-Button
- **Upload → Library**: Nach erfolgreichem Upload automatisch (`onDone`), Toast anzeigen

### Theme-Toggle

Toggle setzt `document.documentElement.setAttribute("data-theme", "dark" | "")`.
Persistenz: in `localStorage` speichern und beim Mount lesen.

### Toast

- Fixed `bottom: 24px`, horizontal zentriert
- `background: var(--ink); color: var(--bg)`, padding `10px 16px`, `border-radius: 6px`
- Auto-Hide nach 2800ms
- Slide-up Animation 220ms

### Flashcard-Flip

- Click → `setFlipped(f => !f)`
- Keyboard: Space flippt, ← / → wechseln Card (resetten Flip auf false)
- Window-Event-Listener im `useEffect`, cleanup beachten

### Drag & Drop (Upload)

Listener: `onDragOver` (preventDefault + `setDragging(true)`),
`onDragLeave` (`setDragging(false)`), `onDrop` (preventDefault + Datei aus `dataTransfer.files[0]`).
Click auf Zone öffnet File-Input (existierende Logik aus `FileUpload.jsx` übernehmen).

### Filter-Chips (Library)

State `filter`: `"all" | "notes" | "cards" | "todo"`. Filtert `documents`-Array clientseitig.

---

## State Management

Identisch zur bestehenden App — kein Redux/Context nötig:

```jsx
const [documents, setDocuments] = useState([]);          // alle Dokumente
const [selectedDoc, setSelectedDoc] = useState(null);    // → ersetzt durch `view.lecture`
const [isUploading, setIsUploading] = useState(false);
const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
const [notification, setNotification] = useState(null);  // → toast
const [view, setView] = useState({name: "library", lecture: null}); // NEU
const [theme, setTheme] = useState("paper");             // NEU
```

Bestehende API-Handler (`handleUpload`, `handleDelete`, `handleGenerateNotes`) **unverändert
übernehmen** — nur das UI darum herum ändert sich.

---

## What NOT to do

Diese Anti-Patterns waren im ersten Designversuch drin und wurden bewusst **entfernt** —
nicht versehentlich wieder einbauen:

- ❌ Keine Kursiv-Schriften (Italic) irgendwo
- ❌ Keine Serif-Schriften (Instrument Serif, Georgia etc.)
- ❌ Keine deutschen Anführungszeichen („…") als Deko in Headers
- ❌ Keine römischen Ziffern als Eyebrow
- ❌ Keine Margin-Annotations oder Randspalten neben dem Hauptinhalt
- ❌ Keine Aktivitäts-Sidebar, Streak-Kalender oder „Empfehlungs"-Karten in der Library
- ❌ Keine Manuskript-Linien, Footnotes oder Blockquote-Schmuck im Lernzettel
- ❌ Keine Background-Pattern (Dots, Lines etc.)
- ❌ Kein Mittel-Titel oder „Vol. …"-Sub im Masthead
- ❌ Keine Dog-Ear-Papier-Icons beim Upload
- ❌ Keine Emoji im UI (außer ggf. in user-generated content)

**Maxime**: Weniger ist mehr. Hierarchie durch Gewicht und Größe, nicht durch Dekoration.

---

## Files

Alle relevanten Mockup-Files liegen unter `mockup/`:

| File                  | Inhalt                                                |
|-----------------------|-------------------------------------------------------|
| `StudyBuddy.html`     | Einstiegspunkt, lädt alle Scripts                     |
| `studybuddy.css`      | Komplettes Styling (Tokens + Komponenten)             |
| `app.jsx`             | App-Shell, View-Routing, Theme-Toggle, Tweaks-Panel   |
| `library.jsx`         | Dashboard-Ansicht                                     |
| `lecture.jsx`         | Detail-Ansicht inkl. aller 4 Tabs                     |
| `upload.jsx`          | Upload-Flow                                           |
| `icons.jsx`           | Alle SVG-Icons (direkt übernehmbar)                   |
| `data.js`             | Mock-Daten (nicht in Produktion verwenden)            |
| `tweaks-panel.jsx`    | Authoring-Helfer, NICHT in Produktion übernehmen      |

Zum Anschauen: `StudyBuddy.html` lokal öffnen oder im Browser laden.

---

## Implementierungs-Reihenfolge (Empfehlung)

1. **Tokens & Globals**: `index.css` mit allen CSS-Vars überschreiben (Light + Dark + Akzent-Varianten)
2. **Masthead**: Neue Top-Bar bauen, Theme-Toggle wiring
3. **Library**: Bestehende Sidebar entfernen, Library-Komponente bauen, Lecture-Cards
4. **Lecture-Shell**: Breadcrumb, Lecture-Head, Tabs (zuerst statisch, dann Tab-State)
5. **Notes-Tab**: Bestehende `StudyNotes`-Logik (PDF-Download) ins neue Layout einsetzen
6. **Upload**: Neue Drop-Zone, bestehende Upload-Handler nutzen
7. **Flashcards & Quiz**: Komplett neu — Daten dafür kommen aus dem geplanten
   `/api/generate/flashcards/{id}` Endpoint (siehe `Projekt_Review_Milestone3.txt`)
8. **Tweaks (optional)**: Theme + Akzent in `localStorage` persistieren; falls gewünscht
   einen einfachen Settings-Dialog statt des Authoring-Tweaks-Panels
9. **QA**: Beide Themes durchklicken, Keyboard-Navigation testen, deutsche Umlaute
   in allen Texten prüfen

---

## Fragen?

Bei Unklarheiten: HTML-Prototyp im Browser öffnen, F12 → Element inspizieren — dort steht
die exakte CSS-Regel. Die `studybuddy.css` ist als ein einziges Stylesheet ohne Tooling
geschrieben, also direkt lesbar.
