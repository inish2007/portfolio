import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../contexts/useApp';

// ─── Constants ────────────────────────────────────────────────────────────────

const BOOT_LINES = [
  { text: 'INITIALIZING INISH OS...', delay: 0, color: '#00D4FF' },
  { text: 'LOADING VESSEL SYSTEMS...', delay: 700, color: '#00D4FF' },
  { text: 'CALIBRATING NEURAL NETWORK...', delay: 1350, color: '#00D4FF' },
  { text: 'CONNECTING AI CORE...', delay: 1950, color: '#AA44FF' },
  { text: 'SYNCING SKILL MATRIX...', delay: 2550, color: '#AA44FF' },
  { text: 'LOADING MISSION ARCHIVE...', delay: 3000, color: '#AA44FF' },
  { text: 'ESTABLISHING COMMAND LINK...', delay: 3450, color: '#FF4FD8' },
  { text: 'NEBULA AI ONLINE...', delay: 4050, color: '#FF4FD8' },
  { text: 'CAPTAIN IDENTIFIED...', delay: 4550, color: '#00D4FF' },
];

const PHASES = [
  { name: 'dark', start: 0 },
  { name: 'particle', start: 800 },
  { name: 'pulse', start: 1400 },
  { name: 'explosion', start: 2100 },
  { name: 'galaxy', start: 3000 },
  { name: 'stars', start: 4200 },
  { name: 'boot', start: 5200 },
  { name: 'done', start: 99999 },
];

const UI_APPEAR = 5000;
const CAPTAIN_SHOW = 9700;
const FADE_OUT = 11200;
const COMPLETE = 12200;

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function rand(a, b) { return a + Math.random() * (b - a); }

function createStar(w, h) {
  return {
    x: rand(0, w), y: rand(0, h),
    r: rand(0.3, 1.8),
    baseAlpha: rand(0.3, 1),
    twinkleSpeed: rand(0.5, 2.8),
    twinklePhase: Math.random() * Math.PI * 2,
  };
}

function createDust(cx, cy, fast = false) {
  const angle = Math.random() * Math.PI * 2;
  const speed = fast ? rand(0.8, 3.5) : rand(0.2, 1.4);
  const hue = [200, 280, 320][Math.floor(Math.random() * 3)];
  return {
    x: cx, y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: rand(fast ? 1.5 : 0.8, fast ? 4.5 : 3),
    alpha: rand(0.4, 0.9),
    decay: rand(0.003, 0.009),
    hue, sat: rand(60, 100), lum: rand(50, 80),
  };
}

// ─── Canvas Renderer ──────────────────────────────────────────────────────────

function startRenderer(canvas, getElapsed) {
  const ctx = canvas.getContext('2d');

  let stars = [];
  let dust = [];
  let raf = null;
  let lastDustSpawn = 0;

  function ensureStars(w, h, target = 240) {
    while (stars.length < target) stars.push(createStar(w, h));
  }

  function spawnDust(cx, cy, n, fast = false) {
    for (let i = 0; i < n; i++) dust.push(createDust(cx, cy, fast));
  }

  function getPhaseInfo(elapsed) {
    let phase = PHASES[0];
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (elapsed >= PHASES[i].start) { phase = PHASES[i]; break; }
    }
    const nextPhase = PHASES[Math.min(PHASES.indexOf(phase) + 1, PHASES.length - 1)];
    const duration = nextPhase.start - phase.start;
    const t = Math.min(1, (elapsed - phase.start) / Math.max(1, duration));
    return { name: phase.name, t };
  }

  function drawFrame() {
    const elapsed = getElapsed();
    const { name, t } = getPhaseInfo(elapsed);
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const now = performance.now();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    if (name === 'particle') {
      const size = 2 + t * 4;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 10);
      grd.addColorStop(0, `rgba(0,212,255,${t * 0.95})`);
      grd.addColorStop(0.4, `rgba(90,24,154,${t * 0.5})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, size * 10, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill();
    }

    if (name === 'pulse') {
      for (let ring = 0; ring < 4; ring++) {
        const rt = Math.max(0, (t - ring * 0.15) * 1.35);
        if (rt <= 0 || rt > 1) continue;
        const r = rt * Math.min(w, h) * 0.14;
        const alpha = (1 - rt) * 0.75;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
        ctx.lineWidth = (1 - rt) * 2.5;
        ctx.stroke();
      }
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
      g1.addColorStop(0, 'rgba(255,255,255,0.9)');
      g1.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = g1; ctx.fill();
    }

    if (name === 'explosion') {
      const RING_COLORS = ['#00D4FF', '#5A189A', '#FF4FD8', '#00D4FF', '#ffffff'];
      const maxR = Math.min(w, h) * 0.8;
      for (let ring = 0; ring < 5; ring++) {
        const delay = ring * 0.1;
        const rt = Math.max(0, (t - delay) * 1.45);
        if (rt <= 0 || rt > 1) continue;
        const r = rt * maxR * (0.3 + ring * 0.18);
        const alpha = (1 - rt) * (0.95 - ring * 0.12);
        const hex = RING_COLORS[ring];
        const rv = parseInt(hex.slice(1, 3), 16);
        const gv = parseInt(hex.slice(3, 5), 16);
        const bv = parseInt(hex.slice(5, 7), 16);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rv},${gv},${bv},${alpha})`;
        ctx.lineWidth = (1 - rt) * 3.5 + 0.5;
        ctx.stroke();
      }
      if (now - lastDustSpawn > 30 && dust.length < 350) {
        spawnDust(cx, cy, 6, true);
        lastDustSpawn = now;
      }
    }

    if (name === 'galaxy' || name === 'stars' || name === 'boot' || name === 'done') {
      ensureStars(w, h);
      if (dust.length < 80 && now - lastDustSpawn > 80) {
        spawnDust(cx, cy, 3, false);
        lastDustSpawn = now;
      }
    }

    dust = dust.filter(d => d.alpha > 0.01);
    for (const d of dust) {
      d.x += d.vx; d.y += d.vy;
      d.vx *= 0.99; d.vy *= 0.99;
      d.alpha -= d.decay;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${d.hue},${d.sat}%,${d.lum}%,${d.alpha})`;
      ctx.fill();
    }

    for (const s of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin((now / 1000) * s.twinkleSpeed + s.twinklePhase);
      const alpha = s.baseAlpha * twinkle;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
      if (s.r > 1.1) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,230,255,${alpha * 0.07})`;
        ctx.fill();
      }
    }

    if (name !== 'dark') {
      const glowR = name === 'particle' ? 24 : name === 'pulse' ? 36 : 60;
      const glowA = (name === 'boot' || name === 'done') ? 0.25 : Math.min(t * 0.55, 0.55);
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g2.addColorStop(0, `rgba(90,24,154,${glowA})`);
      g2.addColorStop(0.5, `rgba(0,212,255,${glowA * 0.3})`);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    }

    raf = requestAnimationFrame(drawFrame);
  }

  raf = requestAnimationFrame(drawFrame);
  return () => { if (raf) cancelAnimationFrame(raf); };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BootSequence() {
  const { setBooted } = useApp();
  const canvasRef = useRef(null);
  const startedAt = useRef(Date.now());
  const timers = useRef([]);

  const [uiVisible, setUiVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState([]);
  const [loadingPct, setLoadingPct] = useState(0);
  const [showCaptain, setShowCaptain] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [skipHovered, setSkipHovered] = useState(false);

  const push = useCallback((fn, delay) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);

  // ── Skip handler ──
  const handleSkip = useCallback(() => {
    // Kill every pending timer
    timers.current.forEach(clearTimeout);
    timers.current = [];
    // Instant fade-out then boot
    setFadeOut(true);
    setTimeout(() => setBooted(true), 400);
  }, [setBooted]);

  // ── Canvas resize ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observe = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    observe.observe(canvas.parentElement);
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    const stop = startRenderer(canvas, () => Date.now() - startedAt.current);
    return () => { observe.disconnect(); stop(); };
  }, []);

  // ── Timers ──
  useEffect(() => {
    push(() => setUiVisible(true), UI_APPEAR);

    BOOT_LINES.forEach((line, i) => {
      push(() => {
        setVisibleLines(prev => [...prev, line]);
        setLoadingPct(Math.round(((i + 1) / BOOT_LINES.length) * 100));
      }, UI_APPEAR + line.delay);
    });

    push(() => setShowCaptain(true), CAPTAIN_SHOW);
    push(() => setFadeOut(true), FADE_OUT);
    push(() => setBooted(true), COMPLETE);

    return () => timers.current.forEach(clearTimeout);
  }, [push, setBooted]);

  return (
    <div
      className="boot-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: '#000',
        transition: fadeOut ? 'opacity 0.4s ease' : undefined,
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* ── Canvas background ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          display: 'block',
        }}
      />

      {/* ── Scanline overlay ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,212,255,0.013) 50%)',
          backgroundSize: '100% 4px',
          animation: 'bs-scan 10s linear infinite',
          opacity: 0.35,
        }}
      />

      {/* ── HUD corner brackets ── */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <div
          key={pos}
          style={{
            position: 'absolute', width: 44, height: 44, zIndex: 3,
            ...(pos === 'tl' ? { top: 20, left: 20, borderTop: '1.5px solid #00D4FF', borderLeft: '1.5px solid #00D4FF' } :
              pos === 'tr' ? { top: 20, right: 20, borderTop: '1.5px solid #00D4FF', borderRight: '1.5px solid #00D4FF' } :
                pos === 'bl' ? { bottom: 20, left: 20, borderBottom: '1.5px solid #00D4FF', borderLeft: '1.5px solid #00D4FF' } :
                  { bottom: 20, right: 20, borderBottom: '1.5px solid #00D4FF', borderRight: '1.5px solid #00D4FF' }),
            opacity: uiVisible ? 0.65 : 0,
            transition: 'opacity 1.2s ease',
          }}
        />
      ))}

      {/* ── SKIP BUTTON ── */}
      <button
        onClick={handleSkip}
        onMouseEnter={() => setSkipHovered(true)}
        onMouseLeave={() => setSkipHovered(false)}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          zIndex: 20,
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: skipHovered ? '#00D4FF' : 'rgba(0,212,255,0.45)',
          background: skipHovered ? 'rgba(0,212,255,0.08)' : 'transparent',
          border: `1px solid ${skipHovered ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.2)'}`,
          borderRadius: 6,
          padding: '7px 14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <span style={{ opacity: skipHovered ? 1 : 0.6 }}>▶▶</span>
        SKIP BOOT
      </button>

      {/* ── UI Layer ── */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%', maxWidth: 560, padding: '0 24px',
          opacity: uiVisible ? 1 : 0,
          transform: uiVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1.5px solid #00D4FF',
              animation: 'bs-spin 7s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 7, borderRadius: '50%',
              border: '1px solid #FF4FD8',
              animation: 'bs-spin 4.5s linear infinite reverse',
            }} />
            <div style={{
              position: 'absolute', inset: 14, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 38%, #FF4FD8 0%, #5A189A 45%, #00D4FF 100%)',
              opacity: 0.88,
              animation: 'bs-pulse-orb 3s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.1em', fontFamily: 'monospace',
              zIndex: 1,
            }}>IO</div>
          </div>
          <div>
            <p style={{
              fontFamily: 'monospace', color: '#00D4FF', fontSize: 16,
              letterSpacing: '0.35em', fontWeight: 700, margin: 0, lineHeight: 1.4,
            }}>INISH OS</p>
            <p style={{
              fontFamily: 'monospace', color: '#FF4FD8', fontSize: 9,
              letterSpacing: '0.4em', opacity: 0.8, margin: 0,
            }}>NEBULA COMMAND VESSEL</p>
          </div>
        </div>

        {/* ── Terminal ── */}
        <div style={{
          width: '100%', minHeight: 188, marginBottom: 18,
          background: 'rgba(0,212,255,0.028)',
          border: '1px solid rgba(0,212,255,0.14)',
          borderRadius: 5, padding: '12px 18px',
        }}>
          {visibleLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 7,
                animation: 'bs-slide-in 0.3s ease forwards',
                opacity: 0,
              }}
            >
              <span style={{ color: line.color, fontSize: 10, fontFamily: 'monospace' }}>▸</span>
              <span style={{
                color: line.color, fontSize: 9,
                letterSpacing: '0.14em', fontFamily: 'monospace',
              }}>{line.text}</span>
              {i === visibleLines.length - 1 && (
                <span style={{
                  display: 'inline-block', width: 7, height: 11,
                  background: '#00FF88', verticalAlign: 'middle',
                  animation: 'bs-blink 1s step-end infinite',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div style={{ width: '100%', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#00D4FF', fontSize: 8, letterSpacing: '0.2em', fontFamily: 'monospace' }}>SYSTEM LOAD</span>
            <span style={{ color: '#00D4FF', fontSize: 8, fontFamily: 'monospace' }}>{loadingPct}%</span>
          </div>
          <div style={{
            height: 2, background: 'rgba(255,255,255,0.08)',
            borderRadius: 2, overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              height: '100%', width: `${loadingPct}%`,
              background: 'linear-gradient(90deg, #00D4FF, #5A189A, #FF4FD8)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', right: 0, top: '50%',
                transform: 'translate(50%, -50%)',
                width: 7, height: 7, borderRadius: '50%',
                background: '#FF4FD8',
                boxShadow: '0 0 8px 2px #FF4FD8',
              }} />
            </div>
          </div>
        </div>

        {/* ── Captain card ── */}
        <div style={{
          width: '100%', textAlign: 'center',
          padding: '22px 36px',
          border: '1px solid rgba(0,212,255,0.38)',
          background: 'rgba(0,0,0,0.65)',
          borderRadius: 6,
          boxShadow: '0 0 40px rgba(0,212,255,0.07), inset 0 0 24px rgba(90,24,154,0.06)',
          opacity: showCaptain ? 1 : 0,
          transform: showCaptain ? 'scale(1)' : 'scale(0.92)',
          transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <p style={{
            fontFamily: 'monospace', color: '#00D4FF',
            fontSize: 8, letterSpacing: '0.55em', marginBottom: 10, opacity: 0.8,
          }}>CAPTAIN IDENTIFIED</p>
          <p style={{
            fontFamily: 'monospace', fontSize: 30, fontWeight: 700,
            letterSpacing: '0.1em', marginBottom: 8, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #00D4FF 0%, #FF4FD8 55%, #5A189A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>K INISH KUMAR</p>
          <p style={{
            fontFamily: 'monospace', color: '#FF4FD8',
            fontSize: 8, letterSpacing: '0.3em', opacity: 0.75,
          }}>SYSTEM ONLINE ◆ NEBULA INITIALIZING</p>
        </div>
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes bs-spin       { to { transform: rotate(360deg); } }
        @keyframes bs-pulse-orb  { 0%,100% { opacity: 0.88; } 50% { opacity: 1; } }
        @keyframes bs-blink      { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bs-scan       { to { background-position: 0 100%; } }
        @keyframes bs-slide-in   {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}