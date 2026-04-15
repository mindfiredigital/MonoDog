import {
  PackageInfo,
  scanMonorepo,
  generateMonorepoStats,
  findCircularDependencies,
  generateDependencyGraph,
  checkOutdatedDependencies,
  getPackageSize,
  PackageHealth,
} from '@monodog/utils/helpers';

import { ScanResult, PackageReport } from './types';
export { ScanResult, PackageReport };

import { CacheManager } from './cache';
import {
  assessPackageHealth,
  findOutdatedPackages,
  checkBuildStatus,
  checkTestCoverage,
  checkLintStatus,
  checkSecurityAudit,
} from './health';
import { exportResults } from './export';
import { getGitInfo, getLastModified } from './git';
import { scanForFileTypes } from './files';

export class MonorepoScanner {
  private rootDir: string;
  private cache: CacheManager;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.cache = new CacheManager();
  }

  async scan(): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      const cacheKey = 'full-scan';
      const cached = this.cache.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      console.log('Starting monorepo scan...');

      const packages = scanMonorepo(this.rootDir);
      console.log(`Found ${packages.length} packages`);

      const stats = generateMonorepoStats(packages);
      const dependencyGraph = generateDependencyGraph(packages);
      const circularDependencies = findCircularDependencies(packages);
      const outdatedPackages = findOutdatedPackages(packages);

      const result: ScanResult = {
        packages,
        stats,
        dependencyGraph,
        circularDependencies,
        outdatedPackages,
        scanTimestamp: new Date(),
        scanDuration: Date.now() - startTime,
      };

      this.cache.setCache(cacheKey, result);

      console.log(`Scan completed in ${result.scanDuration}ms`);
      return result;
    } catch (error) {
      console.error('Error during scan:', error);
      throw error;
    }
  }

  async generatePackageReports(): Promise<PackageReport[]> {
    const packages = scanMonorepo(this.rootDir);
    const reports: PackageReport[] = [];

    for (const pkg of packages) {
      try {
        const report = await this.generatePackageReport(pkg);
        reports.push(report);
      } catch (error) {
        console.error(`Error generating report for ${pkg.name}:`, error);
      }
    }

    return reports;
  }

  async generatePackageReport(pkg: PackageInfo): Promise<PackageReport> {
    const health = await assessPackageHealth(pkg);
    const size = getPackageSize(pkg.path);
    const outdatedDeps = checkOutdatedDependencies(pkg);
    const lastModified = getLastModified(pkg.path);
    const gitInfo = await getGitInfo(pkg.path);

    return {
      package: pkg,
      health,
      size,
      outdatedDeps,
      lastModified,
      gitInfo,
    };
  }

  async checkBuildStatus(
    pkg: PackageInfo
  ): Promise<PackageHealth['buildStatus']> {
    return checkBuildStatus(pkg);
  }

  async checkTestCoverage(pkg: PackageInfo): Promise<number> {
    return checkTestCoverage(pkg);
  }

  async checkLintStatus(
    pkg: PackageInfo
  ): Promise<PackageHealth['lintStatus']> {
    return checkLintStatus(pkg);
  }

  async checkSecurityAudit(
    pkg: PackageInfo
  ): Promise<PackageHealth['securityAudit']> {
    return checkSecurityAudit(pkg);
  }

  scanForFileTypes(fileTypes: string[]): Record<string, string[]> {
    return scanForFileTypes(this.rootDir, fileTypes);
  }

  clearCache(): void {
    this.cache.clearCache();
  }

  exportResults(results: ScanResult, format: 'json' | 'csv' | 'html'): string {
    return exportResults(results, format);
  }
}

// Export default instance
export const scanner = new MonorepoScanner();

// Export convenience functions
export async function quickScan(): Promise<ScanResult> {
  return scanner.scan();
}

export async function generateReports(): Promise<PackageReport[]> {
  return scanner.generatePackageReports();
}

export function scanForFiles(fileTypes: string[]): Record<string, string[]> {
  return scanner.scanForFileTypes(fileTypes);
}

export async function funCheckBuildStatus(
  pkg: PackageInfo
): Promise<PackageHealth['buildStatus']> {
  return scanner.checkBuildStatus(pkg);
}

export async function funCheckTestCoverage(pkg: PackageInfo): Promise<number> {
  return scanner.checkTestCoverage(pkg);
}

export async function funCheckLintStatus(
  pkg: PackageInfo
): Promise<PackageHealth['lintStatus']> {
  return scanner.checkLintStatus(pkg);
}

export async function funCheckSecurityAudit(
  pkg: PackageInfo
): Promise<PackageHealth['securityAudit']> {
  return scanner.checkSecurityAudit(pkg);
}
