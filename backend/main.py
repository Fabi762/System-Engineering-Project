import os
import re
import uuid
import json
import shutil
import subprocess
import tempfile
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import httpx

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
    return all([
        AZURE_OPENAI_ENDPOINT,
        AZURE_OPENAI_API_KEY,
        AZURE_OPENAI_DEPLOYMENT,
        AZURE_OPENAI_API_VERSION,
    ])


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


# ---------------------------------------------------------------------------
#  API Endpoints
# ---------------------------------------------------------------------------

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
        if safe_filename.lower().endswith(".pdf"):
            reader = PdfReader(file_path)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n\n"
        else:
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
# @app.post("/api/generate/flashcards/{doc_id}")
# async def generate_flashcards(doc_id: str): ...


# ---------------------------------------------------------------------------
#  LaTeX PDF Generation
# ---------------------------------------------------------------------------

def markdown_to_latex_and_pdf(md_text: str, doc_filename: str) -> bytes:
    """Convert Markdown study notes to PDF via LaTeX compilation.

    Requires tectonic, pdflatex, or xelatex to be installed on the system.
    """
    safe_stem = re.sub(r"[^A-Za-z0-9_-]", "_", os.path.splitext(doc_filename)[0]) or "Lernzettel"
    tmpdir = tempfile.mkdtemp(prefix=f"sb_latex_{safe_stem}_")
    tex_path = os.path.join(tmpdir, f"{safe_stem}.tex")
    pdf_path = os.path.join(tmpdir, f"{safe_stem}.pdf")

    latex_template = r"""% Auto-generated by StudyBuddy
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{amsmath,amssymb}
\usepackage{geometry}
\usepackage{parskip}
\usepackage[dvipsnames,table]{xcolor}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[skins,breakable]{tcolorbox}
\usepackage{fancyhdr}
\usepackage[hidelinks]{hyperref}
\geometry{margin=22mm, top=28mm, bottom=28mm}

% StudyBuddy Indigo palette
\definecolor{Primary}{RGB}{79,70,229}
\definecolor{PrimaryDark}{RGB}{55,48,163}
\definecolor{TextSec}{RGB}{100,116,139}
\definecolor{QuoteBorder}{RGB}{59,130,246}
\definecolor{QuoteBG}{RGB}{239,246,255}
\definecolor{WichtigBorder}{RGB}{217,119,6}
\definecolor{WichtigBG}{RGB}{254,252,232}

% Styled section headings
\titleformat{\section}
  {\large\bfseries\color{Primary}}{}{0em}{}
  [\vspace{2pt}\textcolor{Primary}{\rule{\linewidth}{0.6pt}}\vspace{2pt}]
\titleformat{\subsection}{\normalsize\bfseries\color{PrimaryDark}}{}{0em}{}
\titleformat{\subsubsection}{\normalsize\bfseries\color{PrimaryDark}}{}{0em}{}
\titlespacing*{\section}{0pt}{14pt}{4pt}
\titlespacing*{\subsection}{0pt}{10pt}{2pt}
\titlespacing*{\subsubsection}{0pt}{8pt}{2pt}

% tcolorbox styles
\tcbset{
  notebox/.style={
    enhanced, breakable,
    colback=QuoteBG, colframe=QuoteBorder,
    left=6pt, right=6pt, top=5pt, bottom=5pt,
    boxrule=0pt, leftrule=3pt, arc=2pt,
    fontupper=\small,
  },
  wichtigbox/.style={
    enhanced, breakable,
    colback=WichtigBG, colframe=WichtigBorder,
    left=6pt, right=6pt, top=5pt, bottom=5pt,
    boxrule=0pt, leftrule=3pt, arc=2pt,
    fontupper=\small,
  }
}

% Header / Footer
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small\textcolor{TextSec}{Lernzettel}}
\fancyhead[R]{\small\textcolor{TextSec}{__DOCFILE__}}
\fancyfoot[C]{\small\textcolor{TextSec}{\thepage}}
\renewcommand{\headrulewidth}{0.3pt}
\renewcommand{\footrulewidth}{0pt}

\begin{document}

% ── Title block ──────────────────────────────────────────────────────────
\begin{tcolorbox}[
  enhanced, sharp corners,
  colback=Primary, colframe=Primary,
  boxrule=0pt, left=14pt, right=14pt, top=14pt, bottom=14pt,
]
  \centering
  {\LARGE\bfseries\color{white} Lernzettel}\\[6pt]
  {\normalsize\color{white} __DOCFILE__}\\[4pt]
  {\small\color{white} Erstellt mit StudyBuddy \textbar\ __DATE__}
\end{tcolorbox}

\vspace{8pt}

__BODY__

\end{document}
"""

    def _escape_latex(s: str) -> str:
        s = s.replace("\\", "\x00BS\x00")
        for char, repl in [
            ("%", "\\%"), ("$", "\\$"), ("_", "\\_"), ("{", "\\{"), ("}", "\\}"),
            ("#", "\\#"), ("&", "\\&"), ("^", "\\^{}"), ("~", "\\~{}"),
        ]:
            s = s.replace(char, repl)
        return s.replace("\x00BS\x00", "\\textbackslash{}")

    def _process_text(s: str) -> str:
        """Escape LaTeX special chars and convert **bold** to \\textbf{}."""
        parts = re.split(r"(\*\*.*?\*\*)", s)
        out = []
        for part in parts:
            if part.startswith("**") and part.endswith("**") and len(part) > 4:
                out.append("\\textbf{" + _escape_latex(part[2:-2]) + "}")
            else:
                out.append(_escape_latex(part))
        return "".join(out)

    def _escape_math_preserve(s: str) -> str:
        """Process text while leaving $...$ and $$...$$ math untouched."""
        parts = re.split(r"(\$\$.*?\$\$|\$[^$]+?\$)", s, flags=re.DOTALL)
        out = []
        for p in parts:
            if not p:
                continue
            if (p.startswith("$$") and p.endswith("$$")) or (p.startswith("$") and p.endswith("$")):
                out.append(p)
            else:
                out.append(_process_text(p))
        return "".join(out)

    def md_to_tex(md: str) -> str:
        out_lines: list[str] = []
        lines = md.splitlines()
        i = 0
        while i < len(lines):
            s = lines[i].strip()
            if not s:
                out_lines.append("")
                i += 1
                continue
            if s.startswith("### "):
                out_lines.append("\\subsubsection*{%s}" % _escape_math_preserve(s[4:]))
            elif s.startswith("## "):
                out_lines.append("\\section*{%s}" % _escape_math_preserve(s[3:]))
            elif s.startswith("# "):
                out_lines.append("\\section*{%s}" % _escape_math_preserve(s[2:]))
            elif s.startswith("> "):
                content = _escape_math_preserve(s[2:])
                if any(k in s.upper() for k in ("WICHTIG", "MERKE", "ACHTUNG", "VORSICHT")):
                    out_lines.append(
                        "\\begin{tcolorbox}[wichtigbox]\n%s\n\\end{tcolorbox}" % content
                    )
                else:
                    out_lines.append(
                        "\\begin{tcolorbox}[notebox]\n%s\n\\end{tcolorbox}" % content
                    )
            elif s.startswith("- ") or s.startswith("* "):
                out_lines.append("\\begin{itemize}[leftmargin=*]")
                while i < len(lines) and (
                    lines[i].strip().startswith("- ") or lines[i].strip().startswith("* ")
                ):
                    item = lines[i].strip()[2:]
                    out_lines.append("  \\item %s" % _escape_math_preserve(item))
                    i += 1
                out_lines.append("\\end{itemize}")
                continue
            else:
                m = re.match(r"^(\d+)\.\s+(.*)", s)
                if m:
                    out_lines.append("\\begin{enumerate}[leftmargin=*]")
                    while i < len(lines):
                        nm = re.match(r"^(\d+)\.\s+(.*)", lines[i].strip())
                        if not nm:
                            break
                        out_lines.append("  \\item %s" % _escape_math_preserve(nm.group(2)))
                        i += 1
                    out_lines.append("\\end{enumerate}")
                    continue
                else:
                    out_lines.append(_escape_math_preserve(s))
            i += 1
        return "\n\n".join(out_lines)

    body = md_to_tex(md_text)
    doc_escaped = _escape_latex(doc_filename)
    filled = (
        latex_template
        .replace("__DOCFILE__", doc_escaped)
        .replace("__BODY__", body)
        .replace("__DATE__", datetime.now().strftime("%d.%m.%Y"))
    )
    debug_tex = os.path.join(UPLOAD_DIR, "debug_last.tex")
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(filled)
    with open(debug_tex, "w", encoding="utf-8") as f:
        f.write(filled)

    try:
        if shutil.which("tectonic"):
            subprocess.run(["tectonic", tex_path], check=True, cwd=tmpdir, timeout=300)
        elif shutil.which("pdflatex"):
            subprocess.run(
                [
                    "pdflatex",
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "--enable-installer",  # MiKTeX: fehlende Pakete automatisch installieren
                    os.path.basename(tex_path),
                ],
                check=True, cwd=tmpdir, timeout=300,
            )
        elif shutil.which("xelatex"):
            subprocess.run(
                [
                    "xelatex",
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    os.path.basename(tex_path),
                ],
                check=True, cwd=tmpdir, timeout=300,
            )
        else:
            raise RuntimeError(
                "Kein LaTeX-Compiler gefunden (tectonic / pdflatex / xelatex). "
                "Bitte einen installieren – siehe README."
            )
    except subprocess.CalledProcessError:
        # Read LaTeX log for a useful error message before cleaning up
        log_path = os.path.join(tmpdir, f"{safe_stem}.log")
        log_hint = ""
        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8", errors="replace") as lf:
                error_lines = [l.rstrip() for l in lf if l.startswith("!") or "Fatal error" in l]
            if error_lines:
                log_hint = " | LaTeX: " + " / ".join(error_lines[:3])
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise RuntimeError(f"LaTeX-Kompilierung fehlgeschlagen{log_hint}")
    except Exception:
        shutil.rmtree(tmpdir, ignore_errors=True)
        raise

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    shutil.rmtree(tmpdir, ignore_errors=True)
    return pdf_bytes


# ---------------------------------------------------------------------------
#  Study Notes Generation
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
    "7. Schreibe mathematische Ausdruecke immer in LaTeX-Notation: $...$ fuer Inline-Formeln, "
    "$$...$$ fuer abgesetzte Formeln. Nutze \\frac, \\partial, \\mathbb, \\sum, \\int, \\pi.\n"
    "8. Beende den Lernzettel mit einem Abschnitt '## Zusammenfassung' mit den 5-7 "
    "wichtigsten Punkten als Aufzaehlung.\n\n"
    "INHALTLICHE REGELN:\n"
    "- Fasse die wichtigsten Konzepte praegnant zusammen.\n"
    "- Erklaere Fachbegriffe verstaendlich (aber kompakt).\n"
    "- Behalte alle Formeln, Zahlen und konkreten Beispiele bei.\n"
    "- Gliedere den Stoff logisch und thematisch.\n"
    "- Ignoriere organisatorische Hinweise, Semesterplan und Begruessungen.\n"
    "- Schreibe auf Deutsch.\n"
    "- Der Lernzettel soll wie ein professionelles Handout wirken."
)


@app.post("/api/generate/notes/{doc_id}")
async def generate_notes(doc_id: str):
    if not azure_openai_configured():
        raise HTTPException(
            status_code=503,
            detail=(
                "Azure OpenAI ist nicht konfiguriert. "
                "Bitte AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, "
                "AZURE_OPENAI_API_VERSION und AZURE_OPENAI_DEPLOYMENT in der .env setzen."
            ),
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
                        "Erstelle einen didaktisch aufbereiteten Lernzettel aus dem fachlich "
                        "relevanten Inhalt dieser Vorlesung. Formeln muessen in LaTeX mit "
                        "$...$ oder $$...$$ geschrieben werden.\n\n"
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

        notes_markdown = response.json()["choices"][0]["message"]["content"]
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
    return FileResponse(pdf_path, media_type="application/pdf", filename=safe_name)
