/**
 * Database related types
 */

export interface Commit {
  hash: string;
  message?: string;
  author?: string;
  date: Date;
  type?: string;
  packageName: string;
}

export interface PackageHealthModel {
  packageName: string;
  packageOverallScore: number;
  packageBuildStatus: string;
  packageTestCoverage: number;
  packageLintStatus: string;
  packageSecurity: string;
  packageDependencies?: string;
  updatedAt?: Date;
}

export interface TransformedPackageHealth {
  packageName: string;
  health: {
    buildStatus: string;
    testCoverage: number;
    lintStatus: string;
    securityAudit: string;
    overallScore: number;
  };
  isHealthy: boolean;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  unhealthy: number;
  averageScore: number;
}

export interface HealthResponse {
  packages: TransformedPackageHealth[];
  summary: HealthSummary;
}

export interface PackageModel {
  name: string;
  version?: string;
  type?: string;
  path?: string;
  description?: string;
  license?: string;
  repository?: string;
  scripts?: string;
  dependencies?: string;
  devDependencies?: string;
  peerDependencies?: string;
  maintainers?: string;
  status?: string;
  createdAt?: Date;
  lastUpdated?: Date;
}

export type ConfigUpdateData = Record<string, unknown>;
