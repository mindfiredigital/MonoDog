import {
  PackageInfo,
  DependencyInfo,
  PackageHealth,
  MonorepoStats,
} from '@monodog/utils/helpers';

export interface ScanResult {
  packages: PackageInfo[];
  stats: MonorepoStats;
  dependencyGraph: any;
  circularDependencies: string[][];
  outdatedPackages: string[];
  scanTimestamp: Date;
  scanDuration: number;
}

export interface PackageReport {
  package: PackageInfo;
  health: PackageHealth;
  size: { size: number; files: number };
  outdatedDeps: DependencyInfo[];
  lastModified: Date;
  gitInfo?: {
    lastCommit: string;
    lastCommitDate: Date;
    author: string;
    branch: string;
  };
}
