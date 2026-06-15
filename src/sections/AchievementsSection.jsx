import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const ACHIEVEMENTS = [
  { id: 1, icon: 'WEB', title: 'First Website', desc: 'Successfully launched first web project', color: '#00D4FF', unlocked: true, year: '2024' },
  { id: 2, icon: 'PY', title: 'Python Developer', desc: 'Achieved proficiency in Python programming', color: '#5A189A', unlocked: true, year: '2024' },
  { id: 3, icon: 'C++', title: 'C++ Explorer', desc: 'Mastered C++ and object-oriented programming', color: '#FF4FD8', unlocked: true, year: '2023' },
  { id: 4, icon: 'SQL', title: 'SQL Operator', desc: 'Developed database management skills', color: '#00D4FF', unlocked: true, year: '2024' },
  { id: 5, icon: 'AI', title: 'AI Enthusiast', desc: 'Began journey into Artificial Intelligence', color: '#5A189A', unlocked: true, year: '2024' },
  { id: 6, icon: 'OS', title: 'Portfolio Architect', desc: 'Designed and built INISH OS portfolio', color: '#FF4FD8', unlocked: true, year: '2026' },
  { id: 7, icon: 'BIZ', title: 'Business Builder', desc: 'Delivered real-world business software', color: '#00D4FF', unlocked: true, year: '2024' },
  { id: 8, icon: 'LLM', title: 'LLM Pioneer', desc: 'Exploring the frontier of language models', color: '#5A189A', unlocked: false, year: 'TBD' },
];

const TECHS = [
  { name: 'HTML', icon: 'HTML', color: '#e34c26', category: 'Current' },
  { name: 'CSS', icon: 'CSS', color: '#1572B6', category: 'Current' },
  { name: 'JavaScript', icon: 'JS', color: '#F7DF1E', category: 'Current' },
  { name: 'Python', icon: 'PY', color: '#3776AB', category: 'Current' },
  { name: 'C++', icon: 'C++', color: '#00599C', category: 'Current' },
  { name: 'SQL', icon: 'SQL', color: '#336791', category: 'Current' },
  { name: 'React', icon: 'RE', color: '#61DAFB', category: 'Learning' },
  { name: 'Node.js', icon: 'ND', color: '#339933', category: 'Learning' },
  { name: 'LLM Eng.', icon: 'LLM', color: '#FF4FD8', category: 'Learning' },
];

function Badge({ achievement, index, inView }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative cursor-default overflow-hidden rounded-xl achievement-badge p-5 text-center"
      style={{ opacity: achievement.unlocked ? 1 : 0.5 }}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={inView ? { opacity: achievement.unlocked ? 1 : 0.5, scale: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      {hovered && achievement.unlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.8 }}
          style={{ background: `radial-gradient(circle, ${achievement.color}30, transparent)` }}
        />
      )}

      {!achievement.unlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
          <span className="font-hud text-sm tracking-widest text-white/70">LOCKED</span>
        </div>
      )}

      <div className="relative mb-3">
        <motion.div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full font-hud text-xs font-bold text-white"
          style={{
            background: `radial-gradient(circle, ${achievement.color}20, transparent)`,
            border: `1px solid ${achievement.color}40`,
            boxShadow: hovered && achievement.unlocked ? `0 0 25px ${achievement.color}50` : 'none',
          }}
          animate={hovered && achievement.unlocked ? { rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {achievement.icon}
        </motion.div>

        {achievement.unlocked && (
          <div
            className="absolute inset-0 m-auto rounded-full"
            style={{
              width: 56,
              height: 56,
              border: `1px solid ${achievement.color}30`,
              animation: 'spin-slow 8s linear infinite',
              transformOrigin: 'center',
            }}
          />
        )}
      </div>

      <h3 className="mb-1 font-hud text-sm font-bold text-white">{achievement.title}</h3>
      <p className="mb-3 font-ui text-xs leading-tight text-white/50">{achievement.desc}</p>

      <div className="flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: achievement.color, boxShadow: `0 0 5px ${achievement.color}` }} />
        <span className="font-hud text-[8px] tracking-widest" style={{ color: achievement.color }}>
          {achievement.unlocked ? `UNLOCKED ${achievement.year}` : 'LOCKED'}
        </span>
      </div>
    </motion.div>
  );
}

function TechDisplay({ inView }) {
  return (
    <div className="mt-20 w-full">
      <motion.div
        className="mb-10 text-center sm:mb-12"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
      >
        <p className="section-label mb-3">TECH.MODULES.ACTIVE</p>
        <h3 className="font-hud text-2xl font-bold gradient-text">Technology Display</h3>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {TECHS.map((tech, index) => (
          <motion.div
            key={tech.name}
            className="flex w-full flex-col items-center gap-2 rounded-xl tech-module px-4 py-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.07 }}
          >
            <span className="font-hud text-xs font-bold" style={{ color: tech.color }}>{tech.icon}</span>
            <p className="font-hud text-xs font-bold text-white">{tech.name}</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: tech.color }} />
              <span
                className="font-hud text-[7px] tracking-widest"
                style={{ color: tech.color === '#F7DF1E' ? '#bab000' : tech.color, opacity: 0.8 }}
              >
                {tech.category === 'Learning' ? 'IN PROGRESS' : 'ACTIVE'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AchievementsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="achievements" ref={ref} className="section-shell">
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,79,216,0.05) 0%, transparent 70%)' }}
      />

      <div className="section-inner flex w-full flex-col items-center">
        <motion.div
          className="mb-16 w-full text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4">ACHIEVEMENT.REGISTRY</p>
          <h2 className="section-header gradient-text">Achievements</h2>
          <p className="mt-2 font-ui text-white/50">Unlocked milestones from the journey so far.</p>
          <div className="section-sep mt-4" />
        </motion.div>

        <div className="mb-6 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((achievement, index) => (
            <Badge key={achievement.id} achievement={achievement} index={index} inView={inView} />
          ))}
        </div>

        <motion.div
          className="rounded-xl glass-card p-4 text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
        >
          <p className="font-hud text-[9px] tracking-widest text-white/40">
            7 OF 8 ACHIEVEMENTS UNLOCKED // MORE COMING AS THE JOURNEY CONTINUES
          </p>
        </motion.div>

        <TechDisplay inView={inView} />
      </div>
    </section>
  );
}
