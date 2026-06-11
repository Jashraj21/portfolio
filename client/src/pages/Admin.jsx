import { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emptyProject = { title: '', description: '', tech_stack: '', github_url: '', live_url: '', emoji: '🚀', featured: false };
const defaultSettings = { github: '', linkedin: '', twitter: '', instagram: '', facebook: '', email: '', phone: '', location: '' };

// Language → emoji mapping
const LANG_EMOJI = {
  JavaScript: '🟨', TypeScript: '🔷', Python: '🐍', 'C++': '⚙️', C: '🔩',
  Java: '☕', Rust: '🦀', Go: '🐹', Ruby: '💎', PHP: '🐘',
  HTML: '🌐', CSS: '🎨', Shell: '🐚', Kotlin: '🤖', Swift: '🍎',
};

export default function Admin() {
  const [tab, setTab] = useState('messages');

  // ── Messages ──
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);

  // ── Settings ──
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ── Projects ──
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [showForm, setShowForm] = useState(false);

  // ── GitHub Import ──
  const [ghRepos, setGhRepos] = useState([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState('');
  const [ghSelected, setGhSelected] = useState({}); // { repoName: editedFields }
  const [ghImporting, setGhImporting] = useState(false);
  const [ghDone, setGhDone] = useState('');
  const [ghUsername, setGhUsername] = useState('Jashraj21');

  useEffect(() => { fetchMessages(); fetchProjects(); fetchSettings(); }, []);

  const fetchMessages = () =>
    axios.get(`${API}/contact`).then((r) => setMessages(r.data.contacts || []));

  const fetchSettings = () =>
    axios.get(`${API}/settings`).then((r) => { if (r.data.settings) setSettings(r.data.settings); });

  const saveSettings = async () => {
    await axios.put(`${API}/settings`, settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const fetchProjects = () =>
    axios.get(`${API}/projects`).then((r) => setProjects(r.data.projects || []));

  const deleteMessage = async (id) => {
    await axios.delete(`${API}/contact/${id}`);
    setMessages((m) => m.filter((msg) => msg.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const markRead = async (id) => {
    await axios.patch(`${API}/contact/${id}/read`);
    setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, read: true } : msg));
    setSelectedMsg((s) => s?.id === id ? { ...s, read: true } : s);
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    await axios.delete(`${API}/projects/${id}`);
    fetchProjects();
  };

  const openEdit = (project) => {
    setEditingProject(project.id);
    setProjectForm({ ...project });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingProject(null);
    setProjectForm(emptyProject);
    setShowForm(true);
  };

  const saveProject = async () => {
    if (editingProject) {
      await axios.put(`${API}/projects/${editingProject}`, projectForm);
    } else {
      await axios.post(`${API}/projects`, projectForm);
    }
    setShowForm(false);
    fetchProjects();
  };

  // ── GitHub Import helpers ──
  const fetchGhRepos = async () => {
    setGhLoading(true);
    setGhError('');
    setGhRepos([]);
    setGhSelected({});
    setGhDone('');
    try {
      const r = await axios.get(`${API}/github/repos?username=${ghUsername}`);
      setGhRepos(r.data.repos || []);
    } catch {
      setGhError('Failed to fetch repos. Check the username or try again.');
    } finally {
      setGhLoading(false);
    }
  };

  const toggleRepo = (repo) => {
    setGhSelected((prev) => {
      if (prev[repo.name]) {
        const next = { ...prev };
        delete next[repo.name];
        return next;
      }
      return {
        ...prev,
        [repo.name]: {
          title: repo.name.replace(/-/g, ' '),
          description: repo.description || '',
          tech_stack: repo.language || '',
          github_url: repo.html_url,
          live_url: repo.homepage || '',
          emoji: LANG_EMOJI[repo.language] || '🚀',
          featured: false,
        },
      };
    });
  };

  const updateSelected = (name, field, value) => {
    setGhSelected((prev) => ({
      ...prev,
      [name]: { ...prev[name], [field]: value },
    }));
  };

  const importSelected = async () => {
    const toImport = Object.values(ghSelected);
    if (toImport.length === 0) return;
    setGhImporting(true);
    try {
      const r = await axios.post(`${API}/github/import`, { projects: toImport });
      setGhDone(`✅ Imported ${r.data.imported} project${r.data.imported !== 1 ? 's' : ''}!`);
      setGhSelected({});
      fetchProjects();
    } catch {
      setGhError('Import failed. Please try again.');
    } finally {
      setGhImporting(false);
    }
  };

  const unread = messages.filter((m) => !m.read).length;
  const selectedCount = Object.keys(ghSelected).length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-bracket">&lt;</span>Admin<span className="logo-bracket">/&gt;</span>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Messages
            {unread > 0 && <span className="badge">{unread}</span>}
          </button>
          <button className={`admin-nav-btn ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Projects
          </button>
          <button className={`admin-nav-btn ${tab === 'github' ? 'active' : ''}`} onClick={() => setTab('github')}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub Import
          </button>
          <button className={`admin-nav-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
            Socials
          </button>
        </nav>
        <a href="/" className="admin-visit-btn">← Visit Portfolio</a>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* ── MESSAGES TAB ── */}
        {tab === 'messages' && (
          <div className="admin-content">
            <div className="admin-header">
              <h1>Messages <span className="gradient-text">Inbox</span></h1>
              <p className="admin-sub">{messages.length} total · {unread} unread</p>
            </div>
            <div className="messages-layout">
              {/* List */}
              <div className="messages-list">
                {messages.length === 0 && <p className="empty-state">No messages yet 📭</p>}
                {[...messages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-card ${selectedMsg?.id === msg.id ? 'selected' : ''} ${!msg.read ? 'unread' : ''}`}
                    onClick={() => { setSelectedMsg(msg); markRead(msg.id); }}
                  >
                    <div className="message-card-top">
                      <span className="message-sender">{msg.name}</span>
                      <span className="message-date">{new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="message-subject">{msg.subject || '(no subject)'}</p>
                    <p className="message-preview">{msg.message.substring(0, 60)}…</p>
                    {!msg.read && <span className="unread-dot" />}
                  </div>
                ))}
              </div>
              {/* Detail */}
              <div className="message-detail">
                {!selectedMsg ? (
                  <div className="detail-empty">
                    <span>👆</span>
                    <p>Select a message to read it</p>
                  </div>
                ) : (
                  <>
                    <div className="detail-header">
                      <div>
                        <h2>{selectedMsg.subject || '(no subject)'}</h2>
                        <p className="detail-meta">
                          From <strong>{selectedMsg.name}</strong> ·
                          <a href={`mailto:${selectedMsg.email}`}> {selectedMsg.email}</a> ·
                          {new Date(selectedMsg.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="detail-actions">
                        <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`} className="btn btn-primary">Reply ↗</a>
                        <button className="btn-delete" onClick={() => deleteMessage(selectedMsg.id)}>Delete</button>
                      </div>
                    </div>
                    <div className="detail-body">{selectedMsg.message}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PROJECTS TAB ── */}
        {tab === 'projects' && (
          <div className="admin-content">
            <div className="admin-header">
              <div>
                <h1>Manage <span className="gradient-text">Projects</span></h1>
                <p className="admin-sub">{projects.length} projects</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost" onClick={() => setTab('github')}>⬇ Import from GitHub</button>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Project</button>
              </div>
            </div>

            {/* Project Form Modal */}
            {showForm && (
              <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                <div className="modal">
                  <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Title</label>
                      <input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Project name" />
                    </div>
                    <div className="form-group">
                      <label>Emoji</label>
                      <input value={projectForm.emoji} onChange={(e) => setProjectForm({ ...projectForm, emoji: e.target.value })} placeholder="🚀" />
                    </div>
                    <div className="form-group full">
                      <label>Description</label>
                      <textarea rows="3" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="What does this project do?" />
                    </div>
                    <div className="form-group full">
                      <label>Tech Stack <span style={{color:'var(--text-muted)',fontWeight:400}}>(comma separated)</span></label>
                      <input value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} placeholder="React, Node.js, MySQL" />
                    </div>
                    <div className="form-group">
                      <label>GitHub URL</label>
                      <input value={projectForm.github_url} onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} placeholder="https://github.com/..." />
                    </div>
                    <div className="form-group">
                      <label>Live URL</label>
                      <input value={projectForm.live_url} onChange={(e) => setProjectForm({ ...projectForm, live_url: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="form-group full">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} />
                        Featured project (shown large at top)
                      </label>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={saveProject}>
                      {editingProject ? 'Save Changes' : 'Add Project'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="projects-admin-grid">
              {projects.map((p) => (
                <div className="project-admin-card" key={p.id}>
                  <div className="project-admin-top">
                    <span className="project-emoji">{p.emoji}</span>
                    {p.featured && <span className="featured-badge">Featured</span>}
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="project-stack">
                    {p.tech_stack?.split(',').map((t) => <span key={t}>{t.trim()}</span>)}
                  </div>
                  <div className="project-admin-actions">
                    <button className="btn btn-ghost" onClick={() => openEdit(p)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => deleteProject(p.id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GITHUB IMPORT TAB ── */}
        {tab === 'github' && (
          <div className="admin-content">
            <div className="admin-header">
              <div>
                <h1>Import from <span className="gradient-text">GitHub</span></h1>
                <p className="admin-sub">Fetch your public repos and add them as projects</p>
              </div>
              {selectedCount > 0 && (
                <button className="btn btn-primary" onClick={importSelected} disabled={ghImporting}>
                  {ghImporting ? 'Importing…' : `⬇ Import ${selectedCount} selected`}
                </button>
              )}
            </div>

            {/* Username search bar */}
            <div className="gh-search-bar glass-card">
              <div className="gh-search-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </div>
              <input
                id="gh-username-input"
                className="gh-username-input"
                value={ghUsername}
                onChange={(e) => setGhUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGhRepos()}
                placeholder="GitHub username"
              />
              <button className="btn btn-primary" onClick={fetchGhRepos} disabled={ghLoading}>
                {ghLoading ? 'Fetching…' : 'Fetch Repos'}
              </button>
            </div>

            {ghError && <p className="gh-error">{ghError}</p>}
            {ghDone && <p className="gh-success">{ghDone}</p>}

            {ghRepos.length > 0 && (
              <>
                <p className="admin-sub" style={{ marginBottom: '1rem' }}>
                  {ghRepos.length} public repos found · {selectedCount} selected
                </p>
                <div className="gh-repos-grid">
                  {ghRepos.map((repo) => {
                    const isSelected = !!ghSelected[repo.name];
                    const fields = ghSelected[repo.name] || {};
                    return (
                      <div
                        key={repo.name}
                        className={`gh-repo-card glass-card ${isSelected ? 'gh-selected' : ''}`}
                      >
                        {/* Card header — click to toggle */}
                        <div className="gh-repo-header" onClick={() => toggleRepo(repo)}>
                          <div className="gh-repo-left">
                            <span className="gh-check">{isSelected ? '✅' : '⬜'}</span>
                            <div>
                              <span className="gh-repo-name">{repo.name}</span>
                              {repo.language && (
                                <span className="gh-lang-badge">
                                  {LANG_EMOJI[repo.language] || '📄'} {repo.language}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="gh-repo-meta">
                            {repo.stars > 0 && <span>⭐ {repo.stars}</span>}
                            <span className="gh-updated">{new Date(repo.updated_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <p className="gh-repo-desc">{repo.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}</p>

                        {/* Editable fields shown only when selected */}
                        {isSelected && (
                          <div className="gh-edit-fields" onClick={(e) => e.stopPropagation()}>
                            <div className="gh-field-row">
                              <label>Title</label>
                              <input value={fields.title} onChange={(e) => updateSelected(repo.name, 'title', e.target.value)} />
                            </div>
                            <div className="gh-field-row">
                              <label>Description</label>
                              <textarea rows="2" value={fields.description} onChange={(e) => updateSelected(repo.name, 'description', e.target.value)} placeholder="Describe this project…" />
                            </div>
                            <div className="gh-field-row">
                              <label>Tech Stack <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
                              <input value={fields.tech_stack} onChange={(e) => updateSelected(repo.name, 'tech_stack', e.target.value)} placeholder="React, Node.js…" />
                            </div>
                            <div className="gh-field-row two-col">
                              <div>
                                <label>Emoji</label>
                                <input value={fields.emoji} onChange={(e) => updateSelected(repo.name, 'emoji', e.target.value)} style={{ width: '70px' }} />
                              </div>
                              <div>
                                <label>Live URL</label>
                                <input value={fields.live_url} onChange={(e) => updateSelected(repo.name, 'live_url', e.target.value)} placeholder="https://…" />
                              </div>
                            </div>
                            <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                              <input type="checkbox" checked={fields.featured} onChange={(e) => updateSelected(repo.name, 'featured', e.target.checked)} />
                              Featured project
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedCount > 0 && (
                  <div className="gh-import-bar">
                    <span>{selectedCount} repo{selectedCount !== 1 ? 's' : ''} selected</span>
                    <button className="btn btn-primary" onClick={importSelected} disabled={ghImporting}>
                      {ghImporting ? 'Importing…' : `⬇ Import ${selectedCount} selected`}
                    </button>
                  </div>
                )}
              </>
            )}

            {!ghLoading && ghRepos.length === 0 && !ghError && (
              <div className="gh-empty-state glass-card">
                <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style={{ opacity: 0.3 }}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <p>Enter your GitHub username and click <strong>Fetch Repos</strong></p>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="admin-content">
            <div className="admin-header">
              <div>
                <h1>Social <span className="gradient-text">Links</span></h1>
                <p className="admin-sub">Changes reflect live on your portfolio</p>
              </div>
            </div>
            <div className="settings-form glass-card">
              {[
                { key: 'github',    label: 'GitHub',      placeholder: 'https://github.com/Jashraj21', icon: '🐙' },
                { key: 'linkedin',  label: 'LinkedIn',    placeholder: 'https://linkedin.com/in/...', icon: '💼' },
                { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://x.com/...', icon: '🐦' },
                { key: 'instagram', label: 'Instagram',   placeholder: 'https://instagram.com/...', icon: '📸' },
                { key: 'facebook',  label: 'Facebook',    placeholder: 'https://facebook.com/...', icon: '👤' },
                { key: 'email',     label: 'Email',       placeholder: 'mail.jashraajnath@gmail.com', icon: '✉️' },
                { key: 'phone',     label: 'Phone',       placeholder: '+918136074206', icon: '📞' },
                { key: 'location',  label: 'Location',    placeholder: 'India', icon: '📍' },
              ].map(({ key, label, placeholder, icon }) => (
                <div className="settings-row" key={key}>
                  <label className="settings-label"><span>{icon}</span> {label}</label>
                  <input
                    className="settings-input"
                    value={settings[key] || ''}
                    placeholder={placeholder}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="settings-actions">
                <button
                  className={`btn ${settingsSaved ? 'btn-saved' : 'btn-primary'}`}
                  onClick={saveSettings}
                >
                  {settingsSaved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
