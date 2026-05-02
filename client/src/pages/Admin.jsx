import { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emptyProject = { title: '', description: '', tech_stack: '', github_url: '', live_url: '', emoji: '🚀', featured: false };
const defaultSettings = { github: '', linkedin: '', twitter: '', instagram: '', facebook: '', email: '', phone: '', location: '' };

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

  const unread = messages.filter((m) => !m.read).length;

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
              <button className="btn btn-primary" onClick={openAdd}>+ Add Project</button>
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
