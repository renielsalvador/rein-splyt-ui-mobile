import {Platform} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const lightColors = {
  // Header — a four-stop ramp plus the bloom layered over it. Low contrast between
  // stops on purpose: a wide green ramp bands badly at 8 bits per channel.
  headerFrom: '#1B4C3A',
  headerVia: '#245A45',
  headerMid: '#2C6B53',
  headerTo: '#337C60',
  headerBloom: 'rgba(255,255,255,0.13)',
  headerBloomMid: 'rgba(255,255,255,0.05)',
  headerBloomFade: 'rgba(255,255,255,0)',
  onHeader: '#FFFFFF',
  onHeaderScrim: 'rgba(255,255,255,0.17)',

  // Surfaces, furthest back to nearest front.
  panel: '#F4F5F6',
  surface: '#FFFFFF',
  surfaceSunken: '#EDEEF0',
  surfaceField: '#F4F5F6',

  ink: '#1C1C1E',
  inkMuted: '#6B6B6F',
  hairline: '#E5E7EB',
  // Separators need more weight than control borders: they sit on white and on the gray panel.
  rule: '#CDD3DA',

  brand: '#2F6F57',
  brandLift: '#3E8C6A',
  brandIcon: '#2F6F57',
  brandSoft: '#E8F2EC',
  brandSofter: '#F1F7F3',
  onBrand: '#FFFFFF',
  onBrandSoft: '#1B4838',

  // The operational, non-celebratory action color.
  actionInk: '#1C1C1E',
  onActionInk: '#FFFFFF',

  signal: '#22C55E',
  info: '#3B82F6',
  success: '#4CAF50',
  warning: '#F59E0B',
  danger: '#E74C3C',

  // Status text, each clearing 4.5:1 on this scheme's surfaces.
  dangerText: '#B3261E',
  infoText: '#1D4ED8',
  successText: '#15803D',
  warningText: '#B45309',
  onStatusFill: '#1C1C1E',

  // Tinted badge fills.
  successSoft: '#E7F5EB',
  dangerSoft: '#FCE8E5',
  brandGhost: 'rgba(47,111,87,0.12)',

  // Controls sitting on a tinted (brandSoft) card rather than on a surface.
  onTintScrim: 'rgba(255,255,255,0.70)',
  onTintChip: 'rgba(255,255,255,0.82)',

  shadow: '#163628',
  shadowOpacity: 0.06,
  scrim: 'rgba(16,34,26,0.52)',
};

export type Colors = typeof lightColors;

const darkColors: Colors = {
  headerFrom: '#072017',
  headerVia: '#0D2C21',
  headerMid: '#12382A',
  headerTo: '#184331',
  headerBloom: 'rgba(125,225,180,0.13)',
  headerBloomMid: 'rgba(125,225,180,0.05)',
  headerBloomFade: 'rgba(125,225,180,0)',
  onHeader: '#FFFFFF',
  onHeaderScrim: 'rgba(255,255,255,0.14)',

  panel: '#121316',
  surface: '#1C1D21',
  surfaceSunken: '#191A1D',
  surfaceField: '#232529',

  ink: '#F2F3F5',
  inkMuted: '#8E8E96',
  hairline: '#2A2C31',
  rule: '#3C4047',

  brand: '#2F6F57',
  brandLift: '#4E9C7A',
  brandIcon: '#6FCFA2',
  brandSoft: '#1E3A2C',
  brandSofter: '#22342B',
  onBrand: '#FFFFFF',
  onBrandSoft: '#BFE6D3',

  actionInk: '#EDEEF0',
  onActionInk: '#17181B',

  signal: '#22C55E',
  info: '#3B82F6',
  success: '#4CAF50',
  warning: '#F59E0B',
  danger: '#E74C3C',

  // Lightened so they clear 4.5:1 against dark surfaces rather than light ones.
  dangerText: '#FF8D82',
  infoText: '#8AB4FF',
  successText: '#5FD398',
  warningText: '#F2B457',
  onStatusFill: '#1C1C1E',

  successSoft: '#16301F',
  dangerSoft: '#3A1D1A',
  brandGhost: 'rgba(111,207,162,0.16)',

  onTintScrim: 'rgba(255,255,255,0.09)',
  onTintChip: 'rgba(255,255,255,0.13)',

  shadow: '#000000',
  shadowOpacity: 0.4,
  scrim: 'rgba(0,0,0,0.6)',
};

export const colorSchemes = {light: lightColors, dark: darkColors} as const;

export type ColorSchemeName = keyof typeof colorSchemes;

// Event accents. Deliberately desaturated mid-tones: they sit beside the forest-green
// brand on the same card, so a saturated ramp would read as a second brand colour.
// Ordered by hue so the two rows of seven read as a continuous ramp.
export const EVENT_COLOR_NAMES = [
  'forest',
  'moss',
  'sage',
  'teal',
  'sky',
  'ocean',
  'indigo',
  'violet',
  'plum',
  'rose',
  'clay',
  'amber',
  'ochre',
  'stone',
] as const;

export type EventColorName = (typeof EVENT_COLOR_NAMES)[number];

// Twelve-swatch subset shown in the picker; the full list stays valid for stored events.
export const EVENT_COLOR_PICKER_NAMES: readonly EventColorName[] = EVENT_COLOR_NAMES.filter(
  name => name !== 'sage' && name !== 'ochre',
);

export type EventSwatch = {accent: string; soft: string; onSoft: string; label: string};

const lightEventColors: Record<EventColorName, EventSwatch> = {
  forest: {label: 'Forest', accent: '#2F6F57', soft: '#E8F2EC', onSoft: '#1B4838'},
  moss: {label: 'Moss', accent: '#5F7A3A', soft: '#EDF2E4', onSoft: '#3E5125'},
  sage: {label: 'Sage', accent: '#6F8A5E', soft: '#EEF3E9', onSoft: '#47593B'},
  teal: {label: 'Teal', accent: '#2A7B82', soft: '#E4F1F2', onSoft: '#1A4F53'},
  sky: {label: 'Sky', accent: '#3C8AA8', soft: '#E6F2F6', onSoft: '#255A6E'},
  ocean: {label: 'Ocean', accent: '#35689C', soft: '#E7EEF7', onSoft: '#214266'},
  indigo: {label: 'Indigo', accent: '#5A5AA8', soft: '#ECECF7', onSoft: '#3A3A6E'},
  violet: {label: 'Violet', accent: '#73519C', soft: '#F0EAF7', onSoft: '#4A3367'},
  plum: {label: 'Plum', accent: '#8A4F7D', soft: '#F5EAF2', onSoft: '#5B3352'},
  rose: {label: 'Rose', accent: '#B0526A', soft: '#F9E9ED', onSoft: '#743444'},
  clay: {label: 'Clay', accent: '#B05F45', soft: '#F9EBE6', onSoft: '#743D2C'},
  amber: {label: 'Amber', accent: '#B57A33', soft: '#F9EFE2', onSoft: '#775020'},
  ochre: {label: 'Ochre', accent: '#9A7324', soft: '#F6EFDF', onSoft: '#654B16'},
  stone: {label: 'Stone', accent: '#64707C', soft: '#EDEFF1', onSoft: '#414A53'},
};

const darkEventColors: Record<EventColorName, EventSwatch> = {
  forest: {label: 'Forest', accent: '#6FCFA2', soft: '#1E3A2C', onSoft: '#BFE6D3'},
  moss: {label: 'Moss', accent: '#A8C77A', soft: '#2B3619', onSoft: '#DCE8C6'},
  sage: {label: 'Sage', accent: '#A9C491', soft: '#2A3521', onSoft: '#DCE8CC'},
  teal: {label: 'Teal', accent: '#6CCBD3', soft: '#173B3E', onSoft: '#B5E5E9'},
  sky: {label: 'Sky', accent: '#7CC2DC', soft: '#19353F', onSoft: '#C0E3EF'},
  ocean: {label: 'Ocean', accent: '#7FB0E8', soft: '#1B3147', onSoft: '#C3DBF5'},
  indigo: {label: 'Indigo', accent: '#9A9AE0', soft: '#272748', onSoft: '#D2D2F2'},
  violet: {label: 'Violet', accent: '#B494E2', soft: '#2F2343', onSoft: '#E0D1F4'},
  plum: {label: 'Plum', accent: '#D08FC2', soft: '#3C2437', onSoft: '#EFD2E7'},
  rose: {label: 'Rose', accent: '#E08FA2', soft: '#3E2029', onSoft: '#F6D4DC'},
  clay: {label: 'Clay', accent: '#E2A089', soft: '#3F271E', onSoft: '#F6D8CC'},
  amber: {label: 'Amber', accent: '#E6B37A', soft: '#3D2C19', onSoft: '#F7DFC4'},
  ochre: {label: 'Ochre', accent: '#DCB65C', soft: '#3A2F15', onSoft: '#F2E2B9'},
  stone: {label: 'Stone', accent: '#A8B0BA', soft: '#2A2F36', onSoft: '#DADEE4'},
};

export const eventColorSchemes = {
  light: lightEventColors,
  dark: darkEventColors,
} as const;

export const DEFAULT_EVENT_COLOR: EventColorName = 'forest';

export function pickRandomEventColor(): EventColorName {
  return EVENT_COLOR_NAMES[Math.floor(Math.random() * EVENT_COLOR_NAMES.length)];
}

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
  sheet: 28,
  pill: 999,
} as const;

type TypeScale = Omit<TextStyle, 'color'>;

/** The scale with no color baked in, so a themed style can supply its own. */
export const typeScale: Record<string, TypeScale> = {
  display: {fontFamily, fontSize: 32, fontWeight: '700', lineHeight: 38, letterSpacing: -0.8},
  amount: {fontFamily, fontSize: 30, fontWeight: '700', lineHeight: 36, letterSpacing: -0.9},
  pageTitle: {fontFamily, fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: -0.7},
  sectionTitle: {fontFamily, fontSize: 20, fontWeight: '600', lineHeight: 26, letterSpacing: -0.4},
  cardTitle: {fontFamily, fontSize: 17, fontWeight: '600', lineHeight: 23, letterSpacing: -0.3},
  button: {fontFamily, fontSize: 16, fontWeight: '600', lineHeight: 16, letterSpacing: -0.2},
  body: {fontFamily, fontSize: 15, fontWeight: '400', lineHeight: 22, letterSpacing: -0.1},
  bodyStrong: {fontFamily, fontSize: 15, fontWeight: '600', lineHeight: 22, letterSpacing: -0.2},
  label: {fontFamily, fontSize: 13, fontWeight: '500', lineHeight: 18},
  caption: {fontFamily, fontSize: 12, fontWeight: '500', lineHeight: 17},
};

export function cardShadow(colors: Colors): ViewStyle {
  return {
    shadowColor: colors.shadow,
    shadowOpacity: colors.shadowOpacity,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  };
}

export function cardSurface(colors: Colors): ViewStyle {
  return {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...cardShadow(colors),
  };
}

/** The scale bound to a scheme's ink, so themed stylesheets can spread it directly. */
export function createTypography(colors: Colors): Record<string, TextStyle> {
  return {
    display: {...typeScale.display, color: colors.ink},
    pageTitle: {...typeScale.pageTitle, color: colors.ink},
    sectionTitle: {...typeScale.sectionTitle, color: colors.ink},
    cardTitle: {...typeScale.cardTitle, color: colors.ink},
    body: {...typeScale.body, color: colors.ink},
    bodyStrong: {...typeScale.bodyStrong, color: colors.ink},
    label: {...typeScale.label, color: colors.inkMuted},
    caption: {...typeScale.caption, color: colors.inkMuted},
    button: typeScale.button,
    amount: {...typeScale.amount, color: colors.ink},
  };
}
