import os
import re
import uuid
import json
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import httpx
from fpdf import FPDF

load_dotenv()

app = FastAPI(title="StudyBuddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_CONTENT_LENGTH = 15000

documents_store: dict = {}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "ai_available": GEMINI_API_KEY is not None}


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    safe_filename = file.filename.replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        extracted_text = ""
        filename_lower = safe_filename.lower()
        
        if filename_lower.endswith(".pdf"):
            reader = PdfReader(file_path)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n\n"
        else:
            # Fallback für Text/Markdown Dateien
            with open(file_path, "r", encoding="utf-8", errors="replace") as text_file:
                extracted_text = text_file.read()

        doc = {
            "id": doc_id,
            "filename": file.filename,
            "uploaded_at": datetime.now().isoformat(),
            "markdown": extracted_text,
        }
        documents_store[doc_id] = {**doc, "file_path": file_path}
        return doc
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


INTERNAL_KEYS = ("file_path", "notes_pdf_path")


@app.get("/api/documents")
async def list_documents():
    return [
        {k: v for k, v in doc.items() if k not in INTERNAL_KEYS}
        for doc in documents_store.values()
    ]


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: str):
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    doc = documents_store[doc_id]
    return {k: v for k, v in doc.items() if k not in INTERNAL_KEYS}


@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    doc = documents_store.pop(doc_id)
    if os.path.exists(doc["file_path"]):
        os.remove(doc["file_path"])
    if "notes_pdf_path" in doc and os.path.exists(doc["notes_pdf_path"]):
        os.remove(doc["notes_pdf_path"])
    return {"status": "deleted"}


# --- Karteikarten-Generierung (geplant fuer Sprint 4) ---
# Der folgende Endpoint ist fuer Milestone 4 vorgesehen und aktuell deaktiviert.
#
# @app.post("/api/generate/flashcards/{doc_id}")
# async def generate_flashcards(doc_id: str):
#     if not ai_client:
#         raise HTTPException(
#             status_code=503,
#             detail="Google Gemini ist nicht konfiguriert. "
#             "Bitte GEMINI_API_KEY in der .env-Datei setzen.",
#         )
#     if doc_id not in documents_store:
#         raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
#
#     markdown = documents_store[doc_id]["markdown"]
#     content = markdown[:MAX_CONTENT_LENGTH]
#     if len(markdown) > MAX_CONTENT_LENGTH:
#         content += "\n\n[Inhalt gekuerzt...]"
#
#     try:
#         response = await ai_client.aio.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=[
#                 f"Erstelle Karteikarten aus diesem Vorlesungsinhalt:\n\n{content}"
#             ],
#             config=types.GenerateContentConfig(
#                 system_instruction=(
#                     "Du bist ein Lernassistent fuer Studierende. "
#                     "Erstelle aus dem gegebenen Vorlesungsinhalt Karteikarten. "
#                     "Jede Karteikarte hat eine 'question' (praeizse Frage) und "
#                     "eine 'answer' (kompakte, verstaendliche Antwort). "
#                     "Erstelle 10-15 Karteikarten, die die wichtigsten Konzepte abdecken. "
#                     "Antworte ausschliesslich mit einem JSON-Objekt im Format: "
#                     '{"flashcards": [{"question": "...", "answer": "..."}, ...]}'
#                 ),
#                 response_mime_type="application/json",
#                 temperature=0.7,
#             ),
#         )
#
#         result = json.loads(response.text)
#         flashcards = result.get("flashcards", [])
#         documents_store[doc_id]["flashcards"] = flashcards
#         return {"flashcards": flashcards}
#
#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="KI-Antwort konnte nicht verarbeitet werden")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"KI-Generierung fehlgeschlagen: {str(e)}")


# ---------------------------------------------------------------------------
#  PDF-Rendering – Custom Markdown-to-PDF Renderer
# ---------------------------------------------------------------------------

# Color palette
_C_PRIMARY = (79, 70, 229)
_C_PRIMARY_LIGHT = (238, 242, 255)
_C_HEADING2 = (30, 64, 175)
_C_HEADING3 = (67, 56, 202)
_C_TEXT = (15, 23, 42)
_C_TEXT_SEC = (71, 85, 105)
_C_QUOTE_BG = (239, 246, 255)
_C_QUOTE_BORDER = (59, 130, 246)
_C_IMPORTANT_BG = (254, 252, 232)
_C_IMPORTANT_BORDER = (217, 158, 27)
_C_RULE = (203, 213, 225)
_C_BULLET = (99, 102, 241)
_C_WHITE = (255, 255, 255)


def _strip_bold(text: str) -> str:
    """Remove **bold** markers and return plain text."""
    return re.sub(r"\*\*(.*?)\*\*", r"\1", text)


def _strip_italic(text: str) -> str:
    """Remove *italic* markers and return plain text."""
    return re.sub(r"(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)", r"\1", text)


def _clean_text(text: str) -> str:
    """Remove all inline Markdown formatting."""
    text = _strip_bold(text)
    text = _strip_italic(text)
    text = re.sub(r"`(.*?)`", r"\1", text)  # inline code
    return text


def _write_rich_line(pdf: FPDF, text: str, size: float = 10, line_h: float = 5.5):
    """Write a single line that may contain **bold** segments."""
    parts = re.split(r"(\*\*.*?\*\*)", text)
    for part in parts:
        if part.startswith("**") and part.endswith("**"):
            pdf.set_font("Helvetica", "B", size)
            pdf.write(line_h, part[2:-2])
        else:
            cleaned = re.sub(r"`(.*?)`", r"\1", part)
            pdf.set_font("Helvetica", "", size)
            pdf.write(line_h, cleaned)
    pdf.ln(line_h)


def _estimate_lines(pdf: FPDF, text: str, width: float, size: float = 10) -> int:
    """Estimate how many wrapped lines *text* will need at the given font size."""
    pdf.set_font("Helvetica", "", size)
    words = text.split()
    if not words:
        return 1
    lines = 1
    current_w = 0.0
    space_w = pdf.get_string_width(" ")
    for word in words:
        word_w = pdf.get_string_width(word)
        if current_w + word_w > width and current_w > 0:
            lines += 1
            current_w = word_w + space_w
        else:
            current_w += word_w + space_w
    return lines


def _ensure_space(pdf: FPDF, needed: float):
    """Add a page break if there is not enough vertical space left."""
    if pdf.get_y() + needed > pdf.h - pdf.b_margin:
        pdf.add_page()


def markdown_to_pdf(md_text: str, doc_filename: str) -> bytes:
    """Convert Markdown study notes into a professionally styled PDF."""

    # Sanitize text for fpdf2's core fonts which don't support full unicode
    replacements = {
        '–': '-', '—': '-',
        '“': '"', '”': '"', '„': '"',
        '‘': "'", '’': "'", '‚': "'",
        '•': '-', '…': '...'
    }
    for old, new in replacements.items():
        md_text = md_text.replace(old, new)
    # Fallback for any other unsupported char (replaces with ?)
    md_text = md_text.encode('latin-1', 'replace').decode('latin-1')

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    LEFT = pdf.l_margin  # 10
    CONTENT_W = pdf.w - pdf.l_margin - pdf.r_margin  # ~190

    # ── Title block ──────────────────────────────────────────────────────
    pdf.set_fill_color(*_C_PRIMARY)
    pdf.rect(0, 0, 210, 44, "F")

    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(*_C_WHITE)
    pdf.set_y(10)
    pdf.cell(0, 12, "Lernzettel", new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(200, 200, 240)
    pdf.cell(0, 8, doc_filename, new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.set_y(48)
    pdf.set_text_color(*_C_TEXT)

    # ── Parse lines ──────────────────────────────────────────────────────
    lines = md_text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # ---- empty line → small gap ----
        if not stripped:
            pdf.ln(2)
            i += 1
            continue

        # ---- Heading 1: # ----
        if stripped.startswith("# ") and not stripped.startswith("## "):
            text = _clean_text(stripped[2:])
            _ensure_space(pdf, 18)
            pdf.ln(6)
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_text_color(*_C_PRIMARY)
            pdf.cell(0, 10, text, new_x="LMARGIN", new_y="NEXT")
            # decorative underline
            y = pdf.get_y() + 1
            pdf.set_draw_color(*_C_PRIMARY)
            pdf.set_line_width(0.7)
            pdf.line(LEFT, y, LEFT + CONTENT_W, y)
            pdf.ln(5)
            pdf.set_text_color(*_C_TEXT)
            i += 1
            continue

        # ---- Heading 2: ## ----
        if stripped.startswith("## ") and not stripped.startswith("### "):
            text = _clean_text(stripped[3:])
            _ensure_space(pdf, 16)
            pdf.ln(5)
            # accent bar
            y = pdf.get_y()
            pdf.set_fill_color(*_C_PRIMARY)
            pdf.rect(LEFT, y + 1, 3, 8, "F")
            pdf.set_x(LEFT + 6)
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(*_C_HEADING2)
            pdf.cell(0, 10, text, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            pdf.set_text_color(*_C_TEXT)
            i += 1
            continue

        # ---- Heading 3: ### ----
        if stripped.startswith("### "):
            text = _clean_text(stripped[4:])
            _ensure_space(pdf, 14)
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(*_C_HEADING3)
            pdf.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            pdf.set_text_color(*_C_TEXT)
            i += 1
            continue

        # ---- Horizontal rule ----
        if stripped in ("---", "***", "___"):
            pdf.ln(4)
            pdf.set_draw_color(*_C_RULE)
            pdf.set_line_width(0.3)
            y = pdf.get_y()
            pdf.line(LEFT, y, LEFT + CONTENT_W, y)
            pdf.ln(4)
            i += 1
            continue

        # ---- Blockquote (info / important box) ----
        if stripped.startswith("> "):
            quote_parts: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote_parts.append(lines[i].strip()[2:].strip())
                i += 1
            quote_text = " ".join(quote_parts)
            clean_quote = _clean_text(quote_text)

            # choose style: "WICHTIG" / "MERKE" → yellow, else blue
            is_important = any(
                kw in clean_quote.upper()
                for kw in ("WICHTIG", "MERKE", "ACHTUNG", "VORSICHT")
            )
            bg = _C_IMPORTANT_BG if is_important else _C_QUOTE_BG
            border_c = _C_IMPORTANT_BORDER if is_important else _C_QUOTE_BORDER

            text_w = CONTENT_W - 12
            n_lines = _estimate_lines(pdf, clean_quote, text_w, 10)
            box_h = max(n_lines * 5.5 + 10, 16)
            _ensure_space(pdf, box_h + 4)

            pdf.ln(3)
            y = pdf.get_y()
            # background
            pdf.set_fill_color(*bg)
            pdf.rect(LEFT, y, CONTENT_W, box_h, "F")
            # left accent bar
            pdf.set_fill_color(*border_c)
            pdf.rect(LEFT, y, 3.5, box_h, "F")
            # text
            pdf.set_xy(LEFT + 8, y + 4)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(55, 65, 81)
            pdf.multi_cell(text_w, 5.5, clean_quote)
            pdf.set_y(y + box_h + 3)
            pdf.set_text_color(*_C_TEXT)
            continue

        # ---- Bullet point (- or *) ----
        if stripped.startswith("- ") or stripped.startswith("* "):
            indent = 0
            # detect sub-bullet (leading spaces)
            leading_spaces = len(line) - len(line.lstrip())
            if leading_spaces >= 4:
                indent = 6

            bullet_text = stripped[2:].strip()
            clean_bt = _clean_text(bullet_text)
            text_x = LEFT + 8 + indent
            text_w = CONTENT_W - 10 - indent

            n_lines = _estimate_lines(pdf, clean_bt, text_w, 10)
            needed = n_lines * 5.5 + 2
            _ensure_space(pdf, needed)

            y_bullet = pdf.get_y() + 2
            # draw filled circle as bullet
            pdf.set_fill_color(*_C_BULLET)
            bx = LEFT + 3 + indent
            pdf.ellipse(bx, y_bullet, 1.8, 1.8, "F")
            # text
            pdf.set_xy(text_x, pdf.get_y())
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*_C_TEXT)
            _write_rich_line(pdf, bullet_text, size=10, line_h=5.5)
            pdf.ln(0.5)
            i += 1
            continue

        # ---- Numbered list (1. 2. etc.) ----
        num_match = re.match(r"^(\d+)\.\s+(.*)", stripped)
        if num_match:
            num = num_match.group(1)
            item_text = num_match.group(2).strip()
            clean_it = _clean_text(item_text)
            text_x = LEFT + 10
            text_w = CONTENT_W - 12

            n_lines = _estimate_lines(pdf, clean_it, text_w, 10)
            needed = n_lines * 5.5 + 2
            _ensure_space(pdf, needed)

            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*_C_PRIMARY)
            pdf.set_x(LEFT + 2)
            pdf.cell(7, 5.5, f"{num}.", new_x="RIGHT", new_y="TOP")
            pdf.set_text_color(*_C_TEXT)
            _write_rich_line(pdf, item_text, size=10, line_h=5.5)
            pdf.ln(0.5)
            i += 1
            continue

        # ---- Regular paragraph ----
        _ensure_space(pdf, 8)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*_C_TEXT)
        _write_rich_line(pdf, stripped, size=10, line_h=5.5)
        pdf.ln(1)
        i += 1

    # ── Footer on last page ──────────────────────────────────────────────
    pdf.ln(6)
    y = pdf.get_y()
    pdf.set_draw_color(*_C_RULE)
    pdf.set_line_width(0.3)
    pdf.line(LEFT, y, LEFT + CONTENT_W, y)
    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(*_C_TEXT_SEC)
    pdf.cell(
        0, 5,
        f"Erstellt mit StudyBuddy  |  {doc_filename}  |  {datetime.now().strftime('%d.%m.%Y')}",
        new_x="LMARGIN", new_y="NEXT", align="C",
    )

    return bytes(pdf.output())


# ---------------------------------------------------------------------------
#  Study Notes Generation – Improved Prompt
# ---------------------------------------------------------------------------

STUDY_NOTES_SYSTEM_PROMPT = (
    "Du bist ein Experte fuer didaktische Aufbereitung von Lernmaterialien. "
    "Deine Aufgabe ist es, aus dem gegebenen Vorlesungsinhalt einen hochwertigen, "
    "strukturierten Lernzettel zu erstellen, aus dem man sofort effektiv lernen kann.\n\n"
    "FORMATIERUNGSREGELN (strikt einhalten!):\n"
    "1. Nutze Markdown-Ueberschriften (## fuer Hauptthemen, ### fuer Unterthemen).\n"
    "2. Markiere **Kernbegriffe** und **Definitionen** immer fett mit **doppelten Sternchen**.\n"
    "3. Verwende Aufzaehlungspunkte (- ) fuer Eigenschaften, Merkmale und Erklaerungen. "
    "Schreibe KEINE langen Fliesstexte.\n"
    "4. Setze die wichtigsten Erkenntnisse eines Abschnitts in einen Zitatblock mit "
    "'> WICHTIG: ...' – das wird als Infobox dargestellt.\n"
    "5. Nummerierte Listen (1. 2. 3.) fuer Schritt-fuer-Schritt-Erklaerungen oder Ablaeufe.\n"
    "6. Verwende KEINE Tabellen und KEINE Code-Bloecke (```).\n"
    "7. Halte Formeln und Beispiele als normalen Text oder Aufzaehlungspunkt bei.\n"
    "8. Beende den Lernzettel mit einem Abschnitt '## Zusammenfassung' der die 5-7 "
    "wichtigsten Punkte als Aufzaehlung enthaelt.\n\n"
    "INHALTLICHE REGELN:\n"
    "- Fasse die wichtigsten Konzepte praegnant zusammen.\n"
    "- Erklaere Fachbegriffe verstaendlich (aber kompakt).\n"
    "- Behalte alle Formeln, Zahlen und konkreten Beispiele bei.\n"
    "- Gliedere den Stoff logisch und thematisch.\n"
    "- Schreibe auf Deutsch.\n"
    "- Der Lernzettel soll wie ein professionelles Handout wirken."
)


@app.post("/api/generate/notes/{doc_id}")
async def generate_notes(doc_id: str):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google Gemini ist nicht konfiguriert. "
            "Bitte GEMINI_API_KEY in der .env-Datei setzen.",
        )
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")

    doc_markdown = documents_store[doc_id]["markdown"]
    content = doc_markdown[:MAX_CONTENT_LENGTH]
    if len(doc_markdown) > MAX_CONTENT_LENGTH:
        content += "\n\n[Inhalt gekuerzt...]"

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "systemInstruction": {
                "parts": [{"text": STUDY_NOTES_SYSTEM_PROMPT}]
            },
            "contents": [{
                "parts": [{"text": "Erstelle einen didaktisch aufbereiteten Lernzettel aus diesem Vorlesungsinhalt:\n\n" + content}]
            }],
            "generationConfig": {
                "temperature": 0.5
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=60.0)
            response.raise_for_status()
            
        data = response.json()
        notes_markdown = data["candidates"][0]["content"]["parts"][0]["text"]

        pdf_bytes = markdown_to_pdf(notes_markdown, documents_store[doc_id]["filename"])
        pdf_path = os.path.join(UPLOAD_DIR, f"{doc_id}_lernzettel.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)

        documents_store[doc_id]["notes_pdf_path"] = pdf_path
        return {"notes_pdf": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generierung fehlgeschlagen: {str(e)}")


@app.get("/api/documents/{doc_id}/notes-pdf")
async def download_notes_pdf(doc_id: str):
    if doc_id not in documents_store or "notes_pdf_path" not in documents_store[doc_id]:
        raise HTTPException(status_code=404, detail="Lernzettel-PDF nicht gefunden")

    pdf_path = documents_store[doc_id]["notes_pdf_path"]
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF-Datei nicht gefunden")

    safe_name = documents_store[doc_id]["filename"].replace(" ", "_")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"Lernzettel_{safe_name}.pdf",
    )
