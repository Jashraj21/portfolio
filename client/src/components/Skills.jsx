import { useEffect, useRef } from 'react';

const categories = [
  {
    title: 'Frontend',
    skills: [
      { name: 'HTML & CSS', level: 95 },
      { name: 'JavaScript', level: 88 },
      { name: 'React', level: 80 },
      { name: 'TypeScript', level: 72 },
    ],
  },
  {
    title: 'Backend',
    skills: [
      { name: 'Node.js', level: 78 },
      { name: 'Python', level: 82 },
      { name: 'Express', level: 75 },
      { name: 'MySQL / NoSQL', level: 70 },
    ],
  },
  {
    title: 'Tools & Design',
    skills: [
      { name: 'Git & GitHub', level: 90 },
      { name: 'Figma', level: 76 },
      { name: 'Docker', level: 60 },
      { name: 'Linux / CLI', level: 83 },
    ],
  },
];

const pills = ['React', 'Node.js', 'MySQL', 'JavaScript', 'TypeScript', 'Python', 'Express', 'Git', 'Figma', 'Docker', 'REST APIs', 'Linux'];

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
              <h3 className="skill-cat-title">{cat.title}</h3>
              <div className="skill-bars">
                {cat.skills.map((s) => (
                  <div className="skill-bar-item" key={s.name}>
                    <span>{s.name}</span>
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
