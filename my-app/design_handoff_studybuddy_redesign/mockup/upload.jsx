/* global React, I */

function Upload({ onCancel, onDone }) {
  const [stage, setStage] = React.useState("idle");
  const [filename, setFilename] = React.useState("");
  const [dragging, setDragging] = React.useState(false);

  const start = (name) => {
    setFilename(name);
    setStage("uploading");
    setTimeout(() => setStage("parsing"), 1100);
    setTimeout(() => setStage("done"), 2600);
    setTimeout(() => onDone?.(), 3400);
  };

  return (
    <div className="fade-in" data-screen-label="03 Upload">
      <header className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Neue Vorlesung</div>
          <h1 className="page-title">Folien hochladen</h1>
          <p className="page-sub">
            PDF, PPTX oder DOCX hochladen — StudyBuddy extrahiert den Inhalt
            und bereitet Lernzettel und Karteikarten vor.
          </p>
        </div>
        <div className="page-head-right">
          <button className="btn btn-ghost" onClick={onCancel}>
            <I.X size={14}/> Abbrechen
          </button>
        </div>
      </header>

      <div
        className={`upload-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) start(f.name);
        }}
        onClick={() => { if (stage === "idle") start("Vorlesung_05_Transaktionen.pdf"); }}
      >
        {stage === "idle" && (
          <>
            <div className="upload-icon">
              <I.Upload size={20} stroke={1.6}/>
            </div>
            <div className="upload-h">Folien hier ablegen</div>
            <div className="upload-sub">
              oder <span className="upload-link">eine Datei auswählen</span>
            </div>
            <div className="upload-formats">
              {["PDF","PPTX","DOCX","XLSX","HTML","MD","PNG"].map(f =>
                <span key={f}>{f}</span>)}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
              max. 50 MB
            </div>
          </>
        )}
        {(stage === "uploading" || stage === "parsing") && (
          <div className="upload-progress">
            <div className="spinner"/>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
                {filename}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                {stage === "uploading" ? "wird übertragen…" : "wird analysiert…"}
              </div>
            </div>
          </div>
        )}
        {stage === "done" && (
          <div className="upload-progress">
            <div style={{
              width: 44, height: 44, border: "1.5px solid var(--success)",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--success)"
            }}>
              <I.Check size={22} stroke={2}/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, textAlign: "center" }}>Bereit zum Lernen</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, textAlign: "center" }}>
                47 Seiten · in Bibliothek übernommen
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.Upload = Upload;
