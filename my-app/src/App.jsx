import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import FileUpload from './components/FileUpload'
import DocumentViewer from './components/DocumentViewer'

function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const updateDocument = (updatedDoc) => {
    setSelectedDoc(updatedDoc)
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)))
  }

  const handleUpload = async (file) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Upload fehlgeschlagen')
      }
      const doc = await res.json()
      setDocuments((prev) => [doc, ...prev])
      setSelectedDoc(doc)
      showNotification(`"${doc.filename}" erfolgreich verarbeitet`)
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
      showNotification('Dokument entfernt')
    } catch {
      showNotification('Fehler beim Entfernen', 'error')
    }
  }

  const handleGenerateNotes = async () => {
    if (!selectedDoc) return
    setIsGeneratingNotes(true)
    try {
      const res = await fetch(`/api/generate/notes/${selectedDoc.id}`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Generierung fehlgeschlagen')
      }

      const pdfRes = await fetch(`/api/documents/${selectedDoc.id}/notes-pdf`)
      const blob = await pdfRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Lernzettel_${selectedDoc.filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      updateDocument({ ...selectedDoc, notesPdf: true })
      showNotification('Lernzettel als PDF heruntergeladen!')
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar
          documents={documents}
          selectedDoc={selectedDoc}
          onSelect={setSelectedDoc}
          onDelete={handleDelete}
          onNewUpload={() => setSelectedDoc(null)}
          isUploading={isUploading}
        />
        <main className="main-content">
          {selectedDoc ? (
            <DocumentViewer
              document={selectedDoc}
              onGenerateNotes={handleGenerateNotes}
              isGeneratingNotes={isGeneratingNotes}
            />
          ) : (
            <FileUpload onUpload={handleUpload} isUploading={isUploading} />
          )}
        </main>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  )
}

export default App
