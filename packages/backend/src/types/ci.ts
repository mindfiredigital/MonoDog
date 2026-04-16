/**
 * CI/CD related types
 */

import type { PackageInfo } from './package';

export interface CIProvider {
  name: string;
  type:
    | 'github'
    | 'gitlab'
    | 'jenkins'
    | 'circleci'
    | 'travis'
    | 'azure'
    | 'custom';
  baseUrl: string;
  apiToken?: string;
}

export interface CIBuild {
  id: string;
  status: 'success' | 'failed' | 'running' | 'pending' | 'cancelled';
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  url: string;
  packageName?: string;
  workflowName?: string;
  jobName?: string;
  steps: CIBuildStep[];
  artifacts?: CIArtifact[];
  coverage?: CICoverage;
  tests?: CITestResults;
}

export interface CIBuildStep {
  name: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  duration: number;
  logs?: string;
  error?: string;
}

export interface CIArtifact {
  name: string;
  type: 'build' | 'test' | 'coverage' | 'documentation';
  size: number;
  url: string;
  expiresAt?: Date;
}

export interface CICoverage {
  percentage: number;
  lines: number;
  functions: number;
  branches: number;
  statements: number;
  uncoveredLines?: number[];
}

export interface CITestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: CITestSuite[];
}

export interface CITestSuite {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  tests: CITest[];
  duration: number;
}

export interface CITest {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  output?: string;
}

export interface CIPackageStatus {
  packageName: string;
  lastBuild?: CIBuild;
  buildHistory: CIBuild[];
  successRate: number;
  averageDuration: number;
  lastCommit: string;
  lastCommitDate: Date;
  branch: string;
  isHealthy: boolean;
  issues: string[];
}

export interface CIMonorepoStatus {
  totalPackages: number;
  healthyPackages: number;
  warningPackages: number;
  errorPackages: number;
  overallHealth: number;
  packages: CIPackageStatus[];
  recentBuilds: CIBuild[];
  failedBuilds: CIBuild[];
  coverage: {
    overall: number;
    packages: Record<string, number>;
  };
  tests: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  };
}
