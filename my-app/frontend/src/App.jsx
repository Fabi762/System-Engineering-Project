import { useState } from 'react'
import './App.css'

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [status, setStatus] = useState('')
  const [uploaded, setUploaded] = useState([])
  const [parsed, setParsed] = useState([])

  function onFileChange(e) {
    const chosen = Array.from(e.target.files || [])
    const pdfs = chosen.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    setSelectedFiles(pdfs)
    if (chosen.length && pdfs.length !== chosen.length) {
      setStatus('Nur PDF-Dateien werden akzeptiert; ungültige Dateien wurden entfernt.')
    } else {
      setStatus('')
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!selectedFiles.length) {
      setStatus('Bitte mindestens eine PDF auswählen.')
      return
    }
    const form = new FormData()
    selectedFiles.forEach((f) => form.append('files', f))

    try {
      setStatus('Hochladen...')
      const res = await fetch('/upload', {
        method: 'POST',
        body: form
      })
      if (!res.ok) {
        setStatus(`Serverfehler beim Hochladen: ${res.status}`)
        throw new Error(`Server antwortete mit ${res.status}`)
      }
      const body = await res.json()
      setUploaded(body.files || [])
      setStatus('Hochladen abgeschlossen.')
    } catch (err) {
      console.error(err)
      if (err instanceof TypeError) {
        // Fetch wirft TypeError bei Netzwerkproblemen
        setStatus('Backend nicht erreichbar. Starte das Backend: cd my-app/backend && npm start')
      } else {
        setStatus('Fehler beim Hochladen.')
      }
    }
  }

  async function onParsePdf(file) {
    try {
      setStatus(`Lese aus: ${file.originalName}...`)
      
      const parseRes = await fetch('/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.filename,
          originalName: file.originalName
        })
      })
      if (!parseRes.ok) {
        setStatus(`Serverfehler beim Auslesen: ${parseRes.status}`)
        throw new Error(`Server antwortete mit ${parseRes.status}`)
      }
      const result = await parseRes.json()
      
      setParsed((p) => [...p, result])
      setStatus(`✓ "${file.originalName}" erfolgreich ausgelesen! Text gespeichert: ${result.outputFileName}`)
    } catch (err) {
      console.error(err)
      if (err instanceof TypeError) {
        setStatus('Backend nicht erreichbar. Starte das Backend: cd my-app/backend && npm start')
      } else {
        setStatus(`Fehler beim Auslesen von "${file.originalName}".`)
      }
    }
  }

  async function onParseAllFiles() {
    if (!uploaded.length) {
      setStatus('Keine hochgeladenen Dateien zum Auslesen.')
      return
    }
    
    setStatus('Lese alle Dateien aus...')
    setParsed([])
    
    for (const file of uploaded) {
      await onParsePdf(file)
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>PDF Upload</h2>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={onFileChange}
        />
        <div style={{ marginTop: 10 }}>
          <button type="submit">Hochladen</button>
        </div>
      </form>

      <div style={{ marginTop: 12, color: 'gray' }}>{status}</div>

      {uploaded.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Hochgeladene Dateien</h3>
          <ul>
            {uploaded.map((f, i) => (
              <li key={i}>
                {f.originalName} — gespeichert als: {f.filename} ({f.size} bytes)
                <button 
                  onClick={() => onParsePdf(f)}
                  style={{ marginLeft: 10, padding: '5px 10px', cursor: 'pointer' }}
                >
                  Auslesen
                </button>
              </li>
            ))}
          </ul>
          <button 
            onClick={onParseAllFiles}
            style={{ marginTop: 10, padding: '8px 15px', fontSize: 16, cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Alle Dateien auslesen
          </button>
        </div>
      )}

      {parsed.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Ausgelesene Inhalte</h3>
          <ul>
            {parsed.map((p, i) => (
              <li key={i}>
                <strong>{p.outputFileName}</strong> — {p.pageCount} Seiten, {p.textLength} Zeichen
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
