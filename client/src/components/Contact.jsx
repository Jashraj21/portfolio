import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 100);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contact`, form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact section" id="contact" ref={sectionRef}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">04. Contact</span>
          <h2 className="section-title">Let's <span className="gradient-text">Connect</span></h2>
        </div>
        <div className="contact-grid">
          <div className="contact-info reveal">
            <p className="contact-blurb">
              Have a project in mind, an opportunity, or just want to say hi?
              My inbox is always open — I'll get back to you as soon as possible!
            </p>
            <div className="contact-items">
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:mail.jashraajnath@gmail.com" id="contact-email-link">mail.jashraajnath@gmail.com</a>
              </div>
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>India</span>
              </div>
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <a href="tel:+918136074206" id="contact-phone-link">+91 81360 74206</a>
              </div>
            </div>
          </div>

          <form className="contact-form glass-card reveal" id="contactForm" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactName">Name</label>
                <input
                  type="text" id="contactName" name="name"
                  placeholder="Your name"
                  value={form.name} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Email</label>
                <input
                  type="email" id="contactEmail" name="email"
                  placeholder="your@email.com"
                  value={form.email} onChange={handleChange} required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contactSubject">Subject</label>
              <input
                type="text" id="contactSubject" name="subject"
                placeholder="What's this about?"
                value={form.subject} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactMessage">Message</label>
              <textarea
                id="contactMessage" name="message" rows="5"
                placeholder="Tell me about your project or idea…"
                value={form.message} onChange={handleChange} required
              />
            </div>
            <button type="submit" className="btn btn-primary" id="submitContact" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message ✉️'}
            </button>
            {error && <p style={{ color: '#f87171', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}
            {success && (
              <div className="form-success show" id="formSuccess">
                🎉 Message sent! I'll be in touch soon.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
