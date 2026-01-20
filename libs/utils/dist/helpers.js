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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanMonorepo = scanMonorepo;
exports.generateMonorepoStats = generateMonorepoStats;
exports.findCircularDependencies = findCircularDependencies;
exports.generateDependencyGraph = generateDependencyGraph;
exports.checkOutdatedDependencies = checkOutdatedDependencies;
exports.getPackageSize = getPackageSize;
exports.calculatePackageHealth = calculatePackageHealth;
// import { Package } from '@prisma/client';
var fs = __importStar(require("fs"));
var path_1 = __importDefault(require("path"));
/**
 * Scans the monorepo and returns information about all packages
 */
function scanMonorepo(rootDir) {
    var e_1, _a, e_2, _b, e_3, _c;
    var packages = [];
    console.log('rootDir', rootDir);
    // Scan packages directory
    var packagesDir = path_1.default.join(rootDir, 'packages');
    if (fs.existsSync(packagesDir)) {
        var packageDirs = fs
            .readdirSync(packagesDir, { withFileTypes: true })
            .filter(function (dirent) { return dirent.isDirectory(); })
            .map(function (dirent) { return dirent.name; });
        try {
            for (var packageDirs_1 = __values(packageDirs), packageDirs_1_1 = packageDirs_1.next(); !packageDirs_1_1.done; packageDirs_1_1 = packageDirs_1.next()) {
                var packageName = packageDirs_1_1.value;
                var packagePath = path_1.default.join(packagesDir, packageName);
                var packageInfo = parsePackageInfo(packagePath, packageName);
                if (packageInfo) {
                    packages.push(packageInfo);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (packageDirs_1_1 && !packageDirs_1_1.done && (_a = packageDirs_1.return)) _a.call(packageDirs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    // Scan apps directory
    var appsDir = path_1.default.join(rootDir, 'apps');
    if (fs.existsSync(appsDir)) {
        var appDirs = fs
            .readdirSync(appsDir, { withFileTypes: true })
            .filter(function (dirent) { return dirent.isDirectory(); })
            .map(function (dirent) { return dirent.name; });
        try {
            for (var appDirs_1 = __values(appDirs), appDirs_1_1 = appDirs_1.next(); !appDirs_1_1.done; appDirs_1_1 = appDirs_1.next()) {
                var appName = appDirs_1_1.value;
                var appPath = path_1.default.join(appsDir, appName);
                var appInfo = parsePackageInfo(appPath, appName, 'app');
                if (appInfo) {
                    packages.push(appInfo);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (appDirs_1_1 && !appDirs_1_1.done && (_b = appDirs_1.return)) _b.call(appDirs_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    // Scan libs directory
    var libsDir = path_1.default.join(rootDir, 'libs');
    if (fs.existsSync(libsDir)) {
        var libDirs = fs
            .readdirSync(libsDir, { withFileTypes: true })
            .filter(function (dirent) { return dirent.isDirectory(); })
            .map(function (dirent) { return dirent.name; });
        try {
            for (var libDirs_1 = __values(libDirs), libDirs_1_1 = libDirs_1.next(); !libDirs_1_1.done; libDirs_1_1 = libDirs_1.next()) {
                var libName = libDirs_1_1.value;
                var libPath = path_1.default.join(libsDir, libName);
                var libInfo = parsePackageInfo(libPath, libName, 'lib');
                if (libInfo) {
                    packages.push(libInfo);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (libDirs_1_1 && !libDirs_1_1.done && (_c = libDirs_1.return)) _c.call(libDirs_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    return packages;
}
/*** Parses package.json and determines package type */
function parsePackageInfo(packagePath, packageName, forcedType) {
    var packageJsonPath = path_1.default.join(packagePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }
    try {
        var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        // Determine package type
        var packageType = 'lib';
        if (forcedType) {
            packageType = forcedType;
        }
        else if (packageJson.scripts && packageJson.scripts.start) {
            packageType = 'app';
        }
        else if (packageJson.keywords && packageJson.keywords.includes('tool')) {
            packageType = 'tool';
        }
        return {
            name: packageJson.name || packageName,
            version: packageJson.version || '0.0.0',
            type: packageType,
            path: packagePath,
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            peerDependencies: packageJson.peerDependencies || {},
            scripts: packageJson.scripts || {},
            maintainers: packageJson.maintainers || [],
            description: packageJson.description,
            license: packageJson.license,
            repository: packageJson.repository || {},
        };
    }
    catch (error) {
        console.error("Error parsing package.json for ".concat(packageName, ":"), error);
        return null;
    }
}
/**
 * Analyzes dependencies and determines their status
 */
// function analyzeDependencies(
//   dependencies: Record<string, string>,
//   type: 'production' | 'development' = 'production'
// ): DependencyInfo[] {
//   return Object.entries(dependencies).map(([name, version]) => ({
//     name,
//     currentVersion: version,
//     status: 'unknown', // Would be determined by npm registry check
//     type,
//   }));
// }
/**
 * Calculates package health score based on various metrics
 */
function calculatePackageHealth(buildStatus, testCoverage, lintStatus, securityAudit) {
    var score = 0;
    // Build status (30 points)
    switch (buildStatus) {
        case 'success':
            score += 30;
            break;
        case 'running':
            score += 15;
            break;
        case 'failed':
            score += 0;
            break;
        default:
            score += 10;
    }
    // Test coverage (25 points)
    score += Math.min(25, (testCoverage / 100) * 25);
    // Lint status (25 points)
    switch (lintStatus) {
        case 'pass':
            score += 25;
            break;
        case 'fail':
            score += 0;
            break;
        default:
            score += 10;
    }
    // Security audit (20 points)
    switch (securityAudit) {
        case 'pass':
            score += 20;
            break;
        case 'fail':
            score += 0;
            break;
        default:
            score += 10;
    }
    return {
        buildStatus: buildStatus,
        testCoverage: testCoverage,
        lintStatus: lintStatus,
        securityAudit: securityAudit,
        overallScore: Math.round(score),
    };
}
/**
 * Generates comprehensive monorepo statistics
 */
function generateMonorepoStats(packages) {
    var stats = {
        totalPackages: packages.length,
        apps: packages.filter(function (p) { return p.type === 'app'; }).length,
        libraries: packages.filter(function (p) { return p.type === 'lib'; }).length,
        tools: packages.filter(function (p) { return p.type === 'tool'; }).length,
        healthyPackages: 0,
        warningPackages: 0,
        errorPackages: 0,
        outdatedDependencies: 0,
        totalDependencies: 0,
    };
    // Calculate dependency counts
    packages.forEach(function (pkg) {
        var _a;
        stats.totalDependencies += Object.keys(pkg.dependencies).length;
        stats.totalDependencies += Object.keys(pkg.devDependencies).length;
        stats.totalDependencies += Object.keys((_a = pkg.peerDependencies) !== null && _a !== void 0 ? _a : {}).length;
    });
    return stats;
}
/**
 * Finds circular dependencies in the monorepo
 */
function findCircularDependencies(packages) {
    var e_4, _a;
    var graph = new Map();
    var visited = new Set();
    var recursionStack = new Set();
    var circularDeps = [];
    // Build dependency graph
    packages.forEach(function (pkg) {
        graph.set(pkg.name, Object.keys(pkg.dependencies));
    });
    function dfs(node, path) {
        var e_5, _a;
        if (recursionStack.has(node)) {
            var cycleStart = path.indexOf(node);
            circularDeps.push(path.slice(cycleStart));
            return;
        }
        if (visited.has(node)) {
            return;
        }
        visited.add(node);
        recursionStack.add(node);
        path.push(node);
        var dependencies = graph.get(node) || [];
        try {
            for (var dependencies_1 = __values(dependencies), dependencies_1_1 = dependencies_1.next(); !dependencies_1_1.done; dependencies_1_1 = dependencies_1.next()) {
                var dep = dependencies_1_1.value;
                if (graph.has(dep)) {
                    dfs(dep, __spreadArray([], __read(path), false));
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (dependencies_1_1 && !dependencies_1_1.done && (_a = dependencies_1.return)) _a.call(dependencies_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        recursionStack.delete(node);
    }
    try {
        for (var _b = __values(graph.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var node = _c.value;
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return circularDeps;
}
/**
 * Generates a dependency graph for visualization
 */
function generateDependencyGraph(packages) {
    var nodes = packages.map(function (pkg) { return ({
        // id: pkg.name,
        label: pkg.name,
        type: pkg.type,
        version: pkg.version,
        dependencies: Object.keys(pkg.dependencies).length,
    }); });
    var edges = [];
    packages.forEach(function (pkg) {
        Object.keys(pkg.dependencies).forEach(function (depName) {
            // Only include internal dependencies
            if (packages.some(function (p) { return p.name === depName; })) {
                edges.push({
                    from: pkg.name,
                    to: depName,
                    type: 'internal',
                });
            }
        });
    });
    return { nodes: nodes, edges: edges };
}
/**
 * Checks if a package has outdated dependencies
 */
function checkOutdatedDependencies(packageInfo) {
    var outdated = [];
    // This would typically involve checking against npm registry
    // For now, we'll simulate with some basic checks
    Object.entries(packageInfo.dependencies).forEach(function (_a) {
        var _b = __read(_a, 2), name = _b[0], version = _b[1];
        if (version.startsWith('^') || version.startsWith('~')) {
            // Could be outdated, would need registry check
            outdated.push({
                name: name,
                version: version,
                status: 'unknown',
                type: 'dependency',
            });
        }
    });
    return outdated;
}
/**
 * Formats version numbers for comparison
 */
// function parseVersion(version: string): number[] {
//   return version
//     .replace(/^[^0-9]*/, '')
//     .split('.')
//     .map(Number);
// }
/**
 * Compares two version strings
 */
// function compareVersions(v1: string, v2: string): number {
//   const parsed1 = parseVersion(v1);
//   const parsed2 = parseVersion(v2);
//   for (let i = 0; i < Math.max(parsed1.length, parsed2.length); i++) {
//     const num1 = parsed1[i] || 0;
//     const num2 = parsed2[i] || 0;
//     if (num1 > num2) return 1;
//     if (num1 < num2) return -1;
//   }
//   return 0;
// }
/**
 * Gets package size information
 */
function getPackageSize(packagePath) {
    try {
        var totalSize_1 = 0;
        var fileCount_1 = 0;
        var calculateSize_1 = function (dirPath) {
            var e_6, _a;
            var items = fs.readdirSync(dirPath, { withFileTypes: true });
            try {
                for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                    var item = items_1_1.value;
                    var fullPath = path_1.default.join(dirPath, item.name);
                    if (item.isDirectory()) {
                        // Skip node_modules and other build artifacts
                        if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
                            calculateSize_1(fullPath);
                        }
                    }
                    else {
                        try {
                            var stats = fs.statSync(fullPath);
                            totalSize_1 += stats.size;
                            fileCount_1++;
                        }
                        catch (error) {
                            // Skip files we can't read
                        }
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        calculateSize_1(packagePath);
        return {
            size: totalSize_1,
            files: fileCount_1,
        };
    }
    catch (error) {
        return { size: 0, files: 0 };
    }
}
//# sourceMappingURL=helpers.js.map