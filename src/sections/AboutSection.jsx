import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, Brain, Code, Cpu, Target, User } from 'lucide-react';

const FOCUSES = [
  { icon: Code, label: 'Web Development', color: '#00D4FF' },
  { icon: Brain, label: 'Artificial Intelligence', color: '#FF4FD8' },
  { icon: Cpu, label: 'Machine Learning', color: '#5A189A' },
  { icon: BookOpen, label: 'Large Language Models', color: '#00D4FF' },
];

const TIMELINE = [
  { year: '2023', event: 'Started B.Tech CSE (AI & ML)', icon: 'EDU' },
  { year: '2024', event: 'Mastered C++ and Python programming', icon: 'C++' },
  { year: '2024', event: 'Built first web projects', icon: 'WEB' },
  { year: '2025', event: 'Deep dive into AI/ML and LLMs', icon: 'AI' },
  { year: '2026', event: 'Launched INISH OS Portfolio', icon: 'OS' },
];

const STATS = [
  { val: '2026', label: 'Expected Graduation' },
  { val: 'AI/ML', label: 'Specialization' },
  { val: 'CSE', label: 'Department' },
  { val: '100%', label: 'Dedication' },
];

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="section-shell relative py-20 overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 30% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)' }}
      />

      <div className="section-inner flex w-full flex-col items-center max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          className="mb-16 w-full text-center sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-5 font-mono text-xs tracking-widest opacity-60">MEMORY.CORE.ACCESS</p>
          <h2 className="section-header text-3xl font-bold text-white mb-2">AI Memory Core</h2>
          <div className="section-sep mt-4 h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />
        </motion.div>

        <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-6 rounded-xl glass-card p-6 border border-white/10 sm:p-8" style={{ background: 'rgba(5, 5, 16, 0.45)' }}>
              <div className="mb-8 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                
                {/* ── Avatar with Framer Motion Auto-Rotation ── */}
                <div className="relative h-20 w-20 flex-shrink-0">
                  {/* Outer Dashed Ring Rotating Clockwise */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border border-dashed border-cyan-400/60"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  />
                  {/* Inner Dotted Ring Rotating Counter-Clockwise */}
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

                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-mono text-[9px] tracking-widest text-green-400 font-bold">
                      IDENTITY VERIFIED
                    </span>
                  </div>
                  <h3 className="break-words font-mono text-2xl font-bold text-white">K Inish Kumar</h3>
                  <p className="break-words text-sm text-cyan-400 font-medium">
                    B.Tech Computer Science Engineering (AI &amp; ML)
                  </p>
                </div>
              </div>

              <div className="mb-10 border-l-4 border-purple-500/60 pl-5 sm:pl-8">
                <p className="mb-5 text-base leading-relaxed text-white/80">
                  An aspiring AI Engineer and full-stack developer with a passion for building intelligent systems that bridge software and reality.
                </p>
                <p className="text-base leading-relaxed text-white/80">
                  Currently pursuing B.Tech in Computer Science Engineering with a specialization in Artificial Intelligence and Machine Learning, combining theoretical knowledge with practical project experience.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {STATS.map((item) => (
                  <div key={item.label} className="rounded-lg border border-purple-500/10 p-3 text-center sm:p-6" style={{ background: 'rgba(90, 24, 154, 0.08)' }}>
                    <p className="font-mono text-2xl font-bold text-cyan-400 sm:text-3xl">{item.val}</p>
                    <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              className="mt-8 rounded-xl border border-purple-500/40 p-6 sm:p-7"
              style={{ background: 'rgba(90, 24, 154, 0.12)' }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(90,24,154,0.15)',
                  '0 0 25px rgba(90,24,154,0.35)',
                  '0 0 10px rgba(90,24,154,0.15)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Target size={18} className="text-pink-400" />
                <span className="font-mono text-[10px] font-bold tracking-widest text-pink-400">
                  MISSION OBJECTIVE
                </span>
              </div>
              <p className="text-base italic leading-relaxed text-white/80 font-medium">
                "To create advanced AI systems capable of assisting humans in real-world environments and develop intelligent technologies that bridge software and reality."
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="mb-10">
              <p className="font-mono text-[11px] tracking-widest font-bold text-white/40 mb-5">CURRENT FOCUS MODULES</p>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                {FOCUSES.map((focus, index) => (
                  <motion.div
                    key={focus.label}
                    className="flex items-center gap-3 rounded-xl border p-5 bg-black/20"
                    style={{ borderColor: `${focus.color}20` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${focus.color}20`, borderColor: `${focus.color}45` }}
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${focus.color}10`, border: `1px solid ${focus.color}30` }}
                    >
                      <focus.icon size={18} style={{ color: focus.color }} />
                    </div>
                    <p className="text-sm font-semibold tracking-wide text-white/85">{focus.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-[11px] tracking-widest font-bold text-white/40 mb-5">JOURNEY LOG</p>
              <div className="relative overflow-hidden pl-2">
                <div className="absolute bottom-4 left-7 top-4 w-[1px] bg-gradient-to-b from-cyan-500 via-cyan-500/40 to-transparent opacity-30" />

                {TIMELINE.map((item, index) => (
                  <motion.div
                    key={`${item.year}-${item.event}`}
                    className="relative mb-5 flex gap-4 sm:gap-6"
                    initial={{ opacity: 0, x: 30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.12 }}
                  >
                    <div
                      className="z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-mono font-bold text-cyan-300 bg-slate-950 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,212,255,0.1)]"
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 rounded-lg border border-white/5 p-4 bg-white/[0.02] hover:border-cyan-500/15 transition-colors">
                      <p className="mb-0.5 font-mono text-[10px] font-bold tracking-widest text-cyan-400">{item.year}</p>
                      <p className="text-sm font-medium text-white/85">{item.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
