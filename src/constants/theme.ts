// src/constants/theme.ts
// ElectroQuote design system — dark professional theme with electric amber accent

export const Colors = {
  // Brand
  accent: '#F5A623',           // Electric amber (primary CTA)
  accentDark: '#C77D00',
  accentLight: '#FFD27A',

  // Backgrounds
  bg0: '#0E1117',              // Deepest background
  bg1: '#161B24',              // Main screen bg
  bg2: '#1E2533',              // Card bg
  bg3: '#2A3347',              // Input bg / elevated surface

  // Text
  textPrimary: '#F0F2F5',
  textSecondary: '#8B9BB4',
  textDisabled: '#4A5568',
  textInverse: '#0E1117',

  // Status
  success: '#2DD4A0',
  warning: '#F5A623',
  error: '#FF5C72',
  info: '#4DA6FF',

  // Quotation status colors
  statusDraft: '#8B9BB4',
  statusSent: '#4DA6FF',
  statusAccepted: '#2DD4A0',
  statusDeclined: '#FF5C72',
  statusRevised: '#F5A623',

  // Borders
  border: '#2A3347',
  borderFocus: '#F5A623',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.6)',
};

export const Typography = {
  // Font families (loaded via expo-font)
  fontRegular: 'Inter_400Regular',
  fontMedium: 'Inter_500Medium',
  fontSemiBold: 'Inter_600SemiBold',
  fontBold: 'Inter_700Bold',

  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 38,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  accent: {
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Touch target minimum (WCAG / Material Design)
export const MIN_TOUCH_TARGET = 48;
