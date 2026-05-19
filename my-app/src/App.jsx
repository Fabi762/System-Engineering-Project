import { useState, useEffect } from 'react'
import './App.css'
import Masthead from './components/Masthead'
import Library  from './components/Library'
import Lecture  from './components/Lecture'
import Upload   from './components/Upload'
import Toast    from './components/Toast'

function App() {
  const [documents,          setDocuments]          = useState([])
  const [view,               setView]               = useState({ name: 'library', lecture: null })
  const [isUploading,        setIsUploading]        = useState(false)
  const [isGeneratingNotes,  setIsGeneratingNotes]  = useState(false)
  const [toast,              setToast]              = useState(null)
  const [theme,              setTheme]              = useState(
    () => localStorage.getItem('sb-theme') || 'paper'
  )

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
    localStorage.setItem('sb-theme', theme)
  }, [theme])

  const showToast = (text, kind = 'success') => {
    setToast({ text, kind })
    setTimeout(() => setToast(null), 2800)
  }

  const updateDocument = (updatedDoc) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d))
    if (view.lecture?.id === updatedDoc.id) {
      setView(v => ({ ...v, lecture: updatedDoc }))
    }
  }

  // ── Navigation ──────────────────────────────────────────────
  const goLibrary  = () => setView({ name: 'library', lecture: null })
  const goUpload   = () => setView({ name: 'upload',  lecture: null })
  const openLecture = (doc) => setView({ name: 'lecture', lecture: doc })

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'paper' : 'dark')

  // ── API handlers (unchanged logic) ──────────────────────────
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
      setDocuments(prev => [doc, ...prev])
      goLibrary()
      showToast(`"${doc.filename}" erfolgreich verarbeitet`)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== id))
      goLibrary()
      showToast('Dokument entfernt')
    } catch {
      showToast('Fehler beim Entfernen', 'error')
    }
  }

  const handleGenerateNotes = async () => {
    const doc = view.lecture
    if (!doc) return
    setIsGeneratingNotes(true)
    try {
      const res = await fetch(`/api/generate/notes/${doc.id}`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Generierung fehlgeschlagen')
      }
      const pdfRes = await fetch(`/api/documents/${doc.id}/notes-pdf`)
      const blob   = await pdfRes.blob()
      const url    = URL.createObjectURL(blob)
      const a      = document.createElement('a')
      a.href       = url
      a.download   = `Lernzettel_${doc.filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      updateDocument({ ...doc, notesPdf: true })
      showToast('Lernzettel als PDF heruntergeladen!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  return (
    <div className="app">
      <Masthead
        view={view.name}
        theme={theme}
        onGoLibrary={goLibrary}
        onGoUpload={goUpload}
        onToggleTheme={toggleTheme}
      />

      <main className="app-main">
        {view.name === 'library' && (
          <Library
            documents={documents}
            onOpen={openLecture}
            onUpload={goUpload}
          />
        )}
        {view.name === 'lecture' && (
          <Lecture
            doc={view.lecture}
            onBack={goLibrary}
            onDelete={() => handleDelete(view.lecture.id)}
            onGenerateNotes={handleGenerateNotes}
            isGeneratingNotes={isGeneratingNotes}
          />
        )}
        {view.name === 'upload' && (
          <Upload
            onUpload={handleUpload}
            onCancel={goLibrary}
            isUploading={isUploading}
          />
        )}
      </main>

      {toast && <Toast text={toast.text} kind={toast.kind} />}
    </div>
  )
}

export default App
