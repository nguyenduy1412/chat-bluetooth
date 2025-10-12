import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import useThemeStore from '../store/themeStore';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const { theme, setTheme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (colorScheme === 'light' || colorScheme === 'dark') {
      setTheme(colorScheme);
    }
  }, [colorScheme]);

  return <>{children}</>;
};
