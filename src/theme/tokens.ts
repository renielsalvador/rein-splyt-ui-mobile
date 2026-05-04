import {Platform} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const palette = {
  canvas: '#F4F5F6',
  canvasWarm: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8F9',
  surfaceSoft: '#EEF4F1',
  ink: '#1C1C1E',
  inkMuted: '#6B6B6F',
  primary: '#2F6F57',
  secondary: '#3E8C6A',
  accent: '#2F6F57',
  accentSoft: '#E4F0EA',
  border: '#E5E7EB',
  success: '#4CAF50',
  warning: '#E74C3C',
  blue: '#3B82F6',
  greenAccent: '#22C55E',
  shadow: '#163628',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export const typography: Record<string, TextStyle> = {
  eyebrow: {
    fontFamily,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: palette.inkMuted,
  },
  body: {
    fontFamily,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    color: palette.ink,
  },
  bodyStrong: {
    fontFamily,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: palette.ink,
  },
  title: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: palette.ink,
  },
  display: {
    fontFamily,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: palette.ink,
  },
  amount: {
    fontFamily,
    fontSize: 30,
    lineHeight: 36,
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
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
};
