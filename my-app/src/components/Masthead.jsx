import { I } from './icons'

function Masthead({ view, theme, onGoLibrary, onGoUpload, onToggleTheme }) {
  const isLibraryActive = view === 'library' || view === 'lecture'

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="masthead-left">
          <a className="brand" onClick={onGoLibrary}>
            <span className="brand-mark">S</span>
            <span className="brand-name">CoolSchoolTool</span>
          </a>
          <nav className="masthead-nav">
            <button
              className={isLibraryActive ? 'active' : ''}
              onClick={onGoLibrary}
            >
              Bibliothek
            </button>
            <button
              className={view === 'upload' ? 'active' : ''}
              onClick={onGoUpload}
            >
              Hochladen
            </button>
          </nav>
        </div>

        <div className="masthead-right">
          <button
            className="icon-btn"
            title={theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <I.Sun size={16} /> : <I.Moon size={16} />}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onGoUpload}>
            <I.Plus size={13} stroke={2} /> Neu
          </button>
        </div>
      </div>
    </header>
  )
}

export default Masthead
