import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../contexts/useApp';
import CosmicWarp from './CosmicWarp';

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES = [
  { name: 'dark',      start: 0 },
  { name: 'particle',  start: 600 },
  { name: 'pulse',     start: 1100 },
  { name: 'explosion', start: 1700 },
  { name: 'galaxy',    start: 2500 },
  { name: 'rift',      start: 3200 },
  { name: 'stars',     start: 4400 },
  { name: 'boot',      start: 5200 },
  { name: 'done',      start: 99999 },
];

const HYPERSPEED_SHOW  = 4000;
const HYPERSPEED_HIDE  = 9500;
const NAME_SHOW        = 5400;
const ROLE_SHOW        = 6800;
const TAGLINE_SHOW     = 7800;
const COMPLETE         = 11000;

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function rand(a, b) { return a + Math.random() * (b - a); }

function createStar(w, h) {
  // Rich star palette — not just white, actual star colors
  const starTypes = [
    { r: 'rgba(255,255,255,',    weight: 40 }, // white
    { r: 'rgba(180,210,255,',    weight: 25 }, // blue-white
    { r: 'rgba(220,180,255,',    weight: 15 }, // violet
    { r: 'rgba(255,220,180,',    weight: 10 }, // warm yellow
    { r: 'rgba(0,212,255,',      weight: 6  }, // cyan bright
    { r: 'rgba(255,100,200,',    weight: 4  }, // magenta accent
  ];
  const roll = Math.random() * 100;
  let acc = 0, chosen = starTypes[0];
  for (const t of starTypes) { acc += t.weight; if (roll < acc) { chosen = t; break; } }

  return {
    x: rand(0, w), y: rand(0, h),
    r: rand(0.15, 1.6),
    baseAlpha: rand(0.25, 1),
    twinkleSpeed: rand(0.3, 2.8),
    twinklePhase: Math.random() * Math.PI * 2,
    color: chosen.r,
    // Giant stars get halos
    giant: Math.random() > 0.94,
  };
}

// Shared, desaturated cosmic palette — used by dust so it reads as the same
// "family" of color as the (also desaturated) nebula blooms, rather than
// two unrelated neon systems layered on top of each other.
function createDust(cx, cy, fast = false) {
  const angle = Math.random() * Math.PI * 2;
  const speed = fast ? rand(1.2, 4.5) : rand(0.2, 1.4);
  const palettes = [
    { hue: 192, sat: 60, lum: 50 }, // muted cyan      (matches nebula bloom 2)
    { hue: 270, sat: 48, lum: 46 }, // muted violet     (matches nebula bloom 1)
    { hue: 315, sat: 45, lum: 46 }, // muted magenta    (matches nebula bloom 3)
    { hue: 220, sat: 52, lum: 50 }, // muted blue       (matches nebula bloom 4)
    { hue: 290, sat: 42, lum: 44 }, // muted purple     (matches nebula bloom 5)
    { hue: 180, sat: 50, lum: 50 }, // muted aqua/teal  (matches nebula bloom 6)
    { hue: 340, sat: 45, lum: 46 }, // muted pink
  ];
  const p = palettes[Math.floor(Math.random() * palettes.length)];
  return {
    x: cx, y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: rand(fast ? 1.8 : 0.6, fast ? 5 : 2.8),
    alpha: rand(0.5, 1),
    decay: rand(0.002, 0.007),
    hue: p.hue + rand(-20, 20),
    sat: p.sat,
    lum: p.lum,
  };
}

// ─── Canvas Renderer ──────────────────────────────────────────────────────────

function startRenderer(canvas, getElapsed) {
  const ctx = canvas.getContext('2d');
  let stars = [], dust = [], raf = null, lastDustSpawn = 0;

  function ensureStars(w, h, target = 320) {
    while (stars.length < target) stars.push(createStar(w, h));
  }

  function spawnDust(cx, cy, n, fast = false) {
    for (let i = 0; i < n; i++) dust.push(createDust(cx, cy, fast));
  }

  function getPhaseInfo(elapsed) {
    let idx = 0;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (elapsed >= PHASES[i].start) { idx = i; break; }
    }
    const phase = PHASES[idx];
    const next = PHASES[Math.min(idx + 1, PHASES.length - 1)];
    const duration = next.start - phase.start;
    const t = Math.min(1, (elapsed - phase.start) / Math.max(1, duration));
    return { name: phase.name, t };
  }

  // ── Rich nebula — multiple overlapping blooms ──────────────────────────────
  // Same hue families as the dust palette above, but rendered as soft hsla
  // gradients instead of saturated rgb — keeps the two systems visually
  // consistent (matching, muted cosmic palette) rather than clashing.
  function drawNebulaForm(w, h, alpha, time) {
    const cx = w / 2, cy = h / 2;
    ctx.save();

    // Slow organic drift per bloom
    const d1x = Math.sin(time * 0.00028) * w * 0.07;
    const d1y = Math.cos(time * 0.00021) * h * 0.05;
    const d2x = Math.cos(time * 0.00019) * w * 0.09;
    const d2y = Math.sin(time * 0.00033) * h * 0.06;
    const d3x = Math.sin(time * 0.00041) * w * 0.05;
    const d3y = Math.cos(time * 0.00016) * h * 0.07;

    // ── Bloom 1: violet foundation ──
    {
      const g = ctx.createRadialGradient(
        cx + d1x - w * 0.06, cy + d1y + h * 0.03, 0,
        cx + d1x - w * 0.06, cy + d1y + h * 0.03, Math.min(w, h) * 0.55
      );
      g.addColorStop(0,   `hsla(270, 48%, 38%, ${alpha * 0.7})`);
      g.addColorStop(0.3, `hsla(270, 44%, 30%, ${alpha * 0.45})`);
      g.addColorStop(0.7, `hsla(270, 40%, 18%, ${alpha * 0.2})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Bloom 2: cyan highlight — off-center right ──
    {
      const g = ctx.createRadialGradient(
        cx + d2x + w * 0.08, cy + d2y - h * 0.08, 0,
        cx + d2x + w * 0.08, cy + d2y - h * 0.08, Math.min(w, h) * 0.32
      );
      g.addColorStop(0,    `hsla(192, 60%, 50%, ${alpha * 0.7})`);
      g.addColorStop(0.25, `hsla(192, 55%, 40%, ${alpha * 0.45})`);
      g.addColorStop(0.6,  `hsla(195, 50%, 30%, ${alpha * 0.18})`);
      g.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Bloom 3: magenta — lower left ──
    {
      const g = ctx.createRadialGradient(
        cx + d3x - w * 0.14, cy + d3y + h * 0.12, 0,
        cx + d3x - w * 0.14, cy + d3y + h * 0.12, Math.min(w, h) * 0.28
      );
      g.addColorStop(0,   `hsla(315, 48%, 46%, ${alpha * 0.55})`);
      g.addColorStop(0.4, `hsla(315, 42%, 34%, ${alpha * 0.28})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Bloom 4: blue — upper center ──
    {
      const g = ctx.createRadialGradient(
        cx + d1x * 0.5, cy + d2y - h * 0.18, 0,
        cx + d1x * 0.5, cy + d2y - h * 0.18, Math.min(w, h) * 0.22
      );
      g.addColorStop(0,   `hsla(220, 52%, 56%, ${alpha * 0.5})`);
      g.addColorStop(0.5, `hsla(220, 48%, 40%, ${alpha * 0.22})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Bloom 5: purple core — center, pulsing ──
    {
      const pulse = 0.85 + 0.15 * Math.sin(time * 0.0008);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.18 * pulse);
      g.addColorStop(0,   `hsla(290, 46%, 56%, ${alpha * 0.55})`);
      g.addColorStop(0.5, `hsla(290, 42%, 42%, ${alpha * 0.25})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Bloom 6: teal/aqua accent — right edge ──
    {
      const g = ctx.createRadialGradient(
        cx + w * 0.22 + d2x, cy + d3y, 0,
        cx + w * 0.22 + d2x, cy + d3y, Math.min(w, h) * 0.20
      );
      g.addColorStop(0,   `hsla(180, 48%, 42%, ${alpha * 0.38})`);
      g.addColorStop(0.5, `hsla(180, 44%, 32%, ${alpha * 0.16})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  // ── Stars with halos and color ─────────────────────────────────────────────
  function drawStars(now) {
    for (const s of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin((now / 1000) * s.twinkleSpeed + s.twinklePhase);
      const alpha = s.baseAlpha * twinkle;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `${s.color}${alpha})`;
      ctx.fill();

      // Medium stars — soft glow
      if (s.r > 0.8 && !s.giant) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${alpha * 0.06})`;
        ctx.fill();
      }

      // Giant stars — big halo + diffraction cross
      if (s.giant) {
        const haloR = s.r * 6;
        const halo = ctx.createRadialGradient(s.x, s.y, s.r * 0.5, s.x, s.y, haloR);
        halo.addColorStop(0, `${s.color}${alpha * 0.4})`);
        halo.addColorStop(0.4, `${s.color}${alpha * 0.12})`);
        halo.addColorStop(1, `${s.color}0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Diffraction spikes
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = `${s.color}0.8)`;
        ctx.lineWidth = 0.5;
        const spike = s.r * 10;
        ctx.beginPath();
        ctx.moveTo(s.x - spike, s.y); ctx.lineTo(s.x + spike, s.y);
        ctx.moveTo(s.x, s.y - spike); ctx.lineTo(s.x, s.y + spike);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawFrame() {
    const elapsed = getElapsed();
    const { name, t } = getPhaseInfo(elapsed);
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const now = performance.now();

    ctx.clearRect(0, 0, w, h);

    // Deep space base — very dark indigo, not pure black
    ctx.fillStyle = '#020108';
    ctx.fillRect(0, 0, w, h);

    // ── LAYER ORDER (back to front): nebula → stars → dust → effects ──

    // ── Nebula blooms — appear from galaxy phase, stay through boot ──
    if (name === 'galaxy' || name === 'rift' || name === 'stars' || name === 'boot' || name === 'done') {
      // Fade in during galaxy, breathe gently after
      const breathe = 0.88 + 0.12 * Math.sin(now * 0.0006);
      const nebulaAlpha = name === 'galaxy'
        ? t * breathe
        : breathe;
      drawNebulaForm(w, h, nebulaAlpha, now);
    }

    // ── Nebula also bleeds in during explosion tail ──
    if (name === 'explosion' && t > 0.6) {
      drawNebulaForm(w, h, (t - 0.6) * 2 * 0.4, now);
    }

    // ── Stars — appear from galaxy phase ──
    if (name === 'galaxy' || name === 'rift' || name === 'stars' || name === 'boot' || name === 'done') {
      ensureStars(w, h);
      drawStars(now);
      if (dust.length < 80 && now - lastDustSpawn > 80) {
        spawnDust(cx, cy, 3, false); lastDustSpawn = now;
      }
    }

    // ── particle phase ──
    if (name === 'particle') {
      const size = 2 + t * 4;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 12);
      grd.addColorStop(0,   `rgba(0,230,255,${t * 0.95})`);
      grd.addColorStop(0.3, `rgba(100,30,200,${t * 0.6})`);
      grd.addColorStop(0.7, `rgba(200,0,160,${t * 0.3})`);
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, size * 12, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      // Bright white core
      ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
    }

    // ── pulse phase ──
    if (name === 'pulse') {
      // 4 rings — full spectrum
      const PULSE_COLORS = [
        'rgba(0,230,255,',    // cyan
        'rgba(160,60,255,',   // violet
        'rgba(220,40,180,',   // magenta
        'rgba(0,180,255,',    // blue-cyan
      ];
      for (let ring = 0; ring < 4; ring++) {
        const rt = Math.max(0, (t - ring * 0.15) * 1.35);
        if (rt <= 0 || rt > 1) continue;
        const r = rt * Math.min(w, h) * 0.16;
        const alpha = (1 - rt) * 0.85;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `${PULSE_COLORS[ring]}${alpha})`;
        ctx.lineWidth = (1 - rt) * 3;
        ctx.stroke();
      }
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
      g1.addColorStop(0, 'rgba(255,255,255,0.95)');
      g1.addColorStop(0.5, 'rgba(0,230,255,0.4)');
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = g1; ctx.fill();
    }

    // ── explosion phase — full spectrum rings ──
    if (name === 'explosion') {
      const RING_COLORS = [
        '#00E5FF',   // bright cyan
        '#8B2FFF',   // violet
        '#FF30C0',   // hot magenta
        '#00BFFF',   // sky blue
        '#FF80D0',   // soft pink
        '#40FFCC',   // aqua
      ];
      const maxR = Math.min(w, h) * 0.9;
      for (let ring = 0; ring < 6; ring++) {
        const delay = ring * 0.08;
        const rt = Math.max(0, (t - delay) * 1.5);
        if (rt <= 0 || rt > 1) continue;
        const r = rt * maxR * (0.22 + ring * 0.16);
        const alpha = (1 - rt) * (1 - ring * 0.1);
        const hex = RING_COLORS[ring];
        const rv = parseInt(hex.slice(1, 3), 16);
        const gv = parseInt(hex.slice(3, 5), 16);
        const bv = parseInt(hex.slice(5, 7), 16);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rv},${gv},${bv},${alpha})`;
        ctx.lineWidth = (1 - rt) * 4 + 0.5;
        ctx.stroke();
      }
      // Heavy dust burst during explosion
      if (now - lastDustSpawn > 25 && dust.length < 500) {
        spawnDust(cx, cy, 8, true); lastDustSpawn = now;
      }
    }

    // ── dust particles ──
    dust = dust.filter(d => d.alpha > 0.01);
    for (const d of dust) {
      d.x += d.vx; d.y += d.vy;
      d.vx *= 0.985; d.vy *= 0.985;
      d.alpha -= d.decay;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${d.hue},${d.sat}%,${d.lum}%,${d.alpha})`;
      ctx.fill();
      // Dust glow for large particles
      if (d.r > 2.5) {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},${d.sat}%,${d.lum}%,${d.alpha * 0.15})`;
        ctx.fill();
      }
    }

    // ── rift phase ──
    if (name === 'rift') {
      const open = Math.sin(Math.min(1, t * 1.2) * Math.PI * 0.5);
      const ringRadius = Math.min(w, h) * (0.07 + open * 0.24);

      // Gravitational lens darkening
      const lens = ctx.createRadialGradient(cx, cy, ringRadius * 0.1, cx, cy, ringRadius * 1.8);
      lens.addColorStop(0,    'rgba(0,0,0,0.97)');
      lens.addColorStop(0.4,  'rgba(5,0,20,0.90)');
      lens.addColorStop(0.62, `rgba(130,30,220,${0.45 + open * 0.3})`);
      lens.addColorStop(0.72, `rgba(0,220,255,${0.5 + open * 0.3})`);
      lens.addColorStop(0.82, `rgba(220,50,180,${0.25 + open * 0.15})`);
      lens.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, ringRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = lens; ctx.fill();

      // Accretion disk rings — full color spectrum
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.38);
      ctx.rotate(now * 0.00014);
      const RIFT_RING_COLORS = [
        `rgba(0,220,255,`,   // cyan
        `rgba(180,50,255,`,  // violet
        `rgba(255,60,180,`,  // magenta
        `rgba(0,180,255,`,   // blue
        `rgba(255,120,220,`, // pink
      ];
      for (let ring = 0; ring < 5; ring++) {
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius * (0.75 + ring * 0.18), 0, Math.PI * 2);
        ctx.strokeStyle = `${RIFT_RING_COLORS[ring]}${0.55 - ring * 0.08})`;
        ctx.lineWidth = 2.5 - ring * 0.3;
        ctx.stroke();
      }
      ctx.restore();
    }

    // ── Ambient center glow — always present after dark ──
    if (name !== 'dark') {
      const glowR = name === 'particle' ? 30
        : name === 'pulse' ? 50
        : 80;
      const glowA = (name === 'boot' || name === 'done') ? 0.18
        : Math.min(t * 0.5, 0.5);
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g2.addColorStop(0,   `rgba(120,40,200,${glowA})`);
      g2.addColorStop(0.4, `rgba(0,180,220,${glowA * 0.4})`);
      g2.addColorStop(0.8, `rgba(180,30,160,${glowA * 0.15})`);
      g2.addColorStop(1,   'rgba(0,0,0,0)');
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
  const canvasRef   = useRef(null);
  const startedAt   = useRef(0);
  const timers      = useRef([]);

  const [showName,       setShowName]       = useState(false);
  const [showRole,       setShowRole]       = useState(false);
  const [showTagline,    setShowTagline]    = useState(false);
  const [showHyperspeed, setShowHyperspeed] = useState(false);
  const [hideHyperspeed, setHideHyperspeed] = useState(false);

  const push = useCallback((fn, delay) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);

  // No exit transition — skipping (or finishing) hands off to the app
  // immediately rather than fading the boot screen out first.
  const skipBoot = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBooted(true);
  }, [setBooted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    startedAt.current = Date.now();
    const observe = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    observe.observe(canvas.parentElement);
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    const stop = startRenderer(canvas, () => Date.now() - startedAt.current);
    return () => { observe.disconnect(); stop(); };
  }, []);

  useEffect(() => {
    push(() => setShowHyperspeed(true), HYPERSPEED_SHOW);
    push(() => setShowName(true),       NAME_SHOW);
    push(() => setShowRole(true),       ROLE_SHOW);
    push(() => setShowTagline(true),    TAGLINE_SHOW);
    push(() => setHideHyperspeed(true), HYPERSPEED_HIDE);
    push(() => setBooted(true),         COMPLETE);
    return () => timers.current.forEach(clearTimeout);
  }, [push, setBooted]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#020108' }}
    >
      {/* ── Canvas ── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* ── Subtle scanline ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 50%, rgba(120,50,255,0.012) 50%)',
          backgroundSize: '100% 4px',
          animation: 'bs-scan 10s linear infinite',
          opacity: 0.3,
        }}
      />

      {showHyperspeed && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          opacity: hideHyperspeed ? 0 : 0.82,
          transition: hideHyperspeed ? 'opacity 1.8s ease' : 'opacity 1s ease',
        }}>
          <CosmicWarp speed={1.4} intensity={0.9} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* ── Corner brackets — 4-color gradient, one per corner ── */}
      {[
        { style: { top: 20, left: 20 },
          bStyle: { borderTop: '1px solid rgba(0,220,255,0.7)', borderLeft: '1px solid rgba(0,220,255,0.7)' } },
        { style: { top: 20, right: 20 },
          bStyle: { borderTop: '1px solid rgba(180,60,255,0.7)', borderRight: '1px solid rgba(180,60,255,0.7)' } },
        { style: { bottom: 20, left: 20 },
          bStyle: { borderBottom: '1px solid rgba(220,50,180,0.7)', borderLeft: '1px solid rgba(220,50,180,0.7)' } },
        { style: { bottom: 20, right: 20 },
          bStyle: { borderBottom: '1px solid rgba(0,200,180,0.7)', borderRight: '1px solid rgba(0,200,180,0.7)' } },
      ].map(({ style, bStyle }, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute', width: 28, height: 28, zIndex: 5,
            opacity: showName ? 0.85 : 0,
            transition: `opacity 1.6s ease ${i * 0.1}s`,
            ...style, ...bStyle,
          }}
        />
      ))}

      {/* ── Identity reveal ── */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {/* IO sigil — draws itself with color */}
        <div
          style={{
            marginBottom: 30,
            opacity: showName ? 1 : 0,
            transform: showName ? 'scale(1)' : 'scale(0.4)',
            transition: 'opacity 1.1s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <defs>
              <linearGradient id="sigil-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#00E5FF" />
                <stop offset="50%"  stopColor="#9944FF" />
                <stop offset="100%" stopColor="#FF30C0" />
              </linearGradient>
            </defs>
            {/* Outer ring — gradient, draws in */}
            <circle
              cx="26" cy="26" r="24"
              stroke="url(#sigil-grad)"
              strokeWidth="1"
              strokeDasharray="150.8"
              strokeDashoffset={showName ? '0' : '150.8'}
              style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)' }}
            />
            {/* Inner ring — violet */}
            <circle
              cx="26" cy="26" r="16"
              stroke="rgba(160,70,255,0.45)"
              strokeWidth="0.6"
              strokeDasharray="100.5"
              strokeDashoffset={showName ? '0' : '100.5'}
              style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s' }}
            />
            {/* Cross hairs — barely visible */}
            <line x1="26" y1="8"  x2="26" y2="44" stroke="rgba(0,220,255,0.15)" strokeWidth="0.4" />
            <line x1="8"  y1="26" x2="44" y2="26" stroke="rgba(0,220,255,0.15)" strokeWidth="0.4" />
            <text
              x="26" y="30"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="10"
              fontWeight="700"
              fill="url(#sigil-grad)"
              fillOpacity={showName ? 1 : 0}
              style={{ transition: 'fill-opacity 0.7s ease 0.9s' }}
            >IO</text>
          </svg>
        </div>

        {/* Name — full gradient, glowing */}
        <h1
          style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(24px, 5.5vw, 52px)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            margin: 0,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #00E5FF 0%, #9944FF 45%, #FF30C0 80%, #00E5FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '300% 100%',
            opacity: showName ? 1 : 0,
            transform: showName ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)',
            filter: showName
              ? 'drop-shadow(0 0 24px rgba(0,220,255,0.5)) drop-shadow(0 0 48px rgba(160,60,255,0.3))'
              : 'none',
            animation: showName ? 'bs-shimmer 6s linear infinite' : 'none',
          }}
        >
          K INISH KUMAR
        </h1>

        {/* Hairline — cyan→violet→magenta */}
        <div
          style={{
            margin: '22px auto 22px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #00E5FF, #9944FF, #FF30C0, transparent)',
            width: showRole ? 'clamp(180px, 28vw, 320px)' : '0px',
            opacity: showRole ? 1 : 0,
            boxShadow: showRole ? '0 0 8px rgba(0,220,255,0.4), 0 0 20px rgba(160,60,255,0.2)' : 'none',
            transition: 'width 1s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease, box-shadow 0.8s ease',
          }}
        />

        {/* Role — cyan */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(8px, 1.4vw, 11px)',
            letterSpacing: '0.44em',
            margin: 0,
            background: 'linear-gradient(90deg, #00E5FF, #9944FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: showRole ? 0.9 : 0,
            transform: showRole ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
            textTransform: 'uppercase',
          }}
        >
          B.Tech CSE &nbsp;·&nbsp; AI &amp; ML
        </p>

        {/* Tagline — violet tint */}
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(6px, 1vw, 8px)',
            letterSpacing: '0.3em',
            color: 'rgba(180,100,255,0.6)',
            margin: '12px 0 0',
            opacity: showTagline ? 1 : 0,
            transform: showTagline ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            textTransform: 'uppercase',
          }}
        >
          NEBULA COMMAND VESSEL &nbsp;·&nbsp; INITIALIZING
        </p>

        {/* Status dot — pulses between cyan and magenta */}
        <div
          style={{
            marginTop: 26,
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: showTagline ? 1 : 0,
            transition: 'opacity 0.7s ease 0.5s',
          }}
        >
          <div
            style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'radial-gradient(circle, #00E5FF, #9944FF)',
              boxShadow: '0 0 8px rgba(0,220,255,0.9), 0 0 20px rgba(160,60,255,0.5)',
              animation: 'bs-blink 1.4s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 7,
              letterSpacing: '0.38em',
              background: 'linear-gradient(90deg, rgba(0,220,255,0.6), rgba(160,60,255,0.5))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
            }}
          >
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* ── Skip ── */}
      <button
        type="button"
        onClick={skipBoot}
        style={{
          position: 'absolute',
          bottom: 'clamp(20px, 4vh, 32px)',
          right: 'clamp(20px, 4vw, 32px)',
          zIndex: 20,
          background: 'none', border: 'none',
          color: 'rgba(160,100,255,0.3)',
          fontFamily: 'monospace',
          fontSize: 8,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '8px 0',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(0,220,255,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,100,255,0.3)'}
      >
        SKIP ›
      </button>

      <style>{`
        @keyframes bs-scan    { to { background-position: 0 100%; } }
        @keyframes bs-blink   { 0%,100% { opacity: 1; } 50% { opacity: 0.1; } }
        @keyframes bs-shimmer {
          0%   { background-position: 0%   center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0%   center; }
        }
      `}</style>
    </div>
  );
}