// Shared types for packages module components

export interface Package {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool' | 'service';
  status: 'healthy' | 'warning' | 'error' | 'building';
  description: string;
  lastUpdated: string;
  dependencies: number;
  tags: string[];
  maintainers: string[];
}

export interface Dependency {
  name: string;
  version: string;
  latest: string;
  status: 'up-to-date' | 'outdated' | 'major-update';
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  type: 'feature' | 'fix' | 'chore' | 'breaking';
}

export interface PackageDetail {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool';
  status: 'healthy' | 'warning' | 'error';
  description: string;
  lastUpdated: string;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  maintainers: string[];
  tags: string[];
  repository: string;
  license: string;
  scripts: Record<string, string>;
  recentCommits: Commit[];
  healthScore: number;
  buildStatus: 'success' | 'failed' | 'running' | 'unknown';
  testCoverage: number;
  lintStatus: 'pass' | 'fail' | 'warning';
}

export interface PackageStats {
  total: number;
  healthy: number;
  warnings: number;
  errors: number;
}

export interface PackageFilters {
  search: string;
  type: string;
  status: string;
}

export interface PackageSorting {
  field: 'name' | 'version' | 'lastUpdated' | 'dependencies';
  order: 'asc' | 'desc';
}

export type PackageDetailTab =
  | 'overview'
  | 'dependencies'
  | 'commits'
  | 'health'
  | 'config';

export interface PackageDetailTabsProps {
  activeTab: PackageDetailTab;
  onTabChange: (tab: PackageDetailTab) => void;
}

export interface LoadingStateProps {
  message?: string;
}

export interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}
