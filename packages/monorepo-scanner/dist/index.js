"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanner = exports.MonorepoScanner = void 0;
exports.quickScan = quickScan;
exports.generateReports = generateReports;
exports.scanForFiles = scanForFiles;
exports.funCheckBuildStatus = funCheckBuildStatus;
exports.funCheckTestCoverage = funCheckTestCoverage;
exports.funCheckLintStatus = funCheckLintStatus;
exports.funCheckSecurityAudit = funCheckSecurityAudit;
const helpers_1 = require("@monodog/utils/helpers");
const cache_1 = require("./cache");
const health_1 = require("./health");
const export_1 = require("./export");
const git_1 = require("./git");
const files_1 = require("./files");
class MonorepoScanner {
    constructor(rootDir = process.cwd()) {
        this.rootDir = rootDir;
        this.cache = new cache_1.CacheManager();
    }
    async scan() {
        const startTime = Date.now();
        try {
            const cacheKey = 'full-scan';
            const cached = this.cache.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            console.log('Starting monorepo scan...');
            const packages = (0, helpers_1.scanMonorepo)(this.rootDir);
            console.log(`Found ${packages.length} packages`);
            const stats = (0, helpers_1.generateMonorepoStats)(packages);
            const dependencyGraph = (0, helpers_1.generateDependencyGraph)(packages);
            const circularDependencies = (0, helpers_1.findCircularDependencies)(packages);
            const outdatedPackages = (0, health_1.findOutdatedPackages)(packages);
            const result = {
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
        }
        catch (error) {
            console.error('Error during scan:', error);
            throw error;
        }
    }
    async generatePackageReports() {
        const packages = (0, helpers_1.scanMonorepo)(this.rootDir);
        const reports = [];
        for (const pkg of packages) {
            try {
                const report = await this.generatePackageReport(pkg);
                reports.push(report);
            }
            catch (error) {
                console.error(`Error generating report for ${pkg.name}:`, error);
            }
        }
        return reports;
    }
    async generatePackageReport(pkg) {
        const health = await (0, health_1.assessPackageHealth)(pkg);
        const size = (0, helpers_1.getPackageSize)(pkg.path);
        const outdatedDeps = (0, helpers_1.checkOutdatedDependencies)(pkg);
        const lastModified = (0, git_1.getLastModified)(pkg.path);
        const gitInfo = await (0, git_1.getGitInfo)(pkg.path);
        return {
            package: pkg,
            health,
            size,
            outdatedDeps,
            lastModified,
            gitInfo,
        };
    }
    async checkBuildStatus(pkg) {
        return (0, health_1.checkBuildStatus)(pkg);
    }
    async checkTestCoverage(pkg) {
        return (0, health_1.checkTestCoverage)(pkg);
    }
    async checkLintStatus(pkg) {
        return (0, health_1.checkLintStatus)(pkg);
    }
    async checkSecurityAudit(pkg) {
        return (0, health_1.checkSecurityAudit)(pkg);
    }
    scanForFileTypes(fileTypes) {
        return (0, files_1.scanForFileTypes)(this.rootDir, fileTypes);
    }
    clearCache() {
        this.cache.clearCache();
    }
    exportResults(results, format) {
        return (0, export_1.exportResults)(results, format);
    }
}
exports.MonorepoScanner = MonorepoScanner;
// Export default instance
exports.scanner = new MonorepoScanner();
// Export convenience functions
async function quickScan() {
    return exports.scanner.scan();
}
async function generateReports() {
    return exports.scanner.generatePackageReports();
}
function scanForFiles(fileTypes) {
    return exports.scanner.scanForFileTypes(fileTypes);
}
async function funCheckBuildStatus(pkg) {
    return exports.scanner.checkBuildStatus(pkg);
}
async function funCheckTestCoverage(pkg) {
    return exports.scanner.checkTestCoverage(pkg);
}
async function funCheckLintStatus(pkg) {
    return exports.scanner.checkLintStatus(pkg);
}
async function funCheckSecurityAudit(pkg) {
    return exports.scanner.checkSecurityAudit(pkg);
}
