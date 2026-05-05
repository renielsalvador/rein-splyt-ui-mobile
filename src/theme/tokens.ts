import {Platform} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const palette = {
  primary: '#2F6F57',
  secondary: '#3E8C6A',
  greenAccent: '#22C55E',
  greenTint: '#E8F2EC',
  greenTintSoft: '#F1F7F3',
  bgApp: '#F4F5F6',
  surface: '#FFFFFF',
  divider: '#E5E7EB',
  ink: '#1C1C1E',
  inkMuted: '#6B6B6F',
  danger: '#E74C3C',
  info: '#3B82F6',
  success: '#4CAF50',
  warning: '#F59E0B',
  shadow: '#163628',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    color: palette.ink,
  },
  pageTitle: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 35,
    color: palette.ink,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: palette.ink,
  },
  cardTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
    color: palette.ink,
  },
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: palette.ink,
  },
  bodyStrong: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: palette.ink,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: palette.inkMuted,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    color: palette.inkMuted,
  },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16,
  },
  amount: {
    fontFamily,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    color: palette.ink,
  },
};

export const surfaces: Record<string, ViewStyle> = {
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
};
