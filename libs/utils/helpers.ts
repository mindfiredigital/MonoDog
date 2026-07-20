// import { Package } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';

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
  // name: string;
  // currentVersion: string;
  // latestVersion?: string;
  // status: 'up-to-date' | 'outdated' | 'major-update' | 'unknown';
  // type: 'production' | 'development';
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  latest?: string;
  status?: 'up-to-date' | 'outdated' | 'major-update' | 'unknown';
  outdated?: boolean;
}

export interface PackageHealth {
  buildStatus: 'success' | 'failed' | 'running' | 'unknown';
  testCoverage: number;
  lintStatus: 'pass' | 'fail' | 'unknown';
  securityAudit: 'pass' | 'fail' | 'unknown';
  overallScore: number;
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Scans the monorepo and returns information about all packages
 */
async function scanMonorepo(rootDir: string): Promise<PackageInfo[]> {
  const packages: PackageInfo[] = [];

  const scanDir = async (dirName: string, type?: 'app' | 'lib' | 'tool') => {
    const fullDir = path.join(rootDir, dirName);
    if (!(await fileExists(fullDir))) return;

    const dirents = await fs.promises.readdir(fullDir, { withFileTypes: true });
    const packageDirs = dirents.filter(d => d.isDirectory()).map(d => d.name);

    const parsedPackages = await Promise.all(
      packageDirs.map(async packageName => {
        const packagePath = path.join(fullDir, packageName);
        return await parsePackageInfo(packagePath, packageName, type);
      })
    );

    for (const pkg of parsedPackages) {
      if (pkg) packages.push(pkg);
    }
  };

  await Promise.all([
    scanDir('packages'),
    scanDir('apps', 'app'),
    scanDir('libs', 'lib'),
  ]);

  return packages;
}

/*** Parses package.json and determines package type */
async function parsePackageInfo(
  packagePath: string,
  packageName: string,
  forcedType?: 'app' | 'lib' | 'tool'
): Promise<PackageInfo | null> {
  const packageJsonPath = path.join(packagePath, 'package.json');

  if (!(await fileExists(packageJsonPath))) {
    return null;
  }

  try {
    const packageJsonData = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonData);

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
 * Calculates package health score based on various metrics
 */
function calculatePackageHealth(
  buildStatus: PackageHealth['buildStatus'],
  testCoverage: number,
  lintStatus: PackageHealth['lintStatus'],
  securityAudit: PackageHealth['securityAudit']
): PackageHealth {
  let score = 0;

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
    buildStatus,
    testCoverage,
    lintStatus,
    securityAudit,
    overallScore: Math.round(score),
  };
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
    id: pkg.name,
    label: pkg.name,
    type: pkg.type,
    version: pkg.version,
    dependencies: Object.keys(pkg.dependencies).length,
  }));

  const edges: Array<{ source: string; target: string; type: string }> = [];

  packages.forEach(pkg => {
    Object.keys(pkg.dependencies).forEach(depName => {
      // Only include internal dependencies
      if (packages.some(p => p.name === depName)) {
        edges.push({
          source: pkg.name,
          target: depName,
          type: 'internal',
        });
      }
    });
  });

  return { nodes, edges };
}

const npmCache = new Map<string, string>();

/**
 * Checks if a package has outdated dependencies by querying the NPM registry.
 * Uses an in-memory cache to avoid rate-limiting.
 */
async function checkOutdatedDependencies(
  packageInfo: PackageInfo
): Promise<DependencyInfo[]> {
  const outdated: DependencyInfo[] = [];

  const checkDep = async (
    name: string,
    version: string,
    type: 'dependency' | 'devDependency' | 'peerDependency'
  ) => {
    // Strip standard semver prefixes
    const currentVersion = version.replace(/^[\^~]/, '');
    let latestVersion = npmCache.get(name);

    if (!latestVersion) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        const response = await fetch(
          `https://registry.npmjs.org/${name}/latest`,
          {
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          latestVersion = data.version;
          if (latestVersion) npmCache.set(name, latestVersion);
        }
      } catch (error) {
        // Timeout or network error, fallback to unknown
      }
    }

    if (latestVersion && latestVersion !== currentVersion) {
      outdated.push({
        name,
        version: currentVersion,
        latest: latestVersion,
        status: 'outdated',
        type,
        outdated: true,
      });
    } else {
      outdated.push({
        name,
        version: currentVersion,
        latest: latestVersion || currentVersion,
        status: latestVersion ? 'up-to-date' : 'unknown',
        type,
        outdated: false,
      });
    }
  };

  const promises: Promise<void>[] = [];
  const depGroups = [
    { data: packageInfo.dependencies, type: 'dependency' },
    { data: packageInfo.devDependencies, type: 'devDependency' },
    { data: packageInfo.peerDependencies, type: 'peerDependency' },
  ] as const;

  depGroups.forEach(group => {
    Object.entries(group.data || {}).forEach(([name, version]) =>
      promises.push(checkDep(name, version, group.type))
    );
  });

  await Promise.all(promises);

  return outdated;
}

/**
 * Gets package size information
 */
async function getPackageSize(packagePath: string): Promise<{
  size: number;
  files: number;
}> {
  try {
    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = async (dirPath: string): Promise<void> => {
      const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

      const promises = items.map(async item => {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          // Skip node_modules and other build artifacts
          if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
            await calculateSize(fullPath);
          }
        } else {
          try {
            const stats = await fs.promises.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
          } catch (error) {
            // Skip files we can't read
          }
        }
      });
      await Promise.all(promises);
    };

    await calculateSize(packagePath);

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
  calculatePackageHealth,
};
