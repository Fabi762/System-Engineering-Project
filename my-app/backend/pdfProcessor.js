const pdfjsLib = require('pdfjs-dist/legacy/build/pdf')
const fs = require('fs')
const path = require('path')

// Stelle sicher, dass der Contents-Ordner existiert
const CONTENTS_DIR = path.join(__dirname, 'Contents')
fs.mkdirSync(CONTENTS_DIR, { recursive: true })

/**
 * Extrahiert Text aus einer PDF-Datei und speichert ihn in einer TXT-Datei
 * @param {string} pdfFilePath - Pfad zur hochgeladenen PDF-Datei
 * @param {string} outputFileName - Name der Output-Datei (ohne .txt)
 * @returns {Promise<Object>} - Erfolgreiches Ergebnis mit Dateipfad und Metadaten
 */
async function parsePdfToText(pdfFilePath, outputFileName) {
  try {
    console.log(`[PDF Parser] Verarbeite Datei: ${pdfFilePath}`)
    
    // Überprüfe, ob Datei existiert
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`Datei nicht gefunden: ${pdfFilePath}`)
    }

    // PDF einlesen
    const fileBuffer = fs.readFileSync(pdfFilePath)
    console.log(`[PDF Parser] Dateigröße: ${fileBuffer.length} bytes`)
    
    // PDF mit pdfjs-dist verarbeiten
    let extractedText = ''
    try {
      // Konvertiere Buffer zu Uint8Array
      const uint8Array = new Uint8Array(fileBuffer)
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise
      console.log(`[PDF Parser] PDF geladen - Seiten: ${pdf.numPages}`)

      // Text von jeder Seite extrahieren
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        extractedText += pageText + '\n'
      }

      console.log(`[PDF Parser] Text erfolgreich extrahiert - ${extractedText.length} Zeichen`)
    } catch (e) {
      console.error(`[PDF Parser] pdfjs Fehler: ${e.message}`)
      throw e
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Keine Text-Inhalte in der PDF gefunden')
    }

    // Output-Datei erstellen
    const outputFileName_sanitized = outputFileName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
    const txtFilePath = path.join(
      CONTENTS_DIR,
      `${outputFileName_sanitized}.txt`
    )

    // Text in TXT-Datei schreiben
    fs.writeFileSync(txtFilePath, extractedText, 'utf-8')
    console.log(`[PDF Parser] TXT-Datei gespeichert: ${txtFilePath}`)

    return {
      success: true,
      message: 'PDF erfolgreich geparst',
      txtFilePath: txtFilePath,
      outputFileName: `${outputFileName_sanitized}.txt`,
      pageCount: extractedText.split('\n').length,
      textLength: extractedText.length,
      contents: CONTENTS_DIR
    }
  } catch (error) {
    console.error(`[PDF Parser Fehler] ${error.message}`)
    throw new Error(`PDF-Parsing-Fehler: ${error.message}`)
  }
}

/**
 * Liest den extrahierten Text aus einer TXT-Datei
 * @param {string} fileName - Name der TXT-Datei (mit oder ohne .txt)
 * @returns {string} - Inhalt der TXT-Datei
 */
function readTextContent(fileName) {
  try {
    const cleanFileName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`
    const filePath = path.join(CONTENTS_DIR, cleanFileName)
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    throw new Error(`Fehler beim Lesen der Datei: ${error.message}`)
  }
}

/**
 * Listet alle extrahierten Inhalte auf
 * @returns {Array<string>} - Array mit allen TXT-Dateinamen im Contents-Ordner
 */
function listContents() {
  try {
    return fs.readdirSync(CONTENTS_DIR)
  } catch (error) {
    return []
  }
}

module.exports = {
  parsePdfToText,
  readTextContent,
  listContents,
  CONTENTS_DIR
}
