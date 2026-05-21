import os
import re
import uuid
import json
import tempfile
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import httpx
from fpdf import FPDF
from matplotlib.mathtext import math_to_image
from PIL import Image

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

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

MAX_CONTENT_LENGTH = 6000

documents_store: dict = {}

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")


def azure_openai_configured() -> bool:
    return all(
        [
            AZURE_OPENAI_ENDPOINT,
            AZURE_OPENAI_API_KEY,
            AZURE_OPENAI_DEPLOYMENT,
            AZURE_OPENAI_API_VERSION,
        ]
    )


def _document_stem(filename: str) -> str:
    base = os.path.basename(filename or "")
    known_extensions = {".pdf", ".docx", ".pptx", ".xlsx", ".txt", ".md", ".html"}

    while True:
        stem, ext = os.path.splitext(base)
        if not stem or ext.lower() not in known_extensions:
            return base or "Lernzettel"
        base = stem


def _build_notes_filename(source_filename: str) -> str:
    stem = _document_stem(source_filename).replace(" ", "_")
    if stem.lower().startswith("lernzettel_"):
        return f"{stem}.pdf"
    return f"Lernzettel_{stem}.pdf"


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "ai_available": azure_openai_configured()}


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
#             detail="Azure OpenAI ist nicht konfiguriert. "
#             "Bitte AZURE_OPENAI_* in der .env-Datei setzen.",
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


def _split_math_segments(text: str) -> list[tuple[str, str]]:
    """Split a line into plain text and LaTeX math segments."""
    segments: list[tuple[str, str]] = []
    cursor = 0
    pattern = re.compile(r"\$\$(.+?)\$\$|\$(.+?)\$", re.DOTALL)

    for match in pattern.finditer(text):
        if match.start() > cursor:
            segments.append(("text", text[cursor:match.start()]))
        math_expr = match.group(1) or match.group(2) or ""
        segments.append(("math", math_expr.strip()))
        cursor = match.end()

    if cursor < len(text):
        segments.append(("text", text[cursor:]))

    return segments


def _render_math_image(math_expr: str, font_size: int = 10) -> str:
    """Render a math expression to a temporary PNG and return its path."""
    safe_name = re.sub(r"[^A-Za-z0-9]+", "_", math_expr).strip("_") or "math"
    cache_name = f"studybuddy_{safe_name[:80]}_{font_size}.png"
    cache_path = os.path.join(tempfile.gettempdir(), cache_name)

    if not os.path.exists(cache_path):
        math_to_image(math_expr, cache_path, dpi=300, format="png", color="black")

    return cache_path


def _write_segment_with_math(pdf: FPDF, text: str, size: float, line_h: float, bold: bool):
    """Write text and inline math images on one line."""
    for kind, value in _split_math_segments(text):
        if kind == "text":
            if value:
                pdf.set_font("Helvetica", "B" if bold else "", size)
                pdf.write(line_h, value)
            continue

        math_expr = value.strip()
        if not math_expr:
            continue
        if not math_expr.startswith("$"):
            math_expr = f"${math_expr}$"

        image_path = _render_math_image(math_expr, font_size=max(10, int(size) + 1))
        with Image.open(image_path) as img:
            pixel_w, pixel_h = img.size

        x = pdf.get_x()
        y = pdf.get_y() + 0.25
        draw_h = max(4.0, line_h - 0.2)
        draw_w = max(2.0, (pixel_w / pixel_h) * draw_h)
        pdf.image(image_path, x=x, y=y, h=draw_h, w=draw_w)
        pdf.set_x(x + draw_w + 1.0)


def _write_rich_line(pdf: FPDF, text: str, size: float = 10, line_h: float = 5.5):
    """Write a single line that may contain **bold** segments."""
    parts = re.split(r"(\*\*.*?\*\*)", text)
    for part in parts:
        if part.startswith("**") and part.endswith("**"):
            _write_segment_with_math(pdf, part[2:-2], size=size, line_h=line_h, bold=True)
        else:
            cleaned = re.sub(r"`(.*?)`", r"\1", part)
            _write_segment_with_math(pdf, cleaned, size=size, line_h=line_h, bold=False)
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


def markdown_to_latex_and_pdf(md_text: str, doc_filename: str) -> bytes:
    """Convert Markdown study notes into a LaTeX document, compile to PDF and
    return the PDF bytes. Requires a system LaTeX engine (pdflatex/xelatex/tectonic).
    """

    # Safe filename for temporary files
    safe_stem = re.sub(r"[^A-Za-z0-9_-]", "_", os.path.splitext(doc_filename)[0]) or "Lernzettel"
    tmpdir = tempfile.mkdtemp(prefix=f"sb_latex_{safe_stem}_")
    tex_path = os.path.join(tmpdir, f"{safe_stem}.tex")
    pdf_path = os.path.join(tmpdir, f"{safe_stem}.pdf")

    # Minimal LaTeX document skeleton with basic styling and packages
    latex_template = r"""
% Auto-generated by StudyBuddy
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{amsmath,amssymb}
\usepackage{geometry}
\usepackage{parskip}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{hyperref}
\geometry{margin=20mm}

\definecolor{Primary}{RGB}{79,70,229}
\definecolor{QuoteBG}{RGB}{239,246,255}
\definecolor{ImportantBG}{RGB}{254,252,232}

\begin{document}
\pagestyle{plain}

\begin{center}
  {\LARGE\bfseries Lernzettel}\\[6pt]
  {\small __DOCFILE__}\\[12pt]
\end{center}

__BODY__

\vfill
{\footnotesize Erstellt mit CoolSchoolTool  |  __DATE__  }
\end{document}
"""

    # Convert our Markdown-ish input into LaTeX snippet lines.
    # We rely on the prompt ensuring headings, lists, blockquotes and LaTeX math
    # are present already. We'll do a minimal conversion for those constructs.
    def md_to_tex(md: str) -> str:
        out_lines: list[str] = []
        for line in md.splitlines():
            s = line.strip()
            if not s:
                out_lines.append("")
                continue
            # Headings
            if s.startswith("### "):
                out_lines.append("\\subsubsection*{%s}" % _escape_latex(s[4:]))
                continue
            if s.startswith("## "):
                out_lines.append("\\section*{%s}" % _escape_latex(s[3:]))
                continue
            if s.startswith("# "):
                out_lines.append("\\section*{%s}" % _escape_latex(s[2:]))
                continue
            # Blockquote -> colored box (important or note)
            if s.startswith("> "):
                content = _escape_latex(s[2:])
                # determine important by keyword
                if any(k in content.upper() for k in ("WICHTIG","MERKE","ACHTUNG","VORSICHT")):
                    out_lines.append("\\noindent\\colorbox{ImportantBG}{\\parbox{0.96\\linewidth}{%s}}" % content)
                else:
                    out_lines.append("\\noindent\\colorbox{QuoteBG}{\\parbox{0.96\\linewidth}{%s}}" % content)
                continue
            # unordered list
            if s.startswith("- ") or s.startswith("* "):
                # gather list block
                items = [s[2:]]
                continue_idx = 1
                out_idx = 0
                # we will not implement multi-line list aggregation here to keep logic simple
                out_lines.append("\\begin{itemize}[leftmargin=*]")
                out_lines.append("  \\item %s" % _escape_latex(s[2:]))
                out_lines.append("\\end{itemize}")
                continue
            # numbered list
            m = re.match(r"^(\\d+)\\.\\s+(.*)", s)
            if m:
                out_lines.append("\\begin{enumerate}[leftmargin=*]")
                out_lines.append("  \\item %s" % _escape_latex(m.group(2)))
                out_lines.append("\\end{enumerate}")
                continue
            # inline math is already in $...$ or $$...$$ — leave as-is but escape underscores
            out_lines.append(_escape_latex_preserve_math(s))

        return "\n\n".join(out_lines)

    def _escape_latex(s: str) -> str:
        s = s.replace("\\","\\\\")
        s = s.replace("%","\\%")
        s = s.replace("_","\\_")
        s = s.replace("{","\\{")
        s = s.replace("}","\\}")
        s = s.replace("#","\\#")
        s = s.replace("&","\\&")
        s = s.replace("^","\\^{}")
        s = s.replace("~","\\~{}")
        return s

    def _escape_latex_preserve_math(s: str) -> str:
        # Split on math segments and escape non-math parts
        parts = re.split(r"(\$\$.*?\$\$|\$.*?\$)", s)
        out = []
        for p in parts:
            if not p:
                continue
            if p.startswith("$$") or (p.startswith("$") and p.endswith("$")):
                out.append(p)
            else:
                out.append(_escape_latex(p))
        return "".join(out)

    # Generate LaTeX body
    body = md_to_tex(md_text)

    # Write .tex file
    doc_escaped = doc_filename.replace('_', '\\_')
    filled = latex_template.replace('__DOCFILE__', doc_escaped).replace('__BODY__', body).replace('__DATE__', datetime.now().strftime("%d.%m.%Y"))
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(filled)

    # Try to compile using tectonic/tectonic CLI or pdflatex/xelatex
    compile_ok = False
    try:
        # try tectonic CLI first
        import shutil, subprocess
        if shutil.which("tectonic"):
            subprocess.run(["tectonic", tex_path], check=True, cwd=tmpdir, timeout=30)
            compile_ok = True
            pdf_path = os.path.join(tmpdir, f"{safe_stem}.pdf")
        elif shutil.which("pdflatex"):
            subprocess.run(["pdflatex", "-interaction=nonstopmode", os.path.basename(tex_path)], check=True, cwd=tmpdir, timeout=30)
            compile_ok = True
        elif shutil.which("xelatex"):
            subprocess.run(["xelatex", "-interaction=nonstopmode", os.path.basename(tex_path)], check=True, cwd=tmpdir, timeout=30)
            compile_ok = True
        else:
            raise RuntimeError("Kein LaTeX-Compiler gefunden (tectonic/pdflatex/xelatex). Bitte installieren.")
    except Exception as e:
        # Clean up and re-raise with helpful message
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise

    # Read PDF bytes
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # cleanup
    shutil.rmtree(tmpdir, ignore_errors=True)
    return pdf_bytes


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
    "7. Schreibe mathematische Ausdruecke immer in echter LaTeX-Notation und kapsle sie in $...$ "
    "oder $$...$$. Nutze moeglichst \\frac, \\partial, \\mathbb, \\sum, \\int, \\pi und Exponenten.\n"
    "8. Beende den Lernzettel mit einem Abschnitt '## Zusammenfassung' der die 5-7 "
    "wichtigsten Punkte als Aufzaehlung enthaelt.\n\n"
    "INHALTLICHE REGELN:\n"
    "- Fasse die wichtigsten Konzepte praegnant zusammen.\n"
    "- Erklaere Fachbegriffe verstaendlich (aber kompakt).\n"
    "- Behalte alle Formeln, Zahlen und konkreten Beispiele bei.\n"
    "- Gliedere den Stoff logisch und thematisch. Ignoriere vorlesungsfremde Inhalte wie Semesterplan, organisatorische Hinweise oder allgemeine Begruessungen, ausser sie sind direkt fuer das Lernziel relevant.\n"
    "- Schreibe auf Deutsch.\n"
    "- Der Lernzettel soll wie ein professionelles Handout wirken."
)


@app.post("/api/generate/notes/{doc_id}")
async def generate_notes(doc_id: str):
    if not azure_openai_configured():
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI ist nicht konfiguriert. "
            "Bitte AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, "
            "AZURE_OPENAI_API_VERSION und AZURE_OPENAI_DEPLOYMENT setzen.",
        )
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")

    doc_markdown = documents_store[doc_id]["markdown"]
    content = doc_markdown[:MAX_CONTENT_LENGTH]
    if len(doc_markdown) > MAX_CONTENT_LENGTH:
        content += "\n\n[Inhalt gekuerzt...]"

    try:
        source_filename = documents_store[doc_id]["filename"]
        notes_filename = _build_notes_filename(source_filename)
        url = (
            f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/"
            f"{AZURE_OPENAI_DEPLOYMENT}/chat/completions"
            f"?api-version={AZURE_OPENAI_API_VERSION}"
        )

        payload = {
            "messages": [
                {"role": "system", "content": STUDY_NOTES_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Erstelle einen didaktisch aufbereiteten Lernzettel nur aus dem fachlich "
                        "relevanten Inhalt dieser Vorlesung. Entferne rein organisatorische, "
                        "administrative oder vorlesungsfremde Informationen. Formeln muessen in "
                        "LaTeX mit $...$ oder $$...$$ geschrieben werden.\n\n"
                        "Vorlesungsinhalt:\n\n" + content
                    ),
                },
            ],
            "temperature": 0.5,
            "max_tokens": 2500,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={"api-key": AZURE_OPENAI_API_KEY},
                json=payload,
                timeout=60.0,
            )
            response.raise_for_status()

        data = response.json()
        notes_markdown = data["choices"][0]["message"]["content"]

        # Prefer LaTeX-based PDF generation for higher fidelity (math, boxes)
        pdf_bytes = markdown_to_latex_and_pdf(notes_markdown, source_filename)
        pdf_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{notes_filename}")
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

    safe_name = _build_notes_filename(documents_store[doc_id]["filename"])
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=safe_name,
    )
