import { useState } from 'react';
import { AppContext } from './useApp';

export const AppProvider = ({ children }) => {
  const [booted, setBooted] = useState(false);
  const [nebulaOpen, setNebulaOpen] = useState(false);
  const [nebulaMessage, setNebulaMessage] = useState('');
  const [activeSection, setActiveSection] = useState('hero');

  const triggerNebula = (message) => {
    setNebulaMessage(message);
    setNebulaOpen(true);
    setTimeout(() => setNebulaOpen(false), 5000);
  };

  return (
    <AppContext.Provider value={{ booted, setBooted, nebulaOpen, setNebulaOpen, nebulaMessage, triggerNebula, activeSection, setActiveSection }}>
      {children}
    </AppContext.Provider>
  );
};
