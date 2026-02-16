/**
 * theme.js
 * Single source of truth for every colour, spacing, radius, shadow
 * and typography value used in the app.
 */

export const Colors = {
  // Blues
  blue950: '#172554',
  blue900: '#1e3a8a',
  blue800: '#1e40af',
  blue700: '#1d4ed8',
  blue600: '#2563eb',
  blue500: '#3b82f6',
  blue400: '#60a5fa',
  blue300: '#93c5fd',
  blue200: '#bfdbfe',
  blue100: '#dbeafe',
  blue50:  '#eff6ff',

  // Sky accent
  sky600:  '#0284c7',
  sky500:  '#0ea5e9',
  sky100:  '#e0f2fe',

  // Neutrals
  white:   '#ffffff',
  slate50: '#f8fafc',
  slate200:'#e2e8f0',
  slate400:'#94a3b8',
  slate500:'#64748b',

  // Semantic
  success:       '#059669',
  successLight:  '#d1fae5',
  successBorder: '#6ee7b7',

  error:         '#dc2626',
  errorLight:    '#fef2f2',
  errorBorder:   '#fca5a5',

  warning:       '#d97706',
  warningLight:  '#fffbeb',
  warningBorder: '#fde68a',

  info:          '#2563eb',
  infoLight:     '#eff6ff',
  infoBorder:    '#dbeafe',
};

export const Font = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  hero: 64,

  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',

  tight:  1.2,
  normal: 1.5,
  loose:  1.75,
};

export const Space = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor:   Colors.blue600,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  8,
    elevation:     3,
  },
  md: {
    shadowColor:   Colors.blue600,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius:  16,
    elevation:     6,
  },
  lg: {
    shadowColor:   Colors.blue700,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius:  20,
    elevation:     10,
  },
  blue: {
    shadowColor:   Colors.blue600,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius:  20,
    elevation:     12,
  },
};
