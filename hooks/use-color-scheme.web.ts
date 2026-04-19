import { useEffect, useState } from 'react';

import { resolveThemePreference, useThemeStore } from '@/store/theme-store';

export function useColorScheme() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setSystemScheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
  }, []);

  if (themePreference === 'system') {
    return systemScheme;
  }

  return resolveThemePreference(themePreference);
}
