import {
  scanMonorepo,
  calculatePackageHealth,
} from '../utils/utilities';

import {
  funCheckBuildStatus,
  funCheckLintStatus,
  funCheckSecurityAudit,
} from '../utils/monorepo-scanner';

import * as PrismaPkg from '@prisma/client';
const PrismaClient = (PrismaPkg as any).PrismaClient || (PrismaPkg as any).default || PrismaPkg;
const prisma = new PrismaClient();

export const getHealthSummaryService = async () => {
  const packageHealthData = await prisma.packageHealth.findMany();
  console.log('packageHealthData -->', packageHealthData.length);

  // Transform the data to match the expected frontend format
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
      health: health,
      isHealthy: pkg.packageOverallScore >= 80,
    };
  });

  // Calculate summary statistics
  const total = packages.length;
  const healthy = packages.filter((pkg: any) => pkg.isHealthy).length;
  const unhealthy = packages.filter((pkg: any) => !pkg.isHealthy).length;
  const averageScore =
    packages.length > 0
      ? packages.reduce((sum: any, pkg: any) => sum + pkg.health.overallScore, 0) /
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
  const packages = scanMonorepo(rootDir);
  console.log('packages -->', packages.length);
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

        console.log(pkg.name, '-->', health, packageStatus);

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
            updatedAt: new Date()
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
        // update related package status as well
        await prisma.package.update({
          where: { name: pkg.name },
          data: { status: packageStatus },
        });
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
  return {
    packages: healthMetrics.filter(h => !h.error),
    summary: {
      total: packages.length,
      healthy: healthMetrics.filter(h => h.isHealthy).length,
      unhealthy: healthMetrics.filter(h => !h.isHealthy).length,
      averageScore:
        healthMetrics
          .filter(h => h.health)
          .reduce((sum, h) => sum + h.health!.overallScore, 0) /
        healthMetrics.filter(h => h.health).length,
    },
  };
}
