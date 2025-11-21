// Shared types for configuration components

export interface DashboardConfig {
  title?: string;
  description?: string;
  packageTypes?: string[];
  customFields?: string[];
  features?: {
    healthChecks?: boolean;
    ciIntegration?: boolean;
    dependencyGraph?: boolean;
    publishControl?: boolean;
    searchAndFilter?: boolean;
    configurationInspector?: boolean;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  monorepo?: {
    structure?: 'standard' | 'custom';
    packageManager?: 'pnpm' | 'npm' | 'yarn' | 'lerna' | 'nx';
    directories?: string[];
    ignorePatterns?: string[];
  };
}

export interface ConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DashboardConfig) => void;
  currentConfig: DashboardConfig;
}

export type ConfigurationTab = 'general' | 'features' | 'branding' | 'monorepo';

export interface TabDefinition {
  id: ConfigurationTab;
  label: string;
  icon: string;
}

export interface ConfigurationTabsProps {
  activeTab: ConfigurationTab;
  onTabChange: (tab: ConfigurationTab) => void;
}

export interface SettingsComponentProps {
  config: DashboardConfig;
  onConfigChange: (updates: Partial<DashboardConfig>) => void;
}
