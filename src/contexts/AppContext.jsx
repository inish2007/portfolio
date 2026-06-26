import { useEffect, useRef, useState } from 'react';
import { AppContext } from './useApp';

export const AppProvider = ({ children }) => {
  const [booted, setBooted] = useState(false);
  const [nebulaOpen, setNebulaOpen] = useState(false);
  const [nebulaMessage, setNebulaMessage] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const nebulaTimer = useRef(null);

  const triggerNebula = (message) => {
    if (nebulaTimer.current) clearTimeout(nebulaTimer.current);
    setNebulaMessage(message);
    setNebulaOpen(true);
    nebulaTimer.current = setTimeout(() => setNebulaOpen(false), 5000);
  };

  const toggleLowPower = () => {
    setLowPowerMode(prev => {
      const next = !prev;
      // Trigger notification using the next state
      triggerNebula(next ? 'Low power mode activated. Core graphics offline.' : 'Visual animations enabled. Core graphics online.');
      return next;
    });
  };

  useEffect(() => () => {
    if (nebulaTimer.current) clearTimeout(nebulaTimer.current);
  }, []);

  return (
    <AppContext.Provider value={{ booted, setBooted, nebulaOpen, setNebulaOpen, nebulaMessage, triggerNebula, activeSection, setActiveSection, lowPowerMode, toggleLowPower }}>
      {children}
    </AppContext.Provider>
  );
};

