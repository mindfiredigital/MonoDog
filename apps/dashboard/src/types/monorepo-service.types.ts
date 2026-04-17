/**
 * Monorepo Service Types
 */

export interface Package {
  name: string;
  version: string;
  description?: string;
  path: string;
  type: 'app' | 'lib' | 'tool';
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  latest?: string;
  outdated?: boolean;
}

export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp?: number;
  description: string;
}

export interface BuildStatus {
  packageName: string;
  status: 'success' | 'failed' | 'pending';
  duration: number;
  timestamp: number;
}

export interface BuildStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  steps?: Array<{ name: string; status: string }>;
}

export interface ConfigFile {
  id: string;
  name: string;
  path: string;
  type: string;
  content: string;
  size: number;
  lastModified: string;
  hasSecrets: boolean;
}
