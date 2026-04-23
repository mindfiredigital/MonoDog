import { PackageInfo } from '@monodog/utils/helpers';
import {
  CIProvider,
  CIBuild,
  CIBuildStep,
  CIArtifact,
  CICoverage,
  CITestResults,
  CITestSuite,
  CITest,
  CIPackageStatus,
  CIMonorepoStatus,
} from './types';
export {
  CIProvider,
  CIBuild,
  CIBuildStep,
  CIArtifact,
  CICoverage,
  CITestResults,
  CITestSuite,
  CITest,
  CIPackageStatus,
  CIMonorepoStatus,
};

import { CacheManager } from './cache';
import {
  calculateSuccessRate,
  calculateAverageDuration,
  determinePackageHealth,
  identifyIssues,
} from './metrics';
import {
  fetchBuildsFromProvider,
  getBuildLogs,
  triggerBuild,
  getBuildArtifacts,
} from './api/mock';

export class CIStatusManager {
  private providers: Map<string, CIProvider> = new Map();
  private cache: CacheManager;

  constructor() {
    this.cache = new CacheManager();
    this.initializeDefaultProviders();
  }

  private initializeDefaultProviders(): void {
    // GitHub Actions
    this.addProvider({
      name: 'GitHub Actions',
      type: 'github',
      baseUrl: 'https://api.github.com',
    });

    // GitLab CI
    this.addProvider({
      name: 'GitLab CI',
      type: 'gitlab',
      baseUrl: 'https://gitlab.com/api/v4',
    });

    // CircleCI
    this.addProvider({
      name: 'CircleCI',
      type: 'circleci',
      baseUrl: 'https://circleci.com/api/v2',
    });
  }

  addProvider(provider: CIProvider): void {
    this.providers.set(provider.name, provider);
  }

  removeProvider(name: string): void {
    this.providers.delete(name);
  }

  getProviders(): CIProvider[] {
    return Array.from(this.providers.values());
  }

  async getPackageStatus(
    packageName: string,
    providerName?: string
  ): Promise<CIPackageStatus | null> {
    const cacheKey = `package-status-${packageName}-${providerName || 'all'}`;
    const cached = this.cache.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let builds: CIBuild[] = [];

      if (providerName) {
        const provider = this.providers.get(providerName);
        if (provider) {
          builds = await fetchBuildsFromProvider(provider, packageName);
        }
      } else {
        // Fetch from all providers
        for (const provider of this.providers.values()) {
          const providerBuilds = await fetchBuildsFromProvider(
            provider,
            packageName
          );
          builds.push(...providerBuilds);
        }
      }

      if (builds.length === 0) {
        return null;
      }

      // Sort builds by start time (newest first)
      builds.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      const lastBuild = builds[0];
      const buildHistory = builds.slice(0, 10); // Last 10 builds
      const successRate = calculateSuccessRate(builds);
      const averageDuration = calculateAverageDuration(builds);
      const isHealthy = determinePackageHealth(builds);
      const issues = identifyIssues(builds);

      const status: CIPackageStatus = {
        packageName,
        lastBuild,
        buildHistory,
        successRate,
        averageDuration,
        lastCommit: lastBuild.commit,
        lastCommitDate: lastBuild.startTime,
        branch: lastBuild.branch,
        isHealthy,
        issues,
      };

      this.cache.setCache(cacheKey, status);
      return status;
    } catch (error) {
      console.error(`Error fetching CI status for ${packageName}:`, error);
      return null;
    }
  }

  async getMonorepoStatus(packages: PackageInfo[]): Promise<CIMonorepoStatus> {
    const cacheKey = 'monorepo-ci-status';
    const cached = this.cache.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const packageStatuses: CIPackageStatus[] = [];
    const allBuilds: CIBuild[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const packageCoverage: Record<string, number> = {};

    // Get status for each package
    for (const pkg of packages) {
      const status = await this.getPackageStatus(pkg.name);
      if (status) {
        packageStatuses.push(status);
        allBuilds.push(...status.buildHistory);

        // Aggregate test results
        if (status.lastBuild?.tests) {
          totalTests += status.lastBuild.tests.total;
          passedTests += status.lastBuild.tests.passed;
          failedTests += status.lastBuild.tests.failed;
        }

        // Aggregate coverage
        if (status.lastBuild?.coverage) {
          packageCoverage[pkg.name] = status.lastBuild.coverage.percentage;
        }
      }
    }

    // Calculate overall metrics
    const totalPackages = packages.length;
    const healthyPackages = packageStatuses.filter(s => s.isHealthy).length;
    const warningPackages = packageStatuses.filter(
      s => !s.isHealthy && s.issues.length < 3
    ).length;
    const errorPackages = packageStatuses.filter(
      s => !s.isHealthy && s.issues.length >= 3
    ).length;
    const overallHealth =
      totalPackages > 0 ? (healthyPackages / totalPackages) * 100 : 0;

    // Sort builds by time
    allBuilds.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    const recentBuilds = allBuilds.slice(0, 20);
    const failedBuilds = allBuilds.filter(b => b.status === 'failed');

    // Calculate overall coverage
    const coverageValues = Object.values(packageCoverage);
    const overallCoverage =
      coverageValues.length > 0
        ? coverageValues.reduce((sum, val) => sum + val, 0) /
          coverageValues.length
        : 0;

    const status: CIMonorepoStatus = {
      totalPackages,
      healthyPackages,
      warningPackages,
      errorPackages,
      overallHealth,
      packages: packageStatuses,
      recentBuilds,
      failedBuilds,
      coverage: {
        overall: overallCoverage,
        packages: packageCoverage,
      },
      tests: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      },
    };

    this.cache.setCache(cacheKey, status);
    return status;
  }

  async getBuildLogs(buildId: string, providerName: string): Promise<string> {
    return getBuildLogs(buildId, providerName);
  }

  async triggerBuild(
    packageName: string,
    providerName: string,
    branch: string = 'main'
  ): Promise<{ success: boolean; buildId?: string; error?: string }> {
    return triggerBuild(packageName, providerName, branch);
  }

  async getBuildArtifacts(
    buildId: string,
    providerName: string
  ): Promise<CIArtifact[]> {
    return getBuildArtifacts(buildId, providerName);
  }
}

// Export default instance
export const ciStatusManager = new CIStatusManager();

// Export convenience functions
export async function getPackageCIStatus(
  packageName: string
): Promise<CIPackageStatus | null> {
  return ciStatusManager.getPackageStatus(packageName);
}

export async function getMonorepoCIStatus(
  packages: PackageInfo[]
): Promise<CIMonorepoStatus> {
  return ciStatusManager.getMonorepoStatus(packages);
}

export async function triggerPackageBuild(
  packageName: string,
  providerName: string,
  branch?: string
): Promise<{ success: boolean; buildId?: string; error?: string }> {
  return ciStatusManager.triggerBuild(packageName, providerName, branch);
}
