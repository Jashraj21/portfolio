import { useState, useEffect, useRef } from 'react';

export default function Navbar({ onOpenTerminal }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [clickCount, setClickCount] = useState(0);
  const [clickHint, setClickHint] = useState('');
  const clickTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      // Determine active section
      const sections = ['home','about','skills','projects','contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    e?.preventDefault?.();
    const next = clickCount + 1;
    setClickCount(next);
    clearTimeout(clickTimer.current);

    if (next >= 3) {
      setClickHint('ACCESS GRANTED ⚡');
      setClickCount(0);
      onOpenTerminal?.('terminal');
      setTimeout(() => setClickHint(''), 2500);
    } else {
      setClickHint(`${3 - next} more tap${3 - next > 1 ? 's' : ''}...`);
      clickTimer.current = setTimeout(() => {
        setClickCount(0);
        setClickHint('');
      }, 2500);
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo-container">
        <div
          className={`logo clickable-logo ${clickCount > 0 ? 'pulsing' : ''}`}
          onClick={handleLogoClick}
          title="<JN/>"
          role="button"
          tabIndex={0}
        >
          <span className="logo-bracket">&lt;</span>JN<span className="logo-bracket">/&gt;</span>
        </div>
        {clickHint && (
          <span className="logo-click-hint">{clickHint}</span>
        )}
      </div>

      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map((l) => (
          <button
            key={l.id}
            id={`nav-${l.id}`}
            className={`nav-link ${active === l.id ? 'active' : ''}`}
            onClick={() => scrollTo(l.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <div className="nav-right-actions">
        <button
          className="hamburger"
          id="hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
