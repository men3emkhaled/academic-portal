import React, { createContext, useContext, useEffect, useState } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/localStorage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default to system preference or saved preference
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = safeGetItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      // If no saved theme, maybe default to dark since the app was built dark-first
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes to ensure clean slate
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      safeRemoveItem('theme'); // Optional: clear if they want strictly system
    } else {
      root.classList.add(theme);
      safeSetItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDarkMode: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
