import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

// Brand palette
export const palette = {
  charcoal: '#111315',
  cardDark: '#25292D',
  burntOrange: '#F97316',
  softOrange: '#FDBA74',
  offWhite: '#F5F5F5',
};

const dark = {
  scheme: 'dark' as const,
  background: palette.charcoal,
  surface: palette.cardDark,
  surfaceAlt: '#30353A',
  border: '#373C42',
  text: palette.offWhite,
  textMuted: '#A3A8AE',
  brand: palette.burntOrange, // color-block header
  onBrand: palette.charcoal,
  primary: palette.burntOrange, // main pill buttons
  onPrimary: palette.charcoal,
  accent: palette.softOrange, // links, highlights
  accentSoft: 'rgba(253, 186, 116, 0.14)',
  success: '#4ADE80',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  warning: palette.softOrange,
  warningSoft: 'rgba(253, 186, 116, 0.14)',
  mascotFace: palette.charcoal,
  mascotCoin: palette.burntOrange,
  mascotRim: palette.softOrange,
};

export type Theme = Omit<typeof dark, 'scheme'> & { scheme: 'light' | 'dark' };

const light: Theme = {
  scheme: 'light',
  background: '#F7F5F2',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEBE6',
  border: '#E4DED7',
  text: palette.charcoal,
  textMuted: '#5F646A',
  brand: palette.burntOrange,
  onBrand: palette.charcoal,
  primary: palette.burntOrange,
  onPrimary: palette.charcoal,
  accent: '#C2410C', // darker orange so links stay readable on light backgrounds
  accentSoft: 'rgba(249, 115, 22, 0.10)',
  success: '#16A34A',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.08)',
  warning: '#C2410C',
  warningSoft: 'rgba(249, 115, 22, 0.10)',
  mascotFace: palette.charcoal,
  mascotCoin: palette.burntOrange,
  mascotRim: palette.softOrange,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 12, md: 18, lg: 28, pill: 999 };

export const fonts = {
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const type = {
  display: 64,
  hero: 44,
  title: 24,
  body: 16,
  caption: 13,
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

// Builds a StyleSheet-like object from the current theme, recomputed only when the scheme flips.
export function useThemedStyles<T>(factory: (t: Theme) => T): T {
  const t = useTheme();
  return useMemo(() => factory(t), [t]); // eslint-disable-line react-hooks/exhaustive-deps
}
