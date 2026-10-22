import { useState, useEffect, useRef, useCallback } from 'react';
import { soundFx } from './soundEffects';
import MatrixRain from './MatrixRain';
import SnakeGame from './SnakeGame';
import OilPastelStudio from './OilPastelStudio';
import './Terminal.css';

const ASCII_BANNER = `
  ██╗███╗   ██╗     ████████╗███████╗██████╗ ███╗   ███╗
  ██║████╗  ██║     ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
  ██║██╔██╗ ██║        ██║   █████╗  ██████╔╝██╔████╔██║
  ██║██║╚██╗██║        ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
████║██║ ╚████║        ██║   ███████╗██║  ██║██║ ╚═╝ ██║
╚═══╝╚═╝  ╚═══╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
`;

const INITIAL_WELCOME = [
  {
    type: 'banner',
    content: ASCII_BANNER,
  },
  {
    type: 'system',
    content: 'JASHRAAJ_OS v2.4.0 (x86_64-antigravity-darwin)',
  },
  {
    type: 'system',
    content: 'SECURITY OVERRIDE: Guest authenticated via hidden backdoor.',
  },
  {
    type: 'info',
    content: "Welcome, operative. Type 'art' to turn your selfie/photo into oil pastel art, or 'snake' to play retro arcade.",
  },
];

const AVAILABLE_COMMANDS = [
  'help',
  'art',
  'selfie',
  'oilpastel',
  'about',
  'skills',
  'projects',
  'secrets',
  'matrix',
  'snake',
  'theme',
  'sound',
  'scanlines',
  'contact',
  'sysinfo',
  'quote',
  'time',
  'sudo',
  'cat',
  'ls',
  'clear',
  'exit',
];

const THEMES = {
  default: {
    '--bg': '#080b14',
    '--bg-2': '#0d1117',
    '--accent': '#7c3aed',
    '--accent-2': '#06b6d4',
    '--gradient': 'linear-gradient(135deg, #7c3aed, #06b6d4)',
  },
  cyberpunk: {
    '--bg': '#050814',
    '--bg-2': '#0b0f24',
    '--accent': '#00f0ff',
    '--accent-2': '#ff007f',
    '--gradient': 'linear-gradient(135deg, #00f0ff, #ff007f)',
  },
  matrix: {
    '--bg': '#020d06',
    '--bg-2': '#061a0d',
    '--accent': '#10b981',
    '--accent-2': '#34d399',
    '--gradient': 'linear-gradient(135deg, #059669, #10b981)',
  },
  synthwave: {
    '--bg': '#120726',
    '--bg-2': '#1e0c3e',
    '--accent': '#f43f5e',
    '--accent-2': '#fb923c',
    '--gradient': 'linear-gradient(135deg, #f43f5e, #fb923c)',
  },
  dracula: {
    '--bg': '#1e1f29',
    '--bg-2': '#282a36',
    '--accent': '#bd93f9',
    '--accent-2': '#8be9fd',
    '--gradient': 'linear-gradient(135deg, #bd93f9, #ff79c6)',
  },
};

const QUOTES = [
  "“Any fool can write code that a computer can understand. Good programmers write code that humans can understand.” – Martin Fowler",
  "“First, solve the problem. Then, write the code.” – John Johnson",
  "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde",
  "“Simplicity is prerequisite for reliability.” – Edsger W. Dijkstra",
  "“Make it work, make it right, make it fast.” – Kent Beck",
  "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
  "“The most disastrous thing that you can ever learn is your first programming language.” – Alan Kay",
];

export default function TerminalModal({ isOpen, onClose, initialMode = 'terminal' }) {
  const sanitizeMode = (m) => (['terminal', 'matrix', 'snake', 'art'].includes(m) ? m : 'terminal');
  const [history, setHistory] = useState(INITIAL_WELCOME);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [activeMode, setActiveMode] = useState(() => sanitizeMode(initialMode));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanlines, setScanlines] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync mode when modal opens without cascading effect
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveMode(sanitizeMode(initialMode));
    }
  }

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto focus input when opened or mode changed
  useEffect(() => {
    if (isOpen && activeMode === 'terminal') {
      setTimeout(() => inputRef.current?.focus(), 100);
      soundFx.playSuccess();
    }
  }, [isOpen, activeMode]);

  // Auto scroll to bottom
  useEffect(() => {
    if (activeMode === 'terminal') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeMode]);

  // Apply themes to document root
  const applyTheme = useCallback((themeName) => {
    const theme = THEMES[themeName];
    if (!theme) return false;
    const root = document.documentElement;
    Object.entries(theme).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    setCurrentTheme(themeName);
    return true;
  }, []);

  const handleSoundToggle = () => {
    const next = soundFx.toggle();
    setSoundEnabled(next);
  };

  const handleCommand = (rawCmd) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    soundFx.playKey();

    // Append user input line
    const userLine = {
      type: 'user',
      content: `guest@jashraaj-sys:~$ ${trimmed}`,
    };

    // Update command history buffer
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryPointer(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let responseOutputs = [];

    switch (cmd) {
      case 'help':
      case '?':
      case 'commands':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-help-block">
                <p className="terminal-help-intro">⚡ SYSTEM DIRECTORY & COMMAND INTERFACE:</p>
                <div className="terminal-help-grid">
                  <div className="help-category">
                    <span className="cat-title">🚀 NAVIGATION & BIO</span>
                    <ul>
                      <li><span className="cmd-name" onClick={() => executeQuick('about')}>about</span> - Developer profile dossier</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('skills')}>skills</span> - Technical matrix & proficiencies</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('projects')}>projects</span> - Highlighted software projects</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('contact')}>contact</span> - Direct encrypted channels</li>
                    </ul>
                  </div>
                  <div className="help-category">
                    <span className="cat-title">🎮 INTERACTIVE & FX</span>
                    <ul>
                      <li><span className="cmd-name" onClick={() => executeQuick('art')}>art / selfie</span> - Transform selfie or photo into Oil Pastel art</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('matrix')}>matrix</span> - Initiate green Katakana rain</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('snake')}>snake</span> - Play retro 8-bit cyber snake</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('theme')}>theme [name]</span> - cyberpunk, matrix, synthwave...</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('sound')}>sound</span> - Toggle Web Audio synthesizer</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('scanlines')}>scanlines</span> - Toggle CRT retro overlay</li>
                    </ul>
                  </div>
                  <div className="help-category">
                    <span className="cat-title">🔒 CLASSIFIED & SYSTEM</span>
                    <ul>
                      <li><span className="cmd-name" onClick={() => executeQuick('secrets')}>secrets</span> - Top secret vault & achievement</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('sysinfo')}>sysinfo</span> - Core host diagnostics</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('cat secret.txt')}>cat [file]</span> - Read virtual filesystem</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('ls')}>ls</span> - List directory permissions</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('quote')}>quote</span> - Developer philosophy</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('clear')}>clear</span> - Wipe console screen</li>
                      <li><span className="cmd-name" onClick={() => executeQuick('exit')}>exit</span> - Terminate session</li>
                    </ul>
                  </div>
                </div>
              </div>
            ),
          },
        ];
        break;

      case 'about':
      case 'bio':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-card">
                <h4 className="card-title">OPERATIVE: Jashraaj Nath</h4>
                <p>Role: Full-Stack Engineer & Interactive System Builder</p>
                <p>Philosophy: Building elegant, lightning-fast interfaces on robust scalable architectures.</p>
                <p>Location: Earth (Broadcasting via High-Speed Fiber)</p>
                <p>Status: Available for contracts, high-impact teams & visionary projects.</p>
              </div>
            ),
          },
        ];
        break;

      case 'skills':
      case 'tech':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-skills-matrix">
                <p className="matrix-title">CORE PROFICIENCY MATRIX:</p>
                <div className="skills-meter-group">
                  <div className="meter-row">
                    <span className="meter-label">Frontend (React / Next.js / Tailwind)</span>
                    <span className="meter-bar">[█████████░] 90%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">TypeScript & JavaScript (ES6+)</span>
                    <span className="meter-bar">[█████████░] 90%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">Mobile App (React Native / Flutter / Expo / Android)</span>
                    <span className="meter-bar">[█████████░] 86%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">Backend (Node.js / Express / APIs)</span>
                    <span className="meter-bar">[████████░░] 85%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">Python & FastAPI</span>
                    <span className="meter-bar">[████████░░] 82%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">C++ & Algorithms</span>
                    <span className="meter-bar">[████████░░] 80%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">Databases (PostgreSQL / MySQL / Mongo)</span>
                    <span className="meter-bar">[████████░░] 84%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">DevOps & Linux (Docker / Git / CI)</span>
                    <span className="meter-bar">[█████████░] 88%</span>
                  </div>
                  <div className="meter-row">
                    <span className="meter-label">Design & Media (Figma / Procreate / Illustrator)</span>
                    <span className="meter-bar">[████████░░] 85%</span>
                  </div>
                </div>
              </div>
            ),
          },
        ];
        break;

      case 'projects':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-projects-list">
                <p className="matrix-title">FEATURED DEPLOYMENTS:</p>
                <div className="terminal-project-item">
                  <span className="proj-tag">01</span>
                  <strong>Personal Portfolio & Admin Engine</strong>
                  <p>Full-stack portfolio with JWT-authenticated admin dashboard, live metrics & analytics.</p>
                </div>
                <div className="terminal-project-item">
                  <span className="proj-tag">02</span>
                  <strong>Cloud Asset Sync & Management System</strong>
                  <p>Real-time distributed repository scanner and automated asset pipeline.</p>
                </div>
                <div className="terminal-project-item">
                  <span className="proj-tag">03</span>
                  <strong>Cyberpunk Terminal Easter Egg</strong>
                  <p>You're currently running this right now. Interactive console with audio synth & canvas games.</p>
                </div>
              </div>
            ),
          },
        ];
        break;

      case 'secrets':
      case 'vault':
        // Unlock achievement
        localStorage.setItem('jashraaj_secret_vault_unlocked', 'true');
        soundFx.playSuccess();
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-vault">
                <div className="vault-badge">
                  🏆 ACHIEVEMENT UNLOCKED: [MATRIX_DIVER]
                </div>
                <h4 className="vault-title">TOP SECRET DEVELOPER VAULT [LEVEL-4]</h4>
                <p className="vault-note">
                  "Most visitors just scroll and click standard buttons. You took the hacker path.
                  Here are the raw behind-the-scenes thoughts & laboratory experiments."
                </p>
                <div className="vault-grid">
                  <div className="vault-item">
                    <span className="vault-item-title">🧪 Experimental Labs</span>
                    <ul>
                      <li>Project <code>NeuroFlow</code>: WebAudio neural visualizer</li>
                      <li>Project <code>ZeroSync</code>: P2P encrypted file tunnel</li>
                      <li>Antigravity Agentic Workflows</li>
                    </ul>
                  </div>
                  <div className="vault-item">
                    <span className="vault-item-title">☕ Fuel & Rituals</span>
                    <ul>
                      <li>Caffeine metric: Double shot espresso at 11 PM</li>
                      <li>Editor theme: Dark modern synthwave / tokyo night</li>
                      <li>Favorite keyboard switch: Creamy linear 45g</li>
                    </ul>
                  </div>
                </div>
                <p className="vault-hint">Tip: Check the admin login portal at <code>/admin</code></p>
              </div>
            ),
          },
        ];
        break;

      case 'art':
      case 'selfie':
      case 'oilpastel':
      case 'pastel':
        setActiveMode('art');
        return;

      case 'matrix':
        setActiveMode('matrix');
        return;

      case 'snake':
        setActiveMode('snake');
        return;

      case 'theme':
        if (!args[0]) {
          responseOutputs = [
            {
              type: 'info',
              content: `Current theme: '${currentTheme}'. Available: default, cyberpunk, matrix, synthwave, dracula.`,
            },
            {
              type: 'custom',
              render: () => (
                <div className="theme-chips-row">
                  {Object.keys(THEMES).map((t) => (
                    <button
                      key={t}
                      className={`theme-chip-btn ${currentTheme === t ? 'active' : ''}`}
                      onClick={() => handleThemeChange(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ),
            },
          ];
        } else {
          const chosen = args[0].toLowerCase();
          if (THEMES[chosen]) {
            applyTheme(chosen);
            soundFx.playSuccess();
            responseOutputs = [{ type: 'success', content: `Theme changed to '${chosen}' successfully!` }];
          } else {
            soundFx.playError();
            responseOutputs = [
              {
                type: 'error',
                content: `Theme '${chosen}' not found. Choose from: default, cyberpunk, matrix, synthwave, dracula.`,
              },
            ];
          }
        }
        break;

      case 'sound':
      case 'audio': {
        const newState = soundFx.toggle();
        setSoundEnabled(newState);
        responseOutputs = [
          {
            type: 'info',
            content: `Synthesizer audio is now ${newState ? 'ENABLED 🔊' : 'MUTED 🔇'}.`,
          },
        ];
        break;
      }

      case 'scanlines':
        setScanlines((prev) => !prev);
        responseOutputs = [
          {
            type: 'info',
            content: `CRT scanline overlay ${!scanlines ? 'ACTIVATED' : 'DEACTIVATED'}.`,
          },
        ];
        break;

      case 'contact':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-contact-box">
                <p>TRANSMISSION FREQUENCIES:</p>
                <div className="contact-links">
                  <a href="mailto:jashraajnath@gmail.com" className="terminal-link">
                    📧 Email: jashraajnath@gmail.com
                  </a>
                  <a href="https://github.com/Jashraj21" target="_blank" rel="noreferrer" className="terminal-link">
                    🐙 GitHub: github.com/Jashraj21
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="terminal-link">
                    💼 LinkedIn: Jashraaj Nath
                  </a>
                </div>
              </div>
            ),
          },
        ];
        break;

      case 'sysinfo':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-sysinfo">
                <div><span>HOST:</span> jashraaj-station-v2.local</div>
                <div><span>KERNEL:</span> Darwin 24.2.0 (ARM64)</div>
                <div><span>UPTIME:</span> 99.98% uninterrupted creative flow</div>
                <div><span>CPU:</span> 8 Cores (Hyper-threaded Logic)</div>
                <div><span>MEMORY:</span> 64 GB Espresso Caffeinated RAM</div>
                <div><span>SHELL:</span> /bin/zsh (Interactive Cyber Terminal)</div>
              </div>
            ),
          },
        ];
        break;

      case 'quote': {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        responseOutputs = [{ type: 'info', content: randomQuote }];
        break;
      }

      case 'time':
      case 'date':
        responseOutputs = [
          {
            type: 'info',
            content: `System Time: ${new Date().toLocaleString()} [UTC ${-new Date().getTimezoneOffset() / 60 >= 0 ? '+' : ''}${-new Date().getTimezoneOffset() / 60}]`,
          },
        ];
        break;

      case 'whoami':
        responseOutputs = [
          {
            type: 'info',
            content: 'guest@jashraaj-sys (Privileges: Level-4 Easter Egg Explorer)',
          },
        ];
        break;

      case 'sudo':
        soundFx.playError();
        responseOutputs = [
          {
            type: 'error',
            content: `Permission denied: operative 'guest' is not in the sudoers file. Incident logged and dispatched to Jashraaj.`,
          },
        ];
        break;

      case 'ls':
        responseOutputs = [
          {
            type: 'custom',
            render: () => (
              <div className="terminal-ls-grid">
                <span className="file-dir">drwx------ secret_vault/</span>
                <span className="file-doc">-rw-r--r-- about.txt</span>
                <span className="file-doc">-rw-r--r-- skills.json</span>
                <span className="file-doc">-rw-r--r-- projects.md</span>
                <span className="file-secret">-rw------- secret.txt</span>
                <span className="file-exe">-rwxr-xr-x snake.exe*</span>
                <span className="file-exe">-rwxr-xr-x matrix.sh*</span>
              </div>
            ),
          },
        ];
        break;

      case 'cat': {
        const file = args[0];
        if (!file) {
          responseOutputs = [{ type: 'error', content: "Usage: cat <filename> (e.g. 'cat secret.txt')" }];
        } else if (file === 'secret.txt' || file === 'secrets.txt') {
          responseOutputs = [
            {
              type: 'success',
              content: "CONFIDENTIAL MEMO: 'The real magic happens when technology meets obsessive attention to detail.' Also: type 'snake' for a good time.",
            },
          ];
        } else if (file === 'about.txt') {
          responseOutputs = [
            {
              type: 'info',
              content: "Jashraaj Nath — Developer, engineer, coffee consumer, and builder of immersive digital experiences.",
            },
          ];
        } else if (file === 'skills.json') {
          responseOutputs = [
            {
              type: 'info',
              content: JSON.stringify({ frontend: ['React', 'Next', 'Vite', 'CSS3'], mobile: ['React Native', 'Flutter', 'Expo', 'Android SDK'], backend: ['Node', 'Express', 'Python', 'FastAPI'], database: ['MySQL', 'PostgreSQL', 'MongoDB'] }, null, 2),
            },
          ];
        } else if (file === 'projects.md') {
          responseOutputs = [
            {
              type: 'info',
              content: "# Projects: Portfolio CMS, Cloud Asset Sync, Cyberpunk Terminal Console.",
            },
          ];
        } else {
          soundFx.playError();
          responseOutputs = [{ type: 'error', content: `cat: ${file}: No such file or directory` }];
        }
        break;
      }

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
      case 'quit':
        onClose();
        return;

      default:
        soundFx.playError();
        responseOutputs = [
          {
            type: 'error',
            content: `Command not recognized: '${cmd}'. Type 'help' to view available system instructions.`,
          },
        ];
        break;
    }

    setHistory((prev) => [...prev, userLine, ...responseOutputs]);
    setInputVal('');
  };

  const executeQuick = (cmd) => {
    handleCommand(cmd);
  };

  const handleThemeChange = (t) => {
    applyTheme(t);
    soundFx.playSuccess();
    setHistory((prev) => [
      ...prev,
      { type: 'user', content: `guest@jashraaj-sys:~$ theme ${t}` },
      { type: 'success', content: `Theme updated to '${t}'` },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextPtr = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPtr);
      setInputVal(commandHistory[nextPtr]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPtr = historyPointer + 1;
      if (nextPtr >= commandHistory.length) {
        setHistoryPointer(-1);
        setInputVal('');
      } else {
        setHistoryPointer(nextPtr);
        setInputVal(commandHistory[nextPtr]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = AVAILABLE_COMMANDS.find((c) => c.startsWith(inputVal.trim().toLowerCase()));
      if (match) {
        setInputVal(match);
      }
    } else if (e.key === 'Escape') {
      if (activeMode !== 'terminal') {
        setActiveMode('terminal');
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`terminal-modal-backdrop ${scanlines ? 'has-scanlines' : ''}`}>
      <div className={`terminal-window ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* Window Chrome Header */}
        <div className="terminal-header">
          <div className="terminal-controls">
            <button className="control-btn close" onClick={onClose} title="Close (Esc)" />
            <button
              className="control-btn minimize"
              onClick={() => setHistory([])}
              title="Clear Terminal"
            />
            <button
              className="control-btn maximize"
              onClick={() => setIsFullscreen((f) => !f)}
              title="Toggle Fullscreen"
            />
          </div>

          <div className="terminal-title">
            <span className="terminal-status-dot" />
            <span className="mono">root@jashraaj-sys:~# /bin/bash</span>
          </div>

          <div className="terminal-actions">
            <button
              className={`terminal-action-btn ${soundEnabled ? 'active' : ''}`}
              onClick={handleSoundToggle}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {soundEnabled ? '🔊 SFX' : '🔇 Muted'}
            </button>
            <button
              className={`terminal-action-btn ${scanlines ? 'active' : ''}`}
              onClick={() => setScanlines((s) => !s)}
              title="Toggle CRT Scanline Overlay"
            >
              CRT
            </button>
            <button
              className="terminal-action-btn exit-btn"
              onClick={onClose}
              title="Close Terminal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Launch Action Pills */}
        <div className="terminal-quick-pills">
          <span className="pills-label">QUICK LAUNCH:</span>
          <button className="quick-pill" onClick={() => executeQuick('help')}>help</button>
          <button className="quick-pill highlight" onClick={() => executeQuick('art')}>🎨 oil pastel</button>
          <button className="quick-pill highlight" onClick={() => executeQuick('snake')}>🎮 snake</button>
          <button className="quick-pill highlight" onClick={() => executeQuick('matrix')}>⚡ matrix</button>
          <button className="quick-pill" onClick={() => executeQuick('skills')}>skills</button>
          <button className="quick-pill" onClick={() => executeQuick('projects')}>projects</button>
          <button className="quick-pill secret" onClick={() => executeQuick('secrets')}>🔒 secrets</button>
          <button className="quick-pill" onClick={() => executeQuick('theme')}>theme</button>
          <button className="quick-pill" onClick={() => executeQuick('clear')}>clear</button>
        </div>

        {/* Content Area */}
        <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {activeMode === 'art' && (
            <OilPastelStudio onClose={() => setActiveMode('terminal')} />
          )}

          {activeMode === 'matrix' && (
            <MatrixRain onClose={() => setActiveMode('terminal')} />
          )}

          {activeMode === 'snake' && (
            <SnakeGame onClose={() => setActiveMode('terminal')} />
          )}

          {activeMode !== 'art' && activeMode !== 'matrix' && activeMode !== 'snake' && (
            <div className="terminal-output-stream">
              {history.map((item, idx) => (
                <div key={idx} className={`terminal-line line-${item.type}`}>
                  {item.type === 'banner' && (
                    <pre className="ascii-banner">{item.content}</pre>
                  )}
                  {item.type === 'custom' && item.render && item.render()}
                  {item.type !== 'banner' && item.type !== 'custom' && (
                    <p className="terminal-text">{item.content}</p>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />

              {/* Command Input Prompt */}
              <div className="terminal-input-row">
                <span className="terminal-prompt">guest@jashraaj-sys:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  className="terminal-input"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  spellCheck="false"
                  autoComplete="off"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="terminal-footer-bar">
          <span className="footer-tip">💡 TIP: Press Tab to autocomplete commands • ↑/↓ for history • Esc to exit</span>
          <span className="footer-theme">THEME: {currentTheme.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
