const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000

// Upload-Ordner sicherstellen
const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

app.use(cors())
app.use(express.json())
// Statische Auslieferung, falls Frontend Links zu gespeicherten Dateien benötigt
app.use('/uploads', express.static(UPLOAD_DIR))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_')
    cb(null, safe)
  }
})

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf')
  if (isPdf) cb(null, true)
  else cb(null, false)
}

const upload = multer({ storage, fileFilter })

app.post('/upload', upload.array('files', 50), (req, res) => {
  const files = (req.files || []).map((f) => ({
    originalName: f.originalname,
    filename: f.filename,
    path: `/uploads/${f.filename}`,
    size: f.size
  }))
  res.json({ success: true, files })
})

// einfache Root-Route, damit GET / nicht mit "Cannot GET /" antwortet
app.get('/', (req, res) => {
  res.send('Backend API läuft. Verwende POST /upload zum Hochladen von PDF-Dateien.');
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
