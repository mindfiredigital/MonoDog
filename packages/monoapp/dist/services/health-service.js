"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRefreshService = exports.getHealthSummaryService = void 0;
const utilities_1 = require("../utils/utilities");
const monorepo_scanner_1 = require("../utils/monorepo-scanner");
const repositories_1 = require("../repositories");
// Track in-flight health refresh requests to prevent duplicates
let inFlightHealthRefresh = null;
const getHealthSummaryService = async () => {
    const packageHealthData = await repositories_1.PackageHealthRepository.findAll();
    console.log('packageHealthData -->', packageHealthData.length);
    // Transform the data to match the expected frontend format
    const packages = packageHealthData.map((pkg) => {
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
    const healthy = packages.filter((pkg) => pkg.isHealthy).length;
    const unhealthy = packages.filter((pkg) => !pkg.isHealthy).length;
    const averageScore = packages.length > 0
        ? packages.reduce((sum, pkg) => sum + pkg.health.overallScore, 0) /
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
};
exports.getHealthSummaryService = getHealthSummaryService;
const healthRefreshService = async (rootDir) => {
    // If a health refresh is already in progress, return the in-flight promise
    if (inFlightHealthRefresh) {
        console.log('Health refresh already in progress, returning cached promise');
        return inFlightHealthRefresh;
    }
    // Create and store the health refresh promise
    inFlightHealthRefresh = (async () => {
        try {
            const packages = (0, utilities_1.scanMonorepo)(rootDir);
            console.log('packages -->', packages.length);
            const healthMetrics = await Promise.all(packages.map(async (pkg) => {
                try {
                    // Await each health check function since they return promises
                    const buildStatus = await (0, monorepo_scanner_1.funCheckBuildStatus)(pkg);
                    const testCoverage = 0; //await funCheckTestCoverage(pkg); // skip test coverage for now
                    const lintStatus = await (0, monorepo_scanner_1.funCheckLintStatus)(pkg);
                    const securityAudit = await (0, monorepo_scanner_1.funCheckSecurityAudit)(pkg);
                    // Calculate overall health score
                    const overallScore = (0, utilities_1.calculatePackageHealth)(buildStatus, testCoverage, lintStatus, securityAudit);
                    const health = {
                        buildStatus: buildStatus,
                        testCoverage: testCoverage,
                        lintStatus: lintStatus,
                        securityAudit: securityAudit,
                        overallScore: overallScore.overallScore,
                    };
                    const packageStatus = health.overallScore >= 80
                        ? 'healthy'
                        : health.overallScore >= 60 && health.overallScore < 80
                            ? 'warning'
                            : 'error';
                    console.log(pkg.name, '-->', health, packageStatus);
                    await repositories_1.PackageHealthRepository.upsert({
                        packageName: pkg.name,
                        packageOverallScore: overallScore.overallScore,
                        packageBuildStatus: buildStatus,
                        packageTestCoverage: testCoverage,
                        packageLintStatus: lintStatus,
                        packageSecurity: securityAudit,
                        packageDependencies: '',
                    });
                    // update related package status as well
                    await repositories_1.PackageRepository.updateStatus(pkg.name, packageStatus);
                    return {
                        packageName: pkg.name,
                        health,
                        isHealthy: health.overallScore >= 80,
                    };
                }
                catch (error) {
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
            }));
            const result = {
                packages: healthMetrics.filter(h => !h.error),
                summary: {
                    total: packages.length,
                    healthy: healthMetrics.filter(h => h.isHealthy).length,
                    unhealthy: healthMetrics.filter(h => !h.isHealthy).length,
                    averageScore: healthMetrics.filter(h => h.health).length > 0
                        ? healthMetrics
                            .filter(h => h.health)
                            .reduce((sum, h) => sum + h.health.overallScore, 0) /
                            healthMetrics.filter(h => h.health).length
                        : 0,
                },
            };
            return result;
        }
        finally {
            // Clear the in-flight promise after completion
            inFlightHealthRefresh = null;
        }
    })();
    return inFlightHealthRefresh;
};
exports.healthRefreshService = healthRefreshService;
