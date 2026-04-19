import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '@/services/safe-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeState = {
  themePreference: ThemePreference;
  setThemePreference: (themePreference: ThemePreference) => void;
};

export function resolveThemePreference(themePreference: ThemePreference) {
  if (themePreference === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }

  return themePreference;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themePreference: 'light',
      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    {
      name: 'chuka:theme-preference',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
