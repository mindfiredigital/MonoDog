import type { PackageInfo, DependencyInfo, Commit } from '../types';
import { AppLogger } from '../middleware/logger';
import { CommitRepository, DependencyRepository, PackageRepository } from '../repositories';
import { appConfig } from '../config-loader';

// Default settings
const DEFAULT_PORT = 8999;
const port = appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = appConfig.server.host ?? 'localhost'; //Default host

const API_BASE = `http://${host}:${port}/api`;

async function getCommits(path: string): Promise<Commit[]> {
  const res = await fetch(API_BASE + `/commits/` + encodeURIComponent(path));
  if (!res.ok) throw new Error('Failed to fetch commits');
  return (await res.json()) as Commit[];
}

/**
 * Get package dependencies
 */
function getPackageDependenciesInfo(pkg: PackageInfo): DependencyInfo[] {
  const allDeps: DependencyInfo[] = [];
  Object.keys(pkg.dependencies || {}).forEach(depName => {
    allDeps.push({
      name: depName,
      version: pkg.dependencies[depName],
      type: 'dependency',
      latest: '',
      outdated: false,
    });
  });
  Object.keys(pkg.devDependencies || {}).forEach(depName => {
    allDeps.push({
      name: depName,
      version: pkg.devDependencies[depName],
      type: 'devDependency',
      latest: '',
      outdated: false,
    });
  });
  Object.keys(pkg.peerDependencies || {}).forEach(depName => {
    allDeps.push({
      name: depName,
      version: pkg.peerDependencies[depName]!,
      type: 'peerDependency',
      latest: '',
      outdated: false,
    });
  });
  return allDeps;
}

/**
 * Store packages in database using repository pattern
 */
async function storePackage(pkg: PackageInfo): Promise<void> {
  try {
    // Create or update package using repository
    await PackageRepository.upsert({
      name: pkg.name,
      version: pkg.version,
      type: pkg.type,
      path: pkg.path,
      description: pkg.description,
      license: pkg.license,
      repository: pkg.repository,
      scripts: pkg.scripts,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      peerDependencies: pkg.peerDependencies,
      maintainers: pkg.maintainers.join(','),
      status: '',
    });

    // Store commits using repository
    const commits = await getCommits(pkg.path ?? '');
    if (commits.length) {
      await CommitRepository.storeMany(pkg.name, commits);
    }

    // Store dependencies using repository
    const dependenciesInfo = getPackageDependenciesInfo(pkg);
    if (dependenciesInfo.length) {
      await DependencyRepository.storeMany(pkg.name, dependenciesInfo);
    }
  } catch (error) {
    AppLogger.warn(`Failed to store report for ${pkg.name}`);
  }
}

export { storePackage };
