import { useState, useEffect, useCallback } from 'react';

export interface Theme {
  primary: string;
  background: string;
  cardBg: string;
  text: string;
}

export const PRESET_THEMES: Record<string, Theme> = {
  zavz: {
    primary: '#8B5CF6',
    background: '#0f0f0f',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
  },
  ocean: {
    primary: '#06b6d4',
    background: '#0c1821',
    cardBg: 'rgba(6, 182, 212, 0.1)',
    text: '#f0f9ff',
  },
  sunset: {
    primary: '#f97316',
    background: '#1a0f0a',
    cardBg: 'rgba(249, 115, 22, 0.1)',
    text: '#fff7ed',
  },
  forest: {
    primary: '#10b981',
    background: '#0a1612',
    cardBg: 'rgba(16, 185, 129, 0.1)',
    text: '#ecfdf5',
  },
  midnight: {
    primary: '#6366f1',
    background: '#0f0a1a',
    cardBg: 'rgba(99, 102, 241, 0.1)',
    text: '#eef2ff',
  },
  rose: {
    primary: '#f43f5e',
    background: '#1a0a0f',
    cardBg: 'rgba(244, 63, 94, 0.1)',
    text: '#fff1f2',
  },
  amber: {
    primary: '#f59e0b',
    background: '#1a1208',
    cardBg: 'rgba(245, 158, 11, 0.1)',
    text: '#fffbeb',
  },
  emerald: {
    primary: '#059669',
    background: '#0a1612',
    cardBg: 'rgba(5, 150, 105, 0.1)',
    text: '#d1fae5',
  },
  violet: {
    primary: '#8b5cf6',
    background: '#120a1a',
    cardBg: 'rgba(139, 92, 246, 0.1)',
    text: '#f5f3ff',
  },
  cyan: {
    primary: '#0891b2',
    background: '#0a1416',
    cardBg: 'rgba(8, 145, 178, 0.1)',
    text: '#cffafe',
  },
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>('zavz');
  const [customColors, setCustomColors] = useState<Theme | null>(null);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setCurrentTheme(saved);
    }

    const savedCustom = localStorage.getItem('customTheme');
    if (savedCustom) {
      try {
        setCustomColors(JSON.parse(savedCustom));
      } catch (e) {
        console.error('Failed to parse custom theme', e);
      }
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = customColors || PRESET_THEMES[currentTheme] || PRESET_THEMES.zavz;

    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--color-text', theme.text);
  }, [currentTheme, customColors]);

  const setTheme = useCallback((themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem('theme', themeName);
    setCustomColors(null);
    localStorage.removeItem('customTheme');
  }, []);

  const setCustomTheme = useCallback((theme: Theme) => {
    setCustomColors(theme);
    localStorage.setItem('customTheme', JSON.stringify(theme));
    setCurrentTheme('custom');
    localStorage.setItem('theme', 'custom');
  }, []);

  return {
    currentTheme,
    theme: customColors || PRESET_THEMES[currentTheme] || PRESET_THEMES.zavz,
    setTheme,
    setCustomTheme,
    presetThemes: PRESET_THEMES,
  };
}
