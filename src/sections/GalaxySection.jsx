import { useRef, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';

const PLANETS = [
  {
    id: 1,
    label: 'GENESIS',
    name: 'Started Programming',
    year: '2023',
    detail: 'Took first steps into the world of programming, discovering the power of logic and code.',
    size: 60,
    color: '#5A189A',
    glow: 'rgba(90,24,154,0.8)',
    x: 8,
    y: 55,
  },
  {
    id: 2,
    label: 'LAMBDA',
    name: 'Learned C++',
    year: '2023',
    detail: 'Mastered C++ programming fundamentals, diving deep into memory management and OOP concepts.',
    size: 50,
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.8)',
    x: 22,
    y: 32,
  },
  {
    id: 3,
    label: 'NOVA',
    name: 'Built First Website',
    year: '2024',
    detail: 'Created the first web project, a milestone on the path toward full-stack development.',
    size: 65,
    color: '#FF4FD8',
    glow: 'rgba(255,79,216,0.8)',
    x: 36,
    y: 65,
  },
  {
    id: 4,
    label: 'ARCANA',
    name: 'Started AI Journey',
    year: '2024',
    detail: 'Began exploring neural networks, machine learning models, and intelligent systems.',
    size: 75,
    color: '#5A189A',
    glow: 'rgba(90,24,154,0.9)',
    x: 50,
    y: 28,
  },
  {
    id: 5,
    label: 'SIGMA',
    name: 'Built Billing System',
    year: '2024',
    detail: 'Developed a functional billing machine system using Python and SQL for real business use.',
    size: 55,
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.8)',
    x: 64,
    y: 60,
  },
  {
    id: 6,
    label: 'HERALD',
    name: 'Created Business Website',
    year: '2024',
    detail: 'Delivered a professional shop website that blended design aesthetics with technical implementation.',
    size: 58,
    color: '#FF4FD8',
    glow: 'rgba(255,79,216,0.8)',
    x: 78,
    y: 30,
  },
  {
    id: 7,
    label: 'INISH-OS',
    name: 'Launching INISH OS',
    year: '2026',
    detail: 'Built a futuristic AI-powered portfolio that works as both a showcase and a command vessel.',
    size: 60,
    color: '#5A189A',
    glow: 'rgba(90,24,154,1)',
    x: 92,
    y: 58,
  },
];

// Canvas-based connector lines — drawn in the same CSS pixel space as the planet divs
function GalaxyCanvas({ containerRef, planets, inView }) {
  const canvasRef = useRef(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !inView) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    ctx.setLineDash([6, 8]);
    ctx.lineWidth = 1;

    for (let i = 0; i < planets.length - 1; i++) {
      const a = planets[i];
      const b = planets[i + 1];
      const ax = (a.x / 100) * width;
      const ay = (a.y / 100) * height;
      const bx = (b.x / 100) * width;
      const by = (b.y / 100) * height;

      // Draw line segment with a subtle gradient along it
      const grad = ctx.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0, a.color + '44');
      grad.addColorStop(1, b.color + '44');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Draw glow dots at each planet center
    planets.forEach((p) => {
      const px = (p.x / 100) * width;
      const py = (p.y / 100) * height;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color + 'aa';
      ctx.fill();
    });
  }, [containerRef, inView, planets]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      drawCanvas();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, drawCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default function GalaxySection() {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [active, setActive] = useState(null);
  const activePlanet = PLANETS.find((planet) => planet.id === active);

  return (
    <section id="galaxy" ref={ref} className="section-shell relative py-12 select-none">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 50%, rgba(90,24,154,0.08) 0%, transparent 80%)',
        }}
      />

      <div className="section-inner flex w-full flex-col items-center max-w-6xl mx-auto px-4">
        {/* ── Heading ── */}
        <motion.div
          className="mb-12 w-full text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4 tracking-widest text-xs opacity-60 font-mono">GALAXY.NAV.CHART</p>
          <h2 className="section-header text-3xl font-bold text-white mb-2 tracking-wide">Galaxy Journey</h2>
          <p className="font-ui text-white/50 text-sm">Explore milestones through the timeline map.</p>
          <div className="section-sep mt-4 h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />
        </motion.div>

        {/* ── Mobile card list ── */}
        <div className="grid w-full gap-4 sm:hidden">
          {PLANETS.map((planet, index) => (
            <motion.button
              key={planet.id}
              type="button"
              className="flex w-full items-start gap-4 rounded-xl glass-card p-4 text-left border transition-all duration-300"
              style={{
                borderColor: active === planet.id ? `${planet.color}a0` : 'rgba(0,212,255,0.15)',
                boxShadow: active === planet.id ? `0 0 25px ${planet.glow}` : 'none',
                background: 'rgba(5, 5, 16, 0.75)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.08 }}
              onClick={() => setActive(active === planet.id ? null : planet.id)}
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold text-white relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${planet.color}aa, ${planet.color}55, #050510)`,
                  borderColor: `${planet.color}80`,
                  boxShadow: `0 0 15px ${planet.glow}`,
                }}
              >
                {String(planet.id).padStart(2, '0')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 font-mono text-[9px] tracking-widest font-semibold" style={{ color: planet.color }}>
                  {planet.label} // {planet.year}
                </p>
                <h3 className="text-base font-bold text-white font-mono">{planet.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{planet.detail}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Desktop galaxy map ── */}
        <div
          ref={mapRef}
          className="relative mb-12 hidden h-[420px] w-full rounded-2xl sm:block"
          style={{
            border: '1px solid rgba(0,212,255,0.15)',
            background: 'rgba(4, 4, 12, 0.45)',
            overflow: 'visible',
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10 rounded-2xl pointer-events-none"
            style={{ 
              overflow: 'hidden',
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.15) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />

          <GalaxyCanvas containerRef={mapRef} planets={PLANETS} inView={inView} />

          {/* Planet spheres */}
          {PLANETS.map((planet, index) => {
            const isCurrentlyActive = active === planet.id;
            return (
              <motion.div
                key={planet.id}
                className="absolute"
                style={{
                  left: `${planet.x}%`,
                  top: `${planet.y}%`,
                  width: planet.size,
                  height: planet.size,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isCurrentlyActive ? 10 : 2,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 + 0.15, type: 'spring', stiffness: 100 }}
              >
                {/* HIGH INTENSITY ATMOSPHERIC GLOW LAYER */}
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    boxShadow: isCurrentlyActive 
                      ? `0 0 35px 8px ${planet.glow}, 0 0 60px 20px ${planet.color}40, inset 0 0 15px rgba(255,255,255,0.2)`
                      : `0 0 20px 2px ${planet.glow}b0`,
                    filter: 'blur(1px)'
                  }}
                />

                {/* INTERACTIVE ROTATING BODY */}
                <motion.div
                  className="w-full h-full rounded-full cursor-pointer border relative flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${planet.color}e8 0%, ${planet.color}60 45%, #03030a 90%)`,
                    borderColor: isCurrentlyActive ? '#ffffff' : `${planet.color}cc`,
                  }}
                  onClick={() => setActive(isCurrentlyActive ? null : planet.id)}
                  whileHover={{ scale: 1.12, boxShadow: `0 0 30px 5px ${planet.color}` }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 25 + (index * 5), ease: 'linear' }}
                >
                  {/* Internal counter-rotated text to prevent numbers spinning upside down */}
                  <motion.span
                    className="font-mono font-black text-white select-none relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ fontSize: planet.size * 0.26 }}
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 25 + (index * 5), ease: 'linear' }}
                  >
                    {String(planet.id).padStart(2, '0')}
                  </motion.span>
                </motion.div>

                {/* STATIC TIMELINE HUD LABELS */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none"
                  style={{ bottom: -(planet.size * 0.18 + 14) }}
                >
                  <span
                    className="font-mono text-[9px] tracking-widest block font-bold transition-colors duration-300"
                    style={{ 
                      color: isCurrentlyActive ? '#ffffff' : planet.color,
                      textShadow: isCurrentlyActive ? `0 0 8px ${planet.color}` : 'none'
                    }}
                  >
                    {planet.label}
                  </span>
                </div>

                {/* SPINNING ORBITAL HUD RING */}
                <AnimatePresence>
                  {isCurrentlyActive && (
                    <motion.div
                      className="absolute rounded-full border border-dashed pointer-events-none"
                      style={{
                        inset: -12,
                        borderColor: `${planet.color}`,
                        borderWidth: '1.5px',
                        boxShadow: `0 0 12px ${planet.color}40`
                      }}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: -360 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ 
                        rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
                        default: { duration: 0.2 }
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* HUD Frame Borders */}
          <div className="absolute left-6 top-5 pointer-events-none font-mono">
            <p className="text-[9px] tracking-widest text-cyan-400/80 font-bold">GALAXY NAVIGATION CHART</p>
            <p className="text-[8px] tracking-wider text-white/30 mt-0.5">7 WAYPOINTS DETECTED</p>
          </div>
          <div className="absolute right-6 top-5 text-right pointer-events-none font-mono">
            <p className="text-[9px] tracking-widest text-purple-400/80 font-bold">SECTOR: NEBULA-7</p>
          </div>
        </div>

        {/* ── Dynamic Details Output Box ── */}
        <div className="w-full h-32 hidden sm:block">
          <AnimatePresence mode="wait">
            {activePlanet && (
              <motion.div
                key={activePlanet.id}
                className="w-full rounded-xl p-5 border sm:p-6"
                style={{ 
                  borderColor: `${activePlanet.color}60`,
                  background: 'rgba(5, 5, 16, 0.85)',
                  boxShadow: `0 10px 40px -10px ${activePlanet.color}30`
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-5">
                  <div
                    className="h-12 w-12 flex-shrink-0 rounded-full relative"
                    style={{
                      background: `radial-gradient(circle, ${activePlanet.color}ee, ${activePlanet.color}44)`,
                      boxShadow: `0 0 25px ${activePlanet.glow}`,
                      border: `1px solid ${activePlanet.color}`,
                    }}
                  />
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2 sm:gap-3 font-mono">
                      <span className="text-[10px] tracking-widest font-bold" style={{ color: activePlanet.color }}>
                        WAYPOINT {String(activePlanet.id).padStart(2, '0')} // {activePlanet.label}
                      </span>
                      <span className="text-[10px] text-white/40">{activePlanet.year}</span>
                    </div>
                    <h3 className="mb-1 font-bold text-white text-lg sm:text-xl font-mono">{activePlanet.name}</h3>
                    <p className="text-sm leading-relaxed text-white/70">{activePlanet.detail}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
