import { create } from 'zustand';
import { useColorScheme } from 'react-native';

type ThemeState = {
  theme: 'light' | 'dark' | undefined;
  setTheme: (newTheme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  loadTheme: (systemTheme?: 'light' | 'dark' | null) => void;
};

const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: (newTheme: 'light' | 'dark') => {
    set({ theme: newTheme });
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
  loadTheme: systemTheme => {
    if (systemTheme === 'light' || systemTheme === 'dark') {
      set({ theme: systemTheme });
    }
  },
}));

export default useThemeStore;
