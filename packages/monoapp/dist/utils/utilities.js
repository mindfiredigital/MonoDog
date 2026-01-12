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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePackageHealth = void 0;
exports.resolveWorkspaceGlobs = resolveWorkspaceGlobs;
exports.getWorkspacesFromRoot = getWorkspacesFromRoot;
exports.parsePackageInfo = parsePackageInfo;
exports.scanMonorepo = scanMonorepo;
exports.generateMonorepoStats = generateMonorepoStats;
exports.findCircularDependencies = findCircularDependencies;
exports.generateDependencyGraph = generateDependencyGraph;
exports.checkOutdatedDependencies = checkOutdatedDependencies;
exports.getPackageSize = getPackageSize;
exports.findMonorepoRoot = findMonorepoRoot;
// import { Package } from '@prisma/client';
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const config_loader_1 = require("../config-loader");
const health_utils_1 = require("./health-utils");
Object.defineProperty(exports, "calculatePackageHealth", { enumerable: true, get: function () { return health_utils_1.calculatePackageHealth; } });
const yaml = __importStar(require("js-yaml"));
/**
 * Resolves simple workspace globs (like 'packages/*', 'apps/*') into actual package directory paths.
 * Note: This implementation only handles the 'folder/*' pattern and is not a full glob resolver.
 */
function resolveWorkspaceGlobs(rootDir, globs) {
    const resolvedPaths = [];
    for (const glob of globs) {
        if (glob.endsWith('/*')) {
            const baseDirName = glob.slice(0, -2); // e.g., 'packages'
            const baseDirPath = path_1.default.join(rootDir, baseDirName);
            if (fs.existsSync(baseDirPath) && fs.statSync(baseDirPath).isDirectory()) {
                const subDirs = fs.readdirSync(baseDirPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => path_1.default.join(baseDirName, dirent.name)); // e.g., 'packages/my-utils'
                resolvedPaths.push(...subDirs);
            }
        }
        else {
            // Handle non-glob paths (e.g., 'packages/my-package') if it's explicitly listed
            const directPath = path_1.default.join(rootDir, glob);
            if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
                resolvedPaths.push(glob);
            }
        }
    }
    return resolvedPaths;
}
/**
 * Parses pnpm-workspace.yaml and extracts workspace globs
 */
function getWorkspacesFromPnpmYaml(rootDir) {
    const workspaceYamlPath = path_1.default.join(rootDir, 'pnpm-workspace.yaml');
    if (!fs.existsSync(workspaceYamlPath)) {
        return undefined;
    }
    try {
        const yamlContent = fs.readFileSync(workspaceYamlPath, 'utf-8');
        const yamlData = yaml.load(yamlContent);
        if (yamlData && yamlData.packages) {
            // Filter out exclusion patterns (lines starting with '!')
            const packages = Array.isArray(yamlData.packages)
                ? yamlData.packages.filter((pkg) => typeof pkg === 'string' && !pkg.startsWith('!'))
                : [];
            if (packages.length > 0) {
                return packages;
            }
        }
    }
    catch (e) {
        console.error(`\nError parsing pnpm-workspace.yaml at ${workspaceYamlPath}:`, e);
    }
    return undefined;
}
/**
 * Reads workspace configuration from package.json or pnpm-workspace.yaml
 * Priority: package.json (if exists) -> pnpm-workspace.yaml
 */
function getWorkspacesFromRoot(rootDir) {
    const packageJsonPath = path_1.default.join(rootDir, 'package.json');
    // Try package.json first
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            // Handle both standard array and object format (used by yarn/pnpm)
            if (Array.isArray(packageJson.workspaces)) {
                console.log('Workspace configuration found in package.json');
                return packageJson.workspaces;
            }
            else if (packageJson.workspaces && Array.isArray(packageJson.workspaces.packages)) {
                console.log('Workspace configuration found in package.json');
                return packageJson.workspaces.packages;
            }
        }
        catch (e) {
            console.error(`\nError parsing package.json at ${packageJsonPath}. Attempting to read pnpm-workspace.yaml...`);
        }
    }
    else {
        console.warn(`\nWarning: No package.json found at root directory: ${rootDir}`);
    }
    // Fallback to pnpm-workspace.yaml
    const pnpmWorkspaces = getWorkspacesFromPnpmYaml(rootDir);
    if (pnpmWorkspaces && pnpmWorkspaces.length > 0) {
        console.log('Workspace configuration found in pnpm-workspace.yaml');
        return pnpmWorkspaces;
    }
    console.warn('\nNo workspace configuration found in package.json or pnpm-workspace.yaml');
    return undefined;
}
/**
 * Scans the monorepo and returns information about all packages
 */
function scanMonorepo(rootDir) {
    const packages = [];
    console.log('rootDir:', rootDir);
    const workspacesGlobs = config_loader_1.appConfig.workspaces;
    // Use provided workspaces globs if given, otherwise attempt to detect from root package.json or pnpm-workspace.yaml
    const detectedWorkspacesGlobs = workspacesGlobs.length > 0 ? workspacesGlobs : getWorkspacesFromRoot(rootDir);
    if (detectedWorkspacesGlobs && detectedWorkspacesGlobs.length > 0) {
        if (workspacesGlobs.length) {
            console.log(`\nUsing provided workspaces globs: ${detectedWorkspacesGlobs.join(', ')}`);
        }
        else {
            console.log(`\nDetected Monorepo Workspaces Globs: ${detectedWorkspacesGlobs.join(', ')}`);
        }
        // 1. Resolve the globs into concrete package directory paths
        const resolvedPackagePaths = resolveWorkspaceGlobs(rootDir, detectedWorkspacesGlobs);
        console.log(`[DEBUG] Resolved package directories (Total ${resolvedPackagePaths.length}):`);
        console.warn(resolvedPackagePaths.length < workspacesGlobs.length ? 'Some workspaces globs provided are invalid.' : '');
        // 2. Integration of the requested loop structure for package scanning
        for (const workspacePath of resolvedPackagePaths) {
            const fullPackagePath = path_1.default.join(rootDir, workspacePath);
            // The package name would be read from the package.json inside this path
            const packageName = path_1.default.basename(fullPackagePath);
            console.log(`- Scanning path: ${workspacePath} (Package: ${packageName})`);
            const packageInfo = parsePackageInfo(fullPackagePath, packageName);
            if (packageInfo) {
                packages.push(packageInfo);
            }
        }
    }
    else {
        console.warn('\nNo workspace globs provided or detected. Returning empty package list.');
    }
    return packages;
}
/*** Parses package.json and determines package type */
function parsePackageInfo(packagePath, packageName, forcedType) {
    const packageJsonPath = path_1.default.join(packagePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        // Determine package type
        let packageType = 'lib';
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
        console.error(`Error parsing package.json for ${packageName}:`, error);
        return null;
    }
}
/**
 * Generates comprehensive monorepo statistics
 */
function generateMonorepoStats(packages) {
    const stats = {
        totalPackages: packages.length,
        apps: packages.filter(p => p.type === 'app').length,
        libraries: packages.filter(p => p.type === 'lib').length,
        tools: packages.filter(p => p.type === 'tool').length,
        healthyPackages: 0,
        warningPackages: 0,
        errorPackages: 0,
        outdatedDependencies: 0,
        totalDependencies: 0,
    };
    // Calculate dependency counts
    packages.forEach(pkg => {
        stats.totalDependencies += Object.keys(pkg.dependencies).length;
        stats.totalDependencies += Object.keys(pkg.devDependencies).length;
        stats.totalDependencies += Object.keys(pkg.peerDependencies ?? {}).length;
    });
    return stats;
}
/**
 * Finds circular dependencies in the monorepo
 */
function findCircularDependencies(packages) {
    const graph = new Map();
    const visited = new Set();
    const recursionStack = new Set();
    const circularDeps = [];
    // Build dependency graph
    packages.forEach(pkg => {
        graph.set(pkg.name, Object.keys(pkg.dependencies));
    });
    function dfs(node, path) {
        if (recursionStack.has(node)) {
            const cycleStart = path.indexOf(node);
            circularDeps.push(path.slice(cycleStart));
            return;
        }
        if (visited.has(node)) {
            return;
        }
        visited.add(node);
        recursionStack.add(node);
        path.push(node);
        const dependencies = graph.get(node) || [];
        for (const dep of dependencies) {
            if (graph.has(dep)) {
                dfs(dep, [...path]);
            }
        }
        recursionStack.delete(node);
    }
    for (const node of graph.keys()) {
        if (!visited.has(node)) {
            dfs(node, []);
        }
    }
    return circularDeps;
}
/**
 * Generates a dependency graph for visualization
 */
function generateDependencyGraph(packages) {
    const nodes = packages.map(pkg => ({
        // id: pkg.name,
        label: pkg.name,
        type: pkg.type,
        version: pkg.version,
        dependencies: Object.keys(pkg.dependencies).length,
    }));
    const edges = [];
    packages.forEach(pkg => {
        Object.keys(pkg.dependencies).forEach(depName => {
            // Only include internal dependencies
            if (packages.some(p => p.name === depName)) {
                edges.push({
                    from: pkg.name,
                    to: depName,
                    type: 'internal',
                });
            }
        });
    });
    return { nodes, edges };
}
/**
 * Checks if a package has outdated dependencies
 */
function checkOutdatedDependencies(packageInfo) {
    const outdated = [];
    // This would typically involve checking against npm registry
    // For now, we'll simulate with some basic checks
    Object.entries(packageInfo.dependencies).forEach(([name, version]) => {
        if (version.startsWith('^') || version.startsWith('~')) {
            // Could be outdated, would need registry check
            outdated.push({
                name,
                version: version,
                status: 'unknown',
                type: 'dependency',
            });
        }
    });
    return outdated;
}
/**
 * Gets package size information
 */
function getPackageSize(packagePath) {
    try {
        let totalSize = 0;
        let fileCount = 0;
        const calculateSize = (dirPath) => {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path_1.default.join(dirPath, item.name);
                if (item.isDirectory()) {
                    // Skip node_modules and other build artifacts
                    if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
                        calculateSize(fullPath);
                    }
                }
                else {
                    try {
                        const stats = fs.statSync(fullPath);
                        totalSize += stats.size;
                        fileCount++;
                    }
                    catch (error) {
                        // Skip files we can't read
                    }
                }
            }
        };
        calculateSize(packagePath);
        return {
            size: totalSize,
            files: fileCount,
        };
    }
    catch (error) {
        return { size: 0, files: 0 };
    }
}
/**
 * Find the monorepo root by looking for package.json with workspaces or pnpm-workspace.yaml
 */
function findMonorepoRoot() {
    let currentDir = __dirname;
    while (currentDir !== path_1.default.parse(currentDir).root) {
        const packageJsonPath = path_1.default.join(currentDir, 'package.json');
        const pnpmWorkspacePath = path_1.default.join(currentDir, 'pnpm-workspace.yaml');
        // Check if this directory has package.json with workspaces or pnpm-workspace.yaml
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                // If it has workspaces or is the root monorepo package
                if (packageJson.workspaces || fs.existsSync(pnpmWorkspacePath)) {
                    console.log('Found monorepo root:', currentDir);
                    return currentDir;
                }
            }
            catch (error) {
                // Continue searching if package.json is invalid
            }
        }
        // Check if we're at the git root
        const gitPath = path_1.default.join(currentDir, '.git');
        if (fs.existsSync(gitPath)) {
            console.log('Found git root (likely monorepo root):', currentDir);
            return currentDir;
        }
        // Go up one directory
        const parentDir = path_1.default.dirname(currentDir);
        if (parentDir === currentDir)
            break; // Prevent infinite loop
        currentDir = parentDir;
    }
    // Fallback to process.cwd() if we can't find the root
    console.log('Could not find monorepo root, using process.cwd():', process.cwd());
    return process.cwd();
}
