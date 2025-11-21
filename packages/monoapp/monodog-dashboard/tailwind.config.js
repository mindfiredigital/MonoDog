import { theme } from './src/theme/index.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Import colors from theme configuration
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        neutral: theme.colors.neutral,
        success: theme.semanticColors.success,
        warning: theme.semanticColors.warning,
        error: theme.semanticColors.error,
        info: theme.semanticColors.info,
      },

      // Typography from theme configuration
      fontFamily: {
        sans: theme.typography.fonts.sans,
        display: theme.typography.fonts.display,
        mono: theme.typography.fonts.mono,
      },

      // Typography scale from theme configuration
      fontSize: theme.typography.sizes,

      // Spacing scale from theme configuration
      spacing: {
        18: theme.spacing['18'],
        88: theme.spacing['88'],
        128: theme.spacing['128'],
        144: theme.spacing['144'],
      },

      // Border radius from theme configuration
      borderRadius: {
        xl: theme.borderRadius.xl,
        '2xl': theme.borderRadius['2xl'],
        '3xl': theme.borderRadius['3xl'],
      },

      // Box shadows from theme configuration
      boxShadow: {
        soft: theme.shadows.soft,
        medium: theme.shadows.medium,
        large: theme.shadows.large,
      },

      // Animation and transitions from theme configuration
      animation: theme.animations.animate,

      keyframes: theme.animations.keyframes,

      // Z-index scale from theme configuration
      zIndex: {
        60: theme.zIndex['60'],
        70: theme.zIndex['70'],
        80: theme.zIndex['80'],
        90: theme.zIndex['90'],
        100: theme.zIndex['100'],
      },
    },
  },
  plugins: [],
};
