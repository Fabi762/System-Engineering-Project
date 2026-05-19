import { useRef, useState } from 'react'
import { I } from './icons'

const FORMATS = ['PDF', 'PPTX', 'DOCX', 'XLSX', 'HTML', 'MD', 'PNG']

function Upload({ onUpload, onCancel, isUploading }) {
  const [dragging, setDragging] = useState(false)
  const dragCounter = useRef(0)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current++
    setDragging(true)
  }
  const handleDragOver  = (e) => { e.preventDefault() }
  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) { onUpload(file); e.target.value = '' }
  }

  return (
    <div className="fade-in">
      <header className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Neue Vorlesung</div>
          <h1 className="page-title">Folien hochladen</h1>
          <p className="page-sub">
            PDF, PPTX oder DOCX hochladen — StudyBuddy extrahiert den Inhalt
            und bereitet Lernzettel und Karteikarten vor.
          </p>
        </div>
        <div className="page-head-right">
          <button className="btn btn-ghost" onClick={onCancel}>
            <I.X size={14} /> Abbrechen
          </button>
        </div>
      </header>

      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.pptx,.xlsx,.html,.htm,.md,.adoc,.png,.jpg,.jpeg,.tiff,.bmp"
        />

        {isUploading ? (
          <div className="upload-progress">
            <div className="spinner" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                Vorlesungsfolien werden analysiert...
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                Die KI extrahiert den Inhalt. Bitte warten.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <I.Upload size={20} stroke={1.6} />
            </div>
            <div className="upload-h">Folien hier ablegen</div>
            <div className="upload-sub">
              oder <span className="upload-link">eine Datei auswählen</span>
            </div>
            <div className="upload-formats">
              {FORMATS.map(f => <span key={f}>{f}</span>)}
            </div>
            <div className="upload-hint">max. 50 MB</div>
          </>
        )}
      </div>
    </div>
  )
}

export default Upload
