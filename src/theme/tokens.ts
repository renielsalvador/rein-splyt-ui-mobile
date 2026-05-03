import {Platform} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const palette = {
  canvas: '#E6F0EE',
  canvasWarm: '#FFFDDB',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FBFA',
  ink: '#0C232A',
  inkMuted: 'rgba(12, 35, 42, 0.68)',
  accent: '#29BFBD',
  accentSoft: '#CFF3F2',
  border: 'rgba(12, 35, 42, 0.10)',
  chartOrange: '#ED9562',
  chartYellow: '#F1E061',
  chartMint: '#7ADFB0',
  chartLavender: '#7C63D7',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const typography: Record<string, TextStyle> = {
  eyebrow: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: palette.inkMuted,
  },
  body: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: palette.ink,
  },
  bodyStrong: {
    fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: palette.ink,
  },
  title: {
    fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: palette.ink,
  },
  display: {
    fontFamily,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    color: palette.ink,
  },
  amount: {
    fontFamily,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: palette.ink,
  },
};

export const surfaces: Record<string, ViewStyle> = {
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.ink,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 4,
  },
};
