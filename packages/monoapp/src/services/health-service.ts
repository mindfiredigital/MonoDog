import {
  scanMonorepo,
  calculatePackageHealth,
} from '../utils/utilities';

import {
  funCheckBuildStatus,
  funCheckLintStatus,
  funCheckSecurityAudit,
} from '../utils/monorepo-scanner';

import { AppLogger } from '../middleware/logger';
import { PackageHealthRepository, PackageRepository } from '../repositories';
import type { TransformedPackageHealth, HealthResponse, PackageHealthModel } from '../types/database';

// Track in-flight health refresh requests to prevent duplicates
let inFlightHealthRefresh: Promise<HealthResponse> | null = null;

export const getHealthSummaryService = async (): Promise<HealthResponse> => {
  const packageHealthData = await PackageHealthRepository.findAll() as PackageHealthModel[];
  AppLogger.debug('packageHealthData count: ' + packageHealthData.length);

  // Transform the data to match the expected frontend format
  const packages = packageHealthData.map((pkg: PackageHealthModel) => {
    const health = {
      buildStatus: pkg.packageBuildStatus,
      testCoverage: pkg.packageTestCoverage,
      lintStatus: pkg.packageLintStatus,
      securityAudit: pkg.packageSecurity,
      overallScore: pkg.packageOverallScore,
    };

    return {
      packageName: pkg.packageName,
      health: health,
      isHealthy: pkg.packageOverallScore >= 80,
    };
  });

  // Calculate summary statistics
  const total = packages.length;
  const healthy = packages.filter((pkg: TransformedPackageHealth) => pkg.isHealthy).length;
  const unhealthy = packages.filter((pkg: TransformedPackageHealth) => !pkg.isHealthy).length;
  const averageScore =
    packages.length > 0
      ? packages.reduce((sum: number, pkg: TransformedPackageHealth) => sum + pkg.health.overallScore, 0) /
      packages.length
      : 0;

  return {
    packages: packages,
    summary: {
      total: total,
      healthy: healthy,
      unhealthy: unhealthy,
      averageScore: averageScore,
    },
  };
}

export const healthRefreshService = async (rootDir: string) => {
  // If a health refresh is already in progress, return the in-flight promise
  if (inFlightHealthRefresh) {
    AppLogger.info('Health refresh already in progress, returning cached promise');
    return inFlightHealthRefresh;
  }

  // Create and store the health refresh promise
  inFlightHealthRefresh = (async () => {
    try {
      const packages = scanMonorepo(rootDir);
      AppLogger.debug('packages count: ' + packages.length);
      const healthMetrics = await Promise.all(
        packages.map(async pkg => {
          try {
            // Await each health check function since they return promises
            const buildStatus = await funCheckBuildStatus(pkg);
            const testCoverage = 0; //await funCheckTestCoverage(pkg); // skip test coverage for now
            const lintStatus = await funCheckLintStatus(pkg);
            const securityAudit = await funCheckSecurityAudit(pkg);
            // Calculate overall health score
            const overallScore = calculatePackageHealth(
              buildStatus,
              testCoverage,
              lintStatus,
              securityAudit
            );

            const health = {
              buildStatus: buildStatus,
              testCoverage: testCoverage,
              lintStatus: lintStatus,
              securityAudit: securityAudit,
              overallScore: overallScore.overallScore,
            };
            const packageStatus =
              health.overallScore >= 80
                ? 'healthy'
                : health.overallScore >= 60 && health.overallScore < 80
                  ? 'warning'
                  : 'error';

            AppLogger.debug(`${pkg.name}: ${packageStatus}`, health);

            await PackageHealthRepository.upsert({
              packageName: pkg.name,
              packageOverallScore: overallScore.overallScore,
              packageBuildStatus: buildStatus,
              packageTestCoverage: testCoverage,
              packageLintStatus: lintStatus,
              packageSecurity: securityAudit,
              packageDependencies: '',
            });
            // update related package status as well
            await PackageRepository.updateStatus(pkg.name, packageStatus);
            return {
              packageName: pkg.name,
              health,
              isHealthy: health.overallScore >= 80,
            };
          } catch (error) {
            return {
              packageName: pkg.name,
              health: {
                "buildStatus": "",
                "testCoverage": 0,
                "lintStatus": "",
                "securityAudit": "",
                "overallScore": 0
              },
              isHealthy: false,
              error: 'Failed to fetch health metrics1',
            };
          }
        })
      );

      const result: HealthResponse = {
        packages: healthMetrics.filter(h => !h.error),
        summary: {
          total: packages.length,
          healthy: healthMetrics.filter(h => h.isHealthy).length,
          unhealthy: healthMetrics.filter(h => !h.isHealthy).length,
          averageScore:
            healthMetrics.filter(h => h.health).length > 0
              ? healthMetrics
                  .filter(h => h.health)
                  .reduce((sum, h) => sum + h.health!.overallScore, 0) /
                healthMetrics.filter(h => h.health).length
              : 0,
        },
      };

      return result;
    } finally {
      // Clear the in-flight promise after completion
      inFlightHealthRefresh = null;
    }
  })();

  return inFlightHealthRefresh;
}
