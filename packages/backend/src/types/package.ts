/**
 * Package and monorepo related types
 */

export interface PackageInfo {
  name: string;
  version: string;
  type: string; //'app' | 'lib' | 'tool';
  path: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  scripts: Record<string, string>;
  maintainers: string[];
  description?: string;
  license?: string;
  repository?: Record<string, string>;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  latest?: string;
  status?: 'up-to-date' | 'outdated' | 'major-update' | 'unknown';
  outdated?: boolean;
}

export interface MonorepoStats {
  totalPackages: number;
  apps: number;
  libraries: number;
  tools: number;
  healthyPackages: number;
  warningPackages: number;
  errorPackages: number;
  outdatedDependencies: number;
  totalDependencies: number;
}
