'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomThemeConfig, predefinedThemes } from '@/theme/themeConfig';

interface ThemeContextType {
  currentTheme: CustomThemeConfig;
  setTheme: (theme: CustomThemeConfig) => void;
  themeName: string;
  setThemeName: (name: string) => void;
  updateThemeColors: (colors: Partial<CustomThemeConfig['colors']>) => void;
  updateGradient: (gradient: Partial<CustomThemeConfig['gradient']>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'champius_theme';
const THEME_NAME_STORAGE_KEY = 'champius_theme_name';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<CustomThemeConfig>(predefinedThemes.academicBlue);
  const [themeName, setThemeNameState] = useState<string>('academicBlue');

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const savedThemeName = localStorage.getItem(THEME_NAME_STORAGE_KEY);
      
      if (savedTheme) {
        setCurrentTheme(JSON.parse(savedTheme));
      }
      
      if (savedThemeName) {
        setThemeNameState(savedThemeName);
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(currentTheme));
      localStorage.setItem(THEME_NAME_STORAGE_KEY, themeName);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }, [currentTheme, themeName]);

  const setTheme = (theme: CustomThemeConfig) => {
    setCurrentTheme(theme);
  };

  const setThemeName = (name: string) => {
    setThemeNameState(name);
    if (predefinedThemes[name]) {
      setCurrentTheme(predefinedThemes[name]);
    }
  };

  const updateThemeColors = (colors: Partial<CustomThemeConfig['colors']>) => {
    setCurrentTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors,
      },
    }));
    setThemeNameState('custom');
  };

  const updateGradient = (gradient: Partial<CustomThemeConfig['gradient']>) => {
    setCurrentTheme((prev) => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        ...gradient,
      },
    }));
  };

  const resetTheme = () => {
    setCurrentTheme(predefinedThemes.academicBlue);
    setThemeNameState('academicBlue');
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themeName,
        setThemeName,
        updateThemeColors,
        updateGradient,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
