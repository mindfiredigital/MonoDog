import type {
  DashboardConfig,
  TabDefinition,
  ConfigurationTab,
} from '../types/config.types';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { CubeIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

// Get tab definitions
export const getTabDefinitions = (): TabDefinition[] => [
  { id: 'general', label: 'General', icon: <Cog6ToothIcon className="w-6 h-6 text-primary-600" /> },
  { id: 'features', label: 'Features', icon: <RocketLaunchIcon className="w-6 h-6 text-primary-600" /> },
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'monorepo', label: 'Monorepo', icon: <CubeIcon className="w-6 h-6 text-primary-600" /> },
];

// Get default configuration
export const getDefaultConfig = (): DashboardConfig => ({
  title: 'monodog Dashboard',
  description: 'Visual management of our monorepo packages',
  packageTypes: ['app', 'lib', 'tool', 'service'],
  customFields: ['team', 'priority', 'environment'],
  features: {
    healthChecks: true,
    ciIntegration: true,
    dependencyGraph: true,
    publishControl: true,
    searchAndFilter: true,
    configurationInspector: true,
  },
  branding: {
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
  },
  monorepo: {
    structure: 'standard',
    packageManager: 'pnpm',
    directories: ['apps', 'packages', 'libs'],
    ignorePatterns: ['node_modules', 'dist', '.git'],
  },
});

// Merge configurations with defaults
export const mergeWithDefaults = (
  config: Partial<DashboardConfig>
): DashboardConfig => {
  const defaults = getDefaultConfig();
  return {
    ...defaults,
    ...config,
    features: { ...defaults.features, ...config.features },
    branding: { ...defaults.branding, ...config.branding },
    monorepo: { ...defaults.monorepo, ...config.monorepo },
  };
};

// Validate configuration
export const validateConfig = (
  config: DashboardConfig
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.title || config.title.trim() === '') {
    errors.push('Dashboard title is required');
  }

  if (
    config.monorepo?.directories &&
    config.monorepo.directories.length === 0
  ) {
    errors.push('At least one package directory is required');
  }

  if (
    config.branding?.primaryColor &&
    !isValidHexColor(config.branding.primaryColor)
  ) {
    errors.push('Primary color must be a valid hex color');
  }

  if (
    config.branding?.secondaryColor &&
    !isValidHexColor(config.branding.secondaryColor)
  ) {
    errors.push('Secondary color must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to validate hex colors
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Convert comma-separated string to array
export const stringToArray = (value: string): string[] => {
  return value
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

// Convert array to comma-separated string
export const arrayToString = (arr: string[] | undefined): string => {
  return arr ? arr.join(', ') : '';
};

// Format feature key for display
export const formatFeatureKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').trim();
};
