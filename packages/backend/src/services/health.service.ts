import path from 'path';
import { prisma } from '../db/prisma';
import { scanMonorepo, calculatePackageHealth } from '@monodog/utils/helpers';
import {
  funCheckBuildStatus,
  funCheckTestCoverage,
  funCheckLintStatus,
  funCheckSecurityAudit,
} from '@monodog/monorepo-scanner';

export const getSystemHealth = () => {
  return {
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
    services: {
      scanner: 'active',
      ci: 'active',
      database: 'active',
    },
  };
};
export const getPackageHealthMetrics = async (name: string) => {
  const packages = scanMonorepo(process.cwd());

  const pkg = packages.find(p => p.name === name);

  if (!pkg) {
    throw new Error('Package not found');
  }

  const buildStatus = await funCheckBuildStatus(pkg);
  const testCoverage = await funCheckTestCoverage(pkg);
  const lintStatus = await funCheckLintStatus(pkg);
  const securityAudit = await funCheckSecurityAudit(pkg);

  const overallScore = calculatePackageHealth(
    buildStatus,
    testCoverage,
    lintStatus,
    securityAudit
  );

  return {
    packageName: name,
    health: {
      buildStatus,
      testCoverage,
      lintStatus,
      securityAudit,
      overallScore: overallScore.overallScore,
      lastUpdated: new Date(),
    },

    dependencies: {
      dependencies: pkg.dependencies || [],
      devDependencies: pkg.devDependencies || [],
      peerDependencies: pkg.peerDependencies || [],
    },
  };
};

export const getAllPackagesHealthMetrics = async () => {
  const packageHealthData = await prisma.packageHealth.findMany();

  const packages = packageHealthData.map((pkg: any) => {
    const health = {
      buildStatus: pkg.packageBuildStatus,
      testCoverage: pkg.packageTestCoverage,
      lintStatus: pkg.packageLintStatus,
      securityAudit: pkg.packageSecurity,
      overallScore: pkg.packageOverallScore,
    };

    return {
      packageName: pkg.packageName,
      health,
      isHealthy: pkg.packageOverallScore >= 80,
    };
  });

  const total = packages.length;
  const healthy = packages.filter((pkg: any) => pkg.isHealthy).length;
  const unhealthy = packages.filter((pkg: any) => !pkg.isHealthy).length;

  const averageScore =
    packages.length > 0
      ? packages.reduce(
          (sum: number, pkg: any) => sum + pkg.health.overallScore,
          0
        ) / packages.length
      : 0;

  return {
    packages,
    summary: {
      total,
      healthy,
      unhealthy,
      averageScore,
    },
  };
};

export const refreshPackagesHealth = async (rootPath?: string) => {
  const resolvedRootPath = rootPath || process.cwd();
  const rootDir = path.resolve(resolvedRootPath);

  const packages = scanMonorepo(rootDir);

  const healthMetrics = await Promise.all(
    packages.map(async (pkg: any) => {
      try {
        const buildStatus = await funCheckBuildStatus(pkg);
        const testCoverage = await funCheckTestCoverage(pkg);
        const lintStatus = await funCheckLintStatus(pkg);
        const securityAudit = await funCheckSecurityAudit(pkg);

        const overallScore = calculatePackageHealth(
          buildStatus,
          testCoverage,
          lintStatus,
          securityAudit
        );

        const health = {
          buildStatus,
          testCoverage,
          lintStatus,
          securityAudit,
          overallScore: overallScore.overallScore,
        };

        const packageStatus =
          health.overallScore >= 80
            ? 'healthy'
            : health.overallScore >= 60
              ? 'warning'
              : 'error';

        await prisma.packageHealth.upsert({
          where: {
            packageName: pkg.name,
          },
          update: {
            packageOverallScore: overallScore.overallScore,
            packageBuildStatus: buildStatus,
            packageTestCoverage: testCoverage,
            packageLintStatus: lintStatus,
            packageSecurity: securityAudit,
            packageDependencies: '',
            updatedAt: new Date(),
            package: {
              update: {
                where: { name: pkg.name },
                data: { status: packageStatus },
              },
            },
          },
          create: {
            packageName: pkg.name,
            packageOverallScore: overallScore.overallScore,
            packageBuildStatus: buildStatus,
            packageTestCoverage: testCoverage,
            packageLintStatus: lintStatus,
            packageSecurity: securityAudit,
            packageDependencies: '',
          },
        });

        return {
          packageName: pkg.name,
          health,
          isHealthy: health.overallScore >= 80,
        };
      } catch {
        return {
          packageName: pkg.name,
          health: null,
          isHealthy: false,
          error: 'Failed to fetch health metrics',
        };
      }
    })
  );

  return {
    packages: healthMetrics,
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
};
