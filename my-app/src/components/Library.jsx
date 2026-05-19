import { useState, useMemo } from 'react'
import { I } from './icons'

function formatRelative(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffMins = Math.floor((now - date) / 60000)
  const diffHours = Math.floor(diffMins / 60)
  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `Vor ${diffMins} Min.`
  if (diffHours < 24) return `Vor ${diffHours} Std.`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatAbs(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function enrichDoc(doc) {
  const ext = (doc.filename || '').split('.').pop().toUpperCase()
  const title = (doc.filename || '').replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
  return {
    ...doc,
    title,
    format: ext || 'DOC',
    pages: doc.pages || '—',
    course: doc.course || 'Vorlesung',
    courseCode: doc.courseCode || doc.id?.slice(0, 8).toUpperCase() || '—',
    chapter: doc.chapter || '—',
    uploaded: formatRelative(doc.uploaded_at),
    uploadedAbs: formatAbs(doc.uploaded_at),
    notesReady: !!doc.notesPdf,
    cardsReady: false,
    progress: doc.notesPdf ? 0.5 : 0,
  }
}

function StatStrip({ documents }) {
  const notesCount = documents.filter(d => d.notesPdf).length
  return (
    <div className="stats-strip">
      <div className="stat">
        <div className="stat-label">Vorlesungen</div>
        <div className="stat-value">{documents.length}<span className="stat-unit">gesamt</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Lernzettel</div>
        <div className="stat-value">{notesCount}<span className="stat-unit">PDF</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Karteikarten</div>
        <div className="stat-value">0<span className="stat-unit">Karten</span></div>
      </div>
      <div className="stat">
        <div className="stat-label">Hochgeladen</div>
        <div className="stat-value">{documents.length}<span className="stat-unit">Dateien</span></div>
      </div>
    </div>
  )
}

function LectureCard({ doc, onOpen }) {
  const l = enrichDoc(doc)
  return (
    <article className="lecture-card" onClick={() => onOpen(doc)}>
      <div className="lc-head">
        <span>{l.course} · {l.chapter !== '—' ? `VL ${l.chapter}` : l.courseCode}</span>
        <span className="lc-fmt">{l.format}</span>
      </div>
      <h3 className="lc-title">{l.title}</h3>
      <div className="lc-status">
        {l.notesReady && <span className="lc-pill">Lernzettel</span>}
        {l.cardsReady && <span className="lc-pill">Karteikarten</span>}
        {!l.notesReady && !l.cardsReady && <span className="lc-pill muted">In Bearbeitung</span>}
      </div>
      <div className="lc-meta">
        <span>{l.pages !== '—' ? `${l.pages} Seiten` : l.format}</span>
        <span style={{ marginLeft: 'auto' }}>{l.uploaded}</span>
      </div>
    </article>
  )
}

function Library({ documents, onOpen, onUpload }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'notes') return documents.filter(d => d.notesPdf)
    if (filter === 'cards') return documents.filter(d => d.cardsReady)
    if (filter === 'todo')  return documents.filter(d => !d.notesPdf)
    return documents
  }, [documents, filter])

  return (
    <div className="fade-in">
      <header className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Sommersemester 2026</div>
          <h1 className="page-title" style={{ fontFamily: '"IBM Plex Mono"' }}>Bibliothek</h1>
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

      <StatStrip documents={documents} />

      <div className="lib-toolbar">
        <h2 className="lib-toolbar-title">
          Vorlesungen <span className="count">({filtered.length})</span>
        </h2>
        <div className="filter-bar">
          {[
            { id: 'all',   label: 'Alle' },
            { id: 'notes', label: 'Mit Lernzettel' },
            { id: 'cards', label: 'Mit Karteikarten' },
            { id: 'todo',  label: 'Offen' },
          ].map(f => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lecture-grid">
        {filtered.length === 0 ? (
          <div className="lecture-grid-empty">
            {documents.length === 0
              ? 'Noch keine Vorlesungen hochgeladen. Klicke auf „Neue Vorlesung".'
              : 'Keine Vorlesungen für diesen Filter.'}
          </div>
        ) : (
          filtered.map(doc => (
            <LectureCard key={doc.id} doc={doc} onOpen={onOpen} />
          ))
        )}
      </div>
    </div>
  )
}

export default Library
