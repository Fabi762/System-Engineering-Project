/* global React, I, LECTURES */

function StatStrip() {
  const lectures = LECTURES.length;
  const cards = 84;
  const notes = LECTURES.filter((l) => l.notesReady).length;
  return (
    <div className="stats-strip">
      <div className="stat">
        <div className="stat-label">Vorlesungen</div>
        <div className="stat-value">{lectures}<span className="stat-unit">gesamt</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Lernzettel</div>
        <div className="stat-value">{notes}<span className="stat-unit">PDF</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Karteikarten</div>
        <div className="stat-value">{cards}<span className="stat-unit">Karten</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Lernstreak</div>
        <div className="stat-value">7<span className="stat-unit">Tage</span></div>
      </div>
    </div>);

}

function LectureCard({ l, onOpen }) {
  return (
    <article className="lecture-card" onClick={() => onOpen(l)} data-screen-label="Library / Card">
      <div className="lc-head">
        <span>{l.course} · VL {l.chapter}</span>
        <span className="lc-fmt">{l.format}</span>
      </div>
      <h3 className="lc-title">{l.title}</h3>
      <div className="lc-status">
        {l.notesReady && <span className="lc-pill">Lernzettel</span>}
        {l.cardsReady && <span className="lc-pill">Karteikarten</span>}
        {!l.notesReady && !l.cardsReady && <span className="lc-pill muted">In Bearbeitung</span>}
      </div>
      <div className="lc-meta">
        <span>{l.pages} Seiten</span>
        <span style={{ marginLeft: "auto" }}>{l.uploaded}</span>
      </div>
    </article>);

}

function Library({ onOpen, onUpload }) {
  const [filter, setFilter] = React.useState("all");

  const filtered = React.useMemo(() => {
    if (filter === "all") return LECTURES;
    if (filter === "notes") return LECTURES.filter((l) => l.notesReady);
    if (filter === "cards") return LECTURES.filter((l) => l.cardsReady);
    if (filter === "todo") return LECTURES.filter((l) => !l.notesReady || !l.cardsReady);
    return LECTURES;
  }, [filter]);

  return (
    <div className="fade-in" data-screen-label="01 Library">
      <header className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Sommersemester 2026</div>
          <h1 className="page-title" style={{ fontFamily: "\"IBM Plex Mono\"" }}>Bibliothek</h1>
          <p className="page-sub">
            Deine Vorlesungen, Lernzettel und Karteikarten an einem Ort.
          </p>
        </div>
        <div className="page-head-right">
          <button className="btn btn-accent btn-lg" onClick={onUpload}>
            <I.Plus size={14} stroke={2} /> Neue Vorlesung
          </button>
        </div>
      </header>

      <StatStrip />

      <div className="lib-toolbar">
        <h2 className="lib-toolbar-title">
          Vorlesungen <span className="count">({filtered.length})</span>
        </h2>
        <div className="filter-bar">
          <button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Alle</button>
          <button className={`filter-chip ${filter === "notes" ? "active" : ""}`} onClick={() => setFilter("notes")}>Mit Lernzettel</button>
          <button className={`filter-chip ${filter === "cards" ? "active" : ""}`} onClick={() => setFilter("cards")}>Mit Karteikarten</button>
          <button className={`filter-chip ${filter === "todo" ? "active" : ""}`} onClick={() => setFilter("todo")}>Offen</button>
        </div>
      </div>

      <div className="lecture-grid">
        {filtered.map((l) => <LectureCard key={l.id} l={l} onOpen={onOpen} />)}
      </div>
    </div>);

}

window.Library = Library;