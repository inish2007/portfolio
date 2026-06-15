import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useApp } from '../contexts/useApp';

const NEBULA_MESSAGES = {
  hero: 'Welcome aboard, Commander. You have entered the INISH OS Command Bridge.',
  about: 'AI Memory Core accessed. Displaying K Inish Kumar data profile.',
  skills: 'Skill Matrix synchronized. Energy nodes are active.',
  projects: 'Mission Archive is ready. All classified files unlocked.',
  galaxy: 'Galaxy navigation chart loaded. Tap a waypoint to inspect the journey.',
  achievements: 'Achievement registry online. All medals displayed.',
  contact: 'Communication channels established. Ready to transmit.',
};

const IDLE_MESSAGES = [
  'All systems nominal, Commander.',
  'NEBULA AI is monitoring vessel systems.',
  'The Mission Archive is ready when you are.',
  'Skill Matrix is synchronized and standing by.',
  'Navigation chart is fully operational.',
];

function getInitialPosition() {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  return {
    x: window.innerWidth - 100,
    y: window.innerHeight - 100,
  };
}

export default function NebulaAssistant() {
  const { activeSection, nebulaMessage, nebulaOpen, setNebulaOpen } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [idleIndex, setIdleIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [orbPosition, setOrbPosition] = useState(getInitialPosition);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIdleIndex((value) => (value + 1) % IDLE_MESSAGES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      setOrbPosition({
        x: Math.max(60, Math.min(window.innerWidth - 60, event.clientX - dragStart.current.x)),
        y: Math.max(60, Math.min(window.innerHeight - 60, event.clientY - dragStart.current.y)),
      });
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const message = nebulaOpen && nebulaMessage
    ? nebulaMessage
    : (NEBULA_MESSAGES[activeSection] || IDLE_MESSAGES[idleIndex]);
  const bubbleOpen = nebulaOpen || isExpanded;

  const handleMouseDown = (event) => {
    setDragging(true);
    dragStart.current = {
      x: event.clientX - orbPosition.x,
      y: event.clientY - orbPosition.y,
    };
  };

  const toggleExpand = () => {
    if (nebulaOpen) {
      setNebulaOpen(false);
      return;
    }

    setIsExpanded((value) => !value);
  };

  return (
    <div
      className="fixed z-[9990] hidden select-none sm:block"
      style={{ left: orbPosition.x, top: orbPosition.y, transform: 'translate(-50%, -50%)' }}
    >
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            className="absolute bottom-20 right-0 w-72 rounded-2xl border border-cyan-400/40 glass-card p-4"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-cyan-400" />
                <span className="font-hud text-[9px] tracking-widest text-cyan-400">NEBULA</span>
              </div>
              <button
                onClick={() => {
                  setNebulaOpen(false);
                  setIsExpanded(false);
                }}
                className="text-white/40 transition-colors hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
            <p className="font-ui text-sm leading-relaxed text-white/90">{message}</p>
            <div
              className="absolute bottom-[-8px] right-8 h-4 w-4 border-b border-r border-cyan-400/40"
              style={{
                background: 'rgba(10,10,30,0.9)',
                transform: 'rotate(45deg)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-16 w-16 cursor-grab rounded-full active:cursor-grabbing nebula-orb"
        style={{ background: 'transparent' }}
        onMouseDown={handleMouseDown}
        onClick={toggleExpand}
        whileHover={{ scale: 1.1 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 rounded-full border border-cyan-400/60 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border border-purple-500/50 animate-counter-spin" />
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: 'radial-gradient(circle, #00D4FF, #5A189A, #FF4FD8)' }}
        />
        <div
          className="absolute inset-0 rounded-full animate-nebula"
          style={{ boxShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(90,24,154,0.4)' }}
        />

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap font-hud text-[7px] tracking-widest text-cyan-400">NEBULA</span>
        </div>

        {[0, 60, 120, 180, 240, 300].map((angle, index) => (
          <div
            key={angle}
            className="absolute h-1 w-1 rounded-full bg-cyan-400"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(28px)`,
              opacity: 0.6,
              animation: `orbit ${3 + index * 0.3}s linear infinite`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
