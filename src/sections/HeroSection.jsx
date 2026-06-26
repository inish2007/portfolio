import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Torus, Trail, Sparkles, Html } from '@react-three/drei';
import { ChevronRight, Download, Eye, Mail } from 'lucide-react';
import * as THREE from 'three';
import { useApp } from '../contexts/useApp';

const HERO_TEXTS = ['Future AI Engineer', 'Full-Stack Developer', 'Problem Solver', 'ML Enthusiast'];

const SKILLS = [
  { name: 'React', color: '#00D4FF', level: 85, radius: 1.7, speed: 0.6, tiltX: Math.PI / 2.1, tiltZ: 0 },
  { name: 'Python', color: '#FF4FD8', level: 90, radius: 2.15, speed: -0.45, tiltX: Math.PI / 3.2, tiltZ: 0.4 },
  { name: 'ML/AI', color: '#A78BFA', level: 80, radius: 1.35, speed: 0.8, tiltX: Math.PI / 2.5, tiltZ: 0 },
];

const LOG_MESSAGES = [
  'Initializing neural weights...',
  'Syncing skill matrix...',
  'Calibrating orbit nodes...',
  'Loading mission archive...',
  'Connection stable: 100%',
  'Rendering AI core geometry...',
  'Nebula link established.',
  'Scanning command bridge...',
];

function createSeededRandom(seed = 1337) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createInnerStarPositions() {
  const random = createSeededRandom();
  const positions = [];
  for (let i = 0; i < 80; i++) {
    const r = 2.6 + random() * 0.8;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
  }
  return new Float32Array(positions);
}

/* ---------------- 3D CORE ---------------- */

function OrbitNode({ skill, onSelect, isSelected, pausedAngle }) {
  const ref = useRef();
  const angleRef = useRef(skill.radius);

  useFrame((state) => {
    const t = isSelected && pausedAngle != null
      ? pausedAngle
      : state.clock.getElapsedTime() * skill.speed;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * skill.radius, 0, Math.sin(t) * skill.radius);
      angleRef.current = t;
    }
  });

  return (
    <group rotation={[skill.tiltX, 0, skill.tiltZ]}>
      <Trail width={2} length={5} color={skill.color} attenuation={(t) => t * t}>
        <mesh
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(skill, angleRef.current);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'default')}
        >
          <sphereGeometry args={[isSelected ? 0.09 : 0.06, 16, 16]} />
          <meshBasicMaterial color={skill.color} toneMapped={false} />
          {isSelected && (
            <Html center distanceFactor={6}>
              <div className="rounded-lg border px-3 py-2 text-xs font-hud backdrop-blur-md whitespace-nowrap"
                style={{ borderColor: skill.color, background: 'rgba(10,10,20,0.8)', color: skill.color }}>
                <p className="font-bold mb-1">{skill.name}</p>
                <div className="h-1 w-24 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${skill.level}%`, background: skill.color }} />
                </div>
              </div>
            </Html>
          )}
        </mesh>
      </Trail>
    </group>
  );
}

function AICore({ selectedSkill, setSelectedSkill, mouse }) {
  const groupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const coreGlowRef = useRef();
  const [pausedAngles, setPausedAngles] = useState({});
  const innerStars = useMemo(() => createInnerStarPositions(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      const targetX = mouse.current.y * 0.25;
      const targetZ = -mouse.current.x * 0.25;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.04;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.35;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.25;
    if (coreGlowRef.current) coreGlowRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
  });

  const handleSelect = (skill, angle) => {
    if (selectedSkill?.name === skill.name) {
      setSelectedSkill(null);
    } else {
      setPausedAngles((p) => ({ ...p, [skill.name]: angle }));
      setSelectedSkill(skill);
    }
  };

  return (
    <group ref={groupRef}>
      <mesh ref={coreGlowRef}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <Sphere args={[1, 96, 96]}>
        <MeshDistortMaterial
          color="#5A189A"
          distort={0.45}
          speed={1.8}
          roughness={0.15}
          metalness={0.9}
          emissive="#00D4FF"
          emissiveIntensity={0.35}
        />
      </Sphere>
      <mesh>
        <sphereGeometry args={[1.08, 24, 24]} />
        <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.15} />
      </mesh>
      <Torus ref={ring1Ref} args={[1.7, 0.015, 16, 120]} rotation={[Math.PI / 2.1, 0, 0]}>
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.5} />
      </Torus>
      <Torus ref={ring2Ref} args={[2.15, 0.012, 16, 120]} rotation={[Math.PI / 3.2, 0.4, 0]}>
        <meshBasicMaterial color="#FF4FD8" transparent opacity={0.4} />
      </Torus>
      <Torus ref={ring3Ref} args={[1.35, 0.01, 16, 120]} rotation={[0, Math.PI / 2.5, Math.PI / 6]}>
        <meshBasicMaterial color="#5A189A" transparent opacity={0.5} />
      </Torus>
      {SKILLS.map((skill) => (
        <OrbitNode
          key={skill.name}
          skill={skill}
          onSelect={handleSelect}
          isSelected={selectedSkill?.name === skill.name}
          pausedAngle={pausedAngles[skill.name]}
        />
      ))}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[innerStars, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#00D4FF" size={0.025} transparent opacity={0.5} sizeAttenuation />
      </points>
      <Sparkles count={40} scale={4} size={2} speed={0.3} color="#FF4FD8" opacity={0.4} />
      <pointLight position={[3, 3, 3]} color="#00D4FF" intensity={2.2} />
      <pointLight position={[-3, -3, 3]} color="#5A189A" intensity={1.8} />
      <pointLight position={[0, 0, -4]} color="#FF4FD8" intensity={1.2} />
      <ambientLight intensity={0.25} />
    </group>
  );
}

/* ---------------- 2D MOBILE FALLBACK ---------------- */

function CoreFallback2D({ selectedSkill, setSelectedSkill }) {
  const rings = [
    { skill: SKILLS[0], size: '55%', duration: 10, direction: 'normal' },
    { skill: SKILLS[1], size: '72%', duration: 14, direction: 'reverse' },
    { skill: SKILLS[2], size: '88%', duration: 18, direction: 'normal' },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          width: '45%',
          height: '45%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.28) 0%, rgba(90,24,154,0.22) 60%, transparent 80%)',
          filter: 'blur(10px)',
        }}
      />
      <div
        className="absolute rounded-full border border-cyan-400/30"
        style={{
          width: '36%',
          height: '36%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, rgba(90,24,154,0.75), rgba(0,212,255,0.7))',
          boxShadow: '0 0 45px rgba(0,212,255,0.28)',
        }}
      />
      <div
        className="absolute rounded-full border border-cyan-400/15"
        style={{ width: '48%', height: '48%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />

      {rings.map(({ skill, size, duration, direction }) => (
        <button
          key={skill.name}
          type="button"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-transparent"
          style={{
            width: size,
            height: size,
            borderColor: `${skill.color}55`,
            animation: `spin ${duration}s linear infinite ${direction}`,
          }}
          onClick={() => setSelectedSkill(selectedSkill?.name === skill.name ? null : skill)}
          aria-label={`Inspect ${skill.name}`}
        >
          <span
            className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: skill.color, boxShadow: `0 0 10px ${skill.color}` }}
          />
        </button>
      ))}

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 rounded-lg border px-4 py-2 text-xs font-hud backdrop-blur-md"
            style={{ borderColor: selectedSkill.color, background: 'rgba(10,10,20,0.85)', color: selectedSkill.color }}
          >
            <p className="mb-1 font-bold">{selectedSkill.name}</p>
            <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${selectedSkill.level}%`, background: selectedSkill.color }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- MAGNETIC BUTTON ---------------- */

function MagneticButton({ children, className, onClick, as = 'button', href }) {
  const ref = useRef();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: x * 0.25, y: y * 0.25 });
  };
  const reset = () => setPos({ x: 0, y: 0 });

  const Component = as === 'a' ? motion.a : motion.button;

  return (
    <Component
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.2 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </Component>
  );
}

/* ---------------- COUNT-UP METRIC ---------------- */

function CountUpMetric({ value, label, delay }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState('0');
  const [started, setStarted] = useState(false);

  const numeric = parseInt(value.replace(/\D/g, ''), 10);
  const suffix = value.replace(/[0-9]/g, '');
  const isInf = value === 'INF';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          if (isInf) { setDisplay('INF'); return; }
          const duration = 1200;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const current = Math.floor(progress * numeric);
            setDisplay(`${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(animate);
          };
          setTimeout(() => requestAnimationFrame(animate), delay);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started, numeric, suffix, isInf, delay]);

  return (
    <div ref={ref} className="border-l border-purple-500/20 px-2 text-center lg:px-0 lg:pl-4 lg:text-left">
      <p className="font-hud text-xl font-bold text-cyan-400 text-glow-blue sm:text-2xl xl:text-3xl tabular-nums">
        {display}
      </p>
      <p className="mt-1 font-hud text-[8px] font-bold uppercase tracking-widest text-white/50">{label}</p>
    </div>
  );
}

/* ---------------- SYSTEM LOG TICKER ---------------- */

function SystemLogTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % LOG_MESSAGES.length), 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-3 left-3 z-20 max-w-[130px] overflow-hidden h-3">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="font-hud text-[7px] tracking-widest text-cyan-400/60 whitespace-nowrap"
        >
          {LOG_MESSAGES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- CIRCUIT LINES OVERLAY (SVG) ---------------- */

function CircuitLines() {
  return (
    <svg className="absolute inset-0 z-10 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="circuitGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF4FD8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 8 8 H 40 L 48 16 H 92"
        stroke="url(#circuitGrad)"
        strokeWidth="0.3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.path
        d="M 8 92 H 35 L 43 84 H 92"
        stroke="url(#circuitGrad)"
        strokeWidth="0.3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: 'easeInOut' }}
      />
      {[[8, 8], [92, 16], [8, 92], [92, 84]].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="0.8"
          fill="#00D4FF"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  );
}

/* ---------------- MAIN HERO ---------------- */

export default function HeroSection() {
  const { triggerNebula } = useApp();
  const [typedText, setTypedText] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const sectionRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const cameraZ = useTransform(scrollYProgress, [0, 1], [4.5, 7]);
  const cameraRotY = useTransform(scrollYProgress, [0, 1], [0, Math.PI / 2.2]);
  const bgParallaxX = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Typing engine
  useEffect(() => {
    const current = HERO_TEXTS[textIdx];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(current.slice(0, charIdx + 1));
        setCharIdx((v) => v + 1);
        if (charIdx === current.length) setTimeout(() => setIsDeleting(true), 1800);
      } else {
        setTypedText(current.slice(0, charIdx - 1));
        setCharIdx((v) => v - 1);
        if (charIdx === 0) {
          setIsDeleting(false);
          setTextIdx((v) => (v + 1) % HERO_TEXTS.length);
        }
      }
    }, isDeleting ? 60 : 100);
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, textIdx]);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    };
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen w-full items-start justify-center overflow-hidden px-4 pb-20 pt-48 sm:pt-40 md:pt-36 lg:items-center lg:px-16 lg:pt-32"
      style={{ scrollMarginTop: '90px' }}
>
  
      {/* Background */}
      <motion.div className="absolute inset-0 z-[1] grid-overlay opacity-20" style={{ x: bgParallaxX }} />
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(90,24,154,0.18) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 overflow-hidden lg:grid-cols-12 lg:gap-8 xl:gap-12">

          {/* Left Column */}
          <motion.div
            className="order-1 flex w-full flex-col items-center text-center lg:order-none lg:col-span-7 lg:items-start lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {/* Status badge */}
            <div className="block h-20 lg:hidden" />
            <div className="mb-4 inline-flex items-center gap-3 border border-cyan-400/30 glass-card px-4 py-2 sm:mb-8">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-hud text-[8px] tracking-[0.3em] text-cyan-400 sm:text-[10px] sm:tracking-[0.4em]">
                COMMAND BRIDGE // INISH OS v2.6
              </span>
            </div>

            {/* Name */}
            <h1 className="mb-3 font-hud font-black leading-tight tracking-tight"
                style={{ fontSize: 'clamp(2.2rem, 10vw, 5rem)' }}>
              <span className="block text-white/90">K INISH</span>
              <span className="block gradient-text-shimmer">KUMAR</span>
            </h1>

            <p className="mb-3 font-hud text-base font-bold tracking-wider text-purple-300 sm:text-xl lg:text-2xl">
              B.Tech CSE (AI &amp; ML)
            </p>

            {/* Typing text */}
            <div className="mb-6 flex min-h-[2rem] items-center justify-center gap-2 lg:justify-start">
              <span className="font-hud text-lg font-bold text-cyan-400 sm:text-xl text-glow-blue">
                {typedText}
              </span>
              <span className="font-hud text-lg text-cyan-400 animate-pulse sm:text-xl text-glow-blue">|</span>
            </div>

            <p className="mx-auto mb-8 max-w-xl border-t-2 border-purple-500/40 pt-5 font-ui text-sm leading-relaxed text-white/75 sm:text-base lg:mx-0 xl:max-w-2xl">
              "Building intelligent systems, modern web experiences, and the foundation for future AI technologies."
            </p>

            {/* Action buttons — 2 cols on mobile, 4 on sm+ */}
            <div className="mb-10 grid w-full max-w-xs grid-cols-2 gap-3 sm:max-w-lg lg:max-w-none lg:grid-cols-4">
              <MagneticButton
                onClick={() => { scrollTo('projects'); triggerNebula('Mission Archive is now open, Commander.'); }}
                className="btn-primary col-span-1 flex h-14 w-full items-center justify-center gap-1.5 px-4 text-sm"
              >
                <Eye size={13} />
                Missions
              </MagneticButton>

              <MagneticButton
                onClick={() => scrollTo('about')}
                className="btn-secondary col-span-1 flex h-14 w-full items-center justify-center gap-1.5 px-4 text-sm"
              >
                <ChevronRight size={13} />
                Terminal
              </MagneticButton>

              <MagneticButton
                as="a"
                href="#"
                onClick={(e) => { e.preventDefault(); triggerNebula('Resume download initiated. Standing by.'); }}
                className="btn-primary col-span-1 flex h-14 w-full items-center justify-center gap-1.5 px-4 text-sm"
              >
                <Download size={13} />
                Resume
              </MagneticButton>

              <MagneticButton
                onClick={() => scrollTo('contact')}
                className="btn-secondary col-span-1 flex h-14 w-full items-center justify-center gap-1.5 px-4 text-sm"
              >
                <Mail size={13} />
                Contact
              </MagneticButton>
            </div>

            {/* Metrics — 2 cols on mobile, 4 on sm+ */}
            <div className="grid w-full max-w-xs grid-cols-2 gap-4 sm:max-w-lg sm:grid-cols-4 lg:max-w-none">
              {[
                { val: '3+', label: 'Missions' },
                { val: '6+', label: 'Technologies' },
                { val: '4+', label: 'Languages' },
                { val: 'INF', label: 'Ambition' },
              ].map((item, i) => (
                <CountUpMetric key={item.label} value={item.val} label={item.label} delay={i * 150} />
              ))}
            </div>
          </motion.div>

          {/* Right Column: 3D / Fallback Core */}
          <motion.div
            className="relative mx-auto w-full overflow-hidden order-2 lg:order-none lg:col-span-5 lg:max-w-none lg:justify-self-end"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, type: 'spring' }}
          >
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-purple-950/10 backdrop-blur-sm"
              style={{ height: '280px' }}
            >
              <div className="absolute inset-0 z-10 grid-overlay opacity-10 pointer-events-none" />
              <CircuitLines />

              {/* HUD Corners */}
              <div className="absolute left-3 top-3 z-20">
                <p className="font-hud text-[7px] tracking-[0.25em] text-cyan-400/70">AI CORE</p>
                <p className="font-hud text-[6px] tracking-wider text-purple-400/60">NEURAL ENGINE v3</p>
              </div>
              <div className="absolute right-3 top-3 z-20 text-right">
                <p className="font-hud text-[7px] tracking-[0.25em] text-cyan-400/70">STATUS: OPTIMAL</p>
                <div className="flex items-center justify-end gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="font-hud text-[6px] text-green-400/70">LIVE</p>
                </div>
              </div>

              <SystemLogTicker />

              <div className="absolute bottom-3 right-3 z-20 text-right">
                <p className="font-hud text-[6px] tracking-wider text-purple-400/50">NEBULA SYNCED</p>
                {selectedSkill && (
                  <p className="font-hud text-[6px] tracking-wider mt-0.5" style={{ color: selectedSkill.color }}>
                    {selectedSkill.name.toUpperCase()}
                  </p>
                )}
              </div>

              <div className="h-full w-full lg:hidden">
                <CoreFallback2D selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill} />
              </div>

              <div className="hidden h-full w-full lg:block">
                <Canvas
                  camera={{ position: [0, 0, 4.5], fov: 45 }}
                  dpr={[1, 1.5]}
                  performance={{ min: 0.5 }}
                  onPointerMissed={() => setSelectedSkill(null)}
                >
                  <ScrollCamera cameraZ={cameraZ} cameraRotY={cameraRotY} />
                  <AICore selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill} mouse={mouse} />
                </Canvas>
              </div>
            </div>

            {/* Floating Tags — only on xl */}
            <motion.div
              className="absolute -left-8 top-1/4 hidden rounded-xl border border-purple-500/30 glass-card px-4 py-3 xl:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="font-hud text-[8px] tracking-widest text-purple-300">NEBULA AI</p>
              <p className="font-hud text-sm font-bold text-white">Online</p>
              <div className="mt-1.5 h-0.5 w-12 rounded-full" style={{ background: 'linear-gradient(90deg,#5A189A,#00D4FF)' }} />
            </motion.div>

            <motion.div
              className="absolute -right-8 bottom-1/4 hidden rounded-xl border border-cyan-500/30 glass-card px-4 py-3 xl:block"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="font-hud text-[8px] tracking-widest text-cyan-400">SKILL LEVEL</p>
              <p className="font-hud text-sm font-bold text-white">LV 40+</p>
              <div className="mt-1.5 h-0.5 w-12 rounded-full" style={{ background: 'linear-gradient(90deg,#00D4FF,#FF4FD8)' }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-[-40px] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <p className="font-hud text-[8px] tracking-[0.4em] text-white/30">SCROLL TO EXPLORE</p>
          <div className="h-12 w-px bg-gradient-to-b from-cyan-500/50 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

function ScrollCamera({ cameraZ, cameraRotY }) {
  useFrame(({ camera }) => {
    const z = cameraZ.get();
    const rotY = cameraRotY.get();
    camera.position.z += (z - camera.position.z) * 0.08;
    camera.position.x += (Math.sin(rotY) * 1.5 - camera.position.x) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  return null;
}
