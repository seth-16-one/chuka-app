import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import { resolveThemePreference, useThemeStore } from '@/store/theme-store';

export function useColorScheme() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  if (themePreference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }

  return resolveThemePreference(themePreference);
}
