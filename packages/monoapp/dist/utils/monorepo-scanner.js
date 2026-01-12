"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanner = exports.MonorepoScanner = void 0;
exports.quickScan = quickScan;
exports.generateReports = generateReports;
exports.scanForFiles = scanForFiles;
exports.funCheckBuildStatus = funCheckBuildStatus;
exports.funCheckTestCoverage = funCheckTestCoverage;
exports.funCheckLintStatus = funCheckLintStatus;
exports.funCheckSecurityAudit = funCheckSecurityAudit;
// Monorepo Scanner
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const utilities_1 = require("./utilities");
class MonorepoScanner {
    constructor(rootDir = process.cwd()) {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.rootDir = rootDir;
    }
    /**
     * Performs a complete scan of the monorepo
     */
    async scan() {
        const startTime = Date.now();
        try {
            // Check cache first
            const cacheKey = 'full-scan';
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            console.log('Starting monorepo scan...');
            // Scan all packages
            const packages = (0, utilities_1.scanMonorepo)(this.rootDir);
            console.log(`📦 Found ${packages.length} packages`);
            // Generate statistics
            const stats = (0, utilities_1.generateMonorepoStats)(packages);
            // Generate dependency graph
            const dependencyGraph = (0, utilities_1.generateDependencyGraph)(packages);
            // Find circular dependencies
            const circularDependencies = (0, utilities_1.findCircularDependencies)(packages);
            // Check for outdated packages
            const outdatedPackages = this.findOutdatedPackages(packages);
            const result = {
                packages,
                stats,
                dependencyGraph,
                circularDependencies,
                outdatedPackages,
                scanTimestamp: new Date(),
                scanDuration: Date.now() - startTime,
            };
            // Cache the result
            this.setCache(cacheKey, result);
            console.log(`Scan completed in ${result.scanDuration}ms`);
            return result;
        }
        catch (error) {
            console.error('Error during scan:', error);
            throw error;
        }
    }
    /**
     * Generates detailed reports for all packages
     */
    async generatePackageReports() {
        const packages = (0, utilities_1.scanMonorepo)(this.rootDir);
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
    /**
     * Generates a detailed report for a specific package
     */
    async generatePackageReport(pkg) {
        const health = await this.assessPackageHealth(pkg);
        const size = (0, utilities_1.getPackageSize)(pkg.path);
        const outdatedDeps = (0, utilities_1.checkOutdatedDependencies)(pkg);
        const lastModified = this.getLastModified(pkg.path);
        const gitInfo = await this.getGitInfo(pkg.path);
        return {
            package: pkg,
            health,
            size,
            outdatedDeps,
            lastModified,
            gitInfo,
        };
    }
    /**
     * Assesses the health of a package
     */
    async assessPackageHealth(pkg) {
        // Check build status
        const buildStatus = await this.checkBuildStatus(pkg);
        // Check test coverage
        const testCoverage = await this.checkTestCoverage(pkg);
        // Check lint status
        const lintStatus = await this.checkLintStatus(pkg);
        // Check security audit
        const securityAudit = await this.checkSecurityAudit(pkg);
        return (0, utilities_1.calculatePackageHealth)(buildStatus, testCoverage, lintStatus, securityAudit);
    }
    /**
     * Checks if a package builds successfully
     */
    async checkBuildStatus(pkg) {
        try {
            if (pkg.scripts.build) {
                // Try to run build command
                (0, child_process_1.execSync)('npm run build', {
                    cwd: pkg.path,
                    stdio: 'pipe',
                    timeout: 30000,
                });
                return 'success';
            }
            return 'unknown';
        }
        catch (error) {
            return 'failed';
        }
    }
    /**
     * Checks test coverage for a package
     */
    // async checkTestCoverage(pkg: PackageInfo): Promise<number> {
    //   try {
    //     if (pkg.scripts.test) {
    //       // This would typically run tests and parse coverage reports
    //       // For now, return a mock value
    //       return Math.floor(Math.random() * 100);
    //     }
    //     return 0;
    //   } catch (error) {
    //     return 0;
    //   }
    // }
    async checkTestCoverage(pkg) {
        try {
            // First, check for existing coverage reports
            const coveragePaths = [
                path_1.default.join(pkg.path, 'coverage', 'coverage-summary.json'),
                path_1.default.join(pkg.path, 'coverage', 'lcov.info'),
                path_1.default.join(pkg.path, 'coverage', 'clover.xml'),
                path_1.default.join(pkg.path, 'coverage.json'),
            ];
            // Look for any coverage file that exists
            for (const coveragePath of coveragePaths) {
                if (fs_1.default.existsSync(coveragePath)) {
                    if (coveragePath.endsWith('coverage-summary.json')) {
                        try {
                            const coverage = JSON.parse(fs_1.default.readFileSync(coveragePath, 'utf8'));
                            return (coverage.total?.lines?.pct ||
                                coverage.total?.statements?.pct ||
                                0);
                        }
                        catch (error) {
                            console.warn(`Error parsing coverage file for ${pkg.name}:`, error);
                        }
                    }
                    // If we find any coverage file but can't parse it, assume coverage exists
                    return 0; // Default coverage if files exist but can't parse
                }
            }
            // If no coverage files found and package has test script
            if (pkg.scripts.test) {
                // Return a reasonable default based on whether tests are likely to have coverage
                const hasCoverageSetup = pkg.scripts.test.includes('--coverage') ||
                    pkg.scripts.test.includes('coverage') ||
                    pkg.devDependencies?.jest ||
                    pkg.devDependencies?.nyc ||
                    pkg.devDependencies?.['@types/jest'];
                return hasCoverageSetup ? 30 : 0; // Reasonable defaults
            }
            return 0;
        }
        catch (error) {
            console.warn(`Error checking coverage for ${pkg.name}:`, error);
            return 0;
        }
    }
    /**
     * Checks lint status for a package
     */
    async checkLintStatus(pkg) {
        try {
            if (pkg.scripts.lint) {
                // Try to run lint command
                (0, child_process_1.execSync)('npm run lint', {
                    cwd: pkg.path,
                    stdio: 'pipe',
                    timeout: 10000,
                });
                return 'pass';
            }
            return 'unknown';
        }
        catch (error) {
            return 'fail';
        }
    }
    /**
     * Checks security audit for a package
     */
    async checkSecurityAudit(pkg) {
        try {
            // Run npm audit
            const result = (0, child_process_1.execSync)('npm audit --json', {
                cwd: pkg.path,
                stdio: 'pipe',
                timeout: 15000,
            });
            const audit = JSON.parse(result.toString());
            return audit.metadata.vulnerabilities.total === 0 ? 'pass' : 'fail';
        }
        catch (error) {
            return 'unknown';
        }
    }
    /**
     * Finds packages with outdated dependencies
     */
    findOutdatedPackages(packages) {
        const outdated = [];
        for (const pkg of packages) {
            const outdatedDeps = (0, utilities_1.checkOutdatedDependencies)(pkg);
            if (outdatedDeps.length > 0) {
                outdated.push(pkg.name);
            }
        }
        return outdated;
    }
    /**
     * Gets the last modified date of a package
     */
    getLastModified(packagePath) {
        try {
            const stats = fs_1.default.statSync(packagePath);
            return stats.mtime;
        }
        catch (error) {
            return new Date();
        }
    }
    /**
     * Gets git information for a package
     */
    async getGitInfo(packagePath) {
        try {
            // Check if this is a git repository
            const gitPath = path_1.default.join(packagePath, '.git');
            if (!fs_1.default.existsSync(gitPath)) {
                return undefined;
            }
            // Get last commit info
            const lastCommit = (0, child_process_1.execSync)('git rev-parse HEAD', {
                cwd: packagePath,
                stdio: 'pipe',
            })
                .toString()
                .trim();
            const lastCommitDate = new Date((0, child_process_1.execSync)('git log -1 --format=%cd', {
                cwd: packagePath,
                stdio: 'pipe',
            })
                .toString()
                .trim());
            const author = (0, child_process_1.execSync)('git log -1 --format=%an', {
                cwd: packagePath,
                stdio: 'pipe',
            })
                .toString()
                .trim();
            const branch = (0, child_process_1.execSync)('git branch --show-current', {
                cwd: packagePath,
                stdio: 'pipe',
            })
                .toString()
                .trim();
            return {
                lastCommit: lastCommit.substring(0, 7),
                lastCommitDate,
                author,
                branch,
            };
        }
        catch (error) {
            return undefined;
        }
    }
    /**
     * Scans for specific file types in packages
     */
    scanForFileTypes(fileTypes) {
        const results = {};
        for (const fileType of fileTypes) {
            results[fileType] = [];
        }
        const packages = (0, utilities_1.scanMonorepo)(this.rootDir);
        for (const pkg of packages) {
            this.scanPackageForFiles(pkg.path, fileTypes, results);
        }
        return results;
    }
    /**
     * Recursively scans a package directory for specific file types
     */
    scanPackageForFiles(packagePath, fileTypes, results) {
        try {
            const items = fs_1.default.readdirSync(packagePath, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path_1.default.join(packagePath, item.name);
                if (item.isDirectory()) {
                    // Skip certain directories
                    if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
                        this.scanPackageForFiles(fullPath, fileTypes, results);
                    }
                }
                else {
                    // Check file extension
                    const ext = path_1.default.extname(item.name);
                    if (fileTypes.includes(ext)) {
                        results[ext].push(fullPath);
                    }
                }
            }
        }
        catch (error) {
            // Skip directories we can't read
        }
    }
    /**
     * Gets cache value if not expired
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }
    /**
     * Sets cache value with timestamp
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
    /**
     * Clears the cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Exports scan results to various formats
     */
    exportResults(results, format) {
        switch (format) {
            case 'json':
                return JSON.stringify(results, null, 2);
            case 'csv':
                return this.exportToCSV(results);
            case 'html':
                return this.exportToHTML(results);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    /**
     * Exports results to CSV format
     */
    exportToCSV(results) {
        const headers = [
            'Package',
            'Type',
            'Version',
            'Dependencies',
            'Health Score',
        ];
        const rows = results.packages.map(pkg => [
            pkg.name,
            pkg.type,
            pkg.version,
            Object.keys(pkg.dependencies).length,
            'N/A', // Would need health calculation
        ]);
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }
    /**
     * Exports results to HTML format
     */
    exportToHTML(results) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monorepo Scan Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Monorepo Scan Report</h1>
          <p>Generated: ${results.scanTimestamp}</p>
          <p>Duration: ${results.scanDuration}ms</p>

          <h2>Summary</h2>
          <ul>
            <li>Total Packages: ${results.stats.totalPackages}</li>
            <li>Applications: ${results.stats.apps}</li>
            <li>Libraries: ${results.stats.libraries}</li>
            <li>Tools: ${results.stats.tools}</li>
          </ul>

          <h2>Packages</h2>
          <table>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Version</th>
              <th>Dependencies</th>
            </tr>
            ${results.packages
            .map(pkg => `
              <tr>
                <td>${pkg.name}</td>
                <td>${pkg.type}</td>
                <td>${pkg.version}</td>
                <td>${Object.keys(pkg.dependencies).length}</td>
              </tr>
            `)
            .join('')}
          </table>
        </body>
      </html>
    `;
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
// Fix these function signatures - they should accept single PackageInfo objects
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
