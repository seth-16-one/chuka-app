export const COLORS = {
  primary: '#006400',
  secondary: '#228B22',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#888888',
};

export const colors = {
  ...COLORS,
  chuka: {
    50: '#edf8ed',
    100: '#d9f0d9',
    200: '#b7e2b7',
    300: '#8fce8f',
    400: '#5fad5f',
    500: '#228B22',
    600: '#1e7a1e',
    700: '#0f670f',
    800: '#006400',
    900: '#004d00',
  },
  surface: '#F5F5F5',
  surfaceAlt: '#eaf2ea',
  ink: '#1A1A1A',
  muted: '#888888',
  border: '#d7e2d7',
  danger: '#be2e2e',
  warning: '#b9770e',
  success: '#1f8f4e',
};

export const Colors = {
  light: {
    text: colors.ink,
    background: colors.surface,
    tint: colors.chuka[800],
    icon: colors.muted,
    tabIconDefault: colors.muted,
    tabIconSelected: colors.chuka[800],
  },
  dark: {
    text: colors.white,
    background: '#07140a',
    tint: colors.chuka[200],
    icon: '#9fb4a5',
    tabIconDefault: '#7d8f83',
    tabIconSelected: colors.chuka[200],
  },
};
