import { useState, useEffect } from 'react';

export type FontSizeLevel = 'sm' | 'md' | 'lg' | 'xl';

export interface FontSizeOption {
  level: FontSizeLevel;
  label: string;
  shortLabel: string;
  percentage: string;
  description: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { level: 'sm', label: 'Estándar', shortLabel: 'A-', percentage: '95%', description: 'Tamaño compacto' },
  { level: 'md', label: 'Mediano (Por Defecto)', shortLabel: 'A', percentage: '105%', description: 'Lectura cómoda mejorada' },
  { level: 'lg', label: 'Grande', shortLabel: 'A+', percentage: '115%', description: 'Texto ampliado y claro' },
  { level: 'xl', label: 'Extra Grande', shortLabel: 'A++', percentage: '125%', description: 'Máxima legibilidad' },
];

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(() => {
    try {
      const saved = localStorage.getItem('cleo_dashboard_font_size');
      if (saved && ['sm', 'md', 'lg', 'xl'].includes(saved)) {
        return saved as FontSizeLevel;
      }
    } catch {
      // ignore
    }
    return 'md'; // Default improved font scale
  });

  const applyFontSize = (level: FontSizeLevel) => {
    setFontSizeState(level);
    try {
      localStorage.setItem('cleo_dashboard_font_size', level);
    } catch {
      // ignore
    }

    const html = document.documentElement;
    html.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl');
    html.classList.add(`font-size-${level}`);
  };

  useEffect(() => {
    applyFontSize(fontSize);
  }, []);

  const increase = () => {
    if (fontSize === 'sm') applyFontSize('md');
    else if (fontSize === 'md') applyFontSize('lg');
    else if (fontSize === 'lg') applyFontSize('xl');
  };

  const decrease = () => {
    if (fontSize === 'xl') applyFontSize('lg');
    else if (fontSize === 'lg') applyFontSize('md');
    else if (fontSize === 'md') applyFontSize('sm');
  };

  const reset = () => {
    applyFontSize('md');
  };

  return {
    fontSize,
    setFontSize: applyFontSize,
    increase,
    decrease,
    reset,
    options: FONT_SIZE_OPTIONS,
    currentOption: FONT_SIZE_OPTIONS.find((o) => o.level === fontSize) || FONT_SIZE_OPTIONS[1],
  };
}
