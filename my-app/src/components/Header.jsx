function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <h1 className="header-title">StudyFlow</h1>
          <p className="header-subtitle">Dein digitaler Lernbegleiter</p>
        </div>
      </div>
      <div className="header-right">
        <span className="header-badge">Dokumente · Lernzettel</span>
      </div>
    </header>
  )
}

export default Header
