import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/useApp';

const NAV_ITEMS = [
  { id: 'hero',         label: 'Command Bridge', icon: '⬡' },
  { id: 'about',        label: 'Memory Core',    icon: '◈' },
  { id: 'skills',       label: 'Skill Matrix',   icon: '⬢' },
  { id: 'projects',     label: 'Missions',       icon: '◎' },
  { id: 'galaxy',       label: 'Galaxy Map',     icon: '✦' },
  { id: 'achievements', label: 'Achievements',   icon: '◆' },
  { id: 'contact',      label: 'Comm Hub',       icon: '◉' },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

  @keyframes spinSlow  { to { transform: rotate(360deg); } }
  @keyframes spinCCW   { to { transform: rotate(-360deg); } }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes navGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(0,255,255,0.3); }
    50%       { box-shadow: 0 0 18px rgba(0,255,255,0.6), 0 0 8px rgba(139,92,246,0.4); }
  }

  .nhud-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 5px 10px;
    cursor: pointer;
    font-family: 'Orbitron', 'Share Tech Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: rgba(148,163,184,0.8);
    text-transform: uppercase;
    position: relative;
    white-space: nowrap;
    transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  }
  .nhud-btn:hover {
    background: linear-gradient(135deg, rgba(0,255,255,0.13), rgba(139,92,246,0.13));
    border-color: rgba(0,255,255,0.4);
    color: #e2e8f0;
    box-shadow: 0 0 14px rgba(0,255,255,0.25), inset 0 0 8px rgba(0,255,255,0.06);
  }
  .nhud-btn.active {
    background: linear-gradient(135deg, rgba(0,255,255,0.14), rgba(139,92,246,0.14));
    border-color: rgba(0,255,255,0.45);
    color: #22d3ee;
    box-shadow: 0 0 16px rgba(0,255,255,0.3), inset 0 0 10px rgba(0,255,255,0.07);
    animation: navGlow 2.5s ease-in-out infinite;
  }
  .nhud-btn .nhud-icon {
    font-size: 9px;
    color: rgba(100,116,139,0.7);
    line-height: 1;
    transition: color 0.2s;
  }
  .nhud-btn:hover .nhud-icon,
  .nhud-btn.active .nhud-icon {
    color: #a78bfa;
  }
  .nhud-dot {
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #22d3ee;
    box-shadow: 0 0 6px #22d3ee;
  }

  .nhud-mobile-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    font-family: 'Orbitron', 'Share Tech Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    color: rgba(148,163,184,0.85);
    text-transform: uppercase;
    text-align: left;
    width: 100%;
    transition: background 0.18s, border-color 0.18s, color 0.18s;
  }
  .nhud-mobile-item:hover {
    background: rgba(0,255,255,0.08);
    border-color: rgba(0,255,255,0.2);
    color: #e2e8f0;
  }
  .nhud-mobile-item.active {
    background: rgba(0,255,255,0.09);
    border-color: rgba(0,255,255,0.28);
    color: #22d3ee;
  }

  .nhud-contact {
    font-family: 'Orbitron', 'Share Tech Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #020818;
    font-weight: 700;
    background: linear-gradient(135deg, #22d3ee 0%, #7c3aed 100%);
    border: none;
    border-radius: 8px;
    padding: 7px 14px;
    cursor: pointer;
    box-shadow: 0 0 16px rgba(0,255,255,0.25), 0 0 6px rgba(139,92,246,0.2);
    transition: box-shadow 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  .nhud-contact:hover {
    box-shadow: 0 0 28px rgba(0,255,255,0.5), 0 0 14px rgba(139,92,246,0.4);
    transform: translateY(-1px);
  }

  .nhud-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 0;
    flex-shrink: 0;
  }

  /* Responsive helpers */
  .nhud-desktop-nav {
    display: none;
  }
  @media (min-width: 1024px) {
    .nhud-desktop-nav {
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }

  .nhud-status-cluster-full {
    display: none;
  }
  @media (min-width: 640px) {
    .nhud-status-cluster-full {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .nhud-contact-desktop {
    display: none;
  }
  @media (min-width: 640px) {
    .nhud-contact-desktop {
      display: block;
    }
  }

  .nhud-logo-subtitle {
    display: none;
  }
  @media (min-width: 400px) {
    .nhud-logo-subtitle {
      display: block;
    }
  }
`;

export default function NavHUD() {
  const { activeSection, setActiveSection } = useApp();
  const timeRef    = useRef(null);
  const dateRef    = useRef(null);
  const navRef     = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (timeRef.current)
        timeRef.current.textContent = now.toLocaleTimeString('en-US', { hour12: false });
      if (dateRef.current)
        dateRef.current.textContent = now.toLocaleDateString('en-US', {
          month: 'short', day: '2-digit',
        }).toUpperCase();
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = navRef.current ? navRef.current.getBoundingClientRect().height : 80;
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementTop - navHeight - 20;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setActiveSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      <style>{CSS}</style>

      <motion.nav
        ref={navRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 999,
          padding: '0 1.25rem',
        }}
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glass pill */}
        <div style={{
          margin: '10px auto',
          maxWidth: '1600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '18px',
          background: 'rgba(2, 8, 24, 0.55)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0, 255, 255, 0.18)',
          boxShadow: scrolled
            ? `0 0 0 1px rgba(139,92,246,0.18), 0 8px 48px rgba(0,0,0,0.7), 0 0 80px rgba(0,255,255,0.04), inset 0 1px 0 rgba(0,255,255,0.1)`
            : `0 0 0 1px rgba(139,92,246,0.12), 0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,255,255,0.08)`,
          position: 'relative',
        }}>

          {/* top glow line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%',
            height: '1px', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.6) 30%, rgba(139,92,246,0.6) 70%, transparent)',
            borderRadius: '999px',
          }} />

          {/* ── Logo ── */}
          <button className="nhud-logo" onClick={() => scrollTo('hero')}>
            <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,255,255,0.5)', animation: 'spinSlow 8s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.4)', animation: 'spinCCW 5s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,255,255,0.4)' }}>
                <span style={{ fontFamily: 'Orbitron,monospace', color: '#fff', fontSize: 7, fontWeight: 800 }}>IO</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'Orbitron,monospace', color: '#22d3ee', fontSize: 13, letterSpacing: '0.22em', fontWeight: 700, textTransform: 'uppercase' }}>INISH OS</span>
              <span className="nhud-logo-subtitle" style={{ fontFamily: 'Orbitron,monospace', color: '#a78bfa', fontSize: 7, letterSpacing: '0.32em', marginTop: 3, textTransform: 'uppercase' }}>NEBULA VESSEL</span>
            </div>
          </button>

          {/* ── Desktop nav links — hidden below lg ── */}
          <nav className="nhud-desktop-nav">
            {NAV_ITEMS.map(item => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`nhud-btn${active ? ' active' : ''}`}
                  onClick={() => scrollTo(item.id)}
                >
                  <span className="nhud-icon">{item.icon}</span>
                  {item.label}
                  {active && <span className="nhud-dot" />}
                </button>
              );
            })}
          </nav>

          {/* ── Right status cluster ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* SYS ONLINE pill + Clock — hidden below sm */}
            <div className="nhud-status-cluster-full">
              {/* SYS ONLINE pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite', boxShadow: '0 0 6px #4ade80' }} />
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 7.5, color: '#4ade80', letterSpacing: '0.2em', textTransform: 'uppercase' }}>SYS ONLINE</span>
              </div>

              {/* Clock */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 6, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 1 }} ref={dateRef} />
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, color: 'rgba(34,211,238,0.8)', letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums' }} ref={timeRef} />
              </div>
            </div>

            {/* Contact CTA — hidden below sm */}
            <button className="nhud-contact nhud-contact-desktop" onClick={() => scrollTo('contact')}>
              ◉ CONTACT
            </button>

            {/* Hamburger — always visible */}
            <button
              style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 16, height: 1.5, background: '#22d3ee', borderRadius: 2,
                  transition: 'all 0.25s ease', transformOrigin: 'center', display: 'block',
                  transform: mobileOpen
                    ? i === 0 ? 'rotate(45deg) translate(3.5px,3.5px)' : i === 2 ? 'rotate(-45deg) translate(3.5px,-3.5px)' : 'scaleX(0)'
                    : 'none',
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              style={{
                margin: '6px 0 0',
                background: 'rgba(2,8,24,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(0,255,255,0.18)',
                borderRadius: 14,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit   ={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(100,116,139,0.6)', letterSpacing: '0.25em', padding: '4px 14px 6px', borderBottom: '1px solid rgba(0,255,255,0.08)', marginBottom: 4, textTransform: 'uppercase' }}>
                ◈ Navigation Matrix
              </div>

              {NAV_ITEMS.map(item => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nhud-mobile-item${active ? ' active' : ''}`}
                    onClick={() => scrollTo(item.id)}
                  >
                    <span style={{ fontSize: 13, color: active ? '#a78bfa' : 'rgba(100,116,139,0.7)', transition: 'color 0.2s' }}>{item.icon}</span>
                    {item.label}
                    {active && <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 6px #22d3ee', flexShrink: 0 }} />}
                  </button>
                );
              })}

              {/* Contact + SYS status shown in mobile menu */}
              <div style={{ marginTop: 8, padding: '8px 14px', borderTop: '1px solid rgba(0,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite', boxShadow: '0 0 6px #4ade80' }} />
                  <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: '#4ade80', letterSpacing: '0.2em', textTransform: 'uppercase' }}>SYS ONLINE</span>
                </div>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(34,211,238,0.7)', letterSpacing: '0.1em' }} ref={null}>
                  {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>

              <button
                className="nhud-contact"
                style={{ marginTop: 4, width: '100%', padding: 10, textAlign: 'center', borderRadius: 10 }}
                onClick={() => scrollTo('contact')}
              >
                ◉ OPEN COMM HUB
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}