import { useState } from 'react'
import './App.css'

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [status, setStatus] = useState('')
  const [uploaded, setUploaded] = useState([])

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
      // changed: use relative path so Vite dev server proxy forwards to backend
      const res = await fetch('/upload', {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error(`Server antwortete mit ${res.status}`)
      const body = await res.json()
      setUploaded(body.files || [])
      setStatus('Hochladen abgeschlossen.')
    } catch (err) {
      console.error(err)
      setStatus('Fehler beim Hochladen.')
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
