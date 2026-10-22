export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-film-edge">
          ▲ KODAK SAFETY FILM 5063 ▲ 36 EXP ▲ SHOT ON 35mm ▲
        </div>
        <p>Engineered &amp; Developed by <span className="gradient-text">Jashraaj Nath</span></p>
        <p className="footer-copy">© {year} — Developed in Darkroom with ❤️ and fine analog craft</p>
      </div>
    </footer>
  );
}
