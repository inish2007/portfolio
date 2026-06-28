import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { useApp } from './contexts/useApp';
import NavHUD from './components/NavHUD';
import NebulaAssistant from './components/NebulaAssistant';
import StarField from './components/StarField';
import SoftAurora from './components/SoftAurora';
import Particles from './components/Particles';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import AchievementsSection from './sections/AchievementsSection';
import ContactSection from './sections/ContactSection';
import { motion } from 'framer-motion';

const loadHeroSection = () => import('./sections/HeroSection');
const HeroSection = lazy(loadHeroSection);
const GalaxySection = lazy(() => import('./sections/GalaxySection'));
const BootSequence = lazy(() => import('./components/BootSequence'));

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'galaxy', 'achievements', 'contact'];

function WarpExitFlash({ lowPowerMode }) {
  return (
    <motion.div
      className="warp-exit-flash"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: lowPowerMode ? 0.4 : 0.75, ease: 'easeOut' }}
    >
      <motion.div
        className="warp-exit-core"
        initial={{ opacity: 0.95, scale: 0.12 }}
        animate={{ opacity: 0, scale: lowPowerMode ? 1.8 : 4.5 }}
        transition={{ duration: lowPowerMode ? 0.35 : 0.68, ease: [0.16, 1, 0.3, 1] }}
      />
      {!lowPowerMode && (
        <motion.div
          className="warp-exit-shockwave"
          initial={{ opacity: 0.85, scale: 0.08 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </motion.div>
  );
}

function CustomCursor() {
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const dotRef = useRef(null);
  const outlineRef = useRef(null);

  useEffect(() => {
    if (isTouchDevice) return undefined;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX - 4}px`;
        dotRef.current.style.top = `${mouseY - 4}px`;
      }
    };

    const animate = () => {
      outlineX += (mouseX - outlineX) * 0.12;
      outlineY += (mouseY - outlineY) * 0.12;
      if (outlineRef.current) {
        outlineRef.current.style.left = `${outlineX - 15}px`;
        outlineRef.current.style.top = `${outlineY - 15}px`;
      }
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    animate();
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
}

function ScrollTracker() {
  const { setActiveSection } = useApp();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-85px 0px -75% 0px',
        threshold: 0.15,
      }
    );
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [setActiveSection]);

  return null;
}

function MainContent() {
  const { booted, lowPowerMode } = useApp();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : false
  );

  useEffect(() => {
    if (booted) return undefined;
    const preloadTimer = window.setTimeout(() => {
      loadHeroSection();
    }, 1200);
    return () => window.clearTimeout(preloadTimer);
  }, [booted]);

  useEffect(() => {
    if (!booted) return;
    const desktopQuery = window.matchMedia('(min-width: 1280px)');
    const handleBreakpoint = (event) => setIsDesktop(event.matches);
    desktopQuery.addEventListener('change', handleBreakpoint);
    return () => desktopQuery.removeEventListener('change', handleBreakpoint);
  }, [booted]);

  return (
    <>
      {!booted && (
        <Suspense fallback={null}>
          <BootSequence />
        </Suspense>
      )}

      {booted && <WarpExitFlash lowPowerMode={lowPowerMode} />}

      <>
        {booted && (
          <div className="main-page-shell relative">
            {/* ── Background layers (bottom → top) ── */}

            {/* Layer 0: OGL Particles — deepest layer, slow drifting nebula dust */}
            {!lowPowerMode && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              >
                <Particles
                  particleCount={isDesktop ? 120 : 60}
                  particleSpread={12}
                  speed={0.04}
                  particleColors={['#00D4FF', '#5A189A', '#FF4FD8', '#a78bfa']}
                  moveParticlesOnHover={false}
                  alphaParticles={true}
                  particleBaseSize={isDesktop ? 60 : 40}
                  sizeRandomness={1.2}
                  cameraDistance={22}
                  disableRotation={false}
                  pixelRatio={Math.min(
                    typeof window !== 'undefined' ? window.devicePixelRatio : 1,
                    1.5
                  )}
                />
              </div>
            )}

            {/* Layer 1: StarField canvas */}
            <StarField />

            {/* Layer 2: Aurora — desktop only, screen blend */}
            {isDesktop && !lowPowerMode && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1,
                  mixBlendMode: 'screen',
                  opacity: 0.55,
                  pointerEvents: 'none',
                }}
              >
                <SoftAurora />
              </div>
            )}

            {/* Layer 3: Scanline */}
            <div className="scanline" style={{ zIndex: 2 }} />
            <div className="site-color-grade" aria-hidden="true" />

            {/* UI */}
            <CustomCursor />
            <NavHUD />
            <NebulaAssistant />
            <ScrollTracker />

            {/* Main content */}
            <main className="relative z-10">
              <motion.div
                className="hero-landing-stage"
                initial={{ opacity: 0, y: lowPowerMode ? -6 : -18, scale: lowPowerMode ? 1.008 : 1.025 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: lowPowerMode ? 0.55 : 0.95, ease: [0.16, 1, 0.3, 1] }}
              >
                <Suspense fallback={null}>
                  <HeroSection />
                </Suspense>
              </motion.div>
              <div className="section-sep mx-auto max-w-4xl" />
              <AboutSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <SkillsSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <ProjectsSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <Suspense fallback={null}>
                <GalaxySection />
              </Suspense>
              <div className="section-sep mx-auto max-w-4xl" />
              <AchievementsSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <ContactSection />
            </main>
          </div>
        )}
      </>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
