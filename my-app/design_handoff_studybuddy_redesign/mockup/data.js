// Mock data for StudyBuddy redesign
// Realistic German university CS / math content

window.LECTURES = [
  {
    id: "L-0247",
    course: "Datenbanksysteme",
    courseCode: "INFB 304",
    chapter: "04",
    title: "Normalformen & Funktionale Abhängigkeiten",
    filename: "Vorlesung_04_Normalformen.pdf",
    format: "PDF",
    pages: 47,
    uploaded: "vor 2 Tagen",
    uploadedAbs: "12. Mai 2026 · 14:32",
    notesReady: true,
    cardsReady: true,
    progress: 0.72,
    color: "terracotta",
    annotation: "„Bringe die Relation in 3NF — was bleibt übrig?"
  },
  {
    id: "L-0246",
    course: "Theoretische Informatik",
    courseCode: "INFB 201",
    chapter: "06",
    title: "Turing-Maschinen & Entscheidbarkeit",
    filename: "TI_VL06_Turing.pdf",
    format: "PDF",
    pages: 38,
    uploaded: "vor 3 Tagen",
    uploadedAbs: "11. Mai 2026 · 09:18",
    notesReady: true,
    cardsReady: true,
    progress: 0.45,
    annotation: "„Das Halteproblem ist unentscheidbar — der Beweis."
  },
  {
    id: "L-0245",
    course: "Maschinelles Lernen",
    courseCode: "INFM 401",
    chapter: "03",
    title: "Gradient Descent & Backpropagation",
    filename: "ML_03_Optimization.pptx",
    format: "PPTX",
    pages: 62,
    uploaded: "vor 5 Tagen",
    uploadedAbs: "09. Mai 2026 · 16:04",
    notesReady: true,
    cardsReady: false,
    progress: 0.30,
    annotation: "„Lernrate ist alles."
  },
  {
    id: "L-0244",
    course: "Analysis II",
    courseCode: "MATB 102",
    chapter: "09",
    title: "Mehrdimensionale Integration",
    filename: "AnaII_Kapitel9.pdf",
    format: "PDF",
    pages: 54,
    uploaded: "vor 1 Woche",
    uploadedAbs: "05. Mai 2026 · 11:22",
    notesReady: true,
    cardsReady: true,
    progress: 1.00,
    annotation: "„Fubini, wenn alles integrierbar bleibt."
  },
  {
    id: "L-0243",
    course: "Algorithmen & Datenstrukturen",
    courseCode: "INFB 105",
    chapter: "11",
    title: "Graphalgorithmen — Dijkstra & A*",
    filename: "ADS_VL11_Graphen.pdf",
    format: "PDF",
    pages: 41,
    uploaded: "vor 1 Woche",
    uploadedAbs: "04. Mai 2026 · 08:50",
    notesReady: true,
    cardsReady: true,
    progress: 0.88
  },
  {
    id: "L-0242",
    course: "Stochastik",
    courseCode: "MATB 203",
    chapter: "07",
    title: "Markov-Ketten & stationäre Verteilung",
    filename: "Stochastik_VL07.pdf",
    format: "PDF",
    pages: 36,
    uploaded: "vor 2 Wochen",
    uploadedAbs: "29. April 2026 · 14:10",
    notesReady: false,
    cardsReady: false,
    progress: 0.0
  },
  {
    id: "L-0241",
    course: "Software Engineering",
    courseCode: "INFB 302",
    chapter: "02",
    title: "Agile Methoden & Scrum",
    filename: "SE_Sprint_Planning.docx",
    format: "DOCX",
    pages: 28,
    uploaded: "vor 3 Wochen",
    uploadedAbs: "22. April 2026 · 10:00",
    notesReady: true,
    cardsReady: true,
    progress: 0.55
  }
];

// Outline for the "active" lecture (Normalformen)
window.OUTLINE = [
  { title: "Einführung in relationale Schemata",   sub: "Relation, Tupel, Attribute",            page: "S. 3" },
  { title: "Funktionale Abhängigkeiten (FD)",       sub: "Definition, Notation, Beispiele",       page: "S. 8" },
  { title: "Schlüsselkandidaten ermitteln",         sub: "Algorithmus von Lucchesi-Osborn",       page: "S. 14" },
  { title: "Erste Normalform (1NF)",                sub: "Atomare Attributwerte",                 page: "S. 19" },
  { title: "Zweite Normalform (2NF)",               sub: "Eliminierung partieller Abhängigkeiten", page: "S. 23" },
  { title: "Dritte Normalform (3NF)",               sub: "Eliminierung transitiver Abhängigkeiten",page: "S. 28" },
  { title: "Boyce-Codd-Normalform (BCNF)",          sub: "Strikte Form der 3NF",                  page: "S. 34" },
  { title: "Synthesealgorithmus",                   sub: "Verlustfreie Zerlegung in 3NF",         page: "S. 40" },
  { title: "Praxisbeispiel: Hochschulverwaltung",   sub: "Schritt-für-Schritt-Dekomposition",     page: "S. 44" }
];

// Flashcards
window.FLASHCARDS = [
  {
    n: 1,
    topic: "Definition",
    q: "Was ist eine funktionale Abhängigkeit (FD)?",
    a: "Eine FD <strong>X → Y</strong> besagt, dass Tupel mit gleichen Werten in X notwendigerweise gleiche Werte in Y haben. X bestimmt Y eindeutig — Y ist funktional von X abhängig.",
    correct: 0
  },
  {
    n: 2,
    topic: "1. Normalform",
    q: "Wann verletzt eine Relation die 1NF?",
    a: "Wenn ein Attribut <strong>nicht-atomare Werte</strong> enthält — also Listen, Mengen, zusammengesetzte Strukturen oder mehrwertige Einträge in einer Zelle.",
    correct: 0
  },
  {
    n: 3,
    topic: "2. Normalform",
    q: "Was muss gelten, damit eine Relation in 2NF ist?",
    a: "Die Relation ist in <strong>1NF</strong>, <em>und</em> jedes <strong>Nicht-Schlüsselattribut</strong> ist vom <strong>gesamten</strong> Primärschlüssel <strong>voll funktional abhängig</strong> — keine partiellen Abhängigkeiten.",
    correct: 0
  },
  {
    n: 4,
    topic: "3. Normalform",
    q: "Wodurch unterscheidet sich die 3NF von der 2NF?",
    a: "Die 3NF verlangt zusätzlich, dass <strong>keine transitiven Abhängigkeiten</strong> zwischen Nicht-Schlüsselattributen bestehen — kein Nicht-Schlüsselattribut darf von einem anderen Nicht-Schlüsselattribut abhängen.",
    correct: 0
  },
  {
    n: 5,
    topic: "BCNF",
    q: "Wann ist eine Relation in Boyce-Codd-Normalform?",
    a: "Wenn für jede nicht-triviale FD <strong>X → Y</strong> in der Relation gilt: <strong>X ist ein Superschlüssel</strong>. BCNF ist strenger als 3NF — sie schließt auch Anomalien aus, die 3NF noch toleriert.",
    correct: 0
  },
  {
    n: 6,
    topic: "Anomalien",
    q: "Welche drei Anomalien sollen Normalformen verhindern?",
    a: "<strong>Einfüge-</strong>, <strong>Lösch-</strong> und <strong>Änderungsanomalien</strong> — entstehen durch redundante Speicherung derselben Information in mehreren Tupeln.",
    correct: 0
  },
  {
    n: 7,
    topic: "Schlüssel",
    q: "Was ist der Unterschied zwischen Superschlüssel und Schlüsselkandidat?",
    a: "Ein <strong>Superschlüssel</strong> bestimmt alle Attribute eindeutig. Ein <strong>Schlüsselkandidat</strong> ist ein <em>minimaler</em> Superschlüssel — keine echte Teilmenge ist noch Superschlüssel.",
    correct: 0
  },
  {
    n: 8,
    topic: "Zerlegung",
    q: "Wann heißt eine Zerlegung verlustfrei?",
    a: "Wenn der natürliche Verbund (Join) der zerlegten Relationen exakt die Ursprungsrelation rekonstruiert — also <strong>R = R₁ ⋈ R₂</strong>.",
    correct: 0
  }
];

// Quiz questions (single-correct multiple choice)
window.QUIZ = [
  {
    n: 1,
    q: "Welche Aussage über die 3. Normalform ist korrekt?",
    options: [
      "Jedes Nicht-Schlüsselattribut hängt funktional vom Gesamtschlüssel ab.",
      "Es existieren keine transitiven Abhängigkeiten zwischen Nicht-Schlüsselattributen.",
      "Alle Attribute sind atomar.",
      "Für jede FD X→Y gilt: X ist Superschlüssel."
    ],
    correct: 1,
    explanation: "Die 3NF verbietet transitive Abhängigkeiten unter Nicht-Schlüsselattributen. Antwort (a) beschreibt 2NF, (c) ist 1NF, (d) BCNF."
  },
  {
    n: 2,
    q: "Gegeben R(A,B,C,D) mit A→B, B→C. In welcher Normalform befindet sich R bei Primärschlüssel A?",
    options: ["1NF, aber nicht 2NF", "2NF, aber nicht 3NF", "3NF", "BCNF"],
    correct: 1,
    explanation: "R ist in 2NF, da B nur teilweise per A bestimmt wird — aber C hängt transitiv über B von A ab, also verletzt R die 3NF."
  },
  {
    n: 3,
    q: "Welche Anomalie kann durch Redundanz beim Einfügen auftreten?",
    options: [
      "Daten gehen verloren, weil ein Tupel zu früh gelöscht wird.",
      "Es lassen sich keine neuen Tupel speichern ohne erfundene Werte für andere Spalten.",
      "Ein geändertes Attribut bleibt in einigen Tupeln unverändert.",
      "Tupel werden mehrfach gespeichert."
    ],
    correct: 1,
    explanation: "Das ist die klassische Einfügeanomalie: man kann z.B. keine neue Vorlesung einfügen, solange noch kein Student dafür eingetragen ist."
  }
];

// Recent activity
window.ACTIVITY = [
  { time: "14:32", text: "Lernzettel zu <em>Normalformen</em> wurde generiert" },
  { time: "13:18", text: "12 Karteikarten zu <em>Turing-Maschinen</em> wiederholt" },
  { time: "11:04", text: "Vorlesung <em>Gradient Descent</em> hochgeladen" },
  { time: "Gestern", text: "Quiz <em>Analysis II</em> abgeschlossen — <strong>92%</strong>" },
  { time: "Mo", text: "Lernstreak: <strong>7 Tage</strong> in Folge" }
];

// Streak (last 7 days, last is today)
window.STREAK = [
  { day: "Mi", on: true },
  { day: "Do", on: true },
  { day: "Fr", on: true },
  { day: "Sa", on: false },
  { day: "So", on: true },
  { day: "Mo", on: true },
  { day: "Di", on: true, today: true }
];
