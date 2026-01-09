"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRefreshService = exports.getHealthSummaryService = void 0;
const utilities_1 = require("../utils/utilities");
const monorepo_scanner_1 = require("../utils/monorepo-scanner");
const PrismaPkg = __importStar(require("@prisma/client"));
const PrismaClient = PrismaPkg.PrismaClient || PrismaPkg.default || PrismaPkg;
const prisma = new PrismaClient();
const getHealthSummaryService = async () => {
    const packageHealthData = await prisma.packageHealth.findMany();
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
    return {
        packages: healthMetrics.filter(h => !h.error),
        summary: {
            total: packages.length,
            healthy: healthMetrics.filter(h => h.isHealthy).length,
            unhealthy: healthMetrics.filter(h => !h.isHealthy).length,
            averageScore: healthMetrics
                .filter(h => h.health)
                .reduce((sum, h) => sum + h.health.overallScore, 0) /
                healthMetrics.filter(h => h.health).length,
        },
    };
};
exports.healthRefreshService = healthRefreshService;
