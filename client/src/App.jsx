import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CursorGlow from './components/CursorGlow';
import TerminalModal from './components/TerminalModal';
import Admin from './pages/Admin';
import './index.css';

function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalMode, setTerminalMode] = useState('terminal');

  const handleOpenTerminal = (mode = 'terminal') => {
    setTerminalMode(mode);
    setTerminalOpen(true);
  };

  useEffect(() => {
    let keyBuffer = '';
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      // 1. Ctrl+K or Cmd+K shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenTerminal('terminal');
        return;
      }

      // 2. Backtick (`) or Tilde (~) shortcut (ignore if user is typing in form)
      if (!isInputFocused && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        handleOpenTerminal('terminal');
        return;
      }

      // 3. Konami Code sequence
      if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          handleOpenTerminal('terminal');
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }

      // 4. Typing the words "secret" or "art" or "pastel" anywhere on page
      if (!isInputFocused && e.key.length === 1) {
        keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-8);
        if (keyBuffer.includes('secret')) {
          handleOpenTerminal('terminal');
          keyBuffer = '';
        } else if (keyBuffer.includes('pastel') || keyBuffer.endsWith('art')) {
          handleOpenTerminal('art');
          keyBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin — no navbar/footer */}
        <Route path="/admin" element={<Admin />} />

        {/* Portfolio */}
        <Route path="/*" element={
          <>
            <CursorGlow />
            <Navbar onOpenTerminal={(mode) => handleOpenTerminal(mode || 'terminal')} />
            <main>
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Contact />
            </main>
            <Footer onOpenTerminal={(mode) => handleOpenTerminal(mode || 'terminal')} />
            <TerminalModal
              isOpen={terminalOpen}
              onClose={() => setTerminalOpen(false)}
              initialMode={terminalMode}
            />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
