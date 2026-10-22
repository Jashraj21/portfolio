import { useState } from 'react';
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

  const handleOpenTerminal = (mode) => {
    const validModes = ['terminal', 'art', 'matrix', 'snake'];
    const cleanMode = typeof mode === 'string' && validModes.includes(mode) ? mode : 'terminal';
    setTerminalMode(cleanMode);
    setTerminalOpen(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin — no navbar/footer */}
        <Route path="/admin" element={<Admin />} />

        {/* Portfolio */}
        <Route path="/*" element={
          <>
            <CursorGlow />
            <Navbar onOpenTerminal={(mode) => handleOpenTerminal(mode)} />
            <main>
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Contact />
            </main>
            <Footer />

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
