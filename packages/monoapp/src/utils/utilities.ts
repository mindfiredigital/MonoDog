// import { Package } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';
import { appConfig } from '../config-loader';
import {calculatePackageHealth} from './health-utils';

export {PackageHealth} from './health-utils';

export interface PackageInfo {
  name: string;
  version: string;
  type: string; //'app' | 'lib' | 'tool';
  path: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  scripts: Record<string, string>;
  maintainers: string[];
  description?: string;
  license?: string;
  repository?: Record<string, string>;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  latest?: string;
  status?: 'up-to-date' | 'outdated' | 'major-update' | 'unknown';
  outdated?: boolean;
}

export interface MonorepoStats {
  totalPackages: number;
  apps: number;
  libraries: number;
  tools: number;
  healthyPackages: number;
  warningPackages: number;
  errorPackages: number;
  outdatedDependencies: number;
  totalDependencies: number;
}

/**
 * Resolves simple workspace globs (like 'packages/*', 'apps/*') into actual package directory paths.
 * Note: This implementation only handles the 'folder/*' pattern and is not a full glob resolver.
 */
export function resolveWorkspaceGlobs(rootDir: string, globs: string[]): string[] {
    const resolvedPaths: string[] = [];

    for (const glob of globs) {
        if (glob.endsWith('/*')) {
            const baseDirName = glob.slice(0, -2); // e.g., 'packages'
            const baseDirPath = path.join(rootDir, baseDirName);

            if (fs.existsSync(baseDirPath) && fs.statSync(baseDirPath).isDirectory()) {
                const subDirs = fs.readdirSync(baseDirPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => path.join(baseDirName, dirent.name)); // e.g., 'packages/my-utils'

                resolvedPaths.push(...subDirs);
            }
        } else {
            // Handle non-glob paths (e.g., 'packages/my-package') if it's explicitly listed
            const directPath = path.join(rootDir, glob);
            if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
                 resolvedPaths.push(glob);
            }
        }
    }
    return resolvedPaths;
}

/**
 * Reads the root package.json and extracts the 'workspaces' field (array of globs).
 */
export function getWorkspacesFromRoot(rootDir: string): string[] | undefined {
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.warn(`\n⚠️ Warning: No package.json found at root directory: ${rootDir}`);
        return undefined;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Handle both standard array and object format (used by yarn/pnpm)
        if (Array.isArray(packageJson.workspaces)) {
            return packageJson.workspaces;
        } else if (packageJson.workspaces && Array.isArray(packageJson.workspaces.packages)) {
            return packageJson.workspaces.packages;
        }
    } catch (e) {
        console.error(`\n❌ Error parsing package.json at ${packageJsonPath}. Skipping workspace detection.`);
    }
    return undefined;
}

/**
 * Scans the monorepo and returns information about all packages
 */
function scanMonorepo(rootDir: string): PackageInfo[] {
  const packages: PackageInfo[] = [];
  console.log('rootDir:', rootDir);
  const workspacesGlobs = appConfig.workspaces;
  // Use provided workspaces globs if given, otherwise attempt to detect from root package.json
  const detectedWorkspacesGlobs = workspacesGlobs.length > 0 ? workspacesGlobs : getWorkspacesFromRoot(rootDir);
  if (detectedWorkspacesGlobs && detectedWorkspacesGlobs.length > 0) {
    if (workspacesGlobs.length) {
      console.log(`\n✅ Using provided workspaces globs: ${detectedWorkspacesGlobs.join(', ')}`);
    } else {
      console.log(`\n✅ Detected Monorepo Workspaces Globs: ${detectedWorkspacesGlobs.join(', ')}`);
    }

    // 1. Resolve the globs into concrete package directory paths
    const resolvedPackagePaths = resolveWorkspaceGlobs(rootDir, detectedWorkspacesGlobs);

    console.log(`[DEBUG] Resolved package directories (Total ${resolvedPackagePaths.length}):`);
    console.warn(resolvedPackagePaths.length < workspacesGlobs.length ? 'Some workspaces globs provided are invalid.' : '');

    // 2. Integration of the requested loop structure for package scanning
    for (const workspacePath of resolvedPackagePaths) {
      const fullPackagePath = path.join(rootDir, workspacePath);
      // The package name would be read from the package.json inside this path
      const packageName = path.basename(fullPackagePath);

      console.log(`- Scanning path: ${workspacePath} (Package: ${packageName})`);

      const packageInfo = parsePackageInfo(fullPackagePath, packageName);
      if (packageInfo) {
        packages.push(packageInfo);
      }
    }
  } else {
    console.warn('\n⚠️ No workspace globs provided or detected. Returning empty package list.');
  }

  return packages;
}

/*** Parses package.json and determines package type */
export function parsePackageInfo(
  packagePath: string,
  packageName: string,
  forcedType?: 'app' | 'lib' | 'tool'
): PackageInfo | null {
  const packageJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Determine package type
    let packageType: 'app' | 'lib' | 'tool' = 'lib';
    if (forcedType) {
      packageType = forcedType;
    } else if (packageJson.scripts && packageJson.scripts.start) {
      packageType = 'app';
    } else if (packageJson.keywords && packageJson.keywords.includes('tool')) {
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
  } catch (error) {
    console.error(`Error parsing package.json for ${packageName}:`, error);
    return null;
  }
}

/**
 * Generates comprehensive monorepo statistics
 */
function generateMonorepoStats(packages: PackageInfo[]): MonorepoStats {
  const stats: MonorepoStats = {
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
function findCircularDependencies(packages: PackageInfo[]): string[][] {
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularDeps: string[][] = [];

  // Build dependency graph
  packages.forEach(pkg => {
    graph.set(pkg.name, Object.keys(pkg.dependencies));
  });

  function dfs(node: string, path: string[]): void {
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
function generateDependencyGraph(packages: PackageInfo[]) {
  const nodes = packages.map(pkg => ({
    // id: pkg.name,
    label: pkg.name,
    type: pkg.type,
    version: pkg.version,
    dependencies: Object.keys(pkg.dependencies).length,
  }));

  const edges: Array<{ from: string; to: string; type: string }> = [];

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
function checkOutdatedDependencies(packageInfo: PackageInfo): DependencyInfo[] {
  const outdated: DependencyInfo[] = [];

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
function getPackageSize(packagePath: string): {
  size: number;
  files: number;
} {
  try {
    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = (dirPath: string): void => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          // Skip node_modules and other build artifacts
          if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
            calculateSize(fullPath);
          }
        } else {
          try {
            const stats = fs.statSync(fullPath);
            totalSize += stats.size;
            fileCount++;
          } catch (error) {
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
  } catch (error) {
    return { size: 0, files: 0 };
  }
}

export {
  scanMonorepo,
  generateMonorepoStats,
  findCircularDependencies,
  generateDependencyGraph,
  checkOutdatedDependencies,
  getPackageSize,
  calculatePackageHealth
};
