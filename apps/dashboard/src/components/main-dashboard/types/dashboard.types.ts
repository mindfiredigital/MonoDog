export interface Package {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool' | 'service';
  status: 'healthy' | 'warning' | 'error' | 'building';
  description: string;
  lastUpdated: string;
  dependencies: string[];
  tags: string[];
  maintainers: string[];
  devDependencies: string[];
  peerDependencies: string[];
  path: string;
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
