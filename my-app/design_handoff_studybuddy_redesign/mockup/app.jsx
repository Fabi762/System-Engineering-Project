/* global React, ReactDOM, I, Library, Lecture, Upload, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakRow */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "paper",
  "accent": "terracotta",
  "density": "regular"
} /*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = React.useState({ name: "library", lecture: null });
  const [toast, setToast] = React.useState(null);

  // Apply tweaks to root
  React.useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-theme", tweaks.theme === "dark" ? "dark" : "");
    r.setAttribute("data-accent", tweaks.accent);
    r.setAttribute("data-density", tweaks.density);
  }, [tweaks]);

  const showToast = (text, kind = "success") => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2800);
  };

  const openLecture = (l) => setView({ name: "lecture", lecture: l });
  const goLibrary = () => setView({ name: "library", lecture: null });
  const goUpload = () => setView({ name: "upload", lecture: null });

  return (
    <div className="app">
      <header className="masthead" data-screen-label="00 Masthead">
        <div className="masthead-inner">
          <div className="masthead-left">
            <a className="brand" onClick={goLibrary}>
              <span className="brand-mark">S</span>
              <span className="brand-name">StudyBuddy</span>
            </a>
            <nav className="masthead-nav">
              <button className={view.name === "library" || view.name === "lecture" ? "active" : ""}
              onClick={goLibrary}>Bibliothek</button>
              <button className={view.name === "upload" ? "active" : ""}
              onClick={goUpload}>Hochladen</button>
            </nav>
          </div>
          <div className="masthead-right">
            <button className="icon-btn"
            title={tweaks.theme === "dark" ? "Hell" : "Dunkel"}
            onClick={() => setTweak("theme", tweaks.theme === "dark" ? "paper" : "dark")}>
              {tweaks.theme === "dark" ? <I.Sun size={16} /> : <I.Moon size={16} />}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={goUpload}>
              <I.Plus size={13} stroke={2} /> Neu
            </button>
          </div>
        </div>
      </header>

      <main className="app-main" style={{ fontFamily: "Nunito" }}>
        {view.name === "library" && <Library onOpen={openLecture} onUpload={goUpload} />}
        {view.name === "lecture" && <Lecture lecture={view.lecture} onBack={goLibrary} />}
        {view.name === "upload" && <Upload onCancel={goLibrary} onDone={() => {goLibrary();showToast("Neue Vorlesung übernommen");}} />}
      </main>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks" noDeckControls={true}>
        <TweakSection label="Erscheinung">
          <TweakRadio
            label="Modus"
            value={tweaks.theme}
            options={[
            { value: "paper", label: "Paper" },
            { value: "dark", label: "Code" }]
            }
            onChange={(v) => setTweak("theme", v)} />
          
          <TweakRadio
            label="Dichte"
            value={tweaks.density}
            options={[
            { value: "compact", label: "Kompakt" },
            { value: "regular", label: "Normal" },
            { value: "comfortable", label: "Weit" }]
            }
            onChange={(v) => setTweak("density", v)} />
          
        </TweakSection>

        <TweakSection label="Akzent">
          <TweakRow label="Farbe">
            <div style={{ display: "flex", gap: 8 }}>
              {[
              { v: "terracotta", c: ["#b04a28", "#d97757"] },
              { v: "ink", c: ["#1c1b16", "#4a463c"] },
              { v: "ocre", c: ["#8a6914", "#b3902c"] },
              { v: "moss", c: ["#4a6b3a", "#6b8a55"] }].
              map((s) =>
              <button
                key={s.v}
                onClick={() => setTweak("accent", s.v)}
                title={s.v}
                style={{
                  width: 30, height: 30, borderRadius: 6,
                  background: `linear-gradient(135deg, ${s.c[0]} 50%, ${s.c[1]} 50%)`,
                  border: tweaks.accent === s.v ? "2px solid var(--twk-ink, #fff)" : "1px solid rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  outline: tweaks.accent === s.v ? "2px solid currentColor" : "none",
                  outlineOffset: 2
                }} />

              )}
            </div>
          </TweakRow>
        </TweakSection>
      </TweaksPanel>

      {toast &&
      <div className="toast-stack">
          <div className={`toast ${toast.kind}`}>
            <I.Check size={14} /> {toast.text}
          </div>
        </div>
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);