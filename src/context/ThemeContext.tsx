import { createContext, useContext, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('atlas-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('atlas-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    gridColor: isDark ? '#1f2937' : '#e5e7eb',
    axisColor: isDark ? '#6b7280' : '#9ca3af',
    legendColor: isDark ? '#9ca3af' : '#6b7280',
    tooltipStyle: {
      backgroundColor: isDark ? '#111827' : '#ffffff',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      borderRadius: '8px',
      fontSize: '11px',
      color: isDark ? '#e5e7eb' : '#111827',
    },
  };
}
