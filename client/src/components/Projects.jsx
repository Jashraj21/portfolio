import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const COLORS = ['p1','p2','p3','p1','p2','p3'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/projects`)
      .then((res) => setProjects(res.data.projects))
      .catch(() => setError('Could not load projects from server.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 120);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [projects]);

  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section className="projects section" id="projects" ref={sectionRef}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">03. Projects</span>
          <h2 className="section-title">What I've <span className="gradient-text">Built</span></h2>
        </div>

        {loading && <p className="loading-projects">Loading projects…</p>}
        {error && <p className="error-projects">{error}</p>}

        {!loading && !error && (
          <div className="projects-grid">
            {featured && (
              <article className="project-card featured reveal" id="project-featured">
                <div className="project-img">
                  <div className="project-placeholder p1">
                    <span>{featured.emoji || '🚀'}</span>
                  </div>
                </div>
                <div className="project-info">
                  <span className="project-tag">Featured Project</span>
                  <h3 className="project-title">{featured.title}</h3>
                  <div className="project-desc glass-card">
                    <p>{featured.description}</p>
                  </div>
                  <div className="project-stack">
                    {featured.tech_stack?.split(',').map((t) => (
                      <span key={t}>{t.trim()}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    <a href={featured.github_url || '#'} className="btn-icon" target="_blank" rel="noreferrer" aria-label="GitHub"><GitHubIcon /></a>
                    <a href={featured.live_url || '#'} className="btn-icon" target="_blank" rel="noreferrer" aria-label="Live"><ExternalIcon /></a>
                  </div>
                </div>
              </article>
            )}
            {rest.map((p, i) => (
              <article className="project-card reveal" key={p.id} id={`project-${p.id}`}>
                <div className="project-img">
                  <div className={`project-placeholder ${COLORS[i % COLORS.length]}`}>
                    <span>{p.emoji || '💡'}</span>
                  </div>
                </div>
                <div className="project-info">
                  <span className="project-tag">{p.tag || 'Project'}</span>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc-sm">{p.description}</p>
                  <div className="project-stack">
                    {p.tech_stack?.split(',').map((t) => (
                      <span key={t}>{t.trim()}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    <a href={p.github_url || '#'} className="btn-icon" target="_blank" rel="noreferrer" aria-label="GitHub"><GitHubIcon /></a>
                    <a href={p.live_url || '#'} className="btn-icon" target="_blank" rel="noreferrer" aria-label="Live"><ExternalIcon /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
