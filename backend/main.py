import os
import uuid
import json
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from docling.document_converter import DocumentConverter
from openai import AsyncAzureOpenAI
from fpdf import FPDF
import markdown as md_converter

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

converter = DocumentConverter()
documents_store: dict = {}

AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")
AZURE_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1")

ai_client = (
    AsyncAzureOpenAI(
        azure_endpoint=AZURE_ENDPOINT,
        api_key=AZURE_API_KEY,
        api_version=AZURE_API_VERSION,
    )
    if AZURE_ENDPOINT and AZURE_API_KEY
    else None
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "ai_available": ai_client is not None}


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    safe_filename = file.filename.replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    try:
        result = converter.convert(file_path)
        markdown = result.document.export_to_markdown()

        doc = {
            "id": doc_id,
            "filename": file.filename,
            "uploaded_at": datetime.now().isoformat(),
            "markdown": markdown,
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
#             "Bitte AZURE_OPENAI_ENDPOINT und AZURE_OPENAI_API_KEY in der .env-Datei setzen.",
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
#         response = await ai_client.chat.completions.create(
#             model=AZURE_DEPLOYMENT,
#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "Du bist ein Lernassistent fuer Studierende. "
#                         "Erstelle aus dem gegebenen Vorlesungsinhalt Karteikarten. "
#                         "Jede Karteikarte hat eine 'question' (praeizse Frage) und "
#                         "eine 'answer' (kompakte, verstaendliche Antwort). "
#                         "Erstelle 10-15 Karteikarten, die die wichtigsten Konzepte abdecken. "
#                         "Antworte ausschliesslich mit einem JSON-Objekt im Format: "
#                         '{"flashcards": [{"question": "...", "answer": "..."}, ...]}'
#                     ),
#                 },
#                 {
#                     "role": "user",
#                     "content": f"Erstelle Karteikarten aus diesem Vorlesungsinhalt:\n\n{content}",
#                 },
#             ],
#             response_format={"type": "json_object"},
#             temperature=0.7,
#         )
#
#         result = json.loads(response.choices[0].message.content)
#         flashcards = result.get("flashcards", [])
#         documents_store[doc_id]["flashcards"] = flashcards
#         return {"flashcards": flashcards}
#
#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="KI-Antwort konnte nicht verarbeitet werden")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"KI-Generierung fehlgeschlagen: {str(e)}")



def markdown_to_pdf(md_text: str, doc_filename: str) -> bytes:
    """Convert markdown text to a styled PDF document."""
    html_content = md_converter.markdown(md_text, extensions=["tables", "fenced_code"])

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(0, 14, "Lernzettel", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "I", 12)
    pdf.cell(0, 10, doc_filename, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(4)
    pdf.set_draw_color(79, 70, 229)
    pdf.set_line_width(0.5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(8)

    pdf.set_font("Helvetica", "", 11)
    pdf.write_html(html_content)

    return bytes(pdf.output())


@app.post("/api/generate/notes/{doc_id}")
async def generate_notes(doc_id: str):
    if not ai_client:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI ist nicht konfiguriert. "
            "Bitte AZURE_OPENAI_ENDPOINT und AZURE_OPENAI_API_KEY in der .env-Datei setzen.",
        )
    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")

    doc_markdown = documents_store[doc_id]["markdown"]
    content = doc_markdown[:MAX_CONTENT_LENGTH]
    if len(doc_markdown) > MAX_CONTENT_LENGTH:
        content += "\n\n[Inhalt gekuerzt...]"

    try:
        response = await ai_client.chat.completions.create(
            model=AZURE_DEPLOYMENT,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Du bist ein Lernassistent fuer Studierende. "
                        "Erstelle aus dem gegebenen Vorlesungsinhalt einen strukturierten "
                        "Lernzettel in Markdown-Format. Der Lernzettel soll:\n"
                        "- Die wichtigsten Konzepte zusammenfassen\n"
                        "- Definitionen klar hervorheben\n"
                        "- Formeln und Beispiele beibehalten\n"
                        "- Uebersichtlich mit Ueberschriften gegliedert sein\n"
                        "- Kompakt und stichpunktartig geschrieben sein\n"
                        "- Am Ende eine kurze Zusammenfassung enthalten"
                    ),
                },
                {
                    "role": "user",
                    "content": f"Erstelle einen Lernzettel aus diesem Vorlesungsinhalt:\n\n{content}",
                },
            ],
            temperature=0.5,
        )

        notes_markdown = response.choices[0].message.content

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
