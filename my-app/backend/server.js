const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

// Hinzugefügte Zeile: Import der Parser-Funktionen
const { parsePdfToText, readTextContent, listContents } = require('./pdfProcessor') 

const app = express()
const PORT = process.env.PORT || 4000

// Upload-Ordner sicherstellen
const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
// ... (der Rest des Express-Setups bleibt gleich)
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(UPLOAD_DIR))

// ... (Multer-Setup: storage, fileFilter, upload)

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

app.get('/', (req, res) => {
  res.send('Backend API läuft. Verwende POST /upload zum Hochladen von PDF-Dateien.')
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ====== PDF-Parser Routen ======
// Diese Routen können nun auf die importierten Funktionen zugreifen.

app.post('/parse-pdf', async (req, res) => {
  try {
    const { filename, originalName } = req.body
    console.log(`[API] POST /parse-pdf - filename: ${filename}, originalName: ${originalName}`)

    if (!filename) {
      return res.status(400).json({ success: false, error: 'Dateiname erforderlich' })
    }

    const pdfFilePath = path.join(UPLOAD_DIR, filename)
    console.log(`[API] Vollständiger Pfad: ${pdfFilePath}`)

    // Überprüfe, ob Datei existiert
    if (!fs.existsSync(pdfFilePath)) {
      console.error(`[API] Datei nicht gefunden: ${pdfFilePath}`)
      return res.status(404).json({ success: false, error: 'Datei nicht gefunden' })
    }

    const outputFileName = originalName ? path.parse(originalName).name : path.parse(filename).name

    // parsePdfToText ist jetzt definiert
    const result = await parsePdfToText(pdfFilePath, outputFileName) 
    console.log(`[API] Parsing erfolgreich: ${result.outputFileName}`)

    res.json(result)
  } catch (error) {
    console.error(`[API] Fehler beim Parsing: ${error.message}`)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/contents/:fileName', (req, res) => {
  try {
    // readTextContent ist jetzt definiert
    const content = readTextContent(req.params.fileName) 
    res.json({ success: true, fileName: req.params.fileName, content })
  } catch (error) {
    res.status(404).json({ success: false, error: error.message })
  }
})

app.get('/contents', (req, res) => {
  try {
    // listContents ist jetzt definiert
    const files = listContents() 
    res.json({ success: true, files })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ... (tryListen-Funktion und Serverstart-Logik)

const HOST = process.env.HOST || '0.0.0.0'
const DEFAULT_PORT = parseInt(process.env.PORT || '4000', 10)
const MAX_TRIES = 10

let attempts = 0

function tryListen(port) {
  attempts += 1
  const server = app.listen(port, HOST, () => {
    console.log(`Backend listening on http://${HOST}:${port}`)
  })

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} bereits in Benutzung.`)
      if (attempts < MAX_TRIES) {
        const next = port + 1
        console.warn(`Versuche Port ${next} ...`)
        setTimeout(() => tryListen(next), 300)
      } else {
        console.error(`Kein freier Port gefunden (nach ${MAX_TRIES} Versuchen). Beende.`)
        process.exit(1)
      }
    } else {
      console.error('Serverfehler beim Starten:', err)
      process.exit(1)
    }
  })

  const shutdown = () => {
    server.close(() => {
      console.log('Server heruntergefahren.')
      process.exit(0)
    })
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

tryListen(DEFAULT_PORT)

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err)
})