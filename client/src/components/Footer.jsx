export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>Designed &amp; Built by <span className="gradient-text">Jashraaj Nath</span></p>
        <p className="footer-copy">© {year} — Made with ❤️ and lots of ☕</p>
      </div>
    </footer>
  );
}
