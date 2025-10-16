// Shared types for the dashboard components

export interface Package {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool' | string; // Allow custom types
  path: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  maintainers?: string[];
  description?: string;
  license?: string;
  repository?: string;
  // Custom fields that can be added by users
  customFields?: Record<string, any>;
}

export interface PackageStats {
  total: number;
  apps: number;
  libs: number;
  tools: number;
  custom: number;
  totalDependencies: number;
}

export interface DashboardState {
  packages: Package[];
  searchTerm: string;
  selectedType: string;
  showConfig: boolean;
  showSetupGuide: boolean;
}
