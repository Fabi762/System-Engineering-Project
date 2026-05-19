/* global React, I, OUTLINE, FLASHCARDS, QUIZ */

// ============================================================
//  Overview tab
// ============================================================
function OverviewTab({ lecture, onJump }) {
  return (
    <div className="fade-in">
      <div className="overview-grid">
        <article className={`feature-card ${lecture.notesReady ? "done" : "pending"}`}
                 onClick={() => onJump("notes")}>
          <div className="fc-tag">Lernzettel · {lecture.notesReady ? "verfügbar" : "ausstehend"}</div>
          <h3>Strukturierte Zusammenfassung</h3>
          <p>
            Die KI fasst den Stoff zu einem klaren Lernzettel zusammen — mit Definitionen,
            Formeln und Beispielen. Als PDF herunterladbar.
          </p>
          <div className="fc-meta">
            <span>4 Abschnitte</span>
            <span>1.240 Wörter</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>öffnen →</span>
          </div>
        </article>

        <article className={`feature-card ${lecture.cardsReady ? "done" : "pending"}`}
                 onClick={() => onJump("cards")}>
          <div className="fc-tag">Karteikarten · {lecture.cardsReady ? "8 Karten" : "ausstehend"}</div>
          <h3>Frage-Antwort-Karten</h3>
          <p>
            Karteikarten mit Flip-Animation. Bewerte deine Antworten — schwere Karten
            kommen häufiger zurück.
          </p>
          <div className="fc-meta">
            <span>5 von 8 wiederholt</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>starten →</span>
          </div>
        </article>

        <article className={`feature-card ${lecture.cardsReady ? "done" : "pending"}`}
                 onClick={() => onJump("quiz")}>
          <div className="fc-tag">Quiz · {lecture.cardsReady ? "3 Fragen" : "ausstehend"}</div>
          <h3>Wissens-Check</h3>
          <p>
            Multiple-Choice-Fragen mit Erklärung. Bisheriges bestes Ergebnis: 67%.
          </p>
          <div className="fc-meta">
            <span>Multiple Choice</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>starten →</span>
          </div>
        </article>

        <article className="feature-card">
          <div className="fc-tag">Roh-Inhalt · verfügbar</div>
          <h3>Extrahierter Text</h3>
          <p>
            Der vollständige Vorlesungstext nach Parsing. Zum Kopieren in eigene
            Notiz-Apps wie Notion oder Obsidian.
          </p>
          <div className="fc-meta">
            <span>{lecture.pages} Seiten</span>
            <span>18.420 Wörter</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>kopieren →</span>
          </div>
        </article>
      </div>

      <section className="outline">
        <div className="outline-head">
          <h3 className="outline-title">Inhaltsverzeichnis</h3>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>automatisch erkannt</span>
        </div>
        <ol>
          {OUTLINE.map((item, i) => (
            <li key={i}>
              <span/>
              <span className="ol-text">
                {item.title}
                <small>{item.sub}</small>
              </span>
              <span className="ol-page">{item.page}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// ============================================================
//  Notes tab
// ============================================================
function NotesTab({ lecture }) {
  return (
    <div className="fade-in">
      <div className="notes-toolbar">
        <div className="notes-toolbar-left">
          <span>4 Abschnitte · 1.240 Wörter</span>
          <span>·</span>
          <span>generiert mit GPT-4.1</span>
        </div>
        <div className="notes-toolbar-actions">
          <button className="btn btn-ghost btn-sm">
            <I.Refresh size={13}/> Neu generieren
          </button>
          <button className="btn btn-primary btn-sm">
            <I.Download size={13}/> Als PDF
          </button>
        </div>
      </div>

      <article className="notes-doc">
        <header className="notes-doc-head">
          <div className="notes-meta">
            <span className="mono">{lecture.id}</span>
            <span>{lecture.course} · VL {lecture.chapter}</span>
            <span>{lecture.uploadedAbs}</span>
          </div>
          <h1>{lecture.title}</h1>
        </header>

        <h2><span className="sec-num">§ 1</span>Funktionale Abhängigkeiten</h2>
        <p>
          Eine funktionale Abhängigkeit (FD) X → Y zwischen zwei Attributmengen X und Y
          einer Relation R bedeutet: Wenn zwei Tupel in X übereinstimmen, müssen sie auch
          in Y übereinstimmen. X bestimmt Y eindeutig.
        </p>

        <p className="formula">X → Y &nbsp;⟺&nbsp; ∀ t₁, t₂ ∈ R : t₁[X] = t₂[X] ⇒ t₁[Y] = t₂[Y]</p>

        <h3>Armstrong-Axiome</h3>
        <ul>
          <li><strong>Reflexivität:</strong> Wenn Y ⊆ X, dann X → Y.</li>
          <li><strong>Erweiterung:</strong> Wenn X → Y, dann XZ → YZ.</li>
          <li><strong>Transitivität:</strong> Wenn X → Y und Y → Z, dann X → Z.</li>
        </ul>

        <h2><span className="sec-num">§ 2</span>Normalformen im Überblick</h2>
        <p>
          Normalformen sind aufeinander aufbauende Qualitätsstufen für relationale Schemata.
          Jede höhere Normalform schließt zusätzliche Klassen von <code>Anomalien</code> aus —
          Einfüge-, Lösch- und Änderungsanomalien.
        </p>

        <h3>Die fünf wichtigsten Stufen</h3>
        <ol>
          <li><strong>1NF</strong> — Atomare Attributwerte, keine Listen oder Mengen in Zellen.</li>
          <li><strong>2NF</strong> — 1NF + keine partiellen Abhängigkeiten vom Primärschlüssel.</li>
          <li><strong>3NF</strong> — 2NF + keine transitiven Abhängigkeiten zwischen Nicht-Schlüsselattributen.</li>
          <li><strong>BCNF</strong> — Jede nicht-triviale FD X → Y verlangt, dass X ein Superschlüssel ist.</li>
          <li><strong>4NF</strong> — BCNF + keine mehrwertigen Abhängigkeiten.</li>
        </ol>

        <h2><span className="sec-num">§ 3</span>Synthesealgorithmus</h2>
        <p>
          Um eine Relation in 3NF zu überführen, ohne Information zu verlieren, nutzt man
          den Synthesealgorithmus:
        </p>
        <ol>
          <li>Berechne eine <code>minimale Überdeckung</code> der gegebenen FDs.</li>
          <li>Fasse FDs mit gleicher linker Seite zu einer Relation zusammen.</li>
          <li>Falls keine entstandene Relation einen Schlüssel der Ursprungsrelation enthält, ergänze eine zusätzliche Relation mit einem solchen Schlüssel.</li>
        </ol>
        <p>
          Das Resultat ist <strong>verlustfrei</strong> (R = R₁ ⋈ R₂ ⋈ … ⋈ Rₙ) und
          <strong> abhängigkeitserhaltend</strong>.
        </p>

        <h2><span className="sec-num">§ 4</span>Merksätze</h2>
        <ul>
          <li>1NF macht's flach, 2NF macht's voll, 3NF macht's frei, BCNF macht's streng.</li>
          <li>Transitive Abhängigkeit erkennen: <code>A → B → C</code> mit A ≠ Schlüssel von B.</li>
          <li>BCNF kann manchmal nicht abhängigkeitserhaltend zerlegt werden — 3NF immer.</li>
        </ul>
      </article>
    </div>
  );
}

// ============================================================
//  Flashcards tab
// ============================================================
function FlashcardsTab() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const card = FLASHCARDS[idx];

  const go = (delta) => {
    setIdx((i) => Math.max(0, Math.min(FLASHCARDS.length - 1, i + delta)));
    setFlipped(false);
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft")  go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flash-stage fade-in">
      <div className="flash-progress">
        <div className="flash-progress-row">
          <span>{card.topic}</span>
          <span className="count">{idx + 1} / {FLASHCARDS.length}</span>
        </div>
        <div className="flash-bar">
          <div className="flash-bar-fill" style={{ width: `${((idx + 1) / FLASHCARDS.length) * 100}%` }}/>
        </div>
      </div>

      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
        <div className="flashcard-inner">
          <div className="fc-face">
            <span className="fc-corner">{String(card.n).padStart(2, "0")}</span>
            <div className="fc-label">Frage</div>
            <div className="fc-body">
              <p className="fc-body-q">{card.q}</p>
            </div>
            <div className="fc-foot">
              <span>{card.topic}</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <span className="kbd">␣</span> zum Umdrehen
              </span>
            </div>
          </div>
          <div className="fc-face fc-back">
            <span className="fc-corner">{String(card.n).padStart(2, "0")}</span>
            <div className="fc-label">Antwort</div>
            <div className="fc-body">
              <p className="fc-body-a" dangerouslySetInnerHTML={{ __html: card.a }}/>
            </div>
            <div className="fc-foot">
              <span>{card.topic}</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <span className="kbd">␣</span> zurück
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flash-controls">
        <button className="nav-btn" onClick={() => go(-1)} disabled={idx === 0} title="Zurück (←)">
          <I.Left size={16}/>
        </button>
        <button className="nav-btn" onClick={() => go(1)} disabled={idx === FLASHCARDS.length - 1} title="Weiter (→)">
          <I.Right size={16}/>
        </button>
        <div className="flash-rate">
          <button onClick={() => go(1)}>Nochmal</button>
          <button onClick={() => go(1)}>Schwer</button>
          <button onClick={() => go(1)}>Gut</button>
          <button onClick={() => go(1)}>Einfach</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Quiz tab
// ============================================================
function QuizTab() {
  const [idx, setIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const q = QUIZ[idx];

  const next = () => {
    if (idx < QUIZ.length - 1) { setIdx(idx + 1); setSelected(null); }
  };

  return (
    <div className="fade-in">
      <div className="flash-progress" style={{ maxWidth: 720, margin: "0 auto 20px" }}>
        <div className="flash-progress-row">
          <span>Wissens-Check</span>
          <span className="count">{idx + 1} / {QUIZ.length}</span>
        </div>
        <div className="flash-bar">
          <div className="flash-bar-fill" style={{ width: `${((idx + 1) / QUIZ.length) * 100}%` }}/>
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-num">Frage {q.n} von {QUIZ.length}</div>
        <h2 className="quiz-q">{q.q}</h2>
        <div className="quiz-opts">
          {q.options.map((opt, i) => {
            let cls = "quiz-opt";
            if (selected !== null) {
              if (i === q.correct) cls += " correct";
              else if (i === selected) cls += " wrong";
            }
            return (
              <button
                key={i}
                className={cls}
                disabled={selected !== null}
                onClick={() => setSelected(i)}>
                <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <>
            <div className="quiz-feedback">
              <div className="fb-label">{selected === q.correct ? "Korrekt" : "Erklärung"}</div>
              <div>{q.explanation}</div>
            </div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              {idx < QUIZ.length - 1 ? (
                <button className="btn btn-accent" onClick={next}>
                  Nächste Frage <I.Arrow size={14}/>
                </button>
              ) : (
                <button className="btn btn-accent" onClick={() => { setIdx(0); setSelected(null); }}>
                  <I.Refresh size={14}/> Quiz neu starten
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  Lecture page shell
// ============================================================
function Lecture({ lecture, onBack }) {
  const [tab, setTab] = React.useState("notes");

  const tabs = [
    { id: "overview", label: "Übersicht" },
    { id: "notes",    label: "Lernzettel", dot: lecture.notesReady },
    { id: "cards",    label: "Karteikarten", badge: lecture.cardsReady ? "8" : null },
    { id: "quiz",     label: "Quiz", badge: lecture.cardsReady ? "3" : null }
  ];

  return (
    <div className="lecture-page fade-in" data-screen-label={`02 Lecture / ${lecture.id}`}>
      <nav className="breadcrumb">
        <a onClick={onBack}>Bibliothek</a>
        <span className="sep">/</span>
        <span>{lecture.course}</span>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink-2)" }}>VL {lecture.chapter}</span>
      </nav>

      <header className="lecture-head">
        <div className="page-eyebrow">
          {lecture.courseCode} · Vorlesung {lecture.chapter}
        </div>
        <h1 className="page-title">{lecture.title}</h1>
        <div className="lecture-meta-row">
          <span><strong>{lecture.format}</strong> · {lecture.pages} Seiten</span>
          <span>Hochgeladen <strong>{lecture.uploadedAbs}</strong></span>
          <span>Fortschritt <strong>{Math.round(lecture.progress * 100)}%</strong></span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button className="btn btn-ghost btn-sm"><I.Trash size={12}/> Entfernen</button>
          </span>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>
            <span>{t.label}</span>
            {t.badge && <span className="badge">{t.badge}</span>}
            {t.dot && <span className="dot-ok"/>}
          </button>
        ))}
      </nav>

      {tab === "overview" && <OverviewTab lecture={lecture} onJump={setTab}/>}
      {tab === "notes"    && <NotesTab lecture={lecture}/>}
      {tab === "cards"    && <FlashcardsTab/>}
      {tab === "quiz"     && <QuizTab/>}
    </div>
  );
}

window.Lecture = Lecture;
