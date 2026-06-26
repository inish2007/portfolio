import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { useApp } from './contexts/useApp';
import NavHUD from './components/NavHUD';
import NebulaAssistant from './components/NebulaAssistant';
import StarField from './components/StarField';
import SoftAurora from './components/SoftAurora';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import AchievementsSection from './sections/AchievementsSection';
import ContactSection from './sections/ContactSection';
import { AnimatePresence, motion } from 'framer-motion';

const HeroSection = lazy(() => import('./sections/HeroSection'));
const GalaxySection = lazy(() => import('./sections/GalaxySection'));
const BootSequence = lazy(() => import('./components/BootSequence'));

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'galaxy', 'achievements', 'contact'];

// Custom cursor component
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

// Scroll tracker
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
        threshold: 0.15 
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
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1280 : false);

  useEffect(() => {
    if (!booted) return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [booted]);

  return (
    <>
      {!booted && (
        <Suspense fallback={null}>
          <BootSequence />
        </Suspense>
      )}

      <AnimatePresence>
        {booted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Background elements */}
            {/* Layer 1: Stars */}
            <StarField />

            {/* Layer 2: Aurora — desktop only, screen blend, non-interactive wrapper */}
            {isDesktop && !lowPowerMode && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 1, mixBlendMode: 'screen', opacity: 0.55, pointerEvents: 'none' }}>
                <SoftAurora />
              </div>
            )}

            {/* Layer 3: Scanline */}
            <div className="scanline" style={{ zIndex: 2 }} />

            {/* UI */}
            <CustomCursor />
            <NavHUD />
            <NebulaAssistant />
            <ScrollTracker />

            {/* Main content */}
            <main className="relative z-10">
              <Suspense fallback={null}>
                <HeroSection />
              </Suspense>
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
          </motion.div>
        )}
      </AnimatePresence>
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
