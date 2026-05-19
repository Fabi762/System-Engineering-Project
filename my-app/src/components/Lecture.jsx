import { useState, useEffect } from 'react'
import { I } from './icons'
import { enrichDoc } from './Library'

// ============================================================
//  Overview tab
// ============================================================
function OverviewTab({ doc, onJump }) {
  const l = enrichDoc(doc)
  return (
    <div className="fade-in">
      <div className="overview-grid">
        <article
          className={`feature-card ${l.notesReady ? 'done' : 'pending'}`}
          onClick={() => onJump('notes')}
        >
          <div className="fc-tag">Lernzettel · {l.notesReady ? 'verfügbar' : 'ausstehend'}</div>
          <h3>Strukturierte Zusammenfassung</h3>
          <p>
            Die KI fasst den Stoff zu einem klaren Lernzettel zusammen — mit Definitionen,
            Formeln und Beispielen. Als PDF herunterladbar.
          </p>
          <div className="fc-meta">
            <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>öffnen →</span>
          </div>
        </article>

        <article className="feature-card pending" onClick={() => onJump('cards')}>
          <div className="fc-tag">Karteikarten · ausstehend</div>
          <h3>Frage-Antwort-Karten</h3>
          <p>
            Karteikarten mit Flip-Animation. Bewerte deine Antworten — schwere Karten
            kommen häufiger zurück.
          </p>
          <div className="fc-meta">
            <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>starten →</span>
          </div>
        </article>

        <article className="feature-card pending" onClick={() => onJump('quiz')}>
          <div className="fc-tag">Quiz · ausstehend</div>
          <h3>Wissens-Check</h3>
          <p>
            Multiple-Choice-Fragen mit Erklärung zum Testen deines Wissens.
          </p>
          <div className="fc-meta">
            <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>starten →</span>
          </div>
        </article>

        <article className="feature-card done">
          <div className="fc-tag">Roh-Inhalt · verfügbar</div>
          <h3>Extrahierter Text</h3>
          <p>
            Der vollständige Vorlesungstext nach Parsing. Zum Weiterverarbeiten in eigene
            Notiz-Apps.
          </p>
          <div className="fc-meta">
            <span>{l.format} · {l.pages !== '—' ? `${l.pages} Seiten` : 'verarbeitet'}</span>
          </div>
        </article>
      </div>
    </div>
  )
}

// ============================================================
//  Notes tab
// ============================================================
function NotesTab({ doc, onGenerate, isGenerating }) {
  const handleDownload = async () => {
    const res = await fetch(`/api/documents/${doc.id}/notes-pdf`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Lernzettel_${doc.filename}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isGenerating) {
    return (
      <div className="notes-generating fade-in">
        <div className="spinner" />
        <h3>Lernzettel wird erstellt...</h3>
        <p>Der Vorlesungsinhalt wird zusammengefasst und als PDF formatiert.</p>
      </div>
    )
  }

  if (!doc.notesPdf) {
    return (
      <div className="notes-generate fade-in">
        <div className="notes-generate-icon">
          <I.Spark size={22} stroke={1.5} />
        </div>
        <h3>Lernzettel erstellen</h3>
        <p>
          Der Vorlesungsinhalt wird zu einem kompakten, strukturierten Lernzettel
          zusammengefasst und als PDF heruntergeladen.
        </p>
        <button className="btn btn-accent btn-lg" onClick={onGenerate}>
          <I.Spark size={14} /> Lernzettel als PDF generieren
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="notes-toolbar">
        <div className="notes-toolbar-left">
          <span>Lernzettel erstellt</span>
          <span>·</span>
          <span>generiert mit KI</span>
        </div>
        <div className="notes-toolbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={onGenerate}>
            <I.Refresh size={13} /> Neu generieren
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <I.Download size={13} /> Als PDF
          </button>
        </div>
      </div>

      <article className="notes-doc">
        <header className="notes-doc-head">
          <div className="notes-meta">
            <span className="mono">{doc.id?.slice(0, 8).toUpperCase()}</span>
            <span>{doc.filename}</span>
          </div>
          <h1>{doc.filename?.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')}</h1>
        </header>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
          Der Lernzettel wurde als PDF heruntergeladen. Du kannst ihn oben erneut
          herunterladen oder neu generieren.
        </p>
      </article>
    </div>
  )
}

// ============================================================
//  Flashcards tab (Placeholder — API kommt in Milestone 4)
// ============================================================
function FlashcardsTab() {
  return (
    <div className="tab-pending fade-in">
      <I.Cards size={40} stroke={1.2} />
      <h3>Karteikarten</h3>
      <p>
        Karteikarten werden in Milestone 4 verfügbar sein. Das Backend-Endpoint
        <span className="mono" style={{ fontSize: 12, margin: '0 4px' }}>/api/generate/flashcards/{'{id}'}</span>
        wird dann automatisch Karten aus dem Vorlesungsinhalt erstellen.
      </p>
    </div>
  )
}

// ============================================================
//  Quiz tab (Placeholder — API kommt in Milestone 4)
// ============================================================
function QuizTab() {
  return (
    <div className="tab-pending fade-in">
      <I.Quiz size={40} stroke={1.2} />
      <h3>Quiz</h3>
      <p>
        Der Wissens-Check mit Multiple-Choice-Fragen wird in Milestone 4 freigeschaltet.
      </p>
    </div>
  )
}

// ============================================================
//  Lecture page shell
// ============================================================
function Lecture({ doc, onBack, onDelete, onGenerateNotes, isGeneratingNotes }) {
  const [tab, setTab] = useState('notes')
  const l = enrichDoc(doc)

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: null },
    { id: 'notes',    label: 'Lernzettel', dot: l.notesReady },
    { id: 'cards',    label: 'Karteikarten', badge: null },
    { id: 'quiz',     label: 'Quiz', badge: null },
  ]

  return (
    <div className="lecture-page fade-in">
      <nav className="breadcrumb">
        <a onClick={onBack}>Bibliothek</a>
        <span className="sep">/</span>
        <span>{l.course}</span>
        <span className="sep">/</span>
        <span style={{ color: 'var(--ink-2)' }}>{l.title}</span>
      </nav>

      <header className="lecture-head">
        <div className="page-eyebrow">
          {l.courseCode} · {l.chapter !== '—' ? `Vorlesung ${l.chapter}` : l.format}
        </div>
        <h1 className="page-title">{l.title}</h1>
        <div className="lecture-meta-row">
          <span><strong>{l.format}</strong>{l.pages !== '—' ? ` · ${l.pages} Seiten` : ''}</span>
          <span>Hochgeladen <strong>{l.uploadedAbs || l.uploaded}</strong></span>
          <span>Fortschritt <strong>{Math.round(l.progress * 100)}%</strong></span>
          <span style={{ marginLeft: 'auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={onDelete}>
              <I.Trash size={12} /> Entfernen
            </button>
          </span>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.label}</span>
            {t.badge && <span className="tab-badge">{t.badge}</span>}
            {t.dot  && <span className="dot-ok" />}
          </button>
        ))}
      </nav>

      {tab === 'overview' && <OverviewTab doc={doc} onJump={setTab} />}
      {tab === 'notes'    && (
        <NotesTab
          doc={doc}
          onGenerate={onGenerateNotes}
          isGenerating={isGeneratingNotes}
        />
      )}
      {tab === 'cards' && <FlashcardsTab />}
      {tab === 'quiz'  && <QuizTab />}
    </div>
  )
}

export default Lecture
