import { useEffect, useRef } from 'react';

const categories = [
  {
    title: 'Frontend & UI',
    icon: '⚡',
    skills: [
      { name: 'HTML5 & CSS3', level: 95 },
      { name: 'JavaScript (ES6+)', level: 90 },
      { name: 'React & Next.js', level: 88 },
      { name: 'TypeScript', level: 82 },
      { name: 'Tailwind CSS', level: 85 },
    ],
  },
  {
    title: 'Backend & Systems',
    icon: '⚙️',
    skills: [
      { name: 'Node.js & Express', level: 85 },
      { name: 'Python & FastAPI', level: 82 },
      { name: 'C++ & Data Structures', level: 80 },
      { name: 'REST APIs & WebSockets', level: 86 },
      { name: 'TinaCMS & Markdown', level: 78 },
    ],
  },
  {
    title: 'Databases & Cloud',
    icon: '🗄️',
    skills: [
      { name: 'PostgreSQL & MySQL', level: 84 },
      { name: 'NoSQL & MongoDB', level: 74 },
      { name: 'Git & GitHub Workflow', level: 92 },
      { name: 'Linux / CLI & Bash', level: 86 },
      { name: 'Docker & Vercel Deploy', level: 75 },
    ],
  },
  {
    title: 'Design & Scientific Tools',
    icon: '🎨',
    skills: [
      { name: 'Figma & UI/UX Prototyping', level: 85 },
      { name: 'Adobe Illustrator & Canva', level: 82 },
      { name: 'Procreate Digital Art', level: 80 },
      { name: 'SciLab & Numerical Computing', level: 76 },
      { name: 'Excel & Data Analysis', level: 84 },
    ],
  },
];

const pills = [
  'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
  'Python', 'C++', 'FastAPI', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Tailwind CSS', 'HTML5 & CSS3', 'Git', 'GitHub', 'Docker', 'Linux / CLI',
  'Figma', 'Adobe Illustrator', 'Procreate', 'SciLab', 'TinaCMS',
  'Vercel', 'REST APIs', 'WebSockets', 'Canva', 'Computer Vision'
];

export default function Skills() {
  const sectionRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          document.querySelectorAll('.bar-fill').forEach((bar) => {
            bar.style.width = bar.dataset.width + '%';
          });
          entry.target.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 100);
          });
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="skills section" id="skills" ref={sectionRef}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">02. Skills</span>
          <h2 className="section-title">My <span className="gradient-text">Toolkit</span></h2>
        </div>
        <div className="skills-grid">
          {categories.map((cat) => (
            <div className="skill-category reveal" key={cat.title}>
              <h3 className="skill-cat-title">
                <span className="cat-icon">{cat.icon}</span> {cat.title}
              </h3>
              <div className="skill-bars">
                {cat.skills.map((s) => (
                  <div className="skill-bar-item" key={s.name}>
                    <div className="skill-bar-header">
                      <span>{s.name}</span>
                      <span className="skill-pct">{s.level}%</span>
                    </div>
                    <div className="bar">
                      <div className="bar-fill" data-width={s.level} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tech-pills reveal">
          {pills.map((p) => (
            <span className="pill" key={p}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
