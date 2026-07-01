import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { BookOpen, Brain, Code, Cpu, Target, User } from 'lucide-react';

/* ── Magnetic card hook ──────────────────────────────────────────────────── */
function useMagnet({ strength = 10, scale = 1.02 } = {}) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useSpring(0, { stiffness: 160, damping: 18, mass: 0.6 });
  const rawY = useSpring(0, { stiffness: 160, damping: 18, mass: 0.6 });

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rawX.set(dx * strength);
    rawY.set(dy * strength);
  }, [rawX, rawY, strength]);

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  }, [rawX, rawY]);

  const onMouseEnter = useCallback(() => setHovered(true), []);

  return { ref, hovered, rawX, rawY, scale, onMouseMove, onMouseLeave, onMouseEnter };
}

/* ── Reusable magnetic wrapper ───────────────────────────────────────────── */
function Magnet({ children, strength = 9, scale = 1.018, className, style, onClick }) {
  const { ref, hovered, rawX, rawY, onMouseMove, onMouseLeave, onMouseEnter } = useMagnet({ strength, scale });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, x: rawX, y: rawY }}
      animate={{ scale: hovered ? scale : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ────────────────────────────────────────────────────────────────── */
const FOCUSES = [
  { icon: Code,     label: 'Web Development',       color: '#00D4FF' },
  { icon: Brain,    label: 'Artificial Intelligence', color: '#FF4FD8' },
  { icon: Cpu,      label: 'Machine Learning',       color: '#5A189A' },
  { icon: BookOpen, label: 'Large Language Models',  color: '#00D4FF' },
];

const TIMELINE = [
  { year: '2023', event: 'Started B.Tech CSE (AI & ML)',          icon: 'EDU' },
  { year: '2024', event: 'Mastered C++ and Python programming',   icon: 'C++' },
  { year: '2024', event: 'Built first web projects',              icon: 'WEB' },
  { year: '2025', event: 'Deep dive into AI/ML and LLMs',         icon: 'AI'  },
  { year: '2026', event: 'Launched INISH OS Portfolio',           icon: 'OS'  },
];

const STATS = [
  { val: '2026',  label: 'Expected Graduation' },
  { val: 'AI/ML', label: 'Specialization'      },
  { val: 'CSE',   label: 'Department'          },
  { val: '100%',  label: 'Dedication'          },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export default function AboutSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="section-shell relative overflow-hidden py-20">
      {/* ambient bg glow — unchanged */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 30% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)' }}
      />

      <div className="section-inner relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4">

        {/* ── Section heading ─────────────────────────────────────────────── */}
        <motion.div
          className="mb-16 w-full text-center sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-3 font-mono text-[10px] tracking-[0.35em] opacity-55">
            MEMORY.CORE.ACCESS
          </p>
          <h2 className="section-header mb-1 text-3xl font-bold text-white">About Me</h2>
          <p className="mx-auto mt-2 max-w-sm font-ui text-sm leading-relaxed text-white/50">
            Identity profile &amp; engineering background
          </p>
          <div className="section-sep mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </motion.div>

        <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >

            {/* Identity card — magnetic */}
            <Magnet
              strength={8}
              scale={1.015}
              className="mb-6 cursor-default rounded-xl border border-white/10 glass-card p-6 sm:p-8"
              style={{ background: 'rgba(5, 5, 16, 0.45)', willChange: 'transform' }}
            >
              {/* Avatar + name row */}
              <div className="mb-8 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">

                {/* Rotating avatar */}
                <div className="relative h-20 w-20 flex-shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-dashed border-cyan-400/60"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border border-dotted border-purple-500/50"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                  />
                  <div
                    className="absolute inset-3 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(0,212,255,0.25)]"
                    style={{ background: 'linear-gradient(135deg, #5A189A, #00D4FF)' }}
                  >
                    <User size={20} className="text-white" />
                  </div>
                </div>

                {/* Name & role */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold tracking-[0.28em] text-green-400">
                      IDENTITY VERIFIED
                    </span>
                  </div>
                  {/* Hierarchy: name is the primary element */}
                  <h3 className="break-words font-mono text-[1.55rem] font-bold leading-tight text-white">
                    K Inish Kumar
                  </h3>
                  <p className="mt-1 break-words text-sm font-medium leading-snug text-cyan-400">
                    B.Tech Computer Science Engineering (AI&nbsp;&amp;&nbsp;ML)
                  </p>
                </div>
              </div>

              {/* Bio paragraphs */}
              <div className="mb-10 border-l-4 border-purple-500/60 pl-5 sm:pl-7">
                <p className="mb-4 text-[0.9375rem] leading-[1.75] text-white/82">
                  An aspiring AI Engineer and full-stack developer with a passion for building
                  intelligent systems that bridge software and reality.
                </p>
                <p className="text-[0.9375rem] leading-[1.75] text-white/75">
                  Currently pursuing B.Tech in Computer Science Engineering with a specialization
                  in Artificial Intelligence and Machine Learning, combining theoretical knowledge
                  with practical project experience.
                </p>
              </div>

              {/* Stats grid — each cell is its own magnet */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {STATS.map((item) => (
                  <Magnet
                    key={item.label}
                    strength={6}
                    scale={1.03}
                    className="cursor-default rounded-lg border border-purple-500/10 p-3 text-center sm:p-5"
                    style={{ background: 'rgba(90, 24, 154, 0.10)' }}
                  >
                    <p className="font-mono text-xl font-bold text-cyan-400 sm:text-2xl">{item.val}</p>
                    <p className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white/55">
                      {item.label}
                    </p>
                  </Magnet>
                ))}
              </div>
            </Magnet>

            {/* Mission card — magnetic */}
            <Magnet
              strength={7}
              scale={1.015}
              className="mt-6 cursor-default rounded-xl border border-purple-500/40 p-6 sm:p-7"
              style={{ background: 'rgba(90, 24, 154, 0.12)', willChange: 'transform' }}
            >
              {/* Inner animated glow stays as a pseudo-element via the motion.div */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(90,24,154,0.15)',
                    '0 0 25px rgba(90,24,154,0.35)',
                    '0 0 10px rgba(90,24,154,0.15)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2.5">
                  <Target size={17} className="text-pink-400" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.28em] text-pink-400">
                    CAREER OBJECTIVE
                  </span>
                </div>
                <p className="text-[0.9375rem] font-medium italic leading-[1.75] text-white/82">
                  "To create advanced AI systems capable of assisting humans in real-world
                  environments and develop intelligent technologies that bridge software and
                  reality."
                </p>
              </div>
            </Magnet>
          </motion.div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >

            {/* Focus modules */}
            <div className="mb-10">
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/38">
                Active Focus Areas
              </p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {FOCUSES.map((focus, index) => (
                  <Magnet
                    key={focus.label}
                    strength={8}
                    scale={1.025}
                    className="cursor-default"
                  >
                    <motion.div
                      className="flex items-center gap-3 rounded-xl border bg-black/20 p-4"
                      style={{ borderColor: `${focus.color}20` }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{
                        boxShadow: `0 0 22px ${focus.color}25`,
                        borderColor: `${focus.color}50`,
                      }}
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${focus.color}0f`, border: `1px solid ${focus.color}30` }}
                      >
                        <focus.icon size={17} style={{ color: focus.color }} />
                      </div>
                      <p className="text-[0.8125rem] font-semibold leading-snug tracking-wide text-white/88">
                        {focus.label}
                      </p>
                    </motion.div>
                  </Magnet>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/38">
                Engineering Journey
              </p>
              <div className="relative overflow-hidden pl-2">
                {/* vertical connector line */}
                <div className="absolute bottom-4 left-7 top-4 w-px bg-gradient-to-b from-cyan-500 via-cyan-500/40 to-transparent opacity-30" />

                {TIMELINE.map((item, index) => (
                  <Magnet
                    key={`${item.year}-${item.event}`}
                    strength={6}
                    scale={1.018}
                    className="mb-4 cursor-default"
                  >
                    <motion.div
                      className="relative flex gap-4 sm:gap-5"
                      initial={{ opacity: 0, x: 30 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + index * 0.12 }}
                    >
                      {/* Year icon node */}
                      <div className="z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-slate-950 font-mono text-[9px] font-bold text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.10)]">
                        {item.icon}
                      </div>

                      {/* Entry card */}
                      <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-cyan-500/20">
                        <p className="mb-1 font-mono text-[10px] font-bold tracking-[0.22em] text-cyan-400">
                          {item.year}
                        </p>
                        <p className="text-[0.8125rem] font-medium leading-snug text-white/85">
                          {item.event}
                        </p>
                      </div>
                    </motion.div>
                  </Magnet>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}