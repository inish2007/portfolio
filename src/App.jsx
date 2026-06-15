import { useEffect, useRef } from 'react';
import { AppProvider } from './contexts/AppContext';
import { useApp } from './contexts/useApp';
import BootSequence from './components/BootSequence';
import NavHUD from './components/NavHUD';
import NebulaAssistant from './components/NebulaAssistant';
import StarField from './components/StarField';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import GalaxySection from './sections/GalaxySection';
import AchievementsSection from './sections/AchievementsSection';
import ContactSection from './sections/ContactSection';
import { AnimatePresence, motion } from 'framer-motion';

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'galaxy', 'achievements', 'contact'];

// Custom cursor component
function CustomCursor() {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);

  useEffect(() => {
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
  }, []);

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
  const { booted } = useApp();

  return (
    <>
      {!booted && <BootSequence />}

      <AnimatePresence>
        {booted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Background elements */}
            <StarField />
            <div className="scanline" />

            {/* UI */}
            <CustomCursor />
            <NavHUD />
            <NebulaAssistant />
            <ScrollTracker />

            {/* Main content */}
            <main className="relative z-10">
              <HeroSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <AboutSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <SkillsSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <ProjectsSection />
              <div className="section-sep mx-auto max-w-4xl" />
              <GalaxySection />
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