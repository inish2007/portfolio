import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const SKILLS = [
  { name: 'Python', level: 4, xp: 85, category: 'Programming', color: '#00D4FF', status: 'mastered' },
  { name: 'C++', level: 4, xp: 80, category: 'Programming', color: '#5A189A', status: 'mastered' },
  { name: 'SQL', level: 3, xp: 65, category: 'Programming', color: '#FF4FD8', status: 'proficient' },
  { name: 'HTML', level: 4, xp: 90, category: 'Web Dev', color: '#00D4FF', status: 'mastered' },
  { name: 'CSS', level: 4, xp: 85, category: 'Web Dev', color: '#5A189A', status: 'mastered' },
  { name: 'JavaScript', level: 3, xp: 70, category: 'Web Dev', color: '#FF4FD8', status: 'proficient' },
  { name: 'React', level: 2, xp: 40, category: 'Learning', color: '#00D4FF', status: 'learning' },
  { name: 'Node.js', level: 1, xp: 25, category: 'Learning', color: '#5A189A', status: 'learning' },
  { name: 'LLMs', level: 2, xp: 35, category: 'Learning', color: '#FF4FD8', status: 'learning' },
];

const CATEGORY_CONFIG = {
  Programming: { icon: 'PRG', color: '#00D4FF', glow: 'rgba(0,212,255,0.3)' },
  'Web Dev': { icon: 'WEB', color: '#5A189A', glow: 'rgba(90,24,154,0.4)' },
  Learning: { icon: 'NEW', color: '#FF4FD8', glow: 'rgba(255,79,216,0.3)' },
};

const STATUS_COLORS = {
  mastered: '#00D4FF',
  proficient: '#5A189A',
  learning: '#FF4FD8',
};

function SkillNode({ skill, index, inView }) {
  const [hovered, setHovered] = useState(false);
  const config = CATEGORY_CONFIG[skill.category];
  const stars = Array.from({ length: 5 }, (_, value) => value < skill.level);

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl glass-card p-6 skill-node"
      style={{
        borderColor: hovered ? `${config.color}60` : 'rgba(0,212,255,0.15)',
        boxShadow: hovered ? `0 0 30px ${config.glow}` : 'none',
      }}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute left-0 right-0 top-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
          opacity: hovered ? 1 : 0.3,
        }}
      />

      {hovered && (
        <>
          <motion.div
            className="absolute left-0 top-0 h-px w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${config.color}80, transparent)` }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute left-0 top-0 h-full w-px"
            style={{ background: `linear-gradient(180deg, transparent, ${config.color}80, transparent)` }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-hud text-[9px] font-medium tracking-widest" style={{ color: config.color }}>
            {config.icon} {skill.category.toUpperCase()}
          </p>
          <h3 className="font-hud text-xl font-bold text-white">{skill.name}</h3>
        </div>

        <span
          className="rounded-full border px-3 py-1 font-hud text-[10px] font-medium"
          style={{
            color: STATUS_COLORS[skill.status],
            borderColor: `${STATUS_COLORS[skill.status]}40`,
            background: `${STATUS_COLORS[skill.status]}10`,
          }}
        >
          {skill.status === 'learning' ? 'LEARNING' : `LVL ${skill.level}`}
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        {stars.map((filled, value) => (
          <div
            key={value}
            className="h-4 w-4 rotate-45 transition-all duration-300"
            style={{
              background: filled ? config.color : 'transparent',
              border: `1.5px solid ${config.color}60`,
              boxShadow: filled && hovered ? `0 0 6px ${config.color}` : 'none',
            }}
          />
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-hud text-[9px] font-medium tracking-widest text-white/50">XP</span>
          <span className="font-hud text-[9px] font-medium tracking-widest" style={{ color: config.color }}>
            {skill.xp}/100
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${config.color}, ${config.color === '#00D4FF' ? '#5A189A' : '#00D4FF'})`,
            }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${skill.xp}%` } : { width: 0 }}
            transition={{ delay: index * 0.1 + 0.5, duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function SkillsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const categories = ['Programming', 'Web Dev', 'Learning'];

  return (
    <section id="skills" ref={ref} className="section-shell">
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(90,24,154,0.08) 0%, transparent 70%)' }}
      />

      <div className="section-inner flex w-full flex-col items-center">
        <motion.div
          className="mb-16 w-full text-center lg:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4">SKILL.MATRIX.SYNC</p>
          <h2 className="section-header gradient-text">Skill Matrix</h2>
          <p className="mx-auto mt-2 max-w-md font-ui text-white/50">
          
          </p>
          <div className="section-sep mt-4" />
        </motion.div>

        {categories.map((category, groupIndex) => (
          <div key={category} className="mb-10 w-full sm:mb-12">
            <motion.div
              className="mb-6 flex items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: groupIndex * 0.2 }}
            >
              <span className="font-hud text-sm text-white/80 sm:text-xl">{CATEGORY_CONFIG[category].icon}</span>
              <div>
                <p className="font-hud text-sm font-bold tracking-widest" style={{ color: CATEGORY_CONFIG[category].color }}>
                  {category.toUpperCase()}
                </p>
                <p className="font-hud text-[8px] tracking-widest text-white/30">
                  {category === 'Learning' ? 'CURRENTLY UNLOCKING' : 'SKILL CLUSTER'}
                </p>
              </div>
              <div
                className="h-px flex-1"
                style={{ background: `linear-gradient(90deg, ${CATEGORY_CONFIG[category].color}60, transparent)` }}
              />
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SKILLS.filter((skill) => skill.category === category).map((skill, index) => (
                <SkillNode
                  key={skill.name}
                  skill={skill}
                  index={index + groupIndex * 3}
                  inView={inView}
                />
              ))}
            </div>
          </div>
        ))}

        <motion.div
          className="mt-6 flex w-full max-w-4xl flex-col items-start gap-3 rounded-xl glass-card p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          {[
            { color: '#00D4FF', label: 'Mastered' },
            { color: '#5A189A', label: 'Proficient' },
            { color: '#FF4FD8', label: 'Learning' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              <span className="font-hud text-[9px] tracking-widest text-white/60">{item.label.toUpperCase()}</span>
            </div>
          ))}
          <div className="hidden h-5 w-px bg-white/10 sm:block" />
          <p className="font-hud text-[9px] tracking-widest text-white/40">HOVER NODES TO ACTIVATE ENERGY FLOWS</p>
        </motion.div>
      </div>
    </section>
  );
}
