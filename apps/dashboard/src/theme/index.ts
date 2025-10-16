// Theme configuration and utilities for the monodog dashboard

/**
 * Brand Colors
 *
 * Primary (Red): Used for main actions, links, and active states
 * Secondary (Green): Used for success states, positive actions, and nature-related elements
 * Accent (Yellow): Used for warnings, highlights, and attention-grabbing elements
 */
export const colors = {
  // Primary brand color (Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#f7777f',
    300: '#f33a45',
    400: '#f01622',
    500: '#ff0000', // Base primary
    600: '#cc0511', // Primary buttons
    700: '#b70510', // Primary button hover
    800: '#99040d'
  },

  // Secondary brand color (Green)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Base secondary
    600: '#16a34a', // Secondary buttons
    700: '#15803d', // Secondary button hover
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Accent color (Yellow)
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308', // Base accent
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // Neutral color (Gray)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

/**
 * Semantic Colors
 *
 * Used for status indicators, alerts, and feedback
 */
export const semanticColors = {
  success: colors.secondary,
  warning: colors.accent,
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0284c7',
    700: '#0e7490',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
} as const;

/**
 * Typography Scale
 *
 * Font families and sizes for consistent typography
 */
export const typography = {
  fonts: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif'
    ],
    display: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif'
    ],
    mono: [
      '"JetBrains Mono"',
      '"Fira Code"',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'Monaco',
      '"Courier New"',
      'monospace'
    ],
  },

  sizes: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },

  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

/**
 * Spacing Scale
 *
 * Consistent spacing values for margins, padding, and gaps
 */
export const spacing = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  18: '4.5rem',  // 72px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  88: '22rem',   // 352px
  128: '32rem',  // 512px
  144: '36rem',  // 576px
} as const;

/**
 * Shadow Scale
 *
 * Custom shadow definitions for depth and elevation
 */
export const shadows = {
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  large: '0 10px 40px -15px rgba(0, 0, 0, 0.1), 0 4px 25px -5px rgba(0, 0, 0, 0.07)',
} as const;

/**
 * Border Radius Scale
 */
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

/**
 * Animation Durations and Configurations
 */
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Tailwind animation configurations
  animate: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
    'slide-down': 'slideDown 0.3s ease-out',
    'pulse-slow': 'pulse 3s infinite',
  },

  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
} as const;

/**
 * Component Color Mappings
 *
 * Maps component states to color values
 */
export const componentColors = {
  button: {
    primary: {
      bg: colors.primary[600],
      hover: colors.primary[700],
      text: '#ffffff',
      ring: colors.primary[500],
    },
    secondary: {
      bg: colors.secondary[600],
      hover: colors.secondary[700],
      text: '#ffffff',
      ring: colors.secondary[500],
    },
    success: {
      bg: semanticColors.success[600],
      hover: semanticColors.success[700],
      text: '#ffffff',
      ring: semanticColors.success[500],
    },
    warning: {
      bg: semanticColors.warning[600],
      hover: semanticColors.warning[700],
      text: '#ffffff',
      ring: semanticColors.warning[500],
    },
    error: {
      bg: semanticColors.error[600],
      hover: semanticColors.error[700],
      text: '#ffffff',
      ring: semanticColors.error[500],
    },
  },

  badge: {
    success: {
      bg: semanticColors.success[100],
      text: semanticColors.success[800],
    },
    warning: {
      bg: semanticColors.warning[100],
      text: semanticColors.warning[800],
    },
    error: {
      bg: semanticColors.error[100],
      text: semanticColors.error[800],
    },
    info: {
      bg: semanticColors.info[100],
      text: semanticColors.info[800],
    },
    neutral: {
      bg: '#f3f4f6',
      text: '#374151',
    },
  },

  input: {
    base: {
      border: '#d1d5db',
      focus: colors.primary[500],
      placeholder: '#9ca3af',
    },
    error: {
      border: semanticColors.error[300],
      focus: semanticColors.error[500],
      text: semanticColors.error[900],
    },
    success: {
      border: semanticColors.success[300],
      focus: semanticColors.success[500],
      text: semanticColors.success[900],
    },
  },
} as const;

/**
 * Z-Index Scale
 */
export const zIndex = {
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
  // Additional z-index values for Tailwind
  '60': '60',
  '70': '70',
  '80': '80',
  '90': '90',
  '100': '100',
} as const;

/**
 * Breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Theme Utilities
 */
export const theme = {
  colors,
  semanticColors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  componentColors,
  zIndex,
  breakpoints,
} as const;

export default theme;
