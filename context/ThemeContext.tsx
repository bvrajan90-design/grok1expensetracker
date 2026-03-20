import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppSettings } from '../lib/types';
import { storage } from '../lib/storage';

interface ThemeContextType {
  isDark: boolean;
  settings: AppSettings;
  toggleDarkMode: () => void;
  setAutoMode: () => void;
  updateSettings: (settings: AppSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>({ currency: '₹', darkMode: 'auto' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await storage.getSettings();
    setSettings(savedSettings);
  };

  const isDark = settings.darkMode === 'auto'
    ? systemColorScheme === 'dark'
    : settings.darkMode;

  const toggleDarkMode = async () => {
    const newSettings = { ...settings, darkMode: !isDark as boolean | 'auto' };
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  const setAutoMode = async () => {
    const newSettings = { ...settings, darkMode: 'auto' as const };
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      settings,
      toggleDarkMode,
      setAutoMode,
      updateSettings,
    }}>
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