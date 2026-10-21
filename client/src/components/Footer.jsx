export default function Footer({ onOpenTerminal }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>Designed &amp; Built by <span className="gradient-text">Jashraaj Nath</span></p>
        <p className="footer-copy">© {year} — Made with ❤️ and lots of ☕</p>
        <div className="footer-terminal-row">
          <button
            className="footer-terminal-chip"
            onClick={() => onOpenTerminal('terminal')}
            title="Launch Cyber Terminal (Shortcut: Ctrl+K or ~)"
          >
            <span className="terminal-chip-icon">⚡</span>
            <span>sys://terminal</span>
            <kbd className="terminal-chip-kbd">Ctrl+K</kbd>
          </button>
          <button
            className="footer-terminal-chip highlight-art"
            onClick={() => onOpenTerminal('art')}
            title="Turn any selfie or photo into Oil Pastel art"
          >
            <span className="terminal-chip-icon">🎨</span>
            <span>sys://oil-pastel</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
