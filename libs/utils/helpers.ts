import fs from 'fs';
import path from 'path';

export interface PackageInfo {
  name: string;
  version: string;
  type: 'app' | 'lib' | 'tool';
  path: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  maintainers?: string[];
  description?: string;
  license?: string;
  repository?: string;
}

export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion?: string;
  status: 'up-to-date' | 'outdated' | 'major-update' | 'unknown';
  type: 'production' | 'development';
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

/**
 * Scans the monorepo and returns information about all packages
 */
export function scanMonorepo(rootDir: string): PackageInfo[] {
  const packages: PackageInfo[] = [];
  
  // Scan packages directory
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const packageName of packageDirs) {
      const packagePath = path.join(packagesDir, packageName);
      const packageInfo = parsePackageInfo(packagePath, packageName);
      if (packageInfo) {
        packages.push(packageInfo);
      }
    }
  }
  
  // Scan apps directory
  const appsDir = path.join(rootDir, 'apps');
  if (fs.existsSync(appsDir)) {
    const appDirs = fs.readdirSync(appsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const appName of appDirs) {
      const appPath = path.join(appsDir, appName);
      const appInfo = parsePackageInfo(appPath, appName, 'app');
      if (appInfo) {
        packages.push(appInfo);
      }
    }
  }
  
  // Scan libs directory
  const libsDir = path.join(rootDir, 'libs');
  if (fs.existsSync(libsDir)) {
    const libDirs = fs.readdirSync(libsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const libName of libDirs) {
      const libPath = path.join(libsDir, libName);
      const libInfo = parsePackageInfo(libPath, libName, 'lib');
      if (libInfo) {
        packages.push(libInfo);
      }
    }
  }
  
  return packages;
}

/**
 * Parses package.json and determines package type
 */
function parsePackageInfo(packagePath: string, packageName: string, forcedType?: 'app' | 'lib' | 'tool'): PackageInfo | null {
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
      scripts: packageJson.scripts || {},
      maintainers: packageJson.maintainers || [],
      description: packageJson.description,
      license: packageJson.license,
      repository: packageJson.repository?.url || packageJson.repository,
    };
  } catch (error) {
    console.error(`Error parsing package.json for ${packageName}:`, error);
    return null;
  }
}

/**
 * Analyzes dependencies and determines their status
 */
export function analyzeDependencies(
  dependencies: Record<string, string>,
  type: 'production' | 'development' = 'production'
): DependencyInfo[] {
  return Object.entries(dependencies).map(([name, version]) => ({
    name,
    currentVersion: version,
    status: 'unknown', // Would be determined by npm registry check
    type,
  }));
}

/**
 * Calculates package health score based on various metrics
 */
export function calculatePackageHealth(
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
export function generateMonorepoStats(packages: PackageInfo[]): MonorepoStats {
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
  });
  
  return stats;
}

/**
 * Finds circular dependencies in the monorepo
 */
export function findCircularDependencies(packages: PackageInfo[]): string[][] {
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
export function generateDependencyGraph(packages: PackageInfo[]) {
  const nodes = packages.map(pkg => ({
    id: pkg.name,
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
export function checkOutdatedDependencies(packageInfo: PackageInfo): DependencyInfo[] {
  const outdated: DependencyInfo[] = [];
  
  // This would typically involve checking against npm registry
  // For now, we'll simulate with some basic checks
  Object.entries(packageInfo.dependencies).forEach(([name, version]) => {
    if (version.startsWith('^') || version.startsWith('~')) {
      // Could be outdated, would need registry check
      outdated.push({
        name,
        currentVersion: version,
        status: 'unknown',
        type: 'production',
      });
    }
  });
  
  return outdated;
}

/**
 * Formats version numbers for comparison
 */
export function parseVersion(version: string): number[] {
  return version.replace(/^[^0-9]*/, '').split('.').map(Number);
}

/**
 * Compares two version strings
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);
  
  for (let i = 0; i < Math.max(parsed1.length, parsed2.length); i++) {
    const num1 = parsed1[i] || 0;
    const num2 = parsed2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}

/**
 * Gets package size information
 */
export function getPackageSize(packagePath: string): { size: number; files: number } {
  try {
    let totalSize = 0;
    let fileCount = 0;
    
    function calculateSize(dirPath: string): void {
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
    }
    
    calculateSize(packagePath);
    
    return {
      size: totalSize,
      files: fileCount,
    };
  } catch (error) {
    return { size: 0, files: 0 };
  }
}