import { useEffect, useState } from 'react';

export const useDarkMode = (): [theme: 'light' | 'dark', toggleTheme: () => void, componentMounted: boolean] => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [componentMounted, setComponentMounted] = useState(false);

  const setMode = (mode: 'light' | 'dark') => {
    window.localStorage.setItem('theme', mode)
    setTheme(mode)
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setMode('dark')
    } else {
      setMode('light')
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem('theme');

    if (localTheme === 'light' || localTheme === 'dark') {
        setTheme(localTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
        setMode(prefersDark ? 'dark' : 'light');
    }

    setComponentMounted(true);
  }, []);

  return [theme, toggleTheme, componentMounted]
};