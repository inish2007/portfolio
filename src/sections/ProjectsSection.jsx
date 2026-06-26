import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ExternalLink, Shield, X, Zap } from 'lucide-react';

const Github = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const MISSIONS = [
  {
    id: '001',
    name: 'BILLING MACHINE SYSTEM',
    category: 'Business Software',
    status: 'Completed',
    statusColor: '#00D4FF',
    brief: 'Developed a comprehensive billing system to streamline business operations and improve transaction management with real-time inventory tracking.',
    tech: ['Python', 'SQL', 'Tkinter'],
    threat: 'LOW',
    github: 'https://github.com/inish2007',
    demo: null,
    year: '2024',
    impact: 'Reduced billing errors by 40%',
  },
  {
    id: '002',
    name: 'SHOP BUSINESS WEBSITE',
    category: 'Web Development',
    status: 'Completed',
    statusColor: '#00D4FF',
    brief: 'Created a professional business website designed to improve online presence, enhance customer engagement, and showcase products effectively.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    threat: 'LOW',
    github: 'https://github.com/inish2007',
    demo: null,
    year: '2024',
    impact: 'Enhanced digital presence for local business',
  },
  {
    id: '003',
    name: 'INISH OS PORTFOLIO',
    category: 'Personal Brand',
    status: 'Active Development',
    statusColor: '#FF4FD8',
    brief: 'Building a futuristic AI-powered portfolio experience combining RPG progression systems, space exploration aesthetics, and advanced holographic UI design.',
    tech: ['React', 'Vite', 'Three.js', 'Framer Motion', 'Tailwind'],
    threat: 'NONE',
    github: 'https://github.com/inish2007',
    demo: null,
    year: '2026',
    impact: 'Differentiates portfolio from standard student sites',
  },
];

function MissionModal({ mission, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-2xl rounded-2xl glass-card p-6 hud-border sm:p-8"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        onClick={(event) => event.stopPropagation()}
        style={{ border: '1px solid rgba(0,212,255,0.4)' }}
      >
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 font-hud text-[10px] font-medium tracking-widest text-cyan-400">
              MISSION // {mission.id} // {mission.category.toUpperCase()}
            </p>
            <h3 className="font-hud text-2xl font-bold text-white sm:text-3xl">{mission.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="self-end rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white sm:self-start"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-7 flex flex-wrap gap-3 sm:gap-4">
          <div className="rounded-full glass-card-purple px-4 py-2">
            <span className="font-hud text-[10px] font-medium tracking-widest" style={{ color: mission.statusColor }}>
              {mission.status.toUpperCase()}
            </span>
          </div>
          <div className="rounded-full border-cyan-400/20 glass-card px-4 py-2">
            <span className="font-hud text-[10px] font-medium tracking-widest text-white/60">YEAR: {mission.year}</span>
          </div>
          <div className="rounded-full border-cyan-400/20 glass-card px-4 py-2">
            <span className="font-hud text-[10px] font-medium tracking-widest text-green-400">THREAT: {mission.threat}</span>
          </div>
        </div>

        <div className="mb-7">
          <p className="mb-3 font-hud text-[10px] font-medium tracking-widest text-cyan-400">MISSION BRIEF</p>
          <p className="border-l-2 border-purple-500/50 pl-5 font-ui text-base leading-relaxed text-white/80 sm:pl-6">
            {mission.brief}
          </p>
        </div>

        <div className="mb-7 rounded-lg glass-card-purple p-4">
          <p className="mb-2 font-hud text-[10px] font-medium tracking-widest text-purple-300">IMPACT</p>
          <p className="font-ui text-base text-white/85">{mission.impact}</p>
        </div>

        <div className="mb-7">
          <p className="mb-4 font-hud text-[10px] font-medium tracking-widest text-cyan-400">TECHNOLOGY DEPLOYED</p>
          <div className="flex flex-wrap gap-3">
            {mission.tech.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-2 font-hud text-[10px] font-medium text-cyan-400"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={mission.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex w-full items-center justify-center gap-2 text-[10px] sm:w-auto"
          >
            <Github size={16} />
            View Repository
          </a>
          {mission.demo && (
            <a
              href={mission.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex w-full items-center justify-center gap-2 text-[10px] sm:w-auto"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedMission, setSelectedMission] = useState(null);

  return (
    <section id="projects" ref={ref} className="section-shell">
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,79,216,0.04) 0%, transparent 70%)' }}
      />

      <div className="section-inner flex w-full flex-col items-center">
        <motion.div
          className="mb-16 w-full text-center lg:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4">MISSION.ARCHIVE.LOAD</p>
          <h2 className="section-header gradient-text">Mission Archive</h2>
          <p className="mt-3 font-ui text-base text-white/60">Classified mission files ready for review.</p>
          <div className="section-sep mt-4" />
        </motion.div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MISSIONS.map((mission, index) => (
            <motion.div
              key={mission.id}
              className="group mission-card cursor-pointer p-7"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              onClick={() => setSelectedMission(mission)}
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-cyan-400/60" />
                  <span className="font-hud text-[9px] font-medium tracking-[0.4em] text-cyan-400/70">
                    MISSION {mission.id}
                  </span>
                </div>
                <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: mission.statusColor }} />
              </div>

              <div
                className="mb-5 h-px opacity-40"
                style={{ background: `linear-gradient(90deg, ${mission.statusColor}, transparent)` }}
              />

              <p className="mb-3 font-hud text-[9px] font-medium tracking-widest text-purple-400">
                [{mission.category.toUpperCase()}]
              </p>
              <h3 className="mb-4 font-hud text-xl font-bold leading-tight text-white transition-colors group-hover:text-cyan-400">
                {mission.name}
              </h3>
              <p className="mb-5 line-clamp-3 font-ui text-sm leading-relaxed text-white/65">
                {mission.brief}
              </p>

              <div className="mb-5 flex flex-wrap gap-2">
                {mission.tech.slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-cyan-400/20 px-3 py-1 font-hud text-[8px] font-medium text-cyan-400/80"
                  >
                    {item}
                  </span>
                ))}
                {mission.tech.length > 3 && (
                  <span className="px-3 py-1 font-hud text-[8px] font-medium text-white/40">
                    +{mission.tech.length - 3}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                <span className="font-hud text-[9px] font-medium tracking-widest" style={{ color: mission.statusColor }}>
                  {mission.status.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 font-hud text-[9px] text-white/40">
                  EXPAND <Zap size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedMission && (
          <MissionModal mission={selectedMission} onClose={() => setSelectedMission(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
