import { useEffect, useRef } from 'react';

const stats = [
  { target: 15, label: 'Projects Built' },
  { target: 3,  label: 'Years Coding' },
  { target: 100, label: 'Coffees ☕' },
];

export default function About() {
  const sectionRef = useRef(null);
  const countersStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted.current) {
          countersStarted.current = true;
          document.querySelectorAll('.stat-number').forEach((el) => {
            const target = +el.dataset.target;
            let current = 0;
            const step = Math.ceil(target / 50);
            const interval = setInterval(() => {
              current = Math.min(current + step, target);
              el.textContent = current + (target === 100 ? '+' : '');
              if (current >= target) clearInterval(interval);
            }, 30);
          });
          // Reveal items
          entry.target.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 120);
          });
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="about section" id="about" ref={sectionRef}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">01. About Me</span>
          <h2 className="section-title">Who I <span className="gradient-text">Am</span></h2>
        </div>
        <div className="about-grid">
          <div className="about-avatar-wrap reveal">
            <div className="about-avatar">
              <img src="/profile.jpg" alt="Jashraaj Nath" className="avatar-photo" />
            </div>
            <div className="avatar-ring ring-1" />
            <div className="avatar-ring ring-2" />
            <div className="about-badge">
              <span className="badge-dot" /> Available for work
            </div>
          </div>
          <div className="about-text">
            <p className="reveal">
              I'm <strong>Jashraaj Nath</strong>, a developer and creative thinker who loves
              turning complex problems into simple, beautiful, and intuitive solutions.
              I care deeply about the intersection of design and technology.
            </p>
            <p className="reveal">
              When I'm not coding, you'll find me exploring new design trends,
              contributing to open-source, or levelling up my problem-solving skills
              on competitive platforms.
            </p>
            <div className="about-stats reveal">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <span className="stat-number" data-target={s.target}>0</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <a href="#" className="btn btn-primary reveal" id="download-resume">
              Download Résumé ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
