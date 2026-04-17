/**
 * Scanner and report related types
 */

import type { PackageInfo, DependencyInfo } from './package';
import type { PackageHealth } from './health';
import type { MonorepoStats } from './package';

/**
 * Dependency Graph representation
 */
export interface DependencyGraph {
  nodes: Array<{ id: string; label: string }>;
  edges: Array<{ source: string; target: string }>;
}

export interface ScanResult {
  packages: PackageInfo[];
  stats: MonorepoStats;
  dependencyGraph: DependencyGraph;
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
